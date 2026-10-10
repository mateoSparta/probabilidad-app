/**
 * Menú principal: lo primero que se ve al abrir la app, y adonde lleva el
 * título del encabezado.
 *
 * Cada opción muestra un dato vivo además de su descripción, para que el menú
 * sirva también de resumen: cuánto se resolvió, cuántos temas están dominados
 * y si hay un simulacro a medio rendir.
 */
import type { ComponentType } from 'preact'

import {
  IconoEjercicios,
  IconoSeguimiento,
  IconoSimulacro,
  IconoSkills,
} from '../componentes/Iconos'
import { ejercicios, examenes, itemsPorSkill, skills } from '../datos/contenido'
import type { ApiProgreso } from '../datos/usarProgreso'
import type { ApiSesion } from '../datos/usarSesion'
import { estadoSkill } from '../dominio/progreso'
import { ETIQUETA_VEREDICTO, type Plan } from '../dominio/ritmo'
import { escribirRuta, NOMBRE_SECCION, type Seccion } from '../dominio/ruta'
import { estadoEjercicio, simulacroRetomable } from '../dominio/sesion'
import { ejerciciosJugables } from '../dominio/simulacro'
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

export function VistaMenu({ guia, api, sesion, plan }: Props) {
  const resueltos = ejercicios.filter(
    (ej) =>
      estadoEjercicio(
        sesion.sesion,
        ej.items.map((i) => claveItem(ej.id, i.id)),
      ) === 'resuelto',
  ).length

  const dominados = skills.filter(
    (s) => estadoSkill(api.progreso, itemsPorSkill.get(s.id) ?? VACIO) === 'dominado',
  ).length

  const simulacro = simulacroRetomable(sesion.sesion)
  const enCurso = !!simulacro && !simulacro.entregado
  const pool = examenes.filter((e) => ejerciciosJugables(e).length > 0).length

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
      descripcion: 'El grado de dominio de cada tema, calculado sobre los intentos más recientes.',
      dato: `${dominados} de ${skills.length} skills dominados`,
    },
    {
      seccion: 'simulacro',
      Icono: IconoSimulacro,
      descripcion: 'Un examen de cuatrimestres anteriores, con tiempo límite y sin ayudas.',
      dato: enCurso
        ? 'Hay un simulacro en curso'
        : `${pool} ${pool === 1 ? 'examen disponible' : 'exámenes disponibles'}`,
    },
    {
      seccion: 'seguimiento',
      Icono: IconoSeguimiento,
      descripcion: 'El avance respecto de la fecha del parcial y el estado de cada ejercicio.',
      dato: ETIQUETA_VEREDICTO[plan.veredicto],
    },
  ]

  return (
    <section class="menu" aria-labelledby="titulo-menu">
      <h2 id="titulo-menu" class="sr-solo">
        Menú principal
      </h2>
      <ul class="menu__grilla">
        {opciones.map(({ seccion, Icono, descripcion, dato }, i) => (
          <li key={seccion} style={{ '--i': i }}>
            <a class="menu__opcion" href={escribirRuta({ seccion, guia })}>
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
  )
}
