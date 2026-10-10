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
    createElement(Cabecera, { ruta: { seccion: 'ejercicios', guia: 1 } }),
  )
  for (let n = 1; n <= 8; n++) {
    afirmar(cabecera.includes(`Guía ${n}`), `falta la pestaña de la guía ${n}`)
    afirmar(cabecera.includes(`href="#/ejercicios/${n}"`), `la pestaña ${n} no enlaza a su guía`)
  }
  afirmar(
    /<a href="#\/"[^>]*>Probabilidad y Estadística B<\/a>/.test(cabecera),
    'el título del encabezado no lleva al menú',
  )
  afirmar(
    /class="migas__actual"[^>]*>.*Ejercicios/.test(cabecera),
    'las migas no muestran la sección actual',
  )
  // Los botones de la esquina se reemplazaron por el menú principal.
  afirmar(!cabecera.includes('Panel de skills'), 'volvió el botón "Panel de skills"')
  afirmar(!cabecera.includes('cabecera__acciones'), 'volvieron los botones de la esquina')

  // Las pestañas de las guías sólo existen en Ejercicios.
  for (const seccion of ['menu', 'skills', 'simulacro', 'seguimiento']) {
    const otra = render(createElement(Cabecera, { ruta: { seccion, guia: 1 } }))
    afirmar(!otra.includes('class="barra-guias"'), `en ${seccion} se ven las pestañas de guías`)
  }
  const enMenu = render(createElement(Cabecera, { ruta: { seccion: 'menu', guia: 1 } }))
  afirmar(!enMenu.includes('migas__actual'), 'en el menú las migas muestran una sección')

  // --- la guía 1 ---
  const html = render(createElement(VistaGuia, { numero: 1 }))

  afirmar(html.includes('Espacios de probabilidad'), 'no se ve el título de la guía')
  afirmar(html.includes('class="teoria"'), 'no se ve ningún bloque de teoría')
  afirmar(html.includes('class="tarjeta"'), 'no se ve ninguna tarjeta de ejercicio')

  // Los chips que filtraban por skill se reemplazaron por el mapa de
  // círculos; si volvieran, es que alguien revirtió el cambio.
  afirmar(!html.includes('class="chip'), 'volvieron los chips de filtro')
  afirmar(html.includes('class="mapa"'), 'no se ve el mapa de ejercicios')
  afirmar(html.includes('class="indice"'), 'no se ve el índice lateral')
  afirmar(html.includes('class="volver"'), 'no se ve el enlace de volver al inicio')
  afirmar(html.includes('volver al inicio'), 'el pie no dice "volver al inicio"')
  afirmar(html.includes('id="arriba"'), 'falta el ancla a la que vuelve el pie')

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

  // Los botones van en la grilla que reparte el ancho, y cada uno con ícono.
  afirmar(html.includes('class="botonera"'), 'los botones no están en la botonera')
  const botonesConIcono = (html.match(/class="boton[^"]*boton--icono"><svg class="icono"/g) ?? [])
    .length
  afirmar(botonesConIcono > 0, 'los botones de los ítems no llevan ícono')
  afirmar(!html.includes('boton--fantasma'), 'quedaron botones sin borde en los ítems')

  // La puntuación pegada a una fórmula va adentro de ella (componentes/latex.ts).
  afirmar(html.includes('class="puntuacion"'), 'ninguna puntuación entró en su fórmula')

  // Y la respuesta no puede estar en el HTML inicial.
  afirmar(
    !html.includes('class="respuesta"'),
    'la respuesta aparece en el HTML sin haberla pedido',
  )

  // Todas las guías cargadas tienen que dibujarse enteras: el título, los
  // chips, al menos un bloque de teoría y todos los ejercicios de su
  // secuencia, con KaTeX corrido y sin LaTeX roto.
  for (const g of contenido.guias) {
    const vista = render(createElement(VistaGuia, { numero: g.numero }))
    afirmar(vista.includes(g.titulo), `guía ${g.numero}: no se ve el título`)
    afirmar(vista.includes('class="mapa"'), `guía ${g.numero}: no se ve el mapa`)
    afirmar(vista.includes('class="indice"'), `guía ${g.numero}: no se ve el índice`)
    afirmar(vista.includes('class="teoria"'), `guía ${g.numero}: no se ve teoría`)
    // Un círculo por ejercicio de la secuencia.
    const ejerciciosDeLaGuia = g.secuencia.filter(
      (p: { tipo: string }) => p.tipo === 'ejercicio',
    ).length
    const puntos = (vista.match(/class="punto punto--/g) ?? []).length
    afirmar(
      puntos === ejerciciosDeLaGuia,
      `guía ${g.numero}: hay ${puntos} círculos para ${ejerciciosDeLaGuia} ejercicios`,
    )
    // Cada tema del índice tiene que apuntar a un ancla que exista.
    for (const paso of g.secuencia) {
      if (paso.tipo !== 'teoria') continue
      afirmar(
        vista.includes(`id="${paso.id}"`),
        `guía ${g.numero}: falta el ancla del tema ${paso.id}`,
      )
    }
    afirmar(!vista.includes('mate-roto'), `guía ${g.numero}: hay LaTeX que KaTeX no parseó`)
    for (const paso of g.secuencia) {
      if (paso.tipo !== 'ejercicio') continue
      afirmar(
        vista.includes(`id="ej-${paso.id}"`),
        `guía ${g.numero}: no se ve la tarjeta de ${paso.id}`,
      )
    }
  }

  // Una guía sin contenido tiene que avisar, no explotar. Se busca cuál está
  // vacía en vez de fijar un número, porque a medida que se cargan guías el
  // número cambia. Con las ocho cargadas se usa una que no existe.
  const sinContenido =
    [1, 2, 3, 4, 5, 6, 7, 8].find((n) => !contenido.guiaTieneContenido(n)) ?? 99
  const vacia = render(createElement(VistaGuia, { numero: sinContenido }))
  afirmar(
    vacia.includes('todavía no tiene contenido'),
    `la guía ${sinContenido} está vacía y no avisa`,
  )

  // --- tablas de la teoría ---
  const { Teoria } = await servidor.ssrLoadModule('/src/componentes/Teoria.tsx')
  const conTabla = contenido.teoria.find((t: { cuerpo: string }) => /^\|.*\|\s*$/m.test(t.cuerpo))
  afirmar(!!conTabla, 'no hay ningún bloque de teoría con tabla para probar')
  if (conTabla) {
    const tabla = render(createElement(Teoria, { bloque: conTabla }))
    afirmar(tabla.includes('<div class="tabla"><table>'), 'la tabla no va en su contenedor centrado')
    afirmar(/<td[^>]*>.*class="katex/.test(tabla), 'las fórmulas de la tabla no se renderizaron')
  }

  // --- menú principal ---
  const { VistaMenu } = await servidor.ssrLoadModule('/src/vistas/VistaMenu.tsx')
  const { VistaSeguimiento } = await servidor.ssrLoadModule('/src/vistas/VistaSeguimiento.tsx')
  const ritmoMenu = await servidor.ssrLoadModule('/src/dominio/ritmo.ts')
  const progresoMenu = await servidor.ssrLoadModule('/src/dominio/progreso.ts')
  const sesionMenu = await servidor.ssrLoadModule('/src/dominio/sesion.ts')
  const planMenu = ritmoMenu.armarPlan(
    progresoMenu.PROGRESO_VACIO,
    contenido.skillsConItems(),
    contenido.skillsDeItem,
    contenido.config,
    new Date('2026-10-08T10:00:00'),
  )
  const sesionVacia = {
    sesion: sesionMenu.SESION_VACIA,
    item: (c: string) => sesionMenu.itemDeSesion(sesionMenu.SESION_VACIA, c),
    anotarItem: () => {},
    reiniciarItem: () => {},
    anotarSimulacro: () => {},
    reiniciar: () => {},
  }
  const menu = render(
    createElement(VistaMenu, {
      guia: 3,
      api: { progreso: progresoMenu.PROGRESO_VACIO },
      sesion: sesionVacia,
      plan: planMenu,
    }),
  )
  for (const [nombre, href] of [
    ['Ejercicios', '#/ejercicios/3'],
    ['Skills', '#/skills'],
    ['Simulacro', '#/simulacro'],
    ['Seguimiento', '#/seguimiento'],
  ]) {
    afirmar(menu.includes(`>${nombre}<`), `el menú no tiene la opción ${nombre}`)
    afirmar(menu.includes(`href="${href}"`), `la opción ${nombre} no lleva a ${href}`)
  }
  afirmar(
    menu.includes(`0 de ${contenido.ejercicios.length} ejercicios resueltos`),
    'el menú no resume los ejercicios resueltos',
  )

  // --- seguimiento ---
  const seguimiento = render(
    createElement(VistaSeguimiento, {
      plan: planMenu,
      sesion: sesionVacia,
      onIrAEjercicio: () => {},
    }),
  )
  afirmar(seguimiento.includes('class="ritmo'), 'Seguimiento no muestra el recuadro del ritmo')
  afirmar(seguimiento.includes('class="leyenda"'), 'Seguimiento no explica los colores')
  const puntosSeguimiento = (seguimiento.match(/class="punto punto--/g) ?? []).length
  // La leyenda suma cuatro círculos de muestra.
  afirmar(
    puntosSeguimiento === contenido.ejercicios.length + 4,
    `Seguimiento muestra ${puntosSeguimiento - 4} círculos para ${contenido.ejercicios.length} ejercicios`,
  )
  for (const g of contenido.guias) {
    if (!contenido.guiaTieneContenido(g.numero)) continue
    afirmar(seguimiento.includes(`Guía ${g.numero}</span>`), `Seguimiento no agrupa la guía ${g.numero}`)
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
  // El recuadro del ritmo se mudó a Seguimiento.
  afirmar(!limpio.includes('class="ritmo'), 'el panel de skills sigue mostrando el ritmo')

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
  // Los tags van debajo del enunciado y antes de los ítems, no al final.
  const tarjeta04 = guiaRetomada.slice(
    guiaRetomada.indexOf('id="ej-g1-04"'),
    guiaRetomada.indexOf('</article>', guiaRetomada.indexOf('id="ej-g1-04"')),
  )
  const posEnunciado = tarjeta04.indexOf('class="enunciado"')
  const posTags = tarjeta04.indexOf('class="tags"')
  const posItems = tarjeta04.indexOf('class="items"')
  afirmar(
    posEnunciado >= 0 && posEnunciado < posTags && posTags < posItems,
    'los tags no quedaron entre el enunciado y los ítems',
  )
  // Cada tag que se ve tiene que resaltar algo: su skill está marcado en el
  // enunciado o en alguna pregunta de la tarjeta.
  for (const m of tarjeta04.matchAll(/class="tag[^"]*"[^>]*>([^<]+)</g)) {
    const nombre = m[1]
    const skill = contenido.skills.find((s: { nombre: string }) => s.nombre === nombre)
    afirmar(!!skill, `el tag "${nombre}" no corresponde a ningún skill`)
    if (skill) {
      afirmar(
        new RegExp(`data-skills="[^"]*\\b${skill.id}\\b`).test(tarjeta04),
        `el tag "${nombre}" no tiene ningún fragmento que resaltar`,
      )
    }
  }
  // El resto de los ítems tiene que seguir pendiente.
  afirmar(guiaRetomada.includes('item item--pendiente'), 'se marcaron resueltos ítems que no lo estaban')

  // --- todos los tags señalan algo ---
  // Con todos los ítems resueltos aparecen todos los tags. Cada uno tiene que
  // tener al menos un fragmento marcado en su tarjeta: si no, el hover y el
  // clic no resaltarían nada.
  let tagsRevisados = 0
  for (const g of contenido.guias) {
    let todoResuelto = sesionMod.SESION_VACIA
    for (const paso of g.secuencia) {
      if (paso.tipo !== 'ejercicio') continue
      const ej = contenido.ejercicioPorId.get(paso.id)
      for (const it of ej.items) {
        todoResuelto = sesionMod.guardarItem(todoResuelto, `${ej.id}:${it.id}`, {
          estado: 'correcto',
          envios: 1,
          pistasAbiertas: 0,
        })
      }
    }
    const vista = render(createElement(VistaGuia, { numero: g.numero, sesion: apiSesion(todoResuelto) }))
    for (const tarjeta of vista.split('<article').slice(1)) {
      const id = tarjeta.match(/id="ej-([^"]+)"/)?.[1] ?? '?'
      for (const m of tarjeta.matchAll(/<button class="tag[^"]*"[^>]*>([^<]+)</g)) {
        const skill = contenido.skills.find((s: { nombre: string }) => s.nombre === m[1])
        tagsRevisados++
        afirmar(
          !!skill && new RegExp(`data-skills="([^"]* )?${skill.id}( [^"]*)?"`).test(tarjeta),
          `${id}: el tag "${m[1]}" no tiene ningún fragmento que resaltar`,
        )
      }
    }
  }
  afirmar(tagsRevisados > 100, `se revisaron sólo ${tagsRevisados} tags: el render no los mostró`)

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

  // --- aviso del parcial y ritmo ---
  const ritmoMod = await servidor.ssrLoadModule('/src/dominio/ritmo.ts')
  const { AvisoParcialCompacto, AvisoParcialDetalle } = await servidor.ssrLoadModule(
    '/src/componentes/AvisoParcial.tsx',
  )

  const skillsReales = contenido.skillsConItems()
  const hoy = new Date('2026-10-08T10:00:00')

  const planVacio = ritmoMod.armarPlan(
    progresoMod.PROGRESO_VACIO,
    skillsReales,
    contenido.skillsDeItem,
    contenido.config,
    hoy,
  )

  // El aviso compacto dice la fecha y los días, y nada más: es lo que se ve
  // siempre, así que tiene que ser corto.
  const avisoCompacto = render(createElement(AvisoParcialCompacto, { plan: planVacio }))
  afirmar(avisoCompacto.includes('Parcial 30/10'), 'el aviso compacto no dice la fecha')
  afirmar(avisoCompacto.includes('faltan 22 días'), `el aviso compacto dice: ${avisoCompacto}`)
  afirmar(avisoCompacto.includes('ritmo--'), 'el aviso compacto no lleva el tono del ritmo')

  // El detalle da la cuenta completa.
  const detalleRitmo = render(createElement(AvisoParcialDetalle, { plan: planVacio }))
  afirmar(detalleRitmo.includes('Todavía no empezaste'), 'el detalle no avisa que no se empezó')
  afirmar(detalleRitmo.includes('skills dominados'), 'el detalle no muestra los skills dominados')
  afirmar(
    detalleRitmo.includes(String(planVacio.porDia)),
    'el detalle no muestra el ritmo necesario por día',
  )
  afirmar(
    planVacio.itemsFaltantes > 0 && planVacio.itemsFaltantes < 113,
    `los ítems faltantes dieron ${planVacio.itemsFaltantes}: tendrían que ser menos que el total`,
  )
  afirmar(
    planVacio.ejerciciosFaltantes <= 53,
    'los ejercicios faltantes superan el total cargado',
  )

  // Con la fecha pasada avisa, no explota.
  const planVencido = ritmoMod.armarPlan(
    progresoMod.PROGRESO_VACIO,
    skillsReales,
    contenido.skillsDeItem,
    contenido.config,
    new Date('2026-12-01'),
  )
  const vistaVencida = render(createElement(AvisoParcialDetalle, { plan: planVencido }))
  afirmar(vistaVencida.includes('ya pasó'), 'con la fecha pasada el detalle no avisa')

  // El encabezado lleva el aviso, entre las migas y las pestañas.
  const cabeceraConPlan = render(
    createElement(Cabecera, { ruta: { seccion: 'ejercicios', guia: 1 }, plan: planVacio }),
  )
  const posAviso = cabeceraConPlan.indexOf('class="aviso-parcial')
  afirmar(posAviso >= 0, 'el encabezado no muestra el aviso del parcial')
  afirmar(
    cabeceraConPlan.indexOf('class="migas"') < posAviso &&
      posAviso < cabeceraConPlan.indexOf('class="barra-guias"'),
    'el aviso del parcial no quedó entre el título y las pestañas',
  )

  // --- los círculos cambian de color según el estado ---
  const primerEjercicio = contenido.ejercicioPorId.get('g1-04')
  const clavesDe04 = primerEjercicio.items.map(
    (i: { id: string }) => `g1-04:${i.id}`,
  )

  let sesionPintada = sesionMod.SESION_VACIA
  for (const clave of clavesDe04) {
    sesionPintada = sesionMod.guardarItem(sesionPintada, clave, {
      estado: 'correcto',
      envios: 1,
      pistasAbiertas: 0,
    })
  }
  const conResuelto = render(
    createElement(VistaGuia, { numero: 1, sesion: apiSesion(sesionPintada) }),
  )
  afirmar(
    conResuelto.includes('punto--resuelto'),
    'con un ejercicio resuelto no aparece el círculo verde',
  )
  afirmar(
    conResuelto.includes('punto--sin_intentar'),
    'los ejercicios sin tocar no quedaron grises',
  )
  afirmar(conResuelto.includes('1.4 — resuelto'), 'el globo del círculo no dice el estado')

  // Un error sin resolver pinta rojo.
  const sesionConError = sesionMod.guardarItem(sesionMod.SESION_VACIA, clavesDe04[0], {
    estado: 'incorrecto',
    envios: 2,
    pistasAbiertas: 0,
  })
  const vistaError = render(
    createElement(VistaGuia, { numero: 1, sesion: apiSesion(sesionConError) }),
  )
  afirmar(vistaError.includes('punto--mal'), 'un error sin resolver no pinta el círculo rojo')

  // Y empezar sin errores pinta ámbar.
  const empezado = sesionMod.guardarItem(sesionMod.SESION_VACIA, clavesDe04[0], {
    estado: 'correcto',
    envios: 1,
    pistasAbiertas: 0,
  })
  const vistaEmpezada = render(
    createElement(VistaGuia, { numero: 1, sesion: apiSesion(empezado) }),
  )
  afirmar(
    vistaEmpezada.includes('punto--en_progreso'),
    'un ejercicio a medias no pinta el círculo ámbar',
  )

  // --- el índice lista los temas con su título, no con su id ---
  const guia1 = contenido.guiaPorNumero.get(1)
  const indiceEsperados = guia1.secuencia
    .filter((p: { tipo: string }) => p.tipo === 'teoria')
    .map((p: { id: string }) => contenido.teoriaPorId.get(p.id))
  for (const bloque of indiceEsperados) {
    afirmar(
      html.includes(bloque.titulo),
      `el índice no muestra el título del tema ${bloque.id} (${bloque.titulo})`,
    )
    afirmar(
      bloque.titulo !== bloque.id,
      `el tema ${bloque.id} no tiene título: se cayó al id`,
    )
  }

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
