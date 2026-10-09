---
id: t-min-max
skills: [min-max]
---
## Mínimo, máximo y competencia

Para el mínimo y el máximo de variables independientes conviene atacar por el
lado que convierte el evento en una intersección:

$$P(\min > t) = \prod_i P(X_i > t), \qquad P(\max \le t) = \prod_i P(X_i \le t)$$

El mínimo es mayor que $t$ si **todas** son mayores; el máximo es menor que $t$
si **todas** son menores. En los dos casos, independencia permite multiplicar.

### Competencia de exponenciales

Si $X_1 \sim \text{Exp}(\lambda_1)$ y $X_2 \sim \text{Exp}(\lambda_2)$ son
independientes, pasan tres cosas que vale la pena saberse de memoria:

$$\min(X_1, X_2) \sim \text{Exp}(\lambda_1 + \lambda_2)$$

o sea que **las tasas se suman**: dos procesos compitiendo producen el primer
evento más rápido, y la tasa combinada es la suma.

$$P(X_1 < X_2) = \frac{\lambda_1}{\lambda_1 + \lambda_2}$$

cada uno gana con probabilidad proporcional a su tasa.

Y la tercera, que es la más linda: **quién gana y cuándo gana son
independientes**. Saber que ganó $X_1$ no dice nada sobre cuándo ocurrió el
primer evento. Además, una vez que ganó $X_1$, lo que falta para que llegue
$X_2$ vuelve a ser $\text{Exp}(\lambda_2)$ desde cero, por pérdida de memoria.
De ahí sale que la diferencia $V - U$ sea una **mezcla** de las dos
exponenciales, con pesos iguales a las probabilidades de ganar.
