/**
 * Panel de skills (PLAN.md §5): una grilla agrupada por guía con el estado de
 * cada skill. Al hacer clic en un skill se va a su teoría en Ejercicios; el
 * botón chico de la esquina abre el detalle (ítems pendientes y distractores
 * en los que más se cayó).
 *
 * Es la vista que contesta "¿dónde estoy flojo?" de un vistazo, que es el
 * punto de medir el dominio sobre intentos recientes y no acumulados.
 */
import { useState } from 'preact/hooks'

import { Formula, Mate } from '../componentes/Mate'
import {
  destinoDeSkill,
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
import type { EstadoSkill } from '../dominio/tipos'

const VACIO: ReadonlySet<string> = new Set()

/** Un "+" que gira a "×" cuando el detalle está abierto (ver navegacion.css). */
const IconoMas = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

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
  const [abierto, setAbierto] = useState<string | null>(null)

  const grupos = skillsPorGuia()
  const todos = grupos.flatMap((g) => g.skills)
  const estados = todos.map((s) => estadoSkill(progreso, itemsPorSkill.get(s.id) ?? VACIO))
  const resumen = contarPorEstado(estados)

  return (
    <>
      <section class="guia__intro">
        <h2>Panel de skills</h2>
        <p class="guia__descripcion">
          El estado de cada skill se calcula sobre sus últimos {VENTANA} intentos, de modo que
          no es permanente y disminuye si se deja de practicar.
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
              // Con menos de 3 ítems el skill no puede llegar a dominado:
              // conviene decirlo para no confundirlo con ir flojo.
              const sinCobertura = items.size < LIMPIOS_PARA_DOMINAR
              return (
                <li
                  key={s.id}
                  class={'celda estado--' + estado + (abierto === s.id ? ' celda--abierta' : '')}
                >
                  <button
                    class="celda-skill"
                    title={
                      destinoDeSkill.get(s.id)?.ancla.startsWith('ej-')
                        ? 'Ir al primer ejercicio del tema'
                        : 'Ir a la teoría'
                    }
                    disabled={!destinoDeSkill.has(s.id)}
                    onClick={() => onIrASkill?.(s.id)}
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
                  <button
                    class="celda__detalle"
                    aria-expanded={abierto === s.id}
                    aria-label={`Ver el detalle de ${s.nombre}`}
                    title="Ver detalle"
                    onClick={() => setAbierto(abierto === s.id ? null : s.id)}
                  >
                    <IconoMas />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {abierto && <Detalle id={abierto} api={api} onIrAEjercicio={onIrAEjercicio} />}

    </>
  )
}

/** Lo que falta de un skill: ítems pendientes y errores típicos repetidos. */
function Detalle({
  id,
  api,
  onIrAEjercicio,
}: {
  id: string
  api: ApiProgreso
  onIrAEjercicio?: (idEjercicio: string) => void
}) {
  const skill = skillPorId.get(id)
  if (!skill) return null

  const items = itemsPorSkill.get(id) ?? VACIO
  const falta = pendientes(api.progreso, items)
  const caidas = distractoresFrecuentes(api.progreso, items)

  return (
    <section class="detalle-skill">
      <h3>{skill.nombre}</h3>
      {skill.descripcion && (
        <p class="guia__descripcion">
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
        <ul class="lista-items">
          {falta.map((clave) => {
            const u = ubicacionDeItem.get(clave)
            return (
              <li key={clave}>
                {u ? (
                  <button class="enlace" onClick={() => onIrAEjercicio?.(u.ejercicio.id)}>
                    Ejercicio {u.ejercicio.numero} ({u.item})
                  </button>
                ) : (
                  clave
                )}
              </li>
            )
          })}
        </ul>
      )}

      <h4>Errores típicos cometidos</h4>
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
