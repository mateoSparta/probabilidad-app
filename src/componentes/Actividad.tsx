/**
 * El calendario de actividad de Seguimiento, como el de GitHub: una columna
 * por semana (de lunes a domingo, de arriba hacia abajo) y un cuadradito por
 * día, más saturado de naranja cuantos más ítems se resolvieron ese día. Al
 * pasar el mouse, el globo dice cuántos y cuándo.
 *
 * Muestra las semanas que entran en el ancho de la columna, terminando en la
 * actual: nunca hay barra horizontal, y lo que no entra no se ve. Los
 * cuadrados son grandes (24 semanas en la columna completa, menos de medio año:
 * un cuatrimestre dura cuatro meses y más no haría falta) y se estiran para
 * llenar el ancho justo. El ancho se mide al dibujar y cada vez que cambia
 * la ventana; hasta medirlo (en el render del servidor, por ejemplo) se
 * asume el de la columna completa.
 *
 * La intensidad es relativa al día de más actividad que se ve: cuatro
 * escalones, como en GitHub, así el calendario se lee igual con dos ítems
 * por día que con veinte.
 */
import { useLayoutEffect, useRef, useState } from 'preact/hooks'

import { dia, resueltosPorDia, type Progreso } from '../dominio/progreso'

/** El lado mínimo de un cuadrado; se estira hasta llenar el ancho. */
const CELDA_MINIMA = 26
const ESPACIO = 4
/** El lugar de los nombres de los días, a la izquierda. */
const ROTULOS = 30
/** Hasta medir: las semanas y el lado en una columna de 728 px útiles. */
const POR_DEFECTO = { semanas: 24, celda: 26.5 }

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
/** Como en GitHub, sólo se nombran tres días, para que respire. */
const DIAS = ['lun', '', 'mié', '', 'vie', '', '']

type Celda = { fecha: Date; clave: string; cantidad: number; futura: boolean }

/** El lunes de la semana de una fecha, a medianoche. */
function lunesDe(f: Date): Date {
  const l = new Date(f.getFullYear(), f.getMonth(), f.getDate())
  l.setDate(l.getDate() - ((l.getDay() + 6) % 7))
  return l
}

function ayuda(c: Celda): string {
  const cuando = `el ${c.fecha.getDate()} de ${MESES_LARGOS[c.fecha.getMonth()]}`
  if (c.cantidad === 0) return `Ningún ítem resuelto ${cuando}`
  return `${c.cantidad} ${c.cantidad === 1 ? 'ítem resuelto' : 'ítems resueltos'} ${cuando}`
}

export function Actividad({ progreso, hoy = new Date() }: { progreso: Progreso; hoy?: Date }) {
  const marco = useRef<HTMLDivElement>(null)
  const [{ semanas, celda }, setMedidas] = useState(POR_DEFECTO)

  useLayoutEffect(() => {
    const el = marco.current
    if (!el) return
    const medir = () => {
      const ancho = el.clientWidth - ROTULOS
      const n = Math.max(4, Math.floor((ancho + ESPACIO) / (CELDA_MINIMA + ESPACIO)))
      // Medio píxel menos, para que el redondeo nunca pase del ancho.
      const lado = Math.floor(((ancho - (n - 1) * ESPACIO) / n) * 2) / 2
      setMedidas((m) => (m.semanas === n && m.celda === lado ? m : { semanas: n, celda: lado }))
    }
    medir()
    if (typeof ResizeObserver === 'undefined') return
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  const porDia = resueltosPorDia(progreso)
  const claveHoy = dia(hoy.toISOString())
  const inicio = lunesDe(hoy)
  inicio.setDate(inicio.getDate() - 7 * (semanas - 1))

  const columnas: Celda[][] = []
  for (let s = 0; s < semanas; s++) {
    const columna: Celda[] = []
    for (let d = 0; d < 7; d++) {
      const fecha = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 7 * s + d)
      const clave = dia(fecha.toISOString())
      columna.push({ fecha, clave, cantidad: porDia.get(clave) ?? 0, futura: clave > claveHoy })
    }
    columnas.push(columna)
  }

  const visibles = columnas.flat().filter((c) => !c.futura)
  const maximo = Math.max(0, ...visibles.map((c) => c.cantidad))
  const total = visibles.reduce((n, c) => n + c.cantidad, 0)
  const dias = visibles.filter((c) => c.cantidad > 0).length
  const nivel = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((4 * n) / maximo)))

  // El mes va sobre la primera semana que lo trae, si no queda pegado al anterior.
  let ultimaConMes = -3
  const meses = columnas.map((columna, s) => {
    const primero = columna.find((c) => c.fecha.getDate() === 1)
    const mes = s === 0 ? columna[0].fecha.getMonth() : primero?.fecha.getMonth()
    if (mes === undefined || s - ultimaConMes < 3) return ''
    ultimaConMes = s
    return MESES[mes]
  })

  return (
    <section class="actividad" aria-labelledby="titulo-actividad">
      <div class="actividad__cabeza">
        <h3 id="titulo-actividad">Actividad</h3>
        <p class="actividad__dato">
          {total === 0
            ? 'Todavía no hay ítems resueltos'
            : `${total} ${total === 1 ? 'ítem resuelto' : 'ítems resueltos'} en ${dias} ${dias === 1 ? 'día' : 'días'}`}
        </p>
      </div>

      <div
        ref={marco}
        class="actividad__marco"
        style={{ '--semanas': semanas, '--celda': `${celda}px`, '--espacio': `${ESPACIO}px`, '--rotulos': `${ROTULOS}px` }}
      >
        <div class="actividad__meses" aria-hidden="true">
          {meses.map((m, s) => (
            <span key={s}>{m}</span>
          ))}
        </div>
        <div class="actividad__cuerpo">
          <div class="actividad__dias" aria-hidden="true">
            {DIAS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div
            class="actividad__grilla"
            role="img"
            aria-label={`Calendario de actividad: ${total} ítems resueltos en ${dias} días`}
          >
            {columnas.flat().map((c) =>
              c.futura ? (
                <span key={c.clave} class="actividad__dia actividad__dia--futuro" />
              ) : (
                <span
                  key={c.clave}
                  class={
                    'actividad__dia actividad__dia--' + nivel(c.cantidad) + (c.clave === claveHoy ? ' actividad__dia--hoy' : '')
                  }
                  data-tip={ayuda(c)}
                />
              ),
            )}
          </div>
        </div>
        <p class="actividad__leyenda" aria-hidden="true">
          Menos
          {[0, 1, 2, 3, 4].map((n) => (
            <span key={n} class={'actividad__dia actividad__dia--' + n} />
          ))}
          Más
        </p>
      </div>
    </section>
  )
}
