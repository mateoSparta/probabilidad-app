/**
 * Una guía: descripción, mapa de ejercicios y la secuencia que alterna teoría
 * y ejercicios (PLAN.md §4.5).
 *
 * El mapa de círculos reemplazó a los chips que filtraban por skill. El
 * cambio de idea: en vez de esconder ejercicios para enfocarse en un tema,
 * mostrar de un vistazo el estado de todos y poder saltar al que haga falta.
 */
import { useEffect } from 'preact/hooks'

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
  /** Ejercicio al que hay que bajar apenas se dibuje la guía. */
  destino?: string | null
  onDestinoAlcanzado?: () => void
}

export function VistaGuia({ numero, sesion, onIntento, destino, onDestinoAlcanzado }: Props) {
  const guia = guiaPorNumero.get(numero)

  // Se baja sin animación: viniendo de otra sección, una animación larga
  // desde el principio de la guía no aporta nada.
  useEffect(() => {
    if (!destino) return
    irA('ej-' + destino, false)
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

      <section class="guia__intro" id="principio">
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

      <VolverAlPrincipio />
    </>
  )
}

/** El pie de la guía. */
export function VolverAlPrincipio() {
  return (
    <button class="volver" onClick={() => irA('principio')}>
      <span class="volver__linea" aria-hidden="true" />
      <span class="volver__texto">volver al principio</span>
      <span class="volver__linea" aria-hidden="true" />
    </button>
  )
}
