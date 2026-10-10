/**
 * Encabezado: migas, aviso del parcial y, en Ejercicios, las pestañas de las
 * guías.
 *
 * Las migas son la navegación principal: "Probabilidad y Estadística B" lleva
 * al menú y la sección actual se muestra a continuación. Todo son enlaces
 * comunes al hash, así que el botón de atrás del navegador funciona igual.
 *
 * Las pestañas de las guías van fuera del `<header>` porque son lo único que
 * queda fijo al hacer scroll: con el encabezado completo fijo, en un celular
 * se perdería casi un cuarto de la pantalla.
 */
import { guiaTieneContenido } from '../datos/contenido'
import type { Plan } from '../dominio/ritmo'
import { NOMBRE_SECCION, type Ruta } from '../dominio/ruta'
import { AvisoParcialCompacto } from './AvisoParcial'

const GUIAS = [1, 2, 3, 4, 5, 6, 7, 8]

type Props = {
  ruta: Ruta
  /** Si está, se muestra el aviso del parcial. */
  plan?: Plan
}

export function Cabecera({ ruta, plan }: Props) {
  const { seccion } = ruta

  return (
    <>
      <header class="cabecera">
        <div class="columna">
          <nav class="migas" aria-label="Ubicación">
            <span class="migas__codigo">61.09 · 81.04 · CB003</span>
            <ol class="migas__lista">
              <li>
                <h1 class="migas__titulo">
                  <a href="#/" aria-current={seccion === 'menu' ? 'page' : undefined}>
                    Probabilidad y Estadística B
                  </a>
                </h1>
              </li>
              {seccion !== 'menu' && (
                <li class="migas__actual" aria-current="page">
                  <span class="migas__sep" aria-hidden="true">
                    ›
                  </span>
                  {NOMBRE_SECCION[seccion]}
                </li>
              )}
            </ol>
          </nav>

          {plan && <AvisoParcialCompacto plan={plan} />}
        </div>
      </header>

      {seccion === 'ejercicios' && <PestanasGuias activa={ruta.guia} />}
    </>
  )
}

function PestanasGuias({ activa }: { activa: number }) {
  return (
    <nav class="barra-guias" aria-label="Guías de ejercicios">
      <div class="columna tabs">
        {GUIAS.map((n) => (
          <a
            key={n}
            class={'tab' + (guiaTieneContenido(n) ? '' : ' tab--vacia')}
            href={`#/ejercicios/${n}`}
            aria-current={n === activa ? 'page' : undefined}
          >
            Guía {n}
          </a>
        ))}
      </div>
    </nav>
  )
}
