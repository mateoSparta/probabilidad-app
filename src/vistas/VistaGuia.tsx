/**
 * Una guía: descripción, chips de skills y la secuencia que alterna teoría
 * y ejercicios (PLAN.md §3 y §4.5).
 */
import { useMemo, useState } from 'preact/hooks'

import { TarjetaEjercicio } from '../componentes/TarjetaEjercicio'
import { Teoria } from '../componentes/Teoria'
import { ejercicioPorId, guiaPorNumero, skillsDeGuia, teoriaPorId } from '../datos/contenido'
import type { Intento } from '../dominio/tipos'

type Props = {
  numero: number
  onIntento?: (intento: Intento, limpio: boolean) => void
}

export function VistaGuia({ numero, onIntento }: Props) {
  const guia = guiaPorNumero.get(numero)
  const skills = useMemo(() => skillsDeGuia(numero), [numero])

  /** null = todos tildados. Un Set = sólo esos. */
  const [tildados, setTildados] = useState<Set<string> | null>(null)

  if (!guia || guia.secuencia.length === 0) {
    return (
      <p class="vacio">
        La guía {numero} todavía no tiene contenido cargado.
        <br />
        Se carga con el pipeline de la sección 7 del PLAN.
      </p>
    )
  }

  const activos = tildados ?? new Set(skills.map((s) => s.id))

  function alternar(id: string) {
    const siguiente = new Set(activos)
    if (siguiente.has(id)) siguiente.delete(id)
    else siguiente.add(id)
    setTildados(siguiente.size === skills.length ? null : siguiente)
  }

  /** Visible si alguno de sus ítems toca un skill tildado. */
  function visible(idEjercicio: string): boolean {
    if (tildados === null) return true
    const ej = ejercicioPorId.get(idEjercicio)
    if (!ej) return false
    return ej.items.some((i) => i.skills.some((s) => activos.has(s)))
  }

  return (
    <>
      <section class="guia__intro">
        <h2>{guia.titulo}</h2>
        <p class="guia__descripcion">{guia.descripcion}</p>

        {skills.length > 0 && (
          <div class="chips" role="group" aria-label="Filtrar por skill">
            {skills.map((s) => (
              <button
                key={s.id}
                class={'chip' + (activos.has(s.id) ? ' chip--on' : '')}
                aria-pressed={activos.has(s.id)}
                title={s.descripcion}
                onClick={() => alternar(s.id)}
              >
                {s.nombre}
              </button>
            ))}
            {tildados !== null && (
              <button class="chip chip--reset" onClick={() => setTildados(null)}>
                Ver todos
              </button>
            )}
          </div>
        )}
      </section>

      <div class="secuencia">
        {guia.secuencia.map((paso, i) => {
          if (paso.tipo === 'teoria') {
            const bloque = teoriaPorId.get(paso.id)
            return bloque ? <Teoria key={i} bloque={bloque} /> : null
          }
          if (!visible(paso.id)) return null
          const ej = ejercicioPorId.get(paso.id)
          return ej ? <TarjetaEjercicio key={i} ejercicio={ej} onIntento={onIntento} /> : null
        })}
      </div>
    </>
  )
}
