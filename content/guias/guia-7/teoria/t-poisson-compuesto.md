---
id: t-poisson-compuesto
skills: [poisson-compuesto]
---
## Poisson compuesto

Muchos problemas involucran la suma de una cantidad **aleatoria** de
términos, como el tiempo de servicio total de los clientes que llegan o el
monto total de los siniestros. Si la cantidad $N$ tiene distribución de
Poisson y los términos son independientes entre sí y de $N$,

$$T = \sum_{i=1}^{N} X_i$$

$$E[T] = E[N]\,E[X], \qquad \operatorname{var}[T] = E[N]\operatorname{var}[X] + \operatorname{var}[N]\,(E[X])^2$$

La media coincide con la identidad de Wald. La varianza, en cambio, tiene
**dos** términos, que se obtienen de la varianza total de la guía 5
condicionando a $N$.

**El segundo término suele ser el dominante**, y es el que se omite con más
frecuencia. Si llegan en promedio 4 clientes por hora y cada servicio dura 5
minutos con desvío $1/2$, entonces

$$\operatorname{var}[T] = 4 \cdot 0{,}25 + 4 \cdot 25 = 1 + 100 = 101$$

De los 101, **100 se deben a la variación en la cantidad de clientes** y solo
1 a la variación en la duración de cada servicio. El resultado es razonable,
porque un cliente adicional agrega 5 minutos de una vez, mientras que la
duración de cada servicio varía apenas medio minuto. Considerar solo el
primer término subestima la varianza en un factor de 100.

Para una Poisson vale además que $\operatorname{var}[N] = E[N] = \lambda$, de
modo que la fórmula puede escribirse como
$\operatorname{var}[T] = \lambda\, E[X^2]$.
