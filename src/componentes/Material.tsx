/**
 * El material para llevar al examen (PLAN.md §12): la hoja de fórmulas, las
 * tablas y el kit que junta las dos para una evaluación.
 *
 * Los mismos componentes se ven en la sección Fórmulas y tablas y se
 * imprimen tal cual (ver imprimir.ts y estilos/impresion.css). El contenido
 * es dato: las fórmulas vienen de content/formulas/ y las tablas de
 * content/tablas/, generadas y verificadas por tools/verify/tablas.py.
 */
import { useLayoutEffect, useRef } from 'preact/hooks'

import { guiaPorNumero, hojasFormulas, tablas } from '../datos/contenido'
import { rangoGuias, type Evaluacion } from '../dominio/evaluaciones'
import { fechaCorta } from '../dominio/ritmo'
import type { Tabla } from '../dominio/tipos'
import { GraficoTabla } from './GraficoTabla'
import { Formula, Mate } from './Mate'
import { irA } from './MapaEjercicios'

/** Si hay algo que mostrar para esas guías. */
export const hayFormulas = (guias: readonly number[]) =>
  hojasFormulas.some((h) => guias.includes(h.guia))
export const hayTablas = (guias: readonly number[]) => tablas.some((t) => guias.includes(t.guia))

const anclaGuia = (g: number) => `formulas-guia-${g}`
const anclaTema = (g: number, i: number) => `formulas-${g}-${i + 1}`
const anclaTabla = (id: string) => `tabla-${id}`

/**
 * La tabla que pidió otra sección (la ficha de una distribución). Al entrar,
 * Fórmulas y tablas abre la pestaña de tablas y baja hasta ella. No va en la
 * URL porque la ruta sólo lleva la sección y la guía.
 */
let tablaPedida: string | null = null
export function pedirTabla(id: string): void {
  tablaPedida = id
}
export function tomarTablaPedida(): string | null {
  const t = tablaPedida
  tablaPedida = null
  return t
}
export const irATabla = (id: string) => irA(anclaTabla(id), false)

type PropsHoja = {
  guias: readonly number[]
  /** En pantalla lleva anclas para el índice; impresa, no (no se repiten ids). */
  anclas?: boolean
}

/**
 * Las fórmulas de las guías pedidas: cada guía con sus temas y, en cada
 * tema, una ficha por fórmula con su nombre, para qué sirve y la expresión
 * centrada. En pantalla las fichas van de a dos; la que no entra en media
 * columna ocupa la fila entera.
 */
export function HojaDeFormulas({ guias, anclas }: PropsHoja) {
  const hojas = hojasFormulas.filter((h) => guias.includes(h.guia))
  const raiz = useRef<HTMLDivElement>(null)

  // Una fórmula más ancha que su ficha se detecta midiendo, una vez cargadas
  // las tipografías de KaTeX, y la ficha pasa a ocupar la fila entera. Una
  // ficha angosta que quedaría sola en su fila (antes de una ancha o al final
  // del tema) también la ocupa entera, para no dejar media fila vacía sin
  // alterar el orden.
  useLayoutEffect(() => {
    if (!anclas || typeof document === 'undefined') return
    const medir = () => {
      raiz.current?.querySelectorAll<HTMLElement>('.hoja__fichas').forEach((grilla) => {
        const fichas = [...grilla.querySelectorAll<HTMLElement>('.ficha-formula')]
        for (const ficha of fichas) ficha.classList.remove('ficha-formula--ancha', 'ficha-formula--sola')
        const anchas = fichas.map((ficha) => {
          const tex = ficha.querySelector<HTMLElement>('.ficha-formula__tex')
          return !!tex && tex.scrollWidth > tex.clientWidth + 1
        })
        let columna = 0
        fichas.forEach((ficha, i) => {
          if (anchas[i]) {
            ficha.classList.add('ficha-formula--ancha')
            columna = 0
          } else if (columna === 1) {
            columna = 0
          } else if (i + 1 === fichas.length || anchas[i + 1]) {
            ficha.classList.add('ficha-formula--sola')
          } else {
            columna = 1
          }
        })
      })
    }
    medir()
    void document.fonts?.ready.then(medir)
    addEventListener('resize', medir)
    return () => removeEventListener('resize', medir)
  }, [anclas, guias.join()])

  return (
    <div class="hoja" ref={raiz}>
      {hojas.map((h) => (
        <section key={h.guia} class="hoja__guia" id={anclas ? anclaGuia(h.guia) : undefined}>
          <h3 class="hoja__titulo">
            <span class="hoja__numero">Guía {h.guia}</span>
            {guiaPorNumero.get(h.guia)?.titulo}
          </h3>
          {h.bloques.map((b, i) => (
            <section key={b.titulo} class="hoja__bloque" id={anclas ? anclaTema(h.guia, i) : undefined}>
              <h4 class="hoja__tema">
                <Mate>{b.titulo}</Mate>
              </h4>
              <div class="hoja__fichas">
                {b.formulas.map((f) => (
                  <article key={f.nombre} class="ficha-formula">
                    <h5 class="ficha-formula__nombre">
                      <Mate>{f.nombre}</Mate>
                    </h5>
                    <p class="ficha-formula__descripcion">
                      <Mate>{f.descripcion}</Mate>
                    </p>
                    <div class="ficha-formula__tex">
                      <Formula tex={f.tex} display />
                    </div>
                  </article>
                ))}
              </div>
              {b.nota && (
                <p class="hoja__nota">
                  <Mate>{b.nota}</Mate>
                </p>
              )}
            </section>
          ))}
        </section>
      ))}
    </div>
  )
}

