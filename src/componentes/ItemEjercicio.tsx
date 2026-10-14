/**
 * Un ítem de un ejercicio: la unidad validable (PLAN.md §3).
 *
 * La respuesta se escribe en una frase: lo que se calcula, el campo y el
 * botón de comprobar, "P(B_1) = [ 1/3 ] [Comprobar]", centrada y con aire
 * arriba y abajo. Al acertar, el botón se va y en su lugar aparece el valor
 * decimal de lo escrito ("≈ 0,3333"), y arriba a la derecha, "Correcto".
 * Cuando hay varios campos (checkpoints), van apilados con sus signos igual
 * alineados, y el botón de comprobar pasa a la fila de abajo, a la derecha de
 * las ayudas (fórmulas, pistas graduadas, ver respuesta). Lo mismo con la
 * opción múltiple.
 *
 * Los tags no van acá sino debajo del enunciado (ver TarjetaEjercicio), y
 * aparecen recién cuando el ítem se resuelve o se revela: recuperación activa
 * antes que lectura.
 *
 * El estado vive en un solo objeto y se persiste completo en cada cambio, así
 * recargar la página no te hace perder el lugar. Lo único que no se guarda es
 * si el panel de fórmulas está abierto, que no vale la pena, y la celebración
 * de un acierto, que es sólo del momento en que ocurre.
 */
