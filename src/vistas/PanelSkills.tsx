/**
 * Panel de skills (PLAN.md §5): una grilla agrupada por guía con el estado de
 * cada skill. Al hacer clic en un skill se abre una ventana que explica de qué
 * trata (descripción y fórmulas), con los ítems que lo evalúan y un enlace a
 * su teoría.
 *
 * Las guías se agrupan por etapa, según las evaluaciones de
 * content/config.yaml: primero las que entran en el parcial y después los
 * temas del final. Los skills de una guía todavía sin cargar se ven
 * bloqueados, para que la segunda etapa ya tenga su lugar en el panel.
 *
 * Es la vista que contesta "¿dónde estoy flojo?" de un vistazo, que es el
 * punto de medir el dominio sobre intentos recientes y no acumulados.
 */
import { useRef, useState } from 'preact/hooks'

import { alTerminarDeDesplazar, usarSeccionVisible } from '../componentes/desplazamiento'
import { IconoCandado, IconoComprobar } from '../componentes/Iconos'
import { irA } from '../componentes/MapaEjercicios'
import { Formula, Mate } from '../componentes/Mate'
import { Dialogo } from '../componentes/Modal'
import { SubirLateral, usarSubir } from '../componentes/SubirLateral'
import {
  claveItemExamen,
  config,
  destinoDeSkill,
  examenes,
  itemsPorSkill,
  skillBloqueado,
  skillPorId,
  skillsPorGuia,
  ubicacionDeItem,
} from '../datos/contenido'
import { etapas, grupoDe, rangoGuias, rotuloGrupo, type Etapa } from '../dominio/evaluaciones'
import type { ApiProgreso } from '../datos/usarProgreso'
import type { ApiSesion } from '../datos/usarSesion'
import {
  avanceSkill,
  contarPorEstado,
  distractoresFrecuentes,
  ETIQUETA_ESTADO,
  estadoSkill,
  LIMPIOS_PARA_DOMINAR,
  VENTANA,
} from '../dominio/progreso'
import { fechaCorta } from '../dominio/ritmo'
import type { EstadoSkill, Item, Skill } from '../dominio/tipos'

const VACIO: ReadonlySet<string> = new Set()

/** El criterio de cada estado, en el orden en que se muestran. */
const CRITERIO: Record<EstadoSkill, string> = {
  dominado: `${LIMPIOS_PARA_DOMINAR} o más intentos limpios entre los últimos ${VENTANA}`,
  en_desarrollo: 'cualquier otro caso',
  flojo: '3 o más intentos y a lo sumo 1 limpio',
  sin_explorar: 'ningún intento todavía',
}

/** Ítems de exámenes, por clave: no están en ninguna guía. */
const ITEMS_EXAMEN: Map<string, { examen: string; numero: number; item: Item }> = (() => {
  const m = new Map<string, { examen: string; numero: number; item: Item }>()
  for (const ex of examenes) {
    const [a, mes, d] = ex.fecha.split('-')
    const fecha = `${d}/${mes}/${a}`
    for (const ej of ex.ejercicios) {
      for (const item of ej.items ?? []) {
        m.set(claveItemExamen(ex.id, ej.numero, item.id), {
          examen: `${ex.tipo} del ${fecha}`,
          numero: ej.numero,
          item,
        })
      }
    }
  }
  return m
})()

/** "2 de los últimos 4 intentos fueron limpios", con la concordancia de cada caso. */
function avanceEnPalabras(limpios: number, total: number): string {
  if (total === 1) return limpios === 1 ? 'el único intento fue limpio' : 'el único intento no fue limpio'
  return `${limpios} de los últimos ${total} intentos ${limpios === 1 ? 'fue limpio' : 'fueron limpios'}`
}

/**
 * El dato de una etapa: qué guías suma y cuándo es. "guías 1 a 8 · 30/10",
 * "guías 9 a 12, más lo del parcial · sin fecha".
 */
function datoEtapa(etapa: Etapa, anterior: Etapa | undefined): string {
  const { evaluacion, propias, acumula } = etapa
  const suma = acumula ? (anterior ? `, más lo del ${grupoDe(anterior.evaluacion)}` : ', más lo anterior') : ''
  const cuando = evaluacion.fecha ? fechaCorta(evaluacion.fecha) : 'sin fecha'
  return `${rangoGuias(propias)}${suma} · ${cuando}`
}

