/**
 * Validador de contenido (PLAN.md §4.7). Corre antes de `vite build`.
 *
 * El build falla si:
 *   - un skill referenciado no existe
 *   - un bloque de teoría declara un skill que ningún ítem evalúa
 *   - un ítem no tiene skills o no tiene pistas
 *   - un `valor` no parsea
 *   - una marca `[[skill|…]]` usa un skill que el ejercicio no declara
 *   - un skill de un ítem no está marcado ni en el enunciado ni en su
 *     pregunta (su tag no resaltaría nada)
 *   - el texto propio (teoría, pistas, distractores, descripciones) usa una
 *     de las expresiones que la guía de estilo descarta
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

/** Igual que en src/dominio/respuesta.ts. */
const TOL_REL_POR_DEFECTO = 0.01

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
type Guia = {
  numero: number
  titulo?: string
  descripcion?: string
  secuencia?: { teoria?: string; ejercicio?: string }[]
}

// ---------------------------------------------------------------- estilo

/**
 * Expresiones que el texto propio no puede usar. El registro buscado es el de
 * un apunte de cátedra: claro y cercano, pero no coloquial. La lista no
 * pretende ser una guía de estilo completa; frena las muletillas que ya
 * aparecieron y que el autor pidió sacar.
 *
 * Se aplica a lo que escribimos nosotros (teoría, pistas, distractores,
 * descripciones), no a los enunciados, que se transcriben de la guía.
 */
const ESTILO_PROHIBIDO: [RegExp, string][] = [
  [/\bsale(n)? sol[oa]s?\b/i, '"sale solo"'],
  [/\blind[oa]s?\b/i, '"lindo"'],
  [/\bnomás\b/i, '"nomás"'],
  [/\bojo con\b|\bojo:/i, '"ojo con"'],
  [/\bde una\b(?=[.,;]|$)/i, '"de una" (por "directamente")'],
  [/\bse come[n]?\b/i, '"se come"'],
  [/\btruco\b/i, '"truco"'],
  [/\bno (?:es|son|era|eran)\b[^.;:?!]{1,80}?\bsino\b/i, 'la estructura "no es X sino Y"'],
  [/\bno (?:es|son|era|eran)\b[^.;:?!]{1,80}?: (?:es|son|era|eran)\b/i, 'la estructura "no es X: es Y"'],
  [/\bno (?:es|son)\b[^.;:?!]{1,60}?, (?:es|son)\b(?! decir)/i, 'la estructura "no es X, es Y"'],
]

/** Saca las fórmulas, para no confundir un `:` de LaTeX con puntuación. */
function sinFormulas(t: string): string {
  return t.replace(/\$\$[^$]+\$\$|\$[^$]+\$/g, 'X')
}

function revisarEstilo(quien: string, texto?: unknown): void {
  if (texto === undefined || texto === null) return
  const limpio = sinFormulas(String(texto)).replace(/\s+/g, ' ')
  for (const [re, nombre] of ESTILO_PROHIBIDO) {
    const m = limpio.match(re)
    if (m) err(`${quien}: usa ${nombre} ("…${m[0]}…")`)
  }
}

/**
 * Una fórmula en display ocupa su renglón, así que la puntuación que le sigue
 * quedaría sola al principio del siguiente. Tiene que ir dentro de la fórmula.
 */
function revisarPuntuacionTrasDisplay(quien: string, texto?: string): void {
  if (texto && /\$\$\s*[.,;:]/.test(texto)) {
    err(`${quien}: hay un signo de puntuación después de una fórmula en display; va adentro de la fórmula`)
  }
}

// ---------------------------------------------------------------- marcas

const RE_MARCA = /\[\[([a-zA-Z0-9-]+(?:,[a-zA-Z0-9-]+)*)\|([\s\S]+?)\]\](?!\])/g

function marcados(texto?: string): Set<string> {
  return new Set([...(texto ?? '').matchAll(RE_MARCA)].flatMap((m) => m[1].split(',')))
}

