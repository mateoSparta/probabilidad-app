/**
 * ¿Llego al examen? El que toque: el parcial, el final o la evaluación que
 * siga en content/config.yaml (ver evaluaciones.ts).
 *
 * La idea no es hacer todos los ejercicios: es hacer **los mínimos necesarios
 * para dominar todos los temas**. Un skill se domina con 3 intentos limpios en
 * los últimos 5 (PLAN.md §5), o con tantos como ítems tenga si son menos de 3,
 * y un mismo ítem puede aportar a varios skills a
 * la vez, así que la cuenta no es "cuántos ejercicios faltan" sino "cuál es el
 * conjunto más chico de ítems que cubre lo que falta".
 *
 * Eso es un problema de cobertura. Se resuelve con una heurística greedy, que
 * no garantiza el óptimo pero da una cota realista y, sobre todo, baja a
 * medida que vas resolviendo.
 *
 * Lógica pura, sin navegador (ver tools/smoke.ts).
 */
// Con extension explicita: tools/smoke.ts importa este modulo directo con
// node, que no resuelve extensiones. Vite lo acepta igual.
import { diasHasta, evaluacionObjetivo, type Evaluacion } from './evaluaciones.ts'
import { avanceSkill, limpiosParaDominar, type Progreso } from './progreso.ts'

export { diasHasta } from './evaluaciones.ts'

export type Config = {
  /** Las evaluaciones de la cursada, en orden cronológico. */
  evaluaciones: Evaluacion[]
  curso: string | null
  ritmo_comodo_por_dia: number
  /**
   * La evaluación que eligió preparar el usuario, por nombre. Sin elegir (o
   * si ya no existe), el plan apunta a la que toca por fecha.
   */
  objetivo?: string | null
}

export type Veredicto =
  /** Ya están todos los skills dominados. */
  | 'listo'
  /** Todavía no hay ningún intento registrado. */
  | 'sin_arrancar'
  /** El ritmo necesario es cómodo. */
  | 'holgado'
  /** El ritmo necesario aprieta. */
  | 'justo'
  /** El ritmo necesario es más de lo razonable por día. */
  | 'apretado'
  /** La fecha ya pasó. */
  | 'vencido'
  /** La evaluación todavía no tiene fecha: no se puede calcular un ritmo. */
  | 'sin_fecha'

export type Plan = {
  /** La evaluación a la que apunta el plan; null si no hay ninguna declarada. */
  evaluacion: Evaluacion | null
  /** Días hasta esa evaluación; null si no tiene fecha. */
  diasRestantes: number | null
  /** Skills que se pueden llegar a dominar: los que tienen al menos un ítem. */
  skillsTotal: number
  skillsDominados: number
  /**
   * Skills que **no se pueden** dominar porque no tienen ningún ítem cargado.
   * Es un hueco de contenido, no del alumno, y por eso no entran en la meta:
   * si entraran, la meta nunca se alcanzaría.
   */
  skillsSinCobertura: number
  /** Ítems que hace falta resolver limpio para dominar todo lo que falta. */
  itemsFaltantes: number
  /** Ejercicios distintos que tocan esos ítems. */
  ejerciciosFaltantes: number
  /** Ítems limpios por día que hacen falta de acá al examen (0 sin fecha). */
  porDia: number
  /** Ítems limpios por día de los últimos 7 días. */
  ritmoReciente: number
  /** Si el ritmo reciente alcanza para el que hace falta. */
  alDia: boolean
  veredicto: Veredicto
}

/**
 * Un skill con los ítems que lo evalúan, y la guía en la que se introduce:
 * el plan de una evaluación cuenta sólo los skills de sus guías.
 */
export type SkillConItems = { id: string; items: ReadonlySet<string>; guia?: number }

/**
 * Los skills que se pueden llegar a dominar: todos los que tienen algún ítem,
 * porque a los que tienen menos de 3 se les pide un limpio por ítem (ver
 * `limpiosParaDominar`). Uno sin ítems no llegaría nunca, y dejarlo en la
 * meta haría que no se pueda terminar, así que se separa.
 */
export function alcanzables(skills: readonly SkillConItems[]): SkillConItems[] {
  return skills.filter((s) => s.items.size > 0)
}

const MS_POR_DIA = 86_400_000
const VENTANA_RITMO_DIAS = 7


/**
 * Cuántos intentos limpios le faltan a cada skill para quedar dominado.
 * Devuelve sólo los que tienen déficit.
 */
export function deficitPorSkill(
  progreso: Progreso,
  skills: readonly SkillConItems[],
): Map<string, number> {
  const deficit = new Map<string, number>()
  for (const s of skills) {
    const { limpios } = avanceSkill(progreso, s.items)
    const falta = limpiosParaDominar(s.items) - limpios
    if (falta > 0) deficit.set(s.id, falta)
  }
  return deficit
}

/** Los ítems que ya se resolvieron limpio alguna vez. */
function yaLimpios(progreso: Progreso): Set<string> {
  return new Set(progreso.intentos.filter((i) => i.limpio).map((i) => i.item))
}

