/**
 * Menú de hamburguesa: el acceso a las otras secciones desde cualquier lugar
 * que no sea el menú principal.
 *
 * Va en la esquina superior derecha de la columna de la app, no de la
 * ventana, alineado con las migas. Lista todas las secciones menos la actual,
 * con "Inicio" primero.
 *
 * Se cierra al elegir una opción, al hacer clic afuera, con Escape y al
 * cambiar de sección por cualquier otro camino (el botón de atrás, por
 * ejemplo).
 */
import type { ComponentType } from 'preact'
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'

import { escribirRuta, NOMBRE_SECCION, type Ruta, type Seccion } from '../dominio/ruta'
import {
  IconoEjercicios,
  IconoInicio,
  IconoSeguimiento,
  IconoSimulacro,
  IconoSkills,
} from './Iconos'

type Opcion = { seccion: Seccion; nombre: string; Icono: ComponentType }

const OPCIONES: Opcion[] = [
  { seccion: 'menu', nombre: 'Inicio', Icono: IconoInicio },
  { seccion: 'ejercicios', nombre: NOMBRE_SECCION.ejercicios, Icono: IconoEjercicios },
  { seccion: 'skills', nombre: NOMBRE_SECCION.skills, Icono: IconoSkills },
  { seccion: 'simulacro', nombre: NOMBRE_SECCION.simulacro, Icono: IconoSimulacro },
  { seccion: 'seguimiento', nombre: NOMBRE_SECCION.seguimiento, Icono: IconoSeguimiento },
]

export function MenuNavegacion({ ruta }: { ruta: Ruta }) {
  const [abierto, setAbierto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)

  // Cambiar de sección por otro camino también lo cierra.
  useEffect(() => setAbierto(false), [ruta.seccion, ruta.guia])

  // Con `useLayoutEffect` los listeners quedan puestos apenas se abre el menú,
  // sin esperar al siguiente cuadro: un Escape inmediato también lo cierra.
  useLayoutEffect(() => {
    if (!abierto) return
    const afuera = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAbierto(false)
    }
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setAbierto(false)
      boton.current?.focus()
    }
    document.addEventListener('pointerdown', afuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', afuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  const opciones = OPCIONES.filter((o) => o.seccion !== ruta.seccion)

  return (
    <div class={'navegacion' + (abierto ? ' navegacion--abierta' : '')} ref={raiz}>
      <button
        ref={boton}
        class="hamburguesa"
        aria-expanded={abierto}
        aria-controls="menu-navegacion"
        aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
        onClick={() => setAbierto((v) => !v)}
      >
        <span class="hamburguesa__linea" aria-hidden="true" />
        <span class="hamburguesa__linea" aria-hidden="true" />
        <span class="hamburguesa__linea" aria-hidden="true" />
      </button>

      <ul id="menu-navegacion" class="navegacion__lista" hidden={!abierto}>
        {opciones.map(({ seccion, nombre, Icono }, i) => (
          <li key={seccion} style={{ '--i': i }}>
            <a
              class="navegacion__opcion"
              href={escribirRuta({ seccion, guia: ruta.guia })}
              onClick={() => setAbierto(false)}
            >
              <Icono />
              {nombre}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