/**
 * Las marcas de un ejercicio (de guía o de examen).
 *
 * Cada skill de un ítem tiene que estar marcado en el enunciado o en la
 * pregunta del propio ítem: los tags aparecen debajo del enunciado y, al
 * pasarles el mouse, resaltan su fragmento. Un tag sin fragmento no señala
 * nada, y eso es justo lo que se quiere evitar.
 */
function validarMarcas(quien: string, enunciado: string | undefined, items: Item[]): void {
  const delEjercicio = new Set(items.flatMap((i) => i.skills ?? []))
  const enEnunciado = marcados(enunciado)

  for (const texto of [enunciado, ...items.map((i) => i.pregunta)]) {
    const resto = (texto ?? '').replace(RE_MARCA, '')
    if (resto.includes('[[') || resto.includes(']]')) {
      err(`${quien}: hay una marca mal formada (\`[[\` o \`]]\` sueltos)`)
    }
  }

  for (const s of enEnunciado) {
    if (!idsSkills.has(s)) {
      err(`${quien}: la marca \`[[${s}|…]]\` usa un skill que no existe`)
    } else if (items.length > 0 && !delEjercicio.has(s)) {
      err(`${quien}: la marca \`[[${s}|…]]\` usa un skill que ningún ítem declara`)
    }
  }

  for (const item of items) {
    const enPregunta = marcados(item.pregunta)
    for (const s of enPregunta) {
      if (!(item.skills ?? []).includes(s)) {
        err(`${quien}(${item.id}): la pregunta marca \`${s}\`, que el ítem no declara`)
      }
    }
    for (const s of item.skills ?? []) {
      if (!enEnunciado.has(s) && !enPregunta.has(s)) {
        err(
          `${quien}(${item.id}): el skill \`${s}\` no está marcado ni en el enunciado ni en ` +
            'la pregunta, así que su tag no resaltaría nada',
        )
      }
    }
  }
}

/**
 * Todo lo que se muestra como texto tiene que ser texto. En YAML, un escalar
 * sin comillas que contiene `: ` se lee como un diccionario, y el renderer
 * recibiría un objeto en lugar de un string: la página entera se cae al abrir
 * esa pista. Hay que entrecomillarlo o usar `>-`.
 */
function exigirTexto(quien: string, valor: unknown): void {
  if (valor === undefined) return
  if (typeof valor !== 'string') {
    const visto = JSON.stringify(valor)
    err(
      `${quien}: tendría que ser texto y YAML lo leyó como ${Array.isArray(valor) ? 'lista' : typeof valor}` +
        ` (${visto.length > 70 ? visto.slice(0, 70) + '…' : visto}). Entrecomillalo o usá \`>-\`.`,
    )
  }
}

/** El texto propio de un ítem: pistas y distractores. */
function revisarTextoDeItem(quien: string, item: Item): void {
  exigirTexto(`${quien} pregunta`, item.pregunta)
  for (const [i, pista] of (item.pistas ?? []).entries()) exigirTexto(`${quien} pista ${i + 1}`, pista)
  const opciones = (item.respuesta?.opciones ?? []) as Record<string, unknown>[]
  for (const o of opciones) {
    exigirTexto(`${quien} opción ${o.id}`, o.texto)
    exigirTexto(`${quien} opción ${o.id} (error típico)`, o.error_tipico)
  }
  const cps = (item.respuesta?.checkpoints ?? []) as Record<string, unknown>[]
  for (const [i, c] of cps.entries()) exigirTexto(`${quien} checkpoint ${i + 1}`, c.pregunta)

  for (const [i, pista] of (item.pistas ?? []).entries()) {
    revisarEstilo(`${quien} pista ${i + 1}`, pista)
    revisarPuntuacionTrasDisplay(`${quien} pista ${i + 1}`, pista)
  }
  const ops = (item.respuesta?.opciones ?? []) as {
    id: string
    texto?: string
    error_tipico?: string
  }[]
  for (const o of ops) {
    revisarEstilo(`${quien} opción ${o.id}`, o.texto)
    revisarEstilo(`${quien} opción ${o.id} (error típico)`, o.error_tipico)
  }
  revisarPuntuacionTrasDisplay(quien, item.pregunta)
}

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
  revisarEstilo(`skill ${s.id}`, (s as { descripcion?: string }).descripcion)
}

