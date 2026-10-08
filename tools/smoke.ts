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
import type { Ejercicio } from '../src/dominio/tipos.ts'

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

console.log(`smoke: ${ejercicios.length} ejercicios, ${ok} afirmaciones OK.`)
for (const f of fallas) console.error(`  ✗ ${f}`)
if (fallas.length > 0) {
  console.error(`\nsmoke: ${fallas.length} falla(s).`)
  process.exit(1)
}
console.log('smoke: OK.')
