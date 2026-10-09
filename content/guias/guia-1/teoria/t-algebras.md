---
id: t-algebras
skills: [algebras]
---
## Álgebras de eventos

Un experimento aleatorio arranca con el **espacio muestral** $\Omega$: el
conjunto de todos los resultados posibles. Un **evento** es un subconjunto de
$\Omega$, y lo que uno quiere es poder asignarle probabilidad.

No a cualquier familia de subconjuntos se le puede asignar probabilidad de
forma coherente. Hace falta que la familia $\mathcal{A}$ sea un **álgebra**:

- $\Omega \in \mathcal{A}$;
- si $A \in \mathcal{A}$, entonces $A^c \in \mathcal{A}$;
- si $A, B \in \mathcal{A}$, entonces $A \cup B \in \mathcal{A}$.

Las dos últimas condiciones dicen que si podés preguntar por $A$ y por $B$,
también podés preguntar por "no $A$" y por "$A$ o $B$". De ahí sale que la
intersección también está, porque $A \cap B = (A^c \cup B^c)^c$.

**La menor álgebra que contiene a una familia dada** se construye arrancando
de esa familia y cerrando por complemento y unión hasta que no entre nada
nuevo. Sobre un $\Omega$ finito el proceso termina, y el resultado es único:
no depende del orden en que se hagan las operaciones.
