# Revisión de los exámenes

Estado del modo simulacro (PLAN.md §6).

El motor está completo: pool, timer configurable, toggles, entrega, nota de
0 a 10 y veredicto con el criterio de la cátedra.

**El pool tiene sólo exámenes completos y de cinco ejercicios** (`esRendible`
en `src/dominio/simulacro.ts`). Un examen recortado, o más corto que uno real,
no reproduce el que se va a tomar y no sirve para practicar. Los demás quedan
cargados (sus ejercicios cuentan para los skills a través del contenido) pero
no se ofrecen en el simulacro: son los pendientes de §1.2.

---

## 1. Exámenes

### 1.1 En el pool

| Examen | Fecha |
|---|---|
| Segundo recuperatorio | 07-12-2017 |
| Segundo recuperatorio | 14-12-2017 |
| Primer parcial | 26-05-2018 |
| Primer recuperatorio | 16-06-2018 |
| Evaluación parcial | 03-11-2018 |
| Primer recuperatorio | 24-11-2018 |
| Evaluación parcial | 01-06-2019 |
| Evaluación parcial | 27-05-2023 |
| Parcial, primera fecha | 24-05-2025 |
| Parcial, segunda fecha | 14-06-2025 |

### 1.2 Pendientes: no tienen sus cinco ejercicios

| Examen | Fecha | Cargados | Qué falta |
|---|---|---|---|
| Primer parcial | 28-10-2017 | 4 de 5 | ej 1 es de simulación, fuera de alcance |
| Primer recuperatorio | 18-11-2017 | 4 de 5 | ej 1 es de simulación, fuera de alcance |
| Primer recuperatorio | 15-06-2019 | 4 de 5 | ej 2 es de simulación, fuera de alcance |
| Primer parcial (parte 2) | 13-11-2021 | 3 de 3 | es la segunda mitad de un parcial dividido: tiene 3 ejercicios |

Ninguno de los cuatro puede completarse. Los tres con un ejercicio de
simulación no van a entrar nunca, porque ese ejercicio queda fuera de alcance
por CLAUDE.md, y el de 2021 es medio parcial.

Cómo se eligió qué cargar:

- **Solo la versión de PyE B.** Los PDF 02 a 11 traen dos exámenes: primero
  el de 61.06 - 81.09 y después el de 61.09 - 81.04. Se cargó el segundo. El
  12 (2021) y el 01 (2023) son comunes a varias materias. Ninguno es de
  Industrial.
- **Los ejercicios de simulación quedan fuera** (CLAUDE.md), listados con
  `en_alcance: false` y una nota que la app muestra al rendir.
- **El 27-05-2023 ej 2** pide construir una variable aleatoria con ciertas
  propiedades. Tiene infinitas respuestas correctas, así que va como opción
  múltiple con cuatro variables candidatas: la del examen de referencia, una
  con la media corrida, una que no es medible respecto de $\mathcal{A}$ y una
  con la varianza equivocada. El modelo comprueba que sólo la primera cumple
  todo.
- **Criterio de aprobación.** Los PDF de 2017–2019 no lo enuncian, y el
  escaneo de 2023 tampoco lo muestra; se usa `aprueba_con: 3`, el criterio
  actual para cinco ejercicios, y queda comentado en cada YAML. El de 2021
  dice "al menos 2 de 3".
- **Figuras.** Tres enunciados dependen de una figura: el gráfico de $F_X$
  del 16-06-2018, el recinto del 14-12-2017 y el circuito del 26-05-2018. Se
  rasterizaron y se transcribieron como fórmula o como texto (los
  interruptores están en paralelo), y el enunciado lo aclara.
- **Fuentes escaneadas.** El 01 (2023) es un examen de alumno corregido con
  nota 10; sus respuestas son la referencia. El 12 (2021) tiene la resolución
  manuscrita en las páginas 2 a 5.

Cada ejercicio cargado tiene su modelo en `tools/verify/epAAAAMMDD.py` (un
módulo por examen, con un modelo por ejercicio) y se contrasta contra la
resolución. Los de TCL usan como segundo camino la distribución exacta de la
suma cuando se puede calcular (binomial, Gamma, convolución discreta), y los
de "$n$ mínimo" verifican además el despeje y la minimalidad.

