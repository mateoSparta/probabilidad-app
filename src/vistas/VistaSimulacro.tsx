/**
 * Modo simulacro (PLAN.md §6).
 *
 * Elige al azar un examen del pool, lo presenta con un timer, y al entregar
 * calcula la nota y el veredicto. Sin pistas y sin ver la respuesta: eso es
 * lo que lo distingue de estudiar una guía. Después de entregar se revela
 * todo y los ítems cuentan como intentos para las insignias.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

import { Enunciado } from '../componentes/Mate'
import { ItemEjercicio } from '../componentes/ItemEjercicio'
import { claveItemExamen, examenes } from '../datos/contenido'
import type { ApiProgreso } from '../datos/usarProgreso'
import {
  calificar,
  ejerciciosJugables,
  elegirExamen,
  esCompleto,
  formatearTiempo,
  type Examen,
  type Respuestas,
} from '../dominio/simulacro'

type Fase = 'config' | 'rindiendo' | 'entregado'

const CLAVE_CONFIG = 'probabilidad-app:simulacro:v1'

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
    /* sin persistencia, pero la sesión sigue */
  }
}

export function VistaSimulacro({ api }: { api: ApiProgreso }) {
  const [config, setConfig] = useState<Config>(cargarConfig)
  const [fase, setFase] = useState<Fase>('config')
  const [examen, setExamen] = useState<Examen | null>(null)
  const [restante, setRestante] = useState(0)
  /** numero de ejercicio -> por ítem, si salió correcto. */
  const correctos = useRef<Respuestas>(new Map())

  function cambiar(parcial: Partial<Config>) {
    const siguiente = { ...config, ...parcial }
    setConfig(siguiente)
    guardarConfig(siguiente)
  }

  function arrancar() {
    const elegido = elegirExamen(examenes, {
      incluirIntegradoras: config.incluirIntegradoras,
    })
    if (!elegido) return
    correctos.current = new Map()
    setExamen(elegido)
    setRestante(config.duracionMin * 60)
    setFase('rindiendo')
  }

  // Timer: baja de a un segundo y al llegar a cero entrega solo.
  useEffect(() => {
    if (fase !== 'rindiendo') return
    const id = setInterval(() => {
      setRestante((s) => {
        if (s <= 1) {
          setFase('entregado')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [fase])

  const jugables = useMemo(() => (examen ? ejerciciosJugables(examen) : []), [examen])

  if (fase === 'config' || !examen) {
    return <Configuracion config={config} onCambiar={cambiar} onArrancar={arrancar} />
  }

  const resultado = fase === 'entregado' ? calificar(examen, correctos.current) : null

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
          <div class={'reloj' + (restante < 300 ? ' reloj--poco' : '')}>
            {formatearTiempo(restante)}
          </div>
        </div>

        {!esCompleto(examen) && (
          <p class="feedback feedback--aviso">
            Este examen se presenta incompleto: los ejercicios que faltan necesitan guías que
            todavía no están cargadas. La nota se reescala sobre los presentados y el veredicto
            queda parcial.
          </p>
        )}

        {fase === 'rindiendo' && (
          <div class="item__acciones">
            <button class="boton boton--acento" onClick={() => setFase('entregado')}>
              Entregar
            </button>
            <button class="boton boton--fantasma" onClick={() => setFase('config')}>
              Abandonar
            </button>
          </div>
        )}
      </section>

      {resultado && <Devolucion examen={examen} resultado={resultado} />}

      {jugables.map((ej) => (
        <article key={ej.numero} class="tarjeta">
          <header class="tarjeta__cabeza">
            <h3 class="tarjeta__numero">Ejercicio {ej.numero}</h3>
            {ej.variante && <span class="insignia-prioridad">{ej.variante}</span>}
          </header>

          <Enunciado texto={ej.enunciado} mostrarMarcas={fase === 'entregado' && config.mostrarTags} />

          <ol class="items">
            {ej.items.map((item, i) => (
              <ItemEjercicio
                key={item.id}
                item={item}
                clave={claveItemExamen(examen.id, ej.numero, item.id)}
                modoExamen={fase === 'rindiendo'}
                permitirFormulas={config.mostrarFormulas}
                onResaltar={() => {}}
                onIntento={(intento, limpio) => {
                  const marcas = correctos.current.get(ej.numero) ?? []
                  marcas[i] = intento.correcto
                  correctos.current.set(ej.numero, marcas)
                  api.registrar(intento, limpio)
                }}
              />
            ))}
          </ol>
        </article>
      ))}

      {/* Los que no se presentaron, para que se vea qué falta del examen real. */}
      {examen.ejercicios.filter((e) => !jugables.includes(e)).length > 0 && (
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

function Configuracion({
  config,
  onCambiar,
  onArrancar,
}: {
  config: Config
  onCambiar: (c: Partial<Config>) => void
  onArrancar: () => void
}) {
  const disponibles = examenes.filter((e) => ejerciciosJugables(e).length > 0)
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
              <span>Permitir el panel de fórmulas</span>
            </label>
          </div>

          <div class="item__acciones">
            <button class="boton boton--acento" onClick={onArrancar}>
              Empezar simulacro
            </button>
          </div>

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

