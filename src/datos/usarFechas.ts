/**
 * Las fechas de examen que el usuario cambia desde el aviso del encabezado
 * (el lápiz abre un calendario). Se guardan en localStorage, aparte del
 * progreso, y se aplican sobre las de content/config.yaml: una evaluación que
 * no se tocó sigue la fecha del contenido, y volver a elegir esa fecha borra
 * el cambio.
 *
 * También el objetivo: la evaluación que se está preparando, que se elige con
 * el desplegable del aviso del encabezado. Se guarda aparte; sin elegir, es
 * la que toca por fecha. Uno cuya fecha ya pasó no se recupera al volver a
 * abrir la app: no tiene sentido seguir preparando un examen que ya fue.
 *
 * Las evaluaciones con las fechas aplicadas, y el objetivo, llegan a toda la
 * app por contexto: el plan de Seguimiento, el aviso y el simulacro usan los
 * mismos.
 */
import { createContext } from 'preact'
import { useCallback, useContext, useMemo, useState } from 'preact/hooks'

import { conFechas, diasHasta, evaluacionObjetivo, type Evaluacion, type FechasCambiadas } from '../dominio/evaluaciones'
import { config } from './contenido'

const CLAVE = 'probabilidad-app:fechas:v1'
const CLAVE_OBJETIVO = 'probabilidad-app:objetivo:v1'
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

/** El objetivo guardado, si existe y su fecha no pasó. */
function cargarObjetivo(): string | null {
  try {
    const nombre = localStorage.getItem(CLAVE_OBJETIVO)
    const ev = evaluacionesGuardadas().find((e) => e.nombre === nombre)
    if (!ev || (ev.fecha && diasHasta(ev.fecha) < 0)) return null
    return ev.nombre
  } catch {
    return null
  }
}

function guardarObjetivo(nombre: string | null): void {
  try {
    if (nombre === null) localStorage.removeItem(CLAVE_OBJETIVO)
    else localStorage.setItem(CLAVE_OBJETIVO, nombre)
  } catch {
    /* sin persistencia, pero la elección vale mientras la página esté abierta */
  }
}

/** El objetivo con las fechas y la elección guardadas, para leerlo fuera de un componente. */
export const objetivoGuardado = (): Evaluacion | null => evaluacionObjetivo(evaluacionesGuardadas(), cargarObjetivo())

export type ApiEvaluaciones = {
  /** Las evaluaciones con las fechas del usuario aplicadas. */
  evaluaciones: readonly Evaluacion[]
  /** Las de content/config.yaml, para ofrecer volver a la fecha original. */
  originales: readonly Evaluacion[]
  cambiarFecha: (nombre: string, fecha: string | null) => void
  /** La evaluación que se está preparando: la elegida o, si no, la que toca. */
  objetivo: Evaluacion | null
  elegirObjetivo: (nombre: string) => void
}

export function usarFechas(): ApiEvaluaciones {
  const [fechas, setFechas] = useState<FechasCambiadas>(cargar)
  const [elegido, setElegido] = useState<string | null>(cargarObjetivo)

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

  const elegirObjetivo = useCallback((nombre: string) => {
    guardarObjetivo(nombre)
    setElegido(nombre)
  }, [])

  // Memorizado: el plan de la app se recalcula sólo si cambian las fechas o el objetivo.
  return useMemo(() => {
    const evaluaciones = conFechas(config.evaluaciones, fechas)
    return {
      evaluaciones,
      originales: config.evaluaciones,
      cambiarFecha,
      objetivo: evaluacionObjetivo(evaluaciones, elegido),
      elegirObjetivo,
    }
  }, [fechas, elegido])
}

export const ContextoEvaluaciones = createContext<ApiEvaluaciones>({
  evaluaciones: config.evaluaciones,
  originales: config.evaluaciones,
  cambiarFecha: () => {},
  objetivo: evaluacionObjetivo(config.evaluaciones, null),
  elegirObjetivo: () => {},
})

export const usarEvaluaciones = () => useContext(ContextoEvaluaciones)
