/**
 * Una guía: descripción, mapa de ejercicios y la secuencia que alterna teoría
 * y ejercicios (PLAN.md §4.5).
 *
 * El mapa de círculos reemplazó a los chips que filtraban por skill. El
 * cambio de idea: en vez de esconder ejercicios para enfocarse en un tema,
 * mostrar de un vistazo el estado de todos y poder saltar al que haga falta.
 */
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
}

export function VistaGuia({ numero, sesion, onIntento }: Props) {
  const guia = guiaPorNumero.get(numero)

  if (!guia || guia.secuencia.length === 0) {
    return (
      <p class="vacio">
        La guía {numero} todavía no tiene contenido cargado.
        <br />
        Se carga con el pipeline de la sección 7 del PLAN.
      </p>
    )
  }

  return (
    <>
      <IndiceGuia guia={guia} sesion={sesion} />

      <section class="guia__intro" id="arriba">
        <h2>{guia.titulo}</h2>
        <p class="guia__descripcion">{guia.descripcion}</p>
        <MapaEjercicios guia={guia} sesion={sesion} />
      </section>

      <div class="secuencia">
        {guia.secuencia.map((paso, i) => {
          if (paso.tipo === 'teoria') {
            const bloque = teoriaPorId.get(paso.id)
            return bloque ? <Teoria key={i} bloque={bloque} /> : null
          }
          const ej = ejercicioPorId.get(paso.id)
          return ej ? (
            <TarjetaEjercicio key={i} ejercicio={ej} sesion={sesion} onIntento={onIntento} />
          ) : null
        })}
      </div>

      <VolverAlInicio />
    </>
  )
}

/** El pie de la guía. */
export function VolverAlInicio() {
  return (
    <button class="volver" onClick={() => irA('arriba')}>
      <span class="volver__linea" aria-hidden="true" />
      <span class="volver__texto">volver al inicio</span>
      <span class="volver__linea" aria-hidden="true" />
    </button>
  )
}
