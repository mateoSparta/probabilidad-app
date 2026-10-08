/**
 * Bloque de teoría (PLAN.md §4.3): Markdown corto con LaTeX.
 *
 * Se protege la matemática antes de pasar el texto por el parser de Markdown
 * y se la repone después: si no, `_` y `^` de LaTeX se comen como énfasis.
 */
import katex from 'katex'
import { marked } from 'marked'

import type { BloqueTeoria } from '../dominio/tipos'

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
    return `<code class="mate-roto">${tex}</code>`
  }
}

function aHtml(md: string): string {
  const guardadas: string[] = []
  const protegido = md.replace(RE_MATE, (_m, display: string, inline: string) => {
    guardadas.push(render(display ?? inline, display !== undefined))
    return `@@MATE${guardadas.length - 1}@@`
  })
  const html = marked.parse(protegido, { async: false }) as string
  return html.replace(/@@MATE(\d+)@@/g, (_m, i: string) => guardadas[Number(i)] ?? '')
}

export function Teoria({ bloque }: { bloque: BloqueTeoria }) {
  return (
    <section
      class="teoria"
      id={'t-' + bloque.id}
      dangerouslySetInnerHTML={{ __html: aHtml(bloque.cuerpo) }}
    />
  )
}
