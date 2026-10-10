---
id: t-mezclas
skills: [mezclas]
---
## Mezclas y Bayes con un dato continuo

Muchos problemas tienen la siguiente estructura. Hay una causa discreta $S$
que no se observa, y se observa una magnitud continua $X$ que depende de
ella. Por ejemplo, un transmisor envía una de tres amplitudes y el receptor
mide la amplitud más un ruido.

La distribución de la magnitud observada es una **mezcla**:

$$f_X(x) = \sum_j f_{X \mid S = s_j}(x)\, P(S = s_j)$$

Para el problema inverso, es decir, para inferir la causa a partir de lo
observado, vale la regla de Bayes con una diferencia importante. Como $X$ es
continua, $P(X = x) = 0$ y no es posible dividir por esa probabilidad. En la
fórmula intervienen **densidades**:

$$P(S = s \mid X = x) = \frac{f_{X \mid S = s}(x)\, P(S = s)}{\sum_j f_{X \mid S = s_j}(x)\, P(S = s_j)}$$

Formalmente, la expresión se obtiene condicionando a $\{x < X < x + h\}$ y
tomando el límite cuando $h \to 0$. Las densidades aparecen como límite del
cociente, y el factor $h$ se cancela entre numerador y denominador.

**Dos controles para el resultado.** La probabilidad a posteriori debe sumar
1 sobre todas las causas. Además, si las causas son equiprobables, la
probabilidad a priori se cancela y queda solo el cociente de densidades, de
modo que resulta más probable la causa que hace más verosímil la
observación. Si las causas están muy próximas en relación con el ruido, la
distribución a posteriori resulta casi uniforme, lo que indica que la
observación aporta poca información.
