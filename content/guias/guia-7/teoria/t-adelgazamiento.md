---
id: t-adelgazamiento
skills: [superposicion-adelgazamiento]
---
## Superposición y adelgazamiento

Hay dos operaciones que transforman procesos de Poisson en procesos de
Poisson, y por eso simplifican mucho los cálculos.

### Superposición

La unión de dos procesos de Poisson independientes es un proceso de Poisson
cuya intensidad es la suma de las intensidades:

$$\lambda = \lambda_1 + \lambda_2$$

Para el primer evento del proceso combinado valen los mismos tres resultados
que en la competencia de exponenciales de la guía 4. Ocurre en un tiempo
$\text{Exp}(\lambda_1 + \lambda_2)$, proviene del primer proceso con
probabilidad $\lambda_1/(\lambda_1+\lambda_2)$, y **el momento en que ocurre
y el proceso del que proviene son independientes**.

### Adelgazamiento

Si cada evento se conserva con probabilidad $p$, de manera independiente de
los demás y del tiempo, los eventos conservados forman un proceso de Poisson
de intensidad

$$\lambda_p = p\,\lambda$$

El razonamiento es el mismo del ejercicio 4.19. Condicionado al total, cada
evento se conserva o se descarta de manera independiente.

Este resultado resuelve en un solo paso problemas que en apariencia son
difíciles. Si las fallas de un alambre forman un proceso de Poisson de
intensidad $1/20$ por metro y la máquina detecta cada una con probabilidad
$0{,}75$, las fallas **detectadas** forman un proceso de Poisson de
intensidad $0{,}75/20$, y la distancia hasta la primera falla detectada es
exponencial de media $20/0{,}75$. No hace falta sumar sobre la cantidad de
fallas no detectadas.

En cambio, si la pregunta es por el **total** de fallas, detectadas o no,
hasta la primera detectada, interviene una distribución discreta. Las fallas
anteriores son los fracasos previos al primer éxito, cuya cantidad tiene
distribución geométrica de media $(1-p)/p$.
