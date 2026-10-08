import { useState } from 'preact/hooks'

import { Cabecera } from './componentes/Cabecera'
import { usarProgreso } from './datos/usarProgreso'
import { PanelSkills } from './vistas/PanelSkills'
import { VistaGuia } from './vistas/VistaGuia'

export type Vista = 'guia' | 'simulacro' | 'skills'

export function App() {
  const [vista, setVista] = useState<Vista>('guia')
  const [guia, setGuia] = useState(1)
  const api = usarProgreso()

  return (
    <>
      <Cabecera vista={vista} guiaActiva={guia} onVista={setVista} onGuia={setGuia} />
      <main class="columna">
        {vista === 'guia' && <VistaGuia numero={guia} onIntento={api.registrar} />}
        {vista === 'skills' && <PanelSkills api={api} />}
        {vista === 'simulacro' && <p class="vacio">El modo simulacro llega en la fase 5.</p>}
      </main>
    </>
  )
}
