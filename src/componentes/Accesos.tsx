/**
 * Los accesos de la esquina inferior derecha del inicio: invitar un cafecito,
 * el código del proyecto en GitHub y el modo nocturno. Se ven sólo en el
 * inicio, para no molestar mientras se estudia; el modo elegido vale en toda
 * la app.
 *
 * Son círculos chicos con el ícono solo (el globo dice qué hace cada uno).
 * Entran subiendo desde el borde inferior, de a uno, se pasan un poco de su
 * lugar y se acomodan; al irse hacen lo mismo al revés. Para que la salida se
 * vea, el componente sigue montado mientras dura y se desmonta al terminar
 * la del último. Con movimiento reducido no hay animaciones (ni su evento de
 * fin), así que se desmonta en el acto.
 *
 * En pantallas anchas van en columna, fuera de la columna central; en un
 * teléfono, en fila, y el inicio deja lugar abajo para que no tapen el pie.
 */
import type { ComponentType } from 'preact'
import { useEffect, useState } from 'preact/hooks'

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

type Fase = 'oculto' | 'entrando' | 'saliendo'

function sinMovimiento(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Cuántos círculos hay: los enlaces y el del modo. */
const CANTIDAD = ACCESOS.length + 1

export function Accesos({ visible }: { visible: boolean }) {
  const [fase, setFase] = useState<Fase>(visible ? 'entrando' : 'oculto')
  const { tema, alternar } = usarTema()
  const oscuro = tema === 'oscuro'

  useEffect(() => {
    if (visible) setFase('entrando')
    else setFase((f) => (f === 'oculto' || sinMovimiento() ? 'oculto' : 'saliendo'))
  }, [visible])

  if (fase === 'oculto') return null

  return (
    <ul class={'accesos accesos--' + fase} aria-label="Enlaces del proyecto">
      {ACCESOS.map(({ href, ayuda, etiqueta, Icono }, i) => (
        <li
          key={href}
          class="accesos__item"
          // Al entrar, de abajo hacia arriba (--j); al salir, el de arriba
          // primero (--i), así el último en irse es el de abajo.
          style={{ '--i': i, '--j': CANTIDAD - 1 - i }}
        >
          <a
            class="accesos__boton"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={etiqueta}
            data-tip={ayuda}
            tabIndex={fase === 'saliendo' ? -1 : undefined}
          >
            <Icono />
          </a>
        </li>
      ))}
      {/* El último en irse es el de abajo, el del modo: al terminar su
          salida se desmonta todo. */}
      <li
        class="accesos__item"
        style={{ '--i': CANTIDAD - 1, '--j': 0 }}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget && fase === 'saliendo') setFase('oculto')
        }}
      >
        <button
          class={'accesos__boton accesos__tema' + (oscuro ? ' accesos__tema--oscuro' : '')}
          aria-label="Modo nocturno"
          aria-pressed={oscuro}
          data-tip={oscuro ? 'Modo claro' : 'Modo nocturno'}
          tabIndex={fase === 'saliendo' ? -1 : undefined}
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
