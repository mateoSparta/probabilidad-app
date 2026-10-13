/**
 * Menú principal: lo primero que se ve al abrir la app, y adonde lleva el
 * título del encabezado.
 *
 * Cada opción muestra un dato vivo además de su descripción, para que el menú
 * sirva también de resumen: cuánto se resolvió, cuántos temas están dominados
 * y si hay un simulacro a medio rendir. Al pie van "Tus datos" (exportar,
 * importar y borrar), que afectan a toda la app.
 */
import type { ComponentType } from 'preact'

import {
  IconoDistribuciones,
  IconoEjercicios,
  IconoFormulas,
  IconoSeguimiento,
  IconoSimulacro,
  IconoSkills,
} from '../componentes/Iconos'
import { TusDatos } from '../componentes/TusDatos'
import {
  ejercicios,
  examenes,
  fichasDistribuciones,
  hojasFormulas,
  itemsPorSkill,
  skillsHabilitados,
  tablas,
} from '../datos/contenido'
import type { ApiProgreso } from '../datos/usarProgreso'
import type { ApiSesion } from '../datos/usarSesion'
import { estadoSkill } from '../dominio/progreso'
import { ETIQUETA_VEREDICTO, type Plan } from '../dominio/ritmo'
import { escribirRuta, NOMBRE_SECCION, type Seccion } from '../dominio/ruta'
import { estadoEjercicio, simulacroRetomable } from '../dominio/sesion'
import { poolDe } from '../dominio/simulacro'
import { claveItem } from '../dominio/tipos'

type Opcion = {
  seccion: Exclude<Seccion, 'menu'>
  Icono: ComponentType
  descripcion: string
  dato: string
}

type Props = {
  /** La última guía abierta: Ejercicios vuelve a ella. */
  guia: number
  api: ApiProgreso
  sesion: ApiSesion
  plan: Plan
}

const VACIO: ReadonlySet<string> = new Set()

/*
 * Las animaciones de los íconos (estilos/animaciones.css) corren mientras la
 * opción tiene la clase `--anima`. Se pone al entrar el puntero (o el foco
 * del teclado) y, al salir, no se saca enseguida: se espera a que la
 * animación vuelva a la posición inicial, para que no se corte de golpe.
 *
 * - Las de una vuelta avisan con `animationend`.
 * - La de Seguimiento es un bucle: la vuelta se ve quieta (igual que el ícono
 *   sin animar) desde la fracción QUIETO_DESDE, así que al salir se corta ni
 *   bien llega ahí, sin empezar otra vuelta.
 *
 * Se toca la clase a mano, sin estado, porque no cambia nada más del menú.
 */
const ANIMA = 'menu__opcion--anima'
const QUIETO_DESDE = 0.56

type Encima = { puntero: boolean; foco: boolean; espera?: number }
const encimas = new WeakMap<HTMLElement, Encima>()

function encimaDe(a: HTMLElement): Encima {
  let e = encimas.get(a)
  if (!e) encimas.set(a, (e = { puntero: false, foco: false }))
  return e
}

function encender(a: HTMLElement): void {
  const e = encimaDe(a)
  clearTimeout(e.espera)
  a.classList.add(ANIMA)
}

/** Saca `--anima` si nada la retiene: ni el puntero, ni el foco, ni una vuelta a medias. */
function apagar(a: HTMLElement): void {
  const e = encimaDe(a)
  if (e.puntero || e.foco) return
  const corriendo = a
    .getAnimations({ subtree: true })
    .filter((x) => x instanceof CSSAnimation && x.playState === 'running')
  const bucle = corriendo.find((x) => x.effect?.getTiming().iterations === Infinity)
  if (bucle) {
    const vuelta = Number(bucle.effect!.getComputedTiming().duration)
    const enVuelta = Number(bucle.currentTime) % vuelta
    clearTimeout(e.espera)
    e.espera = window.setTimeout(
      () => apagar(a),
      Math.max(0, QUIETO_DESDE * vuelta - enVuelta),
    )
    // El bucle sigue corriendo: se lo corta en la próxima llamada, ya quieto.
    if (enVuelta < QUIETO_DESDE * vuelta) return
  } else if (corriendo.length > 0) {
    return // la última que termine vuelve a llamar con `animationend`
  }
  clearTimeout(e.espera)
  a.classList.remove(ANIMA)
}

