---
id: t-laplace
skills: [laplace]
---
## Conteo y regla de Laplace

Si todos los puntos de un $\Omega$ finito tienen el mismo peso, calcular una
probabilidad se reduce a contar:

$$P(A) = \frac{\#A}{\#\Omega}$$

La dificultad está en elegir un $\Omega$ **cuyos resultados sean realmente
equiprobables**. Al tirar dos dados hay 36 pares equiprobables, pero las 11
sumas posibles no lo son, de modo que contar sobre las sumas conduce a un
resultado incorrecto.

Para construir $\Omega$ hay que responder dos preguntas.

- ¿**Importa el orden**? Las palabras de longitud $k$ formadas con $n$
  símbolos son $n^k$ si hay reposición y $n(n-1)\cdots(n-k+1)$ si no la hay.
- ¿**Importan solo los elementos elegidos**, sin tener en cuenta el orden?
  En ese caso, los subconjuntos de tamaño $k$ son $\binom{n}{k}$.

En los problemas de urnas conviene considerar las bolas **distinguibles**,
aunque tengan el mismo color. Así los resultados son equiprobables y el
conteo resulta directo.
