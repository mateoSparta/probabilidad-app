/**
 * Validador de contenido (PLAN.md §4.7). Corre antes de `vite build`.
 *
 * El build falla si:
 *   - un skill referenciado no existe
 *   - un bloque de teoría declara un skill que ningún ítem evalúa
 *   - un ítem no tiene skills o no tiene pistas
 *   - un `valor` no parsea
 *   - una marca `[[skill|…]]` usa un skill que el ejercicio no declara
 *   - un ejercicio o un bloque de la secuencia no existe
 *   - un valor del YAML no coincide con lo que calculó tools/verify/
 *
 * Y avisa (sin fallar) por cada ítem con `estado` distinto de `verificado`.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { load } from 'js-yaml'
import { evaluate } from 'mathjs'

const RAIZ = resolve(import.meta.dirname, '..')
const CONTENT = join(RAIZ, 'content')
const VERIFICACION = join(CONTENT, '.verificacion', 'resultados.json')

const errores: string[] = []
const avisos: string[] = []

const err = (m: string) => errores.push(m)
const avisar = (m: string) => avisos.push(m)

// --------------------------------------------------------------- lectura

function leerYaml<T>(ruta: string): T {
  return load(readFileSync(ruta, 'utf8')) as T
}

function listar(dir: string, ext: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => join(dir, f))
}

type Skill = { id: string; nombre: string; guia: number; formulas?: string[] }
type Respuesta = Record<string, unknown> & { tipo: string }
type Item = {
  id: string
  pregunta?: string
  skills?: string[]
  respuesta?: Respuesta
  pistas?: string[]
  verificacion?: { estado?: string; fuentes_valor?: { origen: string; valor: string }[] }
}
type Ejercicio = { id: string; guia: number; numero: string; enunciado?: string; items?: Item[] }
type Guia = { numero: number; titulo?: string; secuencia?: { teoria?: string; ejercicio?: string }[] }

// --------------------------------------------------------------- catálogo

const rutaSkills = join(CONTENT, 'skills.yaml')
if (!existsSync(rutaSkills)) {
  console.error('✗ falta content/skills.yaml')
  process.exit(1)
}
const skills = leerYaml<Skill[]>(rutaSkills) ?? []
const idsSkills = new Set(skills.map((s) => s.id))

for (const s of skills) {
  if (!s.id || !s.nombre) err(`skills.yaml: un skill sin id o sin nombre (${JSON.stringify(s)})`)
  if (typeof s.guia !== 'number') err(`skill ${s.id}: falta \`guia\``)
}

// -------------------------------------------------------------- ejercicios

const dirsGuia = existsSync(join(CONTENT, 'guias'))
  ? readdirSync(join(CONTENT, 'guias')).map((d) => join(CONTENT, 'guias', d))
  : []

const ejercicios: Ejercicio[] = []
const teoriaIds = new Set<string>()
/** skill -> ítems que lo evalúan */
const evaluadoPor = new Map<string, string[]>()

const RE_MARCA = /\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g

