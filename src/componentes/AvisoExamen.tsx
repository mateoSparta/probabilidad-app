/**
 * El aviso del examen objetivo, en dos formatos. El objetivo es el que eligió
 * el usuario o, si no eligió, el que toca según content/config.yaml: el
 * parcial, un recuperatorio o el final (ver dominio/evaluaciones.ts); el
 * texto lo nombra a partir de ahí.
 *
 * `AvisoExamenCompacto` va en el encabezado, en un recuadro del ancho de la
 * columna: el examen, su fecha y los días que faltan, teñidos según el ritmo,
 * y un lápiz que abre el calendario para editar las fechas (EditorFecha). Es
 * lo único que se ve siempre, y por eso no dice nada más. Los chevrones de
 * los extremos cambian el objetivo, que es el mismo de Seguimiento.
 *
 * `AvisoExamenDetalle` va en Seguimiento, con la cuenta completa: qué falta,
 * cuántos ítems por día y si el ritmo de los últimos días alcanza.
 */
import type { ComponentChildren } from 'preact'
import { useState } from 'preact/hooks'

import { usarEvaluaciones } from '../datos/usarFechas'
import { rotulo, type Evaluacion } from '../dominio/evaluaciones'
import { ETIQUETA_VEREDICTO, fechaCorta, type Plan } from '../dominio/ritmo'
import type { Seccion } from '../dominio/ruta'
import { EditorFecha } from './EditorFecha'
import { IconoAnterior, IconoCalendario, IconoEditar, IconoSiguiente } from './Iconos'

/** La clase de color que corresponde a cada veredicto. */
function tono(plan: Plan): string {
  switch (plan.veredicto) {
    case 'listo':
      return 'ritmo--listo'
    case 'holgado':
      return 'ritmo--holgado'
    case 'justo':
      return 'ritmo--justo'
    case 'apretado':
    case 'vencido':
      return 'ritmo--apretado'
    // Sin fecha no hay ritmo que juzgar.
    default:
      return 'ritmo--neutro'
  }
}

export function AvisoExamenCompacto({ plan, seccion }: { plan: Plan; seccion?: Seccion }) {
  const [editando, setEditando] = useState(false)
  /** De qué lado entra el texto al cambiar de examen. */
  const [sentido, setSentido] = useState<'adelante' | 'atras' | null>(null)
  const { evaluaciones, elegirObjetivo } = usarEvaluaciones()
  const ev = plan.evaluacion
  if (!ev) return null

  // Los chevrones recorren las evaluaciones en orden y dan la vuelta.
  const i = evaluaciones.findIndex((e) => e.nombre === ev.nombre)
  const n = evaluaciones.length
  const anterior = evaluaciones[(i - 1 + n) % n]
  const siguiente = evaluaciones[(i + 1) % n]
  function cambiar(a: Evaluacion, s: 'adelante' | 'atras'): void {
    setSentido(s)
    elegirObjetivo(a.nombre)
  }
  const dias = plan.diasRestantes
  const texto =
    dias === null
      ? 'sin fecha'
      : dias > 1
        ? `faltan ${dias} días`
        : dias === 1
          ? 'es mañana'
          : dias === 0
            ? 'es hoy'
            : 'ya pasó'

  // La fecha lleva al simulacro (practicar el examen) y los días que faltan,
  // al seguimiento (cómo viene el ritmo). En la sección a la que llevarían,
  // son texto: un enlace a la misma página no lleva a ningún lado.
  return (
    <>
      <div class={'aviso-examen ' + tono(plan)}>
        {n > 1 && (
          <button
            class="aviso-examen__cambiar aviso-examen__cambiar--antes"
            aria-label={`Ver el ${anterior.nombre}`}
            data-tip={rotulo(anterior)}
            onClick={() => cambiar(anterior, 'atras')}
          >
            <IconoAnterior />
          </button>
        )}
        {/* La key vuelve a montar el texto al cambiar de examen: entra deslizándose
            del lado del chevrón. */}
        <p
          key={ev.nombre}
          class={'aviso-examen__texto' + (sentido ? ' aviso-examen__texto--' + sentido : '')}
          aria-live="polite"
        >
          <IconoCalendario />
          <Enlace
            clase="aviso-examen__fecha"
            destino="simulacro"
            actual={seccion}
            ayuda="Practicar con un simulacro"
          >
            {rotulo(ev)}
            {ev.fecha && ` ${fechaCorta(ev.fecha)}`}
          </Enlace>
          <span class="aviso-examen__sep" aria-hidden="true">
            ·
          </span>
          <Enlace clase="aviso-examen__dias" destino="seguimiento" actual={seccion} ayuda="Ver el seguimiento">
            {texto}
          </Enlace>
          <span class="aviso-examen__sep" aria-hidden="true">
            ·
          </span>
          <button
            class="aviso-examen__editar"
            aria-label="Editar las fechas de los exámenes"
            data-tip="Editar fechas"
            onClick={() => setEditando(true)}
          >
            <IconoEditar />
          </button>
        </p>
        {n > 1 && (
          <button
            class="aviso-examen__cambiar aviso-examen__cambiar--despues"
            aria-label={`Ver el ${siguiente.nombre}`}
            data-tip={rotulo(siguiente)}
            onClick={() => cambiar(siguiente, 'adelante')}
          >
            <IconoSiguiente />
          </button>
        )}
      </div>
      <EditorFecha abierto={editando} inicial={ev.nombre} onCerrar={() => setEditando(false)} />
    </>
  )
}

