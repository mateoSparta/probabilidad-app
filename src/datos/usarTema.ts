/**
 * El modo de color: claro u oscuro. Vive en el atributo `data-tema` de
 * `<html>`, que index.html fija antes de dibujar la página (así no hay un
 * destello del otro modo) y del que dependen los colores de tokens.css.
 *
 * Si el usuario nunca eligió, sigue al sistema, también si cambia con la
 * página abierta (el modo nocturno automático de muchos teléfonos). Al
 * elegir con el botón, la elección se guarda en localStorage y deja de
 * seguirlo. Al cambiar, los colores pasan de uno a otro con una transición
 * corta (la clase `tema-cambiando`).
 */
import { useEffect, useState } from 'preact/hooks'

export type Tema = 'claro' | 'oscuro'

const CLAVE = 'probabilidad-app:tema:v1'
/** Lo que dura la transición de colores; tiene que coincidir con tokens.css. */
const TRANSICION_MS = 300

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

let fin = 0

function aplicar(t: Tema): void {
  const html = document.documentElement
  html.classList.add('tema-cambiando')
  html.dataset.tema = t
  clearTimeout(fin)
  fin = window.setTimeout(() => html.classList.remove('tema-cambiando'), TRANSICION_MS)
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
