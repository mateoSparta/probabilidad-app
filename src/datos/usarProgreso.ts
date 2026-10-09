/**
 * El progreso como estado de la app: carga desde localStorage al arrancar y
 * guarda en cada intento.
 */
import { useCallback, useState } from 'preact/hooks'

import { agregar, PROGRESO_VACIO, type Progreso } from '../dominio/progreso'
import type { Intento } from '../dominio/tipos'
import { borrar, cargar, guardar } from './almacenamiento'

export type ApiProgreso = {
  progreso: Progreso
  registrar: (intento: Intento, limpio: boolean) => void
  reemplazar: (p: Progreso) => void
  reiniciar: () => void
}

export function usarProgreso(): ApiProgreso {
  const [progreso, setProgreso] = useState<Progreso>(cargar)

  const registrar = useCallback((intento: Intento, limpio: boolean) => {
    setProgreso((actual) => {
      const siguiente = agregar(actual, intento, limpio)
      // `agregar` devuelve el mismo objeto si el ítem ya contó hoy.
      if (siguiente !== actual) guardar(siguiente)
      return siguiente
    })
  }, [])

  const reemplazar = useCallback((p: Progreso) => {
    guardar(p)
    setProgreso(p)
  }, [])

  const reiniciar = useCallback(() => {
    borrar()
    setProgreso(PROGRESO_VACIO)
  }, [])

  return { progreso, registrar, reemplazar, reiniciar }
}