const ANIMACION = {
  onPointerEnter(ev: PointerEvent) {
    const a = ev.currentTarget as HTMLElement
    encimaDe(a).puntero = true
    encender(a)
  },
  onPointerLeave(ev: PointerEvent) {
    const a = ev.currentTarget as HTMLElement
    encimaDe(a).puntero = false
    apagar(a)
  },
  onFocus(ev: FocusEvent) {
    const a = ev.currentTarget as HTMLElement
    if (!a.matches(':focus-visible')) return
    encimaDe(a).foco = true
    encender(a)
  },
  onBlur(ev: FocusEvent) {
    const a = ev.currentTarget as HTMLElement
    encimaDe(a).foco = false
    apagar(a)
  },
  onAnimationEnd(ev: AnimationEvent) {
    apagar(ev.currentTarget as HTMLElement)
  },
}

export function VistaMenu({ guia, api, sesion, plan }: Props) {
  const resueltos = ejercicios.filter(
    (ej) =>
      estadoEjercicio(
        sesion.sesion,
        ej.items.map((i) => claveItem(ej.id, i.id)),
      ) === 'resuelto',
  ).length

  // Los skills de guías todavía sin cargar no cuentan: no se pueden practicar.
  const dominados = skillsHabilitados.filter(
    (s) => estadoSkill(api.progreso, itemsPorSkill.get(s.id) ?? VACIO) === 'dominado',
  ).length

  const simulacro = simulacroRetomable(sesion.sesion)
  const enCurso = !!simulacro && !simulacro.entregado
  // Los que pueden rendirse: completos y de cinco ejercicios.
  const pool = poolDe(examenes, 'parcial').length + poolDe(examenes, 'integradora').length

  const opciones: Opcion[] = [
    {
      seccion: 'ejercicios',
      Icono: IconoEjercicios,
      descripcion:
        'Las guías de la materia, organizadas por tema, con teoría intercalada.',
      dato: `${resueltos} de ${ejercicios.length} ejercicios resueltos`,
    },
    {
      seccion: 'skills',
      Icono: IconoSkills,
      descripcion: 'El dominio de cada tema, medido sobre los intentos más recientes.',
      dato: `${dominados} de ${skillsHabilitados.length} skills dominados`,
    },
    {
      seccion: 'simulacro',
      Icono: IconoSimulacro,
      descripcion: 'Un examen de cuatrimestres anteriores con tiempo límite.',
      dato: enCurso
        ? 'Hay un simulacro en curso'
        : `${pool} ${pool === 1 ? 'examen disponible' : 'exámenes disponibles'}`,
    },
    {
      seccion: 'seguimiento',
      Icono: IconoSeguimiento,
      descripcion: 'El ritmo hacia el próximo examen y el estado de cada ejercicio.',
      dato: ETIQUETA_VEREDICTO[plan.veredicto],
    },
    {
      seccion: 'machete',
      Icono: IconoFormulas,
      descripcion: 'Las fórmulas de cada guía y las tablas de la cátedra, para imprimir.',
      dato: `${hojasFormulas.length} guías · ${tablas.length} tablas`,
    },
    {
      seccion: 'distribuciones',
      Icono: IconoDistribuciones,
      descripcion: 'Cada distribución del curso, con su gráfico y una calculadora.',
      dato: `${fichasDistribuciones.length} distribuciones`,
    },
  ]

  return (
    <>
      <section class="menu" aria-labelledby="titulo-menu">
        <h2 id="titulo-menu" class="sr-solo">
          Menú principal
        </h2>
        <ul class="menu__grilla">
          {opciones.map(({ seccion, Icono, descripcion, dato }, i) => (
            <li key={seccion} style={{ '--i': i }}>
              <a class="menu__opcion" href={escribirRuta({ seccion, guia })} {...ANIMACION}>
                <span class="menu__icono">
                  <Icono />
                </span>
                <span class="menu__nombre">{NOMBRE_SECCION[seccion]}</span>
                <span class="menu__descripcion">{descripcion}</span>
                <span class={'menu__dato' + (seccion === 'simulacro' && enCurso ? ' menu__dato--alerta' : '')}>
                  {dato}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <TusDatos api={api} sesion={sesion} />
    </>
  )
}
