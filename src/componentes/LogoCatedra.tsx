/**
 * El sello de la FIUBA, que lleva a la página de la cátedra en el campus. Se
 * ve sólo en el inicio, flotando en la esquina inferior derecha.
 *
 * Entra subiendo desde el borde inferior, se pasa un poco de su lugar y se
 * acomoda; al irse hace lo mismo al revés. Para que la salida se vea, el
 * componente sigue montado mientras dura y se desmonta al terminar la
 * animación. Con movimiento reducido no hay animaciones (ni su evento de
 * fin), así que se desmonta en el acto.
 */
import { useEffect, useState } from 'preact/hooks'

import logo from '../assets/logo-fiuba.png'

const PAGINA_CATEDRA = 'https://campusgrado.fi.uba.ar/course/view.php?id=46'

type Fase = 'oculto' | 'entrando' | 'saliendo'

function sinMovimiento(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function LogoCatedra({ visible }: { visible: boolean }) {
  const [fase, setFase] = useState<Fase>(visible ? 'entrando' : 'oculto')

  useEffect(() => {
    if (visible) setFase('entrando')
    else setFase((f) => (f === 'oculto' || sinMovimiento() ? 'oculto' : 'saliendo'))
  }, [visible])

  if (fase === 'oculto') return null

  return (
    <div
      class={'catedra catedra--' + fase}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && fase === 'saliendo') setFase('oculto')
      }}
    >
      <a
        class="catedra__boton"
        href={PAGINA_CATEDRA}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Página de cátedra (se abre en otra pestaña)"
        data-tip="Página de cátedra"
        tabIndex={fase === 'saliendo' ? -1 : undefined}
      >
        <img src={logo} alt="" width="144" height="144" draggable={false} />
      </a>
    </div>
  )
}
