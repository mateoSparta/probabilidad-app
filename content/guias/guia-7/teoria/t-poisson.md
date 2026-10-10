---
id: t-poisson
skills: [poisson-incrementos, tiempos-espera]
---
## El proceso de Poisson

Un proceso de Poisson de intensidad $\lambda$ describe eventos que ocurren al
azar en el tiempo, como las llamadas a una central, las fallas en un alambre
o los colectivos que llegan a una parada. Admite dos descripciones
equivalentes, y la mayor parte de los ejercicios requiere pasar de una a la
otra.

### El conteo de eventos

$$N(a, b] \sim \text{Poisson}(\lambda (b-a))$$

Dos propiedades sostienen los cálculos.

- **Estacionariedad.** La distribución del conteo depende solo de la
  *longitud* del intervalo y no de su ubicación. Lo que ocurre entre las 9 y
  las 10 tiene la misma distribución que lo que ocurre entre las 3 y las 4.
- **Incrementos independientes.** Los conteos sobre intervalos *disjuntos*
  son independientes, de modo que la probabilidad conjunta es el producto de
  las probabilidades.

Si los intervalos **se superponen**, los conteos dejan de ser independientes,
y la covarianza es la varianza del conteo en la parte común:

$$\operatorname{cov}(N(a,b],\, N(c,d]) = \lambda \cdot \text{longitud de la intersección}$$

### Los tiempos de espera

La relación entre ambas descripciones está dada por la siguiente
equivalencia, que conviene tener presente:

$$S_n > t \iff N(t) \le n - 1$$

Que el $n$-ésimo evento todavía no haya ocurrido equivale a que hayan
ocurrido a lo sumo $n-1$ eventos. Así, cualquier pregunta sobre tiempos se
traduce en una pregunta sobre conteos.

El tiempo hasta el primer evento tiene distribución
$S_1 \sim \text{Exp}(\lambda)$, y el tiempo hasta el $n$-ésimo,
$S_n \sim \text{Gamma}(n, \lambda)$, que es la distribución de la suma de $n$
exponenciales independientes.

### La pérdida de memoria del proceso

Como los tiempos entre eventos son exponenciales, el proceso **no tiene
memoria**. Si una persona llega a la parada en un instante fijo, el tiempo
hasta el próximo colectivo es $\text{Exp}(\lambda)$, independientemente de
cuánto tiempo pasó desde el anterior. Si llega en un instante *aleatorio
pero independiente* del proceso, al condicionar a cada instante posible se
obtiene el mismo resultado, de modo que promediar no lo modifica.

Esta propiedad tiene una consecuencia que conduce a respuestas muy breves.
El **exceso** sobre un umbral vuelve a ser exponencial. Si se suman pesos
exponenciales de media 3 hasta superar los 5 kilos, el exceso por encima de
5 es exponencial de media 3, y no hace falta sumar sobre la cantidad de
bolsas.
