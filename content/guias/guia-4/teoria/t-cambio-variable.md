---
id: t-cambio-variable
skills: [cambio-variable]
---
## Cambio de variables en dos dimensiones

Si $(X, Y)$ es un vector continuo y $(U, V) = g(X, Y)$, con $g$ inyectiva y
diferenciable, la densidad de $(U, V)$ se obtiene a partir de la
transformación inversa:

$$f_{U,V}(u, v) = f_{X,Y}\big(g^{-1}(u, v)\big)\, \lvert J_{g^{-1}}(u, v) \rvert$$

donde $J_{g^{-1}}$ es el determinante de la matriz de derivadas parciales de
$(x, y)$ respecto de $(u, v)$. Es la versión en dos dimensiones de la fórmula
del cambio de variable para una sola variable, y el valor absoluto del
jacobiano mide cuánto dilata o contrae las áreas la transformación inversa.

El procedimiento consta de tres pasos.

1. Despejar $x$ e $y$ en función de $u$ y $v$.
2. Calcular el jacobiano de la inversa y tomar su valor absoluto.
3. Traducir el soporte. La densidad de $(U, V)$ es positiva en la imagen por
   $g$ del soporte de $(X, Y)$, y esa región se obtiene reemplazando $x$ e $y$
   por sus expresiones en las desigualdades que definen el soporte original.

La mayoría de los errores se cometen en el tercer paso. Una densidad conjunta
expresada sin su soporte está incompleta, y si se la extiende a todo el plano
en general deja de integrar 1.

Si $g$ es lineal, $g(x, y) = A\,(x, y)^t$ con $A$ inversible, el jacobiano de
la inversa es constante e igual a $1 / \lvert \det A \rvert$, y el soporte se
transforma en otra región cuyos bordes son las imágenes de los bordes
originales.
