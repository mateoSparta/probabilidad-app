---
id: t-conjunta
skills: [conjunta-marginales, independencia-va]
---
## Conjunta, marginales e independencia

Un vector aleatorio continuo $(X, Y)$ tiene una **densidad conjunta**
$f_{(X,Y)}(x,y)$, y la probabilidad de que tome valores en una región es el
volumen bajo esa densidad:

$$P((X,Y) \in A) = \iint_A f_{(X,Y)}(x, y)\,dx\,dy$$

Si la distribución conjunta es **uniforme sobre una región** $\Lambda$, la
densidad vale $1/\text{área}(\Lambda)$ en $\Lambda$ y 0 fuera de ella, de
modo que toda probabilidad se reduce a un cociente de áreas.

Las **densidades marginales** se obtienen integrando respecto de la otra
variable:

$$f_X(x) = \int f_{(X,Y)}(x, y)\,dy$$

Un resultado que suele sorprender es que **una distribución conjunta uniforme
no tiene, en general, marginales uniformes**. Esto solo ocurre cuando la
región es un rectángulo. Si el ancho de la región varía con $x$, la marginal
de $X$ refleja esa variación; en un semicírculo, por ejemplo, la marginal es
proporcional a la longitud de la cuerda.

$X$ e $Y$ son **independientes** si la densidad conjunta se factoriza:

$$f_{(X,Y)}(x, y) = f_X(x)\,f_Y(y)$$

El **soporte** permite descartar la independencia con rapidez. Si no es un
rectángulo (un producto de intervalos), las variables no pueden ser
independientes, porque el rango de valores posibles de una depende del valor
de la otra.
