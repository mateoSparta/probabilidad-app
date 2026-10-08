/**
 * Validador de contenido (PLAN.md §4.7). Corre antes de `vite build`.
 *
 * Fase 0: todavía no hay contenido, así que sólo verifica la estructura.
 * El validador completo se implementa en la fase 1.
 */
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const raiz = resolve(import.meta.dirname, '..')
const requeridos = ['content', 'content/guias', 'content/examenes', 'revision']

let fallas = 0
for (const d of requeridos) {
  if (!existsSync(resolve(raiz, d))) {
    console.error(`✗ falta el directorio ${d}`)
    fallas++
  }
}

if (fallas > 0) {
  console.error(`\ncheck: ${fallas} error(es).`)
  process.exit(1)
}

console.log('check: estructura OK. (Validador de contenido completo: fase 1.)')
