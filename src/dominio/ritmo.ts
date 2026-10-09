/**
 * ¿Llego al parcial?
 *
 * La idea no es hacer todos los ejercicios: es hacer **los mínimos necesarios
 * para dominar todos los temas**. Un skill se domina con 3 intentos limpios en
 * los últimos 5 (PLAN.md §5), y un mismo ítem puede aportar a varios skills a
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
import { avanceSkill, LIMPIOS_PARA_DOMINAR, type Progreso } from './progreso.ts'

export type Config = {
  /** Fecha del parcial, en ISO (`2026-10-30`). */
  parcial: string
  curso: string | null
  ritmo_comodo_por_dia: number
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

export type Plan = {
  diasRestantes: number
  /** Skills que se pueden llegar a dominar: los que tienen 3 ítems o más. */
  skillsTotal: number
  skillsDominados: number
  /**
   * Skills que todavía **no se pueden** dominar porque no hay suficientes
   * ítems cargados. Es un hueco de contenido, no del alumno, y por eso no
   * entran en la meta: si entraran, la meta nunca se alcanzaría.
   */
  skillsSinCobertura: number
  /** Ítems que hace falta resolver limpio para dominar todo lo que falta. */
  itemsFaltantes: number
  /** Ejercicios distintos que tocan esos ítems. */
  ejerciciosFaltantes: number
  /** Ítems limpios por día que hacen falta de acá al parcial. */
  porDia: number
  /** Ítems limpios por día de los últimos 7 días. */
  ritmoReciente: number
  /** Si el ritmo reciente alcanza para el que hace falta. */
  alDia: boolean
  veredicto: Veredicto
}

/** Un skill con los ítems que lo evalúan. */
export type SkillConItems = { id: string; items: ReadonlySet<string> }

/**
 * Los skills que se pueden llegar a dominar.
 *
 * Dominar un skill pide 3 intentos limpios, y como cada ítem cuenta una sola
 * vez por día, un skill con menos de 3 ítems **nunca** llega. Dejarlos en la
 * meta haría que no se pueda terminar nunca, así que se separan.
 */
export function alcanzables(skills: readonly SkillConItems[]): SkillConItems[] {
  return skills.filter((s) => s.items.size >= LIMPIOS_PARA_DOMINAR)
}

const MS_POR_DIA = 86_400_000
const VENTANA_RITMO_DIAS = 7

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
    const falta = LIMPIOS_PARA_DOMINAR - limpios
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
  const diasRestantes = diasHasta(config.parcial, ahora)

  // La meta se arma sólo sobre los skills alcanzables.
  const meta = alcanzables(skills)
  const faltantes = itemsRecomendados(progreso, meta, skillsDeItem)
  const itemsFaltantes = faltantes.length

  // El ejercicio de un ítem es la parte anterior a los dos puntos de su clave.
  const ejercicios = new Set(faltantes.map((c) => c.split(':')[0]))

  const dominados = meta.filter(
    (s) => avanceSkill(progreso, s.items).limpios >= LIMPIOS_PARA_DOMINAR,
  ).length

  const diasUtiles = Math.max(1, diasRestantes)
  const porDia = Math.ceil(itemsFaltantes / diasUtiles)
  const reciente = ritmoReciente(progreso, VENTANA_RITMO_DIAS, ahora)

  const comodo = config.ritmo_comodo_por_dia
  let veredicto: Veredicto
  if (itemsFaltantes === 0) veredicto = 'listo'
  else if (diasRestantes <= 0) veredicto = 'vencido'
  else if (progreso.intentos.length === 0) veredicto = 'sin_arrancar'
  else if (porDia <= comodo) veredicto = 'holgado'
  else if (porDia <= comodo * 2) veredicto = 'justo'
  else veredicto = 'apretado'

  return {
    diasRestantes,
    skillsTotal: meta.length,
    skillsDominados: dominados,
    skillsSinCobertura: skills.length - meta.length,
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
  sin_arrancar: 'Todavía no arrancaste',
  holgado: 'Vas holgado',
  justo: 'Vas justo',
  apretado: 'El ritmo que hace falta es alto',
  vencido: 'La fecha ya pasó',
}

/** Formato corto para el encabezado: `30/10`. */
export function fechaCorta(fechaIso: string): string {
  const [, mes, dia] = fechaIso.split('-')
  return `${dia}/${mes}`
}
