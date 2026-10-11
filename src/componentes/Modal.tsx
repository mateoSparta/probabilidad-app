/**
 * Ventanas modales, sobre el `<dialog>` nativo: el navegador se ocupa de
 * bloquear el resto de la página, atrapar el foco y cerrar con Escape.
 *
 * Entran y salen con animación. Al cerrar, primero se marcan como salientes y
 * recién al terminar la animación se cierra el diálogo; por eso Escape y el
 * clic en el fondo no lo cierran directamente sino que avisan con
 * `onCerrar`, y quien lo usa decide.
 *
 * `Dialogo` es la base, con cualquier contenido y sus propias acciones.
 * `Modal` es el caso de confirmación: un texto, cancelar y confirmar.
 */
import type { ComponentChildren } from 'preact'
import { useEffect, useId, useRef, useState } from 'preact/hooks'

/** Lo que dura la salida; tiene que coincidir con el CSS. */
const SALIDA_MS = 160

type PropsDialogo = {
  abierto: boolean
  titulo: ComponentChildren
  children: ComponentChildren
  /** Los botones del pie. */
  acciones: ComponentChildren
  /** Una clase más, para variantes de tamaño o de contenido. */
  clase?: string
  onCerrar: () => void
}

export function Dialogo({ abierto, titulo, children, acciones, clase, onCerrar }: PropsDialogo) {
  const ref = useRef<HTMLDialogElement>(null)
  const [saliendo, setSaliendo] = useState(false)
  const idTitulo = useId()

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
      class={'modal' + (clase ? ' ' + clase : '') + (saliendo ? ' modal--saliendo' : '')}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault()
        onCerrar()
      }}
      // El fondo es parte del diálogo: un clic ahí tiene al diálogo como
      // destino, mientras que uno en el contenido tiene a un hijo.
      onClick={(e) => e.target === ref.current && onCerrar()}
    >
      <div class="modal__contenido">
        <h3 id={idTitulo} class="modal__titulo">
          {titulo}
        </h3>
        <div class="modal__cuerpo">{children}</div>
        <div class="modal__acciones">{acciones}</div>
      </div>
    </dialog>
  )
}

type PropsModal = {
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
}: PropsModal) {
  return (
    <Dialogo
      abierto={abierto}
      titulo={titulo}
      onCerrar={onCancelar}
      acciones={
        <>
          <button class="boton" onClick={onCancelar} autoFocus>
            {cancelar}
          </button>
          <button
            class={'boton ' + (peligro ? 'boton--peligro' : 'boton--acento')}
            onClick={onConfirmar}
          >
            {confirmar}
          </button>
        </>
      }
    >
      {children}
    </Dialogo>
  )
}
