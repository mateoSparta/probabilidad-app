import { useState } from 'preact/hooks'

import { Cabecera } from './componentes/Cabecera'
import { usarProgreso } from './datos/usarProgreso'
import { usarSesion } from './datos/usarSesion'
import { PanelSkills } from './vistas/PanelSkills'
import { VistaGuia } from './vistas/VistaGuia'
import { VistaSimulacro } from './vistas/VistaSimulacro'

export type Vista = 'guia' | 'simulacro' | 'skills'

export function App() {
  const [vista, setVista] = useState<Vista>('guia')
  const [guia, setGuia] = useState(1)
  // El progreso es el historial (insignias); la sesión es dónde quedaste.
  const api = usarProgreso()
  const sesion = usarSesion()

  return (
    <>
      <Cabecera vista={vista} guiaActiva={guia} onVista={setVista} onGuia={setGuia} />
      <main class="columna">
        {vista === 'guia' && (
          <VistaGuia numero={guia} sesion={sesion} onIntento={api.registrar} />
        )}
        {vista === 'skills' && <PanelSkills api={api} sesion={sesion} />}
        {vista === 'simulacro' && <VistaSimulacro api={api} sesion={sesion} />}
      </main>
    </>
  )
}
