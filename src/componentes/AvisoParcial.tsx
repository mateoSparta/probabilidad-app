/**
 * El aviso del parcial, en dos formatos.
 *
 * `AvisoParcialCompacto` va en el encabezado: una línea con la fecha y los días
 * que faltan, teñida según el ritmo. Es lo único que se ve siempre, y por eso
 * no dice nada más.
 *
 * `AvisoParcialDetalle` va en el panel de skills, con la cuenta completa: qué
 * falta, cuántos ítems por día y si el ritmo de los últimos días alcanza.
 */
import { config } from '../datos/contenido'
import { ETIQUETA_VEREDICTO, fechaCorta, type Plan } from '../dominio/ritmo'

/** Los estados que pintan de rojo, para no repetir la lista. */
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
    default:
      return 'ritmo--neutro'
  }
}

export function AvisoParcialCompacto({ plan }: { plan: Plan }) {
  const dias = plan.diasRestantes
  const texto =
    dias > 1
      ? `faltan ${dias} días`
      : dias === 1
        ? 'es mañana'
        : dias === 0
          ? 'es hoy'
          : 'ya pasó'

  return (
    <p class={'aviso-parcial ' + tono(plan)}>
      <span class="aviso-parcial__fecha">Parcial {fechaCorta(config.parcial)}</span>
      <span class="aviso-parcial__sep" aria-hidden="true">
        ·
      </span>
      <span>{texto}</span>
    </p>
  )
}

export function AvisoParcialDetalle({ plan }: { plan: Plan }) {
  const { veredicto } = plan

  return (
    <section class={'ritmo ' + tono(plan)}>
      <h3>
        {ETIQUETA_VEREDICTO[veredicto]}
      </h3>

      {veredicto === 'listo' ? (
        <p>
          No te falta ningún tema: los {plan.skillsTotal} skills están dominados. De acá al
          parcial lo que conviene es mantenerlos, porque el dominio se mide sobre los últimos
          intentos y baja si dejás de practicar.
        </p>
      ) : veredicto === 'vencido' ? (
        <p>
          La fecha del parcial ya pasó. Si cambió, editá <code>content/config.yaml</code>.
        </p>
      ) : (
        <>
          <p class="ritmo__numero">
            <strong>{plan.porDia}</strong>
            <span> {plan.porDia === 1 ? 'ítem' : 'ítems'} por día</span>
          </p>
          <p>
            Te faltan <strong>{plan.itemsFaltantes} ítems</strong> —repartidos en{' '}
            {plan.ejerciciosFaltantes} ejercicios— para dominar los temas que todavía no
            están, y quedan {plan.diasRestantes} días. No hace falta hacer todos los
            ejercicios de la guía: con esos alcanza para cubrir los{' '}
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
        {veredicto !== 'sin_arrancar' && veredicto !== 'listo' && (
          <li>
            tu ritmo de los últimos 7 días: <strong>{plan.ritmoReciente}</strong> por día
            {plan.alDia ? ' (alcanza)' : ' (abajo del necesario)'}
          </li>
        )}
      </ul>

      {plan.skillsSinCobertura > 0 && (
        <p class="dato-chico">
          Hay {plan.skillsSinCobertura} skills más que todavía no se pueden dominar porque
          tienen menos de 3 ejercicios cargados. No cuentan para la meta: es contenido que
          falta, no algo tuyo.
        </p>
      )}

      {veredicto === 'sin_arrancar' && (
        <p class="dato-chico">
          En cuanto resuelvas algo, acá vas a ver si el ritmo alcanza.
        </p>
      )}
    </section>
  )
}