function Enlace({
  clase,
  destino,
  actual,
  ayuda,
  children,
}: {
  clase: string
  destino: Seccion
  actual?: Seccion
  ayuda: string
  children: ComponentChildren
}) {
  if (destino === actual) return <span class={clase + ' aviso-examen__aca'}>{children}</span>
  return (
    <a class={clase} href={'#/' + destino} data-tip={ayuda}>
      {children}
    </a>
  )
}

export function AvisoExamenDetalle({ plan }: { plan: Plan }) {
  const { veredicto } = plan
  /** "el parcial", "el final": así se lo nombra en el texto. */
  const nombre = plan.evaluacion?.nombre ?? 'examen'
  const examen = `el ${nombre}`

  return (
    <section class={'ritmo ' + tono(plan)}>
      <h3>
        {ETIQUETA_VEREDICTO[veredicto]}
      </h3>

      {veredicto === 'listo' ? (
        <p>
          Los {plan.skillsTotal} skills que entran en {examen} están dominados. Hasta la fecha
          conviene seguir practicando, porque el estado de cada skill se calcula sobre sus
          últimos 5 intentos y los errores nuevos desplazan a los aciertos anteriores.
        </p>
      ) : veredicto === 'vencido' ? (
        <p>
          La fecha del {nombre} ya pasó. Si cambió, actualizala con el lápiz del aviso de arriba.
        </p>
      ) : veredicto === 'sin_fecha' ? (
        <p>
          Todavía no hay fecha para {examen}. Faltan <strong>{plan.itemsFaltantes} ítems</strong>,
          distribuidos en {plan.ejerciciosFaltantes} ejercicios, para dominar los{' '}
          {plan.skillsTotal - plan.skillsDominados} skills pendientes. Cuando la fecha esté
          definida, cargala con el lápiz del aviso de arriba para calcular cuántos ítems por día
          hacen falta.
        </p>
      ) : (
        <>
          <p class="ritmo__numero">
            {/* Los espacios explícitos son para el texto (lectores de pantalla,
                copiar y pegar); en pantalla los separa el `gap` del flex. */}
            <span>Necesitás resolver</span>{' '}
            <strong>{plan.porDia}</strong>{' '}
            <span>{plan.porDia === 1 ? 'ítem' : 'ítems'} por día</span>
          </p>
          <p>
            Faltan <strong>{plan.itemsFaltantes} ítems</strong>, distribuidos en{' '}
            {plan.ejerciciosFaltantes} ejercicios, para dominar los temas pendientes, y quedan{' '}
            {plan.diasRestantes} días para {examen}. No es necesario resolver todos los
            ejercicios de las guías; esos ítems alcanzan para cubrir los{' '}
            {plan.skillsTotal - plan.skillsDominados} skills que faltan.
          </p>
        </>
      )}

      <ul class="ritmo__datos">
        <li>
          <strong>
            {plan.skillsDominados}/{plan.skillsTotal}
          </strong>{' '}
          skills dominados
        </li>
        {veredicto !== 'sin_arrancar' && veredicto !== 'listo' && veredicto !== 'sin_fecha' && (
          <li>
            ritmo de los últimos 7 días:{' '}
            <strong>{String(plan.ritmoReciente).replace('.', ',')}</strong>{' '}
            {plan.ritmoReciente === 1 ? 'ítem resuelto' : 'ítems resueltos'} en limpio por día
            {plan.alDia ? ' (suficiente)' : ' (inferior al necesario)'}
          </li>
        )}
      </ul>

      {veredicto === 'sin_arrancar' && (
        <p class="dato-chico">
          Cuando resuelvas los primeros ítems, acá vas a ver si el ritmo es suficiente.
        </p>
      )}
    </section>
  )
}
