/**
 * El listado de todos los resultados: revision/resultados.md.
 *
 * Una tabla por guía y por examen, con cada valor, su decimal, el estado de
 * verificación y un enlace a la línea del archivo donde está, para revisar
 * todos los resultados de una vez y corregir el que esté mal (DOCENTE.md).
 * Arriba va lo que conviene revisar primero: las discrepancias y los valores
 * del docente.
 *
 * Lo regenera `npm run check` en cada corrida, así que siempre está al día;
 * no se edita a mano. Sólo escribe el archivo si cambió.
 *
 * Uso:  npm run resultados
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { load } from 'js-yaml'
import { evaluate } from 'mathjs'

const RAIZ = resolve(import.meta.dirname, '..')
const CONTENT = join(RAIZ, 'content')
const SALIDA = join(RAIZ, 'revision', 'resultados.md')

type Opcion = { id: string; texto: string; correcta?: boolean }
type Respuesta = {
  tipo: 'numerica' | 'expresion' | 'opcion' | 'checkpoints'
  rotulo?: string
  valor?: string
  vars?: Record<string, unknown>
  opciones?: Opcion[]
  checkpoints?: { pregunta: string; valor: string }[]
}
type Item = { id: string; respuesta: Respuesta; verificacion?: { estado?: string; nota?: string } }
type Ejercicio = { id: string; guia: number; numero: string; items?: Item[] }
type Guia = { numero: number; titulo: string; secuencia?: { ejercicio?: string }[] }
type EjercicioExamen = { numero: number; cargado?: boolean; items?: Item[] }
type Examen = { id: string; titulo: string; fecha?: string; ejercicios?: EjercicioExamen[] }

const leer = <T>(ruta: string): T => load(readFileSync(ruta, 'utf8')) as T
const listar = (dir: string, ext: string): string[] =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(ext)).map((f) => join(dir, f)) : []

// --------------------------------------------------- dónde está cada valor

/**
 * El tramo de líneas de un bloque de lista YAML que empieza en `inicio`
 * (`- id: a` o `- numero: 2`): hasta la próxima línea con la misma sangría o
 * menos.
 */
function finDelBloque(lineas: string[], inicio: number): number {
  const sangria = lineas[inicio].search(/\S/)
  for (let i = inicio + 1; i < lineas.length; i++) {
    const l = lineas[i]
    if (!l.trim() || l.trim().startsWith('#')) continue
    if (l.search(/\S/) <= sangria) return i
  }
  return lineas.length
}

function buscar(lineas: string[], re: RegExp, desde: number, hasta: number): number {
  for (let i = desde; i < hasta; i++) if (re.test(lineas[i])) return i
  return -1
}

/**
 * Las líneas (contando desde 1) donde está el valor de un ítem: una para
 * las numéricas, las expresiones y las opciones (la de `correcta: true`), y
 * una por campo para los checkpoints.
 */
function lineasDelValor(lineas: string[], item: Item, desde: number, hasta: number): number[] {
  // Admite un comentario al final del renglón, como en las plantillas.
  const inicio = buscar(lineas, new RegExp(`^\\s*- id:\\s*['"]?${item.id}['"]?\\s*(#.*)?$`), desde, hasta)
  if (inicio < 0) return []
  const fin = finDelBloque(lineas, inicio)
  const r = item.respuesta
  if (r.tipo === 'opcion') {
    const i = buscar(lineas, /^\s*correcta:\s*true/, inicio, fin)
    return i < 0 ? [] : [i + 1]
  }
  if (r.tipo === 'checkpoints') {
    const out: number[] = []
    let i = buscar(lineas, /^\s*checkpoints:/, inicio, fin)
    while (i >= 0 && out.length < (r.checkpoints ?? []).length) {
      i = buscar(lineas, /^\s*valor:/, i + 1, fin)
      if (i >= 0) out.push(i + 1)
    }
    return out
  }
  const resp = buscar(lineas, /^\s*respuesta:/, inicio, fin)
  const i = buscar(lineas, /^\s*valor:/, resp < 0 ? inicio : resp, fin)
  return i < 0 ? [] : [i + 1]
}

// ------------------------------------------------------------------ filas

type Fila = {
  ejercicio: string
  item: string
  que: string
  valor: string
  decimal: string
  estado: string
  donde: string
}
type Pendiente = { donde: string; quien: string; estado: string; nota: string }

