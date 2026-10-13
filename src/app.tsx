import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

import { Accesos } from './componentes/Accesos'
import { Cabecera } from './componentes/Cabecera'
import { Globo } from './componentes/Globo'
import {
  config,
  destinoDeSkill,
  ejercicioPorId,
  skillsConItems,
  skillsDeItem,
} from './datos/contenido'
import { ContextoEvaluaciones, usarFechas } from './datos/usarFechas'
import { usarProgreso } from './datos/usarProgreso'
import { usarRuta } from './datos/usarRuta'
import { usarSesion } from './datos/usarSesion'
import { armarPlan } from './dominio/ritmo'
import type { Ruta } from './dominio/ruta'
import { PanelHabilidades } from './vistas/PanelHabilidades'
import { VistaDistribuciones } from './vistas/VistaDistribuciones'
import { VistaMachete } from './vistas/VistaMachete'
import { VistaGuia } from './vistas/VistaGuia'
import { VistaMenu } from './vistas/VistaMenu'
import { VistaSeguimiento } from './vistas/VistaSeguimiento'
import { VistaSimulacro } from './vistas/VistaSimulacro'

export function App() {
  const { ruta, ir } = usarRuta()
  // El progreso es el historial (insignias); la sesión es dónde quedaste.
  const api = usarProgreso()
  const sesion = usarSesion()
  /** El ancla (ejercicio o teoría) a la que hay que bajar cuando se dibuje su guía. */
  const [destino, setDestino] = useState<string | null>(null)

  // Las evaluaciones, con las fechas que el usuario haya cambiado, y el objetivo.
  const evaluaciones = usarFechas()

  // El plan depende del progreso, de las fechas y del objetivo, así que se
  // recalcula cuando cambian.
  const plan = useMemo(
    () =>
      armarPlan(api.progreso, skillsConItems(), skillsDeItem, {
        ...config,
        evaluaciones: [...evaluaciones.evaluaciones],
        objetivo: evaluaciones.objetivo?.nombre ?? null,
      }),
    [api.progreso, evaluaciones],
  )

  // Al pasar de una guía a otra, la página entra de costado: desde la derecha
  // si la nueva es posterior, desde la izquierda si es anterior. Se calcula
  // una vez por cambio de ruta y se conserva en los demás renders, porque
  // cambiar la clase reiniciaría la animación.
  const ultima = useRef<{ ruta: Ruta; entrada: string }>({ ruta, entrada: '' })
  if (ultima.current.ruta !== ruta) {
    const antes = ultima.current.ruta
    const entreGuias = antes.seccion === 'ejercicios' && ruta.seccion === 'ejercicios' && antes.guia !== ruta.guia
    ultima.current = {
      ruta,
      entrada: entreGuias ? (ruta.guia > antes.guia ? ' vista--desde-derecha' : ' vista--desde-izquierda') : '',
    }
  }

  // Al cambiar de sección o de guía la página arranca desde arriba, salvo que
  // se esté yendo a un ejercicio puntual: de eso se encarga VistaGuia.
  useEffect(() => {
    if (!destino) scrollTo(0, 0)
  }, [ruta.seccion, ruta.guia])

  /** Abre una guía y baja hasta un ancla de su página. */
  function irAAncla(guia: number, ancla: string): void {
    setDestino(ancla)
    ir({ seccion: 'ejercicios', guia })
  }

  /** Lleva a un ejercicio desde cualquier sección. */
  function irAEjercicio(id: string): void {
    const ej = ejercicioPorId.get(id)
    if (ej) irAAncla(ej.guia, 'ej-' + id)
  }

  /** Lleva a la teoría de un skill (o a su primer ejercicio, si no tiene teoría). */
  function irASkill(id: string): void {
    const d = destinoDeSkill.get(id)
    if (d) irAAncla(d.guia, d.ancla)
  }

  return (
    <ContextoEvaluaciones.Provider value={evaluaciones}>
      <Cabecera ruta={ruta} plan={plan} />
      <main class="columna">
        {/* La key hace que cada cambio de sección (o de guía) monte la vista
            de cero, y con eso se repite la animación de entrada. */}
        <div
          class={'vista vista--' + ruta.seccion + ultima.current.entrada}
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
          {ruta.seccion === 'habilidades' && (
            <PanelHabilidades
              api={api}
              sesion={sesion}
              onIrAEjercicio={irAEjercicio}
              onIrASkill={irASkill}
            />
          )}
          {ruta.seccion === 'simulacro' && <VistaSimulacro api={api} sesion={sesion} />}
          {ruta.seccion === 'machete' && <VistaMachete />}
          {ruta.seccion === 'distribuciones' && <VistaDistribuciones />}
          {ruta.seccion === 'seguimiento' && (
            <VistaSeguimiento plan={plan} sesion={sesion} onIrAEjercicio={irAEjercicio} />
          )}
        </div>
      </main>
      <Accesos visible={ruta.seccion === 'menu'} />
      <Globo />
    </ContextoEvaluaciones.Provider>
  )
}
