---
id: t-normal
skills: [normal, combinacion-normales]
---
## La distribución normal

Si $X \sim N(\mu, \sigma^2)$, todas las probabilidades se calculan
estandarizando:

$$Z = \frac{X - \mu}{\sigma} \sim N(0, 1), \qquad P(X \le x) = \Phi\!\left(\frac{x - \mu}{\sigma}\right)$$

La tabla solo incluye valores de $\Phi$ para argumentos positivos, por lo que
conviene recordar la relación $\Phi(-z) = 1 - \Phi(z)$, que se deduce de la
simetría.

**Sobre la tolerancia.** Como las respuestas se obtienen de una tabla
redondeada, los ítems de esta guía aceptan una diferencia del 1 %. Si se usa
una calculadora o una tabla con más decimales, el resultado puede diferir
levemente y también se considera correcto.

### Combinación lineal de normales

Esta es la propiedad que hace tan conveniente a la distribución normal:

$$\sum_i a_i X_i + b \sim N\!\left(\sum_i a_i \mu_i + b,\ \sum_i a_i^2 \sigma_i^2\right)$$

siempre que las $X_i$ sean independientes. La familia es cerrada bajo estas
operaciones; sumar, restar, multiplicar por constantes y trasladar normales
independientes produce otra normal.

Hay dos puntos donde suelen cometerse errores.

- En la varianza, los coeficientes aparecen **al cuadrado**. Por lo tanto,
  el signo desaparece, y restar una normal aumenta la varianza igual que
  sumarla.
- La constante $b$ desplaza la media pero **no modifica la varianza**.

El procedimiento es siempre el mismo. Se reordena la desigualdad para que el
evento quede expresado como $Y > 0$ o $Y \le c$, se calculan la media y la
varianza de $Y$ con la fórmula anterior y se estandariza.

### Problemas de optimización

Algunos problemas piden el valor de un parámetro que minimiza una
probabilidad, como un umbral de detección. En ese caso hay que derivar, y
aparece la **densidad** $\varphi$. Al igualar dos densidades normales y tomar
logaritmos, los términos cuadráticos suelen cancelarse y queda una ecuación
lineal.
