/**
 * Encabezado: migas, aviso del examen objetivo y, en Ejercicios, las pestañas
 * de las guías.
 *
 * Arriba de las migas, el código de la materia, que lleva a la página de la
 * cátedra en el campus.
 *
 * Las migas son la navegación principal: "Probabilidad y Estadística B" lleva
 * al menú y la sección actual se muestra a continuación. Todo son enlaces
 * comunes al hash, así que el botón de atrás del navegador funciona igual.
 *
 * A la derecha de las migas va siempre el mismo botón: menú de hamburguesa
 * en las secciones y logo de cafecito en el inicio (ver MenuNavegacion).
 *
 * El encabezado, con las pestañas de las guías debajo, queda fijo arriba al
 * hacer scroll: desde cualquier punto de una página se puede cambiar de
 * sección sin subir primero. Lo que mide se publica en `--alto-fijo`, para
 * que lo que también queda fijo (los índices, "↑ Subir", la barra del
 * simulacro) y los saltos a un ancla se acomoden debajo.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'

import { config, guiaTieneContenido } from '../datos/contenido'
import { grupoDe, guiasDeLaMateria, temaDe } from '../dominio/evaluaciones'
import type { Plan } from '../dominio/ritmo'
import { NOMBRE_SECCION, type Ruta, type Seccion } from '../dominio/ruta'
import { AvisoExamenCompacto } from './AvisoExamen'
import { IconoCandado } from './Iconos'
import { Indicador } from './Indicador'
import { MenuNavegacion } from './MenuNavegacion'

/**
 * Todas las guías de la materia, las que evalúa alguna evaluación de
 * content/config.yaml; las que no tienen contenido se ven bloqueadas.
 */
const GUIAS = guiasDeLaMateria(config.evaluaciones)

const PAGINA_CATEDRA = 'https://campusgrado.fi.uba.ar/course/view.php?id=46'

/** La ayuda de una pestaña bloqueada: de qué examen es tema la guía. */
function ayudaBloqueada(guia: number): string {
  const ev = temaDe(guia, config.evaluaciones)
  return ev ? `Tema del ${grupoDe(ev)}, todavía sin cargar` : 'Todavía sin cargar'
}

/** Lo que dura la salida de la miga de la sección; tiene que coincidir con el CSS. */
const SALIDA_MIGA_MS = 180

type Props = {
  ruta: Ruta
  /** Si está, se muestra el aviso del próximo examen. */
  plan?: Plan
}

/**
 * La miga de la sección actual, con salida animada.
 *
 * Al cambiar de sección, la miga anterior no desaparece de golpe: primero se
 * marca como saliente (y el CSS la desvanece) y recién después se reemplaza
 * por la nueva, que entra con la animación inversa.
 */
function usarMigaActual(seccion: Seccion): { seccion: Seccion; saliendo: boolean } {
  const [miga, setMiga] = useState({ seccion, saliendo: false })

  useEffect(() => {
    if (seccion === miga.seccion) {
      if (miga.saliendo) setMiga({ seccion, saliendo: false })
      return
    }
    // Si no había miga visible (veníamos del menú), la nueva entra directo.
    if (miga.seccion === 'menu') {
      setMiga({ seccion, saliendo: false })
      return
    }
    setMiga((m) => ({ ...m, saliendo: true }))
    const t = setTimeout(() => setMiga({ seccion, saliendo: false }), SALIDA_MIGA_MS)
    return () => clearTimeout(t)
  }, [seccion])

  return miga
}

/**
 * Publica el alto de un elemento fijo en `--alto-fijo`, en la raíz, y lo
 * mantiene al día (cambia con el ancho de la ventana, al aparecer las
 * pestañas de las guías, al cargar las fuentes).
 */
function usarAltoFijo(): { current: HTMLDivElement | null } {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const publicar = () =>
      document.documentElement.style.setProperty('--alto-fijo', `${el.getBoundingClientRect().height}px`)
    publicar()
    const observador = new ResizeObserver(publicar)
    observador.observe(el)
    return () => observador.disconnect()
  }, [])
  return ref
}

export function Cabecera({ ruta, plan }: Props) {
  const { seccion } = ruta
  const miga = usarMigaActual(seccion)
  const fijo = usarAltoFijo()

  return (
    <div class="encabezado" ref={fijo}>
      <header class="cabecera">
        <div class="columna">
          <div class="cabecera__fila">
            <nav class="migas" aria-label="Ubicación">
              <a
                class="migas__codigo"
                href={PAGINA_CATEDRA}
                target="_blank"
                rel="noopener noreferrer"
                data-tip="Página de la cátedra"
                aria-label="FIUBA - 61.09 · 81.04 · CB003: página de la cátedra en el campus (se abre en otra pestaña)"
              >
                FIUBA - 61.09 · 81.04 · CB003
              </a>
              <ol class="migas__lista">
                <li>
                  <h1 class="migas__titulo">
                    <a
                      href="#/"
                      aria-current={seccion === 'menu' ? 'page' : undefined}
                      data-tip={seccion === 'menu' ? undefined : 'Volver al inicio'}
                    >
                      Probabilidad y Estadística B
                    </a>
                  </h1>
                </li>
                {miga.seccion !== 'menu' && (
                  <li
                    key={miga.seccion}
                    class={'migas__actual' + (miga.saliendo ? ' migas__actual--saliendo' : '')}
                    aria-current={miga.saliendo ? undefined : 'page'}
                  >
                    <span class="migas__sep" aria-hidden="true">
                      ›
                    </span>
                    {NOMBRE_SECCION[miga.seccion]}
                  </li>
                )}
              </ol>
            </nav>
            <MenuNavegacion ruta={ruta} />
          </div>

          {plan && <AvisoExamenCompacto plan={plan} />}
        </div>
      </header>

      {seccion === 'ejercicios' && <PestanasGuias activa={ruta.guia} />}
    </div>
  )
}

