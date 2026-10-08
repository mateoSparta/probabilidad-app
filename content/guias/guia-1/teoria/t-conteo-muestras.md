---
id: t-conteo-muestras
skills: [conteo-muestras, ocupacion]
---
## Las cuatro formas de contar

Casi todo el conteo de esta guía se reduce a dos preguntas sobre el
experimento: **¿importa el orden?** y **¿hay reposición?**

| | con reposición | sin reposición |
|---|---|---|
| **importa el orden** | $n^k$ | $\dfrac{n!}{(n-k)!}$ |
| **no importa** | $\binom{n+k-1}{k}$ | $\binom{n}{k}$ |

El error más común no es usar mal la fórmula: es contar el evento en un
espacio y el total en otro. Si vas a contar casos favorables sobre casos
totales, los dos tienen que vivir en el mismo $\Omega$.

**Un truco que funciona casi siempre:** trabajá con muestras *ordenadas*,
aunque la pregunta no mencione el orden. Ahí los casos son equiprobables sin
discusión, y un evento como "las cinco distintas" se cuenta sin pelearse con
combinaciones.

### Objetos en cajas

Repartir $n$ objetos en $r$ cajas es el mismo problema con otra ropa, pero
hay que mirar bien quién es equiprobable:

- Si los objetos son **distinguibles**, cada uno elige su caja: $r^n$ repartos
  igualmente probables.
- Si son **indistinguibles** y el enunciado dice que todas las
  configuraciones son equiprobables, los casos son las
  $\binom{n+r-1}{r-1}$ tiras $(n_1,\dots,n_r)$ con $\sum n_i = n$.

No son lo mismo y dan resultados distintos: siete gatos indistinguibles en
cinco cajas no se reparten como siete gatos con nombre.
