---
id: t-continuidad
skills: [continuidad-P]
---
## Continuidad de P

Muchas preguntas involucran infinitos eventos simultáneamente, como "el dado
nunca sale 6" o "el juego no termina nunca". Estos eventos se escriben como
intersección o unión de una **sucesión** de eventos, y su probabilidad se
calcula como un límite.

Si la sucesión es decreciente, $B_{n+1} \subset B_n$, entonces

$$P\!\left(\bigcap_{n \ge 1} B_n\right) = \lim_{n \to \infty} P(B_n)$$

Si es creciente, $A_n \subset A_{n+1}$, vale el resultado análogo para la
unión. Esta propiedad es la **continuidad** de $P$ y se deduce de la
aditividad numerable.

La aplicación más habitual es la siguiente. Si $B_n$ es el evento "los
primeros $n$ intentos fallaron", entonces $P(B_n) = q^n$ con $q < 1$, y la
intersección de todos ellos, "todos los intentos fallan", tiene probabilidad
$\lim q^n = 0$. Un evento no vacío puede tener probabilidad cero; que el dado
nunca salga 6 es posible, pero tiene probabilidad nula.
