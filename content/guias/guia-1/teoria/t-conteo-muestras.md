---
id: t-conteo-muestras
skills: [conteo-muestras, ocupacion]
---
## Las cuatro formas de contar

La mayor parte de los conteos de esta guía se resuelve respondiendo dos
preguntas sobre el experimento: **¿importa el orden?** y **¿hay reposición?**

| | con reposición | sin reposición |
|---|---|---|
| **importa el orden** | $n^k$ | $\dfrac{n!}{(n-k)!}$ |
| **no importa el orden** | $\dbinom{n+k-1}{k}$ | $\dbinom{n}{k}$ |

El error más frecuente consiste en contar los casos favorables en un espacio
muestral y los casos totales en otro. Para que el cociente tenga sentido,
ambos conteos deben hacerse sobre el mismo $\Omega$.

**Una estrategia que funciona en casi todos los casos** es trabajar con
muestras *ordenadas*, aunque la pregunta no mencione el orden. En ese espacio
los resultados son equiprobables, y un evento como "los cinco resultados son
distintos" se cuenta sin recurrir a combinaciones.

### Objetos en cajas

Distribuir $n$ objetos en $r$ cajas es un problema equivalente, pero exige
identificar con cuidado cuáles son los resultados equiprobables.

- Si los objetos son **distinguibles**, cada uno elige su caja, de modo que
  hay $r^n$ distribuciones igualmente probables.
- Si son **indistinguibles** y el enunciado establece que todas las
  configuraciones son equiprobables, los casos son las $\binom{n+r-1}{r-1}$
  tuplas $(n_1,\dots,n_r)$ con $\sum n_i = n$.

Los dos modelos conducen a resultados distintos. Siete gatos indistinguibles
distribuidos en cinco cajas no tienen la misma distribución que siete gatos
distinguibles.
