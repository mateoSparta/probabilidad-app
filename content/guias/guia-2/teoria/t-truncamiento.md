---
id: t-truncamiento
skills: [truncamiento]
---
## Condicionar a un evento

Saber que ocurrió $A$ cambia la distribución de $X$. La receta es la misma que
con eventos: quedarse con lo que vive en $A$ y renormalizar.

$$f_{X \mid A}(x) = \frac{f_X(x)\,\mathbf{1}\{x \in A\}}{P(A)}$$

Dividir por $P(A)$ no es cosmético: es lo que hace que la densidad nueva vuelva
a integrar 1.

**Dos cosas que se escapan seguido.**

La primera: el soporte de la condicional **no tiene que ser un intervalo**. Si
$A$ es "el diámetro es menor que 3 o mayor que 12", la densidad condicional
vive en dos pedazos separados y vale cero en el medio. Escribirla como si fuera
un solo intervalo es el error típico.

La segunda: la **pérdida de memoria** es una propiedad, no una regla general.
Para la exponencial vale que $P(X > s + t \mid X > s) = P(X > t)$, y eso se ve
lindo; pero si la variable no es exponencial, el condicional no se simplifica y
hay que calcularlo. Una suma de exponenciales, por ejemplo, ya no la tiene.
