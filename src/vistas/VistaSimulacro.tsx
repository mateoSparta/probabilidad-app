/**
 * Modo simulacro (PLAN.md §6).
 *
 * Elige al azar un examen del pool, lo presenta con un timer, y al entregar
 * calcula la nota y el veredicto. Sin pistas y sin ver la respuesta: eso es
 * lo que lo distingue de estudiar una guía. Después de entregar se revela
 * todo y los ítems cuentan como intentos para las insignias.
 *
 * El simulacro en curso se guarda, así que recargar la página no lo pierde.
 * Lo que se guarda es el **vencimiento**, no los segundos que faltan: si no,
 * recargar regalaría tiempo, que es lo contrario de lo que haría un examen.
 */
import { useEffect, useMemo, useState } from 'preact/hooks'

import {
  IconoAviso,
  IconoComprobar,
  IconoReintentar,
  IconoReloj,
  IconoSimulacro,
} from '../componentes/Iconos'
import { ItemEjercicio } from '../componentes/ItemEjercicio'
import { Enunciado } from '../componentes/Mate'
import { Tags, usarResaltado } from '../componentes/Tags'
import { claveItemExamen, examenes, examenPorId } from '../datos/contenido'
import type { ApiProgreso } from '../datos/usarProgreso'
import type { ApiSesion } from '../datos/usarSesion'
import {
  anotarRespuesta,
  respuestasDeSimulacro,
  segundosRestantes,
  simulacroRetomable,
  type SesionSimulacro,
} from '../dominio/sesion'
import {
  calificar,
  ejerciciosJugables,
  elegirExamen,
  esCompleto,
  formatearTiempo,
  type EjercicioExamen,
  type Examen,
} from '../dominio/simulacro'
import type { Intento } from '../dominio/tipos'

const CLAVE_CONFIG = 'probabilidad-app:simulacro-config:v1'

type Config = {
  duracionMin: number
  incluirIntegradoras: boolean
  mostrarTags: boolean
  mostrarFormulas: boolean
}

const CONFIG_POR_DEFECTO: Config = {
  duracionMin: 240,
  incluirIntegradoras: false,
  mostrarTags: false,
  mostrarFormulas: false,
}

function cargarConfig(): Config {
  try {
    const crudo = localStorage.getItem(CLAVE_CONFIG)
    return crudo ? { ...CONFIG_POR_DEFECTO, ...JSON.parse(crudo) } : CONFIG_POR_DEFECTO
  } catch {
    return CONFIG_POR_DEFECTO
  }
}

function guardarConfig(c: Config): void {
  try {
    localStorage.setItem(CLAVE_CONFIG, JSON.stringify(c))
  } catch {
    /* sin persistencia de la config, pero el simulacro sigue */
  }
}

type Props = { api: ApiProgreso; sesion: ApiSesion }

