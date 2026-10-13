/**
 * Un selector de evaluaciones de un grupo (el parcial y sus recuperatorios,
 * o los llamados a final): cada opción con su nombre y, debajo, su fecha.
 * Lo usa Seguimiento para elegir el objetivo.
 *
 * Las opciones van en una grilla de tantas columnas como evaluaciones, que en
 * pantallas angostas pasa a dos. Como la elegida puede estar en otra fila, el
 * fondo blanco es un Indicador, que la mide y se desliza hasta ella. Con
 * `onEditar`, cada opción lleva un lápiz que aparece al pasar el mouse y abre
 * el calendario de esa evaluación.
 */
import { rotuloInstancia, type Evaluacion } from '../dominio/evaluaciones'
import { fechaCorta } from '../dominio/ritmo'
import { IconoEditar } from './Iconos'
import { Indicador } from './Indicador'

type Props = {
  evaluaciones: readonly Evaluacion[]
  elegida: string
  onElegir: (nombre: string) => void
  onEditar?: (nombre: string) => void
  /** El `name` de los radios: tiene que ser único en la página. */
  nombre: string
  etiqueta: string
  clase?: string
}

export function SelectorExamen({ evaluaciones, elegida, onElegir, onEditar, nombre, etiqueta, clase = '' }: Props) {
  return (
    <div
      class={'segmentado segmentado--deslizante selector-examen ' + clase}
      role="radiogroup"
      aria-label={etiqueta}
      style={{ '--columnas': evaluaciones.length }}
    >
      <Indicador selector=".segmentado__opcion--activa" clave={elegida} />
      {evaluaciones.map((ev) => (
        <div
          key={ev.nombre}
          class={'segmentado__opcion selector-examen__opcion' + (ev.nombre === elegida ? ' segmentado__opcion--activa' : '')}
        >
          <label class="selector-examen__elegir">
            <input
              class="sr-solo"
              type="radio"
              name={nombre}
              value={ev.nombre}
              checked={ev.nombre === elegida}
              onChange={() => onElegir(ev.nombre)}
            />
            <span class="segmentado__nombre">{rotuloInstancia(ev)}</span>
            <span class="segmentado__dato">{ev.fecha ? fechaCorta(ev.fecha) : 'sin fecha'}</span>
          </label>
          {onEditar && (
            <button
              class="selector-examen__editar"
              aria-label={`Editar la fecha del ${ev.nombre}`}
              data-tip="Editar la fecha"
              onClick={() => onEditar(ev.nombre)}
            >
              <IconoEditar />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
