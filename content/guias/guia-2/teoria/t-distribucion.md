---
id: t-distribucion
skills: [funcion-distribucion, densidad]
---
## Función de distribución y densidad

Toda variable aleatoria, sea discreta, continua o mixta, tiene **función de
distribución**:

$$F_X(x) = P(X \le x)$$

Es no decreciente, va de 0 a 1, y es continua por derecha. De ella sale todo:

$$P(a < X \le b) = F_X(b) - F_X(a), \qquad P(X = a) = F_X(a) - F_X(a^-)$$

**Los saltos son masa puntual.** Donde $F_X$ salta, la variable concentra
probabilidad positiva, y el tamaño del salto es exactamente $P(X = a)$. Por eso
hay que mirar con cuidado si el intervalo es abierto o cerrado: con una
variable continua da lo mismo, pero con una que tiene saltos no.

Si $F_X$ es continua y derivable, la variable es **continua** y su derivada es
la **densidad**:

$$P(a < X < b) = \int_a^b f_X(x)\,dx$$

La densidad no es una probabilidad: $f_X(x)$ puede ser mayor que 1. Lo que es
una probabilidad es el área bajo ella.

**El control que conviene hacer siempre:** la densidad tiene que integrar 1
sobre todo su soporte. Si no da 1, hay un error en la constante o en los
límites, y conviene encontrarlo antes de seguir calculando.
