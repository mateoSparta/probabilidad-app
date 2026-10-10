/**
 * Los tags de un ejercicio, debajo del enunciado.
 *
 * Aparecen a medida que se resuelven los ítems: cada ítem resuelto (o
 * revelado) suma sus skills a la fila. Al pasar el mouse por un tag se
 * resaltan sus fragmentos en el enunciado y en las preguntas; al hacer clic
 * queda fijo, y un segundo clic lo suelta.
 *
 * Un tag fijo se suelta solo cuando la fila sale de la pantalla. Si no, al
 * volver al ejercicio más tarde aparecería un resaltado que nadie recuerda
 * haber pedido. Cambiar de guía o de sección desmonta la tarjeta, así que en
 * ese caso se suelta sin hacer nada.
 */
import type { RefObject } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import { skillPorId } from '../datos/contenido'

export type Resaltado = {
  /** El skill que hay que resaltar ahora: el del mouse o, si no, el fijo. */
  activo: string | null
  fijado: string | null
  refFila: RefObject<HTMLUListElement | null>
  pasar: (skill: string | null) => void
  alternar: (skill: string) => void
}

export function usarResaltado(): Resaltado {
  const [encima, setEncima] = useState<string | null>(null)
  const [fijado, setFijado] = useState<string | null>(null)
  const refFila = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const fila = refFila.current
    if (!fijado || !fila || typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) setFijado(null)
    })
    observador.observe(fila)
    return () => observador.disconnect()
  }, [fijado])

  return {
    activo: encima ?? fijado,
    fijado,
    refFila,
    pasar: setEncima,
    alternar: (skill) => {
      // Al soltar se borra también el hover: en pantallas táctiles no hay
      // `pointerleave` y el resaltado quedaría prendido.
      if (fijado === skill) setEncima(null)
      setFijado(fijado === skill ? null : skill)
    },
  }
}

type Props = {
  skills: string[]
  resaltado: Resaltado
}

export function Tags({ skills, resaltado }: Props) {
  const { fijado, refFila, pasar, alternar } = resaltado
  if (skills.length === 0) return null

  return (
    <ul class="tags" ref={refFila} aria-label="Temas que evalúa el ejercicio">
      {skills.map((id, i) => (
        <li key={id} style={{ '--i': i }}>
          <button
            class={'tag' + (fijado === id ? ' tag--fijado' : '')}
            aria-pressed={fijado === id}
            onPointerEnter={(e) => e.pointerType === 'mouse' && pasar(id)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && pasar(null)}
            onFocus={() => pasar(id)}
            onBlur={() => pasar(null)}
            onClick={() => alternar(id)}
          >
            {skillPorId.get(id)?.nombre ?? id}
          </button>
        </li>
      ))}
    </ul>
  )
}
