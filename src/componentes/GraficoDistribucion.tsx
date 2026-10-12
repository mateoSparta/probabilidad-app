/**
 * El gráfico de la calculadora de distribuciones: barras de la función de
 * probabilidad en las discretas, curva de la densidad en las continuas, y
 * sombreado lo que suma la probabilidad pedida.
 *
 * Las líneas verticales (x, o a y b) se arrastran con el mouse o el dedo, y
 * también se mueven con las flechas del teclado. Al moverlas avisan con
 * `onMover`, y la calculadora recalcula.
 */
import { useRef, useState } from 'preact/hooks'

import { rangoGrafico, type Univariada, type Valores } from '../dominio/distribuciones'
import { formatearNumero, marcasEje } from '../dominio/formato'

export type Manija = { id: 'x' | 'a' | 'b'; valor: number; rotulo: string }

type Props = {
  d: Univariada
  p: Valores
  /**
   * Lo que se sombrea, en unidades de x. En las discretas son los enteros
   * entre los dos extremos, incluidos.
   */
  region: [number, number]
  manijas: Manija[]
  onMover: (id: Manija['id'], valor: number) => void
}

const ANCHO = 640
const ALTO = 280
const IZQ = 52
const DER = 18
const ARRIBA = 26
const ABAJO = 34

