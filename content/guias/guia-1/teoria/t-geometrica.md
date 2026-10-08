---
id: t-geometrica
skills: [prob-geometrica]
---
## Probabilidad geométrica

Cuando el resultado del experimento es un punto de un intervalo o de una
región, no se puede contar: hay infinitos resultados y cada uno tiene
probabilidad cero. Lo que se usa es la **medida**:

$$P(A) = \frac{\text{medida}(A)}{\text{medida}(\Omega)}$$

longitud en la recta, área en el plano, volumen en el espacio. "Al azar" acá
significa que la probabilidad es proporcional a la medida, no que todos los
puntos sean igualmente probables en el sentido de contar.

Dos consecuencias que conviene tener claras:

- Un evento puede ser **no vacío y tener probabilidad cero**. Que el número
  sorteado sea exactamente $1/2$ es posible y tiene probabilidad 0.
- Los enunciados sobre dígitos son geométricos disfrazados: pedir que los
  primeros tres dígitos sean $3,1,4$ es pedir que el número caiga en
  $[0{,}314,\ 0{,}315)$, un intervalo de longitud $1/1000$. Y los dígitos de
  un número sorteado al azar en $[0,1]$ son independientes y uniformes en
  $\{0,\dots,9\}$, lo que permite volver a contar.
