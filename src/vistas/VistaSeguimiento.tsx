/**
 * Seguimiento: el ritmo respecto del examen objetivo y el estado de cada
 * ejercicio, agrupado por unidad.
 *
 * El objetivo se elige arriba, en dos pasos: primero el grupo (el parcial o
 * el final) y después la instancia (el parcial o un recuperatorio, o uno de
 * los llamados de la tanda de finales). Es el mismo objetivo del aviso del
 * encabezado, que acá se pliega: el plan, el color del aviso y el simulacro
 * por defecto lo siguen. Cada instancia lleva un lápiz para cambiar su fecha.
 *
 * Los círculos son los mismos del mapa de cada guía, pero acá los ejercicios
 * no están en la página: elegir uno lleva a su guía y baja hasta él.
 */
import { useState } from 'preact/hooks'

import { AvisoExamenDetalle } from '../componentes/AvisoExamen'
import { EditorFecha } from '../componentes/EditorFecha'
import { MapaEjercicios } from '../componentes/MapaEjercicios'
import { SelectorExamen } from '../componentes/SelectorExamen'
import { guias } from '../datos/contenido'
import { usarEvaluaciones } from '../datos/usarFechas'
import type { ApiSesion } from '../datos/usarSesion'
import { agrupar, evaluacionActual, grupoDe, rangoGuias, type Grupo } from '../dominio/evaluaciones'
import type { Plan } from '../dominio/ritmo'
import { ETIQUETA_ESTADO_EJERCICIO, type EstadoEjercicio } from '../dominio/sesion'

const LEYENDA: EstadoEjercicio[] = ['sin_intentar', 'en_progreso', 'mal', 'resuelto']

/**
 * La última instancia elegida de cada grupo, para volver a ella al cambiar de
 * grupo y regresar. Vive mientras la página esté abierta.
 */
const ultimaDeGrupo = new Map<string, string>()

/** La instancia a la que lleva elegir un grupo: la última elegida o la que toca por fecha. */
function instanciaDe(g: Grupo): string {
  const recordada = ultimaDeGrupo.get(g.grupo)
  if (recordada && g.evaluaciones.some((e) => e.nombre === recordada)) return recordada
  return (evaluacionActual(g.evaluaciones) ?? g.evaluaciones[0]).nombre
}

type Props = {
  plan: Plan
  sesion?: ApiSesion
  onIrAEjercicio: (idEjercicio: string) => void
}

type Edicion = { nombre: string; abierto: boolean }

export function VistaSeguimiento({ plan, sesion, onIrAEjercicio }: Props) {
  const { evaluaciones, objetivo, elegirObjetivo } = usarEvaluaciones()
  const [edicion, setEdicion] = useState<Edicion | null>(null)
  /** De qué lado entran las instancias al cambiar de grupo. */
  const [sentido, setSentido] = useState<'derecha' | 'izquierda' | null>(null)
  const conContenido = guias
    .filter((g) => g.secuencia.some((p) => p.tipo === 'ejercicio'))
    .sort((a, b) => a.numero - b.numero)

  const grupos = agrupar(evaluaciones)
  const indiceGrupo = objetivo ? grupos.findIndex((g) => g.grupo === grupoDe(objetivo)) : -1
  const grupo = grupos[indiceGrupo]
  if (objetivo) ultimaDeGrupo.set(grupoDe(objetivo), objetivo.nombre)

  function elegirGrupo(i: number): void {
    if (i === indiceGrupo) return
    setSentido(i > indiceGrupo ? 'derecha' : 'izquierda')
    elegirObjetivo(instanciaDe(grupos[i]))
  }

  return (
    <>
      <section class="guia__intro">
        <h2>Seguimiento</h2>
        <p class="guia__descripcion">
          La meta es dominar todos los temas, y para lograrlo alcanza con un subconjunto de los
          ejercicios. El cálculo siguiente estima cuántos ítems faltan y cuántos conviene
          resolver por día hasta la fecha del {plan.evaluacion?.nombre ?? 'examen'}.
        </p>
      </section>

      {grupo && objetivo && (
        <section class="objetivo" aria-labelledby="titulo-objetivo">
          <h3 id="titulo-objetivo" class="objetivo__titulo">
            Objetivo
          </h3>
          {grupos.length > 1 && (
            <div
              class="segmentado segmentado--linea objetivo__grupos"
              role="radiogroup"
              aria-label="Parcial o final"
              style={{ '--n': grupos.length, '--activa': indiceGrupo }}
            >
              <span class="segmentado__indicador" aria-hidden="true" />
              {grupos.map((g, i) => (
                <label
                  key={g.grupo}
                  class={'segmentado__opcion' + (i === indiceGrupo ? ' segmentado__opcion--activa' : '')}
                >
                  <input
                    class="sr-solo"
                    type="radio"
                    name="objetivo-grupo"
                    value={g.grupo}
                    checked={i === indiceGrupo}
                    onChange={() => elegirGrupo(i)}
                  />
                  <span class="segmentado__nombre">{g.rotulo}</span>
                  <span class="segmentado__dato">{rangoGuias(g.evaluaciones[0].guias)}</span>
                </label>
              ))}
            </div>
          )}
          {/* La key vuelve a montar las instancias al cambiar de grupo: entran
              del lado del grupo elegido. */}
          <div key={grupo.grupo} class={'objetivo__instancias' + (sentido ? ' objetivo__instancias--' + sentido : '')}>
            <SelectorExamen
              evaluaciones={grupo.evaluaciones}
              elegida={objetivo.nombre}
              onElegir={elegirObjetivo}
              onEditar={(nombre) => setEdicion({ nombre, abierto: true })}
              nombre="objetivo"
              etiqueta={`Instancia del ${grupo.grupo}`}
            />
          </div>
        </section>
      )}

      {edicion && (
        <EditorFecha
          abierto={edicion.abierto}
          nombre={edicion.nombre}
          onCerrar={() => setEdicion({ ...edicion, abierto: false })}
        />
      )}

      {/* La key repite la entrada del detalle al cambiar de objetivo. */}
      <AvisoExamenDetalle key={plan.evaluacion?.nombre} plan={plan} />

      <section class="seguimiento" aria-labelledby="titulo-unidades">
        <h3 id="titulo-unidades">Ejercicios por unidad</h3>

        <ul class="leyenda" aria-label="Referencias de los círculos">
          {LEYENDA.map((e) => (
            <li key={e}>
              <span class={'punto punto--' + e} aria-hidden="true" />
              {ETIQUETA_ESTADO_EJERCICIO[e]}
            </li>
          ))}
        </ul>

        {conContenido.map((g, i) => (
          <section key={g.numero} class="unidad" style={{ '--i': i }}>
            <h4 class="unidad__titulo">
              <span class="unidad__numero">Guía {g.numero}</span> {g.titulo}
            </h4>
            <MapaEjercicios guia={g} sesion={sesion} onElegir={onIrAEjercicio} />
          </section>
        ))}
      </section>
    </>
  )
}
