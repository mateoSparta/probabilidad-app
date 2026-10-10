---
id: t-algebras
skills: [algebras]
---
## Álgebras de eventos

Todo experimento aleatorio tiene asociado un **espacio muestral** $\Omega$, el
conjunto de todos sus resultados posibles. Un **evento** es un subconjunto de
$\Omega$, y el objetivo es asignarle una probabilidad.

No cualquier familia de subconjuntos admite una asignación coherente de
probabilidades. Se exige que la familia $\mathcal{A}$ sea un **álgebra**, es
decir, que cumpla las tres condiciones siguientes:

- $\Omega \in \mathcal{A}$;
- si $A \in \mathcal{A}$, entonces $A^c \in \mathcal{A}$;
- si $A, B \in \mathcal{A}$, entonces $A \cup B \in \mathcal{A}$.

Las dos últimas condiciones garantizan que, si se puede asignar probabilidad
a $A$ y a $B$, también se la puede asignar a "no $A$" y a "$A$ o $B$". La
intersección queda incluida, porque $A \cap B = (A^c \cup B^c)^c$.

**La menor álgebra que contiene a una familia dada** se construye a partir de
esa familia, agregando complementos y uniones hasta que no aparezcan
conjuntos nuevos. Si $\Omega$ es finito, el proceso termina en una cantidad
finita de pasos, y el resultado es único porque no depende del orden en que
se realicen las operaciones.
