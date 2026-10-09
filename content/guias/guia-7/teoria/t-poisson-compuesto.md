---
id: t-poisson-compuesto
skills: [poisson-compuesto]
---
## Poisson compuesto

Muchos problemas suman una cantidad **aleatoria** de términos: cada cliente que
llega consume un tiempo de servicio, cada siniestro cuesta una indemnización.
Si la cantidad $N$ es Poisson y los términos son independientes entre sí y de
$N$:

$$T = \sum_{i=1}^{N} X_i$$

$$E[T] = E[N]\,E[X], \qquad \operatorname{var}[T] = E[N]\operatorname{var}[X] + \operatorname{var}[N]\,(E[X])^2$$

La media es la de Wald y no sorprende. La varianza sí: tiene **dos** términos, y
sale de la varianza total de la guía 5 condicionando a $N$.

**El segundo término suele ser el que domina**, y es el que se olvida. Si llegan
4 clientes por hora en promedio y cada servicio dura 5 minutos con desvío
$1/2$, entonces

$$\operatorname{var}[T] = 4 \cdot 0{,}25 + 4 \cdot 25 = 1 + 100 = 101$$

De los 101, **100 vienen de que la cantidad de clientes varía** y sólo 1 de que
cada servicio dure distinto. Tiene sentido: que venga un cliente más suma 5
minutos de golpe, mientras que la duración de cada uno se mueve apenas medio
minuto. Quedarse con el primer término subestima la varianza por un factor de
100.

Para una Poisson vale además que $\operatorname{var}[N] = E[N] = \lambda$, así
que la fórmula se puede escribir como
$\operatorname{var}[T] = \lambda\, E[X^2]$.
