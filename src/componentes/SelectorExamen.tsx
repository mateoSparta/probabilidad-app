/**
 * Un selector de evaluaciones: cada opción con su nombre y, debajo, su fecha.
 * Lo usan Seguimiento (para elegir el objetivo) y el calendario del aviso
 * (para elegir qué fecha se edita).
 *
 * Las opciones van en una grilla de `columnas` columnas, que en pantallas
 * angostas pasa a dos: "1er recuperatorio" no entra en un cuarto de teléfono.
 * Como la elegida puede estar en otra fila, el fondo blanco es un Indicador,
 * que la mide y se desliza hasta ella.
 */
import { rotulo, type Evaluacion } from '../dominio/evaluaciones'
import { fechaCorta } from '../dominio/ritmo'
import { Indicador } from './Indicador'

type Props = {
  evaluaciones: readonly Evaluacion[]
  elegida: string
  onElegir: (nombre: string) => void
  /** El `name` de los radios: tiene que ser único en la página. */
  nombre: string
  etiqueta: string
  /** La fecha de cada una, si no es la de la evaluación (un borrador). */
  fechaDe?: (ev: Evaluacion) => string | null
  columnas?: number
  clase?: string
}

export function SelectorExamen({
  evaluaciones,
  elegida,
  onElegir,
  nombre,
  etiqueta,
  fechaDe = (ev) => ev.fecha,
  columnas = 2,
  clase = '',
}: Props) {
  return (
    <div
      class={'segmentado segmentado--deslizante selector-examen ' + clase}
      role="radiogroup"
      aria-label={etiqueta}
      style={{ '--columnas': Math.min(columnas, evaluaciones.length) }}
    >
      <Indicador selector=".segmentado__opcion--activa" clave={elegida} />
      {evaluaciones.map((ev) => {
        const f = fechaDe(ev)
        return (
          <label
            key={ev.nombre}
            class={'segmentado__opcion' + (ev.nombre === elegida ? ' segmentado__opcion--activa' : '')}
          >
            <input
              class="sr-solo"
              type="radio"
              name={nombre}
              value={ev.nombre}
              checked={ev.nombre === elegida}
              onChange={() => onElegir(ev.nombre)}
            />
            <span class="segmentado__nombre">{rotulo(ev)}</span>
            <span class="segmentado__dato">{f ? fechaCorta(f) : 'sin fecha'}</span>
          </label>
        )
      })}
    </div>
  )
}
