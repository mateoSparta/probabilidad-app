/**
 * Render de texto con matemática y, si corresponde, con fragmentos marcados.
 *
 * El contenido viene como texto con LaTeX entre `$...$` (y `$$...$$` para
 * display), más las marcas `[[skill|fragmento]]` de PLAN.md §4.4.
 */
import { useMemo } from 'preact/hooks'

import { partirEnSegmentos } from '../dominio/marcas'
import { renderTex, textoAHtml } from './latex'

type MateProps = {
  /** Texto con `$...$`. Sin marcas de tag. */
  children: string
  bloque?: boolean
}

/** Texto con matemática, sin marcas. */
export function Mate({ children, bloque }: MateProps) {
  const html = textoAHtml(children)
  return bloque ? (
    <p dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  )
}

/** Sólo una fórmula, sin texto alrededor. */
export function Formula({ tex, display }: { tex: string; display?: boolean }) {
  return <span dangerouslySetInnerHTML={{ __html: renderTex(tex, !!display) }} />
}

type TextoMarcadoProps = {
  texto: string
  /** Skill cuyos fragmentos hay que resaltar ahora mismo. */
  resaltado?: string | null
  /** Si es false, los fragmentos no se distinguen del resto. */
  mostrarMarcas?: boolean
  /** `p.enunciado` para el enunciado; `span` para la pregunta de un ítem. */
  bloque?: boolean
}

/**
 * Texto con fragmentos marcados. Mientras ningún ítem se resuelve,
 * `mostrarMarcas` va en false y el texto se ve igual que cualquier otro:
 * el alumno no debe poder deducir el tema por los subrayados.
 *
 * El HTML de cada segmento se memoiza: resaltar cambia sólo una clase, y no
 * tiene sentido volver a pasar las fórmulas por KaTeX en cada hover.
 */
export function TextoMarcado({ texto, resaltado, mostrarMarcas, bloque }: TextoMarcadoProps) {
  const segmentos = useMemo(
    () => partirEnSegmentos(texto).map((s) => ({ ...s, html: textoAHtml(s.texto) })),
    [texto],
  )

  const contenido = segmentos.map((s, i) => {
    if (!s.skills || !mostrarMarcas) {
      return <span key={i} dangerouslySetInnerHTML={{ __html: s.html }} />
    }
    const activo = !!resaltado && s.skills.includes(resaltado)
    return (
      <span
        key={i}
        class={'fragmento' + (activo ? ' fragmento--activo' : '')}
        data-skills={s.skills.join(' ')}
        dangerouslySetInnerHTML={{ __html: s.html }}
      />
    )
  })

  return bloque ? <p class="enunciado">{contenido}</p> : <span>{contenido}</span>
}

/** El enunciado de un ejercicio: un `TextoMarcado` en bloque. */
export function Enunciado(props: Omit<TextoMarcadoProps, 'bloque'>) {
  return <TextoMarcado {...props} bloque />
}
