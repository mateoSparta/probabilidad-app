/**
 * Marcas de tag en el enunciado (PLAN.md §4.4).
 *
 * Un enunciado puede señalar qué fragmento justifica cada tag:
 *
 *   `[[prob-total|se extrae una bola de B si salió roja]]`
 *
 * Los tags están ocultos hasta que el ítem se resuelve. Recién ahí aparecen,
 * y al pasar el mouse por un tag se resalta su fragmento. Es lo que convierte
 * el tag en algo que se aprende y no en una etiqueta decorativa.
 */

const MARCA = /\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g

export type Segmento = {
  texto: string
  /** Si está, el fragmento justifica ese skill. */
  skill?: string
}

/** Parte el enunciado en segmentos, marcados y sin marcar. */
export function partirEnSegmentos(enunciado: string): Segmento[] {
  const salida: Segmento[] = []
  let ultimo = 0
  for (const m of enunciado.matchAll(MARCA)) {
    const i = m.index
    if (i > ultimo) salida.push({ texto: enunciado.slice(ultimo, i) })
    salida.push({ texto: m[2], skill: m[1] })
    ultimo = i + m[0].length
  }
  if (ultimo < enunciado.length) salida.push({ texto: enunciado.slice(ultimo) })
  return salida
}

/** Los skills que el enunciado marca. Sirve para validar contra los del ítem. */
export function skillsMarcados(enunciado: string): string[] {
  return [...new Set([...enunciado.matchAll(MARCA)].map((m) => m[1]))]
}

/** El enunciado sin las marcas, para cuando no hace falta resaltar nada. */
export function sinMarcas(enunciado: string): string {
  return enunciado.replace(MARCA, '$2')
}
