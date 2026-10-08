/**
 * Un ítem de un ejercicio: la unidad validable (PLAN.md §3).
 *
 * Cada ítem tiene su input, sus ayudas (fórmulas, pistas graduadas, ver
 * respuesta) y su feedback en línea. Los tags están ocultos hasta que se
 * resuelve o se revela: recuperación activa antes que lectura.
 */
import { useState } from 'preact/hooks'

import { formulasDeItem, skillPorId } from '../datos/contenido'
import {
  evaluarCheckpoints,
  evaluarExpresion,
  evaluarNumerica,
  evaluarOpcion,
} from '../dominio/respuesta'
import type { Intento, Item } from '../dominio/tipos'
import { Formula, Mate } from './Mate'

/** Un intento es limpio si acierta sin ver la respuesta: en el primer envío
 *  para `opcion` y en hasta 2 envíos para el resto (PLAN.md §5). */
function esLimpio(item: Item, envios: number, revelo: boolean): boolean {
  if (revelo) return false
  return item.respuesta.tipo === 'opcion' ? envios <= 1 : envios <= 2
}

type Estado = 'pendiente' | 'correcto' | 'incorrecto' | 'revelado'

type Props = {
  item: Item
  /** Clave global del ítem (`g1-04:b`): es con la que se registra el intento. */
  clave: string
  /**
   * En el simulacro no hay pistas ni ver respuesta (PLAN.md §6). Al entregar
   * se apaga y las ayudas vuelven a estar disponibles.
   */
  modoExamen?: boolean
  /** En el simulacro, el panel de fórmulas depende de un toggle. */
  permitirFormulas?: boolean
  onResaltar: (skill: string | null) => void
  onIntento?: (intento: Intento, limpio: boolean) => void
}

