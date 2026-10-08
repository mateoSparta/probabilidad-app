# Plan de acción — App de estudio gamificada para Probabilidad (FIUBA)

> Documento de arranque para el repo. Pensado para trabajar con Claude Code fase por fase.
> Todo el contenido y la interfaz van en español.
> **Materia: Probabilidad y Estadística B (61.09 / 81.04, CB003).** Todo lo específico de la cursada para Industrial (simulación, R) queda afuera.

---

## 1. Objetivo y principios

Una web local para estudiar Probabilidad con las guías de la cátedra. La teoría se presenta como *skills* que se desbloquean resolviendo ejercicios, y el estado de cada skill se ve de un vistazo para detectar puntos flojos y puntos ciegos.

Hay cinco principios que guían las decisiones:

1. **El contenido es el cuello de botella, no el código.** La app es un renderer de datos (YAML + Markdown). Agregar un ejercicio no debe requerir tocar código.
2. **Ningún resultado entra sin verificar.** Las resoluciones escaneadas tienen errores (ver §7), así que cada respuesta se contrasta con un cálculo independiente.
3. **Recuperación activa antes que lectura.** Los tags se ocultan hasta resolver, las pistas son graduadas y no hay resolución paso a paso.
4. **El dominio se mide sobre intentos recientes**, no se gana para siempre.
5. **Construir primero una porción vertical completa** (Guía 1 con todos los features) y recién después cargar el resto.

---

## 2. Alcance

**v1:**

- Guías 1 a 8, los temas del parcial.
- Modo simulacro con los exámenes que corresponden a PyE B (ver §6).

**Excluido de v1:**

- Guías 9 a 12 (estadística). El formato ya las soporta; se cargan más adelante.
- Ejercicios de demostración ("mostrar que", "verificar que", "probar que").
- Todo lo que corresponde solo a la cursada de Industrial: los ejercicios marcados con Ï en la guía (simulación por computadora) y cualquier ejercicio de simulación o de código en R.
- Los exámenes de la cursada de Industrial (archivos `*-ProbIND.pdf`, encabezado "PROBABILIDAD - 81.16 CB004"), que incluyen ejercicios de R.
- Resolución paso a paso.

---

## 3. Decisiones de diseño (resumen)

| Tema | Decisión |
|---|---|
| Tabs | Una por guía (Guía 1 … Guía 8). |
| Cuerpo de la tab | Descripción conceptual breve, seguida de una secuencia que alterna bloques de teoría y ejercicios. |
| Filtro | Chips de skills de la guía, todos tildados por defecto. Destildar oculta los ejercicios cuyos ítems no tengan ningún skill tildado. La teoría se mantiene visible. |
| Unidad validable | El **ítem**: (a), (b), (c)… Cada ítem declara sus skills. |
| Tags en ejercicios | Ocultos hasta que el ítem se resuelve o se revela la respuesta. Recién ahí aparecen los tags, y el hover resalta el fragmento del enunciado que justifica cada uno. |
| Ayudas por ítem | **Fórmulas** (por skill, reutilizables), **Pistas** graduadas (la última es un plan de resolución en 2–3 líneas, sin cuentas) y **Ver respuesta** (muestra el resultado final; el intento no cuenta como limpio). |
| Tipos de respuesta | `numerica`, `expresion`, `opcion` y `checkpoints` (ver §4.4). |
| Insignias | Por skill, globales (un skill puede aparecer en varias guías). Hay un panel general de skills. |
| Simulacro | Botón (no tab). Elige al azar un examen de PyE B, con timer configurable (por defecto 4 h), toggle de tags y botón "Entregar" que calcula la nota. |
| Persistencia | `localStorage` + exportar/importar JSON. |
| Stack | Vite + TypeScript + Preact, KaTeX, math.js. Sin backend. |

---

## 4. Modelo de contenido

### 4.1 Estructura del repo

