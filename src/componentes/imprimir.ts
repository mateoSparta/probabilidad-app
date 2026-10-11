/**
 * Imprime un contenido sin cambiar de página. Lo dibuja en un contenedor
 * aparte (`#impresion`), que la hoja de estilos de impresión deja como lo
 * único visible (ver estilos/impresion.css), abre el diálogo del navegador y
 * lo saca cuando el navegador avisa que terminó (`afterprint`).
 *
 * El diálogo ofrece "Guardar como PDF", así que imprimir y guardar son el
 * mismo botón (PLAN.md §12). El título del documento es el nombre que el
 * navegador propone para el PDF.
 */
import { render, type VNode } from 'preact'

export async function imprimir(contenido: VNode, titulo: string): Promise<void> {
  // Si quedó uno de una impresión anterior, se descarta.
  document.getElementById('impresion')?.remove()

  const contenedor = document.createElement('div')
  contenedor.id = 'impresion'
  document.body.appendChild(contenedor)
  render(contenido, contenedor)
  document.body.classList.add('imprimiendo')
  const tituloAnterior = document.title
  document.title = titulo

  addEventListener(
    'afterprint',
    () => {
      document.title = tituloAnterior
      document.body.classList.remove('imprimiendo')
      render(null, contenedor)
      contenedor.remove()
    },
    { once: true },
  )

  // Las tipografías de KaTeX pueden no estar cargadas todavía.
  await document.fonts.ready
  await new Promise((listo) => requestAnimationFrame(() => listo(null)))
  window.print()
}
