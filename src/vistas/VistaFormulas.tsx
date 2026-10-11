/**
 * Fórmulas y tablas (PLAN.md §12): el machete para el examen. Muestra las
 * fórmulas de cada guía y las tablas que reemplazan a la calculadora, que no
 * se puede usar, filtradas por etapa: lo del parcial, los temas propios del
 * final o todo. Un solo botón imprime lo que se ve, o lo guarda en PDF desde
 * el diálogo del navegador.
 */
import { useState } from 'preact/hooks'

import { IconoImprimir } from '../componentes/Iconos'
import {
  hayFormulas,
  hayTablas,
  HojaDeFormulas,
  Suerte,
  TablasDeExamen,
} from '../componentes/Material'
import { imprimir } from '../componentes/imprimir'
import { config } from '../datos/contenido'
import { alcances, rangoGuias } from '../dominio/evaluaciones'

type Pestana = 'formulas' | 'tablas'

const PESTANAS: { id: Pestana; nombre: string }[] = [
  { id: 'formulas', nombre: 'Fórmulas' },
  { id: 'tablas', nombre: 'Tablas' },
]

export function VistaFormulas() {
  const opciones = alcances(config.evaluaciones)
  const [idAlcance, setIdAlcance] = useState(opciones[0]?.id ?? 'todas')
  const [pestana, setPestana] = useState<Pestana>('formulas')
  const alcance = opciones.find((o) => o.id === idAlcance) ?? opciones[0]
  const guias = alcance?.guias ?? []

  const hay = pestana === 'formulas' ? hayFormulas(guias) : hayTablas(guias)
  const contenido =
    pestana === 'formulas' ? <HojaDeFormulas guias={guias} /> : <TablasDeExamen guias={guias} />

  function imprimirActual(): void {
    const que = pestana === 'formulas' ? 'Fórmulas' : 'Tablas'
    const de = alcance.id === 'todas' ? 'de todas las guías' : `del ${alcance.id}`
    void imprimir(
      <div class={'impreso impreso--' + pestana}>
        <h1 class="impreso__titulo">
          {que} {de}
        </h1>
        {contenido}
        <Suerte />
      </div>,
      `${que} ${de} - Probabilidad y Estadística B`,
    )
  }

  return (
    <>
      <section class="guia__intro">
        <h2>Fórmulas y tablas</h2>
        <p class="guia__descripcion">
          El machete para el examen. Las fórmulas de cada guía y las tablas que reemplazan a la
          calculadora, que no se puede usar. Se imprimen o se guardan en PDF con el filtro
          elegido; si ya se imprimió lo del parcial, para el final alcanza con completar.
        </p>
      </section>

      <section class="material-config" aria-label="Qué mostrar">
        <div class="segmentado" role="radiogroup" aria-label="Etapa">
          {opciones.map((o) => {
            const vacio = !hayFormulas(o.guias) && !hayTablas(o.guias)
            return (
              <label
                key={o.id}
                class={
                  'segmentado__opcion' +
                  (o.id === idAlcance ? ' segmentado__opcion--activa' : '') +
                  (vacio ? ' segmentado__opcion--vacia' : '')
                }
                data-tip={vacio ? 'Todavía sin cargar' : undefined}
              >
                <input
                  class="sr-solo"
                  type="radio"
                  name="alcance-material"
                  value={o.id}
                  checked={o.id === idAlcance}
                  disabled={vacio}
                  onChange={() => setIdAlcance(o.id)}
                />
                <span class="segmentado__nombre">{o.rotulo}</span>
                <span class="segmentado__dato">{rangoGuias(o.guias)}</span>
              </label>
            )
          })}
        </div>

        <div class="material-config__fila">
          <div class="pestanas" role="tablist" aria-label="Material">
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                role="tab"
                class={'pestana' + (p.id === pestana ? ' pestana--activa' : '')}
                aria-selected={p.id === pestana}
                onClick={() => setPestana(p.id)}
              >
                {p.nombre}
              </button>
            ))}
          </div>
          <button class="boton boton--acento boton--icono" disabled={!hay} onClick={imprimirActual}>
            <IconoImprimir />
            Imprimir o guardar PDF
          </button>
        </div>
      </section>

      {hay ? (
        <div class="material" role="tabpanel">
          {contenido}
          <Suerte />
        </div>
      ) : (
        <p class="vacio">
          {pestana === 'formulas'
            ? `Todavía no hay fórmulas de las ${rangoGuias(guias)}: se agregan al cargar cada guía.`
            : `Todavía no hay tablas de las ${rangoGuias(guias)}.`}
        </p>
      )}
    </>
  )
}
