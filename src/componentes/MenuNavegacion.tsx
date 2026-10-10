/**
 * El botón de la esquina superior derecha de la columna (no de la ventana),
 * alineado con las migas. Tiene dos caras:
 *
 * - En las secciones es un menú de hamburguesa con el resto de las secciones,
 *   "Inicio" primero y nunca la actual.
 * - En el inicio se transforma en el logo de cafecito, que lleva a la página
 *   para invitar un café.
 *
 * Las dos caras están siempre en el DOM, apiladas en el mismo recuadro, y el
 * CSS pasa de una a otra con una transición. Si se montara una y se
 * desmontara la otra, no habría nada que animar.
 *
 * El desplegable se cierra al elegir una opción, al hacer clic afuera, con
 * Escape y al cambiar de sección por cualquier otro camino (el botón de
 * atrás, por ejemplo). Al cerrarse con el mouse o el teclado, primero se
 * desvanece y recién después se oculta.
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
  LogoCafecito,
} from './Iconos'

const CAFECITO = 'https://cafecito.app/carpincho_fiubense'

/** Lo que dura la salida del desplegable; tiene que coincidir con el CSS. */
const SALIDA_MS = 150

type Opcion = { seccion: Seccion; nombre: string; Icono: ComponentType }

const OPCIONES: Opcion[] = [
  { seccion: 'menu', nombre: 'Inicio', Icono: IconoInicio },
  { seccion: 'ejercicios', nombre: NOMBRE_SECCION.ejercicios, Icono: IconoEjercicios },
  { seccion: 'skills', nombre: NOMBRE_SECCION.skills, Icono: IconoSkills },
  { seccion: 'simulacro', nombre: NOMBRE_SECCION.simulacro, Icono: IconoSimulacro },
  { seccion: 'seguimiento', nombre: NOMBRE_SECCION.seguimiento, Icono: IconoSeguimiento },
]

type Fase = 'cerrado' | 'abierto' | 'cerrando'

export function MenuNavegacion({ ruta }: { ruta: Ruta }) {
  const enInicio = ruta.seccion === 'menu'
  const [fase, setFase] = useState<Fase>('cerrado')
  const raiz = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const abierto = fase === 'abierto'

  function cerrar(): void {
    setFase((f) => (f === 'abierto' ? 'cerrando' : f))
  }

  useEffect(() => {
    if (fase !== 'cerrando') return
    const t = setTimeout(() => setFase('cerrado'), SALIDA_MS)
    return () => clearTimeout(t)
  }, [fase])

  // Cambiar de sección por otro camino lo cierra sin animación: la vista
  // entera cambia y no hace falta acompañar el desplegable.
  useEffect(() => setFase('cerrado'), [ruta.seccion, ruta.guia])

  // Con `useLayoutEffect` los listeners quedan puestos apenas se abre el menú,
  // sin esperar al siguiente cuadro: un Escape inmediato también lo cierra.
  useLayoutEffect(() => {
    if (!abierto) return
    const afuera = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) cerrar()
    }
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      cerrar()
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
    <div
      class={
        'navegacion' + (enInicio ? ' navegacion--inicio' : '') + (abierto ? ' navegacion--abierta' : '')
      }
      ref={raiz}
    >
      <div class="navegacion__marco">
        <button
          ref={boton}
          class="hamburguesa"
          aria-expanded={abierto}
          aria-controls="menu-navegacion"
          aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
          aria-hidden={enInicio ? 'true' : undefined}
          tabIndex={enInicio ? -1 : 0}
          onClick={() => (abierto ? cerrar() : setFase('abierto'))}
        >
          <span class="hamburguesa__linea" aria-hidden="true" />
          <span class="hamburguesa__linea" aria-hidden="true" />
          <span class="hamburguesa__linea" aria-hidden="true" />
        </button>

        <a
          class="cafecito"
          href={CAFECITO}
          target="_blank"
          rel="noopener noreferrer"
          title="Invitame un cafecito"
          aria-label="Invitame un cafecito (se abre en otra pestaña)"
          aria-hidden={enInicio ? undefined : 'true'}
          tabIndex={enInicio ? 0 : -1}
        >
          <LogoCafecito />
        </a>
      </div>

      {!enInicio && (
        <ul
          id="menu-navegacion"
          class={'navegacion__lista' + (fase === 'cerrando' ? ' navegacion__lista--cerrando' : '')}
          hidden={fase === 'cerrado'}
        >
          {opciones.map(({ seccion, nombre, Icono }, i) => (
            <li key={seccion} style={{ '--i': i }}>
              <a
                class="navegacion__opcion"
                href={escribirRuta({ seccion, guia: ruta.guia })}
                onClick={() => setFase('cerrado')}
              >
                <Icono />
                {nombre}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
