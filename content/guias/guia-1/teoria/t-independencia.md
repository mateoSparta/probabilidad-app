---
id: t-independencia
skills: [independencia]
---
## Independencia

Dos eventos son **independientes** cuando saber que ocurrió uno no modifica
la probabilidad del otro. La definición formal se expresa como un producto:

$$P(A \cap B) = P(A)\,P(B)$$

En la práctica, la independencia rara vez se verifica con esta fórmula. Lo
habitual es **justificarla a partir del enunciado**, cuando el mecanismo del
experimento la garantiza, como en extracciones de urnas distintas, tiradas
sucesivas de un dado o componentes que fallan por causas separadas.

Para una familia de más de dos eventos no basta con la independencia de a
pares. Se requiere que la regla del producto valga para **toda** subfamilia,
condición que suele aparecer en los contraejemplos.

La independencia simplifica el estudio de repeticiones sucesivas. Si cada
intento falla con probabilidad $q$, la probabilidad de $n$ fracasos
consecutivos es $q^n$, y de este hecho se deduce la mayoría de los
resultados sobre la cantidad de intentos hasta el primer éxito.
