/**
 * Las evaluaciones de la cursada: el parcial, el final y las que se agreguen
 * (un recuperatorio, otra fecha de final). Se declaran en content/config.yaml,
 * en orden cronológico, cada una con las guías que evalúa.
 *
 * De esa lista sale todo lo que antes suponía un único parcial: a qué examen
 * apuntan el aviso del encabezado y el plan de Seguimiento, qué skills entran
 * en la meta, cómo se agrupan las guías en el panel de skills y qué guías
 * faltan cargar.
 *
 * Lógica pura, sin navegador (ver tools/smoke.ts).
 */
// Con extension explicita: tools/smoke.ts importa este modulo directo con
// node, que no resuelve extensiones. Vite lo acepta igual.
import type { TipoExamen } from './simulacro.ts'

const MS_POR_DIA = 86_400_000

/**
 * Días de calendario hasta la fecha. Se normalizan las dos puntas a
 * medianoche local, así el resultado no depende de la hora del día: a las 9 de
 * la mañana y a las 11 de la noche falta lo mismo. Devuelve 0 el mismo día y
 * negativo si ya pasó.
 */
export function diasHasta(fechaIso: string, ahora = new Date()): number {
  const desde = new Date(ahora)
  desde.setHours(0, 0, 0, 0)
  const hasta = new Date(`${fechaIso}T00:00:00`)
  return Math.round((hasta.getTime() - desde.getTime()) / MS_POR_DIA)
}

export type Evaluacion = {
  /** Cómo se la nombra en el texto: "parcial", "final". Va con "el". */
  nombre: string
  /** En ISO (`2026-10-30`), o null si todavía no tiene fecha. */
  fecha: string | null
  /** Las guías que evalúa. El final evalúa también las del parcial. */
  guias: number[]
  /** El tipo de examen con el que se practica en el simulacro. */
  simulacro?: TipoExamen
}

/**
 * La evaluación a la que hay que apuntar: la primera que todavía no pasó.
 * Una sin fecha cuenta como pendiente, así que después del parcial el aviso
 * pasa al final aunque su fecha no esté definida. Si ya pasaron todas,
 * devuelve la última, y el plan la muestra como vencida.
 */
export function evaluacionActual(
  evaluaciones: readonly Evaluacion[],
  ahora = new Date(),
): Evaluacion | null {
  for (const ev of evaluaciones) {
    if (ev.fecha === null || diasHasta(ev.fecha, ahora) >= 0) return ev
  }
  return evaluaciones.at(-1) ?? null
}

/** Una etapa de la materia: una evaluación con las guías que suma. */
export type Etapa = {
  evaluacion: Evaluacion
  /** Las guías que entran por primera vez en esta evaluación. */
  propias: number[]
  /** Si además evalúa las guías de las anteriores (como el final). */
  acumula: boolean
}

/**
 * Las etapas de la materia, en orden: cada evaluación con las guías que
 * entran por primera vez en ella. Con un parcial de las guías 1 a 8 y un
 * final de las 1 a 12, son "parcial: 1 a 8" y "final: 9 a 12, más lo
 * anterior". Una evaluación que no suma guías nuevas (un recuperatorio) no
 * forma una etapa.
 */
export function etapas(evaluaciones: readonly Evaluacion[]): Etapa[] {
  const vistas = new Set<number>()
  const salida: Etapa[] = []
  for (const ev of evaluaciones) {
    const propias = ev.guias.filter((g) => !vistas.has(g)).sort((a, b) => a - b)
    if (propias.length === 0) continue
    const acumula = ev.guias.some((g) => vistas.has(g))
    for (const g of propias) vistas.add(g)
    salida.push({ evaluacion: ev, propias, acumula })
  }
  return salida
}

/** La primera evaluación en la que entra una guía: de qué examen es tema. */
export function temaDe(guia: number, evaluaciones: readonly Evaluacion[]): Evaluacion | null {
  return evaluaciones.find((ev) => ev.guias.includes(guia)) ?? null
}

/** Todas las guías de la materia: las que evalúa alguna evaluación. */
export function guiasDeLaMateria(evaluaciones: readonly Evaluacion[]): number[] {
  return [...new Set(evaluaciones.flatMap((ev) => ev.guias))].sort((a, b) => a - b)
}

/** "guía 9", "guías 1 a 8", "guías 1, 3 y 5". */
export function rangoGuias(guias: readonly number[]): string {
  const g = [...guias].sort((a, b) => a - b)
  if (g.length === 0) return 'ninguna guía'
  if (g.length === 1) return `guía ${g[0]}`
  const contiguas = g.every((n, i) => i === 0 || n === g[i - 1] + 1)
  if (contiguas) return `guías ${g[0]} a ${g.at(-1)}`
  return `guías ${g.slice(0, -1).join(', ')} y ${g.at(-1)}`
}

/** "Parcial", "Final": el nombre con mayúscula, para un rótulo. */
export function rotulo(ev: Evaluacion): string {
  return ev.nombre.charAt(0).toUpperCase() + ev.nombre.slice(1)
}
