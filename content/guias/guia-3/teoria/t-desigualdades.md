---
id: t-desigualdades
skills: [desigualdades]
---
## Markov y Chebyshev

En ocasiones no se conoce la distribución de una variable y, aun así, se
necesita acotar alguna probabilidad. Para eso sirven las dos desigualdades
siguientes, que valen para **cualquier** distribución.

**Desigualdad de Markov.** Si $X \ge 0$ y $a > 0$,

$$P(X \ge a) \le \frac{E[X]}{a}$$

Solo requiere conocer la media. Si una variable no negativa tiene media 15,
entonces $P(X \ge 60) \le 15/60 = 1/4$, sin ninguna otra información.

**Desigualdad de Chebyshev.** Se obtiene aplicando la desigualdad de Markov a
$(X - \mu)^2$:

$$P(\lvert X - \mu \rvert \ge \varepsilon) \le \frac{\operatorname{var}[X]}{\varepsilon^2}$$

Requiere la media y la varianza, y acota la probabilidad de que la variable
se aleje de su media.

**Ambas desigualdades dan cotas, que valen siempre pero suelen ser poco
ajustadas.** Para dimensionar una muestra, Chebyshev puede requerir cinco
veces más datos que la aproximación normal basada en el teorema central del
límite. Las dos herramientas son válidas. Chebyshev ofrece una garantía sin
supuestos sobre la distribución, mientras que el TCL da un valor más ajustado
a costa de suponer que la aproximación normal es adecuada. Cuando un
ejercicio pide un tamaño de muestra, hay que identificar cuál de las dos
herramientas corresponde usar.
