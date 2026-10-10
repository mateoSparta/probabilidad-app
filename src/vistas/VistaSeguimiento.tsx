/**
 * Seguimiento: el ritmo respecto del parcial y el estado de cada ejercicio,
 * agrupado por unidad.
 *
 * Los círculos son los mismos del mapa de cada guía, pero acá los ejercicios
 * no están en la página: elegir uno lleva a su guía y baja hasta él.
 */
import { AvisoParcialDetalle } from '../componentes/AvisoParcial'
import { MapaEjercicios } from '../componentes/MapaEjercicios'
import { guias } from '../datos/contenido'
import type { ApiSesion } from '../datos/usarSesion'
import type { Plan } from '../dominio/ritmo'
import { ETIQUETA_ESTADO_EJERCICIO, type EstadoEjercicio } from '../dominio/sesion'

const LEYENDA: EstadoEjercicio[] = ['sin_intentar', 'en_progreso', 'mal', 'resuelto']

type Props = {
  plan: Plan
  sesion?: ApiSesion
  onIrAEjercicio: (idEjercicio: string) => void
}

export function VistaSeguimiento({ plan, sesion, onIrAEjercicio }: Props) {
  const conContenido = guias
    .filter((g) => g.secuencia.some((p) => p.tipo === 'ejercicio'))
    .sort((a, b) => a.numero - b.numero)

  return (
    <>
      <section class="guia__intro">
        <h2>Seguimiento</h2>
        <p class="guia__descripcion">
          La meta no es resolver todos los ejercicios, sino dominar todos los temas. El cálculo
          de abajo estima cuántos ítems faltan para lograrlo y cuántos conviene resolver por día
          hasta la fecha del parcial.
        </p>
      </section>

      <AvisoParcialDetalle plan={plan} />

      <section class="seguimiento" aria-labelledby="titulo-unidades">
        <h3 id="titulo-unidades">Ejercicios por unidad</h3>

        <ul class="leyenda" aria-label="Referencias de los círculos">
          {LEYENDA.map((e) => (
            <li key={e}>
              <span class={'punto punto--' + e} aria-hidden="true" />
              {ETIQUETA_ESTADO_EJERCICIO[e]}
            </li>
          ))}
        </ul>

        {conContenido.map((g) => (
          <section key={g.numero} class="unidad">
            <h4 class="unidad__titulo">
              <span class="unidad__numero">Guía {g.numero}</span> {g.titulo}
            </h4>
            <MapaEjercicios guia={g} sesion={sesion} onElegir={onIrAEjercicio} />
          </section>
        ))}
      </section>
    </>
  )
}
