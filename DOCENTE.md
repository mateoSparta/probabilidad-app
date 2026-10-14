# Guía para el docente

Todo el contenido de la app (ejercicios, resultados, fechas de los
exámenes, teoría) está en archivos de texto dentro de la carpeta `content/`.
Para cambiarlo no hace falta programar: alcanza con editar esos archivos y
correr un comando que revisa que todo esté bien.

Esta guía explica dónde está cada cosa y cómo hacer los cambios más comunes.

- [Antes de empezar](#antes-de-empezar)
- [Dónde está cada cosa](#dónde-está-cada-cosa)
- [Cómo se escribe un archivo YAML](#cómo-se-escribe-un-archivo-yaml)
- [Cambiar la fecha de un examen](#cambiar-la-fecha-de-un-examen)
- [Revisar todos los resultados](#revisar-todos-los-resultados)
- [Corregir un resultado](#corregir-un-resultado)
- [Cargar un ejercicio](#cargar-un-ejercicio)
- [Cargar un examen](#cargar-un-examen)
- [Agregar una habilidad o un bloque de teoría](#agregar-una-habilidad-o-un-bloque-de-teoría)
- [Cómo repercute un cambio en Habilidades y Seguimiento](#cómo-repercute-un-cambio-en-habilidades-y-seguimiento)
- [Cuando `npm run check` encuentra un error](#cuando-npm-run-check-encuentra-un-error)

## Antes de empezar

Hace falta:

- **Node.js**, que se descarga de [nodejs.org](https://nodejs.org) (la
  versión LTS).
- **Un editor de texto.** Se recomienda [Visual Studio Code](https://code.visualstudio.com),
  que colorea los archivos y marca algunos errores mientras se escribe.

La primera vez, abrir una terminal en la carpeta del proyecto y correr:

```bash
npm install
```

Después, dos comandos alcanzan para todo:

| Comando | Para qué |
|---|---|
| `npm run dev` | Abre la app en el navegador, en <http://localhost:5173>. Los cambios en `content/` se ven al guardar el archivo. |
| `npm run check` | Revisa todo el contenido. Si algo está mal, dice qué, en qué archivo y cómo arreglarlo. También actualiza el listado de resultados. |

Conviene correr `npm run check` después de cada cambio.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Fechas de los exámenes | [`content/config.yaml`](content/config.yaml) |
| Los ejercicios de cada guía, con sus resultados | `content/guias/guia-N/ejercicios/`, un archivo por ejercicio (el 1.4 es `g1-04.yaml`) |
| El orden de cada guía (teoría y ejercicios) | `content/guias/guia-N/guia.yaml` |
| La teoría | `content/guias/guia-N/teoria/`, un archivo por bloque |
| Los exámenes del simulacro | [`content/examenes/`](content/examenes/), un archivo por examen |
| Las habilidades (los temas que mide la app) | [`content/skills.yaml`](content/skills.yaml) |
| **Todos los resultados, en un solo listado** | [`revision/resultados.md`](revision/resultados.md), que se genera solo |
| **Plantillas para copiar** | [`plantillas/`](plantillas/) |

Las fórmulas del Machete (`content/formulas/`), las distribuciones
(`content/distribuciones.yaml`) y las tablas (`content/tablas/`) también son
archivos de texto, pero sus números se contrastan con programas de
verificación; para cambiarlos conviene pedir ayuda.

## Cómo se escribe un archivo YAML

Los archivos de contenido están en formato YAML: cada renglón es un nombre,
dos puntos y un valor.

```yaml
numero: "1.4"             # un texto o un número
skills: [laplace]         # una lista corta
pistas:                   # una lista larga: un renglón por elemento, con "- "
  - Primera pista.
  - Segunda pista.
```

Hay cuatro reglas que conviene recordar:

1. **La sangría importa.** Los espacios al principio del renglón indican qué
   está dentro de qué. Se usan siempre espacios (dos por nivel), nunca
   tabulaciones.
2. **Lo que sigue a un `#` es un comentario** y la app lo ignora.
3. **Un texto con fórmulas o con dos puntos va entre comillas simples**:
   `pregunta: 'Calcular $P(A \cap B)$.'`. Para un texto largo, se escribe
   `>-` y el texto en los renglones siguientes, con más sangría.
4. **Las fórmulas se escriben en LaTeX** entre `$...$`, o entre `$$...$$` para
   que ocupen su propio renglón. La coma decimal dentro de una fórmula se
   escribe `{,}`: `$0{,}5$`.

## Cambiar la fecha de un examen

Abrir [`content/config.yaml`](content/config.yaml), buscar el examen y
cambiar su `fecha`, con el formato año-mes-día y entre comillas:

```yaml
  - nombre: parcial
    instancia: 1er llamado
    fecha: "2026-10-30"     # una fecha todavía no definida se escribe null
```

El aviso del encabezado y el plan de Seguimiento se actualizan solos. Desde
la app, el lápiz del aviso también cambia una fecha, pero sólo en ese
navegador; la de este archivo es la que ven todos.

## Revisar todos los resultados

[`revision/resultados.md`](revision/resultados.md) tiene todos los resultados
de la app, en una tabla por guía y por examen: qué se calcula, el valor, su
decimal, si está verificado y un enlace a la línea exacta del archivo donde
está. Arriba de todo, en "Para revisar primero", aparecen las discrepancias
y los valores cargados o corregidos por el docente.

El listado se genera solo con cada `npm run check`; no se edita a mano.

## Corregir un resultado

Cada resultado tiene dos respaldos: la resolución de la cátedra y un
programa que lo calcula por otro camino (en `tools/verify/`). El check
compara el archivo con el programa, así que un valor cambiado sin más se
toma como un error de tipeo. Para que se tome como una corrección, se marca
como del docente.

1. Buscar el resultado en [`revision/resultados.md`](revision/resultados.md)
   y seguir el enlace de la columna "Dónde".
2. Cambiar el `valor`.
3. En la sección `verificacion` del mismo ítem, cambiar `estado: verificado`
   por `estado: docente`, y agregar al principio de `fuentes_valor` dos
   renglones con el valor corregido. Opcionalmente, una `nota` con el motivo.
4. Correr `npm run check`.

Así queda un ítem corregido (el valor pasó de 1/6 a 1/5):

```yaml
    respuesta:
      tipo: numerica
      rotulo: 'P(\text{suma} = 7)'
      valor: "1/5"                     # 2. el valor corregido
    pistas:
      - …
    verificacion:
      estado: docente                  # 3. antes decía verificado
      nota: La resolución de la cátedra tenía un error de cuentas.
      fuentes_valor:
        - origen: docente              # 3. estos dos renglones,
          valor: "1/5"                 #    con el mismo valor
        - origen: "GUIA 1 RES 2.pdf#p3"   # lo anterior queda como registro
          valor: "1/6"
```

El check muestra un aviso ("corrección del docente…") en lugar de un error,
y el ítem aparece en "Para revisar primero" hasta que se actualice el
programa de verificación. La app usa el valor corregido desde ese momento.

En los otros tipos de respuesta:

- **Varios campos (checkpoints):** se corrige el `valor` del campo, y en la
  fuente del docente se escriben los valores de todos los campos, en orden:
  `valor: "1/4, 1/2, 1"`.
- **Opción múltiple:** se mueve `correcta: true` a la opción correcta, y en
  la fuente del docente se escribe su id: `valor: "a2"`. A la opción que
  dejó de ser correcta conviene agregarle un `error_tipico`, que explique
  por qué no lo es.

## Cargar un ejercicio

1. **Elegir la plantilla** según cómo se responde:

   | La respuesta es… | Plantilla | En la app se ve |
   |---|---|---|
   | un número | [`ejercicio-numerica.yaml`](plantillas/ejercicio-numerica.yaml) | $P(\text{ambas rojas}) =$ [campo] |
   | una fórmula en función de $p$, $n$, $\lambda$… | [`ejercicio-expresion.yaml`](plantillas/ejercicio-expresion.yaml) | un campo "en función de p" |
   | una función ($F_X$, una densidad) o varios números | [`ejercicio-checkpoints.yaml`](plantillas/ejercicio-checkpoints.yaml) | dos a cuatro campos apilados |
   | algo no numérico ("¿son independientes?") | [`ejercicio-opcion.yaml`](plantillas/ejercicio-opcion.yaml) | opciones para elegir |

   Un ejercicio con ítems de tipos distintos se arma copiando cada ítem de
   la plantilla de su tipo.

2. **Copiarla** a `content/guias/guia-N/ejercicios/` con el nombre del
   ejercicio: el 1.30 va en `content/guias/guia-1/ejercicios/g1-30.yaml`.
3. **Reemplazar el ejemplo** por el ejercicio real. Cada campo de la
   plantilla tiene un comentario que explica qué va.
4. **Agregarlo a la guía**: en `content/guias/guia-N/guia.yaml`, escribir
   `- ejercicio: g1-30` en el lugar de la secuencia donde tiene que aparecer
   (después de la teoría que lo prepara).
5. **Correr `npm run check`.**

Lo que cada ítem necesita, y el check exige:

- **Las habilidades que evalúa** (`skills`), con los ids de
  [`content/skills.yaml`](content/skills.yaml), y el fragmento del enunciado
  que las justifica marcado como `[[id|texto]]`. Al resolver el ítem aparece
  la etiqueta de la habilidad, y al pasarle el mouse se resalta ese fragmento.
- **El rótulo** (`rotulo`): lo que se calcula, como $P(B_1)$ o $E[X]$. La
  app escribe la respuesta como una frase, "$P(B_1) =$ [campo]".
- **El valor exacto**, como fracción o cuenta: `"47/120"`, `"1 - (5/6)^4"`,
  `"exp(-2)"`. La app acepta cualquier respuesta que dé el mismo número, con
  una tolerancia del 1 %.
- **Pistas graduadas**, de la más general a la más concreta. La última es un
  plan sin cuentas; nunca la resolución completa.

Mientras un ejercicio está a medio cargar, conviene guardarlo fuera de
`content/` (por ejemplo, en el escritorio): todo lo que está en `content/`
entra en la app y en el check.

## Cargar un examen

Copiar [`plantillas/examen.yaml`](plantillas/examen.yaml) a
`content/examenes/` con el nombre de su id (`ep-20261030.yaml` para el 30 de
octubre de 2026), reemplazar el ejemplo y correr `npm run check`. No hace
falta agregarlo a ninguna lista: el simulacro toma todos los exámenes de esa
carpeta. Los ítems se escriben igual que en los ejercicios de las guías.

Un ejercicio que la app no puede presentar (una simulación, una
demostración) se lista igual, con `cargado: false`, sin ítems y con una nota
que explique por qué; el simulacro lo deja afuera y presenta el resto.

## Agregar una habilidad o un bloque de teoría

- **Una habilidad:** copiar el bloque de
  [`plantillas/habilidad.yaml`](plantillas/habilidad.yaml) al final de
  [`content/skills.yaml`](content/skills.yaml). Empieza a contar cuando algún
  ítem la declara en sus `skills`.
- **Un bloque de teoría:** copiar [`plantillas/teoria.md`](plantillas/teoria.md)
  a `content/guias/guia-N/teoria/` y agregar `- teoria: t-mi-tema` en la
  secuencia de la guía, antes de los ejercicios que lo practican.

## Cómo repercute un cambio en Habilidades y Seguimiento

- **Cada ítem declara qué habilidades evalúa**, y el estado de una habilidad
  se calcula con los intentos sobre todos los ítems que la declaran, de las
  guías y de los exámenes.
- **Una habilidad se domina** con 3 intentos limpios (acertados sin ver la
  respuesta) entre los últimos 5. Si tiene menos de 3 ítems, alcanza con
  tantos como tenga. Por eso, agregarle un ítem a una habilidad que tenía uno
  o dos le sube la exigencia, y un alumno que la tenía dominada puede dejar
  de tenerla.
- **El plan de Seguimiento** busca el conjunto más chico de ítems que cubre
  las habilidades pendientes del próximo examen. Un ítem nuevo puede bajar
  los "ítems faltantes", si cubre varias habilidades a la vez, o subirlos, si
  eleva la exigencia de alguna.
- **Qué entra en cada examen** lo dicen las guías de cada evaluación en
  [`content/config.yaml`](content/config.yaml).
- **Una habilidad cuya guía todavía no tiene ejercicios** aparece bloqueada en
  el panel y no cuenta para el plan.

## Cuando `npm run check` encuentra un error

Cada problema ocupa un renglón que empieza con `✗` y dice el archivo (o el
ejercicio y el ítem, como `g1-04(a)`), qué está mal y, en general, cómo
arreglarlo. Los renglones que empiezan con `aviso:` informan algo, pero no
impiden usar la app.

Los errores más comunes:

| El mensaje dice… | Qué hacer |
|---|---|
| `el archivo no se puede leer`, con un renglón | Revisar la sangría de ese renglón y del anterior, y que los textos con fórmulas o con dos puntos estén entre comillas. |
| `no está en la secuencia de ninguna guía` | Agregar `- ejercicio: …` en el `guia.yaml` de su guía. |
| `el skill … no existe` | Revisar el id en [`content/skills.yaml`](content/skills.yaml), o agregar la habilidad. |
| `no está marcado ni en el enunciado ni en la pregunta` | Marcar en el enunciado o en la pregunta el fragmento que justifica esa habilidad: `[[id\|texto]]`. |
| `el YAML dice … pero tools/verify calculó …` | Si el cambio fue a propósito, marcarlo como corrección del docente ([Corregir un resultado](#corregir-un-resultado)). |
| `el archivo se llama … pero el id es …` | Hacer coincidir el nombre del archivo con el `id` (suele pasar al copiar una plantilla). |
