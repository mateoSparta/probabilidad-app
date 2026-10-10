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
  evaluarEscalar,
  TOL_REL_POR_DEFECTO,
} from '../src/dominio/respuesta.ts'
import { partirEnSegmentos, sinMarcas, skillsMarcados } from '../src/dominio/marcas.ts'
import { markdownAHtml, textoAHtml } from '../src/componentes/latex.ts'
import { escribirRuta, leerRuta } from '../src/dominio/ruta.ts'
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
import {
  anotarRespuesta,
  aJson as aJsonSesion,
  desdeJson as desdeJsonSesion,
  guardarItem,
  guardarSimulacro,
  estadoEjercicio,
  itemDeSesion,
  olvidarItem,
  podar,
  respuestasDeSimulacro,
  segundosRestantes,
  SESION_VACIA,
  seVencio,
  simulacroRetomable,
} from '../src/dominio/sesion.ts'
import {
  armarPlan,
  deficitPorSkill,
  diasHasta,
  itemsRecomendados,
  ritmoReciente,
  type Config,
  type SkillConItems,
} from '../src/dominio/ritmo.ts'
import { claveItem, type Ejercicio, type Intento, type Item } from '../src/dominio/tipos.ts'

/** Un intento mínimo, para los casos donde sólo importan el ítem y la fecha. */
function mkIntento(item: string, ts: string): Intento {
  return { item, ts, envios: 1, correcto: true, pistas: 0, revelo: false }
}

/**
 * Un valor que tiene que dar incorrecto, construido a partir del correcto.
 *
 * No alcanza con sumar 1: con una respuesta grande como 50000, el 1 % de
 * tolerancia por defecto se lo come y el valor equivocado pasaría como bueno.
 * Hay que apartarse en proporción a la tolerancia declarada, y con un piso
 * absoluto para que también funcione cuando el valor esperado es 0.
 */
