/**
 * Evaluación de respuestas (PLAN.md §4.4).
 *
 * Todo pasa por math.js, así que el alumno puede escribir el resultado como
 * le salga: `47/120`, `0.3917`, `1 - (5/6)^4`, `16 e^-8`. Comparar números y
 * no cadenas es lo que permite no pedir una forma canónica.
 */
import { compile, evaluate } from 'mathjs'

import type {
  RespuestaCheckpoints,
  RespuestaExpresion,
  RespuestaNumerica,
  RespuestaOpcion,
} from './tipos'

export const TOL_REL_POR_DEFECTO = 0.01

/** Tolerancia de la comparación punto a punto de una expresión. */
const TOL_EXPRESION = 1e-6
const PUNTOS_EXPRESION = 6

export type Veredicto =
  | { ok: true }
  | { ok: false; motivo: 'incorrecto' | 'no_parsea' | 'vacio'; detalle?: string }

export const CORRECTO: Veredicto = { ok: true }

/**
 * Normaliza la entrada del alumno.
 *
 * En es-AR el separador decimal es la coma, pero en math.js la coma separa
 * argumentos. Se la convierte en punto sólo cuando no puede ser un separador
 * de argumentos, o sea cuando no hay paréntesis en la expresión.
 */
export function normalizar(entrada: string): string {
  const t = entrada.trim()
  if (!t.includes('(') && (t.match(/,/g) ?? []).length === 1) {
    return t.replace(',', '.')
  }
  return t
}

/** Lleva lo que devuelve math.js a un number, o null si no es un escalar. */
function aNumero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'object' && v !== null && 'toNumber' in v) {
    try {
      const n = (v as { toNumber(): number }).toNumber()
      return Number.isFinite(n) ? n : null
    } catch {
      return null
    }
  }
  return null
}

/** Evalúa una expresión escalar sin variables libres. */
export function evaluarEscalar(expr: string): number | null {
  try {
    return aNumero(evaluate(normalizar(expr)))
  } catch {
    return null
  }
}

/**
 * Comparación con tolerancia relativa (PLAN.md §4.4): es correcta si
 * |x − v| ≤ tol·|v|. Relativa y no absoluta para no aceptar 0 cuando el
 * valor esperado es muy chico. Si el valor esperado es 0, la tolerancia
 * pasa a ser absoluta porque no hay escala contra la que medir.
 */
export function cerca(x: number, v: number, tol = TOL_REL_POR_DEFECTO): boolean {
  const margen = v === 0 ? tol : tol * Math.abs(v)
  return Math.abs(x - v) <= margen
}

// ------------------------------------------------------------- numérica

export function evaluarNumerica(entrada: string, r: RespuestaNumerica): Veredicto {
  if (!entrada.trim()) return { ok: false, motivo: 'vacio' }

  const x = evaluarEscalar(entrada)
  if (x === null) {
    return { ok: false, motivo: 'no_parsea', detalle: 'No se pudo interpretar la respuesta como un número.' }
  }

  const v = evaluarEscalar(r.valor)
  if (v === null) {
    // Es un error de contenido, no del alumno: lo tendría que haber
    // atajado `npm run check`.
    return { ok: false, motivo: 'no_parsea', detalle: `El valor esperado no parsea: ${r.valor}` }
  }

  return cerca(x, v, r.tol_rel ?? TOL_REL_POR_DEFECTO) ? CORRECTO : { ok: false, motivo: 'incorrecto' }
}

// ------------------------------------------------------------ expresión

/**
 * Compara dos expresiones evaluándolas en puntos al azar dentro del rango
 * declarado de cada variable. Con 6 puntos y tolerancia 1e-6 alcanza para
 * distinguir expresiones distintas sin pedir una forma canónica.
 */
export function evaluarExpresion(entrada: string, r: RespuestaExpresion): Veredicto {
  if (!entrada.trim()) return { ok: false, motivo: 'vacio' }

  let dado, esperado
  try {
    dado = compile(normalizar(entrada))
    esperado = compile(r.valor)
  } catch {
    return { ok: false, motivo: 'no_parsea', detalle: 'No se pudo interpretar la expresión.' }
  }

  const nombres = Object.keys(r.vars)
  const tol = r.tol_rel ?? TOL_EXPRESION

  for (let i = 0; i < PUNTOS_EXPRESION; i++) {
    const punto: Record<string, number> = {}
    for (const n of nombres) {
      const [a, b] = r.vars[n]
      punto[n] = a + Math.random() * (b - a)
    }
    let x: number | null, v: number | null
    try {
      x = aNumero(dado.evaluate(punto))
      v = aNumero(esperado.evaluate(punto))
    } catch {
      return { ok: false, motivo: 'no_parsea', detalle: 'La expresión no puede evaluarse en todo el rango de las variables.' }
    }
    if (x === null || v === null) return { ok: false, motivo: 'incorrecto' }
    if (!cerca(x, v, tol)) return { ok: false, motivo: 'incorrecto' }
  }
  return CORRECTO
}

// --------------------------------------------------------------- opción

export type VeredictoOpcion = Veredicto & { error_tipico?: string }

export function evaluarOpcion(id: string, r: RespuestaOpcion): VeredictoOpcion {
  const elegida = r.opciones.find((o) => o.id === id)
  if (!elegida) return { ok: false, motivo: 'vacio' }
  if (elegida.correcta) return CORRECTO
  return { ok: false, motivo: 'incorrecto', error_tipico: elegida.error_tipico }
}

// ---------------------------------------------------------- checkpoints

export type VeredictoCheckpoints = {
  ok: boolean
  /** Uno por checkpoint, en el mismo orden. */
  detalle: Veredicto[]
}

export function evaluarCheckpoints(
  entradas: string[],
  r: RespuestaCheckpoints,
): VeredictoCheckpoints {
  const detalle = r.checkpoints.map((c, i) =>
    evaluarNumerica(entradas[i] ?? '', { tipo: 'numerica', valor: c.valor, tol_rel: c.tol_rel }),
  )
  return { ok: detalle.every((d) => d.ok), detalle }
}