// ----------------------------------------------------------------- config

type ConfigCruda = {
  parcial?: string
  curso?: string | null
  ritmo_comodo_por_dia?: number
}

const rutaConfig = join(CONTENT, 'config.yaml')
if (existsSync(rutaConfig)) {
  const cfg = (leerYaml<ConfigCruda>(rutaConfig) ?? {}) as ConfigCruda

  if (!cfg.parcial) {
    err('config.yaml: falta `parcial`, la fecha del examen')
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(cfg.parcial)) {
    err(`config.yaml: \`parcial\` tiene que ser una fecha ISO (2026-10-30), no \`${cfg.parcial}\``)
  } else if (Number.isNaN(new Date(`${cfg.parcial}T00:00:00`).getTime())) {
    err(`config.yaml: \`parcial\` no es una fecha válida: \`${cfg.parcial}\``)
  } else {
    // Una fecha ya pasada no es un error (el repo puede quedar viejo), pero
    // deja la cuenta de dias en negativo y conviene avisarlo.
    const dias = Math.round(
      (new Date(`${cfg.parcial}T00:00:00`).getTime() - Date.now()) / 86_400_000,
    )
    if (dias < 0) {
      avisar(
        `config.yaml: la fecha del parcial (${cfg.parcial}) ya pasó hace ${-dias} días. ` +
          'El panel lo va a mostrar como vencido.',
      )
    }
  }

  const ritmo = cfg.ritmo_comodo_por_dia
  if (ritmo !== undefined && (typeof ritmo !== 'number' || ritmo <= 0)) {
    err('config.yaml: `ritmo_comodo_por_dia` tiene que ser un número positivo')
  }
} else {
  avisar('no existe content/config.yaml: se usan los valores por defecto')
}

// -------------------------------------------------------------- ejercicios

const dirsGuia = existsSync(join(CONTENT, 'guias'))
  ? readdirSync(join(CONTENT, 'guias')).map((d) => join(CONTENT, 'guias', d))
  : []

const ejercicios: Ejercicio[] = []
const teoriaIds = new Set<string>()
/** skill -> ítems que lo evalúan */
const evaluadoPor = new Map<string, string[]>()

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

    for (const item of items) {
      const quien = `${ej.id}(${item.id})`
      revisarTextoDeItem(quien, item)

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

    exigirTexto(`${ej.id} enunciado`, ej.enunciado)
    validarMarcas(ej.id, ej.enunciado, items)
    revisarPuntuacionTrasDisplay(ej.id, ej.enunciado)
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
    const cuerpo = txt.slice(m[0].length)
    revisarEstilo(`teoría ${meta.id}`, cuerpo)
    revisarPuntuacionTrasDisplay(`teoría ${meta.id}`, cuerpo)
    for (const s of meta.skills ?? []) {
      if (!idsSkills.has(s)) err(`teoría ${meta.id}: el skill \`${s}\` no existe`)
    }
  }
}

const idsEjercicios = new Set(ejercicios.map((e) => e.id))

// --------------------------------------------------------------- exámenes

type EjercicioExamen = {
  numero: number
  guias?: number[]
  en_alcance?: boolean
  cargado?: boolean
  enunciado?: string
  items?: Item[]
  nota?: string
}
type Examen = {
  id: string
  tipo?: string
  titulo?: string
  fecha?: string
  duracion_min?: number
  aprueba_con?: number
  ejercicios?: EjercicioExamen[]
}

const examenes: Examen[] = listar(join(CONTENT, 'examenes'), '.yaml').map((r) =>
  leerYaml<Examen>(r),
)