function valorEquivocado(r: { valor: string; tol_rel?: number }): string {
  const tol = r.tol_rel ?? TOL_REL_POR_DEFECTO
  const v = evaluarEscalar(r.valor) ?? 0
  const salto = Math.max(1, 10 * tol * Math.abs(v))
  return `(${r.valor}) + ${salto}`
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
      afirmar(!evaluarNumerica(valorEquivocado(r), r).ok, `${quien}: el motor acepta un valor equivocado`)
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
      casiTodos[0] = valorEquivocado(r.checkpoints[0])
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
    const esperado = sinMarcas(ej.enunciado)
    afirmar(reconstruido === esperado, `${ej.id}: partir el enunciado en segmentos pierde texto`)
    afirmar(
      segmentos.some((s) => s.skills?.length),
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

  // elegirExamen: por defecto parciales; integradoras sólo si se eligen, y
  // los dos tipos no se mezclan.
  const integradora: Examen = { ...falso, id: 'int', tipo: 'integradora' }
  afirmar(
    elegirExamen([integradora], { azar: () => 0 }) === null,
    'eligió una integradora sin que se pidiera',
  )
  afirmar(
    elegirExamen([integradora, falso], { tipo: 'integradora', azar: () => 0 })?.id === 'int',
    'no eligió la integradora al pedir integradoras',
  )
  afirmar(
    elegirExamen([integradora, falso], { tipo: 'integradora', azar: () => 0.99 })?.id === 'int',
    'al pedir integradoras eligió un parcial',
  )
  afirmar(elegirExamen([], { azar: () => 0 }) === null, 'eligió algo de un pool vacío')

  // El reloj.
  afirmar(formatearTiempo(240 * 60) === '4:00:00', 'el reloj no formatea 4 horas')
  afirmar(formatearTiempo(65) === '01:05', 'el reloj no formatea 65 segundos')
  afirmar(formatearTiempo(-5) === '00:00', 'el reloj no corta en cero')
}

// --------------------------------------------- sesión / persistencia

{
  const AHORA = Date.parse('2026-03-01T12:00:00.000Z')

  // Un ítem nuevo no tiene estado guardado.
  afirmar(
    itemDeSesion(SESION_VACIA, 'g1-04:a').estado === 'pendiente',
    'un ítem sin guardar no arranca pendiente',
  )

  let s = guardarItem(SESION_VACIA, 'g1-04:a', {
    estado: 'correcto',
    envios: 1,
    entrada: '5/12',
    pistasAbiertas: 2,
  })
  afirmar(itemDeSesion(s, 'g1-04:a').estado === 'correcto', 'no se guardó el estado del ítem')
  afirmar(itemDeSesion(s, 'g1-04:a').entrada === '5/12', 'no se guardó lo tipeado')

  // Reintentar borra el estado del ítem y nada más.
  s = guardarItem(s, 'g1-04:b', { estado: 'revelado', envios: 3, pistasAbiertas: 0 })
  const tras = olvidarItem(s, 'g1-04:a')
  afirmar(itemDeSesion(tras, 'g1-04:a').estado === 'pendiente', 'reintentar no limpió el ítem')
  afirmar(
    itemDeSesion(tras, 'g1-04:b').estado === 'revelado',
    'reintentar un ítem tocó el estado de otro',
  )

  // Podar saca lo que ya no existe en el contenido.
  const podada = podar(s, new Set(['g1-04:a']))
  afirmar('g1-04:a' in podada.items, 'podar borró un ítem vigente')
  afirmar(!('g1-04:b' in podada.items), 'podar no borró un ítem que ya no existe')
  afirmar(podar(s, new Set(['g1-04:a', 'g1-04:b'])) === s, 'podar sin cambios devolvió otro objeto')

  // Ida y vuelta por JSON, que es lo que pasa al recargar la página.
  const vuelta = desdeJsonSesion(aJsonSesion(s))
  afirmar(vuelta !== null, 'la sesión no sobrevive el ida y vuelta por JSON')
  afirmar(
    vuelta !== null && itemDeSesion(vuelta, 'g1-04:a').entrada === '5/12',
    'al recargar se perdió lo tipeado',
  )
  afirmar(desdeJsonSesion('no soy json') === null, 'importar basura no dio null')
  afirmar(desdeJsonSesion('{"version":9,"items":{}}') === null, 'otra versión no dio null')
  // Un estado de ítem corrupto no tiene que tumbar la sesión entera.
  const conBasura = desdeJsonSesion('{"version":1,"items":{"x":null,"g1-04:a":{"estado":"correcto"}}}')
  afirmar(conBasura !== null, 'un ítem corrupto tumbó la sesión')
  afirmar(
    conBasura !== null && !('x' in conBasura.items) && 'g1-04:a' in conBasura.items,
    'no se filtró el ítem corrupto conservando el bueno',
  )

  // --- el simulacro y su reloj ---
  const sim = {
    examenId: 'ep-20250524',
    terminaEn: AHORA + 240 * 60_000,
    entregado: false,
    correctos: {},
  }
  afirmar(
    segundosRestantes(sim, AHORA) === 240 * 60,
    'el reloj no arranca en la duración completa',
  )
  // Recargar no regala tiempo: el vencimiento es absoluto.
  afirmar(
    segundosRestantes(sim, AHORA + 60_000) === 239 * 60,
    'pasado un minuto el reloj no bajó un minuto',
  )
  afirmar(segundosRestantes(sim, AHORA + 1e9) === 0, 'el reloj no corta en cero')
  afirmar(!seVencio(sim, AHORA), 'un simulacro recién empezado figura vencido')
  afirmar(seVencio(sim, AHORA + 1e9), 'un simulacro viejo no figura vencido')

  const conSim = guardarSimulacro(SESION_VACIA, sim)
  afirmar(
    simulacroRetomable(conSim, AHORA)?.entregado === false,
    'un simulacro en curso no se puede retomar',
  )
  // Si se venció mientras no estabas, se retoma pero ya entregado: lo
  // respondido no se pierde y el reloj no se reinicia.
  afirmar(
    simulacroRetomable(conSim, AHORA + 1e9)?.entregado === true,
    'un simulacro vencido no vuelve marcado como entregado',
  )
  afirmar(simulacroRetomable(SESION_VACIA) === undefined, 'inventó un simulacro inexistente')
  afirmar(
    guardarSimulacro(conSim, undefined).simulacro === undefined,
    'cerrar el simulacro no lo saca de la sesión',
  )

  // Anotar respuestas no pisa las de otros ejercicios ni de otros ítems.
  let anotado = anotarRespuesta(sim, 1, 0, true)
  anotado = anotarRespuesta(anotado, 1, 2, true)
  anotado = anotarRespuesta(anotado, 3, 0, false)
  const mapa = respuestasDeSimulacro(anotado)
  afirmar(mapa.get(1)?.[0] === true, 'se perdió la respuesta del ej 1 ítem 0')
  afirmar(mapa.get(1)?.[2] === true, 'se perdió la respuesta del ej 1 ítem 2')
  afirmar(mapa.get(3)?.[0] === false, 'se perdió la respuesta del ej 3')
  // Volver a contestar el mismo ítem lo sobreescribe, no lo duplica.
  const corregido = anotarRespuesta(anotado, 1, 0, false)
  afirmar(
    respuestasDeSimulacro(corregido).get(1)?.[0] === false,
    'corregir una respuesta no la sobreescribió',
  )
  afirmar(
    respuestasDeSimulacro(corregido).get(1)?.length === 3,
    'corregir una respuesta cambió la cantidad de ítems anotados',
  )
}

// ------------------------------ mapa de ejercicios y ritmo (correcciones)

{
  // --- estado agregado de un ejercicio ---
  const claves = ['x:a', 'x:b']

  afirmar(
    estadoEjercicio(SESION_VACIA, claves) === 'sin_intentar',
    'un ejercicio sin tocar no da sin_intentar',
  )
  afirmar(estadoEjercicio(SESION_VACIA, []) === 'sin_intentar', 'un ejercicio sin ítems explota')

  const unoBien = guardarItem(SESION_VACIA, 'x:a', {
    estado: 'correcto',
    envios: 1,
    pistasAbiertas: 0,
  })
  afirmar(
    estadoEjercicio(unoBien, claves) === 'en_progreso',
    'con un ítem de dos resuelto tendría que estar en progreso',
  )

  const dosBien = guardarItem(unoBien, 'x:b', {
    estado: 'correcto',
    envios: 1,
    pistasAbiertas: 0,
  })
  afirmar(estadoEjercicio(dosBien, claves) === 'resuelto', 'con los dos resueltos no da resuelto')

  const conError = guardarItem(unoBien, 'x:b', {
    estado: 'incorrecto',
    envios: 2,
    pistasAbiertas: 0,
  })
  // `mal` gana sobre `en_progreso`: interesa ver dónde quedaste trabado.
  afirmar(
    estadoEjercicio(conError, claves) === 'mal',
    'un ítem incorrecto tendría que marcar el ejercicio como mal',
  )

  // Revelar la respuesta no es resolver.
  const revelado = guardarItem(SESION_VACIA, 'x:a', {
    estado: 'revelado',
    envios: 0,
    pistasAbiertas: 3,
  })
  afirmar(
    estadoEjercicio(revelado, claves) === 'en_progreso',
    'revelar la respuesta no tendría que contar como resuelto',
  )

  // --- cuenta de días ---
  const hoy = new Date('2026-10-08T10:00:00')
  afirmar(diasHasta('2026-10-30', hoy) === 22, `diasHasta dio ${diasHasta('2026-10-30', hoy)}`)
  afirmar(diasHasta('2026-10-08', hoy) === 0, 'el mismo día no da 0')
  afirmar(diasHasta('2026-10-01', hoy) < 0, 'una fecha pasada no da negativo')
  // No depende de la hora del día: a la mañana y a la noche falta lo mismo.
  afirmar(
    diasHasta('2026-10-30', new Date('2026-10-08T23:30:00')) === 22,
    'diasHasta cambia según la hora del día',
  )

  // --- déficit y cobertura ---
  const skills: SkillConItems[] = [
    { id: 's1', items: new Set(['e1:a', 'e1:b', 'e2:a']) },
    { id: 's2', items: new Set(['e2:a', 'e2:b', 'e3:a']) },
  ]
  const skillsDeItem = new Map<string, string[]>([
    ['e1:a', ['s1']],
    ['e1:b', ['s1']],
    ['e2:a', ['s1', 's2']],
    ['e2:b', ['s2']],
    ['e3:a', ['s2']],
  ])

  const sinNada = deficitPorSkill(PROGRESO_VACIO, skills)
  afirmar(sinNada.get('s1') === 3 && sinNada.get('s2') === 3, 'sin intentos el déficit no es 3 y 3')

  // El ítem compartido tiene que elegirse primero: cubre los dos skills.
  const recomendados = itemsRecomendados(PROGRESO_VACIO, skills, skillsDeItem)
  afirmar(
    recomendados[0] === 'e2:a',
    `el greedy no empezó por el ítem compartido: ${recomendados[0]}`,
  )
  // Con 3 de déficit en cada skill y 5 ítems disponibles, hacen falta los 5.
  afirmar(recomendados.length === 5, `se recomendaron ${recomendados.length} ítems, se esperaban 5`)
  // Es estable: dos corridas con el mismo progreso dan lo mismo.
  afirmar(
    itemsRecomendados(PROGRESO_VACIO, skills, skillsDeItem).join() === recomendados.join(),
    'el greedy no es estable entre corridas',
  )

  // Lo ya resuelto limpio sale de la lista.
  let conAvance = PROGRESO_VACIO
  for (const [i, item] of ['e1:a', 'e1:b', 'e2:a'].entries()) {
    conAvance = agregar(conAvance, mkIntento(item, `2026-10-0${i + 1}T12:00:00.000Z`), true)
  }
  const despues = itemsRecomendados(conAvance, skills, skillsDeItem)
  afirmar(
    !despues.includes('e1:a') && !despues.includes('e2:a'),
    'el greedy recomienda ítems que ya se resolvieron limpio',
  )
  afirmar(
    despues.length < recomendados.length,
    'la cantidad de ítems faltantes no bajó al resolver',
  )

  // --- ritmo reciente ---
  afirmar(ritmoReciente(PROGRESO_VACIO, 7, hoy) === 0, 'sin intentos el ritmo no es 0')
  // Siete limpios en los siete días previos dan ritmo 1. Las fechas van del 2
  // al 8 para que ninguna caiga justo en el borde de la ventana, que se
  // correría según la zona horaria.
  let siete = PROGRESO_VACIO
  for (let i = 2; i <= 8; i++) {
    siete = agregar(siete, mkIntento(`r${i}:a`, `2026-10-0${i}T12:00:00.000Z`), true)
  }
  afirmar(
    Math.abs(ritmoReciente(siete, 7, new Date('2026-10-08T22:00:00')) - 1) < 1e-9,
    `siete limpios en siete días dieron ritmo ${ritmoReciente(siete, 7, new Date('2026-10-08T22:00:00'))}`,
  )

  // --- el plan ---
  const config: Config = { parcial: '2026-10-30', curso: null, ritmo_comodo_por_dia: 2 }

  const planVacio = armarPlan(PROGRESO_VACIO, skills, skillsDeItem, config, hoy)
  afirmar(
    planVacio.veredicto === 'sin_arrancar',
    `sin intentos el veredicto es ${planVacio.veredicto}`,
  )
  afirmar(planVacio.diasRestantes === 22, 'el plan no cuenta bien los días')
  afirmar(planVacio.itemsFaltantes === 5, 'el plan no cuenta bien los ítems faltantes')
  afirmar(planVacio.ejerciciosFaltantes === 3, 'el plan no agrupa los ítems por ejercicio')
  afirmar(planVacio.skillsDominados === 0, 'sin intentos hay skills dominados')
  afirmar(planVacio.porDia >= 1, 'el ritmo necesario con todo por hacer es menor que 1')

  // Con todo dominado, el veredicto es listo y no falta nada.
  let todo = PROGRESO_VACIO
  for (const [i, item] of ['e1:a', 'e1:b', 'e2:a', 'e2:b', 'e3:a'].entries()) {
    todo = agregar(todo, mkIntento(item, `2026-10-0${i + 1}T12:00:00.000Z`), true)
  }
  const planListo = armarPlan(todo, skills, skillsDeItem, config, hoy)
  afirmar(planListo.veredicto === 'listo', `con todo hecho el veredicto es ${planListo.veredicto}`)
  afirmar(planListo.itemsFaltantes === 0, 'con todo hecho todavía faltan ítems')
  afirmar(planListo.skillsDominados === 2, 'con todo hecho no cuenta los dos skills')
  afirmar(planListo.porDia === 0, 'con todo hecho el ritmo necesario no es 0')

  // Con la fecha pasada, vencido.
  const planVencido = armarPlan(conAvance, skills, skillsDeItem, config, new Date('2026-11-05'))
  afirmar(planVencido.veredicto === 'vencido', 'con la fecha pasada el veredicto no es vencido')

  // El ritmo necesario sube si quedan menos días.
  const lejos = armarPlan(conAvance, skills, skillsDeItem, config, hoy)
  const cerca = armarPlan(conAvance, skills, skillsDeItem, config, new Date('2026-10-29T10:00:00'))
  afirmar(cerca.porDia >= lejos.porDia, 'con menos días el ritmo necesario no sube')

  // Con todo por hacer y un día, el ritmo tiene que dar apretado. Hace falta
  // al menos un intento registrado para salir de `sin_arrancar`, así que se
  // usa uno NO limpio: cuenta como actividad pero no reduce el déficit.
  const soloSucio = agregar(
    PROGRESO_VACIO,
    mkIntento('e1:a', '2026-10-28T12:00:00.000Z'),
    false,
  )
  const ultimoDia = armarPlan(
    soloSucio,
    skills,
    skillsDeItem,
    config,
    new Date('2026-10-29T10:00:00'),
  )
  afirmar(ultimoDia.itemsFaltantes === 5, 'un intento no limpio redujo el déficit')
  afirmar(
    ultimoDia.veredicto === 'apretado',
    `con 5 ítems y un día el veredicto es ${ultimoDia.veredicto}`,
  )

  // --- skills que no se pueden dominar ---
  // Un skill con 2 ítems no llega nunca a 3 limpios, así que queda afuera de
  // la meta: si contara, el veredicto `listo` sería inalcanzable para siempre.
  const conUnoCorto: SkillConItems[] = [
    ...skills,
    { id: 's3', items: new Set(['e4:a', 'e4:b']) },
  ]
  const deItemAmpliado = new Map(skillsDeItem)
  deItemAmpliado.set('e4:a', ['s3'])
  deItemAmpliado.set('e4:b', ['s3'])

  const planCorto = armarPlan(todo, conUnoCorto, deItemAmpliado, config, hoy)
  afirmar(planCorto.skillsSinCobertura === 1, 'no se contó el skill sin cobertura')
  afirmar(planCorto.skillsTotal === 2, 'el skill corto entró en la meta')
  afirmar(
    planCorto.veredicto === 'listo',
    `con la meta cumplida y un skill corto el veredicto es ${planCorto.veredicto}`,
  )
  afirmar(planCorto.itemsFaltantes === 0, 'el skill corto sumó ítems faltantes')
  // Y sin el skill corto el resultado es el mismo: no cambia nada.
  afirmar(
    armarPlan(todo, skills, skillsDeItem, config, hoy).itemsFaltantes ===
      planCorto.itemsFaltantes,
    'agregar un skill sin cobertura cambió los ítems faltantes',
  )
}

// --------------------------------------------- puntuación pegada a fórmulas

{
  // El signo va adentro de la última caja de KaTeX, antes de cerrar la caja,
  // el contenedor y la raíz.
  const fin = textoAHtml('Calcular $P(A)$.')
  afirmar(
    fin.endsWith('<span class="puntuacion">.</span></span></span></span>'),
    `el punto no quedó adentro de la última caja de la fórmula: ${fin.slice(-70)}`,
  )

  const varias = textoAHtml('Sean $a$, $b$ y $c$; luego ($x$).')
  const signos = [...varias.matchAll(/class="puntuacion">([^<]*)</g)].map((m) => m[1])
  // $a$ con la coma, $c$ con el punto y coma, $x$ con los dos paréntesis; $b$ no.
  afirmar(
    signos.join(' ') === ', ; ( ).',
    `la puntuación repartida entre fórmulas fue ${JSON.stringify(signos)}`,
  )
  afirmar(varias.includes(' y '), 'se perdió texto entre fórmulas al repartir la puntuación')
  afirmar(!varias.includes('luego (<'), 'el paréntesis de apertura quedó afuera de la fórmula')

  // Lo que no lleva puntuación pegada no se toca.
  const suelta = textoAHtml('vale $x$ y nada más')
  afirmar(!suelta.includes('puntuacion'), 'se pegó puntuación a una fórmula que no la tenía')

  // Una fórmula en display no lleva nada: ocupa su propio renglón.
  afirmar(
    !textoAHtml('$$x^2$$.').includes('puntuacion'),
    'se pegó puntuación a una fórmula en display',
  )

  // En Markdown, igual, y la tabla va en su contenedor.
  const md = markdownAHtml('Vale $x$.\n\n| a | b |\n|---|---|\n| $1$ | $2$ |\n')
  afirmar(md.includes('class="puntuacion">.<'), 'en Markdown el punto no entró en la fórmula')
  afirmar(md.includes('<div class="tabla"><table>'), 'la tabla de Markdown no va en su contenedor')

  // `\$` es un signo de pesos: no abre una fórmula, aunque haya varios.
  const pesos = textoAHtml('aportando \\$2000, o bien \\$4000, con $p = 1/2$.')
  afirmar(pesos.includes('aportando $2000, o bien $4000'), `los \\$ no quedaron como pesos: ${pesos.slice(0, 80)}`)
  afirmar((pesos.match(/class="katex"/g) ?? []).length === 1, 'un \\$ abrió una fórmula')
  afirmar(markdownAHtml('cuesta \\$20.').includes('cuesta $20.'), 'en Markdown el \\$ no quedó como pesos')

  // El único formato en línea fuera de la teoría: negrita y código.
  const formato = textoAHtml('es **menor** que $x$; escribí `l1`.')
  afirmar(formato.includes('<strong>menor</strong>'), 'la negrita se ve con asteriscos')
  afirmar(formato.includes('<code>l1</code>'), 'el código se ve con comillas invertidas')
}

// ----------------------------------------------------------------- rutas

{
  const casos: [string, string, number][] = [
    ['', 'menu', 1],
    ['#/', 'menu', 1],
    ['#/ejercicios/3', 'ejercicios', 3],
    ['#/ejercicios', 'ejercicios', 1],
    ['#/skills', 'skills', 1],
    ['#/simulacro', 'simulacro', 1],
    ['#/seguimiento', 'seguimiento', 1],
    ['#/cualquiera', 'menu', 1],
    ['#ej-g1-04', 'menu', 1],
  ]
  for (const [hash, seccion, guia] of casos) {
    const r = leerRuta(hash)
    afirmar(
      r.seccion === seccion && r.guia === guia,
      `leerRuta(${JSON.stringify(hash)}) dio ${r.seccion}/${r.guia}, se esperaba ${seccion}/${guia}`,
    )
  }
  // La guía anterior se conserva al pasar por una sección que no la lleva.
  afirmar(leerRuta('#/skills', 5).guia === 5, 'pasar por Skills hizo perder la guía')
  // Escribir y volver a leer da la misma ruta.
  for (const seccion of ['menu', 'ejercicios', 'skills', 'simulacro', 'seguimiento'] as const) {
    const r = { seccion, guia: 4 }
    const vuelta = leerRuta(escribirRuta(r), 4)
    afirmar(vuelta.seccion === seccion && vuelta.guia === 4, `ida y vuelta de la ruta ${seccion}`)
  }
}

// ---------------------------------------------- marcas con varios skills

{
  const t = 'Si [[prob-total,condicional|sale roja, se saca de $b$]]. Fin.'
  const segs = partirEnSegmentos(t)
  const marcado = segs.find((x) => x.skills)
  afirmar(
    marcado?.skills?.join(',') === 'prob-total,condicional',
    'una marca con dos skills no se partió en dos',
  )
  // El punto que sigue a la marca pasa adentro del fragmento.
  afirmar(marcado?.texto.endsWith('$b$.') ?? false, 'el punto tras la marca no pasó al fragmento')
  afirmar(segs.map((x) => x.texto).join('') === sinMarcas(t), 'partir la marca perdió texto')
  afirmar(
    skillsMarcados(t).join(',') === 'prob-total,condicional',
    'skillsMarcados no separa los skills de una marca',
  )
}

console.log(`smoke: ${ejercicios.length} ejercicios, ${ok} afirmaciones OK.`)
for (const f of fallas) console.error(`  ✗ ${f}`)
if (fallas.length > 0) {
  console.error(`\nsmoke: ${fallas.length} falla(s).`)
  process.exit(1)
}
console.log('smoke: OK.')
