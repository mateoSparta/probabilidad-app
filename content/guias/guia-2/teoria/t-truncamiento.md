---
id: t-truncamiento
skills: [truncamiento]
---
## Condicionar a un evento

Saber que ocurrió un evento $A$ modifica la distribución de $X$. El
procedimiento es el mismo que con eventos, es decir, se conservan los
valores contenidos en $A$ y se renormaliza.

$$f_{X \mid A}(x) = \frac{f_X(x)\,\mathbf{1}\{x \in A\}}{P(A)}$$

La división por $P(A)$ garantiza que la nueva densidad integre 1.

**Dos aspectos que suelen pasarse por alto.**

En primer lugar, el soporte de la densidad condicional **no tiene por qué
ser un intervalo**. Si $A$ es el evento "el diámetro es menor que 3 o mayor
que 12", la densidad condicional está definida sobre dos intervalos
separados y vale cero entre ellos. Escribirla como si su soporte fuera un
único intervalo es el error más frecuente.

En segundo lugar, la **pérdida de memoria** es una propiedad particular, que
no vale en general. La exponencial cumple
$P(X > s + t \mid X > s) = P(X > t)$, pero para otras distribuciones la
probabilidad condicional no se simplifica y debe calcularse. Una suma de
exponenciales independientes, por ejemplo, ya no tiene esta propiedad.
