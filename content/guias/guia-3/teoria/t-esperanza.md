---
id: t-esperanza
skills: [esperanza, momentos]
---
## Esperanza

La esperanza es el centro de masa de la distribución. Para una variable
continua es

$$E[X] = \int_{-\infty}^{\infty} x\, f_X(x)\, dx$$

y para una discreta es la suma de los valores ponderados por sus
probabilidades.

**Si la variable es mixta, hay que sumar ambas contribuciones.** En los
tramos donde $F_X$ es derivable se integra la densidad, y en cada salto de
$F_X$ hay un átomo cuyo valor se suma multiplicado por el tamaño del salto.
Omitir los átomos es el error más común con este tipo de variables, y se
detecta con facilidad, porque la masa total deja de sumar 1.

### La esperanza de una función

Este punto merece atención especial:

$$E[g(X)] \ne g(E[X]) \qquad \text{si } g \text{ no es lineal}$$

Para calcular la esperanza de una función hay que integrar **la función**
contra la densidad:

$$E[g(X)] = \int g(x)\, f_X(x)\, dx$$

Si un alambre tiene longitud media de 60 cm, el área media del círculo que
forma **difiere** del área del círculo de 60 cm de perímetro. Hace falta
$E[L^2]$, que es mayor que $E[L]^2$, y la diferencia entre ambos es
exactamente la varianza.

Para las transformaciones lineales vale la propiedad esperada,
$E[aX + b] = a E[X] + b$. Es el único caso en que la esperanza conmuta con
la función.