/** La inicial del skill, para el sello de la insignia. */
function inicial(nombre: string): string {
  return nombre.trim().charAt(0).toUpperCase()
}

export function PanelSkills({
  api,
  sesion,
  onIrAEjercicio,
  onIrASkill,
}: {
  api: ApiProgreso
  /** Para marcar en la ventana de un skill los ítems ya resueltos. */
  sesion?: ApiSesion
  /** Lleva a un ejercicio, que está en otra sección. */
  onIrAEjercicio?: (idEjercicio: string) => void
  /** Lleva a la teoría del skill (o a su primer ejercicio, si no tiene). */
  onIrASkill?: (idSkill: string) => void
}) {
  const { progreso } = api
  /** El skill de la ventana. Se conserva al cerrarla para que salga con su contenido. */
  const [elegido, setElegido] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)
  const subir = usarSubir()

  const grupos = skillsPorGuia()
  // El resumen cuenta sólo los que se pueden practicar.
  const habilitados = grupos.flatMap((g) => g.skills).filter((s) => !skillBloqueado(s))
  const estados = habilitados.map((s) => estadoSkill(progreso, itemsPorSkill.get(s.id) ?? VACIO))
  const resumen = contarPorEstado(estados)
  const etapasMateria = etapas(config.evaluaciones)

  /** Cierra la ventana y después navega: así no queda abierta sobre otra sección. */
  function cerrarE(ir?: () => void): void {
    setAbierto(false)
    ir?.()
  }

  // Las etapas con sus guías, para el panel y para el índice.
  const porEtapa = etapasMateria
    .map((etapa, k) => ({
      etapa,
      id: `etapa-${grupoDe(etapa.evaluacion)}`,
      dato: datoEtapa(etapa, etapasMateria[k - 1]),
      grupos: grupos.filter((g) => etapa.propias.includes(g.guia)),
    }))
    .filter((e) => e.grupos.length > 0)

  return (
    <>
      <IndiceSkills etapas={porEtapa} api={api} />
      <SubirLateral visible={subir} />

      <section class="guia__intro">
        <h2>Panel de skills</h2>
        <p class="guia__descripcion">
          El estado de cada skill se calcula sobre sus últimos {VENTANA} intentos, contando
          como máximo uno por ítem y por día. Un intento es <strong>limpio</strong> si el ítem
          se resuelve sin ver la respuesta, en el primer envío si es de opción múltiple y en
          hasta dos envíos en los demás casos. El tiempo sin practicar no modifica el estado.
          Lo modifican los intentos nuevos, que desplazan a los más antiguos de la ventana, de
          modo que un skill dominado vuelve a estar en desarrollo si los últimos intentos no
          son limpios.
        </p>

        <ul class="resumen">
          {(['dominado', 'en_desarrollo', 'flojo', 'sin_explorar'] as EstadoSkill[]).map((e) => (
            <li key={e} class={'resumen__item estado--' + e}>
              <span>
                <strong>{resumen[e]}</strong> {ETIQUETA_ESTADO[e]}
              </span>
              <span class="resumen__criterio">{CRITERIO[e]}</span>
            </li>
          ))}
        </ul>
      </section>

      {porEtapa.map(({ etapa, id, dato, grupos: deEtapa }) => {
        return (
          <section key={id} class="etapa" aria-labelledby={id}>
            <header class="etapa__cabeza">
              <h3 id={id} class="etapa__titulo">
                {rotuloGrupo(etapa.evaluacion)}
              </h3>
              <p class="etapa__dato">{dato}</p>
            </header>
            {deEtapa.map(({ guia, skills }) => (
              <section key={guia} id={anclaGuia(guia)} class="grupo-skills">
                <h4 class="grupo-skills__titulo">
                  Guía {guia}
                  {skills.every(skillBloqueado) && <IconoCandado />}
                </h4>
                <ul class="grilla-skills">
                  {skills.map((s) =>
                    skillBloqueado(s) ? (
                      <CeldaBloqueada key={s.id} skill={s} />
                    ) : (
                      <CeldaSkill
                        key={s.id}
                        skill={s}
                        api={api}
                        onAbrir={() => {
                          setElegido(s.id)
                          setAbierto(true)
                        }}
                      />
                    ),
                  )}
                </ul>
              </section>
            ))}
          </section>
        )
      })}

      {elegido && (
        <VentanaSkill
          id={elegido}
          abierto={abierto}
          api={api}
          sesion={sesion}
          onCerrar={() => cerrarE()}
          onIrAEjercicio={(ej) => cerrarE(() => onIrAEjercicio?.(ej))}
          onIrATeoria={() => cerrarE(() => onIrASkill?.(elegido))}
        />
      )}
    </>
  )
}

