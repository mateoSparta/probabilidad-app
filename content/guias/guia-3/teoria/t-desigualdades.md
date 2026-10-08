---
id: t-desigualdades
skills: [desigualdades]
---
## Markov y Chebyshev

A veces no se conoce la distribución y hay que decir algo igual. Para eso
sirven estas dos cotas, que valen para **cualquier** distribución.

**Markov**, si $X \ge 0$ y $a > 0$:

$$P(X \ge a) \le \frac{E[X]}{a}$$

Sólo necesita la media. Si una variable positiva tiene media 15, entonces
$P(X \ge 60) \le 15/60 = 1/4$, sin saber nada más.

**Chebyshev**, que es Markov aplicado a $(X - \mu)^2$:

$$P(\lvert X - \mu \rvert \ge \varepsilon) \le \frac{\operatorname{var}[X]}{\varepsilon^2}$$

Necesita media y varianza, y acota lo lejos que la variable se puede ir del
centro.

**Son cotas, no aproximaciones.** Eso es lo importante: valen siempre, pero
suelen ser flojas. Para dimensionar una muestra, Chebyshev puede pedir cinco
veces más datos que la aproximación normal del teorema central del límite.
Ninguna de las dos está mal: Chebyshev da una garantía que no supone nada, y
el TCL da un número ajustado a costa de suponer que la aproximación normal
sirve. Cuando un ejercicio pide un tamaño de muestra, hay que fijarse cuál de
las dos herramientas quiere.
