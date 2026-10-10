---
id: t-condicionar-Nt
skills: [condicionar-Nt]
---
## Condicionar a N(t) = n

Esta es la propiedad más útil de la guía y también la menos evidente:

> Si se sabe que en $(0, t]$ ocurrieron exactamente $n$ eventos, sus tiempos
> de arribo, sin tener en cuenta el orden, se distribuyen como $n$ variables
> **uniformes independientes** en $(0, t]$.

En otras palabras, al condicionar al total, el proceso se reduce a $n$
puntos distribuidos al azar en el intervalo.

La consecuencia práctica es importante, porque **la intensidad $\lambda$ deja
de intervenir en el cálculo**. Si el enunciado dice "sabiendo que arribaron
exactamente 3 llamadas", el dato de 4 llamadas por hora ya no se usa y el
problema se reduce a razonar con variables uniformes. Si $\lambda$ aparece en
el resultado, probablemente no se aplicó esta propiedad.

De ella se deduce que el conteo en un subintervalo tiene distribución
binomial,

$$P(N(s) = k \mid N(t) = n) = \binom{n}{k}\left(\frac{s}{t}\right)^{k}\left(1 - \frac{s}{t}\right)^{n-k}$$

ya que cada uno de los $n$ puntos cae en $(0, s]$ con probabilidad $s/t$,
independientemente de los demás.

Las preguntas sobre el orden de los arribos se traducen en conteos. "La
primera llamada llegó antes de $s$" equivale a "al menos uno de los $n$
puntos cayó antes de $s$", y "la segunda llegó antes de $s$" equivale a "al
menos dos cayeron antes de $s$".
