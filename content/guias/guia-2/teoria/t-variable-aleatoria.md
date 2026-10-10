---
id: t-variable-aleatoria
skills: [variable-aleatoria]
---
## Qué es una variable aleatoria

Una variable aleatoria es una función $X : \Omega \to \mathbb{R}$ que además
debe ser **medible** respecto del álgebra $\mathcal{A}$ del espacio de
probabilidad. La condición es

$$\{\omega : X(\omega) \le t\} \in \mathcal{A} \qquad \text{para todo } t \in \mathbb{R}$$

y su justificación es directa. Para calcular la probabilidad de que
$X \le t$, ese conjunto debe ser un evento al que $P$ le asigne un valor.

**Cuándo falla la condición.** Si $\mathcal{A}$ es el conjunto de partes
$2^\Omega$, que es el caso habitual, toda función es medible. La condición se
vuelve restrictiva cuando el álgebra es pequeña, porque en ese caso $X$ no
puede distinguir puntos que el álgebra no distingue.

En particular, si $\mathcal{A}$ está generada por una partición, $X$ debe ser
**constante en cada bloque**. Si tomara dos valores distintos dentro de un
bloque, la preimagen de algún intervalo dividiría ese bloque y no
pertenecería a $\mathcal{A}$.

Intuitivamente, el álgebra representa la información disponible, y una
variable aleatoria no puede depender de más información que esa.
