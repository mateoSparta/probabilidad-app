/**
 * Prueba de punta a punta del motor contra el contenido real.
 *
 * Para cada ítem del contenido chequea que el evaluador acepte el valor
 * declarado y rechace uno equivocado. Es lo que distingue "el validador no
 * encontró errores" de "el motor realmente resuelve estos ítems".
 *
 * Uso:  npm run smoke
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { load } from 'js-yaml'

import {
  evaluarCheckpoints,
  evaluarExpresion,
  evaluarNumerica,
  evaluarOpcion,
} from '../src/dominio/respuesta.ts'
import { partirEnSegmentos, skillsMarcados } from '../src/dominio/marcas.ts'
import {
  agregar,
  aJson,
  desdeJson,
  estadoSkill,
  PROGRESO_VACIO,
  type Progreso,
} from '../src/dominio/progreso.ts'
import { claveItem, type Ejercicio, type Intento } from '../src/dominio/tipos.ts'

/** Un intento mínimo, para los casos donde sólo importan el ítem y la fecha. */
function mkIntento(item: string, ts: string): Intento {
  return { item, ts, envios: 1, correcto: true, pistas: 0, revelo: false }
}

const RAIZ = resolve(import.meta.dirname, '..')
const GUIAS = join(RAIZ, 'content', 'guias')

let ok = 0
const fallas: string[] = []

function afirmar(cond: boolean, mensaje: string) {
  if (cond) ok++
  else fallas.push(mensaje)
}

const ejercicios: Ejercicio[] = []
if (existsSync(GUIAS)) {
  for (const dir of readdirSync(GUIAS)) {
    const dirEj = join(GUIAS, dir, 'ejercicios')
    if (!existsSync(dirEj)) continue
    for (const f of readdirSync(dirEj).filter((x) => x.endsWith('.yaml'))) {
      ejercicios.push(load(readFileSync(join(dirEj, f), 'utf8')) as Ejercicio)
    }
  }
}

for (const ej of ejercicios) {
  for (const item of ej.items) {
    const quien = `${ej.id}(${item.id})`
    const r = item.respuesta

    if (r.tipo === 'numerica') {
      afirmar(evaluarNumerica(r.valor, r).ok, `${quien}: el motor rechaza su propio valor ${r.valor}`)
      // Un valor claramente distinto tiene que fallar. Se usa +1 y no un
      // múltiplo para que también funcione cuando el valor esperado es 0.
      const mal = `(${r.valor}) + 1`
      afirmar(!evaluarNumerica(mal, r).ok, `${quien}: el motor acepta un valor equivocado`)
      afirmar(
        !evaluarNumerica('', r).ok && !evaluarNumerica('qwe', r).ok,
        `${quien}: el motor acepta basura`,
      )
    }

    if (r.tipo === 'expresion') {
      afirmar(evaluarExpresion(r.valor, r).ok, `${quien}: el motor rechaza su propia expresión`)
      afirmar(
        !evaluarExpresion(`(${r.valor}) + 1`, r).ok,
        `${quien}: el motor acepta una expresión equivocada`,
      )
    }

    if (r.tipo === 'opcion') {
      const correcta = r.opciones.find((o) => o.correcta)!
      afirmar(evaluarOpcion(correcta.id, r).ok, `${quien}: el motor rechaza la opción correcta`)
      for (const o of r.opciones.filter((x) => !x.correcta)) {
        const v = evaluarOpcion(o.id, r)
        afirmar(!v.ok, `${quien}: el motor acepta el distractor ${o.id}`)
        afirmar(
          !!(v as { error_tipico?: string }).error_tipico,
          `${quien}: el distractor ${o.id} no devuelve su error típico`,
        )
      }
    }

    if (r.tipo === 'checkpoints') {
      const valores = r.checkpoints.map((c) => c.valor)
      afirmar(
        evaluarCheckpoints(valores, r).ok,
        `${quien}: el motor rechaza sus propios checkpoints`,
      )
      // Con uno mal, el ítem entero tiene que dar incorrecto.
      const casiTodos = [...valores]
      casiTodos[0] = `(${casiTodos[0]}) + 1`
      afirmar(
        !evaluarCheckpoints(casiTodos, r).ok,
        `${quien}: el motor acepta los checkpoints con uno mal`,
      )
    }
  }

  // Las marcas del enunciado tienen que poder partirse sin perder texto.
  const marcados = skillsMarcados(ej.enunciado)
  if (marcados.length > 0) {
    const segmentos = partirEnSegmentos(ej.enunciado)
    const reconstruido = segmentos.map((s) => s.texto).join('')
    const esperado = ej.enunciado.replace(/\[\[[a-z0-9-]+\|([^\]]+)\]\]/g, '$1')
    afirmar(reconstruido === esperado, `${ej.id}: partir el enunciado en segmentos pierde texto`)
    afirmar(
      segmentos.some((s) => s.skill),
      `${ej.id}: tiene marcas pero no se detectó ningún segmento marcado`,
    )
  }
}

