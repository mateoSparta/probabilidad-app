/**
 * La teoría de las distribuciones en el Machete (su tercera pestaña): lo
 * mismo que la tabla de la cátedra (fuentes/teoria/probabilidad_distribuciones.pdf)
 * pero para leer en pantalla, con la estética de la hoja de fórmulas.
 *
 * Una tabla de siete columnas con fórmulas no entra en la columna, así que
 * cada distribución es una ficha: el nombre y la notación arriba, para qué
 * se usa, y debajo la función, el soporte, los parámetros, la esperanza y la
 * varianza (y la supervivencia, en las continuas que la tienen). Van de a
 * dos, agrupadas como en la tabla: discretas, continuas, multivariadas (que
 * ocupan la fila entera) y las equivalencias al final.
 *
 * Se imprime igual que la hoja de fórmulas (impresion.css): las fichas en
 * dos columnas, con un filete a la izquierda; va también en el kit para el
 * examen.
 */
import { fichasDistribuciones } from '../datos/contenido'
import type { FichaDistribucion } from '../dominio/tipos'
import { Formula, Mate } from './Mate'

/** `p_X(x) = \dfrac{...}` sin el miembro izquierdo. */
export const sinMiembroIzquierdo = (funcion: string) => funcion.replace(/^[^=]*=\s*/, '')

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

/**
 * Qué significa cada rótulo de una ficha, para el globo que aparece al pasar
 * el mouse por él (acá y en la ficha de la sección Distribuciones). Muy
 * breve: es un recordatorio, no la teoría.
 */
export const AYUDA_ROTULO = {
  probabilidad: 'Función de probabilidad: la probabilidad de que X valga exactamente x',
  densidad: 'Función de densidad: su integral sobre un intervalo da la probabilidad de caer en él',
  conjunta: 'La función de probabilidad o de densidad conjunta del vector',
  soporte: 'Los valores que puede tomar la variable',
  parametros: 'Las constantes que definen la distribución, con sus valores posibles',
  esperanza: 'Esperanza: el valor medio de X',
  varianza: 'Varianza: cuánto se dispersa X alrededor de su media',
  desvio: 'Desvío estándar: la raíz de la varianza, en las mismas unidades que X',
  esperanzas: 'La esperanza de cada componente',
  varianzas: 'La varianza de cada componente',
  supervivencia: 'Supervivencia: la probabilidad de que T supere t',
  propiedades: 'Marginales, condicionales y otras propiedades del vector',
  equivalencias: 'Distribuciones que coinciden con esta en un caso particular',
} as const

/** La ayuda de la fila de la función, según el tipo de distribución. */
export const ayudaFuncion = (grupo: FichaDistribucion['grupo']) =>
  grupo === 'discreta' ? AYUDA_ROTULO.probabilidad : grupo === 'continua' ? AYUDA_ROTULO.densidad : AYUDA_ROTULO.conjunta

export type GrupoDistribucion = FichaDistribucion['grupo']

export const anclaDistribucion = (id: string) => `teoria-${id}`
export const anclaGrupoDistribucion = (g: GrupoDistribucion | 'equivalencias') => `teoria-grupo-${g}`

/** Los grupos, con el rótulo del índice y el título de la sección. */
export const GRUPOS_DISTRIBUCION: { grupo: GrupoDistribucion; rotulo: string; titulo: string }[] = [
  { grupo: 'discreta', rotulo: 'Discretas', titulo: 'Distribuciones discretas' },
  { grupo: 'continua', rotulo: 'Continuas', titulo: 'Distribuciones continuas' },
  { grupo: 'multivariada', rotulo: 'Multivariadas', titulo: 'Distribuciones multivariadas' },
]

/** El rótulo es texto, con `$...$` si lleva una fórmula. */
type Fila = { rotulo: string; tex: string; ayuda: string }

