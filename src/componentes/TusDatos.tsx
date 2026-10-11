/**
 * "Tus datos": exportar, importar y borrar lo que la app guarda en el
 * navegador. Es el pie del menú principal, porque afecta a toda la app y no a
 * una sección en particular.
 *
 * Hay un solo botón para borrar, que se lleva todo: el historial de intentos
 * y el estado de los ejercicios y del simulacro. Antes de hacerlo pide
 * confirmación en una ventana, porque no se puede deshacer.
 */
import { useState } from 'preact/hooks'

import { descargar } from '../datos/almacenamiento'
import type { ApiProgreso } from '../datos/usarProgreso'
import type { ApiSesion } from '../datos/usarSesion'
import { desdeJson } from '../dominio/progreso'
import { Modal } from './Modal'

export function TusDatos({ api, sesion }: { api: ApiProgreso; sesion?: ApiSesion }) {
  const { progreso, reemplazar, reiniciar } = api
  const [aviso, setAviso] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)

  async function importar(e: Event) {
    const input = e.target as HTMLInputElement
    const archivo = input.files?.[0]
    if (!archivo) return
    const p = desdeJson(await archivo.text())
    if (!p) {
      setAviso('Ese archivo no tiene el formato del progreso.')
      return
    }
    reemplazar(p)
    setAviso(`Importados ${p.intentos.length} intentos.`)
    input.value = ''
  }

  function borrarTodo(): void {
    reiniciar()
    sesion?.reiniciar()
    setConfirmando(false)
    setAviso('Se borraron todos tus datos.')
  }

  return (
    <footer class="pie" aria-labelledby="titulo-datos">
      <h3 id="titulo-datos" class="pie__titulo">
        Tus datos
      </h3>
      <p class="pie__descripcion">
        Todo se guarda en este navegador, sin servidor ni base de datos. 
        Para pasar el progreso a otra compu, exportalo e importalo allá.
      </p>
      <div class="pie__acciones">
        <button class="boton" onClick={() => descargar(progreso)}>
          Exportar JSON
        </button>
        <label class="boton">
          Importar JSON
          <input type="file" accept="application/json" class="sr-solo" onChange={importar} />
        </label>
        <button class="boton boton--borrar" onClick={() => setConfirmando(true)}>
          Borrar mis datos
        </button>
      </div>
      {aviso && <p class="feedback feedback--aviso">{aviso}</p>}

      <Modal
        abierto={confirmando}
        titulo="¿Borrar todos tus datos?"
        confirmar="Borrar todo"
        cancelar="Cancelar"
        intermedia={
          <button class="boton" onClick={() => descargar(progreso)}>
            Exportar JSON
          </button>
        }
        peligro
        onConfirmar={borrarTodo}
        onCancelar={() => setConfirmando(false)}
      >
        <p>
          Se borran el historial de intentos, del que surgen las insignias, y el estado de todos
          los ejercicios, incluido el simulacro en curso. No se puede deshacer.
        </p>
        <p>Si querés conservar una copia del historial, exportalo antes.</p>
      </Modal>
    </footer>
  )
}