export function GraficoDistribucion({ d, p, region, manijas, onMover }: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const [arrastrando, setArrastrando] = useState<Manija['id'] | null>(null)

  // El intervalo a graficar: casi toda la probabilidad, ampliado para que se
  // vean las manijas aunque estén afuera.
  let [lo, hi] = rangoGrafico(d, p)
  for (const m of manijas) {
    if (!Number.isFinite(m.valor)) continue
    const margen = (hi - lo) * 0.05
    if (m.valor < lo) lo = m.valor - margen
    if (m.valor > hi) hi = m.valor + margen
  }
  const discreta = d.tipo === 'discreta'
  if (discreta) {
    lo = Math.floor(lo)
    hi = Math.ceil(hi)
  }
  const anchoUtil = ANCHO - IZQ - DER
  const altoUtil = ALTO - ARRIBA - ABAJO
  // En las discretas, media unidad de margen a cada lado para que las barras
  // de los extremos no queden cortadas.
  const [x0, x1] = discreta ? [lo - 0.5, hi + 0.5] : [lo, hi]
  const px = (x: number) => IZQ + ((x - x0) / (x1 - x0)) * anchoUtil

  // Los valores a dibujar.
  const enteros = discreta ? Array.from({ length: hi - lo + 1 }, (_, i) => lo + i) : []
  const muestras = discreta
    ? []
    : Array.from({ length: 401 }, (_, i) => {
        const x = lo + ((hi - lo) * i) / 400
        return [x, d.puntual(x, p)] as const
      })
  const alturas = (discreta ? enteros.map((k) => d.puntual(k, p)) : muestras.map(([, y]) => y)).filter(
    (y) => Number.isFinite(y),
  )
  // Una densidad que se dispara en un borde (beta con a < 1) no puede
  // aplastar al resto: se recorta.
  const ordenadas = [...alturas].sort((a, b) => a - b)
  const percentil = ordenadas[Math.floor(ordenadas.length * 0.97)] ?? 1
  let ymax = ordenadas.at(-1) ?? 1
  if (ymax > percentil * 3) ymax = percentil * 1.5
  if (!(ymax > 0)) ymax = 1
  const py = (y: number) => ARRIBA + altoUtil - (Math.min(y, ymax * 1.05) / (ymax * 1.05)) * altoUtil

  const [rA, rB] = region
  const dentro = (k: number) => k >= rA && k <= rB

  // La curva y el área sombreada.
  let curva = ''
  let area = ''
  if (!discreta) {
    curva = muestras
      .filter(([, y]) => Number.isFinite(y))
      .map(([x, y], i) => `${i ? 'L' : 'M'}${px(x).toFixed(1)},${py(y).toFixed(1)}`)
      .join(' ')
    const desde = Math.max(lo, rA)
    const hasta = Math.min(hi, rB)
    if (hasta > desde) {
      const puntos = Array.from({ length: 161 }, (_, i) => {
        const x = desde + ((hasta - desde) * i) / 160
        const y = d.puntual(x, p)
        return `L${px(x).toFixed(1)},${py(Number.isFinite(y) ? y : ymax * 2).toFixed(1)}`
      })
      area = `M${px(desde).toFixed(1)},${py(0)} ${puntos.join(' ')} L${px(hasta).toFixed(1)},${py(0)} Z`
    }
  }

  const marcasX = discreta && hi - lo <= 12 ? enteros : marcasEje(lo, hi, 7).filter((v) => !discreta || Number.isInteger(v))
  const marcasY = marcasEje(0, ymax, 4).filter((v) => v <= ymax * 1.05)

  // Redondeo de lo que se arrastra: enteros en las discretas; en las
  // continuas, dos cifras significativas más que el rango.
  const decimales = discreta ? 0 : Math.max(0, 2 - Math.floor(Math.log10(hi - lo)))
  const redondear = (v: number) => (discreta ? Math.round(v) : Number(v.toFixed(decimales)))
  const paso = discreta ? 1 : 10 ** -decimales * Math.max(1, Math.round((hi - lo) / 100 / 10 ** -decimales))

  function valorEn(clienteX: number): number {
    const r = svg.current!.getBoundingClientRect()
    const fx = ((clienteX - r.left) / r.width) * ANCHO
    const v = x0 + ((fx - IZQ) / anchoUtil) * (x1 - x0)
    return redondear(Math.min(hi, Math.max(lo, v)))
  }

  function alApretar(e: PointerEvent): void {
    if (manijas.length === 0) return
    const v = valorEn(e.clientX)
    const cerca = manijas.reduce((m, c) => (Math.abs(c.valor - v) < Math.abs(m.valor - v) ? c : m))
    setArrastrando(cerca.id)
    svg.current!.setPointerCapture(e.pointerId)
    onMover(cerca.id, v)
  }

  return (
    <svg
      ref={svg}
      class={'grafico-dist' + (arrastrando ? ' grafico-dist--arrastrando' : '')}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      onPointerDown={alApretar}
      onPointerMove={(e) => arrastrando && onMover(arrastrando, valorEn(e.clientX))}
      onPointerUp={() => setArrastrando(null)}
      onPointerCancel={() => setArrastrando(null)}
    >
      <defs>
        <clipPath id="grafico-dist-area">
          <rect x={IZQ} y={ARRIBA - 4} width={anchoUtil} height={altoUtil + 4} />
        </clipPath>
      </defs>

      {/* Ejes y marcas */}
      {marcasY.map((v) => (
        <g key={'y' + v}>
          <line x1={IZQ} x2={ANCHO - DER} y1={py(v)} y2={py(v)} class="grafico-dist__guia" />
          <text x={IZQ - 6} y={py(v) + 4} class="grafico-dist__marca" text-anchor="end">
            {formatearNumero(v, 4, true)}
          </text>
        </g>
      ))}
      <line x1={IZQ} x2={ANCHO - DER} y1={py(0)} y2={py(0)} class="grafico-dist__eje" />
      {marcasX.map((v) => (
        <text key={'x' + v} x={px(v)} y={ALTO - ABAJO + 16} class="grafico-dist__marca" text-anchor="middle">
          {formatearNumero(v, 4, true)}
        </text>
      ))}
      <text x={IZQ - 44} y={ARRIBA - 10} class="grafico-dist__eje-rotulo">
        {discreta ? 'p' : 'f'}
        <tspan dy="3" font-size="0.75em">
          X
        </tspan>
        <tspan dy="-3">(x)</tspan>
      </text>

      {/* La distribución */}
      <g clip-path="url(#grafico-dist-area)">
        {discreta ? (
          enteros.map((k) => {
            const y = d.puntual(k, p)
            const ancho = Math.max(1.5, Math.min(26, (anchoUtil / (x1 - x0)) * 0.72))
            return (
              <rect
                key={k}
                x={px(k) - ancho / 2}
                y={py(y)}
                width={ancho}
                height={Math.max(0, py(0) - py(y))}
                class={'grafico-dist__barra' + (dentro(k) ? ' grafico-dist__barra--dentro' : '')}
              />
            )
          })
        ) : (
          <>
            {area && <path d={area} class="grafico-dist__area" />}
            <path d={curva} class="grafico-dist__curva" />
          </>
        )}
      </g>

      {/* Las manijas */}
      {manijas.map((m) => {
        if (!Number.isFinite(m.valor)) return null
        const x = px(Math.min(hi, Math.max(lo, m.valor)))
        return (
          <g
            key={m.id}
            class="grafico-dist__manija"
            tabIndex={0}
            role="slider"
            aria-label={m.rotulo}
            aria-valuenow={m.valor}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
              e.preventDefault()
              const v = m.valor + (e.key === 'ArrowRight' ? paso : -paso)
              onMover(m.id, redondear(v))
            }}
          >
            <line x1={x} x2={x} y1={ARRIBA - 6} y2={py(0)} class="grafico-dist__linea" />
            <circle cx={x} cy={py(0)} r={6} class="grafico-dist__perilla" />
            <text x={x} y={ARRIBA - 10} text-anchor="middle" class="grafico-dist__valor">
              {m.rotulo} = {formatearNumero(m.valor, Math.max(decimales, 4), true)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
