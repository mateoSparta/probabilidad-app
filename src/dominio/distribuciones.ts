/**
 * Las distribuciones del curso, las de la tabla de la cátedra
 * (fuentes/teoria/probabilidad_distribuciones.pdf), como funciones: función
 * de probabilidad o densidad, función de distribución, cuantiles, esperanza
 * y varianza. Los textos de cada ficha son contenido y viven en
 * content/distribuciones.yaml; acá está sólo la cuenta.
 *
 * Las funciones especiales (gamma, gamma y beta incompletas) están escritas
 * a mano, sin dependencias. tools/verify/distribuciones.py calcula con mpmath
 * una grilla de valores de referencia y tools/smoke.ts exige que esto
 * coincida con ella: ningún valor de la calculadora queda sin contrastar.
 *
 * Lógica pura, sin navegador.
 */

// ------------------------------------------------- funciones especiales

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
]

/** ln Γ(x), por la aproximación de Lanczos (g = 7) y la reflexión para x < 1/2. */
export function lnGamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lnGamma(1 - x)
  const z = x - 1
  let a = LANCZOS[0]
  const t = z + 7.5
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (z + i)
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a)
}

export const gamma = (x: number) => Math.exp(lnGamma(x))

/** ln del número combinatorio, para no desbordar con n grande. */
export const lnComb = (n: number, k: number) => lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1)

const MINIMO = 1e-300
const EPS = 1e-16

/** P(a, x) por su serie; converge rápido si x < a + 1. */
function gammaSerie(a: number, x: number): number {
  let ap = a
  let del = 1 / a
  let suma = del
  for (let n = 0; n < 1000; n++) {
    ap++
    del *= x / ap
    suma += del
    if (Math.abs(del) < Math.abs(suma) * EPS) break
  }
  return suma * Math.exp(-x + a * Math.log(x) - lnGamma(a))
}

/** Q(a, x) por fracción continua (método de Lentz); converge si x ≥ a + 1. */
function gammaFraccion(a: number, x: number): number {
  let b = x + 1 - a
  let c = 1 / MINIMO
  let d = 1 / b
  let h = d
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < MINIMO) d = MINIMO
    c = b + an / c
    if (Math.abs(c) < MINIMO) c = MINIMO
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < EPS) break
  }
  return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h
}

/** Gamma incompleta inferior regularizada, P(a, x). */
export function gammaP(a: number, x: number): number {
  if (x <= 0) return 0
  return x < a + 1 ? gammaSerie(a, x) : 1 - gammaFraccion(a, x)
}

/** Gamma incompleta superior regularizada, Q(a, x) = 1 − P(a, x), precisa en la cola. */
export function gammaQ(a: number, x: number): number {
  if (x <= 0) return 1
  return x < a + 1 ? 1 - gammaSerie(a, x) : gammaFraccion(a, x)
}

function betaFraccion(a: number, b: number, x: number): number {
  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  let c = 1
  let d = 1 - (qab * x) / qap
  if (Math.abs(d) < MINIMO) d = MINIMO
  d = 1 / d
  let h = d
  for (let m = 1; m <= 2000; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < MINIMO) d = MINIMO
    c = 1 + aa / c
    if (Math.abs(c) < MINIMO) c = MINIMO
    d = 1 / d
    h *= d * c
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < MINIMO) d = MINIMO
    c = 1 + aa / c
    if (Math.abs(c) < MINIMO) c = MINIMO
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < EPS) break
  }
  return h
}

/** Beta incompleta regularizada, I_x(a, b). */
export function betaI(a: number, b: number, x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x))
  return x < (a + 1) / (a + b + 2)
    ? (bt * betaFraccion(a, b, x)) / a
    : 1 - (bt * betaFraccion(b, a, 1 - x)) / b
}

/** Densidad normal estándar. */
export const phi = (z: number) => Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI)

/** Φ(z), con la gamma incompleta: precisa también en la cola izquierda. */
export function Phi(z: number): number {
  const q = gammaQ(0.5, (z * z) / 2) / 2
  return z < 0 ? q : 1 - q
}

