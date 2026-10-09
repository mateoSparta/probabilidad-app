---
id: t-condicional
skills: [condicional, prob-total]
---
## Condicional y probabilidad total

Saber que pasó $B$ cambia el espacio: ahora los únicos resultados posibles
son los de $B$, y hay que renormalizar para que la probabilidad vuelva a
sumar 1.

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}, \qquad P(B) > 0$$

Dada vuelta, esa misma fórmula es la **regla del producto**, que es como se
recorre un árbol: $P(A \cap B) = P(B)\,P(A \mid B)$. Cada rama aporta el
producto de las probabilidades que la forman.

Cuando el experimento tiene etapas —"se extrae de una urna y según el color
se extrae de otra"— conviene dibujar el árbol y leer de él. Si $B_1,\dots,B_n$
es una **partición** (son disjuntos y cubren todo), entonces

$$P(A) = \sum_i P(A \mid B_i)\,P(B_i)$$

que es la **probabilidad total**: sumar todos los caminos que llegan a $A$.

Dos controles que atajan la mayoría de los errores:

- Las ramas que salen de un nodo tienen que sumar 1.
- $P(A)$ tiene que quedar entre el mínimo y el máximo de los $P(A \mid B_i)$.
  Si te queda afuera de ese rango, hay un error de cuenta.