import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { formulasDeItem } from '../datos/contenido'
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
  // El orden se fija al montar el ítem, para que no cambie mientras se
  // responde. La opción elegida se guarda por id, así que no depende de él.
  const [opciones] = useState(() =>
    item.respuesta.tipo === 'opcion' ? barajar(item.respuesta.opciones) : [],
  )

  useEffect(() => {
    if (!celebrando) return
    const t = setTimeout(() => setCelebrando(false), CELEBRACION_MS)
    return () => clearTimeout(t)
  }, [celebrando])

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

  const botonComprobar = (clase = '') => (
    <button class={'boton boton--acento boton--icono' + clase} onClick={enviar}>
      <IconoComprobar />
      Comprobar
    </button>
  )

  // --- la fila de abajo: las ayudas y, si no va en la frase, comprobar ---
  const botones: { clave: string; nodo: ComponentChildren }[] = []
  if (puedeMostrarFormulas) {
    botones.push({
      clave: 'formulas',
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
  if (item.pistas.length > 0 && !resuelto && !modoExamen) {
    botones.push({
      clave: 'pistas',
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
  if (!resuelto && !modoExamen) {
    botones.push({
      clave: 'ver',
      nodo: (
        <button class="boton boton--icono" onClick={revelar}>
          <IconoVer />
          Ver respuesta
        </button>
      ),
    })
  }
  // Sin esto, el ítem quedaría congelado para siempre una vez resuelto. El
  // intento ya contó; rehacerlo no vuelve a contar el mismo día.
  if (resuelto && !modoExamen) {
    botones.push({
      clave: 'reintentar',
      nodo: (
        <button class="boton boton--icono" onClick={reintentar}>
          <IconoReintentar />
          Reintentar
        </button>
      ),
    })
  }
  const comprobarAbajo = !unCampo && !resuelto
  // Con comprobar abajo son cuatro columnas fijas y comprobar va en la
  // última; si no, los botones que haya se reparten la fila.
  const columnas = comprobarAbajo ? 4 : botones.length

  const rotulo = unCampo ? r.rotulo : undefined
  const claseCampo = (estado: 'ok' | 'mal' | null) =>
    'entrada campo-respuesta' + (estado ? ' campo-respuesta--' + estado : '')

  return (
    <li class={'item item--' + est.estado + (celebrando ? ' item--celebrando' : '')}>
      <div class="item__cabeza">
        <span class="item__id">({item.id})</span>
        <div class="item__pregunta">
          <TextoMarcado texto={item.pregunta} resaltado={resaltado} mostrarMarcas={mostrarMarcas} />
        </div>
        {correcto && (
          <span class={'logro' + (celebrando ? ' logro--nuevo' : '')} role="status">
            <IconoComprobar />
            Correcto
            {celebrando && (
              <span class="logro__chispas" aria-hidden="true">
                {Array.from({ length: 8 }, (_, i) => (
                  <span key={i} style={{ '--i': i }} />
                ))}
              </span>
            )}
          </span>
        )}
      </div>

      {/* --- entrada según el tipo de respuesta --- */}
      {r.tipo === 'opcion' ? (
        <ul class="opciones">
          {opciones.map((o) => (
            <li key={o.id}>
              <label class={'opcion' + (est.opcion === o.id ? ' opcion--elegida' : '')}>
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
            class={claseCampo(correcto ? 'ok' : est.estado === 'incorrecto' ? 'mal' : null) + (r.tipo === 'expresion' ? ' campo-respuesta--expresion' : '')}
            style={{ '--largo': (est.entrada ?? '').length }}
            type="text"
            autoComplete="off"
            spellcheck={false}
            value={est.entrada ?? ''}
            disabled={resuelto}
            placeholder={r.tipo === 'expresion' ? 'en función de ' + Object.keys(r.vars).join(', ') : '?'}
            data-tip={r.tipo === 'numerica' && !resuelto ? 'Acepta fracciones y cuentas: 47/120, 1 - (5/6)^4' : undefined}
            onInput={(e) => actualizar({ entrada: (e.target as HTMLInputElement).value })}
            onKeyDown={(e) => e.key === 'Enter' && enviar()}
          />
          {r.tipo === 'numerica' && r.sufijo && <span class="sufijo">{r.sufijo}</span>}
          {/* El botón y el valor ocupan la misma celda: al acertar, el botón
              se va (sigue un momento, saliendo) y el valor entra en su lugar,
              sin que el resto de la frase se mueva. */}
          <div class="fila-entrada__accion">
            {!resuelto && botonComprobar()}
            {correcto && celebrando && (
              <button
                class="boton boton--acento boton--icono fila-entrada__saliente"
                aria-hidden="true"
                tabIndex={-1}
              >
                <IconoComprobar />
                Comprobar
              </button>
            )}
            {correcto && (
              <span class={'valor-aprox' + (celebrando ? ' valor-aprox--nuevo' : '')}>
                {aproximacion(est.entrada ?? '') ?? '✓'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* --- mensajes, entre la respuesta y los botones --- */}
      {/* Los de error llevan la cantidad de envíos como key: cada error nuevo
          los vuelve a montar y la sacudida se repite. */}
      {(est.estado === 'incorrecto' || mensaje) && (
        <div class="item__mensajes">
          {est.estado === 'incorrecto' && !mensaje && !errorTipico && (
            <p key={est.envios} class="feedback feedback--mal">
              ✗ La respuesta no es correcta. Revisala y probá de nuevo.
            </p>
          )}
          {errorTipico && (
            <p key={est.envios} class="feedback feedback--mal">
              ✗ <Mate>{errorTipico}</Mate>
            </p>
          )}
          {mensaje && <p class="feedback feedback--aviso">{mensaje}</p>}
        </div>
      )}

      {/* --- la fila de botones --- */}
      {(botones.length > 0 || comprobarAbajo) && (
        <div class="botonera" style={{ '--columnas': columnas }}>
          {botones.map((b) => (
            <span key={b.clave} class="botonera__lugar">
              {b.nodo}
            </span>
          ))}
          {comprobarAbajo && <span class="botonera__lugar botonera__comprobar">{botonComprobar()}</span>}
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

      {est.pistasAbiertas > 0 && (
        <ol class="pistas">
          {item.pistas.slice(0, est.pistasAbiertas).map((p, i) => (
            <li key={i}>
              <Mate>{p}</Mate>
            </li>
          ))}
        </ol>
      )}

      {est.estado === 'revelado' && <Respuesta item={item} />}
    </li>
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
