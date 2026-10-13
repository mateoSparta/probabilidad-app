/**
 * Los accesos de la esquina inferior derecha: invitar un cafecito, el código
 * del proyecto en GitHub y el modo nocturno. Están siempre, en todas las
 * secciones: son chicos y no tapan nada.
 *
 * Son círculos con el ícono solo; el globo, encima de cada uno, dice qué
 * hace. Al abrir la app entran subiendo desde el borde inferior, de a uno,
 * se pasan un poco de su lugar y se acomodan.
 *
 * En pantallas anchas van en columna, fuera de la columna central; en un
 * teléfono, en fila, y la página deja lugar abajo para que no tapen el final.
 */
import type { ComponentType } from 'preact'

import { usarTema } from '../datos/usarTema'
import { IconoGithub, IconoLuna, IconoSol, LogoCafecito } from './Iconos'

type Acceso = { href: string; ayuda: string; etiqueta: string; Icono: ComponentType }

const ACCESOS: Acceso[] = [
  {
    href: 'https://cafecito.app/carpincho_fiubense',
    ayuda: 'Invitame un cafecito',
    etiqueta: 'Invitame un cafecito (se abre en otra pestaña)',
    Icono: LogoCafecito,
  },
  {
    href: 'https://github.com/mateoSparta/probabilidad-app',
    ayuda: 'El proyecto en GitHub',
    etiqueta: 'El proyecto en GitHub (se abre en otra pestaña)',
    Icono: IconoGithub,
  },
]

/** Cuántos círculos hay: los enlaces y el del modo. */
const CANTIDAD = ACCESOS.length + 1

export function Accesos() {
  const { tema, alternar } = usarTema()
  const oscuro = tema === 'oscuro'

  return (
    <ul class="accesos" aria-label="Enlaces del proyecto">
      {ACCESOS.map(({ href, ayuda, etiqueta, Icono }, i) => (
        // Entran de abajo hacia arriba: el de abajo primero.
        <li key={href} class="accesos__item" style={{ '--j': CANTIDAD - 1 - i }}>
          <a
            class="accesos__boton"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={etiqueta}
            data-tip={ayuda}
            data-tip-lado="arriba"
          >
            <Icono />
          </a>
        </li>
      ))}
      <li class="accesos__item" style={{ '--j': 0 }}>
        <button
          class={'accesos__boton accesos__tema' + (oscuro ? ' accesos__tema--oscuro' : '')}
          aria-label="Modo nocturno"
          aria-pressed={oscuro}
          data-tip={oscuro ? 'Modo claro' : 'Modo nocturno'}
          data-tip-lado="arriba"
          onClick={alternar}
        >
          <span class="accesos__icono accesos__icono--luna" aria-hidden="true">
            <IconoLuna />
          </span>
          <span class="accesos__icono accesos__icono--sol" aria-hidden="true">
            <IconoSol />
          </span>
        </button>
      </li>
    </ul>
  )
}
