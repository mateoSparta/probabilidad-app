/**
 * Lo que comparten los índices de la izquierda que siguen la lectura (el del
 * Machete y el del panel de skills): saber qué sección se está leyendo y
 * esperar a que termine un salto antes de volver a seguirla.
 */
import { useEffect, useState } from 'preact/hooks'

/**
 * Corre `listo` cuando termina el desplazamiento en curso, o enseguida si no
 * hay ninguno: mira la posición cada 80 ms y espera dos lecturas iguales. No
 * usa `scrollend` porque no todos los navegadores lo emiten.
 */
export function alTerminarDeDesplazar(listo: () => void): void {
  let ultima = scrollY
  let quietas = 0
  let vueltas = 0
  const t = setInterval(() => {
    vueltas++
    if (scrollY === ultima) quietas++
    else {
      quietas = 0
      ultima = scrollY
    }
    if (quietas >= 2 || vueltas > 50) {
      clearInterval(t)
      listo()
    }
  }, 80)
}

/**
 * La sección que se está leyendo: la última cuyo ancla ya pasó la mitad de la
 * pantalla, o la primera si ninguna. Mientras `pausa` está prendida (un salto
 * desde el índice en curso) no se actualiza, para no marcar cada sección por
 * la que pasa el desplazamiento.
 */
export function usarSeccionVisible<T>(
  claves: readonly T[],
  ancla: (clave: T) => string,
  pausa: { current: boolean },
): T | null {
  const [visible, setVisible] = useState<T | null>(claves[0] ?? null)
  useEffect(() => {
    let cuadro = 0
    const revisar = () => {
      cuadro = 0
      if (pausa.current) return
      let actual: T | null = claves[0] ?? null
      for (const c of claves) {
        const titulo = document.getElementById(ancla(c))
        if (titulo && titulo.getBoundingClientRect().top <= innerHeight / 2) actual = c
      }
      setVisible(actual)
    }
    const alDesplazar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(revisar)
    }
    revisar()
    addEventListener('scroll', alDesplazar, { passive: true })
    return () => {
      removeEventListener('scroll', alDesplazar)
      cancelAnimationFrame(cuadro)
    }
  }, [claves.join()])
  return visible
}
