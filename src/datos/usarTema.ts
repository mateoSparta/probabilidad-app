/**
 * El modo de color: claro u oscuro. Vive en el atributo `data-tema` de
 * `<html>`, que index.html fija antes de dibujar la página (así no hay un
 * destello del otro modo) y del que dependen los colores de tokens.css.
 *
 * Si el usuario nunca eligió, sigue al sistema, también si cambia con la
 * página abierta (el modo nocturno automático de muchos teléfonos). Al
 * elegir con el botón, la elección se guarda en localStorage y deja de
 * seguirlo.
 *
 * Al cambiar, la página se funde de un modo al otro con la View Transitions
 * API: el navegador funde una captura de la pantalla vieja con la nueva, así
 * que cuesta lo mismo en el Machete (miles de elementos de KaTeX) que en el
 * inicio. Antes se animaba el color de cada elemento, y en las páginas
 * cargadas se trababa. Sin la API, o con movimiento reducido, el cambio es
 * instantáneo.
 */
import { useEffect, useState } from 'preact/hooks'

export type Tema = 'claro' | 'oscuro'

const CLAVE = 'probabilidad-app:tema:v1'

function guardado(): Tema | null {
  try {
    const t = localStorage.getItem(CLAVE)
    return t === 'claro' || t === 'oscuro' ? t : null
  } catch {
    return null
  }
}

const sistema = (): Tema =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'

function actual(): Tema {
  if (typeof document === 'undefined') return 'claro'
  const t = document.documentElement.dataset.tema
  return t === 'oscuro' || t === 'claro' ? t : (guardado() ?? sistema())
}

function aplicar(t: Tema): void {
  const cambiar = () => {
    document.documentElement.dataset.tema = t
  }
  const conMovimiento = !matchMedia('(prefers-reduced-motion: reduce)').matches
  if (conMovimiento && typeof document.startViewTransition === 'function') document.startViewTransition(cambiar)
  else cambiar()
}

export function usarTema(): { tema: Tema; alternar: () => void } {
  const [tema, setTema] = useState<Tema>(actual)

  // Sin elección guardada, sigue al sistema.
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const consulta = matchMedia('(prefers-color-scheme: dark)')
    const alCambiar = () => {
      if (guardado()) return
      const t = sistema()
      aplicar(t)
      setTema(t)
    }
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  function alternar(): void {
    const t: Tema = tema === 'oscuro' ? 'claro' : 'oscuro'
    aplicar(t)
    try {
      localStorage.setItem(CLAVE, t)
    } catch {
      /* sin persistencia, pero vale mientras la página esté abierta */
    }
    setTema(t)
  }

  return { tema, alternar }
}
