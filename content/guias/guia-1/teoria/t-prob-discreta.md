---
id: t-prob-discreta
skills: [prob-discreta, inclusion-exclusion]
---
## Probabilidad en un espacio discreto

Cuando $\Omega$ es finito o numerable, basta con asignar un **peso**
$p(\omega)$ a cada punto, con $p(\omega) \ge 0$ y
$\sum_{\omega \in \Omega} p(\omega) = 1$. La probabilidad de un evento es la
suma de los pesos de sus puntos:

$$P(A) = \sum_{\omega \in A} p(\omega)$$

Esta asignación determina la probabilidad de **todos** los subconjuntos de
$\Omega$. De ella se obtienen dos propiedades de uso constante.

- $P(A^c) = 1 - P(A)$, útil cuando el complemento es más fácil de calcular
  que el evento.
- En una unión hay que descontar lo que se cuenta dos veces,
  $$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$
  Con tres eventos se restan las tres intersecciones de a pares y se suma la
  intersección de los tres. Esta alternancia de signos es el principio de
  **inclusión-exclusión**.

Un control útil consiste en particionar $\Omega$ en regiones disjuntas y
sumar sus probabilidades. Si el resultado no es 1, hay un error en los datos
o en la partición.
