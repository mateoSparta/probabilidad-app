/**
 * Esquemas del contenido (PLAN.md §4).
 *
 * El contenido son datos: estos tipos describen lo que vive en content/ y
 * lo que valida tools/check.ts. Nada de esto se hardcodea en la app.
 */

// ---------------------------------------------------------------- skills

export type Skill = {
  id: string
  nombre: string
  /** Guía donde se introduce. Un skill puede evaluarse en varias. */
  guia: number
  descripcion?: string
  /** LaTeX, sin los delimitadores. Se muestran en el panel de fórmulas. */
  formulas?: string[]
}

// ------------------------------------------------------------ respuestas

/**
 * `numerica`    un número. La entrada se parsea con math.js, así que acepta
 *               `47/120`, `0.39`, `1 - (5/6)^4`.
 * `expresion`   una función de parámetros. Se compara evaluando en varios
 *               puntos al azar.
 * `opcion`      multiple choice, para lo que no es numérico.
 * `checkpoints` varias numéricas que hay que acertar todas. Sirve para
 *               validar una función (una F, una densidad) sin parsearla.
 */
export type TipoRespuesta = 'numerica' | 'expresion' | 'opcion' | 'checkpoints'

export type RespuestaNumerica = {
  tipo: 'numerica'
  /** Valor exacto, preferentemente como fracción. */
  valor: string
  /** Tolerancia relativa. Por defecto 0.01. */
  tol_rel?: number
  /** Unidad o aclaración que se muestra al lado del input. */
  sufijo?: string
}

export type RespuestaExpresion = {
  tipo: 'expresion'
  valor: string
  /** Rango de muestreo de cada variable libre. */
  vars: Record<string, [number, number]>
  tol_rel?: number
}

export type Opcion = {
  id: string
  texto: string
  correcta?: boolean
  /** Por qué alguien elegiría esta opción. Alimenta los puntos ciegos. */
  error_tipico?: string
}

export type RespuestaOpcion = {
  tipo: 'opcion'
  opciones: Opcion[]
}

export type Checkpoint = {
  pregunta: string
  valor: string
  tol_rel?: number
}

export type RespuestaCheckpoints = {
  tipo: 'checkpoints'
  checkpoints: Checkpoint[]
}

export type Respuesta =
  | RespuestaNumerica
  | RespuestaExpresion
  | RespuestaOpcion
  | RespuestaCheckpoints

// ---------------------------------------------------------- verificación

export type EstadoVerificacion = 'verificado' | 'discrepancia' | 'sin_fuente'

/**
 * De dónde salió un valor. Puede haber varias fuentes para el mismo ítem:
 * las resueltas de la cátedra y el cálculo independiente. PLAN.md §7 paso 5
 * reconcilia entre ellas, así que hay que poder registrarlas todas.
 */
export type FuenteValor = {
  /** `GUIA 1 RES 1.pdf#p9` o `tools/verify/g1-04.py`. */
  origen: string
  valor: string
}

export type Verificacion = {
  estado: EstadoVerificacion
  /** `exacto`, `montecarlo`, `exacto+montecarlo`. */
  metodo?: string
  fuentes_valor?: FuenteValor[]
  /** Para una discrepancia: qué argumento se siguió. */
  nota?: string
}

// ------------------------------------------------------------- ejercicio

export type Item = {
  /** Local al ejercicio: `a`, `b`, `c`… */
  id: string
  pregunta: string
  skills: string[]
  respuesta: Respuesta
  /** Graduadas. La última es un plan sin cuentas, nunca la resolución. */
  pistas: string[]
  verificacion?: Verificacion
}

/**
 * Identificador global de un ítem: `g1-04:b`.
 *
 * El `id` del ítem es local al ejercicio, así que el ítem (b) de 1.4 y el (b)
 * de 1.5 comparten id. El log de intentos necesita distinguirlos.
 */
export function claveItem(idEjercicio: string, idItem: string): string {
  return `${idEjercicio}:${idItem}`
}

/** Las marcas del glosario de la guía, que la cátedra ya curó. */
export type Prioridad = 'recomendado' | 'normal' | 'muy_dificil' | 'curva_peligrosa'

export type Fuente = {
  enunciado?: string
  resueltas?: string[]
}

export type Ejercicio = {
  id: string
  guia: number
  /** `1.23`, como figura en la guía. */
  numero: string
  prioridad?: Prioridad
  fuente?: Fuente
  /**
   * Texto con LaTeX entre `$`. Los fragmentos que justifican un tag se
   * marcan `[[skill|fragmento]]` y la app los resalta al pasar el mouse
   * por el tag.
   */
  enunciado: string
  items: Item[]
}

// ------------------------------------------------------------ teoría y guía

export type BloqueTeoria = {
  id: string
  skills: string[]
  /** Markdown con LaTeX. */
  cuerpo: string
}

export type PasoSecuencia = { tipo: 'teoria'; id: string } | { tipo: 'ejercicio'; id: string }

export type Guia = {
  numero: number
  titulo: string
  descripcion: string
  secuencia: PasoSecuencia[]
}

// --------------------------------------------------------------- progreso

/** Un envío registrado. De acá se derivan los estados de skill (PLAN.md §5). */
export type Intento = {
  item: string
  /** ISO 8601. */
  ts: string
  envios: number
  correcto: boolean
  pistas: number
  revelo: boolean
  /** Opciones elegidas que eran distractores, para los puntos ciegos. */
  distractores?: string[]
}

export type EstadoSkill = 'sin_explorar' | 'en_desarrollo' | 'dominado' | 'flojo'
