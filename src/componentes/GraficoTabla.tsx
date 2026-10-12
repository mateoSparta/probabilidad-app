/**
 * El gráfico que encabeza cada tabla, como en las de la cátedra
 * (fuentes/teoria/Tablas.pdf): la densidad, el área que acumula la tabla
 * sombreada, una línea punteada en el valor buscado y los rótulos.
 *
 * Las curvas se calculan (no son imágenes), con parámetros elegidos para que
 * se parezcan a las del PDF: la t con 3 grados de libertad, para que se vean
 * las colas pesadas, y la chi cuadrado con 4, para que se vea la asimetría.
 * Los rótulos son KaTeX en una capa encima del SVG.
 */
import { Mate } from './Mate'

type Tipo = 'normal' | 't' | 'chi2'

const ANCHO = 340
const ALTO = 140
const EJE_Y = 118 // altura del eje horizontal, en el sistema del SVG

type Config = {
  densidad: (x: number) => number
  desde: number
  hasta: number
  /** Hasta dónde se sombrea: el valor de la línea punteada. */
  corte: number
  /** Dónde va el eje vertical, en unidades de x. */
  ejeVertical: number
  rotuloVariable: string
  rotuloArea: string
  rotuloCorte: string
  /** Posición de los rótulos, en fracción del ancho y del alto. */
  posVariable: [number, number]
  posArea: [number, number]
}

const normal = (x: number) => Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI)
// t con 3 grados de libertad: 2 / (π √3 (1 + x²/3)²).
const t3 = (x: number) => 2 / (Math.PI * Math.sqrt(3) * (1 + (x * x) / 3) ** 2)
// Chi cuadrado con 4 grados de libertad: x e^{-x/2} / 4.
const chi4 = (x: number) => (x <= 0 ? 0 : (x * Math.exp(-x / 2)) / 4)

const CONFIGS: Record<Tipo, Config> = {
  normal: {
    densidad: normal,
    desde: -3.6,
    hasta: 3.6,
    corte: 0.85,
    ejeVertical: 0,
    rotuloVariable: '$Z \\sim N(0, 1)$',
    rotuloArea: '$\\Phi(z) = P(Z \\le z)$',
    rotuloCorte: '$z$',
    posVariable: [0.17, 0.36],
    posArea: [0.76, 0.3],
  },
  t: {
    densidad: t3,
    desde: -5,
    hasta: 5,
    corte: 0.95,
    ejeVertical: 0,
    rotuloVariable: '$T \\sim t_\\nu$',
    rotuloArea: '$P(T \\le k_\\alpha) = \\alpha$',
    rotuloCorte: '$k_\\alpha$',
    posVariable: [0.17, 0.4],
    posArea: [0.77, 0.36],
  },
  chi2: {
    densidad: chi4,
    desde: 0,
    hasta: 15,
    corte: 7,
    ejeVertical: 0,
    rotuloVariable: '$X \\sim \\chi^2_\\nu$',
    rotuloArea: '$P(X \\le k_\\alpha) = \\alpha$',
    rotuloCorte: '$k_\\alpha$',
    posVariable: [0.2, 0.12],
    posArea: [0.6, 0.22],
  },
}

export function GraficoTabla({ tipo }: { tipo: Tipo }) {
  const c = CONFIGS[tipo]
  const margenX = tipo === 'chi2' ? 26 : 16
  const ancho = ANCHO - 2 * margenX
  const maximo = Math.max(...Array.from({ length: 200 }, (_, i) => c.densidad(c.desde + ((c.hasta - c.desde) * i) / 199)))
  const px = (x: number) => margenX + ((x - c.desde) / (c.hasta - c.desde)) * ancho
  const py = (y: number) => EJE_Y - (y / maximo) * (EJE_Y - 22)

  const puntos = Array.from({ length: 241 }, (_, i) => {
    const x = c.desde + ((c.hasta - c.desde) * i) / 240
    return [px(x), py(c.densidad(x))] as const
  })
  const curva = puntos.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const sombreados = puntos.filter(([x]) => x <= px(c.corte))
  const area =
    `M${px(c.desde).toFixed(1)},${EJE_Y} ` +
    sombreados.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
    ` L${px(c.corte).toFixed(1)},${py(c.densidad(c.corte)).toFixed(1)} L${px(c.corte).toFixed(1)},${EJE_Y} Z`

  const xEje = px(c.ejeVertical)
  const xCorte = px(c.corte)
  const yCorte = py(c.densidad(c.corte))
  // La flecha va del rótulo del área hacia adentro del área sombreada.
  const [ax, ay] = [c.posArea[0] * ANCHO - 22, c.posArea[1] * ALTO + 10]
  const [bx, by] = [xCorte - 26, (yCorte + EJE_Y) / 2 - 4]

  return (
    <div class="grafico-tabla" role="img" aria-label="Gráfico de la distribución">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} aria-hidden="true">
        <defs>
          <marker id={`punta-${tipo}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" class="grafico-tabla__punta" />
          </marker>
        </defs>
        <path d={area} class="grafico-tabla__area" />
        <path d={curva} class="grafico-tabla__curva" />
        <line x1={xCorte} y1={EJE_Y} x2={xCorte} y2={yCorte} class="grafico-tabla__corte" />
        <line x1={6} y1={EJE_Y} x2={ANCHO - 6} y2={EJE_Y} class="grafico-tabla__eje" marker-end={`url(#punta-${tipo})`} />
        <line x1={xEje} y1={EJE_Y + 8} x2={xEje} y2={6} class="grafico-tabla__eje" marker-end={`url(#punta-${tipo})`} />
        <path
          d={`M${ax},${ay} Q${(ax + bx) / 2 + 10},${(ay + by) / 2 - 10} ${bx},${by}`}
          class="grafico-tabla__flecha"
          marker-end={`url(#punta-${tipo})`}
        />
      </svg>
      <span class="grafico-tabla__rotulo" style={{ left: `${c.posVariable[0] * 100}%`, top: `${c.posVariable[1] * 100}%` }}>
        <Mate>{c.rotuloVariable}</Mate>
      </span>
      <span class="grafico-tabla__rotulo" style={{ left: `${c.posArea[0] * 100}%`, top: `${c.posArea[1] * 100}%` }}>
        <Mate>{c.rotuloArea}</Mate>
      </span>
      <span
        class="grafico-tabla__rotulo grafico-tabla__rotulo--corte"
        style={{ left: `${(xCorte / ANCHO) * 100}%`, top: `${((EJE_Y + 11) / ALTO) * 100}%` }}
      >
        <Mate>{c.rotuloCorte}</Mate>
      </span>
    </div>
  )
}