El motor todavía sabe calificar un examen recortado (reescala la nota y marca
el veredicto como parcial), pero ya no se ofrece ninguno: la decisión de fondo
pasó a ser que un examen que no está completo no entra al pool, en lugar de
presentarlo corto.

## 2. Discrepancias con las resoluciones

Tres valores no coinciden con la resolución. Los tres están en estado
`discrepancia`, con la nota en el YAML.

**15-06-2019 ej 5 (pallets de ladrillos).** La resuelta despeja "n > 33.12" y
concluye 34. Con 34 pallets la media de ladrillos útiles es 4039.2 y el desvío
40.2, de modo que $P(T > 4000) \approx \Phi(0.975) = 0.835$, lejos de 0.95. El
despeje correcto da $n > 34.23$, o sea **35**, y la binomial exacta da el
mismo mínimo. El error se ve sin hacer cuentas: $4000/118.8 = 33.67$ ya supera
33.12, y con la media por debajo de 4000 la probabilidad no puede pasar de
1/2. Se carga 35; la app rechaza 34.

**27-05-2023 ej 4 (orcos, enanos y hobbits).** El examen de referencia da
0.371 porque redondea $4/9$ a 0.44 antes de sumar la binomial; con 0.44 se
obtiene exactamente 0.3706. Con $4/9$ el resultado es
$1817344/4782969 = 0.3800$. El corrector lo marcó como bien, porque el
planteo es correcto. Se carga 0.3800, con la tolerancia por defecto (1 %), así
que la app rechaza 0.371. La última pista advierte que no hay que redondear la
probabilidad condicional.

**13-11-2021 ej 3 (manzanas premium).** La resuelta llega a
$4720 - 24u \le -723.712 + 3.2896u$ y concluye $u \ge 199.6$, pero de ahí sale
$u \ge 5443.712 / 27.2896 = 199.48$. Es una diferencia de 0.06 %; la
tolerancia del ítem (0.2 %) acepta las dos. Se carga 199.48.

Además hay dos ítems donde el valor cargado no es el único defendible, y no
son discrepancias:

- **01-06-2019 ej 5.** La resuelta da 0.0255 sin corrección por continuidad y
  0.0228 con ella. Se carga la corregida con `tol_rel: 0.13`, que acepta las
  dos y la binomial exacta (0.0237).
- **16-06-2018 ej 5.** El TCL da 57 catálogos, como la resuelta; con la
  distribución exacta de la suma alcanza con 56. El enunciado dice "estimar",
  así que se carga 57.

## 3. Los parciales de 2025

Están completos y en el pool. No tienen resuelta, así que cada valor viene
sólo de su modelo (`tools/verify/ep20250524.py` y `ep20250614.py`), calculado
por dos caminos independientes:

| Examen | Ej | Valor | Segundo camino |
|---|---|---|---|
| 24-05 | 1 | $15/61$ | Monte Carlo |
| 24-05 | 2 | $\sqrt{5}/2 - 1 \approx 0{,}1180$ | regresión por integración numérica y Monte Carlo por rechazo sobre la conjunta |
| 24-05 | 3 | $F_W(1/2) = 1/3$, $F_W(1) = 2/3$, $F_W(3/2) = 5/6$ | Monte Carlo por rechazo |
| 24-05 | 4 | $14 \cdot 0{,}1 \cdot 0{,}9^{13} \approx 0{,}3559$ | incrementos independientes y Bayes, sin las uniformes; Monte Carlo |
| 24-05 | 5 | 5115251,67 | cuantil de la distribución exacta (5114000) |
| 14-06 | 1 | $6/11$ | Monte Carlo |
| 14-06 | 2 | $9/5$ | Monte Carlo |
| 14-06 | 3 | $F_W(1/3) = 1/3$, $F_W(3/4) = 3/4$, $F_W(3/2) = 1$ | Monte Carlo por rechazo |
| 14-06 | 4 | $1 - \frac{65}{2} e^{-7} \approx 0{,}9704$ | condicionando sobre el total, sin la independencia; Monte Carlo |
| 14-06 | 5 | 1134 | distribución exacta (convolución), mismo mínimo |

