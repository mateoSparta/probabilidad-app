/**
 * El material para llevar al examen (PLAN.md §12): la hoja de fórmulas, las
 * tablas y el kit que junta las dos para una evaluación.
 *
 * Los mismos componentes se ven en el Machete y se
 * imprimen tal cual (ver imprimir.ts y estilos/impresion.css). El contenido
 * es dato: las fórmulas vienen de content/formulas/ y las tablas de
 * content/tablas/, generadas y verificadas por tools/verify/tablas.py.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'

import { guiaPorNumero, hojasFormulas, tablas } from '../datos/contenido'
import type { Evaluacion } from '../dominio/evaluaciones'
import type { Tabla } from '../dominio/tipos'
import { alTerminarDeDesplazar, usarSeccionVisible } from './desplazamiento'
import { GraficoTabla } from './GraficoTabla'
import { IconoSiguiente } from './Iconos'
import { Formula, Mate } from './Mate'
import { irA } from './MapaEjercicios'
import { TablaDeDistribuciones } from './TablaDistribuciones'

/** Si hay algo que mostrar para esas guías. */
export const hayFormulas = (guias: readonly number[]) =>
  hojasFormulas.some((h) => guias.includes(h.guia))
export const hayTablas = (guias: readonly number[]) => tablas.some((t) => guias.includes(t.guia))

const anclaGuia = (g: number) => `formulas-guia-${g}`
const anclaTema = (g: number, i: number) => `formulas-${g}-${i + 1}`
const anclaTabla = (id: string) => `tabla-${id}`


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

/**
 * Las coordenadas de una cifra: con el puntero encima se marcan la cifra, el
 * rótulo de su fila y el de su columna, para ver a qué par de valores (ν y α,
 * o las dos partes de z) corresponde. Se tocan las clases a mano, sin estado,
 * para no volver a pasar por KaTeX los rótulos de toda la tabla en cada
 * movimiento.
 */
const ROTULO = 'tabla-num__rotulo-marcado'
const CIFRA = 'tabla-num__cifra-marcada'

function desmarcar(e: Event): void {
  const tabla = e.currentTarget as HTMLTableElement
  tabla.querySelectorAll(`.${ROTULO}, .${CIFRA}`).forEach((c) => c.classList.remove(ROTULO, CIFRA))
}

