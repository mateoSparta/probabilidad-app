---
id: t-esperanza-condicional
skills: [esperanza-condicional-evento]
---
## Esperanza condicional a un evento

Sabiendo que ocurrió $A$, la media de $X$ se calcula sobre la distribución
condicional:

$$E[X \mid A] = \frac{E[X\, \mathbf{1}_A]}{P(A)}$$

En la práctica es lo mismo que antes: se integra $x$ contra la densidad
condicional, que es la original restringida a $A$ y renormalizada.

**Dónde está la trampa.** Con una variable que tiene átomos,
$E[X \mid X < 1]$ y $E[X \mid X \le 1]$ **no son lo mismo**. Si hay masa
puntual en $1$, el segundo la incluye y el primero no, así que cambian tanto el
numerador como el denominador. Con una variable continua los dos coinciden,
pero conviene no acostumbrarse a que da igual.

Un control que ayuda: $E[X \mid A]$ tiene que caer dentro del rango de valores
que $X$ puede tomar en $A$. Si condicionás a $X < 1$ y te queda una media mayor
que 1, hay un error.
