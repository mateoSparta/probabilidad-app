/**
 * Un ítem de un ejercicio: la unidad validable (PLAN.md §3).
 *
 * La respuesta se escribe en una frase: lo que se calcula, el campo y el
 * botón de comprobar, "P(B_1) = [ 1/3 ] [Comprobar]", centrada y con el mismo
 * aire arriba que abajo. El aire de abajo es el lugar de los avisos ("✓
 * Correcto.", "✗ La respuesta no es correcta…"), así que un aviso aparece
 * sin correr nada. Al acertar, el botón se va y en su lugar aparece el valor
 * decimal de lo escrito ("≈ 0,3333"). Cuando hay varios campos
 * (checkpoints), van apilados con sus signos igual alineados, y el botón de
 * comprobar pasa a la fila de abajo, a la derecha de las ayudas (fórmulas,
 * pistas graduadas, ver respuesta). Lo mismo con la opción múltiple.
 *
 * Al resolver el ítem, la fila de abajo se cierra como un sándwich: pistas (y
 * comprobar, si estaba ahí) se van, fórmulas y ver respuesta se ensanchan, y
 * ver respuesta pasa a ser reintentar. Reintentar la vuelve a abrir, y lo que
 * deja de estar (el valor, el aviso, las pistas, la respuesta revelada) sale
 * animado en lugar de desaparecer.
 *
 * Los tags no van acá sino debajo del enunciado (ver TarjetaEjercicio), y
 * aparecen recién cuando el ítem se resuelve o se revela: recuperación activa
 * antes que lectura.
 *
 * El estado vive en un solo objeto y se persiste completo en cada cambio, así
 * recargar la página no te hace perder el lugar. Lo único que no se guarda es
 * si el panel de fórmulas está abierto, que no vale la pena, y las
 * animaciones de acertar y de reintentar, que son sólo del momento.
 */
import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { formulasDeItem } from '../datos/contenido'
import { ayudaCampoNumerico } from '../dominio/ejemplos'
import { formatearNumero } from '../dominio/formato'
import {
  evaluarCheckpoints,
  evaluarEscalar,
  evaluarExpresion,
  evaluarNumerica,
  evaluarOpcion,
} from '../dominio/respuesta'
import { ITEM_NUEVO, type SesionItem } from '../dominio/sesion'
import type { Intento, Item } from '../dominio/tipos'
import {
  IconoComprobar,
  IconoFormulas,
  IconoPista,
  IconoReintentar,
  IconoVer,
} from './Iconos'
import { Formula, Mate, TextoMarcado } from './Mate'

/** Un intento es limpio si acierta sin ver la respuesta: en el primer envío
 *  para `opcion` y en hasta 2 envíos para el resto (PLAN.md §5). */
function esLimpio(item: Item, envios: number, revelo: boolean): boolean {
  if (revelo) return false
  return item.respuesta.tipo === 'opcion' ? envios <= 1 : envios <= 2
}

/**
 * Las opciones en orden al azar (Fisher-Yates). En el contenido la correcta
 * va primera, y mostrarlas así enseñaría la posición en lugar del tema.
 */
