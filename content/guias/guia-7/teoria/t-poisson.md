---
id: t-poisson
skills: [poisson-incrementos, tiempos-espera]
---
## El proceso de Poisson

Un proceso de Poisson de intensidad $\lambda$ describe eventos que ocurren al
azar en el tiempo: llamadas a una central, fallas en un alambre, colectivos en
una parada. Se lo puede mirar de dos formas, y saber cambiar de una a otra es
casi todo lo que hace falta.

### Contando: los incrementos

$$N(a, b] \sim \text{Poisson}(\lambda (b-a))$$

Dos propiedades hacen el trabajo:

- **Estacionariedad**: sólo importa el *largo* del intervalo, no dónde está.
  Lo que pasa entre las 9 y las 10 tiene la misma distribución que entre las 3
  y las 4.
- **Incrementos independientes**: sobre intervalos *disjuntos*, los conteos son
  independientes, así que la probabilidad conjunta es el producto.

Si los intervalos **se solapan** ya no son independientes, y la covarianza es
la varianza del pedazo común:

$$\operatorname{cov}(N(a,b],\, N(c,d]) = \lambda \cdot \text{largo del solapamiento}$$

### Midiendo el tiempo: los tiempos de espera

El puente entre las dos miradas es esta equivalencia, que conviene tener
grabada:

$$S_n > t \iff N(t) \le n - 1$$

"el $n$-ésimo evento no llegó todavía" es lo mismo que "hubo a lo sumo $n-1$
eventos". Así, cualquier pregunta sobre tiempos se traduce en una sobre
conteos, donde ya se sabe calcular.

El primero tarda $S_1 \sim \text{Exp}(\lambda)$, y el $n$-ésimo
$S_n \sim \text{Gamma}(n, \lambda)$, que es la suma de $n$ exponenciales.

### La falta de memoria del proceso

Como los tiempos entre eventos son exponenciales, el proceso **no se acuerda**.
Si llegás a la parada en cualquier momento, lo que falta hasta el próximo
colectivo es $\text{Exp}(\lambda)$, sin importar cuánto hace que pasó el
anterior. Y si llegás a una hora *aleatoria pero independiente* del proceso,
condicionando a cada hora posible se obtiene lo mismo, así que promediar no
cambia nada.

Eso tiene una consecuencia que da respuestas muy cortas: el **exceso** sobre un
umbral vuelve a ser exponencial. Si se van sumando pesos exponenciales de media
3 hasta pasar los 5 kilos, lo que sobra por encima de 5 es exponencial de media
3 otra vez, sin que haga falta sumar sobre la cantidad de bolsas.
