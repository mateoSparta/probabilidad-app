/**
 * Panel de skills (PLAN.md §5): una grilla agrupada por guía con el estado de
 * cada skill. Al hacer clic en un skill se ven sus ítems pendientes y los
 * distractores en los que más se cayó.
 *
 * Es la vista que contesta "¿dónde estoy flojo?" de un vistazo, que es el
 * punto de medir el dominio sobre intentos recientes y no acumulados.
 */
import { useState } from 'preact/hooks'

import { Formula } from '../componentes/Mate'
import { descargar } from '../datos/almacenamiento'
import { itemsPorSkill, skillPorId, skillsPorGuia, ubicacionDeItem } from '../datos/contenido'
import type { ApiProgreso } from '../datos/usarProgreso'
import {
  avanceSkill,
  contarPorEstado,
  distractoresFrecuentes,
  desdeJson,
  ETIQUETA_ESTADO,
  estadoSkill,
  pendientes,
  VENTANA,
} from '../dominio/progreso'
import type { EstadoSkill } from '../dominio/tipos'

const VACIO: ReadonlySet<string> = new Set()

/** La inicial del skill, para el sello de la insignia. */
function inicial(nombre: string): string {
  return nombre.trim().charAt(0).toUpperCase()
}

export function PanelSkills({ api }: { api: ApiProgreso }) {
  const { progreso, reemplazar, reiniciar } = api
  const [abierto, setAbierto] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const grupos = skillsPorGuia()
  const todos = grupos.flatMap((g) => g.skills)
  const estados = todos.map((s) => estadoSkill(progreso, itemsPorSkill.get(s.id) ?? VACIO))
  const resumen = contarPorEstado(estados)

  async function importar(e: Event) {
    const input = e.target as HTMLInputElement
    const archivo = input.files?.[0]
    if (!archivo) return
    const p = desdeJson(await archivo.text())
    if (!p) {
      setAviso('Ese archivo no tiene el formato del progreso.')
      return
    }
    reemplazar(p)
    setAviso(`Importados ${p.intentos.length} intentos.`)
    input.value = ''
  }

  return (
    <>
      <section class="guia__intro">
        <h2>Panel de skills</h2>
        <p class="guia__descripcion">
          El estado de cada skill se mide sobre sus últimos {VENTANA} intentos, así que no se
          gana para siempre: si dejás de practicar algo, vuelve a bajar.
        </p>

        <ul class="resumen">
          {(['dominado', 'en_desarrollo', 'flojo', 'sin_explorar'] as EstadoSkill[]).map((e) => (
            <li key={e} class={'resumen__item estado--' + e}>
              <strong>{resumen[e]}</strong> {ETIQUETA_ESTADO[e]}
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
              return (
                <li key={s.id}>
                  <button
                    class={'celda-skill estado--' + estado + (abierto === s.id ? ' celda-skill--abierta' : '')}
                    onClick={() => setAbierto(abierto === s.id ? null : s.id)}
                    aria-expanded={abierto === s.id}
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
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {abierto && <Detalle id={abierto} api={api} />}

      <section class="datos">
        <h3>Tus datos</h3>
        <p class="guia__descripcion">
          El progreso se guarda en este navegador. Exportalo si querés llevarlo a otra máquina.
        </p>
        <div class="item__acciones">
          <button class="boton" onClick={() => descargar(progreso)}>
            Exportar JSON
          </button>
          <label class="boton">
            Importar JSON
            <input type="file" accept="application/json" class="sr-solo" onChange={importar} />
          </label>
          <button
            class="boton boton--fantasma"
            onClick={() => {
              if (confirm('¿Borrar todo el progreso de este navegador?')) {
                reiniciar()
                setAviso('Progreso borrado.')
              }
            }}
          >
            Borrar progreso
          </button>
        </div>
        {aviso && <p class="feedback feedback--aviso">{aviso}</p>}
        <p class="dato-chico">{progreso.intentos.length} intentos registrados.</p>
      </section>
    </>
  )
}

/** Lo que falta de un skill: ítems pendientes y errores típicos repetidos. */
function Detalle({ id, api }: { id: string; api: ApiProgreso }) {
  const skill = skillPorId.get(id)
  if (!skill) return null

  const items = itemsPorSkill.get(id) ?? VACIO
  const falta = pendientes(api.progreso, items)
  const caidas = distractoresFrecuentes(api.progreso, items)

  return (
    <section class="detalle-skill">
      <h3>{skill.nombre}</h3>
      {skill.descripcion && <p class="guia__descripcion">{skill.descripcion}</p>}

      {skill.formulas?.length ? (
        <div class="panel panel--formulas">
          {skill.formulas.map((f, i) => (
            <div key={i} class="formula">
              <Formula tex={f} display />
            </div>
          ))}
        </div>
      ) : null}

      <h4>Ítems sin resolver limpio</h4>
      {falta.length === 0 ? (
        <p class="dato-chico">Ninguno: todos tuvieron al menos un intento limpio.</p>
      ) : (
        <ul class="lista-items">
          {falta.map((clave) => {
            const u = ubicacionDeItem.get(clave)
            return (
              <li key={clave}>
                {u ? (
                  <a href={'#ej-' + u.ejercicio.id}>
                    Ejercicio {u.ejercicio.numero} ({u.item})
                  </a>
                ) : (
                  clave
                )}
              </li>
            )
          })}
        </ul>
      )}

      <h4>Errores típicos en los que caíste</h4>
      {caidas.length === 0 ? (
        <p class="dato-chico">Todavía ninguno.</p>
      ) : (
        <ul class="lista-items">
          {caidas.map((c) => {
            const u = ubicacionDeItem.get(c.item)
            const ej = u?.ejercicio
            const opcion = ej?.items
              .find((i) => i.id === u?.item)
              ?.respuesta
            const texto =
              opcion && opcion.tipo === 'opcion'
                ? opcion.opciones.find((o) => o.id === c.opcion)?.error_tipico
                : undefined
            return (
              <li key={c.item + c.opcion}>
                <strong>{c.veces}×</strong> en {ej ? `el ${ej.numero} (${u?.item})` : c.item}
                {texto && <> — {texto}</>}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
