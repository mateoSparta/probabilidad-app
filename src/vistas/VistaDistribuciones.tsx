/**
 * Distribuciones (PLAN.md §12.4): las de la tabla de la cátedra, cada una con
 * una calculadora y, plegadas, su ficha y observaciones para la intuición.
 *
 * Lo que se ve de entrada es lo indispensable: la distribución elegida, sus
 * parámetros, el gráfico y la probabilidad. Los valores se escriben en los
 * huecos de la propia frase ("P(X ≤ _) = 0,75") o se eligen arrastrando las
 * líneas del gráfico. La ficha (fórmulas y momentos) y los tips se despliegan
 * a pedido. A la izquierda, un índice con las distribuciones, como el de las
 * guías; en pantallas angostas, un selector.
 *
 * Las cuentas están en dominio/distribuciones.ts y se contrastan con mpmath
 * (tools/verify/distribuciones.py). El botón de imprimir arma la tabla de
 * distribuciones de la cátedra (componentes/TablaDistribuciones.tsx).
 */
import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { GraficoDistribucion, type Manija } from '../componentes/GraficoDistribucion'
import { IconoDesplegar, IconoImprimir } from '../componentes/Iconos'
import { Formula, Mate } from '../componentes/Mate'
import { Indicador } from '../componentes/Indicador'
import { Suerte } from '../componentes/Material'
import { SubirLateral, usarSubir } from '../componentes/SubirLateral'
import { sinMiembroIzquierdo, TablaDeDistribuciones } from '../componentes/TablaDistribuciones'
import { imprimir } from '../componentes/imprimir'
import { fichasDistribuciones } from '../datos/contenido'
import {
  condicionalBivariada,
  cuantil,
  densidadBivariada,
  distribucionBivariada,
  errorParametro,
  multinomial,
  Phi,
  probabilidad,
  univariadaPorId,
  type Bivariada,
  type Evento,
  type Momento,
  type Parametro,
  type Univariada,
  type Valores,
} from '../dominio/distribuciones'
import { formatearNumero, leerNumero, marcasEje } from '../dominio/formato'
import type { FichaDistribucion } from '../dominio/tipos'

const GRUPOS: { grupo: FichaDistribucion['grupo']; nombre: string }[] = [
  { grupo: 'discreta', nombre: 'Discretas' },
  { grupo: 'continua', nombre: 'Continuas' },
  { grupo: 'multivariada', nombre: 'Multivariadas' },
]

/** Un número para escribir dentro de LaTeX: la coma va entre llaves. */
const tex = (v: number, dec = 4) => formatearNumero(v, dec, true).replace(',', '{,}').replace('−', '-')

const momento = (m: Momento) => (typeof m === 'number' ? formatearNumero(m, 4, true) : m === 'infinita' ? '∞' : 'no existe')

/** La última distribución elegida y qué secciones estaban abiertas, para encontrarlas al volver. */
let ultima = 'normal'
let abiertasAntes = { ficha: false, tips: false }

