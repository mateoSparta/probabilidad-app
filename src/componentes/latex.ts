/**
 * Texto con LaTeX a HTML. Lo usan `Mate` (texto suelto) y `Teoria` (Markdown).
 *
 * Además de renderizar las fórmulas, resuelve un problema tipográfico: KaTeX
 * dibuja cada fórmula como una serie de cajas `inline-block` (`.katex-base`),
 * y el navegador permite cortar el renglón justo después de una caja. Si la
 * fórmula cierra una oración, el punto puede quedar solo al principio del
 * renglón siguiente.
 *
 * La solución es meter la puntuación pegada a la fórmula (sin espacio en el
 * medio) adentro de su última caja, y la de apertura adentro de la primera.
 * Las cajas de KaTeX no se cortan por dentro, así que el signo viaja con el
 * último tramo de la fórmula. Envolver fórmula y signo en un `span` con
 * `white-space: nowrap` no alcanza: Edge decide el corte según el estilo de
 * lo que queda antes, y además impediría cortar una fórmula larga en sus
 * relaciones, que KaTeX sí permite entre caja y caja.
 */
import katex from 'katex'
import { marked } from 'marked'

const RE_MATE = /\$\$([^$]+)\$\$|\$([^$]+)\$/g

/**
 * Signos que no pueden abrir un renglón: van pegados a lo que los precede.
 * La comilla recta está en los dos conjuntos porque pegada a una fórmula
 * sólo puede ser de cierre (si va después) o de apertura (si va antes).
 */
const RE_CIERRE = /^[.,;:!?)\]»”"…]+/
/** Signos que no pueden cerrar un renglón: van pegados a lo que les sigue. */
const RE_APERTURA = /[(\[«“"¿¡]+$/

/** Cómo termina el HTML de una fórmula inline: la última caja, el contenedor y la raíz. */
const FIN_KATEX = '</span></span></span>'
/** Cómo empieza la primera caja: la caja y su puntal de altura. */
const RE_INICIO_KATEX = /(<span class="katex-base"><span class="katex-strut"[^>]*><\/span>)/

export function renderTex(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      output: 'html',
    })
  } catch {
    // Nunca romper la página por un LaTeX mal escrito: se muestra crudo.
    return `<code class="mate-roto">${escapar(tex)}</code>`
  }
}

