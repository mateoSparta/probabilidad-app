/**
 * Tarjeta de ejercicio (PLAN.md §8): número, enunciado y la lista de ítems.
 *
 * El resaltado del fragmento vive acá y no en el ítem, porque el fragmento
 * está en el enunciado, que es compartido por todos los ítems.
 */
import { useState } from 'preact/hooks'

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
  onIntento?: (intento: Intento, limpio: boolean) => void
}

export function TarjetaEjercicio({ ejercicio, onIntento }: Props) {
  const [resaltado, setResaltado] = useState<string | null>(null)
  /** Alcanza con que un ítem esté resuelto para dejar de esconder las marcas. */
  const [algunoResuelto, setAlgunoResuelto] = useState(false)

  const etiqueta = ejercicio.prioridad && ETIQUETA_PRIORIDAD[ejercicio.prioridad]

  return (
    <article class="tarjeta" id={'ej-' + ejercicio.id}>
      <header class="tarjeta__cabeza">
        <h3 class="tarjeta__numero">{ejercicio.numero}</h3>
        {etiqueta && <span class="insignia-prioridad">{etiqueta}</span>}
      </header>

      <Enunciado texto={ejercicio.enunciado} resaltado={resaltado} mostrarMarcas={algunoResuelto} />

      <ol class="items">
        {ejercicio.items.map((item) => (
          <ItemEjercicio
            key={item.id}
            item={item}
            onResaltar={setResaltado}
            onIntento={(intento, limpio) => {
              if (intento.correcto || intento.revelo) setAlgunoResuelto(true)
              onIntento?.(intento, limpio)
            }}
          />
        ))}
      </ol>
    </article>
  )
}
