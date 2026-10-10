/**
 * El aviso del parcial, en dos formatos.
 *
 * `AvisoParcialCompacto` va en el encabezado, en un recuadro del ancho de la
 * columna: la fecha y los días que faltan, con la fecha teñida según el ritmo.
 * Es lo único que se ve siempre, y por eso no dice nada más.
 *
 * `AvisoParcialDetalle` va en Seguimiento, con la cuenta completa: qué falta,
 * cuántos ítems por día y si el ritmo de los últimos días alcanza.
 */
import { config } from '../datos/contenido'
import { ETIQUETA_VEREDICTO, fechaCorta, type Plan } from '../dominio/ritmo'
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

  // La fecha lleva al simulacro (practicar el examen) y los días que faltan,
  // al seguimiento (cómo viene el ritmo).
  return (
    <p class={'aviso-parcial ' + tono(plan)}>
      <IconoCalendario />
      <a class="aviso-parcial__fecha" href="#/simulacro" title="Practicar con un simulacro">
        Parcial {fechaCorta(config.parcial)}
      </a>
      <span class="aviso-parcial__sep" aria-hidden="true">
        ·
      </span>
      <a class="aviso-parcial__dias" href="#/seguimiento" title="Ver el seguimiento">
        {texto}
      </a>
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
          Los {plan.skillsTotal} skills están dominados. Hasta el parcial conviene mantenerlos,
          porque el dominio se calcula sobre los intentos más recientes y disminuye si se deja
          de practicar.
        </p>
      ) : veredicto === 'vencido' ? (
        <p>
          La fecha del parcial ya pasó. Si cambió, actualizala en <code>content/config.yaml</code>.
        </p>
      ) : (
        <>
          <p class="ritmo__numero">
            <strong>{plan.porDia}</strong>
            <span> {plan.porDia === 1 ? 'ítem' : 'ítems'} por día</span>
          </p>
          <p>
            Faltan <strong>{plan.itemsFaltantes} ítems</strong>, distribuidos en{' '}
            {plan.ejerciciosFaltantes} ejercicios, para dominar los temas pendientes, y quedan{' '}
            {plan.diasRestantes} días. No es necesario resolver todos los ejercicios de las
            guías; esos ítems alcanzan para cubrir los{' '}
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
            ritmo de los últimos 7 días: <strong>{plan.ritmoReciente}</strong> por día
            {plan.alDia ? ' (suficiente)' : ' (inferior al necesario)'}
          </li>
        )}
      </ul>

      {plan.skillsSinCobertura > 0 && (
        <p class="dato-chico">
          Hay {plan.skillsSinCobertura} skills más que todavía no pueden dominarse porque tienen
          menos de 3 ítems cargados. No se consideran en la meta, ya que esa limitación
          proviene del contenido disponible.
        </p>
      )}

      {veredicto === 'sin_arrancar' && (
        <p class="dato-chico">
          Cuando resuelvas los primeros ítems, acá vas a ver si el ritmo es suficiente.
        </p>
      )}
    </section>
  )
}
