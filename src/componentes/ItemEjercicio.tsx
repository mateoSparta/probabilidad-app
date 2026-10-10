/**
 * Un ítem de un ejercicio: la unidad validable (PLAN.md §3).
 *
 * Cada ítem tiene su input, sus ayudas (fórmulas, pistas graduadas, ver
 * respuesta) y su feedback en línea. Los tags no van acá sino debajo del
 * enunciado (ver TarjetaEjercicio), y aparecen recién cuando el ítem se
 * resuelve o se revela: recuperación activa antes que lectura.
 *
 * El estado vive en un solo objeto y se persiste completo en cada cambio, así
 * recargar la página no te hace perder el lugar. Lo único que no se guarda es
 * si el panel de fórmulas está abierto, que no vale la pena.
 */
import { useState } from 'preact/hooks'

import { formulasDeItem } from '../datos/contenido'
import {
  evaluarCheckpoints,
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

  /** Mezcla el cambio en el estado y lo persiste de una. */
  function actualizar(parcial: Partial<SesionItem>): void {
    const siguiente = { ...est, ...parcial }
    setEst(siguiente)
    onGuardar?.(siguiente)
  }

  const resuelto = est.estado === 'correcto' || est.estado === 'revelado'
  const r = item.respuesta

  function registrar(correcto: boolean, revelo: boolean, nEnvios: number, elegidos: string[]) {
    const intento: Intento = {
      item: clave,
      ts: new Date().toISOString(),
      envios: nEnvios,
      correcto,
      pistas: est.pistasAbiertas,
      revelo,
      distractores: elegidos.length ? elegidos : undefined,
    }
    onIntento?.(intento, correcto && esLimpio(item, nEnvios, revelo))
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
        actualizar({ envios: n, estado: 'correcto' })
        registrar(true, false, n, distractores)
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
      actualizar({ envios: n, estado: v.ok ? 'correcto' : 'incorrecto' })
      if (v.ok) registrar(true, false, n, distractores)
      return
    }

    const entrada = est.entrada ?? ''
    const v = r.tipo === 'numerica' ? evaluarNumerica(entrada, r) : evaluarExpresion(entrada, r)
    if (v.ok) {
      actualizar({ envios: n, estado: 'correcto' })
      registrar(true, false, n, distractores)
      return
    }
    actualizar({ envios: n, estado: 'incorrecto' })
    if (v.motivo === 'vacio') setMensaje('Escribí una respuesta.')
    else if (v.motivo === 'no_parsea') setMensaje(v.detalle ?? 'No pude interpretar eso.')
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
    onReiniciar?.()
  }

  const formulas = formulasDeItem(item.skills)
  const puedeMostrarFormulas = formulas.length > 0 && permitirFormulas

  return (
    <li class={'item item--' + est.estado}>
      <div class="item__cabeza">
        <span class="item__id">({item.id})</span>
        <div class="item__pregunta">
          <TextoMarcado
            texto={item.pregunta}
            resaltado={resaltado}
            mostrarMarcas={mostrarMarcas}
          />
        </div>
      </div>

      {/* --- entrada según el tipo de respuesta --- */}
      {r.tipo === 'opcion' ? (
        <ul class="opciones">
          {r.opciones.map((o) => (
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
        <ul class="checkpoints">
          {r.checkpoints.map((c, i) => (
            <li key={i} class="checkpoint">
              <span class="checkpoint__pregunta">
                <Mate>{c.pregunta}</Mate>
              </span>
              <input
                class="entrada entrada--corta"
                type="text"
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
            value={est.entrada ?? ''}
            disabled={resuelto}
            placeholder={
              r.tipo === 'expresion'
                ? 'en función de ' + Object.keys(r.vars).join(', ')
                : 'por ejemplo 47/120'
            }
            onInput={(e) => actualizar({ entrada: (e.target as HTMLInputElement).value })}
            onKeyDown={(e) => e.key === 'Enter' && enviar()}
          />
          {r.tipo === 'numerica' && r.sufijo && <span class="sufijo">{r.sufijo}</span>}
        </div>
      )}

      {/* --- acciones: una grilla que reparte el ancho entre los botones --- */}
      <div class="botonera">
        {!resuelto && (
          <button class="boton boton--acento boton--icono" onClick={enviar}>
            <IconoComprobar />
            Comprobar
          </button>
        )}
        {puedeMostrarFormulas && (
          <button
            class={'boton boton--icono' + (formulasAbiertas ? ' boton--activo' : '')}
            aria-expanded={formulasAbiertas}
            onClick={() => setFormulasAbiertas((v) => !v)}
          >
            <IconoFormulas />
            Fórmulas
          </button>
        )}
        {item.pistas.length > 0 && !resuelto && !modoExamen && (
          <button
            class="boton boton--icono"
            disabled={est.pistasAbiertas >= item.pistas.length}
            onClick={() =>
              actualizar({
                pistasAbiertas: Math.min(est.pistasAbiertas + 1, item.pistas.length),
              })
            }
          >
            <IconoPista />
            Pistas ({est.pistasAbiertas}/{item.pistas.length})
          </button>
        )}
        {!resuelto && !modoExamen && (
          <button class="boton boton--icono" onClick={revelar}>
            <IconoVer />
            Ver respuesta
          </button>
        )}
        {/* Sin esto, el ítem quedaría congelado para siempre una vez resuelto.
            El intento ya contó; rehacerlo no vuelve a contar el mismo día. */}
        {resuelto && !modoExamen && (
          <button class="boton boton--icono" onClick={reintentar}>
            <IconoReintentar />
            Reintentar
          </button>
        )}
      </div>

      {/* --- feedback --- */}
      {est.estado === 'correcto' && <p class="feedback feedback--ok">✓ Correcto.</p>}
      {est.estado === 'incorrecto' && !mensaje && !errorTipico && (
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
