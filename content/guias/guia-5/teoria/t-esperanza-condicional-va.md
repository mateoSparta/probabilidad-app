---
id: t-esperanza-condicional-va
skills: [esperanza-condicional, esperanza-total]
---
## E[Y | X] es una variable aleatoria

Hasta la guía 3, se condicionaba a un **evento** y el resultado era un
número. En esta guía, $E[Y \mid X]$ se condiciona a una **variable**, y el
resultado es otra variable aleatoria.

Primero se calcula la **función de regresión**, que es una función real:

$$\varphi(x) = E[Y \mid X = x]$$

Luego se define $E[Y \mid X] = \varphi(X)$, reemplazando el valor $x$ por la
variable $X$. El resultado es aleatorio porque $X$ lo es.

Al ser una variable aleatoria, admite esperanza, y de ello se obtiene la
herramienta más útil de la guía, la **fórmula de esperanza total**:

$$E[Y] = E\big[E[Y \mid X]\big]$$

El promedio de las medias condicionales es la media. La fórmula se aplica
cuando el problema se descompone naturalmente en casos, por ejemplo según la
senda que elige la rata o según la moneda que salió.

### Dos herramientas complementarias

**Planteos recursivos.** Si la rata vuelve al punto de partida cuando elige
una senda equivocada, el tiempo que le resta tiene la misma media que el
tiempo original. Esto da una ecuación con la incógnita en ambos miembros, que
se resuelve despejando. Omitir ese término es el error más común, y conduce
al promedio de los tiempos en lugar de la respuesta correcta.

**La identidad de Wald**, que se aplica a la suma de una cantidad aleatoria
de términos:

$$E\!\left[\sum_{i=1}^{N} L_i\right] = E[N]\, E[L]$$

Vale si $N$ es un tiempo de parada respecto de los $L_i$, como en el caso
típico de producir hasta obtener una unidad que cumpla una condición. El
resultado parece contraintuitivo, porque el último término está condicionado
a cumplir la condición y cabría esperar un total mayor. Sin embargo, el
último término es más largo que el promedio, los $N-1$ anteriores son más
cortos, y ambos efectos se compensan exactamente.
