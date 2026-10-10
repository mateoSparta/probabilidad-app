---
id: t-varianza-total
skills: [varianza-total]
---
## Varianza total

La varianza también se descompone al condicionar, aunque de manera distinta
que la esperanza. Promediar las varianzas condicionales no alcanza, porque
hay que sumar la variabilidad que aporta la variable condicionante.

$$\operatorname{var}[Y] = E\big[\operatorname{var}[Y \mid X]\big] + \operatorname{var}\big[E[Y \mid X]\big]$$

Cada término tiene una interpretación precisa.

- $E[\operatorname{var}[Y \mid X]]$ es la variabilidad que queda **dentro**
  de cada valor de $X$, promediada.
- $\operatorname{var}[E[Y \mid X]]$ es la variabilidad que se debe a que
  **$X$ varía**, y con ella se desplaza el centro de la distribución de $Y$.

Usar solo el primer término subestima la varianza, y es el error más
frecuente.

La fórmula se conoce como **teorema de Pitágoras** porque los dos términos
son ortogonales y se suman sin término cruzado, como los cuadrados de los
catetos. En términos geométricos, $E[Y \mid X]$ es la proyección de $Y$
sobre el espacio de las funciones de $X$, y el residuo es perpendicular a
esa proyección.

Un caso que permite fijar la fórmula es el siguiente. Si $Y \mid X$ tiene
distribución de Poisson de parámetro $X$, entonces
$E[Y \mid X] = \operatorname{var}[Y \mid X] = X$, y la fórmula da
$\operatorname{var}[Y] = E[X] + \operatorname{var}[X]$. La varianza de $Y$ es
mayor que la de una Poisson con media fija, fenómeno conocido como
sobredispersión.
