/**
 * Carga del contenido (PLAN.md §1: la app es un renderer de datos).
 *
 * Todo sale de content/ vía `import.meta.glob`, así que agregar un ejercicio
 * es agregar un archivo YAML. No hay nada de contenido en src/.
 *
 * El contenido ya pasó por tools/check.ts en el build, así que acá se asume
 * bien formado y se normaliza nomás.
 */
import { load } from 'js-yaml'

import type { BloqueTeoria, Ejercicio, Guia, PasoSecuencia, Skill } from '../dominio/tipos'

type Crudo = Record<string, string>

// Vite analiza `import.meta.glob` de forma estática, así que las opciones
// tienen que ir literales en cada llamada: si se las pasa por variable, no
// aplica el `?raw` y el bundler intenta parsear el YAML como JavaScript.
const crudoSkills = import.meta.glob('/content/skills.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Crudo

const crudoGuias = import.meta.glob('/content/guias/*/guia.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Crudo

const crudoEjercicios = import.meta.glob('/content/guias/*/ejercicios/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Crudo

const crudoTeoria = import.meta.glob('/content/guias/*/teoria/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Crudo

// ------------------------------------------------------------------ skills

export const skills: Skill[] = Object.values(crudoSkills).flatMap(
  (txt) => (load(txt) as Skill[] | null) ?? [],
)

export const skillPorId = new Map(skills.map((s) => [s.id, s]))

// ------------------------------------------------------------- ejercicios

export const ejercicios: Ejercicio[] = Object.values(crudoEjercicios)
  .map((txt) => load(txt) as Ejercicio)
  .filter(Boolean)
  .sort((a, b) => a.numero.localeCompare(b.numero, 'es', { numeric: true }))

export const ejercicioPorId = new Map(ejercicios.map((e) => [e.id, e]))

// ----------------------------------------------------------------- teoría

const RE_FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

function parsearTeoria(txt: string): BloqueTeoria | null {
  const m = txt.match(RE_FRONTMATTER)
  if (!m) return null
  const meta = (load(m[1]) ?? {}) as { id?: string; skills?: string[] }
  if (!meta.id) return null
  return { id: meta.id, skills: meta.skills ?? [], cuerpo: txt.slice(m[0].length).trim() }
}

export const teoria: BloqueTeoria[] = Object.values(crudoTeoria)
  .map(parsearTeoria)
  .filter((t): t is BloqueTeoria => t !== null)

export const teoriaPorId = new Map(teoria.map((t) => [t.id, t]))

// ------------------------------------------------------------------ guías

/** En el YAML cada paso es `{teoria: id}` o `{ejercicio: id}`. */
type PasoCrudo = { teoria?: string; ejercicio?: string }

function normalizarPaso(p: PasoCrudo): PasoSecuencia | null {
  if (p.teoria) return { tipo: 'teoria', id: p.teoria }
  if (p.ejercicio) return { tipo: 'ejercicio', id: p.ejercicio }
  return null
}

export const guias: Guia[] = Object.values(crudoGuias)
  .map((txt) => {
    const g = load(txt) as Omit<Guia, 'secuencia'> & { secuencia?: PasoCrudo[] }
    return {
      numero: g.numero,
      titulo: g.titulo,
      descripcion: g.descripcion,
      secuencia: (g.secuencia ?? []).map(normalizarPaso).filter((p): p is PasoSecuencia => p !== null),
    }
  })
  .sort((a, b) => a.numero - b.numero)

export const guiaPorNumero = new Map(guias.map((g) => [g.numero, g]))

// ----------------------------------------------------------------- ayudas

/** Los skills que evalúa una guía, en el orden en que aparecen. */
export function skillsDeGuia(numero: number): Skill[] {
  const guia = guiaPorNumero.get(numero)
  if (!guia) return []
  const vistos = new Set<string>()
  const salida: Skill[] = []
  for (const paso of guia.secuencia) {
    if (paso.tipo !== 'ejercicio') continue
    const ej = ejercicioPorId.get(paso.id)
    if (!ej) continue
    for (const item of ej.items) {
      for (const id of item.skills) {
        if (vistos.has(id)) continue
        vistos.add(id)
        const s = skillPorId.get(id)
        if (s) salida.push(s)
      }
    }
  }
  return salida
}

/** Las fórmulas de los skills de un ítem, para el panel de fórmulas. */
export function formulasDeItem(skillsDelItem: string[]): { skill: Skill; formulas: string[] }[] {
  return skillsDelItem
    .map((id) => skillPorId.get(id))
    .filter((s): s is Skill => !!s && !!s.formulas?.length)
    .map((s) => ({ skill: s, formulas: s.formulas ?? [] }))
}

/** Si hay contenido cargado para esa guía. */
export function guiaTieneContenido(numero: number): boolean {
  const g = guiaPorNumero.get(numero)
  return !!g && g.secuencia.length > 0
}
