/**
 * Tarjeta de ejercicio (PLAN.md §8): número, enunciado, tags y la lista de
 * ítems.
 *
 * El resaltado vive acá y no en el ítem, porque los fragmentos pueden estar
 * en el enunciado, que es compartido por todos los ítems, o en la pregunta de
 * cualquiera de ellos.
 */
import type { ApiSesion } from '../datos/usarSesion'
import { claveItem } from '../dominio/tipos'
import type { Ejercicio, Intento } from '../dominio/tipos'
import { ItemEjercicio } from './ItemEjercicio'
import { Enunciado } from './Mate'
import { Tags, usarResaltado } from './Tags'

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
  const resaltado = usarResaltado()

  const etiqueta = ejercicio.prioridad && ETIQUETA_PRIORIDAD[ejercicio.prioridad]

  /**
   * Los ítems resueltos o revelados. Se derivan de la sesión y no de un
   * estado local, para que al recargar la página los tags y las marcas no
   * vuelvan a esconderse con el ejercicio ya hecho.
   */
  const resueltos = ejercicio.items.filter((item) => {
    const e = sesion?.item(claveItem(ejercicio.id, item.id)).estado
    return e === 'correcto' || e === 'revelado'
  })
  const tags = [...new Set(resueltos.flatMap((item) => item.skills))]
  const mostrarMarcas = resueltos.length > 0

  return (
    <article class="tarjeta" id={'ej-' + ejercicio.id}>
      <header class="tarjeta__cabeza">
        <h3 class="tarjeta__numero">{ejercicio.numero}</h3>
        {etiqueta && <span class="insignia-prioridad">{etiqueta}</span>}
      </header>

      <Enunciado
        texto={ejercicio.enunciado}
        resaltado={resaltado.activo}
        mostrarMarcas={mostrarMarcas}
      />

      <Tags skills={tags} resaltado={resaltado} />

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
              resaltado={resaltado.activo}
              mostrarMarcas={mostrarMarcas}
              onIntento={onIntento}
            />
          )
        })}
      </ol>
    </article>
  )
}
