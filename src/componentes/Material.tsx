/**
 * El material para llevar al examen (PLAN.md §12): la hoja de fórmulas, las
 * tablas y el kit que junta las dos para una evaluación.
 *
 * Los mismos componentes se ven en la sección Fórmulas y tablas y se
 * imprimen tal cual (ver imprimir.ts y estilos/impresion.css). El contenido
 * es dato: las fórmulas vienen de content/formulas/ y las tablas de
 * content/tablas/, generadas y verificadas por tools/verify/tablas.py.
 */
import { guiaPorNumero, hojasFormulas, tablas } from '../datos/contenido'
import { rangoGuias, type Evaluacion } from '../dominio/evaluaciones'
import { fechaCorta } from '../dominio/ritmo'
import type { Tabla } from '../dominio/tipos'
import { Formula, Mate } from './Mate'

/** Si hay algo que mostrar para esas guías. */
export const hayFormulas = (guias: readonly number[]) =>
  hojasFormulas.some((h) => guias.includes(h.guia))
export const hayTablas = (guias: readonly number[]) => tablas.some((t) => guias.includes(t.guia))

/** Las fórmulas de las guías pedidas, guía por guía y tema por tema. */
export function HojaDeFormulas({ guias }: { guias: readonly number[] }) {
  const hojas = hojasFormulas.filter((h) => guias.includes(h.guia))
  return (
    <div class="hoja">
      {hojas.map((h) => (
        <section key={h.guia} class="hoja__guia">
          <h3 class="hoja__titulo">
            <span class="hoja__numero">Guía {h.guia}</span>
            {guiaPorNumero.get(h.guia)?.titulo}
          </h3>
          {h.bloques.map((b) => (
            <section key={b.titulo} class="hoja__bloque">
              <h4 class="hoja__tema">
                <Mate>{b.titulo}</Mate>
              </h4>
              <ul class="hoja__formulas">
                {b.formulas.map((f, i) => (
                  // En línea con \displaystyle: las fracciones se ven grandes,
                  // pero la fórmula queda alineada a la izquierda y, si no
                  // entra en la columna, se parte después de un operador.
                  <li key={i}>
                    <Formula tex={'\\displaystyle ' + f} />
                  </li>
                ))}
              </ul>
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

/** Las tablas de las guías pedidas, en el orden en que se usan. */
export function TablasDeExamen({ guias }: { guias: readonly number[] }) {
  return (
    <div class="tablas">
      {tablas
        .filter((t) => guias.includes(t.guia))
        .map((t) => (
          <TablaNumerica key={t.id} tabla={t} />
        ))}
    </div>
  )
}

function TablaNumerica({ tabla }: { tabla: Tabla }) {
  return (
    <section class={'tabla-num tabla-num--' + tabla.id}>
      <h3 class="tabla-num__titulo">{tabla.titulo}</h3>
      <p class="tabla-num__descripcion">
        <Mate>{tabla.descripcion}</Mate>
      </p>
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
        <p class="kit__indice">
          Las fórmulas de cada guía y las tablas para resolver sin calculadora.
        </p>
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
