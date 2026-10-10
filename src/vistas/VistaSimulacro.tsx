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
      <section class="guia__intro">
        <div class="simulacro__barra">
          <div>
            <h2>{examen.titulo}</h2>
            <p class="dato-chico">
              {examen.fecha} · {jugables.length} de {examen.ejercicios.length} ejercicios
              presentados
            </p>
          </div>
          <div class={'reloj' + (!sim.entregado && restante < 300 ? ' reloj--poco' : '')}>
            {sim.entregado ? 'entregado' : formatearTiempo(restante)}
          </div>
        </div>

        {!esCompleto(examen) && (
          <p class="feedback feedback--aviso">
            Este examen se presenta incompleto: los ejercicios que faltan necesitan guías que
            todavía no están cargadas. La nota se reescala sobre los presentados y el veredicto
            queda parcial.
          </p>
        )}

        <div class="item__acciones">
          {!sim.entregado && (
            <button class="boton boton--acento" onClick={() => entregar(sim)}>
              Entregar
            </button>
          )}
          <button class="boton boton--fantasma" onClick={() => cerrar(examen)}>
            {sim.entregado ? 'Cerrar y volver al pool' : 'Abandonar'}
          </button>
        </div>
      </section>

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
        <section class="detalle-skill">
          <h3>Ejercicios que este examen tiene y todavía no se pueden rendir</h3>
          <ul class="lista-items">
            {examen.ejercicios
              .filter((e) => !jugables.includes(e))
              .map((e) => (
                <li key={e.numero}>
                  <strong>Ejercicio {e.numero}</strong> (guías {e.guias.join(', ')})
                  {e.nota && <> — {e.nota}</>}
                </li>
              ))}
          </ul>
        </section>
      )}
    </>
  )
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
    <section class="guia__intro">
      <h2>Simulacro</h2>
      <p class="guia__descripcion">
        Un examen al azar, con timer y sin ayudas. Son los intentos más valiosos para las
        insignias, porque vienen mezclados y sin aviso del tema.
      </p>

      {parciales.length === 0 ? (
        <p class="vacio">
          Todavía no hay ningún examen con ejercicios verificados para rendir.
        </p>
      ) : (
        <>
          <div class="campos">
            <label class="campo">
              <span>Duración (minutos)</span>
              <input
                class="entrada entrada--corta"
                type="number"
                min="5"
                max="480"
                value={config.duracionMin}
                onInput={(e) =>
                  onCambiar({ duracionMin: Number((e.target as HTMLInputElement).value) || 240 })
                }
              />
            </label>

            <label class="campo campo--check">
              <input
                type="checkbox"
                checked={config.incluirIntegradoras}
                onChange={(e) =>
                  onCambiar({ incluirIntegradoras: (e.target as HTMLInputElement).checked })
                }
              />
              <span>Incluir integradoras</span>
            </label>

            <label class="campo campo--check">
              <input
                type="checkbox"
                checked={config.mostrarTags}
                onChange={(e) => onCambiar({ mostrarTags: (e.target as HTMLInputElement).checked })}
              />
              <span>Mostrar tags al entregar</span>
            </label>

            <label class="campo campo--check">
              <input
                type="checkbox"
                checked={config.mostrarFormulas}
                onChange={(e) =>
                  onCambiar({ mostrarFormulas: (e.target as HTMLInputElement).checked })
                }
              />
              <span>Permitir el panel de fórmulas mientras rendís</span>
            </label>
          </div>

          <div class="item__acciones">
            <button class="boton boton--acento" onClick={onArrancar}>
              Empezar simulacro
            </button>
          </div>

          <p class="dato-chico">
            El reloj corre contra la hora, así que si cerrás la página el tiempo sigue pasando,
            igual que en un examen. Lo que respondiste no se pierde.
          </p>

          <h3>Exámenes en el pool</h3>
          <ul class="lista-items">
            {disponibles.map((e) => (
              <li key={e.id}>
                {e.titulo} ({e.fecha}) — {ejerciciosJugables(e).length} de{' '}
                {e.ejercicios.length} ejercicios
                {e.tipo === 'integradora' && ' · integradora'}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
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
      <h3>Entregado</h3>
      <p class="nota">
        <strong>{resultado.nota.toFixed(2)}</strong> / 10
      </p>
      <p>
        {resultado.ejerciciosEnteros} de {resultado.presentados} ejercicios presentados salieron
        completos.
      </p>
      <p class={resultado.aprobaria ? 'feedback feedback--ok' : 'feedback feedback--mal'}>
        {resultado.aprobaria ? '✓ Aprobaría' : '✗ No aprobaría'}: la cátedra pide al menos{' '}
        {examen.aprueba_con} ejercicios correctamente resueltos y justificados.
      </p>
      {resultado.veredictoParcial && (
        <p class="feedback feedback--aviso">
          Veredicto parcial: se rindieron {resultado.presentados} de {resultado.totales}{' '}
          ejercicios, así que el criterio de la cátedra no se puede evaluar de verdad.
        </p>
      )}
      <ul class="lista-items">
        {resultado.detalle.map((d) => (
          <li key={d.numero}>
            Ejercicio {d.numero}: {d.correctos} de {d.total} ítems
          </li>
        ))}
      </ul>
      <p class="dato-chico">
        Abajo quedaron las respuestas y las pistas habilitadas, y los ítems ya contaron como
        intentos para las insignias.
      </p>
    </section>
  )
}
