/**
 * Índice de temas de la guía, en la columna vacía de la izquierda.
 *
 * Lista los bloques de teoría en el orden de la secuencia, con los ejercicios
 * que vienen después de cada uno. Al hacer clic, baja hasta ahí.
 *
 * Se esconde en pantallas angostas: la columna central es lo que importa.
 */
import { ejercicioPorId, teoriaPorId } from '../datos/contenido'
import type { ApiSesion } from '../datos/usarSesion'
import { estadoEjercicio } from '../dominio/sesion'
import { claveItem, type Guia } from '../dominio/tipos'
import { irA } from './MapaEjercicios'

type Tema = {
  id: string
  titulo: string
  ejercicios: { id: string; numero: string }[]
}

/** Agrupa la secuencia en temas: cada teoría con los ejercicios que le siguen. */
function temasDe(guia: Guia): Tema[] {
  const temas: Tema[] = []
  for (const paso of guia.secuencia) {
    if (paso.tipo === 'teoria') {
      const bloque = teoriaPorId.get(paso.id)
      if (bloque) temas.push({ id: bloque.id, titulo: bloque.titulo, ejercicios: [] })
      continue
    }
    const ej = ejercicioPorId.get(paso.id)
    if (!ej) continue
    // Un ejercicio antes del primer bloque de teoría arma un tema sin título.
    if (temas.length === 0) {
      temas.push({ id: '', titulo: 'Ejercicios', ejercicios: [] })
    }
    temas[temas.length - 1].ejercicios.push({ id: ej.id, numero: ej.numero })
  }
  return temas
}

type Props = {
  guia: Guia
  sesion?: ApiSesion
}

export function IndiceGuia({ guia, sesion }: Props) {
  const temas = temasDe(guia)
  if (temas.length === 0) return null

  return (
    <aside class="indice" aria-label={`Índice de la guía ${guia.numero}`}>
      <div class="indice__contenido">
        <p class="indice__titulo">Guía {guia.numero}</p>
        <ol class="indice__lista">
          {temas.map((tema, i) => {
            const resueltos = tema.ejercicios.filter((e) => {
              const ej = ejercicioPorId.get(e.id)
              if (!ej || !sesion) return false
              return (
                estadoEjercicio(
                  sesion.sesion,
                  ej.items.map((it) => claveItem(ej.id, it.id)),
                ) === 'resuelto'
              )
            }).length

            return (
              <li key={tema.id || i}>
                <button
                  class="indice__tema"
                  onClick={() => irA(tema.id || 'ej-' + tema.ejercicios[0]?.id)}
                >
                  {tema.titulo}
                </button>
                {tema.ejercicios.length > 0 && (
                  <span class="indice__avance">
                    {resueltos}/{tema.ejercicios.length}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </aside>
  )
}