function filas(f: FichaDistribucion): Fila[] {
  const multivariada = f.grupo === 'multivariada'
  const funcion = f.grupo === 'discreta' ? 'p_X(x)' : f.grupo === 'continua' ? 'f_X(x)' : null
  return [
    funcion
      ? { rotulo: `$${funcion}$`, tex: sinMiembroIzquierdo(f.funcion), ayuda: ayudaFuncion(f.grupo) }
      : { rotulo: 'Función', tex: f.funcion, ayuda: ayudaFuncion(f.grupo) },
    { rotulo: 'Soporte', tex: f.soporte, ayuda: AYUDA_ROTULO.soporte },
    { rotulo: 'Parámetros', tex: f.parametros, ayuda: AYUDA_ROTULO.parametros },
    {
      rotulo: multivariada ? 'Esperanzas' : '$E[X]$',
      tex: f.esperanza,
      ayuda: multivariada ? AYUDA_ROTULO.esperanzas : AYUDA_ROTULO.esperanza,
    },
    {
      rotulo: multivariada ? 'Varianzas' : '$\\operatorname{var}(X)$',
      tex: f.varianza,
      ayuda: multivariada ? AYUDA_ROTULO.varianzas : AYUDA_ROTULO.varianza,
    },
    ...(f.supervivencia ? [{ rotulo: '$S(t)$', tex: f.supervivencia, ayuda: AYUDA_ROTULO.supervivencia }] : []),
  ]
}

function Ficha({ f, anclas }: { f: FichaDistribucion; anclas: boolean }) {
  return (
    <article
      class={'ficha-dist' + (f.grupo === 'multivariada' ? ' ficha-dist--ancha' : '')}
      id={anclas ? anclaDistribucion(f.id) : undefined}
    >
      <header class="ficha-dist__cabeza">
        <h5 class="ficha-dist__nombre">{f.nombre}</h5>
        <span class="ficha-dist__notacion">
          <Formula tex={f.notacion} />
        </span>
      </header>
      <p class="ficha-dist__modelo">
        <Mate>{f.modelo}</Mate>
      </p>
      <dl class="ficha-dist__lista">
        {filas(f).map((fila) => (
          <div key={fila.rotulo} class="ficha-dist__fila">
            <dt data-tip={fila.ayuda}>
              <Mate>{fila.rotulo}</Mate>
            </dt>
            <dd>
              <Formula tex={fila.tex} />
            </dd>
          </div>
        ))}
        {f.propiedades?.length ? (
          <div class="ficha-dist__fila">
            <dt data-tip={AYUDA_ROTULO.propiedades}>Propiedades</dt>
            <dd class="ficha-dist__varias">
              {f.propiedades.map((p) => (
                <Formula key={p} tex={p} />
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
      {f.nota_soporte && (
        <p class="ficha-dist__nota">
          <Mate>{f.nota_soporte}</Mate>
        </p>
      )}
      {f.nota && (
        <p class="ficha-dist__nota">
          <Mate>{f.nota}</Mate>
        </p>
      )}
    </article>
  )
}

export function TeoriaDistribuciones({ anclas = false }: { anclas?: boolean }) {
  return (
    <div class="hoja teoria-dist">
      {GRUPOS_DISTRIBUCION.map(({ grupo, titulo }) => {
        const fichas = fichasDistribuciones.filter((f) => f.grupo === grupo)
        if (fichas.length === 0) return null
        return (
          <section
            key={grupo}
            class={'hoja__guia teoria-dist__grupo teoria-dist__grupo--' + grupo}
            id={anclas ? anclaGrupoDistribucion(grupo) : undefined}
          >
            <h3 class="hoja__titulo">{titulo}</h3>
            <div class="hoja__fichas">
              {fichas.map((f) => (
                <Ficha key={f.id} f={f} anclas={anclas} />
              ))}
            </div>
            {grupo !== 'multivariada' && (
              <p class="hoja__nota">
                <Mate>{`Fuera del soporte, $${grupo === 'discreta' ? 'p_X' : 'f_X'}(x) = 0$.`}</Mate>
              </p>
            )}
          </section>
        )
      })}

      <section
        class="hoja__guia teoria-dist__grupo teoria-dist__grupo--equivalencias"
        id={anclas ? anclaGrupoDistribucion('equivalencias') : undefined}
      >
        <h3 class="hoja__titulo">Equivalencias</h3>
        <ul class="teoria-dist__equivalencias">
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
