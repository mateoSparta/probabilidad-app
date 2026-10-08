import { useState } from 'preact/hooks'
import { Cabecera } from './componentes/Cabecera'

export type Vista = 'guia' | 'simulacro' | 'skills'

export function App() {
  const [vista, setVista] = useState<Vista>('guia')
  const [guia, setGuia] = useState(1)

  return (
    <>
      <Cabecera vista={vista} guiaActiva={guia} onVista={setVista} onGuia={setGuia} />
      <main class="columna">
        {vista === 'guia' && <p class="vacio">Guía {guia}: todavía no hay contenido cargado.</p>}
        {vista === 'skills' && <p class="vacio">El panel de skills llega en la fase 3.</p>}
        {vista === 'simulacro' && <p class="vacio">El modo simulacro llega en la fase 5.</p>}
      </main>
    </>
  )
}