for (const ex of examenes) {
  const donde = `examen ${ex.id ?? '(sin id)'}`
  if (!ex.id) err(`${donde}: falta \`id\``)
  if (ex.tipo !== 'parcial' && ex.tipo !== 'integradora') {
    err(`${donde}: \`tipo\` tiene que ser parcial o integradora`)
  }
  if (typeof ex.duracion_min !== 'number') err(`${donde}: falta \`duracion_min\``)
  if (typeof ex.aprueba_con !== 'number') err(`${donde}: falta \`aprueba_con\``)
  if (!ex.ejercicios?.length) err(`${donde}: no tiene ejercicios`)

  const vistos = new Set<number>()
  for (const ej of ex.ejercicios ?? []) {
    const quienEj = `${donde} ej ${ej.numero}`
    if (typeof ej.numero !== 'number') err(`${donde}: un ejercicio sin \`numero\``)
    if (vistos.has(ej.numero)) err(`${quienEj}: número repetido`)
    vistos.add(ej.numero)
    if (!ej.guias?.length) err(`${quienEj}: no declara de qué guías sale`)
    if (!ej.enunciado?.trim()) err(`${quienEj}: no tiene enunciado`)

    const items = ej.items ?? []
    // `cargado` tiene que decir la verdad: es lo que decide si el simulacro
    // presenta el ejercicio.
    if (ej.cargado && items.length === 0) {
      err(`${quienEj}: está marcado \`cargado\` pero no tiene ítems`)
    }
    if (!ej.cargado && items.length > 0) {
      err(`${quienEj}: tiene ítems pero no está marcado \`cargado\``)
    }
    if (!ej.cargado && !ej.nota?.trim()) {
      avisar(`${quienEj}: no está cargado y no explica por qué`)
    }

    revisarEstilo(`${quienEj} nota`, ej.nota)
    for (const item of items) {
      const quien = `${quienEj}(${item.id})`
      revisarTextoDeItem(quien, item)
      if (!item.skills?.length) err(`${quien}: no declara skills`)
      for (const s of item.skills ?? []) {
        if (!idsSkills.has(s)) err(`${quien}: el skill \`${s}\` no existe`)
        evaluadoPor.set(s, [...(evaluadoPor.get(s) ?? []), quien])
      }
      // En el simulacro no se muestran pistas, pero al entregar sí, así que
      // igual hacen falta.
      if (!item.pistas?.length) err(`${quien}: no tiene pistas`)
      validarRespuesta(quien, item.respuesta)
      if (item.verificacion?.estado !== 'verificado') {
        avisar(`${quien}: estado de verificación \`${item.verificacion?.estado ?? 'ausente'}\``)
      }
    }

    exigirTexto(`${quienEj} enunciado`, ej.enunciado)
    validarMarcas(quienEj, ej.enunciado, items)
    revisarPuntuacionTrasDisplay(quienEj, ej.enunciado)
  }
}

// ------------------------------------------------------------------ guías

