/**
 * El mapa de la guía: un círculo por ejercicio, con su estado de un vistazo.
 *
 * Reemplaza a los chips que filtraban por skill. La idea es distinta: en vez de
 * esconder ejercicios, mostrar dónde estás parado en todos a la vez.
 *
 *   gris vacío      no se intentó
 *   borde ámbar     en progreso
 *   borde rojo      hay un error sin resolver
 *   borde verde     resuelto
 *
 * Al hacer clic se baja hasta el ejercicio. En Seguimiento, donde el ejercicio
 * no está en la página, el clic lo resuelve quien usa el mapa (`onElegir`).
 */
import type { ApiSesion } from '../datos/usarSesion'
import { ejercicioPorId } from '../datos/contenido'
import {
  ETIQUETA_ESTADO_EJERCICIO,
  estadoEjercicio,
  type EstadoEjercicio,
} from '../dominio/sesion'
import { claveItem, type Guia } from '../dominio/tipos'

/** Baja hasta un ancla sin romper si no existe (por ejemplo, en SSR). */
export function irA(id: string, suave = true): void {
  if (typeof document === 'undefined') return
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' })
}

type Props = {
  guia: Guia
  sesion?: ApiSesion
  /** Qué hacer al elegir un ejercicio. Por defecto, bajar hasta él. */
  onElegir?: (idEjercicio: string) => void
}

export function MapaEjercicios({ guia, sesion, onElegir }: Props) {
  const ejercicios = guia.secuencia
    .filter((p) => p.tipo === 'ejercicio')
    .map((p) => ejercicioPorId.get(p.id))
    .filter((e): e is NonNullable<typeof e> => !!e)

  if (ejercicios.length === 0) return null

  const resueltos = ejercicios.filter(
    (ej) => estadoDe(ej.id) === 'resuelto',
  ).length

  function estadoDe(idEjercicio: string): EstadoEjercicio {
    const ej = ejercicioPorId.get(idEjercicio)
    if (!ej || !sesion) return 'sin_intentar'
    return estadoEjercicio(
      sesion.sesion,
      ej.items.map((i) => claveItem(ej.id, i.id)),
    )
  }

  return (
    <nav class="mapa" aria-label="Ejercicios de la guía">
      <ul class="mapa__fila">
        {ejercicios.map((ej, i) => {
          const estado = estadoDe(ej.id)
          const etiqueta = `${ej.numero} — ${ETIQUETA_ESTADO_EJERCICIO[estado]}`
          return (
            <li key={ej.id} style={{ '--i': i }}>
              <button
                class={'punto punto--' + estado}
                onClick={() => (onElegir ? onElegir(ej.id) : irA('ej-' + ej.id))}
                aria-label={`Ir al ejercicio ${etiqueta}`}
                data-tip={etiqueta}
              >
                <span class="sr-solo">{etiqueta}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <p class="mapa__cuenta">
        {resueltos} de {ejercicios.length} resueltos
      </p>
    </nav>
  )
}
