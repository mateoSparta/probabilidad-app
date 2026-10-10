/**
 * Ventana de confirmación, sobre el `<dialog>` nativo: el navegador se ocupa
 * de bloquear el resto de la página, atrapar el foco y cerrar con Escape.
 *
 * Entra y sale con animación. Al cerrar, primero se marca como saliente y
 * recién al terminar la animación se cierra el diálogo; por eso Escape y el
 * clic en el fondo no lo cierran directamente sino que avisan con
 * `onCancelar`, y quien lo usa decide.
 */
import type { ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

/** Lo que dura la salida; tiene que coincidir con el CSS. */
const SALIDA_MS = 160

type Props = {
  abierto: boolean
  titulo: string
  children: ComponentChildren
  confirmar: string
  cancelar: string
  /** La acción de confirmar no se puede deshacer: el botón se pinta en rojo. */
  peligro?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function Modal({
  abierto,
  titulo,
  children,
  confirmar,
  cancelar,
  peligro,
  onConfirmar,
  onCancelar,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [saliendo, setSaliendo] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierto && !d.open) {
      setSaliendo(false)
      d.showModal()
      return
    }
    if (!abierto && d.open) {
      setSaliendo(true)
      const t = setTimeout(() => {
        d.close()
        setSaliendo(false)
      }, SALIDA_MS)
      return () => clearTimeout(t)
    }
  }, [abierto])

  return (
    <dialog
      ref={ref}
      class={'modal' + (saliendo ? ' modal--saliendo' : '')}
      aria-labelledby="modal-titulo"
      onCancel={(e) => {
        e.preventDefault()
        onCancelar()
      }}
      // El fondo es parte del diálogo: un clic ahí tiene al diálogo como
      // destino, mientras que uno en el contenido tiene a un hijo.
      onClick={(e) => e.target === ref.current && onCancelar()}
    >
      <div class="modal__contenido">
        <h3 id="modal-titulo" class="modal__titulo">
          {titulo}
        </h3>
        <div class="modal__cuerpo">{children}</div>
        <div class="modal__acciones">
          <button class="boton" onClick={onCancelar} autoFocus>
            {cancelar}
          </button>
          <button
            class={'boton ' + (peligro ? 'boton--peligro' : 'boton--acento')}
            onClick={onConfirmar}
          >
            {confirmar}
          </button>
        </div>
      </div>
    </dialog>
  )
}
