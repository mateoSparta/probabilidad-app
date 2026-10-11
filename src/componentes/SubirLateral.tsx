/**
 * "↑ Subir", al costado derecho de la columna y a la altura de lo que se está
 * leyendo. Lo usan las guías y el panel de skills: se ve sólo cuando lo que
 * marca el comienzo de la página (la fila de círculos de una guía, la primera
 * fila de skills) ya quedó arriba; mientras tanto está oculto, sin foco y sin
 * ocupar lugar en la lectura.
 */
import { useEffect, useState } from 'preact/hooks'

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

/**
 * Si el elemento ya quedó arriba, fuera de la zona visible.
 *
 * Cuando deja de verse, hay que distinguir si quedó arriba o abajo de la
 * zona visible, y la comparación tiene que ser contra el borde de esa zona
 * (`rootBounds`) y no contra el borde de la ventana: al bajar con la rueda
 * del mouse, el observador avisa cuando el elemento ya pasó debajo de una
 * barra fija pero todavía no salió de la ventana, y no vuelve a avisar
 * después. `margenSuperior` descuenta esa barra, si la hay.
 */
export function usarQuedoArriba(
  buscar: () => Element | null | undefined,
  margenSuperior: number,
  deps: readonly unknown[],
): boolean {
  const [arriba, setArriba] = useState(false)
  useEffect(() => {
    const el = buscar()
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(
      ([e]) => {
        const borde = e.rootBounds?.top ?? 0
        setArriba(!e.isIntersecting && e.boundingClientRect.bottom <= borde + 1)
      },
      { rootMargin: `-${margenSuperior}px 0px 0px 0px` },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, deps)
  return arriba
}