/** Las tablas de las guías pedidas, con el formato de las de la cátedra. */
export function TablasDeExamen({ guias, anclas }: PropsHoja) {
  return (
    <div class="tablas">
      {tablas
        .filter((t) => guias.includes(t.guia))
        .map((t) => (
          <TablaNumerica key={t.id} tabla={t} ancla={anclas ? anclaTabla(t.id) : undefined} />
        ))}
    </div>
  )
}

function TablaNumerica({ tabla, ancla }: { tabla: Tabla; ancla?: string }) {
  return (
    <section class={'tabla-num tabla-num--' + tabla.id} id={ancla}>
      <h3 class="tabla-num__titulo">
        <Mate>{tabla.titulo}</Mate>
      </h3>
      <div class="tabla-num__cabeza">
        <GraficoTabla tipo={tabla.grafico} />
        {tabla.recuerda && (
          <p class="tabla-num__recuerda">
            Recuerda:
            <br />
            <Mate>{tabla.recuerda}</Mate>
          </p>
        )}
      </div>
      <div class="tabla-num__bloques">
        {tabla.bloques.map((b, i) => (
          <div key={i} class="tabla-num__bloque">
            {b.titulo && (
              <h4 class="tabla-num__subtitulo">
                <Mate>{b.titulo}</Mate>
              </h4>
            )}
            <div class="tabla-num__marco">
              <table>
                <thead>
                  <tr>
                    <th scope="col" class="tabla-num__esquina">
                      <Mate>{b.esquina}</Mate>
                    </th>
                    {b.columnas.map((c) => (
                      <th key={c} scope="col">
                        <Mate>{c}</Mate>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.filas.map(([etiqueta, ...valores]) => (
                    <tr key={etiqueta}>
                      <th scope="row">
                        <Mate>{etiqueta}</Mate>
                      </th>
                      {valores.map((v, j) => (
                        <td key={j}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * El índice de la izquierda, como el de las guías: las guías con sus temas,
 * o las tablas, según la pestaña. Al hacer clic, baja hasta ahí.
 */
export function IndiceMaterial({
  pestana,
  guias,
}: {
  pestana: 'formulas' | 'tablas'
  guias: readonly number[]
}) {
  if (pestana === 'tablas') {
    const lista = tablas.filter((t) => guias.includes(t.guia))
    if (lista.length === 0) return null
    return (
      <aside class="indice" aria-label="Índice de las tablas">
        <div class="indice__contenido">
          <p class="indice__titulo">Tablas</p>
          <ol class="indice__lista">
            {lista.map((t) => (
              <li key={t.id}>
                <button class="indice__tema" onClick={() => irA(anclaTabla(t.id))}>
                  <Mate>{t.titulo}</Mate>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    )
  }
  const hojas = hojasFormulas.filter((h) => guias.includes(h.guia))
  if (hojas.length === 0) return null
  return (
    <aside class="indice" aria-label="Índice de las fórmulas">
      <div class="indice__contenido">
        <p class="indice__titulo">Fórmulas</p>
        <ol class="indice__lista">
          {hojas.map((h) => (
            <li key={h.guia} class="indice__grupo">
              <button class="indice__tema indice__tema--guia" onClick={() => irA(anclaGuia(h.guia))}>
                Guía {h.guia}
              </button>
              <ol class="indice__sublista">
                {h.bloques.map((b, i) => (
                  <li key={b.titulo}>
                    <button class="indice__tema" onClick={() => irA(anclaTema(h.guia, i))}>
                      <Mate>{b.titulo}</Mate>
                    </button>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  )
}

/** El saludo del final de todo. */
export function Suerte() {
  return <p class="suerte">Suerte en el examen 🖒</p>
}

/**
 * Todo lo que hace falta para una evaluación, en un solo documento: una
 * carátula, las fórmulas y las tablas de sus guías, y el saludo.
 */
export function KitExamen({ evaluacion }: { evaluacion: Evaluacion }) {
  const { guias, nombre, fecha } = evaluacion
  return (
    <div class="kit">
      <header class="kit__caratula">
        <p class="kit__materia">Probabilidad y Estadística B · 61.09 · 81.04 · CB003</p>
        <h2 class="kit__titulo">Kit para el {nombre}</h2>
        <p class="kit__dato">
          {fecha ? `${fechaCorta(fecha)} · ` : ''}
          {rangoGuias(guias)}
        </p>
        <p class="kit__indice">Las fórmulas de cada guía y las tablas de la cátedra.</p>
      </header>
      {hayFormulas(guias) && (
        <section class="kit__parte">
          <h2 class="kit__parte-titulo">Fórmulas</h2>
          <HojaDeFormulas guias={guias} />
        </section>
      )}
      {hayTablas(guias) && (
        <section class="kit__parte kit__parte--tablas">
          <h2 class="kit__parte-titulo">Tablas</h2>
          <TablasDeExamen guias={guias} />
        </section>
      )}
      <Suerte />
    </div>
  )
}
