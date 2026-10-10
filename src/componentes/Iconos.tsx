/**
 * Íconos de trazo, dibujados en línea para no sumar una dependencia.
 *
 * Los trazados son los de Lucide (licencia ISC). Todos heredan el color del
 * texto y miden 1em, así acompañan al rótulo sin ajustes, y van ocultos para
 * los lectores de pantalla porque el rótulo ya dice lo mismo.
 */
import type { ComponentChildren } from 'preact'

function Svg({ children }: { children: ComponentChildren }) {
  return (
    <svg
      class="icono"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

// ------------------------------------------------- acciones de un ítem

export const IconoComprobar = () => (
  <Svg>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
)

export const IconoFormulas = () => (
  <Svg>
    <path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2" />
  </Svg>
)

export const IconoPista = () => (
  <Svg>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </Svg>
)

export const IconoVer = () => (
  <Svg>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)

export const IconoReintentar = () => (
  <Svg>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
)

// ---------------------------------------------------- menú principal

export const IconoInicio = () => (
  <Svg>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Svg>
)

export const IconoEjercicios = () => (
  <Svg>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </Svg>
)

export const IconoSkills = () => (
  <Svg>
    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
    <circle cx="12" cy="8" r="6" />
  </Svg>
)

export const IconoSimulacro = () => (
  <Svg>
    <line x1="10" x2="14" y1="2" y2="2" />
    <line x1="12" x2="15" y1="14" y2="11" />
    <circle cx="12" cy="14" r="8" />
  </Svg>
)

export const IconoSeguimiento = () => (
  <Svg>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="m19 9-5 5-4-4-3 3" />
  </Svg>
)

export const IconoReloj = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Svg>
)

export const IconoAviso = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </Svg>
)

export const IconoCandado = () => (
  <Svg>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
)

// ---------------------------------------------------------- cafecito

/**
 * El logo de cafecito.app redibujado con trazo, para que tenga el mismo peso
 * que el resto de los íconos: una taza vista desde arriba (el aro, con el asa
 * a la izquierda) y adentro un globo de diálogo cuya cola sale por un corte
 * del aro hacia abajo a la derecha. No es un trazado de Lucide.
 */
export const LogoCafecito = () => (
  <Svg>
    <path d="M17.09 19.7A8.5 8.5 0 1 1 21.2 15.59" />
    <path d="M5.4 9.4H4.1a2.6 2.6 0 0 0 0 5.2h1.3" />
    <path
      d="M16.25 16.76 19.2 18.2l-.94-3.45A5.5 5.5 0 1 0 16.25 16.76Z"
      fill="currentColor"
      fill-opacity="0.16"
    />
  </Svg>
)

export const IconoCalendario = () => (
  <Svg>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </Svg>
)
