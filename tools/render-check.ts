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
  // Las guías sin contenido aparecen, pero bloqueadas y sin enlace.
  for (let n = 9; n <= 12; n++) {
    if (contenido.guiaTieneContenido(n)) continue
    const bloqueadas = cabecera
      .split('<span class="tab tab--bloqueada"')
      .slice(1)
      .map((t: string) => t.slice(0, t.indexOf('</span>')))
    afirmar(
      bloqueadas.some(
        (t: string) => t.endsWith(`Guía ${n}`) && t.includes('data-tip="Se desbloquean después del parcial"'),
      ),
      `la guía ${n} no aparece bloqueada`,
    )
    afirmar(!cabecera.includes(`href="#/ejercicios/${n}"`), `la guía ${n} bloqueada tiene enlace`)
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

  // El menú de hamburguesa aparece fuera del inicio y lista las demás
  // secciones, nunca la actual.
  // En el inicio el botón es el logo de cafecito: la hamburguesa queda
  // oculta (está en el DOM para poder animar el cambio) y no hay desplegable.
  afirmar(
    /<button[^>]*class="hamburguesa"[^>]*aria-hidden="true"/.test(enMenu),
    'en el inicio la hamburguesa no quedó oculta',
  )
  afirmar(
    enMenu.includes('href="https://cafecito.app/carpincho_fiubense"'),
    'en el inicio falta el enlace a cafecito',
  )
  afirmar(
    !/<a[^>]*class="cafecito"[^>]*aria-hidden="true"/.test(enMenu),
    'en el inicio el logo de cafecito quedó oculto',
  )
  afirmar(!enMenu.includes('id="menu-navegacion"'), 'en el inicio hay desplegable')
  for (const [seccion, nombre] of [
    ['ejercicios', 'Ejercicios'],
    ['skills', 'Skills'],
    ['simulacro', 'Simulacro'],
    ['seguimiento', 'Seguimiento'],
  ]) {
    const cab = render(createElement(Cabecera, { ruta: { seccion, guia: 1 } }))
    afirmar(cab.includes('class="hamburguesa"'), `en ${seccion} no está el menú de hamburguesa`)
    const lista = cab.slice(cab.indexOf('id="menu-navegacion"'))
    afirmar(lista.includes('>Inicio<'), `en ${seccion} el menú no ofrece volver al inicio`)
    afirmar(!lista.includes(`</svg>${nombre}<`), `en ${seccion} el menú ofrece la sección actual`)
    const opciones = (lista.match(/class="navegacion__opcion"/g) ?? []).length
    afirmar(opciones === 4, `en ${seccion} el menú tiene ${opciones} opciones en lugar de 4`)
  }

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
  // El pie es un cierre ("fin"), no un enlace: para subir están la pestaña
  // activa y el "↑ Subir" lateral, que arranca oculto.
  afirmar(html.includes('class="fin"') && html.includes('>fin<'), 'el pie no dice "fin"')
  afirmar(!html.includes('class="volver"'), 'volvió el botón de volver al principio')
  afirmar(html.includes('class="subir-lateral"'), 'falta el "↑ Subir" lateral')
  afirmar(
    !html.includes('subir-lateral--visible'),
    'el "↑ Subir" se ve sin haber bajado',
  )
  // Las entradas con varios campos llevan rótulo, flecha y campo.
  afirmar(html.includes('class="flecha"'), 'los campos múltiples no llevan flecha')
  afirmar(!html.includes('Respuesta:'), 'en la guía aparece el rótulo "Respuesta:" del simulacro')

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
  afirmar(
    menu.includes('Tus datos') && menu.includes('Exportar JSON') && menu.includes('Importar JSON'),
    'el menú no tiene "Tus datos" al pie',
  )
  afirmar(
    menu.indexOf('Tus datos') > menu.indexOf('class="menu__grilla"'),
    '"Tus datos" no quedó debajo de las opciones',
  )
  afirmar(/<footer class="pie"/.test(menu), '"Tus datos" no es el pie de la página')
  // Un solo botón para borrar, que se lleva todo; sin el resumen de conteos.
  afirmar(
    (menu.match(/Borrar mis datos/g) ?? []).length === 1 &&
      !menu.includes('Borrar historial') &&
      !menu.includes('Empezar las guías de cero'),
    'no hay un único botón "Borrar mis datos"',
  )
  afirmar(!menu.includes('intentos registrados'), 'sigue el resumen de intentos registrados')
  // La ventana de borrar ofrece exportar antes, entre cancelar y borrar.
  afirmar(
    /Cancelar<\/button><button class="boton">Exportar JSON<\/button><button class="boton boton--peligro">Borrar todo/.test(menu),
    'la ventana de borrar no tiene "Exportar JSON" entre sus dos botones',
  )
  // Los globos reemplazan al `title` del navegador en toda la interfaz.
  afirmar(!/ title="/.test(menu), 'el menú usa `title` en lugar de `data-tip`')

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
  // "Tus datos" se mudó al pie del menú principal.
  afirmar(!limpio.includes('Exportar JSON'), 'el panel de skills sigue mostrando "Tus datos"')
  // Cada skill es un botón que abre su ventana; ya no hay botón de detalle.
  const celdas = (limpio.match(/<li class="celda estado--/g) ?? []).length
  const abren = (limpio.match(/aria-haspopup="dialog"/g) ?? []).length
  afirmar(celdas === contenido.skills.length && abren === celdas && !limpio.includes('celda__detalle'),
    `hay ${celdas} recuadros y ${abren} que abren la ventana para ${contenido.skills.length} skills`)
  afirmar(!limpio.includes('disminuye si se deja de practicar'),
    'el panel sigue diciendo que el estado disminuye si se deja de practicar')
  afirmar(!limpio.includes('faltan ejercicios') && !limpio.includes('celda-skill__nota'),
    'el panel sigue avisando que faltan ejercicios para dominar un skill')
  afirmar(limpio.includes('class="subir-lateral"') && limpio.includes('Subir'), 'el panel de skills no tiene "Subir"')
  for (const sk of contenido.skills) {
    const d = contenido.destinoDeSkill.get(sk.id)
    afirmar(!!d, `el skill ${sk.id} no tiene adónde llevar`)
    if (!d) continue
    const guia = contenido.guiaPorNumero.get(d.guia)
    const enLaGuia = guia.secuencia.some((p: { tipo: string; id: string }) =>
      d.ancla === p.id || d.ancla === 'ej-' + p.id)
    afirmar(enLaGuia, `el skill ${sk.id} lleva a ${d.ancla}, que no está en la guía ${d.guia}`)
    if (d.ancla.startsWith('t-')) {
      afirmar(contenido.teoriaPorId.get(d.ancla).skills.includes(sk.id),
        `el skill ${sk.id} lleva a una teoría que no lo explica`)
    }
  }
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
  afirmar(simulacro.includes('aria-label="Simular parcial al azar"'), 'sin elegir examen, el botón no dice "Simular parcial al azar"')
  // Sólo rueda la última palabra: el tambor tiene las dos y muestra "al azar".
  afirmar(
    /class="rodillo"><span class="rodillo__cinta"><span class="rodillo__palabra">seleccionado<\/span><span class="rodillo__palabra">al azar<\/span>/.test(simulacro),
    'el botón no tiene el tambor con "seleccionado" y "al azar"',
  )
  // El botón cierra el recuadro de la configuración, y el pool va debajo.
  afirmar(
    /class="interruptores"[\s\S]*class="sim-arranque"[\s\S]*<\/section><section class="pool desplegable"/.test(simulacro),
    'el botón de arrancar no quedó dentro del recuadro, debajo de los interruptores, con el pool afuera',
  )
  // El pool arranca plegado.
  afirmar(
    simulacro.includes('aria-expanded="false"') &&
      /class="pool desplegable"/.test(simulacro) &&
      /id="pool-contenido" class="desplegable__contenido" inert/.test(simulacro),
    'el pool no arranca plegado',
  )
  afirmar(!simulacro.includes('rendibles'), 'sigue el indicador de ejercicios rendibles')
  afirmar(simulacro.includes('Mostrar tags de skills'), 'falta el interruptor de tags de skills')
  afirmar(!simulacro.includes('Mostrar tags al entregar'), 'sigue el interruptor viejo de tags')
  afirmar(
    (simulacro.match(/class="examen__ver"/g) ?? []).length ===
      (simulacro.match(/class="examen__elegir"/g) ?? []).length &&
      simulacro.includes('class="examen__elegir"'),
    'cada examen del pool tiene que poder elegirse y tener su lupa',
  )
  afirmar(simulacro.includes('240'), 'la duración por defecto no es 240 minutos')
  afirmar(
    (simulacro.match(/name="tipo-examen"/g) ?? []).length === 2,
    'no se puede elegir entre parciales e integradoras',
  )
  afirmar(!simulacro.includes('Incluir integradoras'), 'volvió el toggle de integradoras')
  afirmar(simulacro.includes('Parciales disponibles'), 'no se lista el pool')
  afirmar((simulacro.match(/role="switch"/g) ?? []).length === 2, 'faltan los interruptores')
  afirmar(simulacro.includes('class="examen"'), 'el pool no se dibuja como tarjetas')
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
  afirmar(retomado.includes('Respuesta:'), 'en el simulacro falta el rótulo "Respuesta:"')
  afirmar(retomado.includes('class="modal'), 'falta la confirmación para abandonar')
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
  afirmar(tarde.includes('class="sim-estado"'), 'un simulacro vencido no vuelve entregado')
  afirmar(/\d+,\d\d/.test(tarde), 'la nota no usa coma decimal')
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
    /Necesitás resolver<\/span> <strong>\d+<\/strong> <span>ítems? por día/.test(detalleRitmo),
    'el ritmo no dice "Necesitás resolver N ítems por día"',
  )
  afirmar(
    planVacio.itemsFaltantes > 0 &&
      planVacio.itemsFaltantes <
        contenido.ejercicios.reduce((n: number, e: { items: unknown[] }) => n + e.items.length, 0),
    `los ítems faltantes dieron ${planVacio.itemsFaltantes}: tendrían que ser menos que el total`,
  )
  afirmar(
    planVacio.ejerciciosFaltantes <= contenido.ejercicios.length,
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
  // La fecha lleva al simulacro y los días que faltan, al seguimiento.
  afirmar(
    /<a[^>]*href="#\/simulacro"[^>]*>\s*Parcial 30\/10/.test(cabeceraConPlan),
    '"Parcial 30/10" no lleva al simulacro',
  )
  afirmar(
    /<a[^>]*href="#\/seguimiento"[^>]*>\s*faltan \d+ días/.test(cabeceraConPlan),
    '"faltan N días" no lleva al seguimiento',
  )
  // En la sección a la que llevaría, cada parte es texto, sin enlace ni globo.
  const enSeguimiento = render(createElement(AvisoParcialCompacto, { plan: planVacio, seccion: 'seguimiento' }))
  afirmar(
    !enSeguimiento.includes('href="#/seguimiento"') &&
      !enSeguimiento.includes('Ver el seguimiento') &&
      enSeguimiento.includes('href="#/simulacro"'),
    'en el seguimiento, "faltan N días" sigue siendo un enlace',
  )
  const enSimulacro = render(createElement(AvisoParcialCompacto, { plan: planVacio, seccion: 'simulacro' }))
  afirmar(
    !enSimulacro.includes('href="#/simulacro"') &&
      !enSimulacro.includes('Practicar con un simulacro') &&
      enSimulacro.includes('href="#/seguimiento"'),
    'en el simulacro, la fecha del parcial sigue siendo un enlace',
  )

  // La leyenda del ritmo dice en qué unidad está.
  let conRitmo = progresoMod.PROGRESO_VACIO
  for (const [i, item] of ['g1-04:a', 'g1-04:b'].entries()) {
    conRitmo = progresoMod.agregar(
      conRitmo,
      { item, ts: `2026-10-0${i + 5}T12:00:00.000Z`, envios: 1, correcto: true, pistas: 0, revelo: false },
      true,
    )
  }
  const planRitmo = ritmoMod.armarPlan(conRitmo, skillsReales, contenido.skillsDeItem, contenido.config, hoy)
  const detalleConRitmo = render(createElement(AvisoParcialDetalle, { plan: planRitmo }))
  afirmar(
    /ritmo de los últimos 7 días: <strong>0,3<\/strong> ítems resueltos en limpio por día/.test(detalleConRitmo),
    'la leyenda del ritmo no dice "N ítems resueltos en limpio por día"',
  )

  // El sello de la cátedra lleva al campus, en otra pestaña, con su globo.
  const { LogoCatedra } = await servidor.ssrLoadModule('/src/componentes/LogoCatedra.tsx')
  const sello = render(createElement(LogoCatedra, { visible: true }))
  afirmar(
    sello.includes('href="https://campusgrado.fi.uba.ar/course/view.php?id=46"') &&
      sello.includes('target="_blank"') &&
      sello.includes('data-tip="Página de cátedra"') &&
      sello.includes('catedra--entrando'),
    'el sello de la cátedra no lleva al campus o no tiene su globo',
  )
  afirmar(render(createElement(LogoCatedra, { visible: false })) === '', 'el sello se dibuja fuera del inicio')

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
