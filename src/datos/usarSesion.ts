/**
 * La sesión como estado de la app. Carga de localStorage al arrancar, poda
 * lo que ya no existe en el contenido y guarda en cada cambio.
 */
import { useCallback, useState } from 'preact/hooks'

import {
  guardarItem,
  guardarSimulacro,
  itemDeSesion,
  olvidarItem,
  podar,
  SESION_VACIA,
  type Sesion,
  type SesionItem,
  type SesionSimulacro,
} from '../dominio/sesion'
import { borrarSesion, cargarSesion, guardarSesion } from './almacenamiento'
import { clavesDeItems } from './contenido'

export type ApiSesion = {
  sesion: Sesion
  /** El estado guardado de un ítem, o uno nuevo. */
  item: (clave: string) => SesionItem
  anotarItem: (clave: string, item: SesionItem) => void
  /** Borra el estado de un ítem para poder rehacerlo. No toca el historial. */
  reiniciarItem: (clave: string) => void
  anotarSimulacro: (sim: SesionSimulacro | undefined) => void
  reiniciar: () => void
}

export function usarSesion(): ApiSesion {
  const [sesion, setSesion] = useState<Sesion>(() => podar(cargarSesion(), clavesDeItems))

  const aplicar = useCallback((f: (s: Sesion) => Sesion) => {
    setSesion((actual) => {
      const siguiente = f(actual)
      if (siguiente !== actual) guardarSesion(siguiente)
      return siguiente
    })
  }, [])

  return {
    sesion,
    item: (clave) => itemDeSesion(sesion, clave),
    anotarItem: useCallback(
      (clave, item) => aplicar((s) => guardarItem(s, clave, item)),
      [aplicar],
    ),
    reiniciarItem: useCallback((clave) => aplicar((s) => olvidarItem(s, clave)), [aplicar]),
    anotarSimulacro: useCallback(
      (sim) => aplicar((s) => guardarSimulacro(s, sim)),
      [aplicar],
    ),
    reiniciar: useCallback(() => {
      borrarSesion()
      setSesion(SESION_VACIA)
    }, []),
  }
}