function barajar<T>(xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * El valor decimal de lo que se escribió, para mostrar al acertar, con cuatro
 * decimales a lo sumo: "≈ 0,3333", o "= 0,5" y "= 35" cuando ese decimal es
 * exacto. Null si no es un número (una expresión con variables).
 */
function aproximacion(texto: string): string | null {
  const v = evaluarEscalar(texto)
  if (v === null || !Number.isFinite(v)) return null
  const exacto = Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-9
  return `${exacto ? '=' : '≈'} ${formatearNumero(v, 4, true)}`
}

/** Lo que dura la celebración de un acierto; tiene que cubrir las animaciones del CSS. */
const CELEBRACION_MS = 1400
/** Lo que dura la salida de lo que se va al reintentar; ídem. */
const REINICIO_MS = 700

/**
 * El rótulo de un campo de un checkpoint, con su signo igual. Si es una
 * fórmula sola (`$f_Y(2)$`), el igual va dentro de la fórmula; si tiene
 * texto ("Pendiente"), va después.
 */
function RotuloCampo({ texto }: { texto: string }) {
  const sola = texto.trim().match(/^\$([^$]+)\$$/)
  if (sola) return <Formula tex={sola[1] + ' ='} />
  return (
    <>
      <Mate>{texto}</Mate> <Formula tex="=" />
    </>
  )
}

/** Lo que se veía del ítem antes de reintentar, para que salga animado. */
type Anterior = {
  est: SesionItem
  detalleCp: boolean[] | null
  mensaje: string | null
  errorTipico: string | null
}

/**
 * Los avisos de debajo de la respuesta. Los de error llevan la cantidad de
 * envíos como key: cada error nuevo los vuelve a montar y la sacudida se
 * repite. "Correcto" entra con su propia animación sólo en el momento de
 * acertar (`nuevo`).
 */
function Avisos({
  estado,
  envios,
  mensaje,
  errorTipico,
  nuevo = false,
}: {
  estado: SesionItem['estado']
  envios: number
  mensaje: string | null
  errorTipico: string | null
  nuevo?: boolean
}) {
  if (mensaje) return <p class="feedback feedback--aviso">{mensaje}</p>
  if (estado === 'correcto') {
    return (
      <p key="ok" class={'feedback feedback--ok' + (nuevo ? ' feedback--nuevo' : '')}>
        <span class="feedback__tilde">✓</span> Correcto.
      </p>
    )
  }
  if (estado !== 'incorrecto') return null
  return (
    <p key={envios} class="feedback feedback--mal">
      ✗ {errorTipico ? <Mate>{errorTipico}</Mate> : 'La respuesta no es correcta. Revisala y probá de nuevo.'}
    </p>
  )
}

/** Lo que se pliega al reintentar (las pistas, la respuesta revelada). */
function Plegandose({ children }: { children: ComponentChildren }) {
  return (
    <div class="plegandose" aria-hidden="true">
      <div>{children}</div>
    </div>
  )
}

type Props = {
  item: Item
  /** Clave global del ítem (`g1-04:b`): es con la que se registra el intento. */
  clave: string
  /** Estado guardado de la sesión, para retomar donde quedaste. */
  inicial?: SesionItem
  onGuardar?: (item: SesionItem) => void
  /** Borra el estado del ítem para rehacerlo. El historial no se toca. */
  onReiniciar?: () => void
  /**
   * En el simulacro no hay pistas ni ver respuesta (PLAN.md §6). Al entregar
   * se apaga y las ayudas vuelven a estar disponibles.
   */
  modoExamen?: boolean
  /** En el simulacro, el panel de fórmulas depende de un toggle. */
  permitirFormulas?: boolean
  /** En el simulacro, un ítem sin rótulo lleva "Respuesta:", como en una hoja de examen. */
  enSimulacro?: boolean
  /** Skill resaltado desde los tags, por si la pregunta tiene fragmentos. */
  resaltado?: string | null
  mostrarMarcas?: boolean
  onIntento?: (intento: Intento, limpio: boolean) => void
}

export function ItemEjercicio({
  item,
  clave,
  inicial,
  onGuardar,
  onReiniciar,
  modoExamen,
  permitirFormulas = true,
  enSimulacro = false,
  resaltado,
  mostrarMarcas,
  onIntento,
}: Props) {
  const [est, setEst] = useState<SesionItem>(inicial ?? ITEM_NUEVO)
  // Efímero: no tiene sentido recordar si el panel estaba abierto.
  const [formulasAbiertas, setFormulasAbiertas] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errorTipico, setErrorTipico] = useState<string | null>(null)
  const [detalleCp, setDetalleCp] = useState<boolean[] | null>(null)
  // Sólo justo después de acertar: un ítem que ya venía resuelto no festeja.
  const [celebrando, setCelebrando] = useState(false)
  // Sólo justo después de reintentar: lo que había, mientras sale.
  const [anterior, setAnterior] = useState<Anterior | null>(null)
  // El orden se fija al montar el ítem, para que no cambie mientras se
  // responde. La opción elegida se guarda por id, así que no depende de él.
  const [opciones] = useState(() =>
    item.respuesta.tipo === 'opcion' ? barajar(item.respuesta.opciones) : [],
  )
  // Los ejemplos del globo de los campos, al azar pero fijos en cada ítem.
  const [ayuda] = useState(() => ayudaCampoNumerico())

  useEffect(() => {
    if (!celebrando) return
    const t = setTimeout(() => setCelebrando(false), CELEBRACION_MS)
    return () => clearTimeout(t)
  }, [celebrando])

  useEffect(() => {
    if (!anterior) return
    const t = setTimeout(() => setAnterior(null), REINICIO_MS)
    return () => clearTimeout(t)
  }, [anterior])

  /** Mezcla el cambio en el estado y lo persiste de una. */
  function actualizar(parcial: Partial<SesionItem>): void {
    const siguiente = { ...est, ...parcial }
    setEst(siguiente)
    onGuardar?.(siguiente)
  }

  const resuelto = est.estado === 'correcto' || est.estado === 'revelado'
  const correcto = est.estado === 'correcto'
  const r = item.respuesta

  function registrar(acierto: boolean, revelo: boolean, nEnvios: number, elegidos: string[]) {
    const intento: Intento = {
      item: clave,
      ts: new Date().toISOString(),
      envios: nEnvios,
      correcto: acierto,
      pistas: est.pistasAbiertas,
      revelo,
      distractores: elegidos.length ? elegidos : undefined,
    }
    onIntento?.(intento, acierto && esLimpio(item, nEnvios, revelo))
  }

  function acertar(n: number, distractores: string[]): void {
    actualizar({ envios: n, estado: 'correcto' })
    registrar(true, false, n, distractores)
    setCelebrando(true)
  }

  function enviar() {
    const n = est.envios + 1
    setMensaje(null)
    setErrorTipico(null)
    setAnterior(null)
    const distractores = est.distractores ?? []

    if (r.tipo === 'opcion') {
      if (!est.opcion) {
        setMensaje('Elegí una opción.')
        return
      }
      const v = evaluarOpcion(est.opcion, r)
      if (v.ok) {
        acertar(n, distractores)
      } else {
        const elegidos = distractores.includes(est.opcion)
          ? distractores
          : [...distractores, est.opcion]
        actualizar({ envios: n, estado: 'incorrecto', distractores: elegidos })
        if (v.error_tipico) setErrorTipico(v.error_tipico)
      }
      return
    }

    if (r.tipo === 'checkpoints') {
      const v = evaluarCheckpoints(est.celdas ?? [], r)
      setDetalleCp(v.detalle.map((d) => d.ok))
      if (v.ok) acertar(n, distractores)
      else actualizar({ envios: n, estado: 'incorrecto' })
      return
    }

    const entrada = est.entrada ?? ''
    const v = r.tipo === 'numerica' ? evaluarNumerica(entrada, r) : evaluarExpresion(entrada, r)
    if (v.ok) {
      acertar(n, distractores)
      return
    }
    actualizar({ envios: n, estado: 'incorrecto' })
    if (v.motivo === 'vacio') setMensaje('Escribí una respuesta.')
    else if (v.motivo === 'no_parsea') setMensaje(v.detalle ?? 'No se pudo interpretar la respuesta.')
  }

  function revelar() {
    actualizar({ estado: 'revelado' })
    registrar(false, true, est.envios, est.distractores ?? [])
  }

  function reintentar() {
    setAnterior({ est, detalleCp, mensaje, errorTipico })
    setEst(ITEM_NUEVO)
    setMensaje(null)
    setErrorTipico(null)
    setDetalleCp(null)
    setCelebrando(false)
    onReiniciar?.()
  }

  const formulas = formulasDeItem(item.skills)
  const puedeMostrarFormulas = formulas.length > 0 && permitirFormulas
  // El botón de comprobar va en la frase cuando hay un solo campo; si no
  // (varios campos, opción múltiple), en la fila de abajo, a la derecha.
  const unCampo = r.tipo === 'numerica' || r.tipo === 'expresion'
  const antes = anterior?.est

  const botonComprobar = (clase = '') => (
    <button class={'boton boton--acento boton--icono' + clase} onClick={enviar}>
      <IconoComprobar />
      Comprobar
    </button>
  )

  // --- la fila de abajo ---
  // Cada botón tiene su lugar fijo. Los que no corresponden al estado se
  // pliegan (el CSS anima el ancho) en lugar de desaparecer: así, al
  // resolver, pistas se cierra entre fórmulas y ver respuesta.
  const lugares: { clave: string; visible: boolean; clase?: string; nodo: ComponentChildren }[] = []
  if (puedeMostrarFormulas) {
    lugares.push({
      clave: 'formulas',
      visible: true,
      nodo: (
        <button
          class={'boton boton--icono' + (formulasAbiertas ? ' boton--activo' : '')}
          aria-expanded={formulasAbiertas}
          onClick={() => setFormulasAbiertas((v) => !v)}
        >
          <IconoFormulas />
          Fórmulas
        </button>
      ),
    })
  }
  if (item.pistas.length > 0 && !modoExamen) {
    lugares.push({
      clave: 'pistas',
      visible: !resuelto,
      nodo: (
        <button
          class="boton boton--icono"
          disabled={est.pistasAbiertas >= item.pistas.length}
          onClick={() =>
            actualizar({ pistasAbiertas: Math.min(est.pistasAbiertas + 1, item.pistas.length) })
          }
        >
          <IconoPista />
          Pistas ({est.pistasAbiertas}/{item.pistas.length})
        </button>
      ),
    })
  }
  // Ver respuesta y reintentar son el mismo botón, que cambia de cara. Sin
  // reintentar, el ítem quedaría congelado para siempre una vez resuelto. El
  // intento ya contó; rehacerlo no vuelve a contar el mismo día.
  if (!modoExamen) {
    lugares.push({
      clave: 'ver',
      visible: true,
      nodo: (
        <button class="boton boton--icono boton--doble" onClick={resuelto ? reintentar : revelar}>
          <span class={'boton__cara' + (resuelto ? ' boton__cara--arriba' : '')} aria-hidden={resuelto || undefined}>
            <IconoVer />
            Ver respuesta
          </span>
          <span class={'boton__cara' + (resuelto ? '' : ' boton__cara--abajo')} aria-hidden={!resuelto || undefined}>
            <IconoReintentar />
            Reintentar
          </span>
        </button>
      ),
    })
  }
  if (!unCampo) {
    lugares.push({ clave: 'comprobar', visible: !resuelto, clase: ' botonera__comprobar', nodo: botonComprobar() })
  }
  // Con comprobar en la fila y menos de cuatro botones (en el simulacro, por
  // ejemplo), cada uno ocupa un cuarto y comprobar va contra la derecha.
  const enCuartos = !unCampo && !resuelto && lugares.length < 4

  const rotulo = unCampo ? r.rotulo : undefined
  const claseCampo = (estado: 'ok' | 'mal' | null) =>
    'entrada campo-respuesta' + (estado ? ' campo-respuesta--' + estado : '')

  return (
    <li
      class={
        'item item--' +
        est.estado +
        (celebrando ? ' item--celebrando' : '') +
        (anterior ? ' item--reiniciando' : '')
      }
    >
      <div class="item__cabeza">
        <span class="item__id">({item.id})</span>
        <div class="item__pregunta">
          <TextoMarcado texto={item.pregunta} resaltado={resaltado} mostrarMarcas={mostrarMarcas} />
        </div>
      </div>

      {/* --- entrada según el tipo de respuesta --- */}
      {r.tipo === 'opcion' ? (
        <ul class="opciones">
          {opciones.map((o) => (
            <li key={o.id}>
              <label
                class={
                  'opcion' +
                  (resuelto ? ' opcion--fija' : est.opcion === o.id ? ' opcion--elegida' : '')
                }
              >
                <input
                  type="radio"
                  name={'op-' + clave}
                  value={o.id}
                  checked={est.opcion === o.id}
                  disabled={resuelto}
                  onChange={() => actualizar({ opcion: o.id })}
                />
                <Mate>{o.texto}</Mate>
              </label>
            </li>
          ))}
        </ul>
      ) : r.tipo === 'checkpoints' ? (
        // Una grilla de tres columnas (rótulo con su igual, campo y
        // resultado) en la que cada fila es una subgrilla: los rótulos se
        // alinean a la derecha, así los signos igual quedan en columna, y los
        // campos también. El conjunto va centrado.
        <ul class="checkpoints">
          {r.checkpoints.map((c, i) => {
            const ok = correcto || detalleCp?.[i] === true
            const mal = !correcto && detalleCp?.[i] === false
            const valor = ok ? aproximacion(est.celdas?.[i] ?? '') : null
            // Lo que había en la tercera columna antes de reintentar.
            const okAntes = !!antes && (antes.estado === 'correcto' || anterior?.detalleCp?.[i] === true)
            const malAntes = !!antes && antes.estado !== 'correcto' && anterior?.detalleCp?.[i] === false
            const valorAntes = okAntes ? aproximacion(antes?.celdas?.[i] ?? '') : null
            return (
              <li key={i} class="checkpoint">
                <label class="checkpoint__rotulo" for={`${clave}-${i}`}>
                  <RotuloCampo texto={c.pregunta} />
                </label>
                <input
                  id={`${clave}-${i}`}
                  class={claseCampo(ok ? 'ok' : mal ? 'mal' : null)}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellcheck={false}
                  value={est.celdas?.[i] ?? ''}
                  disabled={resuelto}
                  placeholder="?"
                  data-tip={resuelto ? undefined : ayuda}
                  onInput={(e) => {
                    const celdas = [...(est.celdas ?? [])]
                    celdas[i] = (e.target as HTMLInputElement).value
                    actualizar({ celdas })
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && enviar()}
                />
                <span class="checkpoint__resultado">
                  {ok && valor && (
                    <span class={'valor-aprox' + (celebrando ? ' valor-aprox--nuevo' : '')} style={{ '--i': i }}>
                      {valor}
                    </span>
                  )}
                  {mal && <span class="marca marca--mal" aria-label="incorrecto">✗</span>}
                  {valorAntes && (
                    <span class="valor-aprox saliente" aria-hidden="true">
                      {valorAntes}
                    </span>
                  )}
                  {malAntes && (
                    <span class="marca marca--mal saliente" aria-hidden="true">
                      ✗
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <div class="fila-entrada">
          {rotulo ? (
            <label class="fila-entrada__rotulo" for={`${clave}-respuesta`}>
              <Formula tex={rotulo + ' ='} />
            </label>
          ) : (
            enSimulacro && (
              <label class="fila-entrada__etiqueta" for={`${clave}-respuesta`}>
                Respuesta:
              </label>
            )
          )}
          <input
            id={`${clave}-respuesta`}
            class={
              claseCampo(correcto ? 'ok' : est.estado === 'incorrecto' ? 'mal' : null) +
              (r.tipo === 'expresion' ? ' campo-respuesta--expresion' : '')
            }
            type="text"
            autoComplete="off"
            spellcheck={false}
            value={est.entrada ?? ''}
            disabled={resuelto}
            placeholder={r.tipo === 'expresion' ? 'en función de ' + Object.keys(r.vars).join(', ') : '?'}
            data-tip={r.tipo === 'numerica' && !resuelto ? ayuda : undefined}
            onInput={(e) => actualizar({ entrada: (e.target as HTMLInputElement).value })}
            onKeyDown={(e) => e.key === 'Enter' && enviar()}
          />
          {r.tipo === 'numerica' && r.sufijo && <span class="sufijo">{r.sufijo}</span>}
          {/* El botón y el valor ocupan la misma celda: al acertar, el botón
              se va (sigue un momento, saliendo) y el valor entra en su lugar,
              sin que el resto de la frase se mueva. Al reintentar, al revés. */}
          <div class="fila-entrada__accion">
            {!resuelto && botonComprobar(anterior ? ' entrante' : '')}
            {correcto && celebrando && (
              <button class="boton boton--acento boton--icono saliente" aria-hidden="true" tabIndex={-1}>
                <IconoComprobar />
                Comprobar
              </button>
            )}
            {correcto && (
              <span class={'valor-aprox' + (celebrando ? ' valor-aprox--nuevo' : '')}>
                {aproximacion(est.entrada ?? '') ?? '✓'}
              </span>
            )}
            {antes?.estado === 'correcto' && (
              <span class="valor-aprox saliente" aria-hidden="true">
                {aproximacion(antes.entrada ?? '') ?? '✓'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* --- los avisos, en el aire de debajo de la respuesta --- */}
      <div class="item__mensajes" aria-live="polite">
        <Avisos
          estado={est.estado}
          envios={est.envios}
          mensaje={mensaje}
          errorTipico={errorTipico}
          nuevo={celebrando}
        />
        {anterior && (
          <div class="saliente" aria-hidden="true">
            <Avisos
              estado={anterior.est.estado}
              envios={anterior.est.envios}
              mensaje={anterior.mensaje}
              errorTipico={anterior.errorTipico}
            />
          </div>
        )}
      </div>

      {/* --- la fila de botones --- */}
      {lugares.length > 0 && (
        <div class={'botonera' + (enCuartos ? ' botonera--cuartos' : '')}>
          {lugares.map((l) => (
            <span
              key={l.clave}
              class={'botonera__lugar' + (l.clase ?? '') + (l.visible ? '' : ' botonera__lugar--fuera')}
              inert={!l.visible}
            >
              {l.nodo}
            </span>
          ))}
        </div>
      )}

      {/* --- ayudas --- */}
      {formulasAbiertas && (
        <div class="panel panel--formulas">
          {formulas.map(({ skill, formulas: fs }) => (
            <div key={skill.id} class="panel__grupo">
              <h4>{skill.nombre}</h4>
              {fs.map((f, i) => (
                <div key={i} class="formula">
                  <Formula tex={f} display />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {est.pistasAbiertas > 0 && <Pistas pistas={item.pistas} abiertas={est.pistasAbiertas} />}
      {antes && antes.pistasAbiertas > 0 && (
        <Plegandose>
          <Pistas pistas={item.pistas} abiertas={antes.pistasAbiertas} />
        </Plegandose>
      )}

      {est.estado === 'revelado' && <Respuesta item={item} />}
      {antes?.estado === 'revelado' && (
        <Plegandose>
          <Respuesta item={item} />
        </Plegandose>
      )}
    </li>
  )
}

/** Las pistas abiertas hasta ahora, en orden. */
function Pistas({ pistas, abiertas }: { pistas: readonly string[]; abiertas: number }) {
  return (
    <ol class="pistas">
      {pistas.slice(0, abiertas).map((p, i) => (
        <li key={i}>
          <Mate>{p}</Mate>
        </li>
      ))}
    </ol>
  )
}

/**
 * El valor exacto de una respuesta, con su aproximación decimal cuando no es
 * un número escrito en decimal: `1/2 + erf(2)/2 ≈ 0,9772`. La forma exacta
 * sola no le sirve al alumno para comparar con lo que obtuvo.
 */
function Valor({ valor }: { valor: string }) {
  const n = /^-?\d+(\.\d+)?$/.test(valor.trim()) ? null : evaluarEscalar(valor)
  return (
    <>
      <code>{valor}</code>
      {n !== null && ` ≈ ${Number(n.toPrecision(4)).toString().replace('.', ',')}`}
    </>
  )
}

/** El resultado final, sin pasos. Sólo cuando el alumno lo pidió. */
function Respuesta({ item }: { item: Item }) {
  const r = item.respuesta
  if (r.tipo === 'numerica') {
    return (
      <p class="respuesta">
        Respuesta: <Valor valor={String(r.valor)} />
      </p>
    )
  }
  if (r.tipo === 'expresion') {
    return (
      <p class="respuesta">
        Respuesta: <code>{r.valor}</code>
      </p>
    )
  }
  if (r.tipo === 'opcion') {
    const ok = r.opciones.find((o) => o.correcta)
    return (
      <p class="respuesta">
        Respuesta: <Mate>{ok?.texto ?? '—'}</Mate>
      </p>
    )
  }
  return (
    <ul class="respuesta respuesta--lista">
      {r.checkpoints.map((c, i) => (
        <li key={i}>
          <Mate>{c.pregunta}</Mate> <Valor valor={String(c.valor)} />
        </li>
      ))}
    </ul>
  )
}