```
probabilidad-app/
├── CLAUDE.md                     # convenciones para Claude Code (ver §9)
├── PLAN.md                       # este documento
├── fuentes/                      # material original, solo lectura
│   ├── guias/parte1.pdf          # enunciados guías 1–8
│   ├── guias/parte2.pdf          # enunciados guías 9–12 (futuro)
│   ├── resueltas/guia-1/…        # GUIA_1_RES_1.pdf, GUIA_1_RES_2.pdf, …
│   ├── examenes/…                # EP_*.pdf, EI_*.pdf
│   └── teoria/                   # Grynberg_Notas.pdf, Maronna…pdf, Tablas.pdf
├── content/
│   ├── skills.yaml               # catálogo único de skills + fórmulas
│   ├── guias/
│   │   └── guia-1/
│   │       ├── guia.yaml         # título, descripción, secuencia
│   │       ├── teoria/*.md       # bloques de teoría (frontmatter + MD + LaTeX)
│   │       └── ejercicios/*.yaml # un archivo por ejercicio
│   └── examenes/*.yaml
├── tools/
│   ├── rasterize.sh              # PDF escaneado → PNG por página
│   ├── verify/                   # scripts Python (sympy exacto + Monte Carlo)
│   └── check.ts                  # validador de contenido (corre en build)
├── revision/
│   └── guia-N.md                 # discrepancias para que Mateo revise
└── src/                          # la app
```

### 4.2 `skills.yaml`

```yaml
- id: prob-total
  nombre: Probabilidad total
  guia: 1                        # guía donde se introduce
  descripcion: Descomponer un evento según una partición.
  formulas:
    - 'P(A) = \sum_i P(A \mid B_i)\,P(B_i)'
- id: bayes
  nombre: Regla de Bayes
  guia: 1
  formulas:
    - 'P(B_j \mid A) = \frac{P(A \mid B_j)P(B_j)}{\sum_i P(A \mid B_i)P(B_i)}'
```

Catálogo inicial sugerido. Es un borrador que Claude Code refina leyendo cada guía, apuntando a 4–8 skills por guía:

| Guía | Temas |
|---|---|
| 1 | Álgebras de eventos, espacio muestral, conteo/Laplace (con y sin orden, con y sin reposición, bolas y urnas), probabilidad geométrica, condicional, probabilidad total, Bayes, independencia, continuidad de P. |
| 2 | Variable aleatoria y medibilidad, función de distribución, VA discretas/continuas/mixtas, condicionamiento a un evento (truncamiento), vectores, conjunta y marginales, independencia de VA. |
| 3 | Esperanza, esperanza condicional a un evento, varianza, covarianza, momentos. |
| 4 | Transformaciones (discretas, método de la F, densidad por cambio de variable, jacobiano), mínimo y máximo, competencia de exponenciales. |
| 5 | Distribuciones condicionales, mezclas, Bayes para mezclas, esperanza condicional, esperanza y varianza totales. |
| 6 | Bernoulli, binomial, geométrica, Pascal, multinomial, hipergeométrica, pérdida de memoria. |
| 7 | Proceso de Poisson (incrementos, tiempos de espera, condicionamiento a N(t)=n, superposición, adelgazamiento, Poisson compuesto). |
| 8 | Normal, TCL, aproximaciones. |

### 4.3 Bloque de teoría (`teoria/*.md`)

```markdown
---
id: t-prob-total
skills: [prob-total]
---
## Probabilidad total
Texto breve (≤ 250 palabras), con LaTeX y, si aporta, un ejemplo mínimo…
```

### 4.4 Ejercicio (`ejercicios/g1-23.yaml`)

```yaml
id: g1-23
guia: 1
numero: "1.23"
fuente:
  enunciado: fuentes/guias/parte1.pdf
  resueltas: ["GUIA_1_RES_1.pdf#p9-10"]
enunciado: |
  Texto con LaTeX. Los fragmentos que justifican un tag se marcan así:
  [[prob-total|se extrae una bola de B si salió roja, y de C si salió blanca]].
items:
  - id: b
    pregunta: 'Calcular $P(B_2)$.'
    skills: [prob-total]
    respuesta:
      tipo: numerica
      valor: "47/120"          # exacto; la app acepta 47/120, 0.3917, etc.
      tol_rel: 0.01
    pistas:
      - "¿De qué depende la urna de la segunda extracción?"
      - "Particioná según el color de la primera bola."
      - "Plan: P(B₂) = P(B₂|R₁)P(R₁) + P(B₂|B₁)P(B₁), leyendo cada factor del árbol."
    verificacion:
      estado: verificado        # verificado | discrepancia | sin_fuente
      metodo: exacto+montecarlo
```

**Tipos de respuesta:**

