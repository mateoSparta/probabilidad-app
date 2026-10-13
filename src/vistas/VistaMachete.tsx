/**
 * Machete (PLAN.md §12): lo que se lleva al examen. Muestra las fórmulas de
 * cada guía y las tablas de la cátedra, filtradas por etapa: todo, lo del
 * parcial o los temas propios del final. Un solo botón imprime lo que se ve,
 * o lo guarda en PDF desde el diálogo del navegador. A la izquierda, un
 * índice como el de las guías.
 *
 * Las pestañas Fórmulas y Tablas cambian el contenido con un desplazamiento
 * horizontal, en el sentido de la pestaña elegida; el filtro, con un fundido.
 */
import { useState } from 'preact/hooks'

import { IconoImprimir } from '../componentes/Iconos'
import {
  hayFormulas,
  hayTablas,
  HojaDeFormulas,
  IndiceMaterial,
  Suerte,
  TablasDeExamen,
} from '../componentes/Material'
import { SubirLateral, usarSubir } from '../componentes/SubirLateral'
import { imprimir } from '../componentes/imprimir'
import { config } from '../datos/contenido'
import { alcances, rangoGuias } from '../dominio/evaluaciones'

type Pestana = 'formulas' | 'tablas'

const PESTANAS: { id: Pestana; nombre: string }[] = [
  { id: 'formulas', nombre: 'Fórmulas' },
  { id: 'tablas', nombre: 'Tablas' },
]

/** Cómo entra el contenido: de qué lado, o con un fundido. */
type Entrada = 'derecha' | 'izquierda' | 'fundido' | null

export function VistaMachete() {
  const opciones = alcances(config.evaluaciones)
  const [idAlcance, setIdAlcance] = useState(opciones[0]?.id ?? 'todas')
  const [pestana, setPestana] = useState<Pestana>('formulas')
  const [entrada, setEntrada] = useState<Entrada>(null)
  const alcance = opciones.find((o) => o.id === idAlcance) ?? opciones[0]
  const guias = alcance?.guias ?? []
  const subir = usarSubir()
  const indicePestana = PESTANAS.findIndex((p) => p.id === pestana)
  const indiceAlcance = opciones.findIndex((o) => o.id === alcance?.id)

  function elegirPestana(p: Pestana): void {
    if (p === pestana) return
    setEntrada(PESTANAS.findIndex((q) => q.id === p) > indicePestana ? 'derecha' : 'izquierda')
    setPestana(p)
  }

  function elegirAlcance(id: string): void {
    setEntrada('fundido')
    setIdAlcance(id)
  }

  const hay = pestana === 'formulas' ? hayFormulas(guias) : hayTablas(guias)
  const contenido = (anclas: boolean) =>
    pestana === 'formulas' ? (
      <HojaDeFormulas guias={guias} anclas={anclas} />
    ) : (
      <TablasDeExamen guias={guias} anclas={anclas} />
    )

  function imprimirActual(): void {
    const que = pestana === 'formulas' ? 'Fórmulas' : 'Tablas'
    const de = alcance.id === 'todas' ? 'de todas las guías' : `del ${alcance.id}`
    void imprimir(
      <div class={'impreso impreso--' + pestana}>
        <h1 class="impreso__titulo">
          {que} {de}
        </h1>
        {contenido(false)}
        <Suerte />
      </div>,
      `${que} ${de} - Probabilidad y Estadística B`,
    )
  }

  return (
    <>
      <IndiceMaterial key={`indice-${pestana}-${idAlcance}`} pestana={pestana} guias={guias} />
      <SubirLateral visible={subir} />

      <section class="guia__intro">
        <h2>Machete</h2>
        <p class="guia__descripcion">
          Las fórmulas de cada guía y las tres tablas de la cátedra, para imprimir o guardar en PDF.
        </p>
      </section>

      <section class="material-config" aria-label="Qué mostrar">
        <div class="material-config__fila">
          <div
            class="segmentado segmentado--linea segmentado--revelar"
            role="radiogroup"
            aria-label="Etapa"
            style={{ '--n': opciones.length, '--activa': indiceAlcance }}
          >
            <span class="segmentado__indicador" aria-hidden="true" />
            {opciones.map((o) => {
              const vacio = !hayFormulas(o.guias) && !hayTablas(o.guias)
              return (
                <label
                  key={o.id}
                  class={
                    'segmentado__opcion' +
                    (o.id === alcance?.id ? ' segmentado__opcion--activa' : '') +
                    (vacio ? ' segmentado__opcion--vacia' : '')
                  }
                  data-tip={vacio ? 'Todavía sin cargar' : undefined}
                >
                  <input
                    class="sr-solo"
                    type="radio"
                    name="alcance-material"
                    value={o.id}
                    checked={o.id === alcance?.id}
                    disabled={vacio}
                    onChange={() => elegirAlcance(o.id)}
                  />
                  <span class="segmentado__nombre">{o.rotulo}</span>
                  <span class="segmentado__dato">{rangoGuias(o.guias)}</span>
                </label>
              )
            })}
          </div>
          <button class="boton boton--acento boton--icono" disabled={!hay} onClick={imprimirActual}>
            <IconoImprimir />
            Imprimir o guardar PDF
          </button>
        </div>

        <div class="pestanas pestanas--llenas" role="tablist" aria-label="Material" style={{ '--activa': indicePestana }}>
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              role="tab"
              class={'pestana' + (p.id === pestana ? ' pestana--activa' : '')}
              aria-selected={p.id === pestana}
              onClick={() => elegirPestana(p.id)}
            >
              {p.nombre}
            </button>
          ))}
          <span class="pestanas__indicador" aria-hidden="true" />
        </div>
      </section>

      <div key={`material-${pestana}-${idAlcance}`} class={'material' + (entrada ? ' material--' + entrada : '')} role="tabpanel">
        {hay ? (
          contenido(true)
        ) : (
          <p class="vacio">
            {pestana === 'formulas'
              ? `Todavía no hay fórmulas de las ${rangoGuias(guias)}: se agregan al cargar cada guía.`
              : `Todavía no hay tablas de las ${rangoGuias(guias)}.`}
          </p>
        )}
      </div>
    </>
  )
}
