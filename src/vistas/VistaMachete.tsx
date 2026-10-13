/**
 * Machete (PLAN.md §12): lo que se lleva al examen, y el único lugar desde el
 * que se imprime. Tres pestañas: las fórmulas de cada guía, las tablas de la
 * cátedra y la teoría de las distribuciones. Las dos primeras se filtran por
 * etapa (todo, lo del parcial o los temas propios del final); la teoría de
 * las distribuciones es la misma en todas. A la izquierda, un índice como el
 * de las guías.
 *
 * El selector de etapa va a la derecha de la descripción, y debajo, en su
 * renglón, dos botones:
 *
 * - Imprimir lo que se ve (o guardarlo en PDF desde el diálogo del
 *   navegador). Dice qué: la última palabra rueda como un tambor entre
 *   "fórmulas", "tablas" y "distribuciones", y el botón no cambia de ancho.
 * - El kit para el examen: las fórmulas y las tablas de la etapa, más la
 *   teoría de las distribuciones, en un solo documento. A su derecha, qué contiene.
 *
 * Las pestañas cambian el contenido con un desplazamiento horizontal, en el
 * sentido de la pestaña elegida; el filtro, con un fundido.
 */
import { useState } from 'preact/hooks'

import { IconoBotiquin, IconoImprimir } from '../componentes/Iconos'
import {
  hayFormulas,
  hayTablas,
  HojaDeFormulas,
  IndiceMaterial,
  KitExamen,
  Suerte,
  TablasDeExamen,
} from '../componentes/Material'
import { SubirLateral, usarSubir } from '../componentes/SubirLateral'
import { TeoriaDistribuciones } from '../componentes/TeoriaDistribuciones'
import { imprimir } from '../componentes/imprimir'
import { config } from '../datos/contenido'
import { alcances, guiasDeLaMateria, rangoGuias } from '../dominio/evaluaciones'

export type Pestana = 'formulas' | 'tablas' | 'distribuciones'

/** `palabra` es la que rueda en el botón de imprimir. */
const PESTANAS: { id: Pestana; nombre: string; palabra: string }[] = [
  { id: 'formulas', nombre: 'Fórmulas', palabra: 'fórmulas' },
  { id: 'tablas', nombre: 'Tablas', palabra: 'tablas' },
  { id: 'distribuciones', nombre: 'Distribuciones', palabra: 'distribuciones' },
]

/** Cómo entra el contenido: de qué lado, o con un fundido. */
type Entrada = 'derecha' | 'izquierda' | 'fundido' | null

const TITULO = 'Probabilidad y Estadística B'

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

  // El kit es para un examen: el del parcial lleva sus guías; el del final,
  // y el de "Todas", las de toda la materia, porque el final las evalúa todas.
  const guiasKit = alcance?.id === 'todas' || alcance?.id === 'final' ? guiasDeLaMateria(config.evaluaciones) : guias
  const examenKit = alcance?.id === 'parcial' ? 'parcial' : 'final'

  function elegirPestana(p: Pestana): void {
    if (p === pestana) return
    setEntrada(PESTANAS.findIndex((q) => q.id === p) > indicePestana ? 'derecha' : 'izquierda')
    setPestana(p)
  }

  function elegirAlcance(id: string): void {
    setEntrada('fundido')
    setIdAlcance(id)
  }

  const hay = pestana === 'formulas' ? hayFormulas(guias) : pestana === 'tablas' ? hayTablas(guias) : true
  const contenido = (anclas: boolean) =>
    pestana === 'formulas' ? (
      <HojaDeFormulas guias={guias} anclas={anclas} />
    ) : pestana === 'tablas' ? (
      <TablasDeExamen guias={guias} anclas={anclas} />
    ) : (
      <TeoriaDistribuciones anclas={anclas} />
    )

  function imprimirActual(): void {
    // La teoría de las distribuciones es la misma en todas las etapas.
    const que = PESTANAS[indicePestana].nombre
    const de = pestana === 'distribuciones' ? '' : alcance.id === 'todas' ? 'de todas las guías' : `del ${alcance.id}`
    void imprimir(
      <div class={'impreso impreso--' + pestana}>
        <h1 class="impreso__titulo">{de ? `${que} ${de}` : que}</h1>
        {contenido(false)}
        <Suerte />
      </div>,
      `${de ? `${que} ${de}` : que} - ${TITULO}`,
    )
  }

  function imprimirKit(): void {
    void imprimir(<KitExamen guias={guiasKit} />, `Kit para el ${examenKit} - ${TITULO}`)
  }

  return (
    <>
      <IndiceMaterial key={`indice-${pestana}-${idAlcance}`} pestana={pestana} guias={guias} />
      <SubirLateral visible={subir} />

      <section class="guia__intro guia__intro--machete">
        <h2>Machete</h2>
        {/* La descripción a la izquierda y el selector de etapa a la derecha;
            en pantallas angostas, el selector baja. */}
        <div class="machete-intro">
          <p class="guia__descripcion">
            Las fórmulas de cada guía, las tablas de la cátedra y la teoría de las distribuciones,
            para imprimir o guardar en PDF.
          </p>
          <div
            class="segmentado segmentado--linea segmentado--revelar segmentado--apilado"
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
        </div>
      </section>

      <section class="material-config" aria-label="Imprimir">
        {/* Los dos botones en su renglón, del tamaño de siempre, y a la derecha
            del kit qué contiene, como al lado de "Simular parcial". */}
        <div class="material-config__acciones">
          <button
            class="boton boton--acento boton--icono"
            disabled={!hay}
            aria-label={`Imprimir o guardar en PDF las ${PESTANAS[indicePestana].palabra}`}
            data-tip="Imprimir o guardar en PDF"
            onClick={imprimirActual}
          >
            <IconoImprimir />
            {/* La última palabra rueda como un tambor, del lado de la pestaña
                elegida. El tambor mide lo que la palabra más larga, así que el
                botón no cambia de ancho. */}
            <span class="material-config__texto" aria-hidden="true">
              Imprimir{' '}
              <span class="rodillo rodillo--varias" style={{ '--i': indicePestana }}>
                <span class="rodillo__cinta">
                  {PESTANAS.map((p) => (
                    <span key={p.id} class="rodillo__palabra">
                      {p.palabra}
                    </span>
                  ))}
                </span>
              </span>
            </span>
          </button>
          <button
            class="boton boton--icono"
            disabled={!hayFormulas(guiasKit) && !hayTablas(guiasKit)}
            data-tip={`Todo lo necesario para rendir el ${examenKit}`}
            onClick={imprimirKit}
          >
            <IconoBotiquin />
            Kit para el examen
          </button>
          <p class="dato-chico">
            Contiene todas las fórmulas, las tablas y las distribuciones que se usan en el{' '}
            {examenKit}, en un solo documento.
          </p>
        </div>

        <div
          class="pestanas pestanas--llenas"
          role="tablist"
          aria-label="Material"
          style={{ '--activa': indicePestana, '--n': PESTANAS.length }}
        >
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

      {/* La teoría de las distribuciones no depende de la etapa: cambiarla no la vuelve a montar. */}
      <div
        key={`material-${pestana}-${pestana === 'distribuciones' ? '' : idAlcance}`}
        class={'material' + (entrada ? ' material--' + entrada : '')}
        role="tabpanel"
      >
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
