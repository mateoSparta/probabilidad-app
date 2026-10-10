/**
 * Modo simulacro (PLAN.md §6): nota, veredicto y armado del pool.
 *
 * Lógica pura, sin DOM ni timers, para poder testear la nota y el veredicto
 * sin navegador (ver tools/smoke.ts).
 */
import type { Item } from './tipos'

export type TipoExamen = 'parcial' | 'integradora'

export type EjercicioExamen = {
  numero: number
  /** Guías de las que sale. Sirve para saber si está en alcance. */
  guias: number[]
  /** Si cae dentro de las guías 1–8, que es el alcance de v1. */
  en_alcance: boolean
  /**
   * Si tiene ítems validables cargados. Un ejercicio puede estar en alcance
   * y todavía no estar cargado, porque su respuesta no se verificó.
   */
  cargado: boolean
  enunciado: string
  items: Item[]
  /** Por qué no está cargado, o qué hay que saber para resolverlo. */
  nota?: string
  /** Variante por curso, cuando el examen trae más de una. */
  variante?: string
}

export type Examen = {
  id: string
  tipo: TipoExamen
  titulo: string
  fecha: string
  duracion_min: number
  fuente?: string
  /** Ejercicios correctos que pide la cátedra para aprobar. */
  aprueba_con: number
  ejercicios: EjercicioExamen[]
}

export const NOTA_MAXIMA = 10

// ------------------------------------------------------------------ pool

/**
 * Los ejercicios que el simulacro puede presentar: en alcance y con ítems
 * cargados. Si un ejercicio está en alcance pero su respuesta todavía no se
 * verificó, no entra: antes se presenta un examen más corto que un valor
 * inventado.
 */
export function ejerciciosJugables(examen: Examen): EjercicioExamen[] {
  return examen.ejercicios.filter((e) => e.en_alcance && e.cargado && e.items.length > 0)
}

export function esCompleto(examen: Examen): boolean {
  return ejerciciosJugables(examen).length === examen.ejercicios.length
}

/** Los exámenes de un tipo que tienen al menos un ejercicio para rendir. */
export function poolDe(examenes: Examen[], tipo: TipoExamen): Examen[] {
  return examenes.filter((e) => e.tipo === tipo && ejerciciosJugables(e).length > 0)
}

/**
 * Elige al azar un examen del tipo pedido: parcial (por defecto) o
 * integradora. Los dos tipos no se mezclan, porque evalúan cosas distintas
 * y tienen criterios de aprobación distintos.
 */
export function elegirExamen(
  examenes: Examen[],
  opciones: { tipo?: TipoExamen; azar?: () => number } = {},
): Examen | null {
  const azar = opciones.azar ?? Math.random
  const pool = poolDe(examenes, opciones.tipo ?? 'parcial')
  if (pool.length === 0) return null
  return pool[Math.floor(azar() * pool.length)]
}

// ------------------------------------------------------------------ nota

/** Si cada ítem de un ejercicio se respondió bien. Indexado por `numero`. */
export type Respuestas = Map<number, boolean[]>

export type Resultado = {
  /** De 0 a 10, sobre los ejercicios presentados. */
  nota: number
  /** Ejercicios con todos sus ítems correctos. */
  ejerciciosEnteros: number
  /** Cuántos ejercicios se presentaron. */
  presentados: number
  /** Cuántos ejercicios tiene el examen de verdad. */
  totales: number
  aprobaria: boolean
  /**
   * El veredicto es parcial cuando no se presentó el examen entero: no se
   * puede decir si aprobaría con un examen recortado.
   */
  veredictoParcial: boolean
  /** Por ejercicio, cuántos ítems salieron bien sobre cuántos. */
  detalle: { numero: number; correctos: number; total: number }[]
}

/**
 * Cada ejercicio vale lo mismo y sus ítems se reparten ese peso en partes
 * iguales (PLAN.md §6). Con un examen recortado la nota se reescala sobre
 * los ejercicios presentados, y el veredicto se marca como parcial.
 */
export function calificar(examen: Examen, respuestas: Respuestas): Resultado {
  const jugables = ejerciciosJugables(examen)
  const presentados = jugables.length
  const totales = examen.ejercicios.length

  if (presentados === 0) {
    return {
      nota: 0,
      ejerciciosEnteros: 0,
      presentados: 0,
      totales,
      aprobaria: false,
      veredictoParcial: true,
      detalle: [],
    }
  }

  const pesoPorEjercicio = NOTA_MAXIMA / presentados
  let nota = 0
  let ejerciciosEnteros = 0
  const detalle: Resultado['detalle'] = []

  for (const ej of jugables) {
    const marcas = respuestas.get(ej.numero) ?? []
    const correctos = ej.items.reduce((n, _, i) => n + (marcas[i] ? 1 : 0), 0)
    const total = ej.items.length
    nota += pesoPorEjercicio * (correctos / total)
    if (correctos === total) ejerciciosEnteros++
    detalle.push({ numero: ej.numero, correctos, total })
  }

  // El criterio de la cátedra se evalúa sobre el examen real, así que con un
  // examen recortado se informa pero se marca parcial.
  const aprobaria = ejerciciosEnteros >= examen.aprueba_con

  return {
    nota: Math.round(nota * 100) / 100,
    ejerciciosEnteros,
    presentados,
    totales,
    aprobaria,
    veredictoParcial: presentados < totales,
    detalle,
  }
}

// ----------------------------------------------------------------- timer

export function formatearTiempo(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const seg = s % 60
  const dosDigitos = (n: number) => String(n).padStart(2, '0')
  return h > 0
    ? `${h}:${dosDigitos(m)}:${dosDigitos(seg)}`
    : `${dosDigitos(m)}:${dosDigitos(seg)}`
}
