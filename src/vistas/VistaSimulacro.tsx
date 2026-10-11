/**
 * Modo simulacro (PLAN.md §6).
 *
 * Presenta un examen del pool, el que se eligió o uno al azar, con un timer,
 * y al entregar calcula la nota y el veredicto. Sin pistas y sin ver la
 * respuesta: eso es lo que lo distingue de estudiar una guía. Después de
 * entregar se revela todo, con los tags de cada ejercicio, y los ítems
 * cuentan como intentos para las insignias.
 *
 * El pool tiene sólo exámenes completos y de cinco ejercicios (ver
 * `esRendible`): uno recortado no reproduce el que se va a tomar.
 *
 * El simulacro en curso se guarda, así que recargar la página no lo pierde.
 * Lo que se guarda es el **vencimiento**, no los segundos que faltan: si no,
 * recargar regalaría tiempo, que es lo contrario de lo que haría un examen.
 */
import { useEffect, useMemo, useState } from 'preact/hooks'

import {
  IconoAviso,
  IconoComprobar,
  IconoDesplegar,
  IconoImprimir,
  IconoLupa,
  IconoReintentar,
  IconoReloj,
  IconoSimulacro,
} from '../componentes/Iconos'
import { ItemEjercicio } from '../componentes/ItemEjercicio'
import { KitExamen } from '../componentes/Material'
import { imprimir } from '../componentes/imprimir'
import { Dialogo, Modal } from '../componentes/Modal'
import { Enunciado, TextoMarcado } from '../componentes/Mate'
import { Tags, usarResaltado } from '../componentes/Tags'
// `config` es la de la cursada (content/config.yaml); la del simulacro es estado local.
import { claveItemExamen, config as configCursada, examenes, examenPorId } from '../datos/contenido'
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
  criterioDeAprobacion,
  ejerciciosJugables,
  elegirExamen,
  esCompleto,
  formatearTiempo,
  poolDe,
  type EjercicioExamen,
  type Examen,
  type TipoExamen,
} from '../dominio/simulacro'
import { evaluacionActual, guiasDeLaMateria, rangoGuias } from '../dominio/evaluaciones'
import type { Intento } from '../dominio/tipos'

const CLAVE_CONFIG = 'probabilidad-app:simulacro-config:v1'

type Config = {
  duracionMin: number
  /** Qué se rinde: un parcial o una integradora. No se mezclan. */
  tipo: TipoExamen
  /** Mostrar los tags de skills mientras se rinde. Al entregar se ven siempre. */
  mostrarTags: boolean
  mostrarFormulas: boolean
}

/**
 * El tipo de examen con el que se practica la evaluación que toca (el parcial
 * antes de su fecha, el final después), si ya hay alguno para rendir; si no,
 * el otro.
 */
function tipoPorDefecto(): TipoExamen {
  const preferido = evaluacionActual(configCursada.evaluaciones)?.simulacro ?? 'parcial'
  if (poolDe(examenes, preferido).length > 0) return preferido
  return preferido === 'parcial' ? 'integradora' : 'parcial'
}

const CONFIG_POR_DEFECTO: Config = {
  duracionMin: 240,
  tipo: tipoPorDefecto(),
  mostrarTags: false,
  mostrarFormulas: false,
}

/**
 * La configuración guardada. Las versiones viejas guardaban un toggle
 * `incluirIntegradoras` en lugar de `tipo`: se ignora y queda el tipo por
 * defecto.
 */
