/**
 * Globos de ayuda: reemplazan al `title` del navegador, que tarda en aparecer
 * y no sigue el estilo de la app.
 *
 * Cualquier elemento con `data-tip` muestra su texto al pasar el mouse o al
 * recibir el foco con el teclado, sin demora. Hay un solo globo para toda la
 * página, montado una vez en la raíz, y se ubica con `position: fixed` debajo
 * del elemento (o encima, si abajo no entra), así que ningún contenedor con
 * `overflow` lo recorta.
 *
 * Si el texto cambia mientras el globo está a la vista (la pestaña de la guía
 * abierta lo calcula al entrar el mouse), el globo se actualiza: un
 * MutationObserver mira el atributo del elemento actual. Para eso el elemento
 * tiene que tener el atributo desde antes, aunque sea vacío: un `data-tip=""`
 * no muestra nada pero deja al elemento a la escucha.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'

/** Separación entre el elemento y el globo, en px. */
const SEPARACION = 8
/** Distancia mínima del globo a los bordes de la ventana, en px. */
const MARGEN = 8

type Estado = { texto: string; rect: DOMRect }

export function Globo() {
  const [estado, setEstado] = useState<Estado | null>(null)
  const globo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let actual: HTMLElement | null = null
    const observador = new MutationObserver(() => mostrar(actual))

    function mostrar(el: HTMLElement | null): void {
      const texto = el?.dataset.tip
      if (!el || !texto) {
        setEstado(null)
        return
      }
      setEstado({ texto, rect: el.getBoundingClientRect() })
    }

    function seguir(el: HTMLElement | null): void {
      if (el === actual) return
      observador.disconnect()
      actual = el
      if (el) observador.observe(el, { attributes: true, attributeFilter: ['data-tip'] })
      mostrar(el)
    }

    function soltar(): void {
      observador.disconnect()
      actual = null
      setEstado(null)
    }

    const sobre = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      seguir((e.target as Element).closest<HTMLElement>('[data-tip]'))
    }
    const fuera = (e: PointerEvent) => {
      if (!actual) return
      const hacia = e.relatedTarget as Node | null
      if (!hacia || !actual.contains(hacia)) soltar()
    }
    // Con el teclado, sólo cuando el foco se ve: un clic también enfoca.
    const foco = (e: FocusEvent) => {
      const el = e.target as HTMLElement
      if (el.matches?.(':focus-visible')) seguir(el.closest<HTMLElement>('[data-tip]'))
    }
    const desenfoque = (e: FocusEvent) => {
      if (actual?.contains(e.target as Node)) soltar()
    }

    document.addEventListener('pointerover', sobre)
    document.addEventListener('pointerout', fuera)
    document.addEventListener('focusin', foco)
    document.addEventListener('focusout', desenfoque)
    // Un clic, una tecla o un scroll lo ocultan: la posición o el contexto
    // cambian, y el globo no tiene que tapar lo que viene después.
    document.addEventListener('pointerdown', soltar)
    document.addEventListener('keydown', soltar)
    addEventListener('scroll', soltar, { capture: true, passive: true })
    addEventListener('resize', soltar)
    return () => {
      observador.disconnect()
      document.removeEventListener('pointerover', sobre)
      document.removeEventListener('pointerout', fuera)
      document.removeEventListener('focusin', foco)
      document.removeEventListener('focusout', desenfoque)
      document.removeEventListener('pointerdown', soltar)
      document.removeEventListener('keydown', soltar)
      removeEventListener('scroll', soltar, { capture: true })
      removeEventListener('resize', soltar)
    }
  }, [])

  // Se ubica después de dibujarse, porque hace falta su tamaño.
  useLayoutEffect(() => {
    const g = globo.current
    if (!estado || !g) return
    const { rect } = estado
    const ancho = g.offsetWidth
    const alto = g.offsetHeight
    const centro = rect.left + rect.width / 2
    const x = Math.min(Math.max(centro - ancho / 2, MARGEN), innerWidth - ancho - MARGEN)
    const abajo = rect.bottom + SEPARACION + alto <= innerHeight - MARGEN
    const y = abajo ? rect.bottom + SEPARACION : rect.top - SEPARACION - alto
    g.style.left = `${Math.round(x)}px`
    g.style.top = `${Math.round(y)}px`
    g.style.setProperty('--flecha-x', `${Math.round(centro - x)}px`)
    g.dataset.lado = abajo ? 'abajo' : 'arriba'
  }, [estado])

  if (!estado) return null
  return (
    <div ref={globo} class="globo" role="tooltip">
      {estado.texto}
    </div>
  )
}