- **`numerica`.** La entrada se parsea con math.js, así que acepta `47/120`, `0.39`, `16 e^-8`, `1 - (5/6)^4`. Es correcta si |x − v| ≤ `tol_rel`·|v|. La tolerancia es relativa (por defecto 1%) para no aceptar 0 cuando el valor es muy chico; se puede sobrescribir por ítem.
- **`expresion`.** Para respuestas en función de p, λ, n, etc. Se definen variables con rangos (`vars: {p: [0.05, 0.95]}`), y la app evalúa la respuesta y el valor esperado en 6 puntos al azar con tolerancia relativa de 1e-6.
- **`opcion`.** Multiple choice para lo no numérico (álgebras generadas, "¿son independientes?", identificar distribuciones). Cada distractor lleva un campo `error_tipico` que se muestra al elegirlo, porque es lo que alimenta la detección de puntos ciegos.
- **`checkpoints`.** Para "hallar y graficar F_W" o "hallar la densidad": el ítem se reemplaza por 2–4 preguntas numéricas concretas, como `F_W(0.5)`, `P(W = 1)` o `f_Y(2)`. Es correcto si acierta todas. Así se valida una función sin parsear funciones a trozos.

### 4.5 Secuencia de la guía (`guia.yaml`)

```yaml
numero: 1
titulo: Espacios de probabilidad
descripcion: Qué es un experimento aleatorio, cómo se arma Ω…
secuencia:
  - teoria: t-algebras
  - ejercicio: g1-01
  - teoria: t-laplace
  - ejercicio: g1-02
  …
```

### 4.6 Examen (`content/examenes/ep-20250524.yaml`)

Tiene el mismo esquema de ítems, más los campos `tipo: parcial|integradora`, `fecha`, `duracion_min: 240` y, por ejercicio, `guias: [1]` y `en_alcance: true|false`.

### 4.7 Validador (`npm run check`, corre antes de build)

El build falla si se da alguno de estos casos:

- Un skill referenciado no existe.
- Un bloque de teoría tiene un skill sin ningún ítem que lo evalúe.
- Un ítem no tiene skills o no tiene pistas.
- El `valor` no parsea, o una marca `[[skill|…]]` usa un skill que el ítem no declara.
- Un ejercicio en la secuencia no existe.

Además, emite un warning por cada ítem con `estado ≠ verificado`.

---

## 5. Lógica de progreso e insignias

**Qué cuenta como intento:**

- Un intento sobre un ítem es la secuencia de envíos hasta acertar, revelar la respuesta o abandonar.
- Se cuenta como máximo un intento por ítem por día, para evitar memorizar el número.
- Un intento es **limpio** si acierta sin ver la respuesta: en el primer envío para `opcion` y en ≤ 2 envíos para el resto.
- Las pistas usadas se registran pero no anulan el intento.

**Estado de cada skill**, sobre los últimos 5 intentos de ítems que lo incluyen:

| Estado | Condición |
|---|---|
| Sin explorar | 0 intentos. |
| En desarrollo | No cumple ninguno de los otros estados. |
| Dominado (insignia) | ≥ 3 intentos limpios en los últimos 5. |
| Flojo | ≥ 3 intentos y ≤ 1 limpio en los últimos 5. |

**Panel de skills:** una grilla agrupada por guía, con el estado de cada skill. Al hacer clic en un skill se ven sus ítems pendientes y los distractores en los que más caíste (los errores típicos).

**Datos guardados:** un log de eventos en `localStorage` (`{item, ts, envios, correcto, pistas, revelo}`), de donde se derivan los estados. Hay un botón para exportar e importar el JSON.

---

## 6. Modo simulacro

**Pool de exámenes:** solo los que corresponden a PyE B, según el encabezado del PDF.

| Archivo | Tipo | Ejercicios en alcance (guías 1–8) | Uso en v1 |
|---|---|---|---|
| `EP_20250524.pdf` | Parcial común (Prob. IND, PyE A y PyE B) | 1–5 | Sí |
| `EP_20250614.pdf` | Parcial común | 1–5 | Sí |
| `EI_20250710-PyE-B.pdf` | Integradora PyE B | 1–3 (4 y 5 son de estadística) | Opcional |
| `EI-20250717-PyE-B.pdf` | Integradora PyE B | 1–3 (4 y 5 son de estadística) | Opcional |
| `EI-20250807-PyE-A-B.pdf` | Integradora PyE A y B | 1–3 (4 y 5 son de estadística) | Opcional |
| `EI-20250717-ProbIND.pdf`, `EI-20250807-ProbIND.pdf` | Cursada de Industrial | — | **Excluidos** |

Algunos parciales traen variantes por curso (por ejemplo, el ej. 2 del 24/05 tiene una versión "Curso 4" y otra "Otros cursos"). Se carga la variante que corresponde al curso de Mateo, definido en un campo `curso` de la configuración.

**Arranque:**

