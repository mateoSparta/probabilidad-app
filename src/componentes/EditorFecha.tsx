/**
 * El calendario para cambiar la fecha de un examen, en una ventana modal. Se
 * abre con el lápiz de cada examen, en el desplegable del aviso del
 * encabezado.
 *
 * Arriba, el mes, que se recorre con las flechas; abajo, la fecha elegida con
 * los días que faltan. Nada se guarda hasta apretar "Guardar".
 */
import { useEffect, useState } from 'preact/hooks'

import { usarEvaluaciones } from '../datos/usarFechas'
import { diasHasta } from '../dominio/evaluaciones'
import { IconoAnterior, IconoSiguiente } from './Iconos'
import { Dialogo } from './Modal'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

const dos = (n: number) => String(n).padStart(2, '0')
const iso = (anio: number, mes: number, dia: number) => `${anio}-${dos(mes + 1)}-${dos(dia)}`
const hoyIso = () => {
  const h = new Date()
  return iso(h.getFullYear(), h.getMonth(), h.getDate())
}
/** Lunes es 0, como en el calendario argentino. */
const diaDeLaSemana = (anio: number, mes: number, dia: number) => (new Date(anio, mes, dia).getDay() + 6) % 7

/** "viernes 30 de octubre de 2026". */
function fechaLarga(f: string): string {
  const [anio, mes, dia] = f.split('-').map(Number)
  return `${DIAS_SEMANA[diaDeLaSemana(anio, mes - 1, dia)]} ${dia} de ${MESES[mes - 1]} de ${anio}`
}

function faltan(f: string): string {
  const d = diasHasta(f)
  return d > 1 ? `faltan ${d} días` : d === 1 ? 'es mañana' : d === 0 ? 'es hoy' : 'ya pasó'
}

type Mes = { anio: number; mes: number }
const mesDe = (f: string | null): Mes => {
  const [anio, mes] = (f ?? hoyIso()).split('-').map(Number)
  return { anio, mes: mes - 1 }
}

type Props = {
  abierto: boolean
  /** La evaluación cuya fecha se edita. */
  nombre: string
  onCerrar: () => void
}

export function EditorFecha({ abierto, nombre, onCerrar }: Props) {
  const { evaluaciones, cambiarFecha } = usarEvaluaciones()
  const ev = evaluaciones.find((e) => e.nombre === nombre)
  const [elegida, setElegida] = useState<string | null>(ev?.fecha ?? null)
  const [mes, setMes] = useState<Mes>(mesDe(null))
  const [sentido, setSentido] = useState<'adelante' | 'atras' | null>(null)

  // Al abrir, arranca de la fecha vigente.
  useEffect(() => {
    if (!abierto) return
    setElegida(ev?.fecha ?? null)
    setMes(mesDe(ev?.fecha ?? null))
    setSentido(null)
  }, [abierto, nombre])

  const hoy = hoyIso()

  function moverMes(paso: 1 | -1): void {
    setSentido(paso === 1 ? 'adelante' : 'atras')
    setMes(({ anio, mes }) => {
      const m = mes + paso
      return { anio: anio + Math.floor(m / 12), mes: ((m % 12) + 12) % 12 }
    })
  }

  function guardar(): void {
    if (ev && elegida !== ev.fecha) cambiarFecha(nombre, elegida)
    onCerrar()
  }

  const enBlanco = diaDeLaSemana(mes.anio, mes.mes, 1)
  const cantidad = new Date(mes.anio, mes.mes + 1, 0).getDate()

  return (
    <Dialogo
      abierto={abierto}
      titulo={`Fecha del ${nombre}`}
      clase="modal--fecha"
      onCerrar={onCerrar}
      acciones={
        <>
          <button class="boton" onClick={onCerrar}>
            Cancelar
          </button>
          <button class="boton boton--acento" onClick={guardar}>
            Guardar
          </button>
        </>
      }
    >

      <div class="calendario">
        <div class="calendario__cabeza">
          <button class="calendario__flecha" aria-label="Mes anterior" data-tip="Mes anterior" onClick={() => moverMes(-1)}>
            <IconoAnterior />
          </button>
          <p key={`${mes.anio}-${mes.mes}`} class="calendario__mes" aria-live="polite">
            {MESES[mes.mes]} de {mes.anio}
          </p>
          <button class="calendario__flecha" aria-label="Mes siguiente" data-tip="Mes siguiente" onClick={() => moverMes(1)}>
            <IconoSiguiente />
          </button>
        </div>
        <div class="calendario__semana" aria-hidden="true">
          {['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div
          key={`${mes.anio}-${mes.mes}`}
          class={'calendario__dias' + (sentido ? ' calendario__dias--' + sentido : '')}
        >
          {Array.from({ length: enBlanco }, (_, i) => (
            <span key={'v' + i} />
          ))}
          {Array.from({ length: cantidad }, (_, i) => {
            const f = iso(mes.anio, mes.mes, i + 1)
            return (
              <button
                key={f}
                class={
                  'calendario__dia' +
                  (f === elegida ? ' calendario__dia--elegido' : '') +
                  (f === hoy ? ' calendario__dia--hoy' : '') +
                  (f < hoy ? ' calendario__dia--pasado' : '')
                }
                aria-pressed={f === elegida}
                aria-label={fechaLarga(f)}
                onClick={() => setElegida(f)}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>

      <p class="editor-fecha__elegida">
        {elegida ? (
          <>
            <strong>{fechaLarga(elegida)}</strong>
            <span class="editor-fecha__faltan">{faltan(elegida)}</span>
          </>
        ) : (
          <strong>Sin fecha</strong>
        )}
      </p>
    </Dialogo>
  )
}
