---
id: t-esperanza-condicional
skills: [esperanza-condicional-evento]
---
## Esperanza condicional a un evento

Si se sabe que ocurrió $A$, la media de $X$ se calcula con la distribución
condicional:

$$E[X \mid A] = \frac{E[X\, \mathbf{1}_A]}{P(A)}$$

En la práctica, se integra $x$ contra la densidad condicional, que es la
densidad original restringida a $A$ y renormalizada.

**Un detalle que suele generar errores.** Cuando la variable tiene átomos,
$E[X \mid X < 1]$ y $E[X \mid X \le 1]$ **pueden ser distintas**. Si hay una
masa puntual en $1$, el segundo evento la incluye y el primero no, de modo
que cambian tanto el numerador como el denominador. Para una variable
continua ambas coinciden, pero conviene no dar por sentada esa igualdad.

Un control útil es verificar que $E[X \mid A]$ quede dentro del rango de
valores que $X$ puede tomar en $A$. Si al condicionar a $X < 1$ se obtiene
una media mayor que 1, hay un error.
