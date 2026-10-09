---
id: t-geometrica
skills: [geometrica-pascal, perdida-memoria]
---
## Geométrica, Pascal y pérdida de memoria

Cuando lo que se fija no es la cantidad de intentos sino la de **éxitos**,
cambia la distribución. La **geométrica** cuenta intentos hasta el primer
éxito:

$$P(N = n) = (1-p)^{n-1} p, \qquad P(N > n) = (1-p)^n, \qquad E[N] = \frac{1}{p}$$

La forma de la cola es la que conviene recordar: $N > n$ es simplemente "los
primeros $n$ intentos fallaron".

**Pascal** generaliza al $k$-ésimo éxito:

$$P(N = n) = \binom{n-1}{k-1} p^k (1-p)^{n-k}$$

El $\binom{n-1}{k-1}$ y no $\binom{n}{k}$: el último intento está obligado a ser
éxito, así que los $k-1$ éxitos restantes se reparten entre los $n-1$ intentos
anteriores. Usar la binomial acá es el error típico, porque cuenta también los
casos donde el $k$-ésimo éxito llegó antes.

### Pérdida de memoria

$$P(N > n + m \mid N > n) = P(N > m)$$

Saber que ya hubo $n$ fracasos no cambia nada sobre lo que viene: el dado no se
acuerda. Sale de que la cola sea una potencia, porque
$q^{n+m}/q^n = q^m$.

La geométrica es la **única** distribución discreta con esta propiedad, y la
exponencial la única continua. Por eso cuando un enunciado dice "sabiendo que
todavía no ocurrió" conviene fijarse si la distribución la tiene: si la tiene,
la respuesta es la misma que empezar de cero; si no —una suma de
exponenciales, por ejemplo— hay que calcular el condicional.

### Cuando hay resultados que no cuentan

Si en cada intento puede pasar algo que ni cuenta como éxito ni termina el
experimento —un semáforo amarillo que no detiene y no es verde— ese resultado
hay que **sacarlo del cálculo**. Se condiciona a los intentos que sí importan:
$p' = p / (p + q_{\text{corta}})$. Usar la probabilidad original es el error.