// ------------------------------------------------------------ el modelo

export type Valores = Record<string, number>

export type Parametro = {
  id: string
  /** LaTeX del símbolo, como en la tabla de la cátedra. */
  tex: string
  entero?: boolean
  min?: number
  max?: number
  /** Si el extremo no se incluye: p ∈ (0, 1), λ > 0. */
  minAbierto?: boolean
  maxAbierto?: boolean
  defecto: number
}

/** Una esperanza o una varianza: un número, infinita, o que no existe. */
export type Momento = number | 'infinita' | 'no existe'

export type Univariada = {
  id: string
  tipo: 'discreta' | 'continua'
  parametros: Parametro[]
  /** Restricciones entre parámetros (a < b, d ≤ N): el mensaje, o null. */
  restriccion?: (p: Valores) => string | null
  /** Extremos del soporte; pueden ser infinitos. */
  soporte: (p: Valores) => [number, number]
  /** p_X(x) en las discretas, f_X(x) en las continuas. */
  puntual: (x: number, p: Valores) => number
  /** F_X(x) = P(X ≤ x). */
  distribucion: (x: number, p: Valores) => number
  /** El cuantil en forma cerrada, cuando la hay. */
  cuantilCerrado?: (alfa: number, p: Valores) => number
  esperanza: (p: Valores) => Momento
  varianza: (p: Valores) => Momento
  /** Cuánta probabilidad dejar afuera del gráfico en cada cola (colas pesadas, más). */
  colaGrafico?: (p: Valores) => number
}

const P01: Omit<Parametro, 'id' | 'tex' | 'defecto'> = { min: 0, max: 1, minAbierto: true, maxAbierto: true }
const POSITIVO: Omit<Parametro, 'id' | 'tex' | 'defecto'> = { min: 0, minAbierto: true }
const NATURAL: Omit<Parametro, 'id' | 'tex' | 'defecto'> = { entero: true, min: 1 }

const piso = Math.floor

