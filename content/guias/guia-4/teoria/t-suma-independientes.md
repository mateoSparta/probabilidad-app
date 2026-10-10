---
id: t-suma-independientes
skills: [suma-independientes]
---
## Suma de variables independientes

La distribución de $X + Y$, con $X$ e $Y$ independientes, se obtiene por
**convolución**, que recorre todas las formas de descomponer cada valor de
la suma:

$$f_{X+Y}(z) = \int f_X(x)\, f_Y(z - x)\, dx$$

En el caso discreto, la integral se reemplaza por una suma.

Algunas familias de distribuciones **son cerradas** bajo la suma de variables
independientes, y conviene conocerlas porque evitan el cálculo:

$$\text{Poisson}(\lambda) + \text{Poisson}(\mu) = \text{Poisson}(\lambda + \mu)$$

Lo mismo ocurre con las normales independientes, cuyas medias y varianzas se
suman, y con las exponenciales de igual tasa, cuya suma tiene distribución
Gamma.

### Condicionar a la suma

Si $X \sim \text{Poisson}(\lambda)$ e $Y \sim \text{Poisson}(\mu)$ son
independientes y se conoce el valor de la suma, entonces

$$X \mid (X + Y = n) \sim \text{Bin}\!\left(n,\ \frac{\lambda}{\lambda + \mu}\right)$$

Al condicionar a la suma desaparece la escala, y solo importa la
**proporción** entre $\lambda$ y $\mu$. El resultado equivale a que cada uno
de los $n$ eventos se asigne a uno de los dos procesos de manera
independiente, con probabilidad $\lambda/(\lambda+\mu)$ de provenir del
primero. Este razonamiento reaparece en la guía 7, en el adelgazamiento del
proceso de Poisson.
