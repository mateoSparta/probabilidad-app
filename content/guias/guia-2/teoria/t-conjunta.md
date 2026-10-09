---
id: t-conjunta
skills: [conjunta-marginales, independencia-va]
---
## Conjunta, marginales e independencia

Un vector aleatorio $(X, Y)$ continuo tiene **densidad conjunta**
$f_{(X,Y)}(x,y)$, y la probabilidad de caer en una región es el volumen bajo
ella:

$$P((X,Y) \in A) = \iint_A f_{(X,Y)}(x, y)\,dx\,dy$$

Si la conjunta es **uniforme sobre una región** $\Lambda$, entonces vale
$1/\text{área}(\Lambda)$ adentro y 0 afuera, y toda probabilidad se vuelve un
cociente de áreas.

Las **marginales** se obtienen integrando la otra variable:

$$f_X(x) = \int f_{(X,Y)}(x, y)\,dy$$

Acá hay algo que sorprende la primera vez: **una conjunta uniforme no da
marginales uniformes**, salvo que la región sea un rectángulo. Si el ancho de
la región cambia con $x$, la marginal de $X$ hereda esa forma. En un
semicírculo, por ejemplo, la marginal queda proporcional a la longitud de la
cuerda.

$X$ e $Y$ son **independientes** cuando la conjunta factoriza:

$$f_{(X,Y)}(x, y) = f_X(x)\,f_Y(y)$$

Para descartar independencia de un vistazo alcanza con mirar el **soporte**: si
no es un rectángulo (producto de intervalos), no puede haber independencia,
porque el rango posible de una variable depende del valor de la otra. Es el
chequeo más rápido y casi nunca falla.
