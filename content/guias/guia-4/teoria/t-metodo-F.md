---
id: t-metodo-F
skills: [transformacion-F]
---
## El método de la función de distribución

Para hallar la distribución de $Y = g(X)$ el camino que nunca falla es el
**método de la F**: escribir

$$F_Y(t) = P(g(X) \le t)$$

y traducir ese evento a un evento sobre $X$, que es la variable cuya
distribución se conoce. Después, si hace falta la densidad, se deriva.

Si $g$ es estrictamente creciente la traducción es directa,
$F_Y(t) = F_X(g^{-1}(t))$, y derivando sale la fórmula del cambio de variable

$$f_Y(t) = f_X\!\left(g^{-1}(t)\right)\,\left\lvert \frac{d}{dt}g^{-1}(t) \right\rvert$$

donde el módulo del jacobiano aparece porque la densidad no puede ser negativa.

**Pero la fórmula del cambio de variable sólo vale si $g$ es inyectiva**, y ahí
está el problema de la mayoría de los ejercicios. Dos casos para tener
presentes:

- Si $g$ es **no monótona** —como $Y = X^2$ o $Y = X^2 - 3X$— un mismo valor de
  $Y$ viene de varios valores de $X$, y hay que sumar las contribuciones de
  cada rama. Con el método de la F sale solo: el evento $\{X^2 \le t\}$ es
  $\{-\sqrt{t} \le X \le \sqrt{t}\}$ y no hay nada que recordar.
- Si $g$ **aplasta un tramo entero** en un solo valor —como un limitador que
  satura— ese valor se lleva toda la probabilidad del tramo y aparece un
  **átomo**. Una variable continua puede volverse mixta al transformarla, y la
  fórmula de la densidad no lo detecta porque no hay densidad ahí.

Por eso conviene empezar siempre por la F y pasar a la densidad al final, no
al revés.
