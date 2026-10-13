/**
 * La ruta de la app, escrita en el hash de la URL.
 *
 *   #/                     menú principal
 *   #/ejercicios/3         guía 3
 *   #/habilidades, #/simulacro, #/seguimiento, #/machete, #/distribuciones
 *
 * Va en el hash y no en el path porque GitHub Pages sirve archivos estáticos:
 * un path inventado devolvería 404 al recargar. Que la ruta viva en la URL es
 * lo que permite que el botón de atrás del navegador vuelva a la sección
 * anterior en lugar de cerrar la app.
 *
 * Este módulo es puro (no toca `window`) para poder probarlo desde node.
 */

export type Seccion =
  | 'menu'
  | 'ejercicios'
  | 'habilidades'
  | 'simulacro'
  | 'seguimiento'
  | 'machete'
  | 'distribuciones'

export type Ruta = {
  seccion: Seccion
  /** Sólo tiene sentido en `ejercicios`; en el resto se conserva la última. */
  guia: number
}

export const RUTA_INICIAL: Ruta = { seccion: 'menu', guia: 1 }

/** El nombre de cada sección tal como aparece en las migas y en el menú. */
export const NOMBRE_SECCION: Record<Exclude<Seccion, 'menu'>, string> = {
  ejercicios: 'Ejercicios',
  habilidades: 'Habilidades',
  simulacro: 'Simulacro',
  seguimiento: 'Seguimiento',
  machete: 'Machete',
  distribuciones: 'Distribuciones',
}

const SECCIONES = new Set<string>(Object.keys(NOMBRE_SECCION))

/** Nombres viejos de secciones, para que un enlace guardado siga andando. */
const ALIAS: Record<string, Seccion> = { formulas: 'machete', skills: 'habilidades' }

/**
 * Interpreta el hash. Cualquier cosa que no se reconozca lleva al menú: una
 * URL vieja o mal escrita no puede dejar la pantalla en blanco.
 */
export function leerRuta(hash: string, guiaPorDefecto = 1): Ruta {
  const partes = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [crudo, numero] = partes
  const seccion = crudo && (ALIAS[crudo] ?? crudo)
  if (!seccion || !SECCIONES.has(seccion)) return { seccion: 'menu', guia: guiaPorDefecto }
  const guia = Number(numero)
  return {
    seccion: seccion as Seccion,
    guia: Number.isInteger(guia) && guia > 0 ? guia : guiaPorDefecto,
  }
}

/** El hash que corresponde a una ruta. Es la inversa de `leerRuta`. */
export function escribirRuta(r: Ruta): string {
  if (r.seccion === 'menu') return '#/'
  if (r.seccion === 'ejercicios') return `#/ejercicios/${r.guia}`
  return `#/${r.seccion}`
}
