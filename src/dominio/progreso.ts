/**
 * Progreso y estados de skill (PLAN.md §5).
 *
 * Lógica pura: entra un log de intentos y sale el estado. No toca
 * localStorage ni el DOM, así que se puede testear sin navegador
 * (ver tools/smoke.ts).
 *
 * El principio que define todo esto: **el dominio se mide sobre intentos
 * recientes, no se gana para siempre.** De ahí la ventana de 5.
 */
import type { EstadoSkill, Intento } from './tipos'

/** Sobre cuántos intentos recientes se mide un skill. */
export const VENTANA = 5

/** Cuántos limpios en la ventana hacen falta para la insignia. */
export const LIMPIOS_PARA_DOMINAR = 3

/** Un intento, más si fue limpio. Lo guardado es esto. */
export type RegistroIntento = Intento & { limpio: boolean }

export type Progreso = {
  version: 1
  intentos: RegistroIntento[]
}

export const PROGRESO_VACIO: Progreso = { version: 1, intentos: [] }

/** El día de un timestamp ISO, en hora local. */
export function dia(ts: string): string {
  const d = new Date(ts)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dd}`
}

/**
 * Se cuenta como máximo un intento por ítem por día, para que repetir el
 * mismo ejercicio no sirva para memorizar el número (PLAN.md §5).
 */
export function yaCuentaHoy(p: Progreso, item: string, ts: string): boolean {
  const hoy = dia(ts)
  return p.intentos.some((i) => i.item === item && dia(i.ts) === hoy)
}

export function agregar(p: Progreso, intento: Intento, limpio: boolean): Progreso {
  if (yaCuentaHoy(p, intento.item, intento.ts)) return p
  return { ...p, intentos: [...p.intentos, { ...intento, limpio }] }
}

/** Los últimos `n` intentos sobre un conjunto de ítems, del más nuevo al más viejo. */
export function recientes(
  p: Progreso,
  items: ReadonlySet<string>,
  n = VENTANA,
): RegistroIntento[] {
  return p.intentos
    .filter((i) => items.has(i.item))
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, n)
}

/**
 * Estado de un skill sobre los últimos 5 intentos de ítems que lo incluyen.
 *
 *   sin explorar   0 intentos
 *   dominado       >= 3 intentos limpios en los últimos 5
 *   flojo          >= 3 intentos y <= 1 limpio en los últimos 5
 *   en desarrollo  cualquier otro caso
 *
 * El orden de las condiciones importa: `dominado` se chequea primero.
 */
export function estadoSkill(p: Progreso, items: ReadonlySet<string>): EstadoSkill {
  const ventana = recientes(p, items)
  if (ventana.length === 0) return 'sin_explorar'

  const limpios = ventana.filter((i) => i.limpio).length
  if (limpios >= LIMPIOS_PARA_DOMINAR) return 'dominado'
  if (ventana.length >= 3 && limpios <= 1) return 'flojo'
  return 'en_desarrollo'
}

/** Cuántos limpios sobre cuántos, para mostrar el avance hacia la insignia. */
export function avanceSkill(p: Progreso, items: ReadonlySet<string>): {
  limpios: number
  total: number
} {
  const ventana = recientes(p, items)
  return { limpios: ventana.filter((i) => i.limpio).length, total: ventana.length }
}

/** Ítems del skill que todavía no se resolvieron limpios nunca. */
export function pendientes(p: Progreso, items: ReadonlySet<string>): string[] {
  const limpiados = new Set(p.intentos.filter((i) => i.limpio).map((i) => i.item))
  return [...items].filter((i) => !limpiados.has(i)).sort()
}

/**
 * Los distractores en los que más se cayó, de mayor a menor. Es la señal de
 * punto ciego: no que el ítem salga mal, sino *por qué* sale mal.
 */
export function distractoresFrecuentes(
  p: Progreso,
  items: ReadonlySet<string>,
): { item: string; opcion: string; veces: number }[] {
  const cuenta = new Map<string, number>()
  for (const i of p.intentos) {
    if (!items.has(i.item)) continue
    for (const d of i.distractores ?? []) {
      const clave = `${i.item}\u0000${d}`
      cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1)
    }
  }
  return [...cuenta.entries()]
    .map(([clave, veces]) => {
      const [item, opcion] = clave.split('\u0000')
      return { item, opcion, veces }
    })
    .sort((a, b) => b.veces - a.veces || a.item.localeCompare(b.item))
}

// ------------------------------------------------------------- resumen

export const ETIQUETA_ESTADO: Record<EstadoSkill, string> = {
  sin_explorar: 'Sin explorar',
  en_desarrollo: 'En desarrollo',
  dominado: 'Dominado',
  flojo: 'Flojo',
}

export function contarPorEstado(estados: EstadoSkill[]): Record<EstadoSkill, number> {
  const base: Record<EstadoSkill, number> = {
    sin_explorar: 0,
    en_desarrollo: 0,
    dominado: 0,
    flojo: 0,
  }
  for (const e of estados) base[e]++
  return base
}

// ------------------------------------------------- serializar / importar

export function aJson(p: Progreso): string {
  return JSON.stringify(p, null, 2)
}

/**
 * Devuelve el progreso, o null si el texto no tiene la forma esperada.
 * Se filtran los intentos mal formados para que un archivo tocado a mano no
 * rompa los cálculos del panel.
 */
export function desdeJson(texto: string): Progreso | null {
  try {
    const p = JSON.parse(texto) as Progreso
    if (p?.version !== 1 || !Array.isArray(p.intentos)) return null
    const intentos = p.intentos.filter(
      (i) => typeof i?.item === 'string' && typeof i?.ts === 'string',
    )
    return { version: 1, intentos }
  } catch {
    return null
  }
}
