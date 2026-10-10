---
id: t-binomial
skills: [bernoulli-binomial, hipergeometrica]
---
## Binomial e hipergeométrica

La **distribución binomial** cuenta la cantidad de éxitos en $n$ ensayos
independientes con la misma probabilidad de éxito $p$:

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}, \qquad E[X] = np$$

El coeficiente binomial aparece porque los $k$ éxitos pueden ocurrir en
cualquier orden, y omitirlo es el error más frecuente de la guía.

La **distribución hipergeométrica** corresponde al mismo experimento **sin
reposición**:

$$P(X = k) = \frac{\dbinom{B}{k}\dbinom{N-B}{n-k}}{\dbinom{N}{n}}$$

En este caso los ensayos **no** son independientes, porque cada extracción
modifica la composición de la urna. Si la población es grande en relación
con la muestra, ambas distribuciones son muy parecidas, pero con poblaciones
pequeñas la diferencia es apreciable.

### Dos binomiales encadenadas

Hay un patrón que aparece con frecuencia. Cada paquete de 10 discos incumple
la garantía con cierta probabilidad $q$, y luego se compran 3 paquetes. El
problema tiene **dos niveles**. Primero se calcula $q$ con una binomial sobre
los discos, y después se usa $q$ en otra binomial sobre los paquetes.

El error habitual consiste en omitir el primer nivel y usar la probabilidad
de que un disco sea defectuoso como si fuera la probabilidad de que un
paquete incumpla la garantía. Ambas probabilidades son distintas, y la
diferencia puede ser de varios órdenes de magnitud.
