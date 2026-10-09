# Revisión de la Guía 6

Estado: **6 ejercicios cargados, 10 ítems, 4 skills nuevos, 2 bloques de teoría.**

Es la guía que salió más limpia de todas: de los 7 del núcleo recomendado se
cargaron 6, y el único que quedó afuera es por un enunciado cortado en la
extracción, no por nada conceptual. No hay ningún ejercicio de simulación ni de
demostración en el núcleo.

---

## 1. Lo cargado

| Ejercicio | Ítems | Qué practica |
|---|---|---|
| 6.1 | a, b | **dos binomiales encadenadas** (discos → paquetes) |
| 6.24 | a, b | hipergeométrica, con un máximo que **no es único** |
| 6.6 | a, b | pérdida de memoria de la geométrica |
| 6.12 | a | Pascal contra binomial |
| 6.19 | a, b | adelgazar un experimento con resultados que no cuentan |
| 6.11 | a | coleccionista con probabilidades **no** equiprobables |

---

## 2. El 6.1 y el error conocido de las resueltas

PLAN.md §7 cita este ejercicio como uno de los errores detectados en las
resueltas de la cátedra: ahí se usa $p = 0{,}01$ para el paquete cuando lo que
corresponde es $P(X \ge 2)$ con $X \sim \text{Bin}(10;\ 0{,}01)$.

Confirmado con el modelo:

| | valor |
|---|---|
| $P(\text{el paquete falla la garantía})$ | $0{,}004266$ |
| respuesta correcta del ítem (b) | $0{,}012690$ |
| lo que da usando $0{,}01$ (el error) | $0{,}029403$ |

O sea: **más del doble**. Los dos números quedaron anotados en
`fuentes_valor`, así que si algún día se cruza contra la resuelta la
discrepancia ya está documentada de antemano.

---

## 3. Cosas que aparecieron al verificar

**El 6.11 me corrigió una cuenta.** Lo hice primero a mano por
inclusión-exclusión y me dio $6{,}3$; el modelo da $73/10 = 7{,}3$. La
diferencia es el término de los **tres** colores faltando a la vez: aporta 1
(sólo el término $t = 0$ de $0^t$) y es fácil pasarlo por alto porque uno
piensa "la probabilidad de que falten los tres es cero". Es cero para todo
$t \ge 1$, pero no para $t = 0$. La pista del ítem lo advierte explícitamente.

**El 6.24 tiene empate en el máximo.** $k = 4$ y $k = 5$ dan exactamente
$5/9$, y el modelo lo verifica con un `assert` que exige dos argmax. Tiene
sentido: con 4 blancas y 5 negras, o con 5 y 5, la urna está igual de
equilibrada para sacar una de cada color. El ítem (b) es `opcion` justamente
para que el empate sea la respuesta y "k = 5" quede como distractor con su
explicación.

**Los modelos verifican la propiedad, no sólo el número.** El 6.6 calcula el
condicional por definición y después exige que coincida con la cola simple,
así la pérdida de memoria queda verificada. El 6.19 chequea que la función de
probabilidad sume 1 (serie geométrica).

---

## 4. Lo que falta del núcleo

### Ejercicio 6.14 — enunciado cortado

Es el único que falta, y es el de la **multinomial**, que es un hueco real en
la cobertura. El extractor dejó los dos ítems truncados:

```
(a) ... Calcular la probabilidad de que exactamente 5 provengan de la máquina A, 4 de la máquina B,
(b) Si se sabe que en 14 artículos ..., exactamente 5 provienen de la máquina A, ¿cuál es la probabilidad de que ha
```

El ítem (a) sigue con algo como "3 de C y 2 de D" —que sumaría los 14— pero es
una inferencia mía, no un dato. Y el (b) se corta en mitad de la pregunta. **Hay
que leer la página 39 del PDF.**

Una vez transcripto es directo: (a) es multinomial pura y (b) es la
distribución condicional de las otras máquinas dado el conteo de A, que vuelve
a ser multinomial sobre los 9 artículos restantes con las probabilidades
renormalizadas. Es el mismo razonamiento del 4.19.

**Falta entonces el skill `multinomial`**, que no agregué por la misma razón de
siempre: sin un ítem que lo evalúe, el validador rompe el build, y con razón.

---

## 5. Skills de la guía

| Skill | Ítems que lo evalúan |
|---|---|
| `bernoulli-binomial` | 6.1 a, b |
| `geometrica-pascal` | 6.6 a, 6.11 a, 6.12 a, 6.19 a, b |
| `perdida-memoria` | 6.6 b |
| `hipergeometrica` | 6.24 a, b |

PLAN.md §4.2 lista siete temas para la guía 6. Faltan `multinomial` (ver
arriba) y la Pascal está dentro de `geometrica-pascal` en vez de separada,
porque se practican juntas y el filtro queda más útil así.

---

## 6. Pendiente

Sin cruzar contra las resueltas. Para la guía 6 hay dos (`RES 2`, `RES 3`),
39 páginas escaneadas. **Ésta es la guía donde el cruce vale más**, porque el
error del 6.1 ya está identificado y conviene confirmar que es el único.

```
npm run rasterizar -- fuentes/resueltas/guia-6
```