// Formas de escribir el mismo número que el alumno podría usar.
const equivalentes: [string, string][] = [
  ['47/120', '0.39167'],
  ['1/6', '0.1667'],
  ['5/12', '1 - 7/12'],
  ['3/5', '0,6'], // coma decimal, como se escribe acá
]
for (const [valor, alternativa] of equivalentes) {
  afirmar(
    evaluarNumerica(alternativa, { tipo: 'numerica', valor }).ok,
    `el motor no acepta \`${alternativa}\` como ${valor}`,
  )
}

// ------------------------------------------------- estados de skill (§5)

{
  const items = new Set(['g1-04:a', 'g1-04:b', 'g1-04:c', 'g1-04:d', 'g1-05:a'])

  /** Construye un progreso con una lista de (ítem, día, limpio). */
  function conIntentos(filas: [string, number, boolean][]): Progreso {
    let p = PROGRESO_VACIO
    for (const [item, diaDelMes, limpio] of filas) {
      const ts = `2026-03-${String(diaDelMes).padStart(2, '0')}T12:00:00.000Z`
      p = agregar(p, { item, ts, envios: 1, correcto: limpio, pistas: 0, revelo: !limpio }, limpio)
    }
    return p
  }

  afirmar(estadoSkill(PROGRESO_VACIO, items) === 'sin_explorar', 'sin intentos no da sin_explorar')

  afirmar(
    estadoSkill(conIntentos([['g1-04:a', 1, true]]), items) === 'en_desarrollo',
    'un solo intento limpio tendría que ser en_desarrollo, no dominado',
  )

  afirmar(
    estadoSkill(
      conIntentos([
        ['g1-04:a', 1, true],
        ['g1-04:b', 2, true],
        ['g1-04:c', 3, true],
      ]),
      items,
    ) === 'dominado',
    '3 limpios en la ventana no dan dominado',
  )

  afirmar(
    estadoSkill(
      conIntentos([
        ['g1-04:a', 1, false],
        ['g1-04:b', 2, false],
        ['g1-04:c', 3, false],
      ]),
      items,
    ) === 'flojo',
    '3 intentos con 0 limpios no dan flojo',
  )

  afirmar(
    estadoSkill(
      conIntentos([
        ['g1-04:a', 1, true],
        ['g1-04:b', 2, false],
        ['g1-04:c', 3, false],
      ]),
      items,
    ) === 'flojo',
    '3 intentos con 1 limpio no dan flojo',
  )

  // El dominio se mide sobre los últimos 5: tres limpios viejos tapados por
  // cinco fallados recientes tienen que dejar de alcanzar.
  const viejoDominado = conIntentos([
    ['g1-04:a', 1, true],
    ['g1-04:b', 2, true],
    ['g1-04:c', 3, true],
    ['g1-04:d', 10, false],
    ['g1-05:a', 11, false],
    ['g1-04:a', 12, false],
    ['g1-04:b', 13, false],
    ['g1-04:c', 14, false],
  ])
  afirmar(
    estadoSkill(viejoDominado, items) === 'flojo',
    'el dominio no caduca: cinco fallados recientes tendrían que tapar tres limpios viejos',
  )

  // Un intento por ítem por día.
  const mismoDia = agregar(
    agregar(PROGRESO_VACIO, mkIntento('g1-04:a', '2026-03-01T09:00:00.000Z'), true),
    mkIntento('g1-04:a', '2026-03-01T22:00:00.000Z'),
    false,
  )
  afirmar(mismoDia.intentos.length === 1, 'se registró más de un intento del mismo ítem en el día')

  const otroDia = agregar(
    agregar(PROGRESO_VACIO, mkIntento('g1-04:a', '2026-03-01T09:00:00.000Z'), true),
    mkIntento('g1-04:a', '2026-03-02T09:00:00.000Z'),
    false,
  )
  afirmar(otroDia.intentos.length === 2, 'no se registró el intento del día siguiente')

  // Exportar e importar tiene que ser ida y vuelta.
  const ida = aJson(otroDia)
  const vuelta = desdeJson(ida)
  afirmar(
    vuelta !== null && vuelta.intentos.length === otroDia.intentos.length,
    'exportar e importar el progreso no es ida y vuelta',
  )
  afirmar(desdeJson('no soy json') === null, 'importar basura no devolvió null')
  afirmar(desdeJson('{"version":9}') === null, 'importar otra versión no devolvió null')

  // Los ítems se identifican globalmente: (b) de 1.4 no es (b) de 1.5.
  afirmar(
    claveItem('g1-04', 'b') !== claveItem('g1-05', 'b'),
    'dos ítems de ejercicios distintos comparten clave',
  )
}

console.log(`smoke: ${ejercicios.length} ejercicios, ${ok} afirmaciones OK.`)
for (const f of fallas) console.error(`  ✗ ${f}`)
if (fallas.length > 0) {
  console.error(`\nsmoke: ${fallas.length} falla(s).`)
  process.exit(1)
}
console.log('smoke: OK.')
