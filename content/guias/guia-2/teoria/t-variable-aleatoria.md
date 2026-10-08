---
id: t-variable-aleatoria
skills: [variable-aleatoria]
---
## Qué es una variable aleatoria

Una variable aleatoria es una función $X : \Omega \to \mathbb{R}$, pero no
cualquiera: tiene que ser **medible** respecto del álgebra $\mathcal{A}$ con la
que se armó el espacio. La condición es

$$\{\omega : X(\omega) \le t\} \in \mathcal{A} \qquad \text{para todo } t \in \mathbb{R}$$

y la razón es simple: si querés poder preguntar "¿cuál es la probabilidad de
que $X \le t$?", ese conjunto tiene que ser un evento al que $P$ le asigne un
número.

**Cuándo falla.** Si $\mathcal{A}$ es todo $2^\Omega$ —el caso habitual—
cualquier función sirve y la condición es gratis. El requisito muestra los
dientes cuando el álgebra es chica: ahí $X$ no puede distinguir entre puntos
que el álgebra no distingue.

Concretamente, si $\mathcal{A}$ está generada por una partición, $X$ tiene que
ser **constante en cada bloque**. Si tomara dos valores distintos dentro de un
bloque, la preimagen de un intervalo partiría ese bloque al medio y el
resultado no estaría en $\mathcal{A}$.

Es una forma de decir que el álgebra mide cuánta información hay disponible, y
la variable no puede usar más información que la que hay.
