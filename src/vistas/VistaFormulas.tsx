/**
 * Fórmulas y tablas (PLAN.md §12): el machete para el examen. Muestra las
 * fórmulas de cada guía y las tablas de la cátedra, filtradas por etapa: lo
 * del parcial, los temas propios del final o todo. Un solo botón imprime lo
 * que se ve, o lo guarda en PDF desde el diálogo del navegador. A la
 * izquierda, un índice como el de las guías.
 */
import { useEffect, useState } from 'preact/hooks'

import { IconoImprimir } from '../componentes/Iconos'
import {
  hayFormulas,
  hayTablas,
  HojaDeFormulas,
  IndiceMaterial,
  irATabla,
  Suerte,
  TablasDeExamen,
  tomarTablaPedida,
} from '../componentes/Material'
import { SubirLateral, usarSubir } from '../componentes/SubirLateral'
import { imprimir } from '../componentes/imprimir'
import { config, tablas } from '../datos/contenido'
import { alcances, rangoGuias } from '../dominio/evaluaciones'

type Pestana = 'formulas' | 'tablas'

const PESTANAS: { id: Pestana; nombre: string }[] = [
  { id: 'formulas', nombre: 'Fórmulas' },
  { id: 'tablas', nombre: 'Tablas' },
]

export function VistaFormulas() {
  const opciones = alcances(config.evaluaciones)
  // Si se llegó desde la ficha de una distribución, se abre su tabla, en la
  // primera opción que la incluya.
  const [pedida] = useState(tomarTablaPedida)
  const [idAlcance, setIdAlcance] = useState(() => {
    const guia = tablas.find((t) => t.id === pedida)?.guia
    const conLaTabla = guia === undefined ? undefined : opciones.find((o) => o.guias.includes(guia))
    return (conLaTabla ?? opciones[0])?.id ?? 'todas'
  })
  const [pestana, setPestana] = useState<Pestana>(pedida ? 'tablas' : 'formulas')
  // Después de que la app suba al principio por el cambio de sección.
  useEffect(() => {
    if (!pedida) return
    const t = setTimeout(() => irATabla(pedida), 0)
    return () => clearTimeout(t)
  }, [])
  const alcance = opciones.find((o) => o.id === idAlcance) ?? opciones[0]
  const guias = alcance?.guias ?? []
  const subir = usarSubir()

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
      <IndiceMaterial pestana={pestana} guias={guias} />
      <SubirLateral visible={subir} />

      <section class="guia__intro">
        <h2>Fórmulas y tablas</h2>
        <p class="guia__descripcion">
          El machete para el examen. Las fórmulas de cada guía y las tres tablas de la cátedra, la
          normal, la t de Student y la chi cuadrado. Se imprimen o se guardan en PDF con el filtro
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
          {contenido(true)}
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
