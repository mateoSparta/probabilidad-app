---
id: t-varianza-covarianza
skills: [varianza, covarianza]
---
## Varianza y covarianza

La varianza mide la dispersión alrededor de la media:

$$\operatorname{var}[X] = E\!\left[(X - \mu)^2\right] = E[X^2] - (E[X])^2$$

La segunda forma es la que se usa para calcular, y de paso dice algo útil:
$E[X^2] = \sigma^2 + \mu^2$, siempre mayor que $\mu^2$.

Para dos variables, la **covarianza** mide cómo se mueven juntas:

$$\operatorname{cov}(X, Y) = E[XY] - E[X]\,E[Y]$$

Lo que la hace valiosa son sus propiedades, porque permiten calcular sin volver
a integrar:

$$\operatorname{var}[X + Y] = \operatorname{var}[X] + \operatorname{var}[Y] + 2\operatorname{cov}(X, Y)$$

$$\operatorname{cov}(aX + bY + c,\ Z) = a\operatorname{cov}(X, Z) + b\operatorname{cov}(Y, Z)$$

La constante $c$ desaparece: trasladar una variable no cambia cómo covaría con
otra. Y la covarianza de una variable consigo misma es su varianza, lo que
permite usar la segunda fórmula para resolver combinaciones lineales
cualesquiera.

**Covarianza cero no implica independencia.** Si $X$ e $Y$ son independientes
entonces $\operatorname{cov}(X,Y) = 0$, pero la vuelta es falsa: hay variables
muy dependientes con covarianza nula. Para decidir independencia hay que mirar
la conjunta, no la covarianza.