export const UNIVARIADAS: Univariada[] = [
  // ------------------------------------------------------------ discretas
  {
    id: 'bernoulli',
    tipo: 'discreta',
    parametros: [{ id: 'p', tex: 'p', ...P01, defecto: 0.3 }],
    soporte: () => [0, 1],
    puntual: (x, { p }) => (x === 0 ? 1 - p : x === 1 ? p : 0),
    distribucion: (x, { p }) => (x < 0 ? 0 : x < 1 ? 1 - p : 1),
    esperanza: ({ p }) => p,
    varianza: ({ p }) => p * (1 - p),
  },
  {
    id: 'binomial',
    tipo: 'discreta',
    parametros: [
      { id: 'n', tex: 'n', ...NATURAL, max: 2000, defecto: 10 },
      { id: 'p', tex: 'p', ...P01, defecto: 0.3 },
    ],
    soporte: ({ n }) => [0, n],
    puntual: (x, { n, p }) =>
      x < 0 || x > n || !Number.isInteger(x)
        ? 0
        : Math.exp(lnComb(n, x) + x * Math.log(p) + (n - x) * Math.log(1 - p)),
    distribucion: (x, { n, p }) => {
      const k = piso(x)
      if (k < 0) return 0
      if (k >= n) return 1
      return betaI(n - k, k + 1, 1 - p)
    },
    esperanza: ({ n, p }) => n * p,
    varianza: ({ n, p }) => n * p * (1 - p),
  },
  {
    id: 'geometrica',
    tipo: 'discreta',
    parametros: [{ id: 'p', tex: 'p', ...P01, defecto: 0.25 }],
    soporte: () => [1, Infinity],
    puntual: (x, { p }) => (x < 1 || !Number.isInteger(x) ? 0 : (1 - p) ** (x - 1) * p),
    distribucion: (x, { p }) => (x < 1 ? 0 : 1 - (1 - p) ** piso(x)),
    cuantilCerrado: (alfa, { p }) => Math.max(1, Math.ceil(Math.log(1 - alfa) / Math.log(1 - p) - 1e-12)),
    esperanza: ({ p }) => 1 / p,
    varianza: ({ p }) => (1 - p) / (p * p),
  },
  {
    id: 'pascal',
    tipo: 'discreta',
    parametros: [
      { id: 'k', tex: 'k', ...NATURAL, max: 500, defecto: 3 },
      { id: 'p', tex: 'p', ...P01, defecto: 0.4 },
    ],
    soporte: ({ k }) => [k, Infinity],
    puntual: (x, { k, p }) =>
      x < k || !Number.isInteger(x)
        ? 0
        : Math.exp(lnComb(x - 1, k - 1) + k * Math.log(p) + (x - k) * Math.log(1 - p)),
    // P(N ≤ n) es la probabilidad de al menos k éxitos en n ensayos.
    distribucion: (x, { k, p }) => (x < k ? 0 : betaI(k, piso(x) - k + 1, p)),
    esperanza: ({ k, p }) => k / p,
    varianza: ({ k, p }) => (k * (1 - p)) / (p * p),
  },
  {
    id: 'poisson',
    tipo: 'discreta',
    parametros: [{ id: 'mu', tex: '\\mu', ...POSITIVO, max: 1e4, defecto: 4 }],
    soporte: () => [0, Infinity],
    puntual: (x, { mu }) =>
      x < 0 || !Number.isInteger(x) ? 0 : Math.exp(-mu + x * Math.log(mu) - lnGamma(x + 1)),
    distribucion: (x, { mu }) => (x < 0 ? 0 : gammaQ(piso(x) + 1, mu)),
    esperanza: ({ mu }) => mu,
    varianza: ({ mu }) => mu,
  },
  {
    id: 'hipergeometrica',
    tipo: 'discreta',
    parametros: [
      { id: 'N', tex: 'N', ...NATURAL, max: 5000, defecto: 20 },
      { id: 'd', tex: 'd', entero: true, min: 0, max: 5000, defecto: 7 },
      { id: 'n', tex: 'n', ...NATURAL, max: 5000, defecto: 5 },
    ],
    restriccion: ({ N, d, n }) =>
      d > N ? 'Tiene que ser $d \\le N$.' : n > N ? 'Tiene que ser $n \\le N$.' : null,
    soporte: ({ N, d, n }) => [Math.max(0, d + n - N), Math.min(n, d)],
    puntual: (x, { N, d, n }) => {
      const [m, M] = [Math.max(0, d + n - N), Math.min(n, d)]
      if (x < m || x > M || !Number.isInteger(x)) return 0
      return Math.exp(lnComb(d, x) + lnComb(N - d, n - x) - lnComb(N, n))
    },
    distribucion(x, p) {
      const [m, M] = this.soporte(p)
      if (x < m) return 0
      if (x >= M) return 1
      let suma = 0
      for (let k = m; k <= piso(x); k++) suma += this.puntual(k, p)
      return Math.min(1, suma)
    },
    esperanza: ({ N, d, n }) => (n * d) / N,
    varianza: ({ N, d, n }) => (N === 1 ? 0 : (n * d * (N - d) * (N - n)) / (N * N * (N - 1))),
  },

  // ------------------------------------------------------------ continuas
  {
    id: 'uniforme',
    tipo: 'continua',
    parametros: [
      { id: 'a', tex: 'a', defecto: 0 },
      { id: 'b', tex: 'b', defecto: 1 },
    ],
    restriccion: ({ a, b }) => (a >= b ? 'Tiene que ser $a < b$.' : null),
    soporte: ({ a, b }) => [a, b],
    puntual: (x, { a, b }) => (x < a || x > b ? 0 : 1 / (b - a)),
    distribucion: (x, { a, b }) => (x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a)),
    cuantilCerrado: (alfa, { a, b }) => a + alfa * (b - a),
    esperanza: ({ a, b }) => (a + b) / 2,
    varianza: ({ a, b }) => (b - a) ** 2 / 12,
  },
  {
    id: 'exponencial',
    tipo: 'continua',
    parametros: [{ id: 'lambda', tex: '\\lambda', ...POSITIVO, defecto: 1 }],
    soporte: () => [0, Infinity],
    puntual: (x, { lambda }) => (x < 0 ? 0 : lambda * Math.exp(-lambda * x)),
    distribucion: (x, { lambda }) => (x <= 0 ? 0 : -Math.expm1(-lambda * x)),
    cuantilCerrado: (alfa, { lambda }) => -Math.log1p(-alfa) / lambda,
    esperanza: ({ lambda }) => 1 / lambda,
    varianza: ({ lambda }) => 1 / (lambda * lambda),
  },
  {
    id: 'gamma',
    tipo: 'continua',
    parametros: [
      { id: 'nu', tex: '\\nu', ...POSITIVO, defecto: 3 },
      { id: 'lambda', tex: '\\lambda', ...POSITIVO, defecto: 1 },
    ],
    soporte: () => [0, Infinity],
    puntual: (x, { nu, lambda }) =>
      x < 0 || (x === 0 && nu > 1)
        ? 0
        : x === 0
          ? nu === 1
            ? lambda
            : Infinity
          : Math.exp(nu * Math.log(lambda) - lnGamma(nu) + (nu - 1) * Math.log(x) - lambda * x),
    distribucion: (x, { nu, lambda }) => gammaP(nu, lambda * x),
    esperanza: ({ nu, lambda }) => nu / lambda,
    varianza: ({ nu, lambda }) => nu / (lambda * lambda),
  },
  {
    id: 'normal',
    tipo: 'continua',
    parametros: [
      { id: 'mu', tex: '\\mu', defecto: 0 },
      { id: 'sigma2', tex: '\\sigma^2', ...POSITIVO, defecto: 1 },
    ],
    soporte: () => [-Infinity, Infinity],
    puntual: (x, { mu, sigma2 }) => phi((x - mu) / Math.sqrt(sigma2)) / Math.sqrt(sigma2),
    distribucion: (x, { mu, sigma2 }) => Phi((x - mu) / Math.sqrt(sigma2)),
    esperanza: ({ mu }) => mu,
    varianza: ({ sigma2 }) => sigma2,
  },
  {
    id: 'chi2',
    tipo: 'continua',
    parametros: [{ id: 'k', tex: 'k', ...NATURAL, max: 1000, defecto: 4 }],
    soporte: () => [0, Infinity],
    puntual: (x, { k }) =>
      x < 0
        ? 0
        : x === 0
          ? k === 2
            ? 0.5
            : k < 2
              ? Infinity
              : 0
          : Math.exp(-(k / 2) * Math.LN2 - lnGamma(k / 2) + (k / 2 - 1) * Math.log(x) - x / 2),
    distribucion: (x, { k }) => gammaP(k / 2, x / 2),
    esperanza: ({ k }) => k,
    varianza: ({ k }) => 2 * k,
  },
  {
    id: 't',
    tipo: 'continua',
    parametros: [{ id: 'nu', tex: '\\nu', ...POSITIVO, defecto: 5 }],
    soporte: () => [-Infinity, Infinity],
    puntual: (x, { nu }) =>
      Math.exp(lnGamma((nu + 1) / 2) - lnGamma(nu / 2) - 0.5 * Math.log(nu * Math.PI) - ((nu + 1) / 2) * Math.log1p((x * x) / nu)),
    // Cerca de 0, ν/(ν + x²) se redondea a 1 y se pierde precisión: ahí se usa
    // la forma complementaria, con x²/(ν + x²).
    distribucion: (x, { nu }) => {
      const x2 = x * x
      if (x2 < nu) {
        const centro = betaI(0.5, nu / 2, x2 / (nu + x2)) / 2
        return x >= 0 ? 0.5 + centro : 0.5 - centro
      }
      const cola = betaI(nu / 2, 0.5, nu / (nu + x2)) / 2
      return x >= 0 ? 1 - cola : cola
    },
    esperanza: ({ nu }) => (nu > 1 ? 0 : 'no existe'),
    varianza: ({ nu }) => (nu > 2 ? nu / (nu - 2) : nu > 1 ? 'infinita' : 'no existe'),
    colaGrafico: ({ nu }) => (nu < 3 ? 0.02 : 0.001),
  },
  {
    id: 'weibull',
    tipo: 'continua',
    parametros: [
      { id: 'c', tex: 'c', ...POSITIVO, defecto: 2 },
      { id: 'alfa', tex: '\\alpha', ...POSITIVO, defecto: 1 },
    ],
    soporte: () => [0, Infinity],
    puntual: (x, { c, alfa }) =>
      x < 0 ? 0 : x === 0 ? (c === 1 ? 1 / alfa : c < 1 ? Infinity : 0) : (c / alfa) * (x / alfa) ** (c - 1) * Math.exp(-((x / alfa) ** c)),
    distribucion: (x, { c, alfa }) => (x <= 0 ? 0 : -Math.expm1(-((x / alfa) ** c))),
    cuantilCerrado: (q, { c, alfa }) => alfa * (-Math.log1p(-q)) ** (1 / c),
    esperanza: ({ c, alfa }) => alfa * gamma(1 + 1 / c),
    varianza: ({ c, alfa }) => alfa * alfa * (gamma(1 + 2 / c) - gamma(1 + 1 / c) ** 2),
  },
  {
    id: 'rayleigh',
    tipo: 'continua',
    parametros: [{ id: 'sigma', tex: '\\sigma', ...POSITIVO, defecto: 1 }],
    soporte: () => [0, Infinity],
    puntual: (x, { sigma }) => (x < 0 ? 0 : (x / (sigma * sigma)) * Math.exp(-(x * x) / (2 * sigma * sigma))),
    distribucion: (x, { sigma }) => (x <= 0 ? 0 : -Math.expm1(-(x * x) / (2 * sigma * sigma))),
    cuantilCerrado: (alfa, { sigma }) => sigma * Math.sqrt(-2 * Math.log1p(-alfa)),
    esperanza: ({ sigma }) => sigma * Math.sqrt(Math.PI / 2),
    varianza: ({ sigma }) => ((4 - Math.PI) / 2) * sigma * sigma,
  },
  {
    id: 'pareto',
    tipo: 'continua',
    parametros: [
      { id: 'm', tex: 'm', ...POSITIVO, defecto: 1 },
      { id: 'alfa', tex: '\\alpha', ...POSITIVO, defecto: 3 },
    ],
    soporte: ({ m }) => [m, Infinity],
    puntual: (x, { m, alfa }) => (x < m ? 0 : (alfa * m ** alfa) / x ** (alfa + 1)),
    distribucion: (x, { m, alfa }) => (x <= m ? 0 : 1 - (m / x) ** alfa),
    cuantilCerrado: (q, { m, alfa }) => m / (1 - q) ** (1 / alfa),
    esperanza: ({ m, alfa }) => (alfa > 1 ? (alfa * m) / (alfa - 1) : 'infinita'),
    varianza: ({ m, alfa }) => (alfa > 2 ? (m * m * alfa) / ((alfa - 1) ** 2 * (alfa - 2)) : 'infinita'),
    colaGrafico: () => 0.02,
  },
  {
    id: 'beta',
    tipo: 'continua',
    parametros: [
      { id: 'a', tex: 'a', ...POSITIVO, defecto: 2 },
      { id: 'b', tex: 'b', ...POSITIVO, defecto: 5 },
    ],
    soporte: () => [0, 1],
    puntual: (x, { a, b }) =>
      x < 0 || x > 1
        ? 0
        : (x === 0 && a < 1) || (x === 1 && b < 1)
          ? Infinity
          : Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)),
    distribucion: (x, { a, b }) => betaI(a, b, x),
    esperanza: ({ a, b }) => a / (a + b),
    varianza: ({ a, b }) => (a * b) / ((a + b) ** 2 * (a + b + 1)),
  },
  {
    id: 'cauchy',
    tipo: 'continua',
    parametros: [
      { id: 'x0', tex: 'x_0', defecto: 0 },
      { id: 'gamma', tex: '\\gamma', ...POSITIVO, defecto: 1 },
    ],
    soporte: () => [-Infinity, Infinity],
    puntual: (x, { x0, gamma: g }) => g / (Math.PI * ((x - x0) ** 2 + g * g)),
    distribucion: (x, { x0, gamma: g }) => 0.5 + Math.atan((x - x0) / g) / Math.PI,
    cuantilCerrado: (alfa, { x0, gamma: g }) => x0 + g * Math.tan(Math.PI * (alfa - 0.5)),
    esperanza: () => 'no existe',
    varianza: () => 'no existe',
    colaGrafico: () => 0.03,
  },
]