for (const dir of dirsGuia) {
  for (const ruta of listar(join(dir, 'ejercicios'), '.yaml')) {
    const ej = leerYaml<Ejercicio>(ruta)
    if (!ej?.id) {
      err(`${ruta}: falta \`id\``)
      continue
    }
    ejercicios.push(ej)

    const items = ej.items ?? []
    if (items.length === 0) err(`${ej.id}: no tiene items`)

    const skillsDelEjercicio = new Set(items.flatMap((i) => i.skills ?? []))

    for (const item of items) {
      const quien = `${ej.id}(${item.id})`

      if (!item.skills?.length) err(`${quien}: no declara skills`)
      if (!item.pistas?.length) err(`${quien}: no tiene pistas`)

      for (const s of item.skills ?? []) {
        if (!idsSkills.has(s)) err(`${quien}: el skill \`${s}\` no existe en skills.yaml`)
        evaluadoPor.set(s, [...(evaluadoPor.get(s) ?? []), quien])
      }

      validarRespuesta(quien, item.respuesta)

      const estado = item.verificacion?.estado
      if (estado !== 'verificado') {
        avisar(`${quien}: estado de verificación \`${estado ?? 'ausente'}\``)
      }
      if (!item.verificacion?.fuentes_valor?.length) {
        avisar(`${quien}: no registra de dónde salió el valor`)
      }
    }

    // Las marcas del enunciado tienen que usar skills del ejercicio: el
    // enunciado es compartido, así que se valida contra la unión de los ítems.
    for (const m of (ej.enunciado ?? '').matchAll(RE_MARCA)) {
      const s = m[1]
      if (!idsSkills.has(s)) {
        err(`${ej.id}: la marca \`[[${s}|…]]\` usa un skill que no existe`)
      } else if (!skillsDelEjercicio.has(s)) {
        err(`${ej.id}: la marca \`[[${s}|…]]\` usa un skill que ningún ítem declara`)
      }
    }
  }

  for (const ruta of listar(join(dir, 'teoria'), '.md')) {
    const txt = readFileSync(ruta, 'utf8')
    const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!m) {
      err(`${ruta}: falta el frontmatter`)
      continue
    }
    const meta = (load(m[1]) ?? {}) as { id?: string; skills?: string[] }
    if (!meta.id) {
      err(`${ruta}: el frontmatter no tiene \`id\``)
      continue
    }
    teoriaIds.add(meta.id)
    for (const s of meta.skills ?? []) {
      if (!idsSkills.has(s)) err(`teoría ${meta.id}: el skill \`${s}\` no existe`)
    }
  }
}

const idsEjercicios = new Set(ejercicios.map((e) => e.id))

// ------------------------------------------------------------------ guías

for (const dir of dirsGuia) {
  const ruta = join(dir, 'guia.yaml')
  if (!existsSync(ruta)) continue
  const guia = leerYaml<Guia>(ruta)
  if (typeof guia?.numero !== 'number') {
    err(`${ruta}: falta \`numero\``)
    continue
  }
  for (const paso of guia.secuencia ?? []) {
    if (paso.ejercicio && !idsEjercicios.has(paso.ejercicio)) {
      err(`guía ${guia.numero}: la secuencia referencia el ejercicio \`${paso.ejercicio}\`, que no existe`)
    }
    if (paso.teoria && !teoriaIds.has(paso.teoria)) {
      err(`guía ${guia.numero}: la secuencia referencia la teoría \`${paso.teoria}\`, que no existe`)
    }
    if (!paso.ejercicio && !paso.teoria) {
      err(`guía ${guia.numero}: un paso de la secuencia no es ni teoría ni ejercicio`)
    }
  }
}

// Un bloque de teoría que explica un skill que nada evalúa es teoría que se
// lee y no se practica: va contra el principio de recuperación activa.
for (const dir of dirsGuia) {
  for (const ruta of listar(join(dir, 'teoria'), '.md')) {
    const txt = readFileSync(ruta, 'utf8')
    const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!m) continue
    const meta = (load(m[1]) ?? {}) as { id?: string; skills?: string[] }
    for (const s of meta.skills ?? []) {
      if (idsSkills.has(s) && !evaluadoPor.has(s)) {
        err(`teoría ${meta.id}: el skill \`${s}\` no lo evalúa ningún ítem`)
      }
    }
  }
}

// ------------------------------------------------------------- respuestas

function parsea(expr: string, vars?: Record<string, number>): boolean {
  try {
    const v = evaluate(expr, vars ?? {})
    return typeof v === 'number' ? Number.isFinite(v) : v !== undefined
  } catch {
    return false
  }
}

