/**
 * Una guía: descripción, mapa de ejercicios y la secuencia que alterna teoría
 * y ejercicios (PLAN.md §4.5).
 *
 * El mapa de círculos reemplazó a los chips que filtraban por skill. El
 * cambio de idea: en vez de esconder ejercicios para enfocarse en un tema,
 * mostrar de un vistazo el estado de todos y poder saltar al que haga falta.
 *
 * Para volver arriba hay dos caminos: la pestaña de la guía abierta y el
 * "↑ Subir" del costado derecho, que aparece cuando la fila de círculos sale
 * de la vista. Por eso el pie ya no es un enlace sino un cierre.
 */
import { useEffect, useRef, useState } from 'preact/hooks'

import { IndiceGuia } from '../componentes/IndiceGuia'
import { irA, MapaEjercicios } from '../componentes/MapaEjercicios'
import { TarjetaEjercicio } from '../componentes/TarjetaEjercicio'
import { Teoria } from '../componentes/Teoria'
import { ejercicioPorId, guiaPorNumero, teoriaPorId } from '../datos/contenido'
import type { ApiSesion } from '../datos/usarSesion'
import type { Intento } from '../dominio/tipos'

type Props = {
  numero: number
  sesion?: ApiSesion
  onIntento?: (intento: Intento, limpio: boolean) => void
  /** Ancla (ejercicio o teoría) a la que hay que bajar apenas se dibuje la guía. */
  destino?: string | null
  onDestinoAlcanzado?: () => void
}

export function VistaGuia({ numero, sesion, onIntento, destino, onDestinoAlcanzado }: Props) {
  const guia = guiaPorNumero.get(numero)
  const intro = useRef<HTMLElement>(null)
  /** Si la fila de círculos ya quedó arriba, fuera de la vista. */
  const [mapaArriba, setMapaArriba] = useState(false)

  // Se mira la fila de círculos y no el título: es lo que dice "estás arriba
  // de la guía". El margen superior descuenta la barra fija de las pestañas.
  //
  // Cuando deja de verse, hay que distinguir si quedó arriba o abajo de la
  // zona visible, y la comparación tiene que ser contra el borde de esa zona
  // (`rootBounds`) y no contra el borde de la ventana: al bajar con la rueda
  // del mouse, el observador avisa cuando la fila ya pasó debajo de la barra
  // pero todavía no salió de la ventana, y no vuelve a avisar después.
  useEffect(() => {
    const mapa = intro.current?.querySelector('.mapa')
    if (!mapa || typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(
      ([e]) => {
        const borde = e.rootBounds?.top ?? 0
        setMapaArriba(!e.isIntersecting && e.boundingClientRect.bottom <= borde + 1)
      },
      { rootMargin: '-56px 0px 0px 0px' },
    )
    observador.observe(mapa)
    return () => observador.disconnect()
  }, [numero])

  // Se baja sin animación: viniendo de otra sección, una animación larga
  // desde el principio de la guía no aporta nada. Al llegar, el bloque se
  // resalta un instante para que se vea adónde se llegó.
  useEffect(() => {
    if (!destino) return
    irA(destino, false)
    const el = document.getElementById(destino)
    el?.classList.add('destacado')
    const t = setTimeout(() => el?.classList.remove('destacado'), 1600)
    onDestinoAlcanzado?.()
    return () => clearTimeout(t)
  }, [destino])

  if (!guia || guia.secuencia.length === 0) {
    return (
      <p class="vacio">
        La guía {numero} todavía no tiene contenido cargado.
      </p>
    )
  }

  return (
    <>
      <IndiceGuia guia={guia} sesion={sesion} />

      <SubirLateral visible={mapaArriba} />

      <section class="guia__intro" ref={intro}>
        <h2>{guia.titulo}</h2>
        <p class="guia__descripcion">{guia.descripcion}</p>
        <MapaEjercicios guia={guia} sesion={sesion} />
      </section>

      <div class="secuencia">
        {guia.secuencia.map((paso) => {
          if (paso.tipo === 'teoria') {
            const bloque = teoriaPorId.get(paso.id)
            return bloque ? <Teoria key={paso.id} bloque={bloque} /> : null
          }
          const ej = ejercicioPorId.get(paso.id)
          return ej ? (
            <TarjetaEjercicio key={paso.id} ejercicio={ej} sesion={sesion} onIntento={onIntento} />
          ) : null
        })}
      </div>

      <FinDeGuia />
    </>
  )
}

/**
 * "↑ Subir", al costado derecho de la columna y a la altura de lo que se está
 * leyendo. Se ve sólo cuando la fila de círculos ya quedó arriba; mientras
 * tanto está oculto, sin foco y sin ocupar lugar en la lectura.
 */
function SubirLateral({ visible }: { visible: boolean }) {
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

/** El cierre de la guía: no es un enlace, sólo marca el final. */
export function FinDeGuia() {
  return (
    <p class="fin">
      <span class="fin__linea" aria-hidden="true" />
      <span class="fin__texto">fin</span>
      <span class="fin__linea" aria-hidden="true" />
    </p>
  )
}
