---
id: t-varianza-covarianza
skills: [varianza, covarianza]
---
## Varianza y covarianza

La varianza mide la dispersión de una variable alrededor de su media:

$$\operatorname{var}[X] = E\!\left[(X - \mu)^2\right] = E[X^2] - (E[X])^2$$

La segunda expresión es la más práctica para calcular, y muestra además que
$E[X^2] = \sigma^2 + \mu^2$, valor que nunca es menor que $\mu^2$.

Para dos variables, la **covarianza** mide en qué medida varían
conjuntamente:

$$\operatorname{cov}(X, Y) = E[XY] - E[X]\,E[Y]$$

Su utilidad reside en sus propiedades, que permiten calcular sin volver a
integrar:

$$\operatorname{var}[X + Y] = \operatorname{var}[X] + \operatorname{var}[Y] + 2\operatorname{cov}(X, Y)$$

$$\operatorname{cov}(aX + bY + c,\ Z) = a\operatorname{cov}(X, Z) + b\operatorname{cov}(Y, Z)$$

La constante $c$ no aparece en el resultado, porque trasladar una variable
no modifica su covarianza con otra. Además, la covarianza de una variable
consigo misma es su varianza, lo que permite usar la segunda fórmula para
calcular la varianza de cualquier combinación lineal.

**Covarianza nula no implica independencia.** Si $X$ e $Y$ son
independientes, entonces $\operatorname{cov}(X,Y) = 0$, pero la recíproca es
falsa, ya que existen variables fuertemente dependientes con covarianza
nula. Para establecer la independencia hay que analizar la distribución
conjunta.
