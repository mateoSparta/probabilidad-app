/**
 * La tabla de distribuciones de la cátedra
 * (fuentes/teoria/probabilidad_distribuciones.pdf), para imprimir: las
 * discretas y las continuas en tablas, los modelos de las discretas, las
 * funciones de supervivencia, las multivariadas y las equivalencias.
 *
 * Se arma con los datos de content/distribuciones.yaml, los mismos de las
 * fichas de la sección Distribuciones; no se publica el PDF de la cátedra.
 * Se imprime desde Distribuciones y va también en el kit para el examen.
 */
import { fichasDistribuciones } from '../datos/contenido'
import type { FichaDistribucion } from '../dominio/tipos'
import { Formula, Mate } from './Mate'

/** `X \sim \mathcal{B}(n, p)` sin la variable: `\mathcal{B}(n, p)`. */
export const sinVariable = (notacion: string) => notacion.replace(/^.*?\\sim\s*/, '')
/** `p_X(x) = \dfrac{...}` sin el miembro izquierdo. */
export const sinMiembroIzquierdo = (funcion: string) => funcion.replace(/^[^=]*=\s*/, '')

function TablaUnivariadas({ fichas, funcion }: { fichas: FichaDistribucion[]; funcion: string }) {
  return (
    <div class="tabla-dist__marco">
      <table class="tabla-dist__tabla">
        <thead>
          <tr>
            <th scope="col">Distribución</th>
            <th scope="col">Notación</th>
            <th scope="col">
              <Formula tex={funcion} />
            </th>
            <th scope="col">Soporte</th>
            <th scope="col">Parámetros</th>
            <th scope="col">
              <Formula tex="E[X]" />
            </th>
            <th scope="col">
              <Formula tex="\operatorname{var}(X)" />
            </th>
          </tr>
        </thead>
        <tbody>
          {fichas.map((f) => (
            <tr key={f.id}>
              <th scope="row">{f.nombre}</th>
              <td>
                <Formula tex={sinVariable(f.notacion)} />
              </td>
              <td>
                <Formula tex={sinMiembroIzquierdo(f.funcion)} />
              </td>
              <td>
                <Formula tex={f.soporte + (f.nota_soporte ? '^{\\dagger}' : '')} />
              </td>
              <td>
                <Formula tex={f.parametros} />
              </td>
              <td>
                <Formula tex={f.esperanza} />
              </td>
              <td>
                <Formula tex={f.varianza} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Las aclaraciones del soporte (la de la hipergeométrica), al pie de la tabla, con una cruz. */
function NotasSoporte({ fichas }: { fichas: FichaDistribucion[] }) {
  const con = fichas.filter((f) => f.nota_soporte)
  if (con.length === 0) return null
  return (
    <p class="tabla-dist__pie">
      {con.map((f) => (
        <span key={f.id}>
          <Formula tex="^{\dagger}" /> <Mate>{f.nota_soporte!}</Mate>
        </span>
      ))}
    </p>
  )
}

/** Las equivalencias, sin repetir la misma con los miembros al revés. */
function equivalencias(fichas: FichaDistribucion[]): string[] {
  const vistas = new Set<string>()
  const salida: string[] = []
  for (const e of fichas.flatMap((f) => f.equivalencias ?? [])) {
    const clave = e
      .split('\\equiv')
      .map((m) => m.replace(/\s+/g, ''))
      .sort()
      .join('|')
    if (vistas.has(clave)) continue
    vistas.add(clave)
    salida.push(e)
  }
  return salida
}

export function TablaDeDistribuciones() {
  const discretas = fichasDistribuciones.filter((f) => f.grupo === 'discreta')
  const continuas = fichasDistribuciones.filter((f) => f.grupo === 'continua')
  const multivariadas = fichasDistribuciones.filter((f) => f.grupo === 'multivariada')
  const conSupervivencia = continuas.filter((f) => f.supervivencia)
  const notas = continuas.filter((f) => f.nota)

  return (
    <div class="tabla-dist">
      <h2 class="tabla-dist__titulo">Tabla de distribuciones</h2>

      <section class="tabla-dist__seccion">
        <h3 class="tabla-dist__subtitulo">Distribuciones discretas univariadas</h3>
        <TablaUnivariadas fichas={discretas} funcion="p_X(x)" />
        <NotasSoporte fichas={discretas} />
        <p class="tabla-dist__pie">
          <Mate>{'Fuera del soporte, $p_X(x) = 0$.'}</Mate>
        </p>
        <h4 class="tabla-dist__apartado">Algunos modelos</h4>
        <ul class="tabla-dist__lista">
          {discretas.map((f) => (
            <li key={f.id}>
              <strong>{f.nombre}.</strong> <Mate>{f.modelo}</Mate>
            </li>
          ))}
        </ul>
      </section>

      <section class="tabla-dist__seccion tabla-dist__seccion--nueva-pagina">
        <h3 class="tabla-dist__subtitulo">Distribuciones continuas univariadas</h3>
        <TablaUnivariadas fichas={continuas} funcion="f_X(x)" />
        <NotasSoporte fichas={continuas} />
        <p class="tabla-dist__pie">
          <Mate>{'Fuera del soporte, $f_X(x) = 0$.'}</Mate>
          {notas.map((f) => (
            <span key={f.id}>
              {' '}
              <Mate>{f.nota!}</Mate>
            </span>
          ))}
        </p>
        <h4 class="tabla-dist__apartado">
          Algunas funciones de supervivencia, <Formula tex="S(t) = P(T > t)" />
        </h4>
        <table class="tabla-dist__tabla tabla-dist__tabla--angosta">
          <tbody>
            {conSupervivencia.map((f) => (
              <tr key={f.id}>
                <td>
                  <Formula tex={f.notacion.replace(/^X/, 'T')} />
                </td>
                <td>
                  <Formula tex={f.supervivencia!} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section class="tabla-dist__seccion tabla-dist__seccion--nueva-pagina">
        <h3 class="tabla-dist__subtitulo">Distribuciones multivariadas</h3>
        <div class="tabla-dist__multi">
          {multivariadas.map((f) => (
            <div key={f.id} class="tabla-dist__multivariada">
              <h4 class="tabla-dist__apartado">
                {f.nombre}, <Formula tex={f.notacion} />
              </h4>
              <ul class="tabla-dist__formulas">
                {[f.funcion, `\\text{soporte } ${f.soporte}`, f.parametros, f.esperanza, f.varianza, ...(f.propiedades ?? [])].map(
                  (t) => (
                    <li key={t}>
                      <Formula tex={t} />
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section class="tabla-dist__seccion">
        <h3 class="tabla-dist__subtitulo">Equivalencias</h3>
        <ul class="tabla-dist__equivalencias">
          {equivalencias(fichasDistribuciones).map((e) => (
            <li key={e}>
              <Formula tex={e} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
