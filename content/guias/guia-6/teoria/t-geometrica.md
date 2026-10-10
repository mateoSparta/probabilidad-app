---
id: t-geometrica
skills: [geometrica-pascal, perdida-memoria]
---
## Geométrica, Pascal y pérdida de memoria

Cuando se fija la cantidad de **éxitos** en lugar de la cantidad de ensayos,
la distribución cambia. La **distribución geométrica** cuenta los ensayos
necesarios hasta el primer éxito:

$$P(N = n) = (1-p)^{n-1} p, \qquad P(N > n) = (1-p)^n, \qquad E[N] = \frac{1}{p}$$

Conviene recordar la forma de la cola, ya que $N > n$ equivale a que los
primeros $n$ ensayos fueron fracasos.

La **distribución de Pascal** generaliza este modelo al $k$-ésimo éxito:

$$P(N = n) = \binom{n-1}{k-1} p^k (1-p)^{n-k}$$

El coeficiente es $\binom{n-1}{k-1}$ porque el último ensayo debe ser un
éxito, de modo que los $k-1$ éxitos restantes se distribuyen entre los $n-1$
ensayos anteriores. Usar la binomial en este caso es un error frecuente,
porque incluye también los casos en que el $k$-ésimo éxito ocurrió antes.

### Pérdida de memoria

$$P(N > n + m \mid N > n) = P(N > m)$$

Saber que ya hubo $n$ fracasos no modifica la distribución de lo que resta.
La propiedad se deduce de que la cola es una potencia, ya que
$q^{n+m}/q^n = q^m$.

La geométrica es la **única** distribución discreta con esta propiedad, y la
exponencial es la única continua. Por eso, cuando un enunciado indica que
algo "todavía no ocurrió", conviene verificar si la distribución tiene
pérdida de memoria. Si la tiene, la respuesta coincide con la que se obtiene
al empezar de cero; si no la tiene, como ocurre con una suma de
exponenciales, hay que calcular la probabilidad condicional.

### Resultados que no intervienen

Si en cada ensayo puede ocurrir un resultado que no es un éxito ni termina
el experimento, como un semáforo en amarillo que no detiene al conductor,
ese resultado debe **excluirse del cálculo**. Se condiciona a los ensayos
relevantes, con $p' = p / (p + q_{\text{corta}})$. Usar la probabilidad
original es incorrecto.
