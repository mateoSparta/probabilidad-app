---
id: t-continuidad
skills: [continuidad-P]
---
## Continuidad de P

Muchas preguntas involucran infinitos eventos a la vez: "que el dado nunca
salga 6", "que el juego dure para siempre". Esos eventos se escriben como
intersección o unión de una **sucesión** y se calculan pasando al límite.

Si la sucesión es decreciente, $B_{n+1} \subset B_n$, entonces

$$P\!\left(\bigcap_{n \ge 1} B_n\right) = \lim_{n \to \infty} P(B_n)$$

y si es creciente, $A_n \subset A_{n+1}$, vale lo mismo con la unión y el
límite. Esto es la **continuidad** de $P$, y es consecuencia de la aditividad
numerable.

El uso típico: si $B_n$ es "los primeros $n$ intentos fallaron", entonces
$P(B_n) = q^n$ con $q < 1$, y la intersección de todos —"fallan siempre"— tiene
probabilidad $\lim q^n = 0$. Un evento puede ser no vacío y tener probabilidad
cero: que el dado nunca salga 6 es posible, pero tiene probabilidad nula.