Decisiones:

- **Variante del 24-05 ej 2.** Se cargó la de "Otros cursos",
  $P(E(Y \mid X) < 10)$, porque `curso` está en `null` en
  `content/config.yaml` y la del Curso 4 es la excepción. La tarjeta del
  simulacro muestra la variante. La del Curso 4, $E(Y \mid X = 3) = 18$,
  queda en el modelo como control, y la app rechaza 18 como respuesta.
- **"Hallar y graficar".** Los dos ej 3 piden además el gráfico de $F_W$, que
  no se puede validar. Van como `checkpoints`, igual que los de 2017 y 2023.
- **El monto del 24-05 ej 5** se informa al centavo, como el umbral en gramos
  del 13-11-2021, y lleva `tol_rel: 0.002`. Acepta el cuantil de la tabla
  redondeado (de 1,64 a 1,65) y el de la distribución exacta, pero no un error
  en la varianza, que corre el resultado en más de un 1 %.
- **El 14-06 ej 5** da 1134 con cualquier redondeo de $z$ entre 1,64 y 1,65,
  y la distribución exacta da el mismo mínimo. Va con tolerancia de entero.
- **El 14-06 ej 2** da $9/5$ independientemente de la moneda, porque la
  hipergeométrica y la binomial tienen la misma media. Las pistas no lo
  anticipan.

## 4. Exámenes que todavía no se cargaron

### 4.1 Las tres integradoras de PyE B

`EI_20250710-PyE-B.pdf`, `EI-20250717-PyE-B.pdf`, `EI-20250807-PyE-A-B.pdf`.
Son de una página y con capa de texto limpia. Según PLAN.md §6 los ejercicios
1–3 están en alcance y el 4 y el 5 son de estadística (guías 9–12). El toggle
"Incluir integradoras" ya existe en la app, pero con la política del pool
(§1) una integradora entra recién con sus cinco ejercicios cargados, y eso
requiere el contenido de estadística, que todavía no existe.

### 4.2 Los dos `*-ProbIND`

`EI-20250717-ProbIND.pdf` y `EI-20250807-ProbIND.pdf` quedan **excluidos**: son
de la cursada de Industrial.

**Cuidado con el filtro.** Los parciales comunes traen las tres materias en el
encabezado:

```
PROBABILIDAD - 81.16 CB004
PROBABILIDAD y ESTADÍSTICA A - 61.06 81.03
PROBABILIDAD y ESTADÍSTICA B - 61.09 81.04 CB003
```

Así que el filtro por encabezado **no alcanza**: hay que filtrar por ejercicio
y por variante, no por archivo. Por eso el esquema tiene `guias` y
`en_alcance` en cada ejercicio y no en el examen.

## 5. Pendiente de diseño

- **El campo `curso`.** PLAN.md §6 dice que se carga la variante que
  corresponde al curso de Mateo. `content/config.yaml` tiene `curso: null`,
  y con ese valor se cargó la variante general del 24-05 ej 2 (§3). Si el
  curso resulta ser el 4, alcanza con cambiar el ítem por
  $E(Y \mid X = 3) = 18$, que ya está verificado en el modelo. La app no
  elige variantes por curso; hasta ahora no hizo falta, porque es el único
  ejercicio con dos.
- **Reintentar un simulacro.** Hoy se puede abandonar y empezar otro, pero el
  intento por ítem por día sigue valiendo, así que rendir el mismo examen dos
  veces en el día no vuelve a contar para las insignias. Es lo que dice §5 y
  probablemente sea lo correcto, pero conviene confirmarlo ahora que el pool
  tiene 10 exámenes.
- **La duración la elige el alumno**, antes de que se sortee el examen. El
  parcial de 2021 duraba 2 h 30 y tiene 3 ejercicios, pero se rinde con la
  duración configurada (4 h por defecto). Si se quiere respetar la del
  examen, el campo `duracion_min` ya está en cada YAML.