function marcar(e: Event): void {
  const tabla = e.currentTarget as HTMLTableElement
  const celda = (e.target as Element).closest('td')
  if (!celda) {
    desmarcar(e)
    return
  }
  if (celda.classList.contains(CIFRA)) return
  desmarcar(e)
  for (const fila of Array.from(tabla.tHead?.rows ?? [])) fila.cells[celda.cellIndex]?.classList.add(ROTULO)
  ;(celda.parentElement as HTMLTableRowElement).cells[0]?.classList.add(ROTULO)
  celda.classList.add(CIFRA)
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
              <table onPointerOver={marcar} onPointerLeave={desmarcar}>
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
 * Pinta de naranja muy claro las fichas de un tema: un fundido de entrada y
 * otro de salida, el doble de largo, sin pausa entre los dos (`resaltar` en
 * animaciones.css). Si ya estaba pintado, la animación vuelve a empezar.
 */
function resaltarTema(id: string): void {
  const bloque = document.getElementById(id)
  if (!bloque) return
  bloque.classList.remove('hoja__bloque--resaltado')
  void bloque.offsetWidth
  bloque.classList.add('hoja__bloque--resaltado')
  setTimeout(() => bloque.classList.remove('hoja__bloque--resaltado'), 1000)
}

/**
 * El índice de la izquierda, como el de las guías: las guías con sus temas,
 * o las tablas, según la pestaña. Al hacer clic, baja hasta ahí.
 *
 * En las fórmulas es un acordeón: la guía desplegada es siempre la que se
 * está leyendo. Elegir una guía baja hasta su comienzo (y por eso la
 * despliega); al desplazarse, se despliega la que pasa a leerse. Al elegir
 * un tema, además de bajar, sus fichas se pintan un momento para que se vea
 * adónde se llegó.
 */
export function IndiceMaterial({
  pestana,
  guias,
}: {
  pestana: 'formulas' | 'tablas'
  guias: readonly number[]
}) {
  const hojas = hojasFormulas.filter((h) => guias.includes(h.guia))
  const pausa = useRef(false)
  // La guía que se está leyendo; el acordeón no abre cada guía por la que
  // pasa un salto, porque `pausa` la congela mientras dura.
  const visible = usarSeccionVisible(
    hojas.map((h) => h.guia),
    anclaGuia,
    pausa,
  )
  const [abierta, setAbierta] = useState<number | null>(visible)
  useEffect(() => setAbierta(visible), [visible])

  if (pestana === 'tablas') {
    const lista = tablas.filter((t) => guias.includes(t.guia))
    if (lista.length === 0) return null
    return (
      <aside class="indice" aria-label="Índice de las tablas">
        <div class="indice__contenido">
          <p class="indice__titulo">Tablas</p>
          <ol class="indice__lista">
            {lista.map((t, i) => (
              <li key={t.id} style={{ '--i': i }}>
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

  /** Baja hasta un ancla de la guía, con el acordeón quieto mientras dura el desplazamiento. */
  function bajar(guia: number, ancla: string, alLlegar?: () => void): void {
    setAbierta(guia)
    pausa.current = true
    irA(ancla)
    alTerminarDeDesplazar(() => {
      pausa.current = false
      dispatchEvent(new Event('scroll'))
      alLlegar?.()
    })
  }
  const irATema = (guia: number, i: number) =>
    bajar(guia, anclaTema(guia, i), () => resaltarTema(anclaTema(guia, i)))

  if (hojas.length === 0) return null
  return (
    <aside class="indice" aria-label="Índice de las fórmulas">
      <div class="indice__contenido">
        <p class="indice__titulo">Fórmulas</p>
        <ol class="indice__lista">
          {hojas.map((h, k) => {
            const abierto = abierta === h.guia
            return (
              <li
                key={h.guia}
                class={'indice__grupo' + (abierto ? ' indice__grupo--abierto' : '')}
                style={{ '--i': k }}
              >
                <button
                  class="indice__tema indice__tema--guia"
                  aria-expanded={abierto}
                  aria-controls={`indice-guia-${h.guia}`}
                  onClick={() => bajar(h.guia, anclaGuia(h.guia))}
                >
                  <IconoSiguiente />
                  Guía {h.guia}
                </button>
                <div class="indice__plegable" id={`indice-guia-${h.guia}`} inert={!abierto}>
                  <ol class="indice__sublista">
                    {h.bloques.map((b, i) => (
                      <li key={b.titulo} style={{ '--i': i }}>
                        <button class="indice__tema" onClick={() => irATema(h.guia, i)}>
                          <Mate>{b.titulo}</Mate>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              </li>
            )
          })}
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
 * Todo lo que hace falta para una evaluación, en un solo documento: las
 * fórmulas y las tablas de sus guías, la tabla de distribuciones de la
 * cátedra y el saludo. Cada parte empieza en una página nueva.
 */
export function KitExamen({ evaluacion }: { evaluacion: Evaluacion }) {
  const { guias } = evaluacion
  return (
    <div class="kit">
      {hayFormulas(guias) && (
        <section class="kit__parte">
          <h2 class="kit__parte-titulo">Fórmulas</h2>
          <HojaDeFormulas guias={guias} />
        </section>
      )}
      {hayTablas(guias) && (
        <section class="kit__parte kit__parte--nueva-pagina">
          <h2 class="kit__parte-titulo">Tablas</h2>
          <TablasDeExamen guias={guias} />
        </section>
      )}
      <section class="kit__parte kit__parte--nueva-pagina">
        <TablaDeDistribuciones />
      </section>
      <Suerte />
    </div>
  )
}
