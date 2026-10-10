# Revisión de los exámenes

Estado del modo simulacro (PLAN.md §6).

El motor está completo: pool, timer configurable, toggles, entrega, nota de
0 a 10 y veredicto con el criterio de la cátedra. El pool de parciales tiene
**14 exámenes**: los dos de 2025, con un ejercicio cargado cada uno, y los 12
parciales resueltos de `fuentes/examenes/parciales/`, con 54 de sus 58
ejercicios cargados.

---

## 1. Qué se puede rendir hoy

| Examen | Fecha | Ejercicios | Rendibles | Fuera |
|---|---|---|---|---|
| Primer parcial | 28-10-2017 | 5 | 4 | ej 1 (simulación) |
| Primer recuperatorio | 18-11-2017 | 5 | 4 | ej 1 (simulación) |
| Segundo recuperatorio | 07-12-2017 | 5 | 5 | |
| Segundo recuperatorio | 14-12-2017 | 5 | 5 | |
| Primer parcial | 26-05-2018 | 5 | 5 | |
| Primer recuperatorio | 16-06-2018 | 5 | 5 | |
| Evaluación parcial | 03-11-2018 | 5 | 5 | |
| Primer recuperatorio | 24-11-2018 | 5 | 5 | |
| Evaluación parcial | 01-06-2019 | 5 | 5 | |
| Primer recuperatorio | 15-06-2019 | 5 | 4 | ej 2 (simulación) |
| Primer parcial (parte 2) | 13-11-2021 | 3 | 3 | |
| Evaluación parcial | 27-05-2023 | 5 | 4 | ej 2 (respuesta abierta) |
| Parcial | 24-05-2025 | 5 | 1 | ver §3 |
| Parcial | 14-06-2025 | 5 | 1 | ver §3 |

Cómo se eligió qué cargar:

- **Solo la versión de PyE B.** Los PDF 02 a 11 traen dos exámenes: primero
  el de 61.06 - 81.09 y después el de 61.09 - 81.04. Se cargó el segundo. El
  12 (2021) y el 01 (2023) son comunes a varias materias. Ninguno es de
  Industrial.
- **Los ejercicios de simulación quedan fuera** (CLAUDE.md), listados con
  `en_alcance: false` y una nota que la app muestra al rendir.
- **El 27-05-2023 ej 2** pide construir una variable aleatoria con ciertas
  propiedades: tiene infinitas respuestas correctas y no se puede validar con
  un valor.
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

Cuando un examen va recortado, **la nota se reescala sobre los ejercicios
presentados y el veredicto se marca parcial**, y la app lo dice en pantalla.
La decisión de fondo sigue siendo la misma: antes un examen corto que un valor
inventado.

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

## 3. Qué falta de los parciales de 2025

Los enunciados de los 10 ejercicios están transcriptos en
`content/examenes/*.yaml`, así que cargarlos es escribir sus ítems y su modelo
de verificación, no transcribir.

| Examen | Ej | Guías | Qué hace falta |
|---|---|---|---|
| 24-05 | 2 | 5 | Esperanza condicional. **Tiene variantes por curso**: Curso 4 pide $E(Y\mid X=3)$, los otros $P(E(Y\mid X) < 10)$. Hay que definir el campo `curso` en la configuración (PLAN.md §6) y elegir la variante |
| 24-05 | 3 | 2, 4 | Conjunta uniforme y distribución de $W = \lvert Y - X\rvert$. Va como `checkpoints` |
| 24-05 | 4 | 7 | Poisson: superposición y condicionamiento a $N(t)=n$ |
| 24-05 | 5 | 8 | TCL. **El enunciado quedó cortado** en la transcripción: hay que completarlo del PDF |
| 14-06 | 2 | 3, 6 | Esperanza de una mezcla de hipergeométrica y binomial |
| 14-06 | 3 | 2, 4 | Igual que el 3 del 24-05, con otra región |
| 14-06 | 4 | 7 | Poisson: adelgazamiento |
| 14-06 | 5 | 8 | TCL, hallar el $n$ mínimo |

## 4. Exámenes que todavía no se cargaron

### 4.1 Las tres integradoras de PyE B

`EI_20250710-PyE-B.pdf`, `EI-20250717-PyE-B.pdf`, `EI-20250807-PyE-A-B.pdf`.
Son de una página y con capa de texto limpia. Según PLAN.md §6 los ejercicios
1–3 están en alcance y el 4 y el 5 son de estadística (guías 9–12). El toggle
"Incluir integradoras" ya existe en la app y el pool las va a tomar en cuanto
tengan un ejercicio verificado.

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
  corresponde al curso de Mateo, definido en la configuración. El esquema ya
  tiene `variante` por ejercicio, pero la configuración todavía no tiene
  `curso` ni la app elige por él: hace falta recién cuando se cargue el ej 2
  del 24-05, que es el único con variantes hasta ahora.
- **Reintentar un simulacro.** Hoy se puede abandonar y empezar otro, pero el
  intento por ítem por día sigue valiendo, así que rendir el mismo examen dos
  veces en el día no vuelve a contar para las insignias. Es lo que dice §5 y
  probablemente sea lo correcto, pero conviene confirmarlo ahora que el pool
  tiene 14 exámenes.
- **La duración la elige el alumno**, antes de que se sortee el examen. El
  parcial de 2021 duraba 2 h 30 y tiene 3 ejercicios, pero se rinde con la
  duración configurada (4 h por defecto). Si se quiere respetar la del
  examen, el campo `duracion_min` ya está en cada YAML.
- **Las opciones no se barajan.** En todos los ítems de opción múltiple la
  correcta es la primera del YAML, y la app las muestra en ese orden. Con
  varios ítems de ese tipo el patrón se aprende.
