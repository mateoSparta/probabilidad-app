---
id: t-distribucion
skills: [funcion-distribucion, densidad]
---
## Función de distribución y densidad

Toda variable aleatoria, ya sea discreta, continua o mixta, tiene una
**función de distribución**:

$$F_X(x) = P(X \le x)$$

Esta función es no decreciente, tiende a 0 en $-\infty$ y a 1 en $+\infty$,
y es continua a derecha. A partir de ella se calcula cualquier probabilidad
asociada a $X$:

$$P(a < X \le b) = F_X(b) - F_X(a), \qquad P(X = a) = F_X(a) - F_X(a^-)$$

**Los saltos corresponden a masas puntuales.** En los puntos donde $F_X$ es
discontinua, la variable concentra probabilidad positiva, y la magnitud del
salto es exactamente $P(X = a)$. Por eso hay que prestar atención a si los
intervalos son abiertos o cerrados. Para una variable continua la distinción
no altera el resultado, pero para una variable con saltos sí.

Si $F_X$ es continua y derivable salvo en finitos puntos, la variable es
**continua** y su derivada es la **densidad**:

$$P(a < X < b) = \int_a^b f_X(x)\,dx$$

La densidad no es una probabilidad, y $f_X(x)$ puede tomar valores mayores
que 1. La probabilidad está dada por el área bajo la curva.

**Un control que conviene hacer siempre** es verificar que la densidad
integre 1 sobre su soporte. Si la integral no da 1, hay un error en la
constante o en los límites de integración, y conviene corregirlo antes de
continuar.
