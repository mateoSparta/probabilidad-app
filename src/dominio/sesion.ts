/**
 * Estado de la sesión: dónde quedaste.
 *
 * El log de intentos (`progreso.ts`) es el historial: de ahí salen las
 * insignias y no se borra nunca. Esto es otra cosa: es la foto de la pantalla
 * —qué ítems ya resolviste, qué escribiste, qué pistas abriste, si hay un
 * simulacro a medio rendir— para que recargar la página no te haga perder el
 * lugar.
 *
 * Son dos cosas separadas a propósito. Reintentar un ejercicio borra su
 * estado de sesión pero no toca el historial: el intento ya contó.
 *
 * Lógica pura, sin navegador (ver tools/smoke.ts).
 */

export type EstadoItem = 'pendiente' | 'correcto' | 'incorrecto' | 'revelado'

export type SesionItem = {
  estado: EstadoItem
  envios: number
  /** Lo tipeado en una respuesta numérica o de expresión. */
  entrada?: string
  /** Lo tipeado en cada checkpoint. */
  celdas?: string[]
  /** La opción elegida en un multiple choice. */
  opcion?: string | null
  pistasAbiertas: number
  /** Distractores elegidos, para no perderlos al recargar. */
  distractores?: string[]
}

export const ITEM_NUEVO: SesionItem = {
  estado: 'pendiente',
  envios: 0,
  pistasAbiertas: 0,
}

export type SesionSimulacro = {
  examenId: string
  /**
   * Cuándo se termina, en epoch ms. Se guarda el vencimiento y no los
   * segundos que faltan: así recargar no regala tiempo, que es lo que haría
   * un examen de verdad.
   */
  terminaEn: number
  entregado: boolean
  /** numero de ejercicio -> por ítem, si salió correcto. */
  correctos: Record<number, boolean[]>
}

export type Sesion = {
  version: 1
  items: Record<string, SesionItem>
  simulacro?: SesionSimulacro
}

export const SESION_VACIA: Sesion = { version: 1, items: {} }

// ------------------------------------------------------------------ ítems

export function itemDeSesion(s: Sesion, clave: string): SesionItem {
  return s.items[clave] ?? ITEM_NUEVO
}

export function guardarItem(s: Sesion, clave: string, item: SesionItem): Sesion {
  return { ...s, items: { ...s.items, [clave]: item } }
}

export function olvidarItem(s: Sesion, clave: string): Sesion {
  if (!(clave in s.items)) return s
  const items = { ...s.items }
  delete items[clave]
  return { ...s, items }
}

/**
 * Saca los ítems que ya no existen en el contenido. Si no, al renombrar o
 * sacar un ejercicio su estado queda para siempre ocupando lugar.
 */
export function podar(s: Sesion, clavesVigentes: ReadonlySet<string>): Sesion {
  const items: Record<string, SesionItem> = {}
  let cambio = false
  for (const [clave, item] of Object.entries(s.items)) {
    if (clavesVigentes.has(clave)) items[clave] = item
    else cambio = true
  }
  return cambio ? { ...s, items } : s
}

// -------------------------------------------------------------- simulacro

/** Segundos que quedan, nunca negativo. */
export function segundosRestantes(sim: SesionSimulacro, ahora = Date.now()): number {
  return Math.max(0, Math.round((sim.terminaEn - ahora) / 1000))
}

export function seVencio(sim: SesionSimulacro, ahora = Date.now()): boolean {
  return segundosRestantes(sim, ahora) === 0
}

/**
 * El simulacro guardado, si todavía vale la pena retomarlo. Si se venció
 * mientras no estabas, se devuelve igual pero marcado como entregado: es lo
 * que pasó de verdad, y perder lo respondido sería peor.
 */
export function simulacroRetomable(
  s: Sesion,
  ahora = Date.now(),
): SesionSimulacro | undefined {
  const sim = s.simulacro
  if (!sim) return undefined
  if (!sim.entregado && seVencio(sim, ahora)) return { ...sim, entregado: true }
  return sim
}

export function guardarSimulacro(s: Sesion, sim: SesionSimulacro | undefined): Sesion {
  if (!sim) {
    const { simulacro: _descartado, ...resto } = s
    return resto as Sesion
  }
  return { ...s, simulacro: sim }
}

/** Marca un ítem del simulacro como correcto o no, sin perder los otros. */
export function anotarRespuesta(
  sim: SesionSimulacro,
  numeroEjercicio: number,
  indiceItem: number,
  correcto: boolean,
): SesionSimulacro {
  const previos = sim.correctos[numeroEjercicio] ?? []
  const marcas = [...previos]
  marcas[indiceItem] = correcto
  return { ...sim, correctos: { ...sim.correctos, [numeroEjercicio]: marcas } }
}

/** El `Map` que espera `calificar`. */
export function respuestasDeSimulacro(sim: SesionSimulacro): Map<number, boolean[]> {
  return new Map(Object.entries(sim.correctos).map(([n, marcas]) => [Number(n), marcas]))
}

// ------------------------------------------------- serializar / importar

export function aJson(s: Sesion): string {
  return JSON.stringify(s)
}

export function desdeJson(texto: string): Sesion | null {
  try {
    const s = JSON.parse(texto) as Sesion
    if (s?.version !== 1 || typeof s.items !== 'object' || s.items === null) return null
    // Se filtra lo que no tenga forma de estado de ítem, para que un
    // localStorage de una versión vieja no rompa la pantalla.
    const items: Record<string, SesionItem> = {}
    for (const [clave, item] of Object.entries(s.items)) {
      if (item && typeof item === 'object' && typeof item.estado === 'string') {
        items[clave] = {
          estado: item.estado,
          envios: typeof item.envios === 'number' ? item.envios : 0,
          entrada: typeof item.entrada === 'string' ? item.entrada : undefined,
          celdas: Array.isArray(item.celdas) ? item.celdas : undefined,
          opcion: typeof item.opcion === 'string' ? item.opcion : undefined,
          pistasAbiertas: typeof item.pistasAbiertas === 'number' ? item.pistasAbiertas : 0,
          distractores: Array.isArray(item.distractores) ? item.distractores : undefined,
        }
      }
    }
    const sim = s.simulacro
    const simulacro =
      sim && typeof sim.examenId === 'string' && typeof sim.terminaEn === 'number'
        ? {
            examenId: sim.examenId,
            terminaEn: sim.terminaEn,
            entregado: sim.entregado === true,
            correctos:
              sim.correctos && typeof sim.correctos === 'object' ? sim.correctos : {},
          }
        : undefined
    return simulacro ? { version: 1, items, simulacro } : { version: 1, items }
  } catch {
    return null
  }
}
