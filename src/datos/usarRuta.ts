/**
 * La ruta actual, sincronizada con el hash de la URL.
 *
 * Navegar es cambiar el hash: eso agrega una entrada al historial, así que el
 * botón de atrás funciona sin hacer nada más. Los enlaces de la cabecera y del
 * menú son `<a href="#/...">` comunes; este hook sólo escucha el cambio.
 */
import { useEffect, useState } from 'preact/hooks'

import { escribirRuta, leerRuta, RUTA_INICIAL, type Ruta } from '../dominio/ruta'

function rutaActual(guiaPorDefecto: number): Ruta {
  if (typeof location === 'undefined') return RUTA_INICIAL
  return leerRuta(location.hash, guiaPorDefecto)
}

export function usarRuta(): { ruta: Ruta; ir: (r: Ruta) => void } {
  const [ruta, setRuta] = useState<Ruta>(() => rutaActual(1))

  useEffect(() => {
    // La guía se conserva al pasar por secciones que no la llevan en la URL,
    // para que volver a Ejercicios desde el menú te deje en la misma guía.
    const alCambiar = () => setRuta((anterior) => rutaActual(anterior.guia))
    addEventListener('hashchange', alCambiar)
    return () => removeEventListener('hashchange', alCambiar)
  }, [])

  function ir(r: Ruta): void {
    const hash = escribirRuta(r)
    if (location.hash === hash) setRuta(r)
    else location.hash = hash
  }

  return { ruta, ir }
}