/** Lo que dura el cambio de pestaña; es el del deslizamiento del Indicador. */
const CAMBIO_PESTANA_MS = 320
const CURVA_PESTANA = 'cubic-bezier(0.3, 0.8, 0.3, 1)'

/**
 * La palabra "Guía" sólo se ve en la pestaña abierta; las demás muestran el
 * número. Al cambiar de guía, la palabra se pliega en la que se deja y se
 * despliega en la nueva, al mismo tiempo y con la misma curva con que el
 * fondo se desliza de una a otra.
 *
 * El Indicador se ubica antes (sus efectos corren antes que los de la
 * barra) y mide las pestañas ya con su ancho final, porque el CSS no anima
 * el ancho de la palabra: lo animan acá, después, la API de animaciones.
 */
function usarPalabraDeslizante(activa: number): { current: HTMLElement | null } {
  const ref = useRef<HTMLElement>(null)
  const anterior = useRef(activa)
  useLayoutEffect(() => {
    const antes = anterior.current
    anterior.current = activa
    const barra = ref.current
    if (antes === activa || !barra || typeof barra.animate !== 'function') return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const palabra = (n: number) => barra.querySelector<HTMLElement>(`[data-guia="${n}"] .tab__palabra`)
    const opciones = { duration: CAMBIO_PESTANA_MS, easing: CURVA_PESTANA }
    const nueva = palabra(activa)
    const vieja = palabra(antes)
    const ancho = (nueva ?? vieja)?.scrollWidth ?? 0
    nueva?.animate({ width: ['0px', `${ancho}px`], opacity: [0, 1] }, opciones)
    vieja?.animate({ width: [`${ancho}px`, '0px'], opacity: [1, 0] }, opciones)
  }, [activa])
  return ref
}

/**
 * La fila de pestañas, centrada en la ventana y en un solo renglón. Si no
 * entra, se desplaza de costado. El fondo de la guía abierta es un
 * Indicador: al cambiar de guía se desliza hasta la nueva. La abierta dice
 * "Guía 3" y las demás sólo el número, así la fila entra en el ancho de la
 * columna.
 *
 * La pestaña de la guía abierta sirve además para volver al principio: un
 * clic sube hasta arriba, y si ya se bajó lo suficiente como para perder de
 * vista la fila de círculos, al pasar el mouse lo dice.
 */
function PestanasGuias({ activa }: { activa: number }) {
  const [titulo, setTitulo] = useState<string | undefined>(undefined)
  const barra = usarPalabraDeslizante(activa)

  /** Si la fila de círculos de la guía quedó tapada o por encima de la barra. */
  function mapaFueraDeVista(): boolean {
    const mapa = document.querySelector('.guia__intro .mapa')
    const barra = document.querySelector('.barra-guias')
    if (!mapa || !barra) return false
    return mapa.getBoundingClientRect().bottom < barra.getBoundingClientRect().bottom
  }

  function subir(e: Event): void {
    e.preventDefault()
    if (scrollY > 0) scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav class="barra-guias" aria-label="Guías de ejercicios" ref={barra}>
      <div class="tabs">
        <Indicador selector=".tab[aria-current='page']" clave={activa} />
        {GUIAS.map((n) =>
          guiaTieneContenido(n) ? (
            <a
              key={n}
              class="tab"
              data-guia={n}
              href={`#/ejercicios/${n}`}
              aria-current={n === activa ? 'page' : undefined}
              // Vacío no muestra nada, pero deja la pestaña a la escucha del
              // globo, que la sigue mientras el texto se calcula al entrar.
              data-tip={n === activa ? (titulo ?? '') : undefined}
              onPointerEnter={
                n === activa
                  ? () => setTitulo(mapaFueraDeVista() ? 'Volver al principio' : undefined)
                  : undefined
              }
              onClick={n === activa ? subir : undefined}
            >
              {/* En las demás pestañas, plegada pero presente: el lector de
                  pantalla dice "Guía 3" en todas. */}
              <span class="tab__palabra">Guía&nbsp;</span>
              {n}
            </a>
          ) : (
            <span
              key={n}
              class="tab tab--bloqueada"
              aria-disabled="true"
              data-tip={ayudaBloqueada(n)}
            >
              <IconoCandado />
              <span class="sr-solo">Guía </span>
              {n}
            </span>
          ),
        )}
      </div>
    </nav>
  )
}
