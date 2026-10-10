---
id: t-min-max
skills: [min-max]
---
## Mínimo, máximo y competencia

Para el mínimo y el máximo de variables independientes conviene plantear el
evento que se expresa como una intersección:

$$P(\min > t) = \prod_i P(X_i > t), \qquad P(\max \le t) = \prod_i P(X_i \le t)$$

El mínimo es mayor que $t$ si **todas** las variables son mayores que $t$, y
el máximo es menor o igual que $t$ si **todas** lo son. En ambos casos, la
independencia permite multiplicar.

### Competencia de exponenciales

Si $X_1 \sim \text{Exp}(\lambda_1)$ y $X_2 \sim \text{Exp}(\lambda_2)$ son
independientes, valen tres resultados que conviene recordar.

$$\min(X_1, X_2) \sim \text{Exp}(\lambda_1 + \lambda_2)$$

Es decir, **las tasas se suman**. Cuando dos procesos compiten, el tiempo
hasta el primer evento es exponencial, con tasa igual a la suma de las
tasas.

$$P(X_1 < X_2) = \frac{\lambda_1}{\lambda_1 + \lambda_2}$$

Cada variable resulta la menor con probabilidad proporcional a su tasa.

El tercer resultado, y el más notable, es que **cuál de las variables es la
menor y el valor del mínimo son independientes**. Saber que el mínimo fue
$X_1$ no aporta información sobre el momento en que ocurrió. Además, una vez
que ocurrió $X_1$, el tiempo restante hasta $X_2$ vuelve a tener distribución
$\text{Exp}(\lambda_2)$, por la pérdida de memoria. De aquí se deduce que la
diferencia $V - U$ es una **mezcla** de las dos exponenciales, con pesos
iguales a las probabilidades de que cada variable sea la menor.
