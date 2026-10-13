/**
 * El aviso del examen objetivo, en dos formatos. El objetivo es el que eligió
 * el usuario o, si no eligió, el que toca según content/config.yaml: el
 * parcial, un recuperatorio o un llamado a final (ver
 * dominio/evaluaciones.ts); el texto lo nombra a partir de ahí.
 *
 * `AvisoExamenCompacto` va en el encabezado: un botón del ancho de la columna
 * con el examen y cuándo es ("Parcial · 30/10 (faltan 18 días)"), teñido
 * según el ritmo. Al apretarlo, el chevrón gira y se despliega, del mismo
 * ancho, la lista de todas las evaluaciones en una columna (el parcial y sus
 * recuperatorios, después los llamados a final): elegir una la vuelve el
 * objetivo, y el lápiz que aparece al pasar el mouse abre el calendario para
 * cambiar su fecha (EditorFecha). Es el único lugar donde se elige el
 * objetivo.
 *
 * `AvisoExamenDetalle` va en Seguimiento, con la cuenta completa: qué falta,
 * cuántos ítems por día y si el ritmo de los últimos días alcanza.
 */
import { useEffect, useId, useRef, useState } from 'preact/hooks'

import { usarEvaluaciones } from '../datos/usarFechas'
import { agrupar, rotuloAviso, rotuloInstancia } from '../dominio/evaluaciones'
import { cuandoEs, ETIQUETA_VEREDICTO, type Plan } from '../dominio/ritmo'
import { EditorFecha } from './EditorFecha'
import { IconoCalendario, IconoComprobar, IconoEditar, IconoSiguiente } from './Iconos'

/** La clase de color que corresponde a cada veredicto. */
function tono(plan: Plan): string {
  switch (plan.veredicto) {
    case 'listo':
      return 'ritmo--listo'
    case 'holgado':
      return 'ritmo--holgado'
    case 'justo':
      return 'ritmo--justo'
    case 'apretado':
    case 'vencido':
      return 'ritmo--apretado'
    // Sin fecha no hay ritmo que juzgar.
    default:
      return 'ritmo--neutro'
  }
}

/** Qué evaluación edita el calendario. Se conserva al cerrarlo, para que salga con su contenido. */
type Edicion = { nombre: string; abierto: boolean }

