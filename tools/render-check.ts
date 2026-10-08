/**
 * Renderiza la app de verdad y revisa el HTML que sale.
 *
 * Que `npm run check` y `npm run build` pasen no garantiza que la página se
 * dibuje: un error en tiempo de render no aparece ni en el typecheck ni en el
 * bundle. Este script monta un servidor Vite en modo SSR (que es lo que
 * resuelve `import.meta.glob`), renderiza los componentes a texto y verifica
 * que esté lo que tiene que estar.
 *
 * Uso:  npm run render-check
 */
import { createElement } from 'preact'
import { render } from 'preact-render-to-string'
import { createServer } from 'vite'

const fallas: string[] = []
let ok = 0

function afirmar(cond: boolean, mensaje: string) {
  if (cond) ok++
  else fallas.push(mensaje)
}

const servidor = await createServer({
  // `hmr: false` porque esto es SSR y no necesita el WebSocket de recarga:
  // si queda prendido, choca de puerto con un `npm run dev` abierto.
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  logLevel: 'warn',
})

try {
  const { VistaGuia } = await servidor.ssrLoadModule('/src/vistas/VistaGuia.tsx')
  const { Cabecera } = await servidor.ssrLoadModule('/src/componentes/Cabecera.tsx')
  const contenido = await servidor.ssrLoadModule('/src/datos/contenido.ts')

  // --- el contenido se cargó ---
  afirmar(contenido.skills.length > 0, 'no se cargó ningún skill')
  afirmar(contenido.ejercicios.length > 0, 'no se cargó ningún ejercicio')
  afirmar(contenido.teoria.length > 0, 'no se cargó ningún bloque de teoría')
  afirmar(contenido.guias.length > 0, 'no se cargó ninguna guía')
  afirmar(
    contenido.guiaTieneContenido(1),
    'la guía 1 quedó sin contenido: la secuencia no resolvió',
  )

  // --- la cabecera ---
  const cabecera = render(
    createElement(Cabecera, {
      vista: 'guia',
      guiaActiva: 1,
      onVista: () => {},
      onGuia: () => {},
    }),
  )
  for (let n = 1; n <= 8; n++) {
    afirmar(cabecera.includes(`Guía ${n}`), `falta la tab de la guía ${n}`)
  }
  afirmar(cabecera.includes('Simulacro'), 'falta el botón Simulacro')
  afirmar(cabecera.includes('Panel de skills'), 'falta el botón Panel de skills')

  // --- la guía 1 ---
  const html = render(createElement(VistaGuia, { numero: 1 }))

  afirmar(html.includes('Espacios de probabilidad'), 'no se ve el título de la guía')
  afirmar(html.includes('class="chip'), 'no se ven los chips de skills')
  afirmar(html.includes('class="teoria"'), 'no se ve ningún bloque de teoría')
  afirmar(html.includes('class="tarjeta"'), 'no se ve ninguna tarjeta de ejercicio')

  // KaTeX tiene que haber corrido: si no, quedaría el `$...$` crudo.
  afirmar(html.includes('katex'), 'KaTeX no renderizó nada')
  afirmar(!html.includes('mate-roto'), 'hay LaTeX que KaTeX no pudo parsear')

  // Cada ejercicio de la secuencia tiene que estar, con su número.
  const guia = contenido.guiaPorNumero.get(1)
  for (const paso of guia.secuencia) {
    if (paso.tipo !== 'ejercicio') continue
    const ej = contenido.ejercicioPorId.get(paso.id)
    afirmar(html.includes(`>${ej.numero}<`), `no se ve el número del ejercicio ${ej.numero}`)
    afirmar(html.includes(`id="ej-${ej.id}"`), `no se ve la tarjeta de ${ej.id}`)
  }

  // Los cuatro tipos de respuesta tienen que dibujar su entrada.
  afirmar(html.includes('class="entrada"'), 'no se ve ningún input de respuesta numérica')
  afirmar(html.includes('type="radio"'), 'no se ve ninguna opción múltiple')
  afirmar(html.includes('class="checkpoints"'), 'no se ve ningún bloque de checkpoints')
  afirmar(
    html.includes('en función de'),
    'no se ve el placeholder del tipo expresión',
  )

  // Las ayudas tienen que estar disponibles, y los tags NO: están ocultos
  // hasta resolver (PLAN.md §3).
  afirmar(html.includes('Comprobar'), 'no se ve el botón Comprobar')
  afirmar(html.includes('Ver respuesta'), 'no se ve el botón Ver respuesta')
  afirmar(html.includes('Pistas ('), 'no se ve el botón de pistas')
  afirmar(!html.includes('class="tags"'), 'los tags se ven sin haber resuelto nada')

  // Y la respuesta no puede estar en el HTML inicial.
  afirmar(
    !html.includes('class="respuesta"'),
    'la respuesta aparece en el HTML sin haberla pedido',
  )

  // Una guía sin contenido tiene que avisar, no explotar. Se busca cuál está
  // vacía en vez de fijar un número: a medida que se cargan guías, el número
  // cambia.
  const sinContenido = [1, 2, 3, 4, 5, 6, 7, 8].find(
    (n) => !contenido.guiaTieneContenido(n),
  )
  if (sinContenido === undefined) {
    console.log('  (todas las guías tienen contenido: no se probó el caso vacío)')
  } else {
    const vacia = render(createElement(VistaGuia, { numero: sinContenido }))
    afirmar(
      vacia.includes('todavía no tiene contenido'),
      `la guía ${sinContenido} está vacía y no avisa`,
    )
  }

  // --- panel de skills (fase 3) ---
  const { PanelSkills } = await servidor.ssrLoadModule('/src/vistas/PanelSkills.tsx')
  const progresoMod = await servidor.ssrLoadModule('/src/dominio/progreso.ts')

  const api = (p: unknown) => ({
    progreso: p,
    registrar: () => {},
    reemplazar: () => {},
    reiniciar: () => {},
  })

  // Sin progreso: todo sin explorar.
  const limpio = render(createElement(PanelSkills, { api: api(progresoMod.PROGRESO_VACIO) }))
  afirmar(limpio.includes('Panel de skills'), 'el panel no se dibuja')
  afirmar(limpio.includes('class="grilla-skills"'), 'no se ve la grilla de skills')
  afirmar(limpio.includes('estado--sin_explorar'), 'sin intentos no se ve ningún sin_explorar')
  afirmar(limpio.includes('Exportar JSON') && limpio.includes('Importar JSON'),
    'faltan los botones de exportar o importar')

  // Con tres intentos limpios de un skill, tiene que aparecer la insignia.
  let sembrado = progresoMod.PROGRESO_VACIO
  const itemsLaplace = [...(contenido.itemsPorSkill.get('laplace') ?? [])].slice(0, 3)
  afirmar(itemsLaplace.length === 3, 'el skill laplace no tiene al menos 3 ítems para sembrar')
  itemsLaplace.forEach((item: string, i: number) => {
    sembrado = progresoMod.agregar(
      sembrado,
      {
        item,
        ts: `2026-03-0${i + 1}T12:00:00.000Z`,
        envios: 1,
        correcto: true,
        pistas: 0,
        revelo: false,
      },
      true,
    )
  })
  const conInsignia = render(createElement(PanelSkills, { api: api(sembrado) }))
  afirmar(conInsignia.includes('estado--dominado'), 'tres limpios no pintan el skill como dominado')
  afirmar(conInsignia.includes('3/3 limpios'), 'no se ve el avance de limpios')

  // Y el detalle de un skill tiene que abrir sin explotar.
  afirmar(
    progresoMod.estadoSkill(sembrado, contenido.itemsPorSkill.get('laplace')) === 'dominado',
    'el estado sembrado no quedó dominado',
  )

  // --- persistencia de la sesión ---
  const sesionMod = await servidor.ssrLoadModule('/src/dominio/sesion.ts')

  /** Una ApiSesion de mentira, sobre una sesión fija. */
  const apiSesion = (s: unknown) => ({
    sesion: s,
    item: (clave: string) => sesionMod.itemDeSesion(s, clave),
    anotarItem: () => {},
    reiniciarItem: () => {},
    anotarSimulacro: () => {},
    reiniciar: () => {},
  })

  // Con el ítem (a) del 1.4 ya resuelto, al volver a la guía tiene que
  // aparecer resuelto, con sus tags y con el botón de reintentar.
  const conItemHecho = sesionMod.guardarItem(sesionMod.SESION_VACIA, 'g1-04:a', {
    estado: 'correcto',
    envios: 1,
    entrada: '1/6',
    pistasAbiertas: 0,
  })
  const guiaRetomada = render(
    createElement(VistaGuia, { numero: 1, sesion: apiSesion(conItemHecho) }),
  )
  afirmar(guiaRetomada.includes('item item--correcto'), 'el ítem resuelto no vuelve resuelto')
  afirmar(guiaRetomada.includes('Reintentar'), 'no se ve el botón de reintentar')
  afirmar(guiaRetomada.includes('value="1/6"'), 'no se recuperó lo tipeado')
  afirmar(guiaRetomada.includes('class="tags"'), 'con un ítem resuelto no aparecen los tags')
  // El resto de los ítems tiene que seguir pendiente.
  afirmar(guiaRetomada.includes('item item--pendiente'), 'se marcaron resueltos ítems que no lo estaban')

  // --- simulacro (fase 5) ---
  const { VistaSimulacro } = await servidor.ssrLoadModule('/src/vistas/VistaSimulacro.tsx')

  afirmar(contenido.examenes.length > 0, 'no se cargó ningún examen')

  const simulacro = render(
    createElement(VistaSimulacro, {
      api: api(progresoMod.PROGRESO_VACIO),
      sesion: apiSesion(sesionMod.SESION_VACIA),
    }),
  )
  afirmar(simulacro.includes('Simulacro'), 'la pantalla de simulacro no se dibuja')
  afirmar(simulacro.includes('Empezar simulacro'), 'no se ve el botón de empezar')
  afirmar(simulacro.includes('240'), 'la duración por defecto no es 240 minutos')
  afirmar(simulacro.includes('Incluir integradoras'), 'falta el toggle de integradoras')
  afirmar(simulacro.includes('Exámenes en el pool'), 'no se lista el pool')
  // Arranca en la pantalla de configuración: no puede haber un enunciado
  // de examen visible antes de empezar.
  afirmar(
    !simulacro.includes('class="reloj'),
    'el reloj aparece antes de empezar el simulacro',
  )

  // Un simulacro guardado y sin vencer tiene que retomarse al volver.
  const unExamen = contenido.examenes.find(
    (e: { id: string }) => contenido.examenPorId.get(e.id),
  )
  const enCurso = sesionMod.guardarSimulacro(sesionMod.SESION_VACIA, {
    examenId: unExamen.id,
    terminaEn: Date.now() + 90 * 60_000,
    entregado: false,
    correctos: {},
  })
  const retomado = render(
    createElement(VistaSimulacro, {
      api: api(progresoMod.PROGRESO_VACIO),
      sesion: apiSesion(enCurso),
    }),
  )
  afirmar(retomado.includes('class="reloj'), 'el simulacro guardado no se retoma')
  afirmar(retomado.includes('Entregar'), 'al retomar no se ve el botón de entregar')
  afirmar(retomado.includes('1:30:00'), `el reloj retomado no marca 1:30:00`)
  // Mientras se rinde no hay pistas ni ver respuesta.
  afirmar(!retomado.includes('Ver respuesta'), 'en el simulacro se ve "Ver respuesta"')
  afirmar(!retomado.includes('Pistas ('), 'en el simulacro se ven las pistas')

  // Y uno vencido mientras no estabas vuelve ya entregado, con la nota.
  const vencido = sesionMod.guardarSimulacro(sesionMod.SESION_VACIA, {
    examenId: unExamen.id,
    terminaEn: Date.now() - 1000,
    entregado: false,
    correctos: {},
  })
  const tarde = render(
    createElement(VistaSimulacro, {
      api: api(progresoMod.PROGRESO_VACIO),
      sesion: apiSesion(vencido),
    }),
  )
  afirmar(tarde.includes('entregado'), 'un simulacro vencido no vuelve entregado')
  afirmar(tarde.includes('class="nota"'), 'un simulacro vencido no muestra la nota')
  afirmar(tarde.includes('Ver respuesta'), 'tras entregar no vuelven las ayudas')

  console.log(`render-check: ${ok} afirmaciones OK.`)
  for (const f of fallas) console.error(`  ✗ ${f}`)
  if (fallas.length > 0) {
    console.error(`\nrender-check: ${fallas.length} falla(s).`)
    process.exitCode = 1
  } else {
    console.log('render-check: la página se dibuja completa.')
  }
} finally {
  await servidor.close()
}