export function ItemEjercicio({
  item,
  clave,
  modoExamen,
  permitirFormulas = true,
  onResaltar,
  onIntento,
}: Props) {
  const [estado, setEstado] = useState<Estado>('pendiente')
  const [envios, setEnvios] = useState(0)
  const [entrada, setEntrada] = useState('')
  const [celdas, setCeldas] = useState<string[]>([])
  const [opcion, setOpcion] = useState<string | null>(null)
  const [errorTipico, setErrorTipico] = useState<string | null>(null)
  const [detalleCp, setDetalleCp] = useState<boolean[] | null>(null)
  const [pistasAbiertas, setPistasAbiertas] = useState(0)
  const [formulasAbiertas, setFormulasAbiertas] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  /** Distractores elegidos a lo largo del intento: alimenta los puntos ciegos. */
  const [distractores, setDistractores] = useState<string[]>([])

  const resuelto = estado === 'correcto' || estado === 'revelado'
  const r = item.respuesta

  function registrar(correcto: boolean, revelo: boolean, nEnvios: number, elegidos: string[]) {
    const intento: Intento = {
      item: clave,
      ts: new Date().toISOString(),
      envios: nEnvios,
      correcto,
      pistas: pistasAbiertas,
      revelo,
      distractores: elegidos.length ? elegidos : undefined,
    }
    onIntento?.(intento, correcto && esLimpio(item, nEnvios, revelo))
  }

  function enviar() {
    const n = envios + 1
    setEnvios(n)
    setMensaje(null)
    setErrorTipico(null)

    if (r.tipo === 'opcion') {
      if (!opcion) {
        setMensaje('Elegí una opción.')
        return
      }
      const v = evaluarOpcion(opcion, r)
      if (v.ok) {
        setEstado('correcto')
        registrar(true, false, n, distractores)
      } else {
        setEstado('incorrecto')
        const elegidos = distractores.includes(opcion) ? distractores : [...distractores, opcion]
        setDistractores(elegidos)
        if (v.error_tipico) setErrorTipico(v.error_tipico)
      }
      return
    }

    if (r.tipo === 'checkpoints') {
      const v = evaluarCheckpoints(celdas, r)
      setDetalleCp(v.detalle.map((d) => d.ok))
      if (v.ok) {
        setEstado('correcto')
        registrar(true, false, n, distractores)
      } else {
        setEstado('incorrecto')
      }
      return
    }

    const v = r.tipo === 'numerica' ? evaluarNumerica(entrada, r) : evaluarExpresion(entrada, r)
    if (v.ok) {
      setEstado('correcto')
      registrar(true, false, n, distractores)
      return
    }
    setEstado('incorrecto')
    if (v.motivo === 'vacio') setMensaje('Escribí una respuesta.')
    else if (v.motivo === 'no_parsea') setMensaje(v.detalle ?? 'No pude interpretar eso.')
  }

  function revelar() {
    setEstado('revelado')
    registrar(false, true, envios, distractores)
  }

  const formulas = formulasDeItem(item.skills)
  const puedeMostrarFormulas = formulas.length > 0 && permitirFormulas

  return (
    <li class={'item item--' + estado}>
      <div class="item__cabeza">
        <span class="item__id">({item.id})</span>
        <div class="item__pregunta">
          <Mate>{item.pregunta}</Mate>
        </div>
      </div>

      {/* --- entrada según el tipo de respuesta --- */}
      {r.tipo === 'opcion' ? (
        <ul class="opciones">
          {r.opciones.map((o) => (
            <li key={o.id}>
              <label class={'opcion' + (opcion === o.id ? ' opcion--elegida' : '')}>
                <input
                  type="radio"
                  name={'op-' + item.id}
                  value={o.id}
                  checked={opcion === o.id}
                  disabled={resuelto}
                  onChange={() => setOpcion(o.id)}
                />
                <Mate>{o.texto}</Mate>
              </label>
            </li>
          ))}
        </ul>
      ) : r.tipo === 'checkpoints' ? (
        <ul class="checkpoints">
          {r.checkpoints.map((c, i) => (
            <li key={i} class="checkpoint">
              <span class="checkpoint__pregunta">
                <Mate>{c.pregunta}</Mate>
              </span>
              <input
                class="entrada entrada--corta"
                type="text"
                inputMode="text"
                value={celdas[i] ?? ''}
                disabled={resuelto}
                placeholder="?"
                onInput={(e) => {
                  const v = [...celdas]
                  v[i] = (e.target as HTMLInputElement).value
                  setCeldas(v)
                }}
                onKeyDown={(e) => e.key === 'Enter' && enviar()}
              />
              {detalleCp && (
                <span class={'marca ' + (detalleCp[i] ? 'marca--ok' : 'marca--mal')}>
                  {detalleCp[i] ? '✓' : '✗'}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div class="fila-entrada">
          <input
            class="entrada"
            type="text"
            value={entrada}
            disabled={resuelto}
            placeholder={r.tipo === 'expresion' ? 'en función de ' + Object.keys(r.vars).join(', ') : 'por ejemplo 47/120'}
            onInput={(e) => setEntrada((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => e.key === 'Enter' && enviar()}
          />
          {r.tipo === 'numerica' && r.sufijo && <span class="sufijo">{r.sufijo}</span>}
        </div>
      )}

      {/* --- acciones --- */}
      <div class="item__acciones">
        {!resuelto && (
          <button class="boton boton--acento" onClick={enviar}>
            Comprobar
          </button>
        )}
        {puedeMostrarFormulas && (
          <button class="boton boton--fantasma" onClick={() => setFormulasAbiertas((v) => !v)}>
            Fórmulas
          </button>
        )}
        {item.pistas.length > 0 && !resuelto && !modoExamen && (
          <button
            class="boton boton--fantasma"
            disabled={pistasAbiertas >= item.pistas.length}
            onClick={() => setPistasAbiertas((v) => Math.min(v + 1, item.pistas.length))}
          >
            Pistas ({pistasAbiertas}/{item.pistas.length})
          </button>
        )}
        {!resuelto && !modoExamen && (
          <button class="boton boton--fantasma" onClick={revelar}>
            Ver respuesta
          </button>
        )}
      </div>

      {/* --- feedback --- */}
      {estado === 'correcto' && <p class="feedback feedback--ok">✓ Correcto.</p>}
      {estado === 'incorrecto' && !mensaje && !errorTipico && (
        <p class="feedback feedback--mal">✗ No es correcto. Probá de nuevo.</p>
      )}
      {errorTipico && (
        <p class="feedback feedback--mal">
          ✗ <Mate>{errorTipico}</Mate>
        </p>
      )}
      {mensaje && <p class="feedback feedback--aviso">{mensaje}</p>}

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

      {pistasAbiertas > 0 && (
        <ol class="pistas">
          {item.pistas.slice(0, pistasAbiertas).map((p, i) => (
            <li key={i}>
              <Mate>{p}</Mate>
            </li>
          ))}
        </ol>
      )}

      {estado === 'revelado' && <Respuesta item={item} />}

      {/* --- tags: sólo después de resolver o revelar --- */}
      {resuelto && item.skills.length > 0 && (
        <ul class="tags" onMouseLeave={() => onResaltar(null)}>
          {item.skills.map((id) => (
            <li key={id}>
              <button
                class="tag"
                onMouseEnter={() => onResaltar(id)}
                onFocus={() => onResaltar(id)}
                onBlur={() => onResaltar(null)}
              >
                {skillPorId.get(id)?.nombre ?? id}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

/** El resultado final, sin pasos. Sólo cuando el alumno lo pidió. */
function Respuesta({ item }: { item: Item }) {
  const r = item.respuesta
  if (r.tipo === 'numerica' || r.tipo === 'expresion') {
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
          <Mate>{c.pregunta}</Mate> <code>{c.valor}</code>
        </li>
      ))}
    </ul>
  )
}
