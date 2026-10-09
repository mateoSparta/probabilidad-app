---
id: t-bayes
skills: [bayes]
---
## Regla de Bayes

Los enunciados suelen dar la probabilidad del efecto dada la causa —un test
da positivo cuando hay enfermedad, el receptor indica 0 cuando se emitió un
0— y preguntar al revés: dado el efecto, ¿cuál era la causa?

$$P(B_j \mid A) = \frac{P(A \mid B_j)\,P(B_j)}{\sum_i P(A \mid B_i)\,P(B_i)}$$

El denominador es exactamente la probabilidad total de $A$, así que Bayes no
es una fórmula nueva: es el condicional con el denominador calculado por
probabilidad total.

Lo que hay que tener presente es que el resultado **depende muy fuerte de
$P(B_j)$**, la probabilidad a priori. Un test muy bueno sobre una causa muy
rara puede dar un posterior bajísimo, y eso no es un error de cuenta: es que
los falsos positivos de la población grande se comen a los verdaderos
positivos de la chica.

También aparece al revés: fijar el posterior que se quiere y despejar uno de
los datos. Es la misma ecuación, resuelta para otra incógnita.
