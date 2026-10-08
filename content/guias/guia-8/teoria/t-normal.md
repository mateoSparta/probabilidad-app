---
id: t-normal
skills: [normal, combinacion-normales]
---
## La distribución normal

Si $X \sim N(\mu, \sigma^2)$, todo se calcula estandarizando:

$$Z = \frac{X - \mu}{\sigma} \sim N(0, 1), \qquad P(X \le x) = \Phi\!\left(\frac{x - \mu}{\sigma}\right)$$

La tabla sólo trae $\Phi$ para valores positivos, así que conviene tener a mano
$\Phi(-z) = 1 - \Phi(z)$, que sale de la simetría.

**Sobre la tolerancia.** Como las respuestas salen de una tabla redondeada, los
ítems de esta guía aceptan un 1 % de diferencia. Si usás una calculadora o una
tabla con más decimales vas a obtener algo ligeramente distinto y también va a
estar bien.

### Combinación lineal de normales

Ésta es la propiedad que hace tan cómoda a la normal:

$$\sum_i a_i X_i + b \sim N\!\left(\sum_i a_i \mu_i + b,\ \sum_i a_i^2 \sigma_i^2\right)$$

siempre que las $X_i$ sean independientes. La familia se cierra: sumar,
restar, escalar y trasladar normales da normales.

Dos cosas donde se traban las cuentas:

- En la varianza los coeficientes van **al cuadrado**. Así que el signo
  desaparece: restar una normal aumenta la varianza igual que sumarla.
- La constante $b$ corre la media pero **no cambia la varianza**.

El procedimiento es siempre el mismo: pasar todo a un lado para que el evento
quede como "$Y > 0$" o "$Y \le c$", calcular la media y la varianza de $Y$ con
la fórmula, y estandarizar.

### Cuando hay que optimizar

Algunos problemas no piden una probabilidad sino el valor de un parámetro que
la minimiza —un umbral de detección, por ejemplo—. Ahí hay que derivar, y
aparece la **densidad** $\varphi$. Suele pasar algo lindo: al igualar dos
densidades normales y tomar logaritmo, los términos cuadráticos se cancelan y
queda una ecuación lineal.