/**
 * El conjunto de ítems que conviene hacer para cubrir lo que falta.
 *
 * Greedy: en cada paso se elige el ítem que cubre más skills con déficit. No
 * es el óptimo exacto —eso es NP-difícil— pero es una cota honesta y rápida,
 * y lo que importa es que baje al ritmo en que se resuelve.
 */
export function itemsRecomendados(
  progreso: Progreso,
  skills: readonly SkillConItems[],
  skillsDeItem: ReadonlyMap<string, readonly string[]>,
): string[] {
  const deficit = deficitPorSkill(progreso, skills)
  if (deficit.size === 0) return []

  const hechos = yaLimpios(progreso)
  const candidatos = new Set<string>()
  for (const s of skills) {
    if (!deficit.has(s.id)) continue
    for (const item of s.items) if (!hechos.has(item)) candidatos.add(item)
  }

  const elegidos: string[] = []
  while (deficit.size > 0 && candidatos.size > 0) {
    let mejor: string | null = null
    let mejorCobertura = 0
    // El orden del Set es de inserción, así que recorrerlo da un resultado
    // estable: dos corridas con el mismo progreso devuelven lo mismo.
    for (const item of candidatos) {
      const cobertura = (skillsDeItem.get(item) ?? []).filter((s) =>
        deficit.has(s),
      ).length
      if (cobertura > mejorCobertura) {
        mejor = item
        mejorCobertura = cobertura
      }
    }
    if (mejor === null) break // ningún candidato reduce el déficit

    elegidos.push(mejor)
    candidatos.delete(mejor)
    for (const s of skillsDeItem.get(mejor) ?? []) {
      const falta = deficit.get(s)
      if (falta === undefined) continue
      if (falta <= 1) deficit.delete(s)
      else deficit.set(s, falta - 1)
    }
  }
  return elegidos
}

/** Ítems limpios por día en los últimos `dias` días. */
export function ritmoReciente(
  progreso: Progreso,
  dias = VENTANA_RITMO_DIAS,
  ahora = new Date(),
): number {
  const desde = ahora.getTime() - dias * MS_POR_DIA
  const limpios = progreso.intentos.filter(
    (i) => i.limpio && new Date(i.ts).getTime() >= desde,
  ).length
  return limpios / dias
}

export function armarPlan(
  progreso: Progreso,
  skills: readonly SkillConItems[],
  skillsDeItem: ReadonlyMap<string, readonly string[]>,
  config: Config,
  ahora = new Date(),
): Plan {
  const evaluacion = evaluacionObjetivo(config.evaluaciones, config.objetivo ?? null, ahora)
  const diasRestantes = evaluacion?.fecha ? diasHasta(evaluacion.fecha, ahora) : null

  // Entran los skills de las guías que evalúa (los que no dicen su guía,
  // también), y de ellos la meta toma sólo los alcanzables.
  const evaluados = evaluacion
    ? skills.filter((s) => s.guia === undefined || evaluacion.guias.includes(s.guia))
    : skills
  const meta = alcanzables(evaluados)
  const faltantes = itemsRecomendados(progreso, meta, skillsDeItem)
  const itemsFaltantes = faltantes.length

  // El ejercicio de un ítem es la parte anterior a los dos puntos de su clave.
  const ejercicios = new Set(faltantes.map((c) => c.split(':')[0]))

  const dominados = meta.filter(
    (s) => avanceSkill(progreso, s.items).limpios >= limpiosParaDominar(s.items),
  ).length

  const porDia =
    diasRestantes === null ? 0 : Math.ceil(itemsFaltantes / Math.max(1, diasRestantes))
  const reciente = ritmoReciente(progreso, VENTANA_RITMO_DIAS, ahora)

  const comodo = config.ritmo_comodo_por_dia
  let veredicto: Veredicto
  if (itemsFaltantes === 0) veredicto = 'listo'
  else if (diasRestantes === null) veredicto = 'sin_fecha'
  // El mismo día todavía no pasó: el aviso dice "es hoy".
  else if (diasRestantes < 0) veredicto = 'vencido'
  else if (progreso.intentos.length === 0) veredicto = 'sin_arrancar'
  else if (porDia <= comodo) veredicto = 'holgado'
  else if (porDia <= comodo * 2) veredicto = 'justo'
  else veredicto = 'apretado'

  return {
    evaluacion,
    diasRestantes,
    skillsTotal: meta.length,
    skillsDominados: dominados,
    skillsSinCobertura: evaluados.length - meta.length,
    itemsFaltantes,
    ejerciciosFaltantes: ejercicios.size,
    porDia,
    ritmoReciente: Math.round(reciente * 10) / 10,
    alDia: reciente >= porDia,
    veredicto,
  }
}

export const ETIQUETA_VEREDICTO: Record<Veredicto, string> = {
  listo: 'Tenés todos los temas dominados',
  sin_arrancar: 'Todavía no empezaste',
  holgado: 'Vas holgado',
  justo: 'Vas justo',
  apretado: 'El ritmo que hace falta es alto',
  vencido: 'La fecha ya pasó',
  sin_fecha: 'Fecha a definir',
}

/** Formato corto para el encabezado: `30/10`. */
export function fechaCorta(fechaIso: string): string {
  const [, mes, dia] = fechaIso.split('-')
  return `${dia}/${mes}`
}
