---
id: t-esperanza
skills: [esperanza, momentos]
---
## Esperanza

La esperanza es el centro de masa de la distribución. Para una variable
continua es

$$E[X] = \int_{-\infty}^{\infty} x\, f_X(x)\, dx$$

y para una discreta, la suma de los valores por sus probabilidades.

**Si la variable es mixta hay que sumar las dos cosas.** Donde $F_X$ es
derivable se integra la densidad; donde $F_X$ salta hay un átomo y se suma el
valor por el tamaño del salto. Olvidarse los átomos es el error más común con
estas variables, y se detecta rápido: si la masa total no da 1, falta algo.

### La media no pasa por dentro de una función

Esto vale subrayarlo porque cuesta:

$$E[g(X)] \ne g(E[X]) \qquad \text{si } g \text{ no es lineal}$$

Para la esperanza de una función hay que integrar **la función** contra la
densidad:

$$E[g(X)] = \int g(x)\, f_X(x)\, dx$$

Si el alambre tiene largo medio 60 cm, el área del círculo que forma **no** es
el área del círculo de 60 cm: hace falta $E[L^2]$, que es más grande que
$E[L]^2$. La diferencia es exactamente la varianza.

Para las transformaciones lineales sí vale lo esperable:
$E[aX + b] = a E[X] + b$. Es el único caso donde se puede meter la esperanza
adentro sin pensar.
