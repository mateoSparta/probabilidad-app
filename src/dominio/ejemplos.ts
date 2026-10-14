/**
 * Los ejemplos del globo de un campo de respuesta: una fracción y una cuenta
 * al azar, distintas en cada ítem, para mostrar que el campo acepta algo más
 * que un decimal. Las cuentas tienen la forma de las que salen en la materia
 * (complemento, extracciones sin reposición, probabilidad total, Poisson,
 * exponencial). Todas tienen que dar un número: lo prueba tools/smoke.ts.
 */

type Azar = () => number

const entero = (azar: Azar, min: number, max: number): number => min + Math.floor(azar() * (max - min + 1))

const mcd = (a: number, b: number): number => (b === 0 ? a : mcd(b, a % b))

/** Un numerador entre 1 y d − 1 coprimo con d (el 1 siempre lo es). */
function coprimo(azar: Azar, d: number): number {
  for (let i = 0; i < 20; i++) {
    const n = entero(azar, 1, d - 1)
    if (mcd(n, d) === 1) return n
  }
  return 1
}

/** Una fracción irreducible entre 0 y 1: "17/36". */
export function fraccionAlAzar(azar: Azar = Math.random): string {
  const d = entero(azar, 3, 60)
  return `${coprimo(azar, d)}/${d}`
}

const CUENTAS: ((azar: Azar) => string)[] = [
  // complemento: 1 - (5/6)^4
  (azar) => {
    const b = entero(azar, 3, 10)
    return `1 - (${coprimo(azar, b)}/${b})^${entero(azar, 2, 6)}`
  },
  // dos extracciones sin reposición: 4/10 * 3/9
  (azar) => {
    const b = entero(azar, 5, 12)
    const a = entero(azar, 2, b - 1)
    return `${a}/${b} * ${a - 1}/${b - 1}`
  },
  // probabilidad total: 0.3 * 0.8 + 0.7 * 0.1
  (azar) => {
    const p = entero(azar, 1, 9)
    return `0.${p} * 0.${entero(azar, 1, 9)} + 0.${10 - p} * 0.${entero(azar, 1, 9)}`
  },
  // Poisson: 2^3 * e^-2 / 3!
  (azar) => {
    const l = entero(azar, 2, 5)
    const k = entero(azar, 2, 4)
    return `${l}^${k} * e^-${l} / ${k}!`
  },
  // exponencial: 1 - e^(-3/4)
  (azar) => {
    const b = entero(azar, 2, 6)
    return `1 - e^(-${coprimo(azar, b)}/${b})`
  },
]

/** Una cuenta al azar, de alguna de las formas de CUENTAS. */
export function cuentaAlAzar(azar: Azar = Math.random): string {
  return CUENTAS[entero(azar, 0, CUENTAS.length - 1)](azar)
}

/** El texto del globo de un campo numérico, con un renglón por ejemplo. */
export function ayudaCampoNumerico(azar: Azar = Math.random): string {
  return [
    'Acepta fracciones y expresiones compuestas.',
    'Ejemplos:',
    `• ${fraccionAlAzar(azar)}`,
    `• ${cuentaAlAzar(azar)}`,
  ].join('\n')
}
