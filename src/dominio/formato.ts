/**
 * Números para mostrar y para leer, con coma decimal (como el resto de la
 * app). Lógica pura.
 */

const SUPERINDICES: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}

/**
 * Un número con `decimales` decimales y coma. Los muy chicos (menos de una
 * diezmilésima) van en notación científica, para no mostrar 0,000000.
 * `recortar` saca los ceros de más a la derecha.
 */
export function formatearNumero(v: number, decimales = 6, recortar = false): string {
  if (Number.isNaN(v)) return '—'
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞'
  if (v !== 0 && Math.abs(v) < 1e-4) {
    const [m, e] = v.toExponential(3).split('e')
    const exp = String(Number(e)).split('').map((c) => SUPERINDICES[c] ?? c).join('')
    return `${m.replace('.', ',').replace('-', '−')}·10${exp}`
  }
  let s = v.toFixed(decimales)
  if (recortar && s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '')
  return s.replace('.', ',').replace('-', '−')
}

/** Lee un número escrito con coma o con punto; NaN si no es un número. */
export function leerNumero(texto: string): number {
  const t = texto.trim().replace(',', '.').replace('−', '-')
  if (t === '' || t === '-' || t === '.') return NaN
  return Number(t)
}

/** Marcas "lindas" para un eje: pasos de 1, 2 o 5 por una potencia de 10. */
export function marcasEje(desde: number, hasta: number, cantidad = 6): number[] {
  if (!(hasta > desde)) return [desde]
  const bruto = (hasta - desde) / cantidad
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const paso = [1, 2, 5, 10].map((m) => m * potencia).find((p) => p >= bruto) ?? 10 * potencia
  const marcas: number[] = []
  for (let v = Math.ceil(desde / paso) * paso; v <= hasta + paso * 1e-9; v += paso) {
    marcas.push(Math.abs(v) < paso * 1e-9 ? 0 : Number(v.toPrecision(12)))
  }
  return marcas
}
