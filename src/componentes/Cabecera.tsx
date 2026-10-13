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
 * Las pestañas de las guías van fuera del `<header>` porque son lo único que
 * queda fijo al hacer scroll: con el encabezado completo fijo, en un celular
 * se perdería casi un cuarto de la pantalla.
 */
import { useEffect, useState } from 'preact/hooks'

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

export function Cabecera({ ruta, plan }: Props) {
  const { seccion } = ruta
  const miga = usarMigaActual(seccion)

  return (
    <>
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
                aria-label="61.09 · 81.04 · CB003: página de la cátedra en el campus (se abre en otra pestaña)"
              >
                61.09 · 81.04 · CB003
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
    </>
  )
}

/**
 * La fila de pestañas, centrada en la ventana y en un solo renglón. Si no
 * entra, se desplaza de costado. El fondo de la guía abierta es un
 * Indicador: al cambiar de guía se desliza hasta la nueva.
 *
 * La pestaña de la guía abierta sirve además para volver al principio: un
 * clic sube hasta arriba, y si ya se bajó lo suficiente como para perder de
 * vista la fila de círculos, al pasar el mouse lo dice.
 */
function PestanasGuias({ activa }: { activa: number }) {
  const [titulo, setTitulo] = useState<string | undefined>(undefined)

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
    <nav class="barra-guias" aria-label="Guías de ejercicios">
      <div class="tabs">
        <Indicador selector=".tab[aria-current='page']" clave={activa} />
        {GUIAS.map((n) =>
          guiaTieneContenido(n) ? (
            <a
              key={n}
              class="tab"
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
              Guía {n}
            </a>
          ) : (
            <span
              key={n}
              class="tab tab--bloqueada"
              aria-disabled="true"
              data-tip={ayudaBloqueada(n)}
            >
              <IconoCandado />
              Guía {n}
            </span>
          ),
        )}
      </div>
    </nav>
  )
}
