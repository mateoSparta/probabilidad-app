/**
 * Seguimiento: el ritmo respecto del examen objetivo, el calendario de los
 * días en que se practicó y el estado de cada ejercicio, agrupado por unidad.
 * El objetivo se elige en el desplegable del aviso del encabezado.
 *
 * Los círculos son los mismos del mapa de cada guía, pero acá los ejercicios
 * no están en la página: elegir uno lleva a su guía y baja hasta él.
 */
import { Actividad } from '../componentes/Actividad'
import { AvisoExamenDetalle } from '../componentes/AvisoExamen'
import { MapaEjercicios } from '../componentes/MapaEjercicios'
import { guias } from '../datos/contenido'
import type { ApiSesion } from '../datos/usarSesion'
import type { Progreso } from '../dominio/progreso'
import type { Plan } from '../dominio/ritmo'
import { ETIQUETA_ESTADO_EJERCICIO, type EstadoEjercicio } from '../dominio/sesion'

const LEYENDA: EstadoEjercicio[] = ['sin_intentar', 'en_progreso', 'mal', 'resuelto']

type Props = {
  plan: Plan
  /** El historial de intentos, para el calendario de actividad. */
  progreso: Progreso
  sesion?: ApiSesion
  onIrAEjercicio: (idEjercicio: string) => void
}

export function VistaSeguimiento({ plan, progreso, sesion, onIrAEjercicio }: Props) {
  const conContenido = guias
    .filter((g) => g.secuencia.some((p) => p.tipo === 'ejercicio'))
    .sort((a, b) => a.numero - b.numero)

  return (
    <>
      <section class="guia__intro">
        <h2>Seguimiento</h2>
      </section>

      {/* La key repite la entrada del detalle al cambiar de objetivo. */}
      <AvisoExamenDetalle key={plan.evaluacion?.nombre} plan={plan} />

      <Actividad progreso={progreso} />

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

        {conContenido.map((g, i) => (
          <section key={g.numero} class="unidad" style={{ '--i': i }}>
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
