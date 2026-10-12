/**
 * Las fechas de examen que el usuario cambia desde el aviso del encabezado
 * (el lápiz abre un calendario). Se guardan en localStorage, aparte del
 * progreso, y se aplican sobre las de content/config.yaml: una evaluación que
 * no se tocó sigue la fecha del contenido, y volver a elegir esa fecha borra
 * el cambio.
 *
 * Las evaluaciones con las fechas aplicadas llegan a toda la app por
 * contexto: el plan de Seguimiento, el aviso y el simulacro usan las mismas.
 */
import { createContext } from 'preact'
import { useCallback, useContext, useMemo, useState } from 'preact/hooks'

import { conFechas, type Evaluacion, type FechasCambiadas } from '../dominio/evaluaciones'
import { config } from './contenido'

const CLAVE = 'probabilidad-app:fechas:v1'
const ISO = /^\d{4}-\d{2}-\d{2}$/

function cargar(): FechasCambiadas {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return {}
    const leido = JSON.parse(crudo) as Record<string, unknown>
    // Sólo fechas ISO o null, y sólo de evaluaciones que existen.
    const nombres = new Set(config.evaluaciones.map((ev) => ev.nombre))
    return Object.fromEntries(
      Object.entries(leido).filter(([k, v]) => nombres.has(k) && (v === null || (typeof v === 'string' && ISO.test(v)))),
    ) as FechasCambiadas
  } catch {
    return {}
  }
}

function guardar(f: FechasCambiadas): void {
  try {
    if (Object.keys(f).length === 0) localStorage.removeItem(CLAVE)
    else localStorage.setItem(CLAVE, JSON.stringify(f))
  } catch {
    /* sin persistencia, pero el cambio vale mientras la página esté abierta */
  }
}

/** Las evaluaciones con las fechas guardadas, para leerlas fuera de un componente. */
export const evaluacionesGuardadas = (): Evaluacion[] => conFechas(config.evaluaciones, cargar())

export type ApiEvaluaciones = {
  /** Las evaluaciones con las fechas del usuario aplicadas. */
  evaluaciones: readonly Evaluacion[]
  /** Las de content/config.yaml, para ofrecer volver a la fecha original. */
  originales: readonly Evaluacion[]
  cambiarFecha: (nombre: string, fecha: string | null) => void
}

export function usarFechas(): ApiEvaluaciones {
  const [fechas, setFechas] = useState<FechasCambiadas>(cargar)

  const cambiarFecha = useCallback((nombre: string, fecha: string | null) => {
    setFechas((actuales) => {
      const original = config.evaluaciones.find((ev) => ev.nombre === nombre)?.fecha ?? null
      const siguientes: Record<string, string | null> = { ...actuales }
      if (fecha === original) delete siguientes[nombre]
      else siguientes[nombre] = fecha
      guardar(siguientes)
      return siguientes
    })
  }, [])

  // Memorizado: el plan de la app se recalcula sólo si cambian las fechas.
  return useMemo(
    () => ({ evaluaciones: conFechas(config.evaluaciones, fechas), originales: config.evaluaciones, cambiarFecha }),
    [fechas],
  )
}

export const ContextoEvaluaciones = createContext<ApiEvaluaciones>({
  evaluaciones: config.evaluaciones,
  originales: config.evaluaciones,
  cambiarFecha: () => {},
})

export const usarEvaluaciones = () => useContext(ContextoEvaluaciones)