- El botón "Simulacro" está en el header.
- Por defecto elige al azar entre los **parciales**, que están completos en alcance.
- Un toggle "Incluir integradoras" suma las integradoras, presentando solo los ejercicios 1–3 hasta que se carguen las guías 9–12. En ese caso la nota se reescala y el veredicto se marca como parcial, porque el criterio de la cátedra exige aprobar el 4 o el 5.

**Configuración:**

- Timer configurable, 240 min por defecto. Persiste si se recarga la página.
- Toggle de tags, apagado por defecto.
- Sin pistas ni respuesta. Las fórmulas tampoco, salvo que se active un toggle.

**Al entregar:**

- Cada ejercicio vale lo mismo y sus ítems se reparten ese peso en partes iguales. El resultado es una nota de 0 a 10.
- Se muestra también el veredicto con el criterio de la cátedra: "aprobaría" si hay ≥ 3 ejercicios con todos sus ítems correctos (en integradoras, además, al menos uno de ellos debe ser el 4 o el 5).

**Después:** se revelan las respuestas, los tags y las pistas, y los ítems del simulacro cuentan como intentos para las insignias. Son los intentos más valiosos, porque son mezclados y sin aviso del tema.

**Respuestas de los exámenes:** los exámenes no tienen resueltas, así que todas sus respuestas salen del pipeline de verificación independiente (§7), con doble chequeo: exacto y Monte Carlo.

---

## 7. Pipeline de contenido (por guía, ejecutado con Claude Code)

1. **Transcribir los enunciados** de `parte1.pdf` (pdftotext + reconstrucción manual del LaTeX). Partir en ítems y excluir demostraciones y lo específico de Industrial (ejercicios Ï, simulación, R).
2. **Clasificar.** Asignar skills por ítem, elegir el tipo de respuesta y marcar los fragmentos `[[skill|…]]`.
3. **Extraer resultados de las resueltas.** Rasterizar las páginas, leer cada resultado y registrar la fuente (archivo y página). Si hay varias resueltas para el mismo ítem, registrar todas.
4. **Resolver de forma independiente** con un script en `tools/verify/`, usando sympy (exacto) cuando se pueda y simulación Monte Carlo siempre que sea simulable.
5. **Reconciliar.**
   - Si el cálculo coincide con al menos una resuelta → `verificado`.
   - Si no coincide → `discrepancia`, con una entrada en `revision/guia-N.md` que muestre ambos valores y el argumento.
   - Si no hay resuelta → se usa el cálculo independiente con Monte Carlo como `verificado`.
6. **Redactar** pistas, distractores con su `error_tipico` y bloques de teoría breves, basados en Grynberg y Maronna.
7. **Correr `npm run check`.** Mateo revisa `revision/guia-N.md` antes de dar la guía por cerrada.

**Por qué el paso 5 no es opcional.** En una primera lectura de las resueltas ya aparecen errores:

- En el 2.3(a) se omite el coeficiente binomial: P(V=1) figura como ≈ 0,091 cuando es 4·(5/8)³·(3/8) ≈ 0,366. Además, las probabilidades no suman 1.
- En el 6.1(b) se usa p = 0,01 para el paquete en lugar de P(X ≥ 2) ≈ 0,0043.
- En el 7.3, las dos resueltas llegan al mismo número por caminos distintos, y una de ellas tiene la fórmula incorrecta.

**Cobertura de resueltas disponible:**

| Guía | Archivos |
|---|---|
| 1 | RES_1, RES_2, RES_3 |
| 2 | SAN, RES_1, RES_2 |
| 3 | RES_1, RES_2, RES_3 |
| 4 | RES_2, RES_3, RES_4 |
| 5 | RES_2, RES_3 |
| 6 | RES_2, RES_3 |
| 7 | RES_2, RES_3 |
| 8 | RES_3 (cobertura más baja: más ítems quedan solo con cálculo independiente) |

---

## 8. Interfaz y estética

**Layout:**

- Columna central de máximo 760 px y scroll vertical.
- Header con el título, las tabs Guía 1–8, el botón Simulacro y el botón Panel de skills.

**Tipografía:**

- Newsreader para títulos y cuerpo: serif editorial, académica, en la línea del aire del logo de Claude.
- IBM Plex Mono para los inputs.
- KaTeX para la matemática.
- Las fuentes se auto-hospedan con `@fontsource/*` para que funcione offline.

**Paleta (tokens CSS):**

