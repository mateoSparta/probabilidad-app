---
id: t-condicional
skills: [condicional, prob-total]
---
## Condicional y probabilidad total

Saber que ocurrió $B$ restringe el espacio muestral a los resultados de $B$,
y la probabilidad debe renormalizarse para que vuelva a sumar 1.

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}, \qquad P(B) > 0$$

Despejando se obtiene la **regla del producto**,
$P(A \cap B) = P(B)\,P(A \mid B)$, que es la que permite recorrer un diagrama
de árbol. La probabilidad de cada rama es el producto de las probabilidades
de los tramos que la componen.

Cuando el experimento se desarrolla en etapas (por ejemplo, se extrae una
bola de una urna y, según su color, se extrae otra de una segunda urna),
conviene dibujar el árbol y leer las probabilidades en él. Si
$B_1,\dots,B_n$ es una **partición** de $\Omega$, es decir, una familia de
eventos disjuntos cuya unión es todo el espacio, vale

$$P(A) = \sum_i P(A \mid B_i)\,P(B_i)$$

Esta es la **fórmula de probabilidad total**, que suma las probabilidades de
todos los caminos que conducen a $A$.

Dos controles permiten detectar la mayoría de los errores.

- Las ramas que salen de un mismo nodo deben sumar 1.
- $P(A)$ debe quedar entre el mínimo y el máximo de las $P(A \mid B_i)$. Un
  valor fuera de ese rango indica un error de cálculo.
