import type { Vista } from '../app'

const GUIAS = [1, 2, 3, 4, 5, 6, 7, 8]

type Props = {
  vista: Vista
  guiaActiva: number
  onVista: (v: Vista) => void
  onGuia: (n: number) => void
}

export function Cabecera({ vista, guiaActiva, onVista, onGuia }: Props) {
  return (
    <header class="cabecera">
      <div class="columna">
        <div class="cabecera__fila">
          <h1 class="cabecera__titulo">
            <span>61.09 · 81.04 · CB003</span>
            Probabilidad y Estadística B
          </h1>
          <div class="cabecera__acciones">
            <button
              class={'boton' + (vista === 'skills' ? ' boton--acento' : '')}
              onClick={() => onVista('skills')}
            >
              Panel de skills
            </button>
            <button
              class={'boton' + (vista === 'simulacro' ? ' boton--acento' : '')}
              onClick={() => onVista('simulacro')}
            >
              Simulacro
            </button>
          </div>
        </div>

        <nav class="tabs" role="tablist" aria-label="Guías de ejercicios">
          {GUIAS.map((n) => (
            <button
              key={n}
              class="tab"
              role="tab"
              aria-selected={vista === 'guia' && guiaActiva === n}
              onClick={() => {
                onGuia(n)
                onVista('guia')
              }}
            >
              Guía {n}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