export const univariadaPorId = new Map(UNIVARIADAS.map((d) => [d.id, d]))

// ------------------------------------------------------------ parámetros

/** El mensaje de error de un parámetro, o null si el valor sirve. */
export function errorParametro(p: Parametro, v: number): string | null {
  if (!Number.isFinite(v)) return 'Tiene que ser un número.'
  if (p.entero && !Number.isInteger(v)) return 'Tiene que ser un entero.'
  if (p.min !== undefined && (p.minAbierto ? v <= p.min : v < p.min)) {
    return p.minAbierto ? `Tiene que ser mayor que ${p.min}.` : `Tiene que ser al menos ${p.min}.`
  }
  if (p.max !== undefined && (p.maxAbierto ? v >= p.max : v > p.max)) {
    return p.maxAbierto ? `Tiene que ser menor que ${p.max}.` : `Tiene que ser a lo sumo ${p.max}.`
  }
  return null
}

export const valoresPorDefecto = (d: { parametros: Parametro[] }): Valores =>
  Object.fromEntries(d.parametros.map((p) => [p.id, p.defecto]))

// ------------------------------------------------------------ eventos

export type Evento =
  | { tipo: 'menor'; x: number }
  | { tipo: 'mayor'; x: number }
  | { tipo: 'entre'; a: number; b: number }
  | { tipo: 'igual'; x: number }

