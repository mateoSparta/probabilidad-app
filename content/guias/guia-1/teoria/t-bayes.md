---
id: t-bayes
skills: [bayes]
---
## Regla de Bayes

Es frecuente que el enunciado informe la probabilidad de un efecto dada su
causa (que un test dé positivo cuando hay enfermedad, que el receptor indique
0 cuando se emitió un 0) y pregunte por la relación inversa, es decir, por la
probabilidad de la causa dado el efecto observado.

$$P(B_j \mid A) = \frac{P(A \mid B_j)\,P(B_j)}{\sum_i P(A \mid B_i)\,P(B_i)}$$

El denominador es la probabilidad total de $A$. La regla de Bayes es, por lo
tanto, la definición de probabilidad condicional con el denominador calculado
mediante la fórmula de probabilidad total.

El resultado **depende fuertemente de $P(B_j)$**, la probabilidad a priori. Un
test de alta sensibilidad aplicado a una causa poco frecuente puede dar una
probabilidad a posteriori muy baja. Esto ocurre porque los falsos positivos
que provienen de la población sin la causa, mucho más numerosa, superan en
cantidad a los verdaderos positivos.

La regla también se usa en sentido inverso, fijando la probabilidad a
posteriori deseada y despejando uno de los datos. Se trata de la misma
ecuación, resuelta para otra incógnita.
