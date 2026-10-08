---
id: t-independencia
skills: [independencia]
---
## Independencia

Dos eventos son **independientes** cuando saber que pasó uno no cambia la
probabilidad del otro. La definición operativa es el producto:

$$P(A \cap B) = P(A)\,P(B)$$

En la práctica la independencia casi nunca se verifica: se **justifica desde el
enunciado**. Dos extracciones de urnas distintas, tiradas sucesivas de un dado,
componentes que fallan por su cuenta: ahí el producto está habilitado porque el
mecanismo del experimento lo dice.

Para una familia de eventos no alcanza con que sean independientes de a pares:
hace falta que el producto valga para **toda** subfamilia. Es un detalle que
aparece seguido en contraejemplos.

Con independencia, una sucesión de repeticiones se vuelve manejable. Si cada
intento falla con probabilidad $q$, entonces $n$ fracasos seguidos tienen
probabilidad $q^n$, y de ahí sale casi todo lo que se pregunta sobre "cuántos
intentos hasta el primer éxito".