/**
 * La probabilidad de un evento. En las discretas se cuentan los extremos
 * (P(X ≥ x), P(a ≤ X ≤ b)); en las continuas da lo mismo, y se usa
 * P(X > x) y P(a < X < b).
 */
export function probabilidad(d: Univariada, p: Valores, e: Evento): number {
  const F = (x: number) => d.distribucion(x, p)
  const discreta = d.tipo === 'discreta'
  switch (e.tipo) {
    case 'menor':
      return F(e.x)
    case 'mayor':
      return discreta ? 1 - F(Math.ceil(e.x) - 1) : 1 - F(e.x)
    case 'entre':
      if (e.b < e.a) return 0
      return discreta ? F(e.b) - F(Math.ceil(e.a) - 1) : F(e.b) - F(e.a)
    case 'igual':
      return discreta ? d.puntual(e.x, p) : 0
  }
}

/**
 * El cuantil α: el menor x con F(x) ≥ α. En las continuas se busca por
 * bisección (o con la forma cerrada, si la hay); en las discretas, entre los
 * enteros del soporte.
 */
export function cuantil(d: Univariada, p: Valores, alfa: number): number {
  if (d.cuantilCerrado) return d.cuantilCerrado(alfa, p)
  const [s0, s1] = d.soporte(p)
  const F = (x: number) => d.distribucion(x, p)

  if (d.tipo === 'discreta') {
    let lo = s0
    if (F(lo) >= alfa) return lo
    let paso = 1
    let hi = lo + paso
    while (hi < s1 && F(hi) < alfa) {
      lo = hi
      paso *= 2
      hi = lo + paso
    }
    hi = Math.min(hi, s1)
    // Invariante: F(lo) < α ≤ F(hi).
    while (hi - lo > 1) {
      const m = Math.floor((lo + hi) / 2)
      if (F(m) >= alfa) hi = m
      else lo = m
    }
    return hi
  }

  let lo = Number.isFinite(s0) ? s0 : -1
  let hi = Number.isFinite(s1) ? s1 : 1
  for (let ancho = 1; !Number.isFinite(s0) && F(lo) > alfa; ancho *= 2) lo -= ancho
  for (let ancho = 1; !Number.isFinite(s1) && F(hi) < alfa; ancho *= 2) hi += ancho
  for (let i = 0; i < 200 && hi - lo > 1e-14 * Math.max(1, Math.abs(lo) + Math.abs(hi)); i++) {
    const m = (lo + hi) / 2
    if (F(m) >= alfa) hi = m
    else lo = m
  }
  return (lo + hi) / 2
}

