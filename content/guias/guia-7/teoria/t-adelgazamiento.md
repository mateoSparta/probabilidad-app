---
id: t-adelgazamiento
skills: [superposicion-adelgazamiento]
---
## Superposición y adelgazamiento

Dos operaciones que dejan al proceso de Poisson dentro de la familia, y por eso
simplifican tanto.

### Superposición

Juntar dos procesos de Poisson independientes da otro proceso de Poisson, con
las intensidades sumadas:

$$\lambda = \lambda_1 + \lambda_2$$

Y para el primer evento del proceso combinado valen las mismas tres cosas que
en la competencia de exponenciales de la guía 4: llega en
$\text{Exp}(\lambda_1 + \lambda_2)$, viene del primer proceso con probabilidad
$\lambda_1/(\lambda_1+\lambda_2)$, y **cuándo llega y de quién es son
independientes**.

### Adelgazamiento

Si cada evento se conserva con probabilidad $p$, independientemente de los
otros y del tiempo, lo que queda es un proceso de Poisson de intensidad

$$\lambda_p = p\,\lambda$$

Es el mismo razonamiento del 4.19: condicionado al total, cada evento tira una
moneda para decidir si pasa el filtro.

Esto resuelve de un paso problemas que parecen difíciles. Si las fallas de un
alambre son Poisson de intensidad $1/20$ por metro y la máquina detecta cada
una con probabilidad $0{,}75$, entonces las **detectadas** son Poisson de
intensidad $0{,}75/20$, y la distancia hasta la primera detectada es
exponencial de media $20/0{,}75$. No hay que sumar sobre cuántas fallas
pasaron sin detectarse.

Pero si la pregunta es por el **total** de fallas (detectadas y no) hasta la
primera detectada, ahí sí aparece lo discreto: las que pasaron antes son los
fracasos antes del primer éxito, o sea geométrica de media $(1-p)/p$.
