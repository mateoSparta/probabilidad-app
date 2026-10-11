/**
 * El aviso del próximo examen, en dos formatos. El examen es el que toque
 * según content/config.yaml: el parcial, el final o el que siga (ver
 * dominio/evaluaciones.ts); el texto lo nombra a partir de ahí.
 *
 * `AvisoExamenCompacto` va en el encabezado, en un recuadro del ancho de la
 * columna: el examen, su fecha y los días que faltan, teñidos según el ritmo.
 * Es lo único que se ve siempre, y por eso no dice nada más.
 *
 * `AvisoExamenDetalle` va en Seguimiento, con la cuenta completa: qué falta,
 * cuántos ítems por día y si el ritmo de los últimos días alcanza.
 */
import type { ComponentChildren } from 'preact'

import { rotulo } from '../dominio/evaluaciones'
import { ETIQUETA_VEREDICTO, fechaCorta, type Plan } from '../dominio/ritmo'
import type { Seccion } from '../dominio/ruta'
import { IconoCalendario } from './Iconos'

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
  const ev = plan.evaluacion
  if (!ev) return null
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
    <p class={'aviso-examen ' + tono(plan)}>
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
    </p>
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
          La fecha del {nombre} ya pasó. Si cambió, actualizala en{' '}
          <code>content/config.yaml</code>.
        </p>
      ) : veredicto === 'sin_fecha' ? (
        <p>
          Todavía no hay fecha para {examen}. Faltan <strong>{plan.itemsFaltantes} ítems</strong>,
          distribuidos en {plan.ejerciciosFaltantes} ejercicios, para dominar los{' '}
          {plan.skillsTotal - plan.skillsDominados} skills pendientes. Cuando la fecha esté
          definida, cargala en <code>content/config.yaml</code> para calcular cuántos ítems por
          día hacen falta.
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