function cargarConfig(): Config {
  try {
    const crudo = localStorage.getItem(CLAVE_CONFIG)
    if (!crudo) return CONFIG_POR_DEFECTO
    const leida = { ...CONFIG_POR_DEFECTO, ...JSON.parse(crudo) }
    const tipo: TipoExamen =
      leida.tipo === 'integradora' || leida.tipo === 'parcial' ? leida.tipo : CONFIG_POR_DEFECTO.tipo
    return {
      duracionMin: Number(leida.duracionMin) || CONFIG_POR_DEFECTO.duracionMin,
      tipo,
      mostrarTags: leida.mostrarTags === true,
      mostrarFormulas: leida.mostrarFormulas === true,
    }
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
  /** Si está abierta la confirmación para abandonar. */
  const [preguntandoAbandono, setPreguntandoAbandono] = useState(false)
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

  /** Arranca el examen elegido o, sin `id`, uno al azar del pool. */
  function arrancar(id: string | null) {
    const elegido = elegirExamen(examenes, { tipo: config.tipo, id })
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
            {examen.ejercicios.length} ejercicios · {criterioDeAprobacion(examen)}
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
          <button
            class="boton boton--icono"
            onClick={() => (sim.entregado ? cerrar(examen) : setPreguntandoAbandono(true))}
          >
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

      <Modal
        abierto={preguntandoAbandono}
        titulo="¿Abandonar el simulacro?"
        confirmar="Abandonar"
        cancelar="Seguir rindiendo"
        peligro
        onCancelar={() => setPreguntandoAbandono(false)}
        onConfirmar={() => {
          // Primero se cierra la ventana (con su animación) y después se
          // descarta el simulacro, que cambia la pantalla entera.
          setPreguntandoAbandono(false)
          setTimeout(() => cerrar(examen), 170)
        }}
      >
        <p>
          Se descartan las respuestas de este intento y no se calcula la nota. Los ítems que ya
          comprobaste como correctos quedan registrados para las insignias.
        </p>
      </Modal>

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
  // Al entregar se ven siempre. Mientras se rinde, sólo si se pidieron: el
  // examen real no los da, pero a quien recién empieza le sirven para ver
  // cómo se combinan los skills en un mismo ejercicio.
  const conTags = entregado || mostrarTags
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
              enSimulacro
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

/**
 * Qué evalúa un tipo de examen, según la evaluación de content/config.yaml
 * que se practica con él: "guías 1 a 8", o "toda la materia" si las evalúa
 * todas.
 */
function alcanceDe(tipo: TipoExamen): string {
  const ev = configCursada.evaluaciones.find((e) => e.simulacro === tipo)
  if (!ev) return ''
  const todas = guiasDeLaMateria(configCursada.evaluaciones)
  return ev.guias.length === todas.length ? 'toda la materia' : rangoGuias(ev.guias)
}

const TIPOS: { tipo: TipoExamen; nombre: string; descripcion: string; vacio: string }[] = [
  {
    tipo: 'parcial',
    nombre: 'Parciales',
    descripcion: alcanceDe('parcial'),
    vacio: 'Todavía no hay ninguno',
  },
  {
    tipo: 'integradora',
    nombre: 'Integradoras',
    descripcion: alcanceDe('integradora'),
    vacio: 'Todavía no hay ninguna',
  },
]

function Configuracion({
  config,
  onCambiar,
  onArrancar,
}: {
  config: Config
  onCambiar: (c: Partial<Config>) => void
  onArrancar: (id: string | null) => void
}) {
  const pools = useMemo(
    () => ({ parcial: poolDe(examenes, 'parcial'), integradora: poolDe(examenes, 'integradora') }),
    [],
  )
  const disponibles = pools[config.tipo]
  const hayAlguno = pools.parcial.length + pools.integradora.length > 0

  /** El examen elegido para rendir. Sin elegir, se sortea uno. */
  const [elegido, setElegido] = useState<string | null>(null)
  /** El examen de la vista previa. Se conserva al cerrarla, para que salga con su contenido. */
  const [previo, setPrevio] = useState<Examen | null>(null)
  const [previoAbierto, setPrevioAbierto] = useState(false)
  /** El pool arranca plegado: así se puede rendir uno al azar sin recorrer la lista. */
  const [poolAbierto, setPoolAbierto] = useState(false)

  // Al cambiar de tipo, una elección del otro tipo deja de valer.
  const actual = disponibles.some((e) => e.id === elegido) ? elegido : null
  const nombre = config.tipo === 'parcial' ? 'parcial' : 'integradora'
  const seleccionado = config.tipo === 'parcial' ? 'seleccionado' : 'seleccionada'

  /** Un clic elige el examen; otro clic sobre el elegido lo suelta. */
  function alternar(id: string): void {
    setElegido(actual === id ? null : id)
  }

  return (
    <>
      <section class="guia__intro">
        <h2>Simulacro</h2>
        <p class="guia__descripcion">
          Un examen de cuatrimestres anteriores con tiempo límite, elegido o sorteado. Sus
          intentos son los que más valen para las insignias, porque los ejercicios aparecen
          mezclados y sin indicación del tema.
        </p>
      </section>

      {!hayAlguno ? (
        <p class="vacio">Todavía no hay ningún examen completo para rendir.</p>
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

            <fieldset class="tipo-examen">
              <legend class="sim-config__etiqueta">Examen</legend>
              <div class="segmentado">
                {TIPOS.map(({ tipo, nombre, descripcion, vacio }) => {
                  const cantidad = pools[tipo].length
                  return (
                    <label
                      key={tipo}
                      class={
                        'segmentado__opcion' +
                        (config.tipo === tipo ? ' segmentado__opcion--activa' : '') +
                        (cantidad === 0 ? ' segmentado__opcion--vacia' : '')
                      }
                      data-tip={cantidad === 0 ? `${vacio} completa para rendir` : undefined}
                    >
                      <input
                        class="sr-solo"
                        type="radio"
                        name="tipo-examen"
                        value={tipo}
                        checked={config.tipo === tipo}
                        disabled={cantidad === 0}
                        onChange={() => onCambiar({ tipo })}
                      />
                      <span class="segmentado__nombre">{nombre}</span>
                      <span class="segmentado__dato">
                        {cantidad === 0
                          ? vacio
                          : `${cantidad} ${cantidad === 1 ? 'disponible' : 'disponibles'} · ${descripcion}`}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <ul class="interruptores">
              <Interruptor
                etiqueta="Mostrar tags de skills"
                descripcion="Indica desde el comienzo qué skills combina cada ejercicio."
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

            <div class="sim-arranque">
              <button
                class="boton boton--acento boton--icono boton--grande"
                disabled={disponibles.length === 0}
                aria-label={`Simular ${nombre} ${actual ? seleccionado : 'al azar'}`}
                onClick={() => onArrancar(actual)}
              >
                <IconoSimulacro />
                {/* Sólo cambia la última palabra, que rueda como el tambor de
                    un cronómetro: baja para mostrar "seleccionado" y sube para
                    volver a "al azar". El tambor mide lo que la palabra más
                    larga, así que el botón no cambia de ancho. */}
                <span class="sim-arranque__texto" aria-hidden="true">
                  Simular {nombre}{' '}
                  <span class={'rodillo' + (actual ? ' rodillo--abajo' : '')}>
                    <span class="rodillo__cinta">
                      <span class="rodillo__palabra">{seleccionado}</span>
                      <span class="rodillo__palabra">al azar</span>
                    </span>
                  </span>
                </span>
              </button>
              <p class="dato-chico">
                El tiempo se mide con el reloj del sistema, de modo que sigue corriendo aunque se
                cierre la página. Las respuestas no se pierden.
              </p>
            </div>
          </section>

          <section
            class={'pool desplegable' + (poolAbierto ? ' desplegable--abierto' : '')}
            aria-labelledby="titulo-pool"
          >
            <h3 class="pool__titulo">
              <button
                id="titulo-pool"
                class="desplegable__boton"
                aria-expanded={poolAbierto}
                aria-controls="pool-contenido"
                onClick={() => setPoolAbierto((v) => !v)}
              >
                <IconoDesplegar />
                {config.tipo === 'parcial' ? 'Parciales' : 'Integradoras'} disponibles
              </button>
            </h3>
            <div id="pool-contenido" class="desplegable__contenido" inert={!poolAbierto}>
              <div class="desplegable__interior">
                <p class="pool__ayuda">
                  Elegí uno para rendirlo, o ninguno para que se sortee.
                </p>
                <ul class="pool__grilla">
                  {disponibles.map((e, i) => {
                    const esElegido = actual === e.id
                    return (
                      <li
                        key={e.id}
                        class={'examen' + (esElegido ? ' examen--elegido' : '')}
                        style={{ '--i': i }}
                      >
                        <button
                          class="examen__elegir"
                          aria-pressed={esElegido}
                          onClick={() => alternar(e.id)}
                        >
                          <span class="examen__tipo">{NOMBRE_TIPO[e.tipo]}</span>
                          <span class="examen__titulo">{e.titulo}</span>
                          <span class="examen__fecha">{fechaLarga(e.fecha)}</span>
                          {/* La marca va fija en la esquina inferior derecha, fuera
                              del flujo: no depende de cuántos renglones ocupe el
                              título ni cambia el alto de la tarjeta. */}
                          {esElegido && (
                            <span class="examen__marca">
                              <span class="examen__marca-texto">
                                <IconoComprobar />
                                {seleccionado[0].toUpperCase() + seleccionado.slice(1)}
                              </span>
                            </span>
                          )}
                        </button>
                        <button
                          class="examen__ver"
                          aria-label={`Ver los ejercicios del ${nombre} del ${fechaLarga(e.fecha)}`}
                          aria-haspopup="dialog"
                          data-tip="Ver los ejercicios"
                          onClick={() => {
                            setPrevio(e)
                            setPrevioAbierto(true)
                          }}
                        >
                          <IconoLupa />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </section>

          <KitParaElExamen />

          {previo && (
            <VistaPrevia
              examen={previo}
              abierto={previoAbierto}
              elegido={actual === previo.id}
              mostrarTags={config.mostrarTags}
              onCerrar={() => setPrevioAbierto(false)}
              onAlternar={() => {
                alternar(previo.id)
                setPrevioAbierto(false)
              }}
            />
          )}
        </>
      )}
    </>
  )
}

/**
 * El kit para el examen que toca (PLAN.md §12.3): las fórmulas y las tablas
 * de sus guías en un solo documento, para imprimir o guardar en PDF.
 */
function KitParaElExamen() {
  const ev = evaluacionActual(configCursada.evaluaciones)
  if (!ev) return null
  return (
    <section class="kit-aviso" aria-label={`Kit para el ${ev.nombre}`}>
      <p class="kit-aviso__texto">
        Para llevar al {ev.nombre}, las fórmulas de las {rangoGuias(ev.guias)} y las tablas
        para resolver sin calculadora, en un solo documento.
      </p>
      <button
        class="boton boton--icono"
        onClick={() =>
          void imprimir(
            <KitExamen evaluacion={ev} />,
            `Kit para el ${ev.nombre} - Probabilidad y Estadística B`,
          )
        }
      >
        <IconoImprimir />
        Kit para el {ev.nombre}
      </button>
    </section>
  )
}

/**
 * La vista previa de un examen: sus ejercicios, sin respuestas, para saber en
 * qué consiste antes de elegirlo. Con los tags pedidos, muestra también los
 * skills de cada ejercicio, que se resaltan en el texto como en las guías.
 */
function VistaPrevia({
  examen,
  abierto,
  elegido,
  mostrarTags,
  onCerrar,
  onAlternar,
}: {
  examen: Examen
  abierto: boolean
  elegido: boolean
  mostrarTags: boolean
  onCerrar: () => void
  onAlternar: () => void
}) {
  return (
    <Dialogo
      abierto={abierto}
      clase="modal--examen"
      titulo={examen.titulo}
      onCerrar={onCerrar}
      acciones={
        <>
          <button class="boton" onClick={onCerrar} autoFocus>
            Cerrar
          </button>
          <button class="boton boton--acento" onClick={onAlternar}>
            {elegido ? 'Quitar la selección' : 'Elegir este examen'}
          </button>
        </>
      }
    >
      <p class="modal-examen__dato">
        {NOMBRE_TIPO[examen.tipo]} · {fechaLarga(examen.fecha)} · {examen.ejercicios.length}{' '}
        ejercicios · {criterioDeAprobacion(examen)}
      </p>
      {examen.ejercicios.map((ej) => (
        <EjercicioPrevio key={ej.numero} ejercicio={ej} mostrarTags={mostrarTags} />
      ))}
    </Dialogo>
  )
}

/** Un ejercicio de la vista previa. Va aparte porque el resaltado es un hook. */
function EjercicioPrevio({
  ejercicio: ej,
  mostrarTags,
}: {
  ejercicio: EjercicioExamen
  mostrarTags: boolean
}) {
  const resaltado = usarResaltado()
  const items = ej.items ?? []
  const tags = mostrarTags ? [...new Set(items.flatMap((item) => item.skills))] : []

  return (
    <section class="previo">
      <h4 class="previo__numero">Ejercicio {ej.numero}</h4>
      <Enunciado texto={ej.enunciado} resaltado={resaltado.activo} mostrarMarcas={mostrarTags} />
      <Tags skills={tags} resaltado={resaltado} />
      {items.length > 0 && (
        <ol class="previo__items">
          {items.map((item) => (
            <li key={item.id}>
              <span class="item__id">({item.id})</span>{' '}
              <TextoMarcado
                texto={item.pregunta}
                resaltado={resaltado.activo}
                mostrarMarcas={mostrarTags}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
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
          correctamente resueltos y justificados
          {examen.requiere_alguno_de?.length
            ? `, y que entre ellos esté ${examen.requiere_alguno_de.length === 1 ? 'el' : 'alguno de los ejercicios'} ${examen.requiere_alguno_de.join(' o ')}`
            : ''}
          .
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
