/**
 * Íconos de trazo, dibujados en línea para no sumar una dependencia.
 *
 * Los trazados son los de Lucide (licencia ISC). Todos heredan el color del
 * texto y miden 1em, así acompañan al rótulo sin ajustes, y van ocultos para
 * los lectores de pantalla porque el rótulo ya dice lo mismo.
 */
import type { ComponentChildren } from 'preact'
import { useId } from 'preact/hooks'

function Svg({ children, clase }: { children: ComponentChildren; clase?: string }) {
  return (
    <svg
      class={'icono' + (clase ? ' ' + clase : '')}
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
  <Svg clase="icono--formulas">
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

/*
 * Los íconos del menú principal tienen sus piezas con clase para animarlas al
 * pasar el puntero por la opción (estilos/animaciones.css). En el menú de
 * navegación se ven quietos.
 */

/** Una mancuerna, de frente. No es un trazado de Lucide. */
export const IconoEjercicios = () => (
  <Svg>
    <g class="icono__pesa">
      <rect x="3.5" y="7" width="5" height="10" rx="1.2" />
      <path d="M8.5 12h7" />
      <rect x="15.5" y="7" width="5" height="10" rx="1.2" />
    </g>
  </Svg>
)

/** La medalla, y un destello de cuatro puntas que se enciende al pasar el puntero. */
export const IconoHabilidades = () => (
  <Svg>
    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
    <circle cx="12" cy="8" r="6" />
    <path
      class="icono__destello"
      d="M18.5 0.5Q19 3 21.5 3.5 19 4 18.5 6.5 18 4 15.5 3.5 18 3 18.5 0.5Z"
      fill="currentColor"
      stroke="none"
    />
  </Svg>
)

export const IconoSimulacro = () => (
  <Svg>
    <line x1="10" x2="14" y1="2" y2="2" />
    <line class="icono__aguja" x1="12" x2="15" y1="14" y2="11" />
    <circle cx="12" cy="14" r="8" />
  </Svg>
)

/**
 * Un círculo con un tilde (el de Lucide) y, fuera de la vista a la derecha,
 * otro sin tilde: al animarse, el segundo reemplaza al primero y se tilda.
 */
export const IconoSeguimiento = () => (
  <Svg>
    <g class="icono__carril">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
      <circle cx="50" cy="12" r="10" />
      <path class="icono__tilde" d="m47 12 2 2 4-4" pathLength={1} />
    </g>
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

// --------------------------------------------------------- tus datos

/** Exportar: el progreso sale de la app (flecha hacia arriba). */
export const IconoExportar = () => (
  <Svg>
    <path d="M12 3v12" />
    <path d="m17 8-5-5-5 5" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  </Svg>
)

/** Importar: un archivo entra a la app (flecha hacia abajo). */
export const IconoImportar = () => (
  <Svg>
    <path d="M12 15V3" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
  </Svg>
)

export const IconoBorrar = () => (
  <Svg>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
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

/** Modo nocturno: la luna (de Lucide). */
export const IconoLuna = () => (
  <Svg>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </Svg>
)

/** Modo claro: el sol (de Lucide). */
export const IconoSol = () => (
  <Svg>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </Svg>
)

/** Contacto: un globo de diálogo con renglones. */
export const IconoMensaje = () => (
  <Svg>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 8h8" />
    <path d="M8 12h5" />
  </Svg>
)

/** GitHub: el gato del logo, en trazo (de Lucide). */
export const IconoGithub = () => (
  <Svg>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
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

/** Un lápiz: cambiar un dato, como la fecha del examen. */
export const IconoEditar = () => (
  <Svg>
    <path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z" />
    <path d="m15 5 4 4" />
  </Svg>
)

export const IconoAnterior = () => (
  <Svg>
    <path d="m15 18-6-6 6-6" />
  </Svg>
)

export const IconoSiguiente = () => (
  <Svg>
    <path d="m9 18 6-6-6-6" />
  </Svg>
)

export const IconoLupa = () => (
  <Svg>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.8-3.8" />
  </Svg>
)

/** El triángulo de un desplegable: apunta a la derecha y gira al abrirse. */
export const IconoDesplegar = () => (
  <Svg>
    <path d="M9 6.5v11l8-5.5z" fill="currentColor" />
  </Svg>
)

/** El kit para el examen: un botiquín (el briefcase-medical de Lucide). */
export const IconoBotiquin = () => (
  <Svg>
    <path d="M12 11v4" />
    <path d="M14 13h-4" />
    <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <path d="M18 6v14" />
    <path d="M6 6v14" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </Svg>
)

/** Imprimir: la hoja de fórmulas, las tablas y el kit para el examen. */
export const IconoImprimir = () => (
  <Svg>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
    <rect x="6" y="14" width="12" height="8" rx="1" />
  </Svg>
)

/**
 * Distribuciones: una campana sobre un eje (de la calculadora). Debajo, oculto
 * hasta que se anima, un barrido que pinta el área: una línea vertical y el
 * sombreado a su izquierda, recortados a la región bajo la curva.
 */
export function IconoDistribuciones() {
  const id = useId()
  return (
    <Svg>
      <clipPath id={id}>
        <path d="M2 17c4 0 5.5-10 10-10s6 10 10 10V19H2Z" />
      </clipPath>
      <g clip-path={`url(#${id})`}>
        <g class="icono__barrido">
          <rect x="-22" y="0" width="24" height="24" fill="currentColor" fill-opacity="0.24" stroke="none" />
          <path class="icono__corte" d="M2 0v24" stroke-width="1.5" />
        </g>
      </g>
      <path d="M3 19h18" />
      <path d="M2 17c4 0 5.5-10 10-10s6 10 10 10" />
    </Svg>
  )
}
