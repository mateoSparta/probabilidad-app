/**
 * Panel de skills (PLAN.md §5): una grilla agrupada por guía con el estado de
 * cada skill. Al hacer clic en un skill se abre una ventana que explica de qué
 * trata (descripción y fórmulas), con lo que falta para dominarlo y un enlace
 * a su teoría.
 *
 * Es la vista que contesta "¿dónde estoy flojo?" de un vistazo, que es el
 * punto de medir el dominio sobre intentos recientes y no acumulados.
 */
import { useState } from 'preact/hooks'

import { Formula, Mate } from '../componentes/Mate'
import { Dialogo } from '../componentes/Modal'
import {
  claveItemExamen,
  destinoDeSkill,
  examenes,
  itemsPorSkill,
  skillPorId,
  skillsPorGuia,
  ubicacionDeItem,
} from '../datos/contenido'
import type { ApiProgreso } from '../datos/usarProgreso'
import {
  avanceSkill,
  contarPorEstado,
  distractoresFrecuentes,
  ETIQUETA_ESTADO,
  estadoSkill,
  LIMPIOS_PARA_DOMINAR,
  pendientes,
  VENTANA,
} from '../dominio/progreso'
import type { EstadoSkill, Item } from '../dominio/tipos'

const VACIO: ReadonlySet<string> = new Set()

/** El criterio de cada estado, en el orden en que se muestran. */
const CRITERIO: Record<EstadoSkill, string> = {
  dominado: `${LIMPIOS_PARA_DOMINAR} o más intentos limpios entre los últimos ${VENTANA}`,
  en_desarrollo: 'cualquier otro caso',
  flojo: '3 o más intentos y a lo sumo 1 limpio',
  sin_explorar: 'ningún intento todavía',
}

/** Ítems de parciales, por clave: no están en ninguna guía. */
const ITEMS_EXAMEN: Map<string, { examen: string; numero: number; item: Item }> = (() => {
  const m = new Map<string, { examen: string; numero: number; item: Item }>()
  for (const ex of examenes) {
    const [a, mes, d] = ex.fecha.split('-')
    const fecha = `${d}/${mes}/${a}`
    for (const ej of ex.ejercicios) {
      for (const item of ej.items ?? []) {
        m.set(claveItemExamen(ex.id, ej.numero, item.id), {
          examen: `parcial del ${fecha}`,
          numero: ej.numero,
          item,
        })
      }
    }
  }
  return m
})()

/** La inicial del skill, para el sello de la insignia. */
function inicial(nombre: string): string {
  return nombre.trim().charAt(0).toUpperCase()
}

export function PanelSkills({
  api,
  onIrAEjercicio,
  onIrASkill,
}: {
  api: ApiProgreso
  /** Lleva a un ejercicio, que está en otra sección. */
  onIrAEjercicio?: (idEjercicio: string) => void
  /** Lleva a la teoría del skill (o a su primer ejercicio, si no tiene). */
  onIrASkill?: (idSkill: string) => void
}) {
  const { progreso } = api
  /** El skill de la ventana. Se conserva al cerrarla para que salga con su contenido. */
  const [elegido, setElegido] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)

  const grupos = skillsPorGuia()
  const todos = grupos.flatMap((g) => g.skills)
  const estados = todos.map((s) => estadoSkill(progreso, itemsPorSkill.get(s.id) ?? VACIO))
  const resumen = contarPorEstado(estados)

  /** Cierra la ventana y después navega: así no queda abierta sobre otra sección. */
  function cerrarE(ir?: () => void): void {
    setAbierto(false)
    ir?.()
  }

  return (
    <>
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

      {grupos.map(({ guia, skills }) => (
        <section key={guia} class="grupo-skills">
          <h3 class="grupo-skills__titulo">Guía {guia}</h3>
          <ul class="grilla-skills">
            {skills.map((s) => {
              const items = itemsPorSkill.get(s.id) ?? VACIO
              const estado = estadoSkill(progreso, items)
              const { limpios, total } = avanceSkill(progreso, items)
              // Con menos de 3 ítems el skill no puede llegar a dominado:
              // conviene decirlo para no confundirlo con ir flojo.
              const sinCobertura = items.size < LIMPIOS_PARA_DOMINAR
              return (
                <li key={s.id} class={'celda estado--' + estado}>
                  <button
                    class="celda-skill"
                    aria-haspopup="dialog"
                    onClick={() => {
                      setElegido(s.id)
                      setAbierto(true)
                    }}
                  >
                    <span class="sello" aria-hidden="true">
                      {inicial(s.nombre)}
                    </span>
                    <span class="celda-skill__texto">
                      <span class="celda-skill__nombre">{s.nombre}</span>
                      <span class="celda-skill__estado">
                        {ETIQUETA_ESTADO[estado]}
                        {total > 0 && ` · ${limpios}/${total} limpios`}
                      </span>
                      {sinCobertura && (
                        <span class="celda-skill__nota">
                          faltan ejercicios para poder dominarlo
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {elegido && (
        <VentanaSkill
          id={elegido}
          abierto={abierto}
          api={api}
          onCerrar={() => cerrarE()}
          onIrAEjercicio={(ej) => cerrarE(() => onIrAEjercicio?.(ej))}
          onIrATeoria={() => cerrarE(() => onIrASkill?.(elegido))}
        />
      )}
    </>
  )
}

/**
 * La ventana de un skill: de qué trata, sus fórmulas y lo que falta para
 * dominarlo (ítems sin un intento limpio y errores típicos repetidos).
 */
function VentanaSkill({
  id,
  abierto,
  api,
  onCerrar,
  onIrAEjercicio,
  onIrATeoria,
}: {
  id: string
  abierto: boolean
  api: ApiProgreso
  onCerrar: () => void
  onIrAEjercicio: (idEjercicio: string) => void
  onIrATeoria: () => void
}) {
  const skill = skillPorId.get(id)
  if (!skill) return null

  const items = itemsPorSkill.get(id) ?? VACIO
  const estado = estadoSkill(api.progreso, items)
  const { limpios, total } = avanceSkill(api.progreso, items)
  const falta = pendientes(api.progreso, items)
  const faltaGuias = falta.filter((c) => ubicacionDeItem.has(c))
  const faltaExamenes = falta.filter((c) => ITEMS_EXAMEN.has(c))
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
        {total > 0 && ` · ${limpios} de los últimos ${total} intentos fueron limpios`}
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

      <h4>Ítems sin un intento limpio</h4>
      {falta.length === 0 ? (
        <p class="dato-chico">Ninguno. Todos tuvieron al menos un intento limpio.</p>
      ) : (
        <>
          {faltaGuias.length > 0 && (
            <ul class="lista-items">
              {faltaGuias.map((clave) => {
                const u = ubicacionDeItem.get(clave)!
                return (
                  <li key={clave}>
                    <button class="enlace" onClick={() => onIrAEjercicio(u.ejercicio.id)}>
                      Ejercicio {u.ejercicio.numero} ({u.item})
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {faltaExamenes.length > 0 && (
            <p class="dato-chico">
              {faltaGuias.length > 0 ? 'Además, ' : ''}
              {faltaExamenes.length}{' '}
              {faltaExamenes.length === 1 ? 'ítem de parcial' : 'ítems de parciales'}, que se
              practican en el simulacro.
            </p>
          )}
        </>
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