/** El intervalo que conviene graficar: casi toda la probabilidad, dentro del soporte. */
export function rangoGrafico(d: Univariada, p: Valores): [number, number] {
  const [s0, s1] = d.soporte(p)
  const cola = d.colaGrafico?.(p) ?? 0.0005
  let lo = Number.isFinite(s0) ? s0 : cuantil(d, p, cola)
  let hi = Number.isFinite(s1) ? s1 : cuantil(d, p, 1 - cola)
  if (d.tipo === 'continua' && Number.isFinite(s0) && !Number.isFinite(s1)) lo = s0
  if (d.tipo === 'discreta') {
    lo = Math.max(s0, cuantil(d, p, cola))
    hi = Math.min(s1, cuantil(d, p, 1 - cola))
    if (hi - lo < 4) hi = Math.min(s1, lo + 4)
  }
  if (hi <= lo) hi = lo + 1
  return [lo, hi]
}

// --------------------------------------------------------- multivariadas

/** P(X = x) de una multinomial con n ensayos y probabilidades ps. */
export function multinomial(n: number, ps: readonly number[], xs: readonly number[]): number {
  if (xs.length !== ps.length || xs.some((x) => x < 0 || !Number.isInteger(x))) return 0
  if (xs.reduce((s, x) => s + x, 0) !== n) return 0
  let ln = lnGamma(n + 1)
  for (let i = 0; i < xs.length; i++) {
    ln -= lnGamma(xs[i] + 1)
    if (xs[i] > 0) ln += xs[i] * Math.log(ps[i])
  }
  return Math.exp(ln)
}

