---
id: t-prob-discreta
skills: [prob-discreta, inclusion-exclusion]
---
## Probabilidad en un espacio discreto

Cuando $\Omega$ es finito o numerable alcanza con dar un **peso** $p(\omega)$ a
cada punto, con $p(\omega) \ge 0$ y $\sum_{\omega \in \Omega} p(\omega) = 1$.
La probabilidad de un evento es la suma de los pesos que contiene:

$$P(A) = \sum_{\omega \in A} p(\omega)$$

Eso ya determina la probabilidad de **todos** los subconjuntos de $\Omega$, así
que no hay nada más que elegir. Dos consecuencias que se usan todo el tiempo:

- $P(A^c) = 1 - P(A)$. Conviene cuando el complemento es más fácil de contar
  que el evento.
- Para una unión hay que descontar lo que se cuenta dos veces:
  $$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$
  y con tres eventos aparecen las tres intersecciones de a pares y se vuelve a
  sumar la de los tres. Esa alternancia es la **inclusión-exclusión**.

Un atajo que sirve para chequear: si partís $\Omega$ en regiones disjuntas y
sumás sus probabilidades, tiene que dar 1. Si no da, hay un error en los datos
o en la partición.