| Token | Valor |
|---|---|
| Fondo | crema `#F4EFE6` |
| Superficie | `#FBF8F2` |
| Tinta | `#2B2620` |
| Tinta secundaria | `#6B6257` |
| Acento | terracota `#B4552D` |
| Estado dominado | verde `#4F7A4A` |
| Estado en desarrollo | ámbar `#B8892E` |
| Estado flojo | rojo `#A3473A` |

**Tarjeta de ejercicio:**

- Número y enunciado.
- Ítems, cada uno con su input y sus botones `Fórmulas · Pistas (n) · Ver respuesta`.
- Feedback en línea: ✓, ✗ o el texto del `error_tipico` si eligió un distractor.
- Al resolver aparecen los tags; el hover sobre un tag resalta su fragmento en el enunciado.

**Insignias:** sobrias, un sello circular con la inicial o el símbolo del skill, sin animaciones estridentes.

---

## 9. `CLAUDE.md` sugerido para el repo

```markdown
# Contexto
App local para estudiar Probabilidad (FIUBA) con guías gamificadas. Ver PLAN.md.

# Reglas
- Todo el contenido y la UI en español rioplatense neutro.
- La materia es PyE B (61.09/81.04, CB003). Nada de la cursada de Industrial: sin simulación, sin R, sin exámenes *-ProbIND.
- Nunca inventar un resultado: cada `valor` debe venir de una resuelta Y/O de un script en tools/verify/. Si no coinciden, estado `discrepancia` y entrada en revision/.
- No incluir demostraciones ni ejercicios Ï.
- Contenido = datos. No hardcodear ejercicios en src/.
- Correr `npm run check` y `npm run build` antes de dar una tarea por terminada.
- Pistas: graduadas, la última es un plan sin cuentas. Nunca la resolución completa.
- Fuentes en fuentes/ son de solo lectura.
```

---

## 10. Fases

Cada fase termina con algo usable. La idea es estudiar desde la fase 2.

| Fase | Entregable | Criterio de terminado |
|---|---|---|
| 0. Setup | Repo, Vite + TS + Preact, KaTeX, math.js, fuentes, tokens CSS, `CLAUDE.md`, `fuentes/` cargadas. | `npm run dev` muestra la página crema vacía con las tabs. |
| 1. Motor | Esquemas TS, carga de YAML/MD vía `import.meta.glob`, validador, tarjeta de ejercicio con los 4 tipos de respuesta, pistas, fórmulas, ver respuesta, tags ocultos y resaltado. | 3 ejercicios de prueba (uno por tipo) funcionando de punta a punta. |
| 2. Guía 1 completa | Pipeline §7 sobre la Guía 1, con teoría, secuencia y filtro de skills. | `revision/guia-1.md` revisado por Mateo; toda la guía validable. |
| 3. Progreso | Log de intentos, estados de skill, panel de insignias, export/import. | El panel refleja correctamente una sesión real de estudio. |
| 4. Guías 2–8 | Pipeline §7 guía por guía (una sesión de Claude Code por guía). | Cada guía con su `revision/` cerrado. |
| 5. Simulacro | Exámenes cargados y verificados, timer, entrega, nota y veredicto. | Un simulacro completo con nota coherente. |
| 6. Futuro | Guías 9–12, integradoras de PyE B completas (ejercicios 4 y 5), ejercicios parametrizados. | — |

**Prompts de arranque para Claude Code:**

- **Fase 0–1:** "Leé PLAN.md y CLAUDE.md. Implementá las fases 0 y 1. Usá los ejemplos de §4 como fixtures de prueba."
- **Fase 2 (y luego por guía):** "Ejecutá el pipeline de §7 sobre la Guía N. Empezá transcribiendo y clasificando; mostrame la lista de ítems y skills antes de extraer resultados."
- **Fase 5:** "Cargá los exámenes de PyE B de fuentes/examenes/ según §4.6 y la tabla de §6 (ignorá los *-ProbIND). Marcá en_alcance por ejercicio y verificá todas las respuestas con exacto + Monte Carlo."

---

## 11. Pendientes y riesgos

- **Guía 8:** tiene una sola resuelta, así que va a depender más del cálculo independiente.
- **Ítems con gráfico:** su traducción a `checkpoints` requiere criterio. Claude Code propone los checkpoints y Mateo los aprueba en la revisión.
- **Respuestas que dependen de la tabla normal:** tolerancia del 1% para absorber el redondeo de `Tablas.pdf`.
- **Guías 9–12 y resueltas faltantes:** se suman cuando lleguen, sin cambios de formato.
