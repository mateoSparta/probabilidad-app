/**
 * Bloque de teoría (PLAN.md §4.3): Markdown corto con LaTeX.
 */
import { useMemo } from 'preact/hooks'

import type { BloqueTeoria } from '../dominio/tipos'
import { markdownAHtml } from './latex'

export function Teoria({ bloque }: { bloque: BloqueTeoria }) {
  const html = useMemo(() => markdownAHtml(bloque.cuerpo), [bloque.cuerpo])
  return <section class="teoria" id={bloque.id} dangerouslySetInnerHTML={{ __html: html }} />
}
