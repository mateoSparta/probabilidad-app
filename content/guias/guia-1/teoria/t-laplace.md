---
id: t-laplace
skills: [laplace]
---
## Conteo y regla de Laplace

Si todos los puntos de un $\Omega$ finito tienen el mismo peso, la
probabilidad se reduce a contar:

$$P(A) = \frac{\#A}{\#\Omega}$$

Lo delicado nunca es la división: es elegir el $\Omega$ **donde los casos son
realmente equiprobables**. Tirar dos dados tiene 36 pares equiprobables, pero
las 11 sumas posibles no lo son, así que contar sobre las sumas da mal.

Al armar $\Omega$ hay dos preguntas que lo definen:

- ¿**importa el orden**? Las palabras de longitud $k$ con $n$ símbolos son
  $n^k$ si hay reposición, y $n(n-1)\cdots(n-k+1)$ si no la hay.
- ¿**importa cuáles**, y no en qué orden? Entonces los subconjuntos de tamaño
  $k$ son $\binom{n}{k}$.

Cuando el enunciado habla de urnas y bolas, conviene imaginar las bolas
**distinguibles** aunque sean del mismo color: ahí los casos quedan
equiprobables y el conteo sale solo.
