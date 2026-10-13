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
  /** Cómo se la nombra en el texto: "parcial", "3er llamado a final". Va con "el". Único. */
  nombre: string
  /**
   * El grupo: el parcial con sus recuperatorios ("parcial") o los llamados de
   * la tanda de finales ("final"). Sin grupo, el grupo es el nombre.
   */
  grupo?: string
  /** Cómo se la nombra dentro de su grupo: "3er llamado". Sin ella, el nombre. */
  instancia?: string
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

/**
 * El objetivo: la evaluación que se está preparando. Es la que eligió el
 * usuario (con los chevrones del aviso o en Seguimiento), si todavía existe;
 * si no eligió ninguna, la que toca por fecha.
 */
export function evaluacionObjetivo(
  evaluaciones: readonly Evaluacion[],
  elegida: string | null,
  ahora = new Date(),
): Evaluacion | null {
  return evaluaciones.find((ev) => ev.nombre === elegida) ?? evaluacionActual(evaluaciones, ahora)
}

/** Las fechas que cambió el usuario, por nombre de evaluación; null es "sin fecha". */
export type FechasCambiadas = Readonly<Record<string, string | null>>

/**
 * Las evaluaciones con las fechas que cambió el usuario desde el aviso del
 * encabezado (ver datos/usarFechas.ts). Las que no cambió quedan con la de
 * content/config.yaml.
 */
export function conFechas(evaluaciones: readonly Evaluacion[], fechas: FechasCambiadas): Evaluacion[] {
  return evaluaciones.map((ev) => (ev.nombre in fechas ? { ...ev, fecha: fechas[ev.nombre] } : ev))
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

const conMayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

/** "Parcial", "3er llamado a final": el nombre con mayúscula, para un rótulo. */
export function rotulo(ev: Evaluacion): string {
  return conMayuscula(ev.nombre)
}

/** El grupo de una evaluación: "parcial" para el parcial y sus recuperatorios. */
export const grupoDe = (ev: Evaluacion): string => ev.grupo ?? ev.nombre

/** "Parcial", "Final": el grupo con mayúscula. */
export const rotuloGrupo = (ev: Evaluacion): string => conMayuscula(grupoDe(ev))

/** "Parcial", "1er recuperatorio", "3er llamado": la evaluación dentro de su grupo. */
export const rotuloInstancia = (ev: Evaluacion): string => conMayuscula(ev.instancia ?? ev.nombre)

/** Un grupo de evaluaciones, en el orden en que aparecen. */
export type Grupo = { grupo: string; rotulo: string; evaluaciones: Evaluacion[] }

/** Las evaluaciones agrupadas: el parcial con sus recuperatorios, los llamados a final. */
export function agrupar(evaluaciones: readonly Evaluacion[]): Grupo[] {
  const salida: Grupo[] = []
  for (const ev of evaluaciones) {
    const g = grupoDe(ev)
    const existente = salida.find((x) => x.grupo === g)
    if (existente) existente.evaluaciones.push(ev)
    else salida.push({ grupo: g, rotulo: rotuloGrupo(ev), evaluaciones: [ev] })
  }
  return salida
}

/** Un alcance del material para imprimir: Parcial, Final o Todas. */
export type Alcance = {
  id: string
  rotulo: string
  /** Las guías que abarca. */
  guias: number[]
}

/**
 * Los alcances del material para el examen: "Todas" primero, porque lo más
 * común es imprimir todo junto, y después uno por etapa, con sus guías
 * propias (Parcial: 1 a 8; Final: 9 a 12). El del final no repite lo del
 * parcial porque, si ya se imprimió, alcanza con completar.
 */
export function alcances(evaluaciones: readonly Evaluacion[]): Alcance[] {
  const porEtapa = etapas(evaluaciones).map((e) => ({
    id: grupoDe(e.evaluacion),
    rotulo: rotuloGrupo(e.evaluacion),
    guias: e.propias,
  }))
  return [{ id: 'todas', rotulo: 'Todas', guias: guiasDeLaMateria(evaluaciones) }, ...porEtapa]
}
