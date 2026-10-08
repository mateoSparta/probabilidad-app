---
id: t-varianza-total
skills: [varianza-total]
---
## Varianza total

La varianza también se descompone condicionando, pero no igual que la
esperanza. No alcanza con promediar las varianzas condicionales: hay que sumar
la variabilidad que aporta el propio condicionante.

$$\operatorname{var}[Y] = E\big[\operatorname{var}[Y \mid X]\big] + \operatorname{var}\big[E[Y \mid X]\big]$$

Los dos términos tienen lectura clara:

- $E[\operatorname{var}[Y \mid X]]$ es la variabilidad que queda **dentro** de
  cada valor de $X$, promediada.
- $\operatorname{var}[E[Y \mid X]]$ es la variabilidad que viene de que **$X$
  varía**, y con ella se corre el centro de $Y$.

Si se usa sólo el primero se subestima la varianza, y es el error típico.

Se la llama **teorema de Pitágoras** porque los dos términos son ortogonales:
se suman sin término cruzado, como los catetos. La versión geométrica es que
$E[Y \mid X]$ es la proyección de $Y$ sobre las funciones de $X$, y lo que
queda —el residuo— es perpendicular a esa proyección.

Un caso cómodo para fijarla: si $Y \mid X$ es Poisson de parámetro $X$,
entonces $E[Y \mid X] = \operatorname{var}[Y \mid X] = X$, y la fórmula da
$\operatorname{var}[Y] = E[X] + \operatorname{var}[X]$. La varianza de $Y$ es
mayor que la de una Poisson de media fija: eso es la sobredispersión que
aparece al mezclar.