function validarRespuesta(quien: string, r?: Respuesta): void {
  if (!r?.tipo) {
    err(`${quien}: no tiene respuesta`)
    return
  }
  switch (r.tipo) {
    case 'numerica': {
      const valor = r.valor as string
      if (valor === undefined) err(`${quien}: respuesta numérica sin \`valor\``)
      else if (!parsea(String(valor))) err(`${quien}: el valor \`${valor}\` no parsea`)
      break
    }
    case 'expresion': {
      const valor = String(r.valor)
      const vars = r.vars as Record<string, [number, number]> | undefined
      if (!vars || Object.keys(vars).length === 0) {
        err(`${quien}: respuesta de tipo expresión sin \`vars\``)
        break
      }
      const punto: Record<string, number> = {}
      for (const [n, rango] of Object.entries(vars)) {
        if (!Array.isArray(rango) || rango.length !== 2) {
          err(`${quien}: el rango de \`${n}\` tiene que ser [min, max]`)
          continue
        }
        punto[n] = (rango[0] + rango[1]) / 2
      }
      if (!parsea(valor, punto)) err(`${quien}: la expresión \`${valor}\` no evalúa`)
      break
    }
    case 'opcion': {
      const ops = (r.opciones ?? []) as { id: string; correcta?: boolean; error_tipico?: string }[]
      if (ops.length < 2) err(`${quien}: una opción múltiple necesita al menos 2 opciones`)
      const correctas = ops.filter((o) => o.correcta)
      if (correctas.length !== 1) {
        err(`${quien}: tiene ${correctas.length} opciones correctas, tiene que haber exactamente 1`)
      }
      for (const o of ops) {
        if (!o.correcta && !o.error_tipico) {
          // El error_tipico es lo que alimenta la detección de puntos ciegos.
          avisar(`${quien}: el distractor \`${o.id}\` no tiene \`error_tipico\``)
        }
      }
      break
    }
    case 'checkpoints': {
      const cps = (r.checkpoints ?? []) as { pregunta?: string; valor?: string }[]
      if (cps.length < 2 || cps.length > 4) {
        err(`${quien}: los checkpoints tienen que ser entre 2 y 4 (hay ${cps.length})`)
      }
      for (const [i, c] of cps.entries()) {
        if (!c.pregunta) err(`${quien}: el checkpoint ${i} no tiene pregunta`)
        if (c.valor === undefined) err(`${quien}: el checkpoint ${i} no tiene valor`)
        else if (!parsea(String(c.valor))) err(`${quien}: el checkpoint ${i} tiene un valor que no parsea: \`${c.valor}\``)
      }
      break
    }
    default:
      err(`${quien}: tipo de respuesta desconocido \`${r.tipo}\``)
  }
}

// ------------------------------------- contraste con tools/verify/

/**
 * Compara cada valor del YAML contra lo que calculó el pipeline de
 * verificación. Así, tocar un valor a mano sin recalcularlo rompe el build:
 * es la red que sostiene la regla de no inventar resultados.
 */
if (existsSync(VERIFICACION)) {
  type Res = Record<string, { items: Record<string, { valor: string }> }>
  const res = JSON.parse(readFileSync(VERIFICACION, 'utf8')) as Res

  for (const ej of ejercicios) {
    const calculado = res[ej.id]
    if (!calculado) continue
    for (const item of ej.items ?? []) {
      const esperado = calculado.items[item.id]
      if (!esperado) continue
      const r = item.respuesta
      if (r?.tipo !== 'numerica') continue
      const a = evaluate(String(r.valor))
      const b = evaluate(String(esperado.valor))
      const num = (x: unknown) => (typeof x === 'number' ? x : Number(x))
      if (Math.abs(num(a) - num(b)) > 1e-9) {
        err(
          `${ej.id}(${item.id}): el YAML dice \`${r.valor}\` pero tools/verify calculó ` +
            `\`${esperado.valor}\`. Volvé a correr \`npm run verificar\` o corregí el valor.`,
        )
      }
    }
  }
} else {
  avisar('no existe content/.verificacion/resultados.json: corré `npm run verificar`')
}

// ------------------------------------------------------------------ salida

const nItems = ejercicios.reduce((n, e) => n + (e.items?.length ?? 0), 0)
console.log(
  `check: ${skills.length} skills, ${ejercicios.length} ejercicios, ${nItems} ítems, ` +
    `${teoriaIds.size} bloques de teoría.`,
)

for (const a of avisos) console.warn(`  aviso: ${a}`)
for (const e of errores) console.error(`  ✗ ${e}`)

if (errores.length > 0) {
  console.error(`\ncheck: ${errores.length} error(es).`)
  process.exit(1)
}
console.log(avisos.length > 0 ? `check: OK con ${avisos.length} aviso(s).` : 'check: OK.')
