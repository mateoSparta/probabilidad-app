/**
 * Persistencia del progreso (PLAN.md §5): localStorage y descarga del JSON.
 * Sin backend.
 *
 * Acá vive solo lo que toca el navegador. Serializar y validar el JSON es
 * logica pura y vive en src/dominio/progreso.ts, para poder testearlo sin
 * navegador.
 */
import { aJson, PROGRESO_VACIO, type Progreso } from '../dominio/progreso'

const CLAVE = 'probabilidad-app:progreso:v1'

/** localStorage puede fallar o no estar: ventana privada, SSR, datos bloqueados. */
function almacen(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function cargar(): Progreso {
  const s = almacen()
  if (!s) return PROGRESO_VACIO
  try {
    const crudo = s.getItem(CLAVE)
    if (!crudo) return PROGRESO_VACIO
    const p = JSON.parse(crudo) as Progreso
    if (p?.version !== 1 || !Array.isArray(p.intentos)) return PROGRESO_VACIO
    return p
  } catch {
    // Un JSON corrupto no tiene que dejar la app inusable.
    return PROGRESO_VACIO
  }
}

export function guardar(p: Progreso): void {
  const s = almacen()
  if (!s) return
  try {
    s.setItem(CLAVE, JSON.stringify(p))
  } catch {
    // Cuota llena o escritura bloqueada: se pierde el guardado, no la sesión.
  }
}

export function borrar(): void {
  try {
    almacen()?.removeItem(CLAVE)
  } catch {
    /* nada que hacer */
  }
}

// ------------------------------------------------------------- descargar

export function descargar(p: Progreso): void {
  const blob = new Blob([aJson(p)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `progreso-probabilidad-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
