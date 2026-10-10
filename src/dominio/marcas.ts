/**
 * Marcas de tag en el enunciado y en las preguntas (PLAN.md §4.4).
 *
 * Un texto puede señalar qué fragmento justifica cada tag:
 *
 *   `[[prob-total|se extrae una bola de B si salió roja]]`
 *   `[[prob-total,condicional|si es roja, se extrae una bola de B]]`
 *
 * La segunda forma sirve cuando un mismo fragmento justifica más de un tag,
 * porque las marcas no se pueden anidar. El fragmento puede contener `]`
 * (un intervalo como `$[0, 1]$`): la marca termina en el último `]]`.
 *
 * Los tags están ocultos hasta que el ítem se resuelve. Recién ahí aparecen,
 * y al pasar el mouse por un tag se resalta su fragmento. Es lo que convierte
 * el tag en algo que se aprende y no en una etiqueta decorativa. Por eso cada
 * skill de un ítem tiene que estar marcado en el enunciado o en la pregunta
 * del ítem (lo exige tools/check.ts): un tag que no señala nada no enseña.
 */

const MARCA = /\[\[([a-zA-Z0-9-]+(?:,[a-zA-Z0-9-]+)*)\|([\s\S]+?)\]\](?!\])/g

/** Puntuación que, si sigue a una marca, se incorpora al fragmento. */
const CIERRE = /^[.,;:!?)\]»”"…]+/

export type Segmento = {
  texto: string
  /** Si está, el fragmento justifica esos skills. */
  skills?: string[]
}

/**
 * Parte el texto en segmentos, marcados y sin marcar.
 *
 * La puntuación que sigue inmediatamente a una marca pasa al segmento marcado.
 * No cambia el texto, sólo dónde se corta: si el punto quedara en un segmento
 * aparte, no podría soldarse a la fórmula con la que termina el fragmento y
 * podría quedar solo al principio de un renglón.
 */
export function partirEnSegmentos(texto: string): Segmento[] {
  texto = String(texto ?? '')
  const salida: Segmento[] = []
  let ultimo = 0
  for (const m of texto.matchAll(MARCA)) {
    const i = m.index
    if (i < ultimo) continue
    if (i > ultimo) salida.push({ texto: texto.slice(ultimo, i) })
    const fin = i + m[0].length
    const cierre = texto.slice(fin).match(CIERRE)?.[0] ?? ''
    salida.push({ texto: m[2] + cierre, skills: m[1].split(',') })
    ultimo = fin + cierre.length
  }
  if (ultimo < texto.length) salida.push({ texto: texto.slice(ultimo) })
  return salida
}

/** Los skills que el texto marca. Sirve para validar contra los del ítem. */
export function skillsMarcados(texto: string): string[] {
  return [...new Set([...texto.matchAll(MARCA)].flatMap((m) => m[1].split(',')))]
}

/** El texto sin las marcas, para cuando no hace falta resaltar nada. */
export function sinMarcas(texto: string): string {
  return texto.replace(MARCA, '$2')
}
