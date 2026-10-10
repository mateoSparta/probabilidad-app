---
id: t-metodo-F
skills: [transformacion-F]
---
## El método de la función de distribución

Para hallar la distribución de $Y = g(X)$, el procedimiento de validez
general es el **método de la función de distribución**. Consiste en escribir

$$F_Y(t) = P(g(X) \le t)$$

y expresar ese evento en términos de $X$, cuya distribución se conoce. Si se
necesita la densidad, se obtiene derivando al final.

Si $g$ es estrictamente creciente, la traducción es directa,
$F_Y(t) = F_X(g^{-1}(t))$, y al derivar se obtiene la fórmula del cambio de
variable

$$f_Y(t) = f_X\!\left(g^{-1}(t)\right)\,\left\lvert \frac{d}{dt}g^{-1}(t) \right\rvert$$

donde el valor absoluto de la derivada garantiza que la densidad no sea
negativa.

**La fórmula del cambio de variable solo vale si $g$ es inyectiva**, y esa
restricción explica la dificultad de la mayoría de los ejercicios. Hay dos
situaciones que conviene tener presentes.

- Si $g$ **no es monótona**, como $Y = X^2$ o $Y = X^2 - 3X$, un mismo valor
  de $Y$ proviene de varios valores de $X$, y hay que sumar las
  contribuciones de cada rama. Con el método de la función de distribución
  esto se resuelve de manera natural, porque el evento $\{X^2 \le t\}$ es
  $\{-\sqrt{t} \le X \le \sqrt{t}\}$.
- Si $g$ **es constante en un intervalo**, como un limitador que satura, ese
  valor concentra toda la probabilidad del intervalo y aparece un **átomo**.
  Una variable continua puede transformarse en una variable mixta, y la
  fórmula de la densidad no detecta el átomo porque en ese punto no hay
  densidad.

Por eso conviene empezar siempre por la función de distribución y pasar a la
densidad al final.