export function escapar(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Una fórmula inline con su puntuación adentro. `apertura` y `cierre` llegan
 * sin escapar. Si el HTML no tiene la forma esperada (por ejemplo, una
 * fórmula que KaTeX no pudo parsear), los signos quedan afuera, como texto.
 */
function inlineConPuntuacion(tex: string, apertura: string, cierre: string): string {
  let html = renderTex(tex, false)
  const signo = (s: string) => `<span class="puntuacion">${escapar(s)}</span>`
  let antes = ''
  let despues = ''

  if (cierre) {
    if (html.endsWith(FIN_KATEX)) {
      html = html.slice(0, -FIN_KATEX.length) + signo(cierre) + FIN_KATEX
    } else {
      despues = escapar(cierre)
    }
  }
  if (apertura) {
    if (RE_INICIO_KATEX.test(html)) {
      html = html.replace(RE_INICIO_KATEX, (m) => m + signo(apertura))
    } else {
      antes = escapar(apertura)
    }
  }
  return antes + html + despues
}

/**
 * `\$` es un signo de pesos, no el borde de una fórmula. Antes de buscar las
 * fórmulas se lo reemplaza por un carácter de uso privado, y después se lo
 * repone: como `$` en el texto y como `\$` adentro de una fórmula, que es
 * como lo escribe KaTeX.
 */
const PESOS = ''
const ocultarPesos = (t: string) => t.replace(/\\\$/g, PESOS)
const pesosEnTexto = (t: string) => t.replaceAll(PESOS, '$')
const pesosEnTex = (t: string) => t.replaceAll(PESOS, '\\$')

type Tramo = { tipo: 'texto'; texto: string } | { tipo: 'mate'; tex: string; display: boolean }

function partir(texto: string): Tramo[] {
  const tramos: Tramo[] = []
  const oculto = ocultarPesos(texto)
  let ultimo = 0
  for (const m of oculto.matchAll(RE_MATE)) {
    tramos.push({ tipo: 'texto', texto: pesosEnTexto(oculto.slice(ultimo, m.index)) })
    tramos.push({
      tipo: 'mate',
      tex: pesosEnTex(m[1] ?? m[2]),
      display: m[1] !== undefined,
    })
    ultimo = m.index + m[0].length
  }
  tramos.push({ tipo: 'texto', texto: pesosEnTexto(oculto.slice(ultimo)) })
  return tramos
}

/**
 * Texto plano con `$...$` a HTML. Se escapa sólo lo que queda fuera de las
 * fórmulas, porque escapar el LaTeX lo rompería.
 */
export function textoAHtml(texto: string): string {
  // tools/check.ts garantiza que llegue un string; la conversión es sólo para
  // que un error de contenido no deje la página en blanco.
  const tramos = partir(String(texto ?? ''))

  // Cada fórmula inline se lleva el signo de apertura que la precede y el de
  // cierre que la sigue; por eso el texto se escapa recién al final, cuando
  // ya se sabe qué parte quedó afuera.
  type Pieza = { texto: string } | { html: string }
  const piezas: Pieza[] = []
  for (let i = 0; i < tramos.length; i++) {
    const t = tramos[i]
    if (t.tipo === 'texto') {
      piezas.push({ texto: t.texto })
      continue
    }
    // Una fórmula en display ocupa su propio renglón: no hay nada que pegar.
    if (t.display) {
      piezas.push({ html: renderTex(t.tex, true) })
      continue
    }
    const previa = piezas[piezas.length - 1]
    let apertura = ''
    if (previa && 'texto' in previa) {
      apertura = previa.texto.match(RE_APERTURA)?.[0] ?? ''
      previa.texto = previa.texto.slice(0, previa.texto.length - apertura.length)
    }
    const siguiente = tramos[i + 1]
    let cierre = ''
    if (siguiente?.tipo === 'texto') {
      cierre = siguiente.texto.match(RE_CIERRE)?.[0] ?? ''
      siguiente.texto = siguiente.texto.slice(cierre.length)
    }
    piezas.push({ html: inlineConPuntuacion(t.tex, apertura, cierre) })
  }

  return piezas.map((p) => ('texto' in p ? enLinea(escapar(p.texto)) : p.html)).join('')
}

/**
 * El único formato que admite el texto fuera de la teoría: `**negrita**` para
 * enfatizar y `` `código` `` para lo que el alumno tiene que tipear tal cual.
 * Se aplica sobre texto ya escapado y fuera de las fórmulas.
 */
function enLinea(html: string): string {
  return html
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

/**
 * Markdown con LaTeX a HTML.
 *
 * La matemática se protege antes de pasar por el parser de Markdown y se
 * repone después: si no, `_` y `^` de LaTeX se interpretan como énfasis. La
 * puntuación pegada a una fórmula se protege junto con ella, para poder
 * meterla adentro de la fórmula igual que en `textoAHtml`.
 */
export function markdownAHtml(md: string): string {
  const guardadas: string[] = []
  const guardar = (html: string) => {
    guardadas.push(html)
    return `@@MATE${guardadas.length - 1}@@`
  }

  const protegido = ocultarPesos(md).replace(
    /([(\[«“"¿¡]*)(\$\$[^$]+\$\$|\$[^$]+\$)([.,;:!?)\]»”"…]*)/g,
    (_m, apertura: string, formula: string, cierre: string) => {
      if (formula.startsWith('$$')) {
        return apertura + guardar(renderTex(pesosEnTex(formula.slice(2, -2)), true)) + cierre
      }
      return guardar(inlineConPuntuacion(pesosEnTex(formula.slice(1, -1)), apertura, cierre))
    },
  )

  const html = pesosEnTexto(marked.parse(protegido, { async: false }) as string)
  return (
    html
      .replace(/@@MATE(\d+)@@/g, (_m, i: string) => guardadas[Number(i)] ?? '')
      // Las tablas van en un contenedor propio para poder centrarlas y
      // desplazarlas de costado en pantallas angostas sin romper el borde.
      .replace(/<table>/g, '<div class="tabla"><table>')
      .replace(/<\/table>/g, '</table></div>')
  )
}