export function VistaDistribuciones() {
  const [id, setIdLocal] = useState(ultima)
  const [abiertas, setAbiertasLocal] = useState(abiertasAntes)
  const subir = usarSubir()
  const ficha = fichasDistribuciones.find((f) => f.id === id) ?? fichasDistribuciones[0]
  const d = univariadaPorId.get(ficha.id)
  // Los parámetros válidos de la calculadora, para los momentos de la ficha.
  const [valores, setValores] = useState<Valores | null>(null)

  const elegir = (nueva: string) => {
    ultima = nueva
    setValores(null)
    setIdLocal(nueva)
  }
  const alternar = (cual: 'ficha' | 'tips') => {
    abiertasAntes = { ...abiertas, [cual]: !abiertas[cual] }
    setAbiertasLocal(abiertasAntes)
  }

  function imprimirTabla(): void {
    void imprimir(
      <div class="impreso impreso--distribuciones">
        <TablaDeDistribuciones />
        <Suerte />
      </div>,
      'Tabla de distribuciones - Probabilidad y Estadística B',
    )
  }

  return (
    <>
      <IndiceDistribuciones actual={ficha.id} onElegir={elegir} />
      <SubirLateral visible={subir} />

      <section class="guia__intro dist-intro">
        <div class="dist-intro__fila">
          <h2>Distribuciones</h2>
          <button class="boton boton--icono" onClick={imprimirTabla}>
            <IconoImprimir />
            Imprimir la tabla
          </button>
        </div>
        <p class="guia__descripcion">
          Cada distribución del curso con su gráfico y una calculadora.
        </p>
      </section>

      <label class="dist-elegir">
        <span class="sr-solo">Distribución</span>
        <select class="entrada" value={ficha.id} onChange={(e) => elegir((e.target as HTMLSelectElement).value)}>
          {GRUPOS.map(({ grupo, nombre }) => (
            <optgroup key={grupo} label={nombre}>
              {fichasDistribuciones
                .filter((f) => f.grupo === grupo)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>

      {/* La key vuelve a montar la tarjeta (y la calculadora) al cambiar de distribución. */}
      <section key={ficha.id} class="dist" aria-labelledby="dist-nombre">
        {d ? (
          <CalculadoraUnivariada ficha={ficha} d={d} onValores={setValores} />
        ) : ficha.id === 'multinomial' ? (
          <CalculadoraMultinomial ficha={ficha} />
        ) : (
          <CalculadoraBivariada ficha={ficha} />
        )}
      </section>

      <div key={'mas-' + ficha.id} class="dist-mas">
        <Desplegable titulo="Ficha" abierto={abiertas.ficha} onAlternar={() => alternar('ficha')}>
          <Propiedades ficha={ficha} d={d} valores={valores} />
        </Desplegable>
        <Desplegable titulo="Intuición y relaciones" abierto={abiertas.tips} onAlternar={() => alternar('tips')}>
          <ul class="dist-tips">
            {ficha.tips.map((t, i) => (
              <li key={i} style={{ '--i': i }}>
                <Mate>{t}</Mate>
              </li>
            ))}
          </ul>
        </Desplegable>
      </div>
    </>
  )
}

// ------------------------------------------------------------- índice

/** Las distribuciones, agrupadas como en la tabla de la cátedra, en la columna de la izquierda. */
function IndiceDistribuciones({ actual, onElegir }: { actual: string; onElegir: (id: string) => void }) {
  return (
    <aside class="indice indice--grupos" aria-label="Distribuciones">
      <div class="indice__contenido">
        <ol class="indice__lista">
          {GRUPOS.map(({ grupo, nombre }, i) => (
            <li key={grupo} class="indice__grupo" style={{ '--i': i }}>
              <p class="indice__rotulo">{nombre}</p>
              <ol class="indice__sublista indice__sublista--fija">
                {fichasDistribuciones
                  .filter((f) => f.grupo === grupo)
                  .map((f) => (
                    <li key={f.id}>
                      <button
                        class={'indice__tema' + (f.id === actual ? ' indice__tema--activo' : '')}
                        aria-current={f.id === actual ? 'true' : undefined}
                        onClick={() => onElegir(f.id)}
                      >
                        {f.nombre}
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

// ---------------------------------------------------------- desplegable

/** Una sección que se pliega, como "Parciales disponibles" en el simulacro. */
function Desplegable({
  titulo,
  abierto,
  onAlternar,
  children,
}: {
  titulo: string
  abierto: boolean
  onAlternar: () => void
  children: ComponentChildren
}) {
  const id = 'desplegable-' + titulo.toLowerCase().replace(/\W+/g, '-')
  return (
    <section class={'desplegable dist-mas__seccion' + (abierto ? ' desplegable--abierto' : '')}>
      <h3 class="dist-mas__titulo">
        <button class="desplegable__boton" aria-expanded={abierto} aria-controls={id} onClick={onAlternar}>
          <IconoDesplegar />
          {titulo}
        </button>
      </h3>
      <div id={id} class="desplegable__contenido" inert={!abierto}>
        <div class="desplegable__interior">{children}</div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ cabecera

/**
 * El nombre de la distribución con su notación y, contra el margen derecho,
 * el selector de la calculadora (qué calcular, o qué marginal graficar). Lo
 * arma cada calculadora porque el selector es parte de su estado.
 */
function Cabeza({ ficha, children }: { ficha: FichaDistribucion; children?: ComponentChildren }) {
  return (
    <header class="dist__cabeza">
      <h3 id="dist-nombre" class="dist__nombre">
        {ficha.nombre}
      </h3>
      <span class="dist__notacion">
        <Formula tex={ficha.notacion} />
      </span>
      {children}
    </header>
  )
}

/** Un selector de opciones con el fondo de la elegida deslizándose entre ellas. */
function Selector<T extends string | number>({
  etiqueta,
  opciones,
  elegida,
  onElegir,
}: {
  etiqueta: string
  opciones: { valor: T; tex: string; tip?: string }[]
  elegida: T
  onElegir: (v: T) => void
}) {
  return (
    <div class="calc__modos" role="radiogroup" aria-label={etiqueta}>
      <Indicador selector=".calc__modo--activo" clave={`${elegida}/${opciones.length}`} />
      {opciones.map((o) => (
        <button
          key={o.valor}
          class={'calc__modo' + (o.valor === elegida ? ' calc__modo--activo' : '')}
          role="radio"
          aria-checked={o.valor === elegida}
          data-tip={o.tip}
          onClick={() => onElegir(o.valor)}
        >
          <Formula tex={o.tex} />
        </button>
      ))}
    </div>
  )
}

// ------------------------------------------------------------ huecos

/**
 * Un valor que se escribe dentro de una fórmula: un hueco subrayado, con la
 * tipografía de KaTeX, que crece con lo que se escribe. La ayuda (el rango
 * del parámetro) aparece en un globo.
 */
function Hueco({
  valor,
  etiqueta,
  error,
  ayuda,
  onCambiar,
}: {
  valor: string
  etiqueta: string
  error?: boolean
  ayuda?: string
  onCambiar: (v: string) => void
}) {
  return (
    <input
      class={'hueco' + (error ? ' hueco--error' : '')}
      type="text"
      inputMode="decimal"
      spellcheck={false}
      autoComplete="off"
      value={valor}
      style={{ width: `${Math.max(2, valor.length) + 1.2}ch` }}
      aria-label={etiqueta}
      aria-invalid={error ? true : undefined}
      data-tip={ayuda}
      onInput={(e) => onCambiar((e.target as HTMLInputElement).value)}
    />
  )
}

/** Una pieza de la frase: texto en KaTeX o un hueco. */
type Pieza = string | ComponentChildren

/** Una frase matemática con huecos: "P(X ≤ [ ]) = 0,75". */
function Frase({ piezas }: { piezas: Pieza[] }) {
  return (
    <span class="frase">
      {piezas.map((p, i) => (typeof p === 'string' ? <Formula key={i} tex={p} /> : <span key={i}>{p}</span>))}
    </span>
  )
}

/** Los parámetros, cada uno como "μ = [ ]", y debajo el aviso si alguno no sirve. */
function Parametros({ children, aviso }: { children: ComponentChildren; aviso?: string | null }) {
  return (
    <div class="calc__parametros">
      <div class="calc__campos">{children}</div>
      {aviso && (
        <p class="calc__aviso">
          <Mate>{aviso}</Mate>
        </p>
      )}
    </div>
  )
}

function CampoParametro({
  texParam,
  valor,
  error,
  ayuda,
  onCambiar,
}: {
  texParam: string
  valor: string
  error?: boolean
  ayuda?: string
  onCambiar: (v: string) => void
}) {
  return (
    <span class="calc__campo">
      <Formula tex={texParam + ' ='} />
      <Hueco valor={valor} etiqueta={texParam} error={error} ayuda={ayuda} onCambiar={onCambiar} />
    </span>
  )
}

function pistaParametro(q: Parametro): string | undefined {
  if (q.entero) return q.min !== undefined ? `Entero, desde ${q.min}` : 'Entero'
  if (q.min === 0 && q.max === 1) return 'Entre 0 y 1'
  if (q.min === 0 && q.minAbierto) return 'Positivo'
  return undefined
}

/** "Tiene que ser positivo." con el parámetro adelante: "$\lambda$ tiene que ser positivo." */
const conParametro = (texParam: string, mensaje: string) =>
  `$${texParam}$ ${mensaje.charAt(0).toLowerCase()}${mensaje.slice(1)}`

// ---------------------------------------------------------- univariadas

type Modo = 'menor' | 'mayor' | 'entre' | 'igual' | 'cuantil'

function modos(d: Univariada): { modo: Modo; tex: string }[] {
  const discreta = d.tipo === 'discreta'
  return [
    ...(discreta ? [{ modo: 'igual' as const, tex: 'P(X = x)' }] : []),
    { modo: 'menor', tex: 'P(X \\le x)' },
    { modo: 'mayor', tex: discreta ? 'P(X \\ge x)' : 'P(X > x)' },
    { modo: 'entre', tex: discreta ? 'P(a \\le X \\le b)' : 'P(a < X < b)' },
    { modo: 'cuantil', tex: 'x_\\alpha' },
  ]
}

function CalculadoraUnivariada({
  ficha,
  d,
  onValores,
}: {
  ficha: FichaDistribucion
  d: Univariada
  onValores: (p: Valores | null) => void
}) {
  const discreta = d.tipo === 'discreta'
  const [crudos, setCrudos] = useState<Record<string, string>>(() =>
    Object.fromEntries(d.parametros.map((p) => [p.id, formatearNumero(p.defecto, 4, true)])),
  )
  const p: Valores = Object.fromEntries(d.parametros.map((q) => [q.id, leerNumero(crudos[q.id] ?? '')]))
  const errores = Object.fromEntries(d.parametros.map((q) => [q.id, errorParametro(q, p[q.id])]))
  const conError = d.parametros.find((q) => errores[q.id])
  const restriccion = conError ? null : (d.restriccion?.(p) ?? null)
  const valido = !conError && !restriccion
  const avisoParametros = conError ? conParametro(conError.tex, errores[conError.id]!) : restriccion

  // Los momentos de la ficha siguen a los parámetros.
  const claveValores = valido ? JSON.stringify(p) : ''
  useEffect(() => onValores(valido ? p : null), [claveValores])

  // Valores iniciales del evento, con los parámetros por defecto.
  const [inicial] = useState(() => {
    const redondo = (v: number) => (discreta ? Math.round(v) : Number(v.toPrecision(3)))
    return {
      x: redondo(cuantil(d, p, 0.75)),
      a: redondo(cuantil(d, p, 0.25)),
      b: redondo(cuantil(d, p, 0.75)),
    }
  })
  const [modo, setModo] = useState<Modo>(discreta ? 'igual' : 'menor')
  const [xT, setX] = useState(formatearNumero(inicial.x, 4, true))
  const [aT, setA] = useState(formatearNumero(inicial.a, 4, true))
  const [bT, setB] = useState(formatearNumero(inicial.b, 4, true))
  const [alfaT, setAlfa] = useState('0,95')
  const [x, a, b, alfa] = [xT, aT, bT, alfaT].map(leerNumero)

  const errorEvento =
    modo === 'cuantil'
      ? !(alfa > 0 && alfa < 1)
        ? '$\\alpha$ tiene que estar entre 0 y 1.'
        : null
      : modo === 'entre'
        ? !Number.isFinite(a) || !Number.isFinite(b)
          ? '$a$ y $b$ tienen que ser números.'
          : a > b
            ? 'Tiene que ser $a \\le b$.'
            : null
        : !Number.isFinite(x)
          ? '$x$ tiene que ser un número.'
          : modo === 'igual' && !Number.isInteger(x)
            ? '$x$ tiene que ser un entero.'
            : null

  let valor: string | null = null
  let region: [number, number] = [0, -1]
  let manijas: Manija[] = []
  const hx = <Hueco valor={xT} etiqueta="x" error={!Number.isFinite(x)} onCambiar={setX} />
  const ha = <Hueco valor={aT} etiqueta="a" error={!Number.isFinite(a)} onCambiar={setA} />
  const hb = <Hueco valor={bT} etiqueta="b" error={!Number.isFinite(b)} onCambiar={setB} />
  const halfa = <Hueco valor={alfaT} etiqueta="α" error={!(alfa > 0 && alfa < 1)} onCambiar={setAlfa} />
  const le = discreta ? '\\le' : '<'
  const piezas: Pieza[] =
    modo === 'igual'
      ? ['P(X =', hx, ')']
      : modo === 'menor'
        ? ['P(X \\le', hx, ')']
        : modo === 'mayor'
          ? [discreta ? 'P(X \\ge' : 'P(X >', hx, ')']
          : modo === 'entre'
            ? ['P(', ha, `${le} X ${le}`, hb, ')']
            : [discreta ? 'P(X \\le x_\\alpha) \\ge' : 'P(X \\le x_\\alpha) =', halfa, '\\;\\Rightarrow\\; x_\\alpha']

  if (valido && !errorEvento) {
    if (modo === 'cuantil') {
      const xq = cuantil(d, p, alfa)
      region = [-Infinity, xq]
      manijas = [{ id: 'x', valor: xq, rotulo: 'xα' }]
      valor = formatearNumero(xq, discreta ? 0 : 6, true)
    } else {
      const evento: Evento = modo === 'entre' ? { tipo: 'entre', a, b } : { tipo: modo, x }
      valor = formatearNumero(probabilidad(d, p, evento), 6)
      region =
        modo === 'menor'
          ? [-Infinity, discreta ? Math.floor(x) : x]
          : modo === 'mayor'
            ? [discreta ? Math.ceil(x) : x, Infinity]
            : modo === 'entre'
              ? [discreta ? Math.ceil(a) : a, discreta ? Math.floor(b) : b]
              : [x, x]
      manijas =
        modo === 'entre'
          ? [
              { id: 'a', valor: a, rotulo: 'a' },
              { id: 'b', valor: b, rotulo: 'b' },
            ]
          : [{ id: 'x', valor: x, rotulo: 'x' }]
    }
  }

  function mover(id: Manija['id'], v: number): void {
    const s = formatearNumero(v, 6, true)
    if (modo === 'cuantil') {
      // Mover el cuantil es elegir otra probabilidad acumulada.
      const F = d.distribucion(v, p)
      setAlfa(formatearNumero(Math.min(0.9999, Math.max(0.0001, F)), 4, true))
      return
    }
    if (id === 'x') setX(s)
    else if (id === 'a') setA(formatearNumero(Math.min(v, b), 6, true))
    else setB(formatearNumero(Math.max(v, a), 6, true))
  }

  return (
    <>
      <Cabeza ficha={ficha}>
        <Selector
          etiqueta="Qué calcular"
          opciones={modos(d).map((m) => ({ valor: m.modo, tex: m.tex }))}
          elegida={modo}
          onElegir={setModo}
        />
      </Cabeza>
      <div class="calc">
        <div class="calc__controles">
          <Parametros aviso={avisoParametros}>
            {d.parametros.map((q) => (
              <CampoParametro
                key={q.id}
                texParam={q.tex}
                valor={crudos[q.id] ?? ''}
                error={!!errores[q.id] || !!restriccion}
                ayuda={pistaParametro(q)}
                onCambiar={(v) => setCrudos((c) => ({ ...c, [q.id]: v }))}
              />
            ))}
          </Parametros>
        </div>

        {valido ? (
          <div class="calc__grafico">
            <GraficoDistribucion d={d} p={p} region={region} manijas={manijas} onMover={mover} />
          </div>
        ) : (
          <p class="calc__vacio">Con estos parámetros no hay distribución que graficar.</p>
        )}

        {valido && (
          <div key={modo} class="calc__resultado">
            <p class="resultado">
              <Frase piezas={piezas} />
              {valor !== null && (
                <>
                  <Formula tex="=" />
                  <strong class="resultado__valor">{valor}</strong>
                </>
              )}
            </p>
            {errorEvento ? (
              <p class="calc__aviso">
                <Mate>{errorEvento}</Mate>
              </p>
            ) : (
              modo === 'cuantil' &&
              discreta && <p class="calc__nota">El menor valor que cumple la desigualdad.</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------- multinomial

function CalculadoraMultinomial({ ficha }: { ficha: FichaDistribucion }) {
  const [nT, setN] = useState('10')
  const [k, setK] = useState(3)
  const [psT, setPs] = useState(['0,2', '0,3', '0,25', '0,15', '0,05'])
  const [xsT, setXs] = useState(['2', '3', '2', '1', '1'])
  const [componente, setComponente] = useState(0)

  const n = leerNumero(nT)
  const ps = psT.slice(0, k - 1).map(leerNumero)
  const pk = 1 - ps.reduce((s, v) => s + v, 0)
  const xs = xsT.slice(0, k - 1).map(leerNumero)
  const xk = n - xs.reduce((s, v) => s + v, 0)
  const todosP = [...ps, pk]
  const todosX = [...xs, xk]

  const errorParametros = !(Number.isInteger(n) && n >= 1 && n <= 500)
    ? '$n$ tiene que ser un entero entre 1 y 500.'
    : ps.some((v) => !(v > 0 && v < 1))
      ? 'Cada $p_i$ tiene que estar entre 0 y 1.'
      : !(pk > 0)
        ? `Las probabilidades tienen que sumar menos de 1, porque $p_${k}$ es lo que falta.`
        : null
  const errorEvento = errorParametros
    ? null
    : xs.some((v) => !(Number.isInteger(v) && v >= 0))
      ? 'Cada $x_i$ tiene que ser un entero no negativo.'
      : xk < 0
        ? `Los $x_i$ suman más que $n$, y $x_${k}$ sería negativo.`
        : null
  const prob = errorParametros || errorEvento ? null : multinomial(n, todosP, todosX)
  const binomial = univariadaPorId.get('binomial')!
  const j = Math.min(componente, k - 1)

  const piezas: Pieza[] = []
  for (let i = 0; i < k - 1; i++) {
    piezas.push(`${i === 0 ? 'P(' : ',\\ '}X_${i + 1} =`)
    piezas.push(
      <Hueco
        valor={xsT[i] ?? ''}
        etiqueta={`x${i + 1}`}
        error={!(Number.isInteger(xs[i]) && xs[i] >= 0)}
        onCambiar={(v) => setXs((s) => Object.assign([...s], { [i]: v }))}
      />,
    )
  }
  piezas.push(`,\\ X_${k} = ${Number.isFinite(xk) ? tex(xk, 0) : '?'})`)

  return (
    <>
      <Cabeza ficha={ficha}>
        {!errorParametros && (
          <Selector
            etiqueta="Marginal del gráfico"
            opciones={todosP.map((_, i) => ({ valor: i, tex: `X_${i + 1}`, tip: `Graficar la marginal de X${i + 1}` }))}
            elegida={j}
            onElegir={setComponente}
          />
        )}
      </Cabeza>
      <div class="calc">
        <div class="calc__controles">
          <Parametros aviso={errorParametros}>
            <CampoParametro texParam="n" valor={nT} error={!(Number.isInteger(n) && n >= 1)} onCambiar={setN} />
            <span class="calc__campo">
              <Formula tex="k =" />
              <select
                class="hueco hueco--lista"
                aria-label="k"
                data-tip="De 2 a 6 resultados"
                value={k}
                onChange={(e) => setK(Number((e.target as HTMLSelectElement).value))}
              >
                {[2, 3, 4, 5, 6].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </span>
            {Array.from({ length: k - 1 }, (_, i) => (
              <CampoParametro
                key={i}
                texParam={`p_${i + 1}`}
                valor={psT[i] ?? ''}
                error={!(ps[i] > 0 && ps[i] < 1)}
                onCambiar={(v) => setPs((s) => Object.assign([...s], { [i]: v }))}
              />
            ))}
            <span class="calc__campo calc__campo--calculado">
              <Formula tex={`p_${k} = ${Number.isFinite(pk) ? tex(pk, 4) : '?'}`} />
            </span>
          </Parametros>
        </div>

        {errorParametros ? (
          <p class="calc__vacio">Con estos parámetros no hay distribución que graficar.</p>
        ) : (
          <>
            <div class="calc__grafico">
              <GraficoDistribucion
                d={binomial}
                p={{ n, p: todosP[j] }}
                region={Number.isFinite(todosX[j]) ? [todosX[j], todosX[j]] : [0, -1]}
                manijas={
                  j < k - 1 && Number.isFinite(todosX[j]) ? [{ id: 'x', valor: todosX[j], rotulo: `x${j + 1}` }] : []
                }
                onMover={(_, v) => setXs((s) => Object.assign([...s], { [j]: String(v) }))}
              />
              <p class="calc__pie">
                <Mate>{`La marginal $X_${j + 1} \\sim \\mathcal{B}(${tex(n, 0)}, ${tex(todosP[j])})$.`}</Mate>
              </p>
            </div>
            <div class="calc__resultado">
              <p class="resultado">
                <Frase piezas={piezas} />
                {prob !== null && (
                  <>
                    <Formula tex="=" />
                    <strong class="resultado__valor">{formatearNumero(prob, 6)}</strong>
                  </>
                )}
              </p>
              {errorEvento && (
                <p class="calc__aviso">
                  <Mate>{errorEvento}</Mate>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ------------------------------------------------------ normal bivariada

function CalculadoraBivariada({ ficha }: { ficha: FichaDistribucion }) {
  const [t, setT] = useState<Record<string, string>>({
    mu1: '0', mu2: '0', s21: '1', s22: '1', rho: '0,5', a: '0,5', b: '1', x1: '1',
  })
  const v = Object.fromEntries(Object.entries(t).map(([k, s]) => [k, leerNumero(s)])) as Record<string, number>
  const cambiar = (k: string) => (s: string) => setT((o) => ({ ...o, [k]: s }))

  const errorParametros = [v.mu1, v.mu2].some((x) => !Number.isFinite(x))
    ? 'Las medias tienen que ser números.'
    : !(v.s21 > 0 && v.s22 > 0)
      ? 'Las varianzas tienen que ser positivas.'
      : !(v.rho > -1 && v.rho < 1)
        ? 'Tiene que ser $-1 < \\rho < 1$.'
        : null
  const errorEvento = errorParametros
    ? null
    : [v.a, v.b, v.x1].some((x) => !Number.isFinite(x))
      ? '$a$, $b$ y $x_1$ tienen que ser números.'
      : null
  const par: Bivariada = { mu1: v.mu1, mu2: v.mu2, s1: Math.sqrt(v.s21), s2: Math.sqrt(v.s22), rho: v.rho }
  const listo = !errorParametros && !errorEvento
  const prob = listo ? distribucionBivariada(v.a, v.b, par) : null
  const cond = listo ? condicionalBivariada(v.x1, par) : null

  const campo = (k: string, texParam: string, error: boolean) => (
    <CampoParametro texParam={texParam} valor={t[k]} error={error} onCambiar={cambiar(k)} />
  )
  const hueco = (k: string, etiqueta: string) => (
    <Hueco valor={t[k]} etiqueta={etiqueta} error={!Number.isFinite(v[k])} onCambiar={cambiar(k)} />
  )

  return (
    <>
      <Cabeza ficha={ficha} />
      <div class="calc">
        <div class="calc__controles">
          <Parametros aviso={errorParametros}>
            {campo('mu1', '\\mu_1', !Number.isFinite(v.mu1))}
            {campo('mu2', '\\mu_2', !Number.isFinite(v.mu2))}
            {campo('s21', '\\sigma_1^2', !(v.s21 > 0))}
            {campo('s22', '\\sigma_2^2', !(v.s22 > 0))}
            {campo('rho', '\\rho', !(v.rho > -1 && v.rho < 1))}
          </Parametros>
        </div>

        {errorParametros ? (
          <p class="calc__vacio">Con estos parámetros no hay distribución que graficar.</p>
        ) : (
          <>
            <div class="calc__grafico calc__grafico--cuadrado">
              <GraficoBivariado
                par={par}
                a={Number.isFinite(v.a) ? v.a : par.mu1}
                b={Number.isFinite(v.b) ? v.b : par.mu2}
                onMover={(a, b) => setT((o) => ({ ...o, a: formatearNumero(a, 3, true), b: formatearNumero(b, 3, true) }))}
              />
            </div>
            <div class="calc__resultado">
              <p class="resultado">
                <Frase piezas={['P(X_1 \\le', hueco('a', 'a'), ',\\ X_2 \\le', hueco('b', 'b'), ')']} />
                {prob !== null && (
                  <>
                    <Formula tex="=" />
                    <strong class="resultado__valor">{formatearNumero(prob, 6)}</strong>
                  </>
                )}
              </p>
              {cond && (
                <p class="resultado resultado--secundario">
                  <Frase piezas={[`P(X_2 \\le ${tex(v.b)} \\mid X_1 =`, hueco('x1', 'x1'), ')']} />
                  <Formula tex="=" />
                  <span class="resultado__otro">{formatearNumero(Phi((v.b - cond.media) / cond.desvio), 6)}</span>
                </p>
              )}
              {errorEvento && (
                <p class="calc__aviso">
                  <Mate>{errorEvento}</Mate>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

/**
 * Las curvas de nivel de la densidad (a 1, 2 y 3 desvíos, en la métrica de
 * la normal) y sombreado el cuadrante {x₁ ≤ a, x₂ ≤ b}. El punto (a, b) se
 * arrastra.
 */
function GraficoBivariado({
  par,
  a,
  b,
  onMover,
}: {
  par: Bivariada
  a: number
  b: number
  onMover: (a: number, b: number) => void
}) {
  const [arrastrando, setArrastrando] = useState(false)
  const L = 360
  const M = 40
  const [x0, x1] = [par.mu1 - 3.6 * par.s1, par.mu1 + 3.6 * par.s1]
  const [y0, y1] = [par.mu2 - 3.6 * par.s2, par.mu2 + 3.6 * par.s2]
  const px = (x: number) => M + ((x - x0) / (x1 - x0)) * (L - M - 10)
  const py = (y: number) => L - M - ((y - y0) / (y1 - y0)) * (L - M - 10)
  const r = Math.sqrt(1 - par.rho * par.rho)
  const elipse = (k: number) =>
    Array.from({ length: 121 }, (_, i) => {
      const th = (2 * Math.PI * i) / 120
      const x = par.mu1 + par.s1 * k * Math.cos(th)
      const y = par.mu2 + par.s2 * k * (par.rho * Math.cos(th) + r * Math.sin(th))
      return `${i ? 'L' : 'M'}${px(x).toFixed(1)},${py(y).toFixed(1)}`
    }).join(' ') + ' Z'
  const ac = Math.min(x1, Math.max(x0, a))
  const bc = Math.min(y1, Math.max(y0, b))
  const pico = densidadBivariada(par.mu1, par.mu2, par)

  function mover(e: PointerEvent): void {
    const svg = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const fx = ((e.clientX - svg.left) / svg.width) * L
    const fy = ((e.clientY - svg.top) / svg.height) * L
    const x = x0 + ((fx - M) / (L - M - 10)) * (x1 - x0)
    const y = y0 + ((L - M - fy) / (L - M - 10)) * (y1 - y0)
    const dec = Math.max(0, 2 - Math.floor(Math.log10(x1 - x0)))
    onMover(
      Number(Math.min(x1, Math.max(x0, x)).toFixed(dec)),
      Number(Math.min(y1, Math.max(y0, y)).toFixed(dec)),
    )
  }

  return (
    <svg
      class={'grafico-dist grafico-dist--bivariado' + (arrastrando ? ' grafico-dist--arrastrando' : '')}
      viewBox={`0 0 ${L} ${L}`}
      onPointerDown={(e) => {
        setArrastrando(true)
        ;(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId)
        mover(e)
      }}
      onPointerMove={(e) => arrastrando && mover(e)}
      onPointerUp={() => setArrastrando(false)}
      onPointerCancel={() => setArrastrando(false)}
      role="img"
      aria-label={`Curvas de nivel de la normal bivariada; densidad máxima ${formatearNumero(pico, 4)}`}
    >
      <rect x={px(x0)} y={py(bc)} width={px(ac) - px(x0)} height={py(y0) - py(bc)} class="grafico-dist__area" />
      {[3, 2, 1].map((k) => (
        <path key={k} d={elipse(k)} class={'grafico-dist__nivel grafico-dist__nivel--' + k} />
      ))}
      <line x1={px(x0)} x2={px(x1)} y1={py(y0)} y2={py(y0)} class="grafico-dist__eje" />
      <line x1={px(x0)} x2={px(x0)} y1={py(y0)} y2={py(y1)} class="grafico-dist__eje" />
      {marcasEje(x0, x1, 5).map((v) => (
        <text key={'x' + v} x={px(v)} y={py(y0) + 16} class="grafico-dist__marca" text-anchor="middle">
          {formatearNumero(v, 3, true)}
        </text>
      ))}
      {marcasEje(y0, y1, 5).map((v) => (
        <text key={'y' + v} x={px(x0) - 6} y={py(v) + 4} class="grafico-dist__marca" text-anchor="end">
          {formatearNumero(v, 3, true)}
        </text>
      ))}
      <line x1={px(ac)} x2={px(ac)} y1={py(y0)} y2={py(bc)} class="grafico-dist__linea" />
      <line x1={px(x0)} x2={px(ac)} y1={py(bc)} y2={py(bc)} class="grafico-dist__linea" />
      <circle cx={px(ac)} cy={py(bc)} r={6} class="grafico-dist__perilla" />
      <text x={px(x1) - 4} y={py(y0) - 6} class="grafico-dist__eje-rotulo" text-anchor="end">
        x
        <tspan dy="3" font-size="0.75em">
          1
        </tspan>
      </text>
      <text x={px(x0) + 6} y={py(y1) + 12} class="grafico-dist__eje-rotulo">
        x
        <tspan dy="3" font-size="0.75em">
          2
        </tspan>
      </text>
    </svg>
  )
}

// ------------------------------------------------------------- ficha

/**
 * La ficha: el modelo y las fórmulas de la tabla de la cátedra. En las
 * univariadas, la esperanza y la varianza llevan además su valor con los
 * parámetros elegidos.
 */
function Propiedades({ ficha, d, valores }: { ficha: FichaDistribucion; d?: Univariada; valores: Valores | null }) {
  const funcion = ficha.grupo === 'discreta' ? 'p_X(x)' : ficha.grupo === 'continua' ? 'f_X(x)' : null
  const conValores = d && valores ? { d, valores } : null
  const varianza = conValores ? conValores.d.varianza(conValores.valores) : null
  const filas: { rotulo: ComponentChildren; tex?: string; valor?: string | null; nota?: string }[] = [
    { rotulo: funcion ? <Formula tex={funcion} /> : 'Función', tex: funcion ? sinMiembroIzquierdo(ficha.funcion) : ficha.funcion },
    { rotulo: 'Soporte', tex: ficha.soporte, nota: ficha.nota_soporte },
    { rotulo: 'Parámetros', tex: ficha.parametros },
    {
      rotulo: ficha.grupo === 'multivariada' ? 'Esperanzas' : <Formula tex="E[X]" />,
      tex: ficha.esperanza,
      valor: conValores ? momento(conValores.d.esperanza(conValores.valores)) : null,
    },
    {
      rotulo: ficha.grupo === 'multivariada' ? 'Varianzas' : <Formula tex="\operatorname{var}(X)" />,
      tex: ficha.varianza,
      valor: varianza === null ? null : momento(varianza),
    },
    ...(typeof varianza === 'number'
      ? [{ rotulo: <Formula tex="\sigma_X" />, valor: formatearNumero(Math.sqrt(varianza), 4, true) }]
      : []),
    ...(ficha.supervivencia ? [{ rotulo: 'Supervivencia', tex: ficha.supervivencia }] : []),
  ]
  return (
    <div class="dist-ficha">
      <p class="dist-ficha__modelo">
        <Mate>{ficha.modelo}</Mate>
      </p>
      <dl class="dist-ficha__lista">
        {filas.map((f, i) => (
          <div key={i} class="dist-ficha__fila">
            <dt>{f.rotulo}</dt>
            <dd>
              {f.tex && <Formula tex={f.tex} />}
              {f.valor != null && (
                <span class="dist-ficha__valor">
                  {f.tex && <Formula tex="=" />}
                  {f.valor}
                </span>
              )}
              {f.nota && (
                <span class="dist-ficha__nota">
                  <Mate>{f.nota}</Mate>
                </span>
              )}
            </dd>
          </div>
        ))}
        {ficha.propiedades?.length ? (
          <div class="dist-ficha__fila">
            <dt>Propiedades</dt>
            <dd class="dist-ficha__varias">
              {ficha.propiedades.map((p) => (
                <Formula key={p} tex={p} />
              ))}
            </dd>
          </div>
        ) : null}
        {ficha.equivalencias?.length ? (
          <div class="dist-ficha__fila">
            <dt>Equivalencias</dt>
            <dd class="dist-ficha__varias">
              {ficha.equivalencias.map((e) => (
                <Formula key={e} tex={e} />
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
      {ficha.nota && (
        <p class="dist-ficha__pie">
          <Mate>{ficha.nota}</Mate>
        </p>
      )}
    </div>
  )
}
