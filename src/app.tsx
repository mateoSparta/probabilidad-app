import { useEffect, useMemo, useState } from 'preact/hooks'

import { Cabecera } from './componentes/Cabecera'
import { config, ejercicioPorId, skillsConItems, skillsDeItem } from './datos/contenido'
import { usarProgreso } from './datos/usarProgreso'
import { usarRuta } from './datos/usarRuta'
import { usarSesion } from './datos/usarSesion'
import { armarPlan } from './dominio/ritmo'
import { PanelSkills } from './vistas/PanelSkills'
import { VistaGuia } from './vistas/VistaGuia'
import { VistaMenu } from './vistas/VistaMenu'
import { VistaSeguimiento } from './vistas/VistaSeguimiento'
import { VistaSimulacro } from './vistas/VistaSimulacro'

export function App() {
  const { ruta, ir } = usarRuta()
  // El progreso es el historial (insignias); la sesión es dónde quedaste.
  const api = usarProgreso()
  const sesion = usarSesion()
  /** Ejercicio al que hay que bajar cuando se dibuje su guía. */
  const [destino, setDestino] = useState<string | null>(null)

  // El plan depende del progreso, así que se recalcula cuando cambia.
  const plan = useMemo(
    () => armarPlan(api.progreso, skillsConItems(), skillsDeItem, config),
    [api.progreso],
  )

  // Al cambiar de sección o de guía la página arranca desde arriba, salvo que
  // se esté yendo a un ejercicio puntual: de eso se encarga VistaGuia.
  useEffect(() => {
    if (!destino) scrollTo(0, 0)
  }, [ruta.seccion, ruta.guia])

  /** Lleva a un ejercicio desde cualquier sección: abre su guía y baja. */
  function irAEjercicio(id: string): void {
    const ej = ejercicioPorId.get(id)
    if (!ej) return
    setDestino(id)
    ir({ seccion: 'ejercicios', guia: ej.guia })
  }

  return (
    <>
      <Cabecera ruta={ruta} plan={plan} />
      <main class="columna">
        {/* La key hace que cada cambio de sección (o de guía) monte la vista
            de cero, y con eso se repite la animación de entrada. */}
        <div
          class="vista"
          key={ruta.seccion === 'ejercicios' ? `ejercicios-${ruta.guia}` : ruta.seccion}
        >
          {ruta.seccion === 'menu' && (
            <VistaMenu guia={ruta.guia} api={api} sesion={sesion} plan={plan} />
          )}
          {ruta.seccion === 'ejercicios' && (
            // La key fuerza a montar la guía de cero al cambiar de pestaña: así
            // no se arrastra estado de una guía a otra (tags fijos, por ejemplo).
            <VistaGuia
              key={ruta.guia}
              numero={ruta.guia}
              sesion={sesion}
              onIntento={api.registrar}
              destino={destino}
              onDestinoAlcanzado={() => setDestino(null)}
            />
          )}
          {ruta.seccion === 'skills' && (
            <PanelSkills api={api} sesion={sesion} onIrAEjercicio={irAEjercicio} />
          )}
          {ruta.seccion === 'simulacro' && <VistaSimulacro api={api} sesion={sesion} />}
          {ruta.seccion === 'seguimiento' && (
            <VistaSeguimiento plan={plan} sesion={sesion} onIrAEjercicio={irAEjercicio} />
          )}
        </div>
      </main>
    </>
  )
}
