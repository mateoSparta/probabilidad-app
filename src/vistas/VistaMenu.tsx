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
      descripcion: 'El grado de dominio de cada tema, calculado sobre los intentos más recientes.',
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
      descripcion: 'El avance respecto de la fecha del próximo examen y el estado de cada ejercicio.',
      dato: ETIQUETA_VEREDICTO[plan.veredicto],
    },
  ]

  // Las herramientas van en una fila aparte, más baja, para que el inicio
  // siga entrando sin desplazarse.
  const herramientas: Opcion[] = [
    {
      seccion: 'formulas',
      Icono: IconoFormulas,
      descripcion: 'Las fórmulas de cada guía y las tablas para resolver sin calculadora, para imprimir.',
      dato: `${hojasFormulas.length} guías · ${tablas.length} tablas`,
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
        <ul class="menu__grilla menu__grilla--herramientas">
          {herramientas.map(({ seccion, Icono, descripcion, dato }, i) => (
            <li key={seccion} style={{ '--i': opciones.length + i }}>
              <a class="menu__opcion menu__opcion--compacta" href={escribirRuta({ seccion, guia })}>
                <span class="menu__icono">
                  <Icono />
                </span>
                <span class="menu__nombre">{NOMBRE_SECCION[seccion]}</span>
                <span class="menu__descripcion">{descripcion}</span>
                <span class="menu__dato">{dato}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <TusDatos api={api} sesion={sesion} />
    </>
  )
}