const pendientes: Pendiente[] = []
let nValores = 0
const porEstado = new Map<string, number>()

/** Una celda de tabla Markdown: sin saltos de línea y con las barras escapadas. */
const celda = (t: string) => t.replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim()

/** El decimal de un valor, como lo muestra la app: "≈ 0,3333", o "= 0,5" si es exacto. */
function decimal(valor: string): string {
  if (/^-?\d+(\.\d+)?$/.test(valor.trim())) return ''
  try {
    const n = Number(evaluate(valor))
    if (!Number.isFinite(n)) return ''
    const exacto = Math.abs(n * 1e4 - Math.round(n * 1e4)) < 1e-9
    return `${exacto ? '=' : '≈'} ${Number(n.toPrecision(4)).toString().replace('.', ',')}`
  } catch {
    return ''
  }
}

const NOMBRE_ESTADO: Record<string, string> = {
  verificado: 'verificado',
  discrepancia: '**discrepancia**',
  docente: '**docente**',
  sin_fuente: 'sin fuente',
}

/**
 * Las filas de los ítems de un ejercicio (de guía o de examen). `nombre` es
 * cómo se lo nombra fuera de su tabla, en "Para revisar primero".
 */
function filas(
  rotuloEjercicio: string,
  nombre: string,
  items: Item[],
  ruta: string,
  lineas: string[],
  desde: number,
  hasta: number,
): Fila[] {
  const relativa = relative(join(RAIZ, 'revision'), ruta).replace(/\\/g, '/')
  const archivo = relativa.split('/').at(-1)
  const enlace = (n?: number) => (n ? `[${archivo}:${n}](${relativa}#L${n})` : `[${archivo}](${relativa})`)
  const out: Fila[] = []
  for (const item of items) {
    const r = item.respuesta
    const estado = item.verificacion?.estado ?? 'sin estado'
    const nombreEstado = NOMBRE_ESTADO[estado] ?? estado
    const donde = lineasDelValor(lineas, item, desde, hasta)
    const base = { ejercicio: rotuloEjercicio, item: `(${item.id})`, estado: nombreEstado }
    if (estado === 'discrepancia' || estado === 'docente') {
      pendientes.push({
        donde: enlace(donde[0]),
        quien: `${nombre} (${item.id})`,
        estado: nombreEstado,
        nota: item.verificacion?.nota ?? '',
      })
    }
    const sumar = (n: number) => {
      nValores += n
      porEstado.set(estado, (porEstado.get(estado) ?? 0) + n)
    }

    if (r.tipo === 'checkpoints') {
      ;(r.checkpoints ?? []).forEach((c, i) =>
        out.push({ ...base, que: c.pregunta, valor: `\`${c.valor}\``, decimal: decimal(String(c.valor)), donde: enlace(donde[i]) }),
      )
      sumar((r.checkpoints ?? []).length)
    } else if (r.tipo === 'opcion') {
      const ok = (r.opciones ?? []).find((o) => o.correcta)
      out.push({ ...base, que: 'la opción correcta', valor: ok?.texto ?? '—', decimal: '', donde: enlace(donde[0]) })
      sumar(1)
    } else if (r.tipo === 'expresion') {
      const vars = Object.keys(r.vars ?? {}).map((v) => `$${v}$`).join(', ')
      out.push({ ...base, que: `$${r.rotulo}$`, valor: `\`${r.valor}\``, decimal: `en función de ${vars}`, donde: enlace(donde[0]) })
      sumar(1)
    } else {
      out.push({ ...base, que: `$${r.rotulo}$`, valor: `\`${r.valor}\``, decimal: decimal(String(r.valor)), donde: enlace(donde[0]) })
      sumar(1)
    }
  }
  return out
}

function tabla(fs: Fila[]): string {
  const cab = '| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |\n|---|---|---|---|---|---|---|\n'
  return cab + fs.map((f) => `| ${[f.ejercicio, f.item, f.que, f.valor, f.decimal, f.estado, f.donde].map(celda).join(' | ')} |`).join('\n') + '\n'
}

// ------------------------------------------------------------------ guías

const secciones: string[] = []