for (const dir of dirsGuia) {
  const ruta = join(dir, 'guia.yaml')
  if (!existsSync(ruta)) continue
  const guia = leerYaml<Guia>(ruta)
  if (typeof guia?.numero !== 'number') {
    err(`${ruta}: falta \`numero\``)
    continue
  }
  revisarEstilo(`guía ${guia.numero} (descripción)`, guia.descripcion)
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

/**
 * Avisa cuando la tolerancia es demasiado floja para la respuesta.
 *
 * El 1 % por defecto existe para absorber el redondeo de la tabla normal
 * (PLAN.md §11), pero sobre una respuesta grande se vuelve enorme: con el
 * valor 50000 admite todo el rango 49500-50500. Si la respuesta es un entero
 * exacto, la tolerancia no tendria que dejar pasar el entero de al lado.
 */
function avisarSiToleranciaFloja(quien: string, valor: string, tolRel?: number): void {
  let v: number
  try {
    const bruto = evaluate(valor)
    v = typeof bruto === 'number' ? bruto : Number(bruto)
  } catch {
    return
  }
  if (!Number.isFinite(v) || v === 0) return

  const tol = tolRel ?? TOL_REL_POR_DEFECTO
  const margen = tol * Math.abs(v)
  if (Number.isInteger(v) && margen >= 1) {
    avisar(
      `${quien}: la respuesta es el entero ${v} pero la tolerancia admite ` +
        `±${margen.toFixed(2)}, o sea que acepta ${v + 1}. Convendría bajar \`tol_rel\`.`,
    )
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
      else avisarSiToleranciaFloja(quien, String(valor), r.tol_rel as number | undefined)
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
        else if (!parsea(String(c.valor)))
          err(`${quien}: el checkpoint ${i} tiene un valor que no parsea: \`${c.valor}\``)
        else
          avisarSiToleranciaFloja(
            `${quien} checkpoint ${i + 1}`,
            String(c.valor),
            (c as { tol_rel?: number }).tol_rel,
          )
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

  const num = (x: unknown) => (typeof x === 'number' ? x : Number(x))

  /** Compara un valor del YAML contra el que calculó el pipeline. */
  function contrastar(quien: string, delYaml: string, calculado: string): void {
    if (Math.abs(num(evaluate(delYaml)) - num(evaluate(calculado))) > 1e-9) {
      err(
        `${quien}: el YAML dice \`${delYaml}\` pero tools/verify calculó ` +
          `\`${calculado}\`. Volvé a correr \`npm run verificar\` o corregí el valor.`,
      )
    }
  }

  let contrastados = 0

  for (const ej of ejercicios) {
    const calculado = res[ej.id]
    if (!calculado) continue
    for (const item of ej.items ?? []) {
      const r = item.respuesta
      if (!r) continue

      if (r.tipo === 'numerica') {
        const esperado = calculado.items[item.id]
        if (!esperado) continue
        contrastar(`${ej.id}(${item.id})`, String(r.valor), esperado.valor)
        contrastados++
      }

      // Los checkpoints se buscan por posición: el ítem `a` con cuatro
      // checkpoints se contrasta contra las claves a1, a2, a3 y a4.
      if (r.tipo === 'checkpoints') {
        const cps = (r.checkpoints ?? []) as { valor?: string }[]
        for (const [i, c] of cps.entries()) {
          const clave = `${item.id}${i + 1}`
          const esperado = calculado.items[clave]
          if (!esperado || c.valor === undefined) continue
          contrastar(`${ej.id}(${item.id}) checkpoint ${i + 1}`, String(c.valor), esperado.valor)
          contrastados++
        }
      }
    }
  }

  // Los examenes se contrastan igual: la clave del modelo es
  // `<id del examen>-<numero del ejercicio>`.
  for (const ex of examenes) {
    for (const ej of ex.ejercicios ?? []) {
      const calculado = res[`${ex.id}-${ej.numero}`]
      if (!calculado) continue
      for (const item of ej.items ?? []) {
        const r = item.respuesta
        if (r?.tipo !== 'numerica') continue
        const esperado = calculado.items[item.id]
        if (!esperado) continue
        contrastar(`${ex.id} ej ${ej.numero}(${item.id})`, String(r.valor), esperado.valor)
        contrastados++
      }
    }
  }

  console.log(`check: ${contrastados} valores contrastados contra tools/verify/.`)
} else {
  avisar('no existe content/.verificacion/resultados.json: corré `npm run verificar`')
}

// ------------------------------------------------------------------ salida

const nItems = ejercicios.reduce((n, e) => n + (e.items?.length ?? 0), 0)
const nItemsExamen = examenes.reduce(
  (n, ex) => n + (ex.ejercicios ?? []).reduce((m, ej) => m + (ej.items?.length ?? 0), 0),
  0,
)
console.log(
  `check: ${skills.length} skills, ${ejercicios.length} ejercicios, ${nItems} ítems, ` +
    `${teoriaIds.size} bloques de teoría, ${examenes.length} exámenes (${nItemsExamen} ítems).`,
)

for (const a of avisos) console.warn(`  aviso: ${a}`)
for (const e of errores) console.error(`  ✗ ${e}`)

if (errores.length > 0) {
  console.error(`\ncheck: ${errores.length} error(es).`)
  process.exit(1)
}
console.log(avisos.length > 0 ? `check: OK con ${avisos.length} aviso(s).` : 'check: OK.')
