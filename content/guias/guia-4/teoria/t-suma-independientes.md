---
id: t-suma-independientes
skills: [suma-independientes]
---
## Suma de variables independientes

La distribución de $X + Y$ con $X$ e $Y$ independientes sale por
**convolución**: para cada valor de la suma se recorren todas las formas de
repartirla.

$$f_{X+Y}(z) = \int f_X(x)\, f_Y(z - x)\, dx$$

y en el caso discreto lo mismo con una suma.

Hay familias que **se cierran** bajo la suma, y conviene conocerlas porque
ahorran toda la cuenta:

$$\text{Poisson}(\lambda) + \text{Poisson}(\mu) = \text{Poisson}(\lambda + \mu)$$

y lo mismo pasa con normales independientes (se suman medias y varianzas) y con
exponenciales de la misma tasa (dan una Gamma).

### El resultado que sorprende

Si $X \sim \text{Poisson}(\lambda)$ e $Y \sim \text{Poisson}(\mu)$ son
independientes y se sabe cuánto dio la suma, entonces

$$X \mid (X + Y = n) \sim \text{Bin}\!\left(n,\ \frac{\lambda}{\lambda + \mu}\right)$$

Condicionar a la suma borra la escala: ya no importan $\lambda$ y $\mu$ por
separado, sólo la **proporción** entre ellos. Es como si cada uno de los $n$
eventos tirara una moneda para decidir de qué proceso vino, con probabilidad
$\lambda/(\lambda+\mu)$, independientemente de los demás. Ese mismo
razonamiento vuelve a aparecer en la guía 7 con el adelgazamiento del proceso
de Poisson.
