/**
 * "↑ Subir", al costado derecho de la columna y a la altura de lo que se está
 * leyendo. Lo usan todas las pantallas largas (guías, skills, fórmulas,
 * distribuciones) y aparece en todas a la misma distancia de scroll; mientras
 * tanto está oculto, sin foco y sin ocupar lugar en la lectura.
 */
import { useEffect, useState } from 'preact/hooks'

/**
 * Cuánto hay que bajar para que aparezca, en píxeles. Es el promedio
 * redondeado de dónde aparecía cuando cada pantalla tenía su propio criterio
 * (339 a 367 en las guías, al salir la fila de círculos; 609 en skills, al
 * salir la primera fila): un poco más de media pantalla.
 */
export const DISTANCIA_SUBIR = 400

export function SubirLateral({ visible }: { visible: boolean }) {
  return (
    <aside class={'subir-lateral' + (visible ? ' subir-lateral--visible' : '')}>
      <button
        class="subir"
        tabIndex={visible ? 0 : -1}
        aria-hidden={visible ? undefined : 'true'}
        onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span class="subir__flecha" aria-hidden="true">
          ↑
        </span>
        Subir
      </button>
    </aside>
  )
}

/** Si ya se bajó lo suficiente como para mostrar "Subir". */
export function usarSubir(): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const revisar = () => setVisible(scrollY > DISTANCIA_SUBIR)
    revisar()
    addEventListener('scroll', revisar, { passive: true })
    return () => removeEventListener('scroll', revisar)
  }, [])
  return visible
}