const ejercicios = new Map<string, { ej: Ejercicio; ruta: string }>()
for (const dir of listar(join(CONTENT, 'guias'), '')) {
  for (const ruta of listar(join(dir, 'ejercicios'), '.yaml')) {
    const ej = leer<Ejercicio>(ruta)
    if (ej?.id) ejercicios.set(ej.id, { ej, ruta })
  }
}
const guias = listar(join(CONTENT, 'guias'), '')
  .map((d) => join(d, 'guia.yaml'))
  .filter(existsSync)
  .map((r) => leer<Guia>(r))
  .filter((g) => (g.secuencia ?? []).some((p) => p.ejercicio))
  .sort((a, b) => a.numero - b.numero)

let nItemsGuias = 0
for (const g of guias) {
  const fs: Fila[] = []
  for (const paso of g.secuencia ?? []) {
    const x = paso.ejercicio && ejercicios.get(paso.ejercicio)
    if (!x) continue
    const lineas = readFileSync(x.ruta, 'utf8').split(/\r?\n/)
    nItemsGuias += (x.ej.items ?? []).length
    fs.push(...filas(x.ej.numero, `Ejercicio ${x.ej.numero}`, x.ej.items ?? [], x.ruta, lineas, 0, lineas.length))
  }
  secciones.push(`## Guía ${g.numero} · ${g.titulo}\n\n${tabla(fs)}`)
}

// --------------------------------------------------------------- exámenes

const examenes = listar(join(CONTENT, 'examenes'), '.yaml')
  .map((ruta) => ({ ex: leer<Examen>(ruta), ruta }))
  .sort((a, b) => (a.ex.fecha ?? '').localeCompare(b.ex.fecha ?? ''))

let nItemsExamenes = 0
const seccionesExamen: string[] = []
for (const { ex, ruta } of examenes) {
  const lineas = readFileSync(ruta, 'utf8').split(/\r?\n/)
  const fs: Fila[] = []
  for (const ej of ex.ejercicios ?? []) {
    if (!ej.cargado || !ej.items?.length) continue
    const inicio = buscar(lineas, new RegExp(`^\\s*- numero:\\s*${ej.numero}\\s*(#.*)?$`), 0, lineas.length)
    const fin = inicio < 0 ? lineas.length : finDelBloque(lineas, inicio)
    nItemsExamenes += ej.items.length
    fs.push(...filas(`Ej. ${ej.numero}`, `${ex.titulo}, ej. ${ej.numero}`, ej.items, ruta, lineas, Math.max(0, inicio), fin))
  }
  if (fs.length) seccionesExamen.push(`### ${ex.titulo}\n\n${tabla(fs)}`)
}

// ------------------------------------------------------------------ salida

const cuenta = (e: string) => porEstado.get(e) ?? 0
const resumen =
  `${nValores} valores en ${nItemsGuias + nItemsExamenes} ítems: ${nItemsGuias} de las guías y ` +
  `${nItemsExamenes} de ${seccionesExamen.length} exámenes. ${cuenta('verificado')} verificados, ` +
  `${cuenta('discrepancia')} con discrepancia y ${cuenta('docente')} del docente.`

const revisar = pendientes.length
  ? '| Ítem | Estado | Nota | Dónde |\n|---|---|---|---|\n' +
    pendientes.map((p) => `| ${[p.quien, p.estado, p.nota || '—', p.donde].map(celda).join(' | ')} |`).join('\n') +
    '\n'
  : 'Nada pendiente.\n'

const texto = `# Resultados

Listado de todos los resultados de la app, generado por \`npm run check\`
(tools/resultados.ts) a partir de los archivos de content/. **No se edita a
mano**: para corregir un resultado, seguir el enlace de la columna "Dónde" y
los pasos de [DOCENTE.md](../DOCENTE.md), "Corregir un resultado".

${resumen}

Estados: *verificado*, la resuelta de la cátedra y el cálculo independiente
de tools/verify/ coinciden; *discrepancia*, no coinciden y la nota explica qué
se cargó; *docente*, lo cargó o lo corrigió el docente.

## Para revisar primero

Las discrepancias y los valores del docente.

${revisar}
${secciones.join('\n')}
## Exámenes

${seccionesExamen.join('\n')}`

// Git en Windows puede dejar el archivo con CRLF: se compara sin los finales
// de línea, para no reescribirlo en cada corrida.
const anterior = existsSync(SALIDA) ? readFileSync(SALIDA, 'utf8').replace(/\r\n/g, '\n') : ''
if (anterior !== texto) writeFileSync(SALIDA, texto)
console.log(`resultados: ${nValores} valores en revision/resultados.md${anterior === texto ? ' (sin cambios)' : ''}.`)
