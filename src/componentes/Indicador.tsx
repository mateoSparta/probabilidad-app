/**
 * El fondo blanco de un selector de opciones (un grupo sobre fondo oscuro con
 * la opción elegida en relieve), que se desliza hasta la elegida en lugar de
 * aparecer de golpe.
 *
 * El `.segmentado--linea` del Machete lo resuelve sólo con CSS porque sus
 * opciones miden lo mismo. Éste mide la opción elegida, así que sirve para
 * opciones de distinto ancho o repartidas en más de un renglón. Va como
 * primer hijo del grupo, que tiene que tener `position: relative`; las
 * opciones, también posicionadas, quedan encima.
 */
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks'

function ubicar(indicador: HTMLElement, selector: string, animar: boolean): void {
  const elegida = indicador.parentElement?.querySelector<HTMLElement>(selector)
  indicador.classList.toggle('indicador--quieto', !animar)
  if (!elegida) {
    indicador.style.opacity = '0'
    return
  }
  indicador.style.opacity = ''
  indicador.style.width = `${elegida.offsetWidth}px`
  indicador.style.height = `${elegida.offsetHeight}px`
  indicador.style.transform = `translate(${elegida.offsetLeft}px, ${elegida.offsetTop}px)`
}

type Props = {
  /** Cómo encontrar la opción elegida dentro del grupo. */
  selector: string
  /** Cambia cuando cambia la elegida (o la cantidad de opciones). */
  clave: unknown
}

export function Indicador({ selector, clave }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const ubicado = useRef(false)

  // La primera vez se ubica sin animación; después, deslizándose.
  useLayoutEffect(() => {
    ubicar(ref.current!, selector, ubicado.current)
    ubicado.current = true
  }, [clave])

  // Si cambia el tamaño del grupo (otra fuente, otro ancho de ventana), se
  // vuelve a ubicar sin animación.
  useEffect(() => {
    const grupo = ref.current!.parentElement
    if (!grupo || typeof ResizeObserver === 'undefined') return
    const observador = new ResizeObserver(() => ubicar(ref.current!, selector, false))
    observador.observe(grupo)
    return () => observador.disconnect()
  }, [])

  return <span ref={ref} class="indicador" aria-hidden="true" />
}
