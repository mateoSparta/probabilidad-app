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
import { useEffect, useRef } from 'preact/hooks'

import { IndiceGuia } from '../componentes/IndiceGuia'
import { irA, MapaEjercicios } from '../componentes/MapaEjercicios'
import { SubirLateral, usarQuedoArriba } from '../componentes/SubirLateral'
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
  // Se mira la fila de círculos y no el título: es lo que dice "estás arriba
  // de la guía". El margen superior descuenta la barra fija de las pestañas.
  const mapaArriba = usarQuedoArriba(() => intro.current?.querySelector('.mapa'), 56, [numero])

  // Se baja sin animación: viniendo de otra sección, una animación larga
  // desde el principio de la guía no aporta nada. Al llegar, el bloque se
  // resalta un instante para que se vea adónde se llegó.
  //
  // Lo que se arma acá no depende de `destino`: avisar que se llegó lo vuelve
  // null enseguida, y con eso no tiene que cortarse ni el resaltado ni el
  // seguimiento del ancla. Se corta solo, o al desmontar la guía.
  const soltarAncla = useRef<(() => void) | null>(null)
  useEffect(() => () => soltarAncla.current?.(), [])
  useEffect(() => {
    if (!destino) return
    irA(destino, false)
    const el = document.getElementById(destino)
    el?.classList.add('destacado')
    setTimeout(() => el?.classList.remove('destacado'), 1600)
    soltarAncla.current?.()
    soltarAncla.current = mantenerEnVista(destino)
    onDestinoAlcanzado?.()
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
 * Mantiene un ancla arriba de la pantalla mientras la página termina de
 * acomodarse. Las tipografías de la guía (las de KaTeX y la monoespaciada de
 * los campos) pueden cargar después del salto, y al cambiar las alturas el
 * destino se corre decenas de píxeles. Durante dos segundos se vuelve a saltar
 * cada vez que la página cambia de tamaño, salvo que el usuario ya se haya
 * movido por su cuenta. Devuelve la función que lo corta.
 */
function mantenerEnVista(ancla: string): () => void {
  if (typeof ResizeObserver === 'undefined') return () => {}
  const observador = new ResizeObserver(() => irA(ancla, false))
  const eventos = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const
  const soltar = (): void => {
    observador.disconnect()
    clearTimeout(t)
    for (const ev of eventos) removeEventListener(ev, soltar)
  }
  const t = setTimeout(soltar, 2000)
  observador.observe(document.body)
  for (const ev of eventos) addEventListener(ev, soltar, { passive: true })
  return soltar
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