export type Bivariada = { mu1: number; mu2: number; s1: number; s2: number; rho: number }

/** Densidad de la normal bivariada (s1 y s2 son los desvíos). */
export function densidadBivariada(x: number, y: number, b: Bivariada): number {
  const u = (x - b.mu1) / b.s1
  const v = (y - b.mu2) / b.s2
  const q = (u * u - 2 * b.rho * u * v + v * v) / (1 - b.rho * b.rho)
  return Math.exp(-q / 2) / (2 * Math.PI * b.s1 * b.s2 * Math.sqrt(1 - b.rho * b.rho))
}

/**
 * P(X₁ ≤ a, X₂ ≤ b) de la normal bivariada. Condicionando a X₁, queda una
 * integral en una variable, ∫ φ(u) Φ((k − ρu)/√(1 − ρ²)) du hasta h, que se
 * calcula por Simpson.
 */
export function distribucionBivariada(a: number, bb: number, b: Bivariada): number {
  const h = (a - b.mu1) / b.s1
  const k = (bb - b.mu2) / b.s2
  const r = Math.sqrt(1 - b.rho * b.rho)
  const desde = -10
  if (h <= desde) return 0
  const n = 4000
  const paso = (h - desde) / n
  const f = (u: number) => phi(u) * Phi((k - b.rho * u) / r)
  let suma = f(desde) + f(h)
  for (let i = 1; i < n; i++) suma += (i % 2 ? 4 : 2) * f(desde + i * paso)
  return Math.min(1, Math.max(0, (suma * paso) / 3))
}

/** Los parámetros de X₂ | X₁ = x₁: media y desvío. */
export function condicionalBivariada(x1: number, b: Bivariada): { media: number; desvio: number } {
  return {
    media: b.mu2 + (b.rho * b.s2 * (x1 - b.mu1)) / b.s1,
    desvio: b.s2 * Math.sqrt(1 - b.rho * b.rho),
  }
}
