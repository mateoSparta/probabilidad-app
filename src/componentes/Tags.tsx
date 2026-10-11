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
 *
 * En toda la página hay a lo sumo un tag fijo: fijar uno en una tarjeta
 * suelta el que hubiera en cualquier otra, de modo que queda el último que
 * se eligió. Cada tarjeta tiene su propio estado, así que se avisan por un
 * canal compartido.
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

/** Por acá se avisa qué tarjeta acaba de fijar un tag, para que las demás suelten el suyo. */
const canal: EventTarget | null = typeof EventTarget === 'undefined' ? null : new EventTarget()

export function usarResaltado(): Resaltado {
  const [encima, setEncima] = useState<string | null>(null)
  const [fijado, setFijado] = useState<string | null>(null)
  const refFila = useRef<HTMLUListElement>(null)
  /** Identifica a esta tarjeta en el canal. */
  const yo = useRef({})

  useEffect(() => {
    if (!canal) return
    const otra = (e: Event) => {
      if ((e as CustomEvent).detail !== yo.current) setFijado(null)
    }
    canal.addEventListener('fijar', otra)
    return () => canal.removeEventListener('fijar', otra)
  }, [])

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
      else canal?.dispatchEvent(new CustomEvent('fijar', { detail: yo.current }))
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
