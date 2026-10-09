/**
 * Tarjeta de ejercicio (PLAN.md §8): número, enunciado y la lista de ítems.
 *
 * El resaltado del fragmento vive acá y no en el ítem, porque el fragmento
 * está en el enunciado, que es compartido por todos los ítems.
 */
import { useState } from 'preact/hooks'

import type { ApiSesion } from '../datos/usarSesion'
import { claveItem } from '../dominio/tipos'
import type { Ejercicio, Intento } from '../dominio/tipos'
import { ItemEjercicio } from './ItemEjercicio'
import { Enunciado } from './Mate'

const ETIQUETA_PRIORIDAD: Record<string, string> = {
  recomendado: 'Recomendado',
  muy_dificil: 'Difícil',
  curva_peligrosa: 'Curva peligrosa',
}

type Props = {
  ejercicio: Ejercicio
  sesion?: ApiSesion
  onIntento?: (intento: Intento, limpio: boolean) => void
}

export function TarjetaEjercicio({ ejercicio, sesion, onIntento }: Props) {
  const [resaltado, setResaltado] = useState<string | null>(null)

  const etiqueta = ejercicio.prioridad && ETIQUETA_PRIORIDAD[ejercicio.prioridad]

  /**
   * Las marcas del enunciado se destapan cuando algún ítem ya se resolvió.
   * Se deriva de la sesión y no de un estado local, para que al recargar la
   * página no vuelvan a esconderse con el ejercicio ya hecho.
   */
  const algunoResuelto = ejercicio.items.some((item) => {
    const e = sesion?.item(claveItem(ejercicio.id, item.id)).estado
    return e === 'correcto' || e === 'revelado'
  })

  return (
    <article class="tarjeta" id={'ej-' + ejercicio.id}>
      <header class="tarjeta__cabeza">
        <h3 class="tarjeta__numero">{ejercicio.numero}</h3>
        {etiqueta && <span class="insignia-prioridad">{etiqueta}</span>}
      </header>

      <Enunciado texto={ejercicio.enunciado} resaltado={resaltado} mostrarMarcas={algunoResuelto} />

      <ol class="items">
        {ejercicio.items.map((item) => {
          const clave = claveItem(ejercicio.id, item.id)
          return (
            <ItemEjercicio
              key={clave}
              item={item}
              clave={clave}
              inicial={sesion?.item(clave)}
              onGuardar={sesion ? (e) => sesion.anotarItem(clave, e) : undefined}
              onReiniciar={sesion ? () => sesion.reiniciarItem(clave) : undefined}
              onResaltar={setResaltado}
              onIntento={onIntento}
            />
          )
        })}
      </ol>
    </article>
  )
}
