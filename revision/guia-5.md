# Revisión de la Guía 5

Estado: **6 ejercicios cargados, 10 ítems, 4 skills nuevos, 3 bloques de teoría.**

El núcleo recomendado son 11 ejercicios. Se cargaron 6; de los otros 5, tres
dependen de ejercicios no cargados y dos tienen problemas de extracción.

---

## 1. Lo cargado

| Ejercicio | Ítems | Qué practica |
|---|---|---|
| 5.9 | a | Bayes con **dato continuo**: densidades en vez de probabilidades |
| 5.12 | a, b | que `E[Y|X]` sea una variable, y una covarianza de correlación −1 |
| 5.13 | a | esperanza total **autorreferente** (la rata en el laberinto) |
| 5.21 | a, b, c | esperanza total con parada, e identidad de Wald |
| 5.23 | a (2 checkpoints) | media y varianza con una cantidad aleatoria de términos |
| 5.16 | a | varianza total, el "teorema de Pitágoras" |

---

## 2. Un error mío que el control atrapó, y vale leer

Al escribir el modelo del **5.21** anoté que la coincidencia entre los dos
métodos era casualidad del ejercicio:

- separando el último rollo: $4 \cdot 24 + 29 = 125$
- ingenuamente $E[N]\,E[L] = 5 \cdot 25 = 125$

Mi razonamiento era el habitual: "el último rollo no es uno cualquiera, está
condicionado a medir al menos 28, así que el total debería ser mayor que
$E[N]E[L]$". Puse un control con el corte en 26 esperando que ahí se separaran.

**No se separan.** Y no se separan para ningún corte: es la **identidad de
Wald**, que vale porque $N$ es un tiempo de parada sobre rollos independientes
e idénticos. La intuición falla porque el último rollo es más largo que el
promedio pero los $N-1$ anteriores son más cortos, y las dos cosas se
compensan exactamente.

El modelo ahora verifica Wald para los cortes 22, 24, 26 y 29, y la teoría y
las pistas del ejercicio lo explican. Lo cuento porque es justo el tipo de cosa
que el pipeline de verificación existe para atrapar: la cuenta estaba bien,
pero la explicación que la acompañaba estaba mal.

---

## 3. Lo que falta del núcleo

### 3.1 Tres que dependen de ejercicios no cargados

| Ejercicio | Depende de |
|---|---|
| 5.4 | la densidad conjunta del 3.22, que quedó con fracciones incompletas |
| 5.18 | el vector del 5.2, que no está cargado |
| 5.10 | referencia cruzada menor, pero ver abajo |

El **5.10** (los RoboCops) en realidad es autónomo y cargable: pide las dos
funciones de regresión, $E[Y \mid X = x] = 4x/5$ y
$E[X \mid Y = y] = y + (6-y)/16$, las dos como tipo `expresion`. La segunda es
el lado interesante, porque hay que notar que las fallas no detectadas siguen
siendo binomiales entre los robots que no se detectaron. Lo dejé por tiempo,
no por un problema: es el candidato más fácil para seguir en esta guía.

### 3.2 Ejercicio 5.11 — glifos sin traducir

El ítem (a).2 define $Y(\omega) = \operatorname{sen}(\pi \omega / 2)$ (o algo
parecido) y los delimitadores grandes salieron sin traducir. Hay que leer la
página 31. El resto del ejercicio es mecánico y bueno: $E[Y \mid X]$ sobre un
espacio finito explícito, que es la forma más concreta de ver que la esperanza
condicional es una variable.

### 3.3 Ejercicio 5.15 — cargable, decisión pendiente

$Z$ normal estándar con $E[Y \mid Z] = Z^2$; pide $\operatorname{cov}(Z, Y)$.
La respuesta es **0**, porque
$\operatorname{cov}(Z,Y) = E[Z\,E[Y|Z]] = E[Z^3] = 0$ por simetría.

Es un ejercicio conceptualmente valioso —covarianza nula con dependencia
total— pero la respuesta numérica es 0 y se adivina. Si se carga, conviene
hacerlo con un ítem `opcion` sobre qué significa ese 0, no sólo con el número.
Lo dejé pendiente para decidirlo con criterio.

### 3.4 Ejercicio 5.25 — fuera de alcance

Marcado con `Ï`.

---

## 4. Skills de la guía

| Skill | Ítems que lo evalúan |
|---|---|
| `mezclas` | 5.9 a |
| `esperanza-condicional` | 5.12 a, b, 5.13 a, 5.16 a |
| `esperanza-total` | 5.13 a, 5.21 a, b, c, 5.23 a |
| `varianza-total` | 5.16 a |

`mezclas` y `varianza-total` tienen un solo ítem cada uno, así que no pueden
llegar a "dominado" (hacen falta 3 intentos limpios en los últimos 5, y cuenta
uno por día). Se arregla cargando más ejercicios: el 5.10 aporta a
`esperanza-condicional` y hay varios de mezclas en los complementarios.

---

## 5. Decisiones de contenido

- **5.12(a)** usa `X` como nombre de variable en la expresión, que es lo
  natural acá pero rompe la convención de minúsculas que usé en 4.14 (`l1`,
  `l2`, `t`). Funciona igual; vale unificarlo en algún momento.
- **5.16** el modelo no se queda en aplicar la fórmula: construye una $Y$
  concreta que cumple las dos condiciones del enunciado ($Y \mid X$ Poisson de
  parámetro $X$, que tiene media y varianza iguales a $X$) y mide
  $\operatorname{var}[Y]$ por simulación. Así el teorema queda verificado y no
  sólo citado.
- **5.9** da $\approx 0{,}334$, casi exactamente $1/3$. No es un error: las
  tres amplitudes del alfabeto están separadas por $0{,}1$ y el ruido tiene
  desvío 1, así que la observación casi no discrimina. Vale la pena que se vea,
  porque enseña a desconfiar de un canal con mala relación señal-ruido.

---

## 6. Pendiente

Sin cruzar contra las resueltas. Para la guía 5 hay dos (`RES 2`, `RES 3`),
37 páginas escaneadas.

```
npm run rasterizar -- fuentes/resueltas/guia-5
```
