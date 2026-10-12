/**
 * Distribuciones (PLAN.md §12.4): las de la tabla de la cátedra, cada una con
 * su ficha (para qué se usa, soporte, función, momentos) y una calculadora.
 *
 * La calculadora toma los parámetros, dibuja la distribución y calcula la
 * probabilidad de un evento (P(X ≤ x), P(X > x), P(a < X < b), P(X = x)) o un
 * cuantil. El evento se elige también arrastrando sus líneas sobre el
 * gráfico. Las cuentas están en dominio/distribuciones.ts y se contrastan con
 * mpmath (tools/verify/distribuciones.py).
 */
import { useState } from 'preact/hooks'

import { GraficoDistribucion, type Manija } from '../componentes/GraficoDistribucion'
import { Formula, Mate } from '../componentes/Mate'
import { pedirTabla } from '../componentes/Material'
import { SubirLateral, usarSubir } from '../componentes/SubirLateral'
import { fichasDistribuciones, tablas } from '../datos/contenido'
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

/** La última distribución elegida, para encontrarla al volver a la sección. */
let ultima = 'normal'

export function VistaDistribuciones() {
  const [id, setIdLocal] = useState(ultima)
  const setId = (nueva: string) => {
    ultima = nueva
    setIdLocal(nueva)
  }
  const subir = usarSubir()
  const ficha = fichasDistribuciones.find((f) => f.id === id) ?? fichasDistribuciones[0]
  const d = univariadaPorId.get(ficha.id)
  const tabla = tablas.find((t) => t.id === ficha.id)

  return (
    <>
      <SubirLateral visible={subir} />

      <section class="guia__intro">
        <h2>Distribuciones</h2>
        <p class="guia__descripcion">
          Las distribuciones de la tabla de la cátedra, con su ficha y una calculadora. Se eligen
          los parámetros y el evento, y el gráfico muestra la probabilidad como área o como
          barras. Las líneas del gráfico se arrastran para cambiar el evento.
        </p>
      </section>

      <nav class="dist-selector" aria-label="Distribuciones">
        {GRUPOS.map(({ grupo, nombre }) => (
          <div key={grupo} class="dist-selector__grupo">
            <span class="dist-selector__nombre">{nombre}</span>
            <div class="dist-selector__opciones">
              {fichasDistribuciones
                .filter((f) => f.grupo === grupo)
                .map((f) => (
                  <button
                    key={f.id}
                    class={'chip-opcion' + (f.id === ficha.id ? ' chip-opcion--activa' : '')}
                    aria-pressed={f.id === ficha.id}
                    onClick={() => setId(f.id)}
                  >
                    {f.nombre}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </nav>

      <section class="dist" aria-labelledby="dist-nombre">
        <header class="dist__cabeza">
          <h3 id="dist-nombre" class="dist__nombre">
            {ficha.nombre}
          </h3>
          <span class="dist__notacion">
            <Formula tex={ficha.notacion} />
          </span>
          {tabla && (
            <a class="dist__tabla" href="#/formulas" onClick={() => pedirTabla(tabla.id)}>
              Ver la tabla de la cátedra
            </a>
          )}
        </header>
        <p class="dist__modelo">
          <Mate>{ficha.modelo}</Mate>
        </p>

        {/* La key reinicia la calculadora al cambiar de distribución. */}
        {d ? (
          <CalculadoraUnivariada key={d.id} d={d} />
        ) : ficha.id === 'multinomial' ? (
          <CalculadoraMultinomial />
        ) : (
          <CalculadoraBivariada />
        )}

        <Propiedades ficha={ficha} />
      </section>
    </>
  )
}

// ---------------------------------------------------------- univariadas

type Modo = 'menor' | 'mayor' | 'entre' | 'igual' | 'cuantil'

function modos(d: Univariada): { modo: Modo; tex: string }[] {
  const discreta = d.tipo === 'discreta'
  return [
    ...(discreta ? [{ modo: 'igual' as const, tex: 'P(X = x)' }] : []),
    { modo: 'menor', tex: 'P(X \\le x)' },
    { modo: 'mayor', tex: discreta ? 'P(X \\ge x)' : 'P(X > x)' },
    { modo: 'entre', tex: discreta ? 'P(a \\le X \\le b)' : 'P(a < X < b)' },
    { modo: 'cuantil', tex: '\\text{cuantil } x_\\alpha' },
  ]
}

function CalculadoraUnivariada({ d }: { d: Univariada }) {
  const discreta = d.tipo === 'discreta'
  const [crudos, setCrudos] = useState<Record<string, string>>(() =>
    Object.fromEntries(d.parametros.map((p) => [p.id, formatearNumero(p.defecto, 4, true)])),
  )
  const p: Valores = Object.fromEntries(d.parametros.map((q) => [q.id, leerNumero(crudos[q.id] ?? '')]))
  const errores = Object.fromEntries(d.parametros.map((q) => [q.id, errorParametro(q, p[q.id])]))
  const restriccion = Object.values(errores).some(Boolean) ? null : (d.restriccion?.(p) ?? null)
  const valido = !Object.values(errores).some(Boolean) && !restriccion

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
        ? 'α tiene que estar entre 0 y 1.'
        : null
      : modo === 'entre'
        ? !Number.isFinite(a) || !Number.isFinite(b)
          ? 'a y b tienen que ser números.'
          : a > b
            ? 'Tiene que ser a ≤ b.'
            : null
        : !Number.isFinite(x)
          ? 'x tiene que ser un número.'
          : modo === 'igual' && !Number.isInteger(x)
            ? 'x tiene que ser un entero.'
            : null

  let resultado: { etiqueta: string; valor: string; detalle?: string } | null = null
  let region: [number, number] = [0, -1]
  let manijas: Manija[] = []

  if (valido && !errorEvento) {
    if (modo === 'cuantil') {
      const xq = cuantil(d, p, alfa)
      region = [-Infinity, xq]
      manijas = [{ id: 'x', valor: xq, rotulo: 'xα' }]
      resultado = {
        etiqueta: `x_{${tex(alfa, 4)}}`,
        valor: formatearNumero(xq, discreta ? 0 : 6, true),
        detalle: discreta
          ? `El menor $x$ con $F_X(x) \\ge ${tex(alfa)}$; $F_X(x) = ${tex(d.distribucion(xq, p), 6)}$.`
          : `El valor con $F_X(x) = ${tex(alfa)}$.`,
      }
    } else {
      const evento: Evento = modo === 'entre' ? { tipo: 'entre', a, b } : { tipo: modo, x }
      const etiqueta = modos(d)
        .find((m) => m.modo === modo)!
        .tex.replace('x', tex(x))
        .replace(/\ba\b/, tex(a))
        .replace(/\bb\b/, tex(b))
      resultado = { etiqueta, valor: formatearNumero(probabilidad(d, p, evento), 6) }
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
    <div class="calculadora">
      <fieldset class="calculadora__parametros">
        <legend class="calculadora__rotulo">Parámetros</legend>
        {d.parametros.map((q) => (
          <CampoNumero
            key={q.id}
            etiqueta={q.tex}
            valor={crudos[q.id] ?? ''}
            error={errores[q.id]}
            onCambiar={(v) => setCrudos((c) => ({ ...c, [q.id]: v }))}
            pista={pistaParametro(q)}
          />
        ))}
        {restriccion && (
          <p class="calculadora__error">
            <Mate>{restriccion}</Mate>
          </p>
        )}
      </fieldset>

      <fieldset class="calculadora__evento">
        <legend class="calculadora__rotulo">Calcular</legend>
        <div class="calculadora__modos" role="radiogroup">
          {modos(d).map((m) => (
            <button
              key={m.modo}
              class={'chip-opcion' + (m.modo === modo ? ' chip-opcion--activa' : '')}
              role="radio"
              aria-checked={m.modo === modo}
              onClick={() => setModo(m.modo)}
            >
              <Formula tex={m.tex} />
            </button>
          ))}
        </div>
        <div class="calculadora__valores">
          {modo === 'entre' ? (
            <>
              <CampoNumero etiqueta="a" valor={aT} onCambiar={setA} />
              <CampoNumero etiqueta="b" valor={bT} onCambiar={setB} />
            </>
          ) : modo === 'cuantil' ? (
            <CampoNumero etiqueta="\alpha" valor={alfaT} onCambiar={setAlfa} />
          ) : (
            <CampoNumero etiqueta="x" valor={xT} onCambiar={setX} />
          )}
        </div>
        {errorEvento && <p class="calculadora__error">{errorEvento}</p>}
      </fieldset>

      {valido ? (
        <div class="calculadora__grafico">
          <GraficoDistribucion d={d} p={p} region={region} manijas={manijas} onMover={mover} />
        </div>
      ) : (
        <p class="vacio">Con estos parámetros no hay distribución que graficar.</p>
      )}

      {valido && (
        <div class="calculadora__resultado">
          {resultado && (
            <p class="resultado">
              <span class="resultado__etiqueta">
                <Formula tex={resultado.etiqueta} />
              </span>
              <span class="resultado__igual">=</span>
              <strong class="resultado__valor">{resultado.valor}</strong>
            </p>
          )}
          {resultado?.detalle && (
            <p class="dato-chico">
              <Mate>{resultado.detalle}</Mate>
            </p>
          )}
          <ul class="calculadora__momentos">
            <li>
              <Formula tex="E[X]" /> = {momento(d.esperanza(p))}
            </li>
            <li>
              <Formula tex="\operatorname{var}(X)" /> = {momento(d.varianza(p))}
            </li>
            {typeof d.varianza(p) === 'number' && (
              <li>
                <Formula tex="\sigma_X" /> = {formatearNumero(Math.sqrt(d.varianza(p) as number), 4, true)}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

function pistaParametro(q: Parametro): string | undefined {
  if (q.entero) return q.min !== undefined ? `entero, desde ${q.min}` : 'entero'
  if (q.min === 0 && q.max === 1) return 'entre 0 y 1'
  if (q.min === 0 && q.minAbierto) return 'positivo'
  return undefined
}

function CampoNumero({
  etiqueta,
  valor,
  error,
  pista,
  onCambiar,
}: {
  etiqueta: string
  valor: string
  error?: string | null
  pista?: string
  onCambiar: (v: string) => void
}) {
  return (
    <label class={'campo-num' + (error ? ' campo-num--error' : '')}>
      <span class="campo-num__etiqueta">
        <Formula tex={etiqueta + ' ='} />
      </span>
      <input
        class="entrada campo-num__entrada"
        type="text"
        inputMode="decimal"
        value={valor}
        aria-invalid={error ? true : undefined}
        onInput={(e) => onCambiar((e.target as HTMLInputElement).value)}
      />
      {(error || pista) && <span class="campo-num__ayuda">{error ?? pista}</span>}
    </label>
  )
}

// ---------------------------------------------------------- multinomial

function CalculadoraMultinomial() {
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

  const error = !(Number.isInteger(n) && n >= 1 && n <= 500)
    ? '$n$ tiene que ser un entero entre 1 y 500.'
    : ps.some((v) => !(v > 0 && v < 1))
      ? 'Cada $p_i$ tiene que estar entre 0 y 1.'
      : !(pk > 0)
        ? `Las probabilidades tienen que sumar menos de 1, porque $p_${k}$ es lo que falta.`
        : xs.some((v) => !(Number.isInteger(v) && v >= 0))
          ? 'Cada $x_i$ tiene que ser un entero no negativo.'
          : xk < 0
            ? `Los $x_i$ suman más que $n$, y $x_${k}$ sería negativo.`
            : null
  const prob = error ? null : multinomial(n, todosP, todosX)
  const binomial = univariadaPorId.get('binomial')!
  const j = Math.min(componente, k - 1)

  return (
    <div class="calculadora">
      <fieldset class="calculadora__parametros">
        <legend class="calculadora__rotulo">Parámetros</legend>
        <CampoNumero etiqueta="n" valor={nT} onCambiar={setN} />
        <label class="campo-num">
          <span class="campo-num__etiqueta">
            <Formula tex="k =" />
          </span>
          <select class="entrada campo-num__entrada" value={k} onChange={(e) => setK(Number((e.target as HTMLSelectElement).value))}>
            {[2, 3, 4, 5, 6].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        {Array.from({ length: k - 1 }, (_, i) => (
          <CampoNumero
            key={i}
            etiqueta={`p_${i + 1}`}
            valor={psT[i] ?? ''}
            onCambiar={(v) => setPs((s) => Object.assign([...s], { [i]: v }))}
          />
        ))}
        <p class="campo-num campo-num--calculado">
          <Formula tex={`p_${k} = ${Number.isFinite(pk) ? tex(pk, 4) : '?'}`} />
        </p>
      </fieldset>

      <fieldset class="calculadora__evento">
        <legend class="calculadora__rotulo">
          Calcular <Formula tex="P(X_1 = x_1, \dots, X_k = x_k)" />
        </legend>
        <div class="calculadora__valores">
          {Array.from({ length: k - 1 }, (_, i) => (
            <CampoNumero
              key={i}
              etiqueta={`x_${i + 1}`}
              valor={xsT[i] ?? ''}
              onCambiar={(v) => setXs((s) => Object.assign([...s], { [i]: v }))}
            />
          ))}
          <p class="campo-num campo-num--calculado">
            <Formula tex={`x_${k} = ${Number.isFinite(xk) ? tex(xk, 0) : '?'}`} />
          </p>
        </div>
      </fieldset>

      {error ? (
        <p class="calculadora__error">
          <Mate>{error}</Mate>
        </p>
      ) : (
        <>
          <div class="calculadora__marginal">
            <p class="calculadora__rotulo">Marginal</p>
            <div class="calculadora__modos">
              {todosP.map((_, i) => (
                <button
                  key={i}
                  class={'chip-opcion' + (i === j ? ' chip-opcion--activa' : '')}
                  aria-pressed={i === j}
                  onClick={() => setComponente(i)}
                >
                  <Formula tex={`X_${i + 1}`} />
                </button>
              ))}
            </div>
            <p class="dato-chico">
              <Mate>{`$X_${j + 1} \\sim \\mathcal{B}(${tex(n, 0)}, ${tex(todosP[j])})$, con el valor $x_${j + 1} = ${tex(todosX[j], 0)}$ resaltado.`}</Mate>
            </p>
          </div>
          <div class="calculadora__grafico">
            <GraficoDistribucion
              d={binomial}
              p={{ n, p: todosP[j] }}
              region={[todosX[j], todosX[j]]}
              manijas={j < k - 1 ? [{ id: 'x', valor: todosX[j], rotulo: `x${j + 1}` }] : []}
              onMover={(_, v) => setXs((s) => Object.assign([...s], { [j]: String(v) }))}
            />
          </div>
          <div class="calculadora__resultado">
            <p class="resultado">
              <span class="resultado__etiqueta">
                <Formula tex={`P(\\mathbf{X} = (${todosX.map((v) => tex(v, 0)).join(', ')}))`} />
              </span>
              <span class="resultado__igual">=</span>
              <strong class="resultado__valor">{formatearNumero(prob!, 6)}</strong>
            </p>
            <ul class="calculadora__momentos">
              <li>
                <Formula tex={`E[X_${j + 1}]`} /> = {formatearNumero(n * todosP[j], 4, true)}
              </li>
              <li>
                <Formula tex={`\\operatorname{var}(X_${j + 1})`} /> ={' '}
                {formatearNumero(n * todosP[j] * (1 - todosP[j]), 4, true)}
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

// ------------------------------------------------------ normal bivariada

function CalculadoraBivariada() {
  const [t, setT] = useState<Record<string, string>>({
    mu1: '0', mu2: '0', s21: '1', s22: '1', rho: '0,5', a: '0,5', b: '1', x1: '1',
  })
  const v = Object.fromEntries(Object.entries(t).map(([k, s]) => [k, leerNumero(s)])) as Record<string, number>
  const cambiar = (k: string) => (s: string) => setT((o) => ({ ...o, [k]: s }))

  const error = [v.mu1, v.mu2, v.a, v.b, v.x1].some((x) => !Number.isFinite(x))
    ? 'Todos los valores tienen que ser números.'
    : !(v.s21 > 0 && v.s22 > 0)
      ? 'Las varianzas tienen que ser positivas.'
      : !(v.rho > -1 && v.rho < 1)
        ? 'Tiene que ser $-1 < \\rho < 1$.'
        : null
  const par: Bivariada = { mu1: v.mu1, mu2: v.mu2, s1: Math.sqrt(v.s21), s2: Math.sqrt(v.s22), rho: v.rho }
  const prob = error ? null : distribucionBivariada(v.a, v.b, par)
  const cond = error ? null : condicionalBivariada(v.x1, par)

  return (
    <div class="calculadora">
      <fieldset class="calculadora__parametros">
        <legend class="calculadora__rotulo">Parámetros</legend>
        <CampoNumero etiqueta="\mu_1" valor={t.mu1} onCambiar={cambiar('mu1')} />
        <CampoNumero etiqueta="\mu_2" valor={t.mu2} onCambiar={cambiar('mu2')} />
        <CampoNumero etiqueta="\sigma_1^2" valor={t.s21} onCambiar={cambiar('s21')} />
        <CampoNumero etiqueta="\sigma_2^2" valor={t.s22} onCambiar={cambiar('s22')} />
        <CampoNumero etiqueta="\rho" valor={t.rho} onCambiar={cambiar('rho')} />
      </fieldset>

      <fieldset class="calculadora__evento">
        <legend class="calculadora__rotulo">
          Calcular <Formula tex="P(X_1 \le a,\ X_2 \le b)" />
        </legend>
        <div class="calculadora__valores">
          <CampoNumero etiqueta="a" valor={t.a} onCambiar={cambiar('a')} />
          <CampoNumero etiqueta="b" valor={t.b} onCambiar={cambiar('b')} />
        </div>
      </fieldset>

      {error ? (
        <p class="calculadora__error">
          <Mate>{error}</Mate>
        </p>
      ) : (
        <>
          <div class="calculadora__grafico">
            <GraficoBivariado
              par={par}
              a={v.a}
              b={v.b}
              onMover={(a, b) => setT((o) => ({ ...o, a: formatearNumero(a, 3, true), b: formatearNumero(b, 3, true) }))}
            />
          </div>
          <div class="calculadora__resultado">
            <p class="resultado">
              <span class="resultado__etiqueta">
                <Formula tex={`P(X_1 \\le ${tex(v.a)},\\ X_2 \\le ${tex(v.b)})`} />
              </span>
              <span class="resultado__igual">=</span>
              <strong class="resultado__valor">{formatearNumero(prob!, 6)}</strong>
            </p>
            <div class="calculadora__condicional">
              <CampoNumero etiqueta="x_1" valor={t.x1} onCambiar={cambiar('x1')} />
              <p>
                <Mate>
                  {`$X_2 \\mid X_1 = ${tex(v.x1)} \\sim \\mathcal{N}(${tex(cond!.media)},\\ ${tex(cond!.desvio ** 2)})$, y $P(X_2 \\le ${tex(v.b)} \\mid X_1 = ${tex(v.x1)}) = ${tex(Phi((v.b - cond!.media) / cond!.desvio), 6)}$.`}
                </Mate>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
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

function Propiedades({ ficha }: { ficha: FichaDistribucion }) {
  const funcion = ficha.grupo === 'discreta' ? 'p_X(x)' : ficha.grupo === 'continua' ? 'f_X(x)' : 'Función'
  const filas: [string, string | undefined][] = [
    [funcion, ficha.funcion],
    ['Soporte', ficha.soporte],
    ['Parámetros', ficha.parametros],
    [ficha.grupo === 'multivariada' ? 'Esperanzas' : 'E[X]', ficha.esperanza],
    [ficha.grupo === 'multivariada' ? 'Varianzas' : 'var(X)', ficha.varianza],
    ['Supervivencia', ficha.supervivencia],
  ]
  return (
    <div class="dist-propiedades">
      <p class="calculadora__rotulo">Ficha</p>
      <dl class="dist-propiedades__lista">
        {filas
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} class="dist-propiedades__fila">
              <dt>{k === funcion && ficha.grupo !== 'multivariada' ? <Formula tex={k} /> : k}</dt>
              <dd>
                <Formula tex={v!} />
              </dd>
            </div>
          ))}
        {ficha.equivalencias?.length ? (
          <div class="dist-propiedades__fila">
            <dt>Equivalencias</dt>
            <dd>
              {ficha.equivalencias.map((e) => (
                <span key={e} class="dist-propiedades__equivalencia">
                  <Formula tex={e} />
                </span>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
      {ficha.nota && (
        <p class="dato-chico">
          <Mate>{ficha.nota}</Mate>
        </p>
      )}
    </div>
  )
}