const anclaGuia = (guia: number) => `skills-guia-${guia}`

type GrupoGuia = ReturnType<typeof skillsPorGuia>[number]

/**
 * El índice de la izquierda: las guías agrupadas por etapa, como el panel,
 * con cuántos de sus skills están dominados. Al hacer clic baja hasta la
 * guía; al desplazarse, queda marcada la que se está leyendo.
 */
function IndiceSkills({
  etapas,
  api,
}: {
  etapas: { id: string; etapa: Etapa; grupos: GrupoGuia[] }[]
  api: ApiProgreso
}) {
  const pausa = useRef(false)
  const guias = etapas.flatMap((e) => e.grupos.map((g) => g.guia))
  const visible = usarSeccionVisible(guias, anclaGuia, pausa)
  // Al saltar se marca enseguida la elegida, sin esperar a que llegue.
  const [elegida, setElegida] = useState<number | null>(null)
  const marcada = elegida ?? visible

  function ir(guia: number): void {
    setElegida(guia)
    pausa.current = true
    irA(anclaGuia(guia))
    alTerminarDeDesplazar(() => {
      pausa.current = false
      setElegida(null)
      dispatchEvent(new Event('scroll'))
    })
  }

  return (
    <aside class="indice indice--grupos" aria-label="Índice de las guías">
      <div class="indice__contenido">
        <ol class="indice__lista">
          {etapas.map(({ id, etapa, grupos }, i) => (
            <li key={id} class="indice__grupo" style={{ '--i': i }}>
              <p class="indice__rotulo">{rotuloGrupo(etapa.evaluacion)}</p>
              <ol class="indice__sublista indice__sublista--fija">
                {grupos.map(({ guia, skills }) => {
                  const habilitados = skills.filter((s) => !skillBloqueado(s))
                  const dominados = habilitados.filter(
                    (s) => estadoSkill(api.progreso, itemsPorSkill.get(s.id) ?? VACIO) === 'dominado',
                  ).length
                  return (
                    <li key={guia}>
                      <button
                        class={'indice__tema' + (guia === marcada ? ' indice__tema--activo' : '')}
                        aria-current={guia === marcada ? 'true' : undefined}
                        onClick={() => ir(guia)}
                      >
                        Guía {guia}
                      </button>
                      {habilitados.length > 0 ? (
                        <span class="indice__avance" data-tip="Skills dominados">
                          {dominados}/{habilitados.length}
                        </span>
                      ) : (
                        <span class="indice__avance" data-tip="Todavía sin cargar">
                          <IconoCandado />
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  )
}

/** Un skill que se puede practicar: el recuadro entero abre su ventana. */
function CeldaSkill({ skill, api, onAbrir }: { skill: Skill; api: ApiProgreso; onAbrir: () => void }) {
  const items = itemsPorSkill.get(skill.id) ?? VACIO
  const estado = estadoSkill(api.progreso, items)
  const { limpios, total } = avanceSkill(api.progreso, items)
  return (
    <li class={'celda estado--' + estado}>
      <button class="celda-skill" aria-haspopup="dialog" onClick={onAbrir}>
        <span class="sello" aria-hidden="true">
          {inicial(skill.nombre)}
        </span>
        <span class="celda-skill__texto">
          <span class="celda-skill__nombre">{skill.nombre}</span>
          <span class="celda-skill__estado">
            {ETIQUETA_ESTADO[estado]}
            {total > 0 && ` · ${limpios}/${total} limpios`}
          </span>
        </span>
      </button>
    </li>
  )
}

/**
 * Un skill de una guía que todavía no se cargó: se ve, con un candado en el
 * sello, pero no abre nada.
 */
function CeldaBloqueada({ skill }: { skill: Skill }) {
  return (
    <li class="celda celda--bloqueada">
      <div class="celda-skill" data-tip={`Se habilita cuando se cargue la guía ${skill.guia}`}>
        <span class="sello" aria-hidden="true">
          <IconoCandado />
        </span>
        <span class="celda-skill__texto">
          <span class="celda-skill__nombre">{skill.nombre}</span>
          <span class="celda-skill__estado">Bloqueado</span>
        </span>
      </div>
    </li>
  )
}

/**
 * La ventana de un skill: de qué trata, sus fórmulas, los ítems que lo
 * evalúan (con un tilde en los ya resueltos) y los errores típicos repetidos.
 */
function VentanaSkill({
  id,
  abierto,
  api,
  sesion,
  onCerrar,
  onIrAEjercicio,
  onIrATeoria,
}: {
  id: string
  abierto: boolean
  api: ApiProgreso
  sesion?: ApiSesion
  onCerrar: () => void
  onIrAEjercicio: (idEjercicio: string) => void
  onIrATeoria: () => void
}) {
  const skill = skillPorId.get(id)
  if (!skill) return null

  const items = itemsPorSkill.get(id) ?? VACIO
  const estado = estadoSkill(api.progreso, items)
  const { limpios, total } = avanceSkill(api.progreso, items)
  // Las claves de las guías ordenan bien como texto: g1-09:a va antes que g1-10:a.
  const deGuias = [...items].filter((c) => ubicacionDeItem.has(c)).sort()
  const deExamenes = [...items].filter((c) => ITEMS_EXAMEN.has(c))
  const caidas = distractoresFrecuentes(api.progreso, items)
  const destino = destinoDeSkill.get(id)

  return (
    <Dialogo
      abierto={abierto}
      clase={'modal--skill estado--' + estado}
      titulo={skill.nombre}
      onCerrar={onCerrar}
      acciones={
        <>
          <button class="boton" onClick={onCerrar} autoFocus>
            Cerrar
          </button>
          {destino && (
            <button class="boton boton--acento" onClick={onIrATeoria}>
              {destino.ancla.startsWith('ej-') ? 'Ir al primer ejercicio' : 'Ir a la teoría'}
            </button>
          )}
        </>
      }
    >
      <p class="modal-skill__estado">
        Guía {skill.guia} · <span class="modal-skill__etiqueta">{ETIQUETA_ESTADO[estado]}</span>
        {total > 0 && ` · ${avanceEnPalabras(limpios, total)}`}
      </p>

      {skill.descripcion && (
        <p>
          <Mate>{skill.descripcion}</Mate>
        </p>
      )}

      {skill.formulas?.length ? (
        <div class="panel panel--formulas">
          {skill.formulas.map((f, i) => (
            <div key={i} class="formula">
              <Formula tex={f} display />
            </div>
          ))}
        </div>
      ) : null}

      <h4>Ítems que lo evalúan</h4>
      {deGuias.length > 0 && (
        <ul class="lista-items lista-items--columnas">
          {deGuias.map((clave) => {
            const u = ubicacionDeItem.get(clave)!
            const resuelto = sesion?.item(clave).estado === 'correcto'
            return (
              <li key={clave}>
                <button class="enlace" onClick={() => onIrAEjercicio(u.ejercicio.id)}>
                  Ejercicio {u.ejercicio.numero} ({u.item})
                </button>
                {resuelto && (
                  <span class="lista-items__resuelto" role="img" aria-label="Resuelto" data-tip="Resuelto">
                    <IconoComprobar />
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {deExamenes.length > 0 && (
        <p class="dato-chico">
          {deGuias.length > 0 ? 'Además lo ' : 'Lo '}
          {deExamenes.length === 1
            ? 'evalúa 1 ítem de examen, que se practica'
            : `evalúan ${deExamenes.length} ítems de exámenes, que se practican`}{' '}
          en el simulacro.
        </p>
      )}

      {caidas.length > 0 && (
        <>
          <h4>Errores típicos cometidos</h4>
          <ul class="lista-items">
            {caidas.map((c) => {
              const u = ubicacionDeItem.get(c.item)
              const ex = ITEMS_EXAMEN.get(c.item)
              const respuesta =
                u?.ejercicio.items.find((i) => i.id === u.item)?.respuesta ?? ex?.item.respuesta
              const texto =
                respuesta?.tipo === 'opcion'
                  ? respuesta.opciones.find((o) => o.id === c.opcion)?.error_tipico
                  : undefined
              const donde = u
                ? `el ${u.ejercicio.numero} (${u.item})`
                : ex
                  ? `el ${ex.examen}, ejercicio ${ex.numero} (${ex.item.id})`
                  : c.item
              return (
                <li key={c.item + c.opcion}>
                  <strong>{c.veces}×</strong> en {donde}
                  {texto && (
                    <>
                      {' — '}
                      <Mate>{texto}</Mate>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </Dialogo>
  )
}
