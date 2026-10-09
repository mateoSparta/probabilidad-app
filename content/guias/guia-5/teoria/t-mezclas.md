---
id: t-mezclas
skills: [mezclas]
---
## Mezclas y Bayes con un dato continuo

Muchos problemas tienen esta forma: hay una causa discreta $S$ que no se ve, y
se observa algo continuo $X$ que depende de ella. Un transmisor manda una de
tres amplitudes y el receptor mide la amplitud más ruido.

La distribución de lo observado es una **mezcla**:

$$f_X(x) = \sum_j f_{X \mid S = s_j}(x)\, P(S = s_j)$$

y para ir al revés —qué causa, dado lo observado— vale Bayes, pero con una
diferencia que hay que mirar: como $X$ es continua, $P(X = x) = 0$ y no se
puede dividir por eso. Lo que entra en la fórmula son **densidades**:

$$P(S = s \mid X = x) = \frac{f_{X \mid S = s}(x)\, P(S = s)}{\sum_j f_{X \mid S = s_j}(x)\, P(S = s_j)}$$

Formalmente sale de condicionar a $\{x < X < x + h\}$ y hacer $h \to 0$: las
densidades aparecen como el límite del cociente, y el $h$ se cancela arriba y
abajo.

**Dos cosas que ayudan a controlar el resultado.** El posterior tiene que sumar
1 sobre todas las causas. Y si las causas son equiprobables, el prior se
cancela y queda sólo el cociente de densidades: gana la causa que hace más
verosímil lo que se observó. Si además las causas están muy juntas frente al
ruido, el posterior queda casi uniforme, y eso no es un error de cuenta: es que
el dato casi no informa.
