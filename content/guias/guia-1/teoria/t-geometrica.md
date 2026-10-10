---
id: t-geometrica
skills: [prob-geometrica]
---
## Probabilidad geométrica

Cuando el resultado del experimento es un punto de un intervalo o de una
región, no es posible contar casos, porque hay infinitos resultados y cada
uno tiene probabilidad cero. En su lugar se usa la **medida** del conjunto,

$$P(A) = \frac{\text{medida}(A)}{\text{medida}(\Omega)}$$

donde la medida es la longitud en la recta, el área en el plano y el volumen
en el espacio. En este contexto, elegir un punto "al azar" significa que la
probabilidad de cada región es proporcional a su medida.

Conviene tener presentes dos consecuencias.

- Un evento puede ser **no vacío y tener probabilidad cero**. Que el número
  sorteado sea exactamente $1/2$ es posible y tiene probabilidad 0.
- Los enunciados sobre dígitos son problemas geométricos. Pedir que los tres
  primeros dígitos sean $3,1,4$ equivale a pedir que el número caiga en
  $[0{,}314,\ 0{,}315)$, un intervalo de longitud $1/1000$. Además, los
  dígitos de un número elegido al azar en $[0,1]$ son independientes y
  uniformes en $\{0,\dots,9\}$, lo que permite volver a razonar por conteo.
