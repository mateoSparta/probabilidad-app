/**
 * Render de texto con matemática y, si corresponde, con fragmentos marcados.
 *
 * El contenido viene como texto con LaTeX entre `$...$` (y `$$...$$` para
 * display), más las marcas `[[skill|fragmento]]` de PLAN.md §4.4.
 */
import katex from 'katex'

import { partirEnSegmentos } from '../dominio/marcas'

const RE_MATE = /\$\$([^$]+)\$\$|\$([^$]+)\$/g

function render(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      output: 'html',
    })
  } catch {
    // Nunca romper la página por un LaTeX mal escrito: se muestra crudo.
    return `<code class="mate-roto">${tex}</code>`
  }
}

function escapar(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Convierte el texto en HTML reemplazando los tramos de LaTeX.
 *
 * Se escapa sólo el texto que queda fuera de las fórmulas: escapar el LaTeX
 * lo rompería.
 */
function aHtml(texto: string): string {
  let salida = ''
  let ultimo = 0
  for (const m of texto.matchAll(RE_MATE)) {
    salida += escapar(texto.slice(ultimo, m.index))
    salida += render(m[1] ?? m[2], m[1] !== undefined)
    ultimo = m.index + m[0].length
  }
  salida += escapar(texto.slice(ultimo))
  return salida
}

type MateProps = {
  /** Texto con `$...$`. Sin marcas de tag. */
  children: string
  bloque?: boolean
}

/** Texto con matemática, sin marcas. */
export function Mate({ children, bloque }: MateProps) {
  const html = aHtml(children)
  return bloque ? (
    <p dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  )
}

/** Sólo una fórmula, sin texto alrededor. */
export function Formula({ tex, display }: { tex: string; display?: boolean }) {
  return <span dangerouslySetInnerHTML={{ __html: render(tex, !!display) }} />
}

type EnunciadoProps = {
  texto: string
  /** Skill cuyo fragmento hay que resaltar ahora mismo. */
  resaltado?: string | null
  /** Si es false, los fragmentos no se distinguen del resto. */
  mostrarMarcas?: boolean
}

/**
 * Enunciado con los fragmentos marcados. Mientras el ítem no se resuelve,
 * `mostrarMarcas` va en false y el texto se ve igual que cualquier otro:
 * el alumno no debe poder deducir el tema por los subrayados.
 */
export function Enunciado({ texto, resaltado, mostrarMarcas }: EnunciadoProps) {
  const segmentos = partirEnSegmentos(texto)
  return (
    <p class="enunciado">
      {segmentos.map((s, i) => {
        const html = aHtml(s.texto)
        if (!s.skill || !mostrarMarcas) {
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        }
        return (
          <span
            key={i}
            class={'fragmento' + (resaltado === s.skill ? ' fragmento--activo' : '')}
            data-skill={s.skill}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      })}
    </p>
  )
}
