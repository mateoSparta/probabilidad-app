---
id: t-binomial
skills: [bernoulli-binomial, hipergeometrica]
---
## Binomial e hipergeométrica

La **binomial** cuenta éxitos en $n$ intentos independientes con la misma
probabilidad $p$:

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}, \qquad E[X] = np$$

El coeficiente binomial está porque los $k$ éxitos pueden caer en cualquier
orden. Olvidarlo es el error más frecuente de toda la guía.

La **hipergeométrica** es lo mismo pero **sin reposición**:

$$P(X = k) = \frac{\dbinom{B}{k}\dbinom{N-B}{n-k}}{\dbinom{N}{n}}$$

Acá los intentos **no** son independientes: sacar una blanca cambia la
composición de lo que queda. Si la población es grande respecto de la muestra
las dos distribuciones se parecen mucho, pero con poblaciones chicas la
diferencia importa.

### Dos binomiales encadenadas

Un patrón que aparece seguido: cada paquete de 10 discos falla la garantía con
cierta probabilidad $q$, y después se compran 3 paquetes. Hay **dos niveles**:
primero hay que calcular $q$ con una binomial sobre los discos, y después usar
$q$ en otra binomial sobre los paquetes.

El error clásico es saltearse el primer nivel y usar la probabilidad de un
disco defectuoso como si fuera la de un paquete que falla. No son lo mismo y la
diferencia puede ser de órdenes de magnitud.