export function VistaSimulacro({ api, sesion }: Props) {
  const [config, setConfig] = useState<Config>(cargarConfig)
  /** Sólo existe para que el reloj se redibuje cada segundo. */
  const [, setTic] = useState(0)

  const sim = simulacroRetomable(sesion.sesion)
  const examen = sim ? examenPorId.get(sim.examenId) : undefined

  // Si el simulacro se venció mientras no estabas, `simulacroRetomable` lo
  // devuelve ya marcado como entregado; hay que fijarlo en la sesión.
  useEffect(() => {
    if (sim?.entregado && !sesion.sesion.simulacro?.entregado) sesion.anotarSimulacro(sim)
  }, [sim?.entregado])

  // El reloj corre mientras haya un simulacro sin entregar.
  useEffect(() => {
    if (!sim || sim.entregado) return
    const id = setInterval(() => setTic((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [sim?.examenId, sim?.entregado])

  function cambiar(parcial: Partial<Config>) {
    const siguiente = { ...config, ...parcial }
    setConfig(siguiente)
    guardarConfig(siguiente)
  }

  /** Limpia el estado de los ítems de un examen, para arrancarlo de cero. */
  function limpiarItems(ex: Examen) {
    for (const ej of ex.ejercicios) {
      for (const item of ej.items ?? []) {
        sesion.reiniciarItem(claveItemExamen(ex.id, ej.numero, item.id))
      }
    }
  }

  function arrancar() {
    const elegido = elegirExamen(examenes, {
      incluirIntegradoras: config.incluirIntegradoras,
    })
    if (!elegido) return
    limpiarItems(elegido)
    sesion.anotarSimulacro({
      examenId: elegido.id,
      terminaEn: Date.now() + config.duracionMin * 60_000,
      entregado: false,
      correctos: {},
    })
  }

  function entregar(actual: SesionSimulacro) {
    sesion.anotarSimulacro({ ...actual, entregado: true })
  }

  function cerrar(ex: Examen) {
    limpiarItems(ex)
    sesion.anotarSimulacro(undefined)
  }

  if (!sim || !examen) {
    return <Configuracion config={config} onCambiar={cambiar} onArrancar={arrancar} />
  }

  const jugables = ejerciciosJugables(examen)
  const restante = segundosRestantes(sim)
  const resultado = sim.entregado ? calificar(examen, respuestasDeSimulacro(sim)) : null

  return (
    <>
      {/* La barra queda fija arriba mientras se rinde: el reloj tiene que
          estar siempre a la vista, como el de un aula. */}
      <section class={'sim-barra' + (sim.entregado ? ' sim-barra--entregado' : '')}>
        <div class="sim-barra__info">
          <p class="sim-barra__tipo">
            {NOMBRE_TIPO[examen.tipo]} · {fechaLarga(examen.fecha)}
          </p>
          <h2 class="sim-barra__titulo">{examen.titulo}</h2>
          <p class="sim-barra__dato">
            {jugables.length} de {examen.ejercicios.length} ejercicios presentados
          </p>
        </div>

        {sim.entregado ? (
          <span class="sim-estado">
            <IconoComprobar />
            Entregado
          </span>
        ) : (
          <div
            class={'reloj' + (restante < 300 ? ' reloj--poco' : '')}
            role="timer"
            aria-label="Tiempo restante"
          >
            <IconoReloj />
            <span class="reloj__tiempo">{formatearTiempo(restante)}</span>
          </div>
        )}

        <div class="sim-barra__acciones">
          {!sim.entregado && (
            <button class="boton boton--acento boton--icono" onClick={() => entregar(sim)}>
              <IconoComprobar />
              Entregar
            </button>
          )}
          <button class="boton boton--icono" onClick={() => cerrar(examen)}>
            {sim.entregado ? (
              <>
                <IconoReintentar />
                Elegir otro examen
              </>
            ) : (
              'Abandonar'
            )}
          </button>
        </div>
      </section>

      {!esCompleto(examen) && (
        <p class="nota-aviso">
          <IconoAviso />
          <span>
            Este examen se presenta incompleto, porque algunos de sus ejercicios todavía no
            tienen respuestas verificadas. La nota se reescala sobre los ejercicios presentados
            y el veredicto es parcial.
          </span>
        </p>
      )}

      {resultado && <Devolucion examen={examen} resultado={resultado} />}

      {jugables.map((ej) => (
        <TarjetaExamen
          key={ej.numero}
          examen={examen}
          ejercicio={ej}
          sesion={sesion}
          entregado={sim.entregado}
          mostrarTags={config.mostrarTags}
          mostrarFormulas={config.mostrarFormulas}
          onIntento={(i, intento, limpio) => {
            const actual = sesion.sesion.simulacro
            if (actual) {
              sesion.anotarSimulacro(anotarRespuesta(actual, ej.numero, i, intento.correcto))
            }
            api.registrar(intento, limpio)
          }}
        />
      ))}

      {/* Los que no se presentaron, para que se vea qué falta del examen real. */}
      {examen.ejercicios.length > jugables.length && (
        <section class="pendientes">
          <h3 class="pendientes__titulo">Ejercicios del examen que todavía no pueden rendirse</h3>
          <ul class="pendientes__lista">
            {examen.ejercicios
              .filter((e) => !jugables.includes(e))
              .map((e) => (
                <li key={e.numero} class="pendiente">
                  <div class="pendiente__cabeza">
                    <span class="pendiente__numero">Ejercicio {e.numero}</span>
                    {e.guias.map((g) => (
                      <span key={g} class="chip-guia">
                        Guía {g}
                      </span>
                    ))}
                  </div>
                  {e.nota && <p class="pendiente__nota">{e.nota}</p>}
                </li>
              ))}
          </ul>
        </section>
      )}
    </>
  )
}

const NOMBRE_TIPO: Record<Examen['tipo'], string> = {
  parcial: 'Parcial',
  integradora: 'Integradora',
}

/** `2025-05-24` como `24/05/2025`. */
function fechaLarga(iso: string): string {
  const [a, m, d] = iso.split('-')
  return d && m && a ? `${d}/${m}/${a}` : iso
}

/**
 * Un ejercicio del examen. Es un componente aparte porque cada tarjeta lleva
 * su propio estado de resaltado, y los hooks no pueden ir dentro de un `map`.
 */
function TarjetaExamen({
  examen,
  ejercicio: ej,
  sesion,
  entregado,
  mostrarTags,
  mostrarFormulas,
  onIntento,
}: {
  examen: Examen
  ejercicio: EjercicioExamen
  sesion: ApiSesion
  entregado: boolean
  mostrarTags: boolean
  mostrarFormulas: boolean
  onIntento: (indiceItem: number, intento: Intento, limpio: boolean) => void
}) {
  const resaltado = usarResaltado()
  // Los tags sólo después de entregar, y sólo si se pidieron: mientras se
  // rinde, saber el tema sería una ayuda que el examen real no da.
  const conTags = entregado && mostrarTags
  const items = ej.items ?? []
  const tags = conTags ? [...new Set(items.flatMap((item) => item.skills))] : []

  return (
    <article class="tarjeta">
      <header class="tarjeta__cabeza">
        <h3 class="tarjeta__numero">Ejercicio {ej.numero}</h3>
        {ej.variante && <span class="insignia-prioridad">{ej.variante}</span>}
      </header>

      <Enunciado texto={ej.enunciado} resaltado={resaltado.activo} mostrarMarcas={conTags} />

      <Tags skills={tags} resaltado={resaltado} />

      <ol class="items">
        {items.map((item, i) => {
          const clave = claveItemExamen(examen.id, ej.numero, item.id)
          return (
            <ItemEjercicio
              key={clave}
              item={item}
              clave={clave}
              inicial={sesion.item(clave)}
              onGuardar={(e) => sesion.anotarItem(clave, e)}
              modoExamen={!entregado}
              permitirFormulas={mostrarFormulas || entregado}
              resaltado={resaltado.activo}
              mostrarMarcas={conTags}
              onIntento={(intento, limpio) => onIntento(i, intento, limpio)}
            />
          )
        })}
      </ol>
    </article>
  )
}

/** Los atajos de duración, en minutos. */
const DURACIONES = [60, 120, 180, 240]

function Configuracion({
  config,
  onCambiar,
  onArrancar,
}: {
  config: Config
  onCambiar: (c: Partial<Config>) => void
  onArrancar: () => void
}) {
  const disponibles = useMemo(
    () => examenes.filter((e) => ejerciciosJugables(e).length > 0),
    [],
  )
  const parciales = disponibles.filter((e) => e.tipo === 'parcial')

  return (
    <>
      <section class="guia__intro">
        <h2>Simulacro</h2>
        <p class="guia__descripcion">
          Un examen elegido al azar, con tiempo límite y sin ayudas. Sus intentos son los más
          valiosos para las insignias, porque los ejercicios aparecen mezclados y sin indicación
          del tema.
        </p>
      </section>

      {parciales.length === 0 ? (
        <p class="vacio">Todavía no hay ningún examen con ejercicios verificados para rendir.</p>
      ) : (
        <>
          <section class="sim-config" aria-label="Configuración del simulacro">
            <div class="sim-config__duracion">
              <label class="sim-config__etiqueta" for="duracion">
                Duración
              </label>
              <div class="duracion">
                <input
                  id="duracion"
                  class="entrada entrada--corta"
                  type="number"
                  min="5"
                  max="480"
                  value={config.duracionMin}
                  onInput={(e) =>
                    onCambiar({
                      duracionMin: Number((e.target as HTMLInputElement).value) || 240,
                    })
                  }
                />
                <span class="sufijo">minutos</span>
              </div>
              <div class="duracion__atajos" role="group" aria-label="Duraciones frecuentes">
                {DURACIONES.map((m) => (
                  <button
                    key={m}
                    class={'chip-opcion' + (config.duracionMin === m ? ' chip-opcion--activa' : '')}
                    aria-pressed={config.duracionMin === m}
                    onClick={() => onCambiar({ duracionMin: m })}
                  >
                    {m / 60} h
                  </button>
                ))}
              </div>
            </div>

            <ul class="interruptores">
              <Interruptor
                etiqueta="Incluir integradoras"
                descripcion="Suma al pool los exámenes integradores, además de los parciales."
                activo={config.incluirIntegradoras}
                onCambiar={(v) => onCambiar({ incluirIntegradoras: v })}
              />
              <Interruptor
                etiqueta="Mostrar tags al entregar"
                descripcion="Al terminar, indica qué temas evaluaba cada ejercicio."
                activo={config.mostrarTags}
                onCambiar={(v) => onCambiar({ mostrarTags: v })}
              />
              <Interruptor
                etiqueta="Permitir el panel de fórmulas"
                descripcion="Habilita el botón Fórmulas mientras se rinde."
                activo={config.mostrarFormulas}
                onCambiar={(v) => onCambiar({ mostrarFormulas: v })}
              />
            </ul>

            <div class="sim-config__pie">
              <button class="boton boton--acento boton--icono boton--grande" onClick={onArrancar}>
                <IconoSimulacro />
                Empezar simulacro
              </button>
              <p class="dato-chico">
                El tiempo se mide con el reloj del sistema, de modo que sigue corriendo aunque se
                cierre la página, como en un examen real. Las respuestas no se pierden.
              </p>
            </div>
          </section>

          <section class="pool">
            <h3 class="pool__titulo">Exámenes en el pool</h3>
            <ul class="pool__grilla">
              {disponibles.map((e, i) => {
                const rendibles = ejerciciosJugables(e).length
                const total = e.ejercicios.length
                return (
                  <li key={e.id} class="examen" style={{ '--i': i }}>
                    <span class="examen__tipo">{NOMBRE_TIPO[e.tipo]}</span>
                    <span class="examen__titulo">{e.titulo}</span>
                    <span class="examen__fecha">{fechaLarga(e.fecha)}</span>
                    <span class="barra" aria-hidden="true">
                      <span
                        class="barra__relleno"
                        style={{ width: `${(100 * rendibles) / total}%` }}
                      />
                    </span>
                    <span class="examen__avance">
                      {rendibles} de {total} ejercicios rendibles
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </>
  )
}

/** Un ajuste de sí o no, dibujado como interruptor. */
function Interruptor({
  etiqueta,
  descripcion,
  activo,
  onCambiar,
}: {
  etiqueta: string
  descripcion: string
  activo: boolean
  onCambiar: (v: boolean) => void
}) {
  return (
    <li>
      <label class="interruptor">
        <span class="interruptor__texto">
          <span class="interruptor__etiqueta">{etiqueta}</span>
          <span class="interruptor__descripcion">{descripcion}</span>
        </span>
        <input
          class="interruptor__control"
          type="checkbox"
          role="switch"
          checked={activo}
          onChange={(e) => onCambiar((e.target as HTMLInputElement).checked)}
        />
      </label>
    </li>
  )
}

function Devolucion({
  examen,
  resultado,
}: {
  examen: Examen
  resultado: ReturnType<typeof calificar>
}) {
  return (
    <section class="devolucion">
      <div class="devolucion__nota">
        <p class="nota">
          <strong>{resultado.nota.toFixed(2).replace('.', ',')}</strong>
          <span> / 10</span>
        </p>
        <span class={'veredicto ' + (resultado.aprobaria ? 'veredicto--ok' : 'veredicto--mal')}>
          {resultado.aprobaria ? 'Aprobaría' : 'No aprobaría'}
        </span>
      </div>

      <div class="devolucion__detalle">
        <p>
          {resultado.ejerciciosEnteros} de {resultado.presentados} ejercicios presentados se
          resolvieron por completo. La cátedra exige al menos {examen.aprueba_con} ejercicios
          correctamente resueltos y justificados.
        </p>

        {resultado.veredictoParcial && (
          <p class="nota-aviso">
            <IconoAviso />
            <span>
              Veredicto parcial. Se rindieron {resultado.presentados} de {resultado.totales}{' '}
              ejercicios, de modo que el criterio de la cátedra no puede evaluarse por completo.
            </span>
          </p>
        )}

        <ul class="desglose">
          {resultado.detalle.map((d) => (
            <li key={d.numero}>
              <span class="desglose__nombre">Ejercicio {d.numero}</span>
              <span class="barra" aria-hidden="true">
                <span
                  class="barra__relleno"
                  style={{ width: `${d.total ? (100 * d.correctos) / d.total : 0}%` }}
                />
              </span>
              <span class="desglose__dato">
                {d.correctos} de {d.total} ítems
              </span>
            </li>
          ))}
        </ul>

        <p class="dato-chico">
          Las respuestas y las pistas quedaron habilitadas más abajo, y los ítems ya se
          registraron como intentos para las insignias.
        </p>
      </div>
    </section>
  )
}