export function AvisoExamenCompacto({ plan }: { plan: Plan }) {
  const { evaluaciones, elegirObjetivo } = usarEvaluaciones()
  const [abierto, setAbierto] = useState(false)
  const [edicion, setEdicion] = useState<Edicion | null>(null)
  /** De qué lado entra el texto al cambiar de examen: el de la elegida en la lista. */
  const [sentido, setSentido] = useState<'adelante' | 'atras' | null>(null)
  const marco = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const idMenu = useId()
  const ev = plan.evaluacion

  // Abierta, se cierra con un clic afuera, y el foco va a la elegida.
  useEffect(() => {
    if (!abierto) return
    marco.current
      ?.querySelector<HTMLElement>('.aviso-menu__elegir[aria-pressed="true"]')
      ?.focus({ preventScroll: true })
    const afuera = (e: PointerEvent) => {
      if (!marco.current?.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('pointerdown', afuera)
    return () => document.removeEventListener('pointerdown', afuera)
  }, [abierto])

  if (!ev) return null

  function elegir(nombre: string): void {
    const antes = evaluaciones.findIndex((e) => e.nombre === ev!.nombre)
    const despues = evaluaciones.findIndex((e) => e.nombre === nombre)
    if (despues !== antes) {
      setSentido(despues > antes ? 'adelante' : 'atras')
      elegirObjetivo(nombre)
    }
    setAbierto(false)
    boton.current?.focus({ preventScroll: true })
  }

  function editar(nombre: string): void {
    setAbierto(false)
    setEdicion({ nombre, abierto: true })
  }

  return (
    <div
      ref={marco}
      class={'aviso' + (abierto ? ' aviso--abierto' : '')}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && abierto) {
          setAbierto(false)
          boton.current?.focus({ preventScroll: true })
        }
      }}
    >
      <button
        ref={boton}
        class={'aviso-examen ' + tono(plan)}
        aria-expanded={abierto}
        aria-controls={idMenu}
        data-tip="Objetivo"
        aria-label={`Examen objetivo: ${ev.nombre}, ${cuandoEs(ev.fecha, plan.diasRestantes)}. Cambiar el examen o su fecha`}
        onClick={() => setAbierto((a) => !a)}
      >
        {/* La key vuelve a montar el texto al cambiar de examen: entra
            deslizándose del lado de la elegida. */}
        <span
          key={ev.nombre}
          class={'aviso-examen__texto' + (sentido ? ' aviso-examen__texto--' + sentido : '')}
        >
          <IconoCalendario />
          <span class="aviso-examen__examen">{rotuloAviso(ev)}</span>
          <span class="aviso-examen__sep" aria-hidden="true">
            ·
          </span>
          <span class="aviso-examen__cuando">{cuandoEs(ev.fecha, plan.diasRestantes)}</span>
        </span>
        <span class="aviso-examen__chevron" aria-hidden="true">
          <IconoSiguiente />
        </span>
      </button>

      <div id={idMenu} class="aviso-menu" inert={!abierto} role="group" aria-label="Examen objetivo">
        {agrupar(evaluaciones).map((g) => (
          <section key={g.grupo} class="aviso-menu__grupo">
            <p class="aviso-menu__titulo">{g.rotulo}</p>
            <ul class="aviso-menu__lista">
              {g.evaluaciones.map((e) => {
                const elegida = e.nombre === ev.nombre
                return (
                  <li key={e.nombre} class={'aviso-menu__opcion' + (elegida ? ' aviso-menu__opcion--elegida' : '')}>
                    <button class="aviso-menu__elegir" aria-pressed={elegida} onClick={() => elegir(e.nombre)}>
                      <span class="aviso-menu__marca" aria-hidden="true">
                        {elegida && <IconoComprobar />}
                      </span>
                      <span class="aviso-menu__nombre">{rotuloInstancia(e)}</span>
                      <span class="aviso-menu__cuando">{cuandoEs(e.fecha)}</span>
                    </button>
                    <button
                      class="aviso-menu__editar"
                      aria-label={`Editar la fecha del ${e.nombre}`}
                      data-tip="Editar la fecha"
                      onClick={() => editar(e.nombre)}
                    >
                      <IconoEditar />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      {edicion && (
        <EditorFecha
          abierto={edicion.abierto}
          nombre={edicion.nombre}
          onCerrar={() => {
            setEdicion({ ...edicion, abierto: false })
            boton.current?.focus({ preventScroll: true })
          }}
        />
      )}
    </div>
  )
}

export function AvisoExamenDetalle({ plan }: { plan: Plan }) {
  const { veredicto } = plan
  /** "el parcial", "el final": así se lo nombra en el texto. */
  const nombre = plan.evaluacion?.nombre ?? 'examen'
  const examen = `el ${nombre}`

  return (
    <section class={'ritmo ' + tono(plan)}>
      <h3>
        {ETIQUETA_VEREDICTO[veredicto]}
      </h3>

      {veredicto === 'listo' ? (
        <p>
          Las {plan.skillsTotal} habilidades que entran en {examen} están dominadas. Hasta la fecha
          conviene seguir practicando, porque el estado de cada habilidad se calcula sobre sus
          últimos 5 intentos y los errores nuevos desplazan a los aciertos anteriores.
        </p>
      ) : veredicto === 'vencido' ? (
        <p>
          La fecha del {nombre} ya pasó. Si cambió, actualizala desde el aviso de arriba.
        </p>
      ) : veredicto === 'sin_fecha' ? (
        <p>
          Todavía no hay fecha para {examen}. Faltan <strong>{plan.itemsFaltantes} ítems</strong>,
          distribuidos en {plan.ejerciciosFaltantes} ejercicios, para dominar las{' '}
          {plan.skillsTotal - plan.skillsDominados} habilidades pendientes. Cuando la fecha esté
          definida, cargala desde el aviso de arriba para calcular cuántos ítems por día
          hacen falta.
        </p>
      ) : (
        <>
          <p class="ritmo__numero">
            {/* Los espacios explícitos son para el texto (lectores de pantalla,
                copiar y pegar); en pantalla los separa el `gap` del flex. */}
            <span>Necesitás resolver</span>{' '}
            <strong>{plan.porDia}</strong>{' '}
            <span>{plan.porDia === 1 ? 'ítem' : 'ítems'} por día</span>
          </p>
          <p>
            Faltan <strong>{plan.itemsFaltantes} ítems</strong>, distribuidos en{' '}
            {plan.ejerciciosFaltantes} ejercicios, para dominar los temas pendientes, y quedan{' '}
            {plan.diasRestantes} días para {examen}. No es necesario resolver todos los
            ejercicios de las guías; esos ítems alcanzan para cubrir las{' '}
            {plan.skillsTotal - plan.skillsDominados} habilidades que faltan.
          </p>
        </>
      )}

      <ul class="ritmo__datos">
        <li>
          <strong>
            {plan.skillsDominados}/{plan.skillsTotal}
          </strong>{' '}
          habilidades dominadas
        </li>
        {veredicto !== 'sin_arrancar' && veredicto !== 'listo' && veredicto !== 'sin_fecha' && (
          <li>
            ritmo de los últimos 7 días:{' '}
            <strong>{String(plan.ritmoReciente).replace('.', ',')}</strong>{' '}
            {plan.ritmoReciente === 1 ? 'ítem resuelto' : 'ítems resueltos'} en limpio por día
            {plan.alDia ? ' (suficiente)' : ' (inferior al necesario)'}
          </li>
        )}
      </ul>

      {veredicto === 'sin_arrancar' && (
        <p class="dato-chico">
          Cuando resuelvas los primeros ítems, acá vas a ver si el ritmo es suficiente.
        </p>
      )}
    </section>
  )
}
