/**
 * "Tus datos": exportar, importar y borrar lo que la app guarda en el
 * navegador. Va al pie del menú principal, porque afecta a toda la app y no a
 * una sección en particular.
 */
import { useState } from 'preact/hooks'

import { descargar } from '../datos/almacenamiento'
import type { ApiProgreso } from '../datos/usarProgreso'
import type { ApiSesion } from '../datos/usarSesion'
import { desdeJson } from '../dominio/progreso'

export function TusDatos({ api, sesion }: { api: ApiProgreso; sesion?: ApiSesion }) {
  const { progreso, reemplazar, reiniciar } = api
  const [aviso, setAviso] = useState<string | null>(null)

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

  return (
    <section class="datos" aria-labelledby="titulo-datos">
      <h3 id="titulo-datos">Tus datos</h3>
      <p class="guia__descripcion">
        Todo se guarda en este navegador, sin servidor ni base de datos. Se registran dos cosas
        por separado: el <strong>historial</strong> de intentos, del que surgen las insignias, y{' '}
        <strong>dónde quedaste</strong> (ítems resueltos, respuestas escritas y el simulacro en
        curso). Para usar el historial en otra computadora, exportalo e importalo allí.
      </p>
      <div class="item__acciones">
        <button class="boton" onClick={() => descargar(progreso)}>
          Exportar JSON
        </button>
        <label class="boton">
          Importar JSON
          <input type="file" accept="application/json" class="sr-solo" onChange={importar} />
        </label>
        <button
          class="boton boton--fantasma"
          onClick={() => {
            if (confirm('¿Borrar el historial de intentos? Se pierden las insignias.')) {
              reiniciar()
              setAviso('Historial borrado.')
            }
          }}
        >
          Borrar historial
        </button>
        {sesion && (
          <button
            class="boton boton--fantasma"
            onClick={() => {
              if (
                confirm(
                  'Todos los ejercicios volverán a quedar sin resolver. El historial y las ' +
                    'insignias no se modifican. ¿Continuar?',
                )
              ) {
                sesion.reiniciar()
                setAviso('Todos los ejercicios quedaron disponibles para rehacer.')
              }
            }}
          >
            Empezar las guías de cero
          </button>
        )}
      </div>
      {aviso && <p class="feedback feedback--aviso">{aviso}</p>}
      <p class="dato-chico">
        {progreso.intentos.length} intentos registrados
        {sesion && <> · {Object.keys(sesion.sesion.items).length} ítems con estado guardado</>}
        {sesion?.sesion.simulacro && <> · hay un simulacro en curso</>}
      </p>
    </section>
  )
}
