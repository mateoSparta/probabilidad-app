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
import {
  calificar,
  ejerciciosJugables,
  elegirExamen,
  esCompleto,
  formatearTiempo,
  type Examen,
  type Respuestas,
} from '../src/dominio/simulacro.ts'
import { claveItem, type Ejercicio, type Intento, type Item } from '../src/dominio/tipos.ts'

/** Un intento mínimo, para los casos donde sólo importan el ítem y la fecha. */
function mkIntento(item: string, ts: string): Intento {
  return { item, ts, envios: 1, correcto: true, pistas: 0, revelo: false }
}

/** Un ítem mínimo pero válido, para armar exámenes de prueba. */
function unItem(id: string): Item {
  return {
    id,
    pregunta: 'x',
    skills: ['laplace'],
    respuesta: { tipo: 'numerica', valor: '1/2' },
    pistas: ['una'],
  }
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

// ------------------------------------------------------ simulacro (§6)

{
  const DIR_EX = join(RAIZ, 'content', 'examenes')
  const examenes: Examen[] = existsSync(DIR_EX)
    ? readdirSync(DIR_EX)
        .filter((f) => f.endsWith('.yaml'))
        .map((f) => load(readFileSync(join(DIR_EX, f), 'utf8')) as Examen)
    : []

  afirmar(examenes.length > 0, 'no se cargó ningún examen')

  for (const ex of examenes) {
    const jugables = ejerciciosJugables(ex)
    // Un ejercicio jugable tiene que tener todos sus ítems con respuesta.
    for (const ej of jugables) {
      for (const item of ej.items) {
        afirmar(
          !!item.respuesta?.tipo,
          `${ex.id} ej ${ej.numero}(${item.id}): está jugable pero no tiene respuesta`,
        )
      }
    }
    // Y uno no cargado nunca tiene que entrar al pool.
    for (const ej of ex.ejercicios.filter((e) => !e.cargado)) {
      afirmar(
        !jugables.includes(ej),
        `${ex.id} ej ${ej.numero}: no está cargado pero entró al pool`,
      )
    }

    // Nota perfecta y nota cero, sobre los ejercicios presentados.
    const todoBien: Respuestas = new Map(
      jugables.map((ej) => [ej.numero, ej.items.map(() => true)]),
    )
    const todoMal: Respuestas = new Map(
      jugables.map((ej) => [ej.numero, ej.items.map(() => false)]),
    )

    const perfecto = calificar(ex, todoBien)
    afirmar(perfecto.nota === 10, `${ex.id}: todo correcto no da 10, da ${perfecto.nota}`)
    afirmar(
      perfecto.ejerciciosEnteros === jugables.length,
      `${ex.id}: todo correcto no cuenta todos los ejercicios como enteros`,
    )

    const cero = calificar(ex, todoMal)
    afirmar(cero.nota === 0, `${ex.id}: todo incorrecto no da 0, da ${cero.nota}`)
    afirmar(cero.ejerciciosEnteros === 0, `${ex.id}: todo incorrecto cuenta ejercicios enteros`)

    // Sin responder nada es lo mismo que responder todo mal.
    const vacio = calificar(ex, new Map())
    afirmar(vacio.nota === 0, `${ex.id}: no responder nada no da 0`)

    // El veredicto tiene que marcarse parcial cuando el examen va recortado.
    afirmar(
      perfecto.veredictoParcial === !esCompleto(ex),
      `${ex.id}: el veredicto parcial no coincide con si el examen está completo`,
    )
    // Y con un examen recortado no puede decir que aprobaría de verdad:
    // la cátedra pide 3 ejercicios y no hay 3 para rendir.
    if (jugables.length < ex.aprueba_con) {
      afirmar(
        !perfecto.aprobaria,
        `${ex.id}: dice que aprobaría con menos ejercicios de los que la cátedra pide`,
      )
    }
  }

  // Un examen de prueba completo: la nota se reparte por ejercicio, no por ítem.
  const falso: Examen = {
    id: 'falso',
    tipo: 'parcial',
    titulo: 'de prueba',
    fecha: '2026-01-01',
    duracion_min: 240,
    aprueba_con: 1,
    ejercicios: [
      {
        numero: 1,
        guias: [1],
        en_alcance: true,
        cargado: true,
        enunciado: 'x',
        items: [unItem('a'), unItem('b')],
      },
      {
        numero: 2,
        guias: [1],
        en_alcance: true,
        cargado: true,
        enunciado: 'y',
        items: [unItem('a')],
      },
    ],
  }

  // Ejercicio 1 a medias (1 de 2 ítems) y el 2 entero: 2.5 + 5 = 7.5.
  const mitad = calificar(
    falso,
    new Map([
      [1, [true, false]],
      [2, [true]],
    ]),
  )
  afirmar(
    mitad.nota === 7.5,
    `la nota no reparte por ejercicio: dio ${mitad.nota} en vez de 7.5`,
  )
  afirmar(mitad.ejerciciosEnteros === 1, 'no contó 1 ejercicio entero')
  afirmar(!mitad.veredictoParcial, 'marcó parcial un examen completo')
  afirmar(mitad.aprobaria, 'con 1 ejercicio entero y aprueba_con 1 tendría que aprobar')

  // elegirExamen: por defecto no trae integradoras.
  const integradora: Examen = { ...falso, id: 'int', tipo: 'integradora' }
  afirmar(
    elegirExamen([integradora], { azar: () => 0 }) === null,
    'eligió una integradora sin que se pidiera',
  )
  afirmar(
    elegirExamen([integradora], { incluirIntegradoras: true, azar: () => 0 })?.id === 'int',
    'no eligió la integradora con el toggle prendido',
  )
  afirmar(elegirExamen([], { azar: () => 0 }) === null, 'eligió algo de un pool vacío')

  // El reloj.
  afirmar(formatearTiempo(240 * 60) === '4:00:00', 'el reloj no formatea 4 horas')
  afirmar(formatearTiempo(65) === '01:05', 'el reloj no formatea 65 segundos')
  afirmar(formatearTiempo(-5) === '00:00', 'el reloj no corta en cero')
}

console.log(`smoke: ${ejercicios.length} ejercicios, ${ok} afirmaciones OK.`)
for (const f of fallas) console.error(`  ✗ ${f}`)
if (fallas.length > 0) {
  console.error(`\nsmoke: ${fallas.length} falla(s).`)
  process.exit(1)
}
console.log('smoke: OK.')
