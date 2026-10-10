---
id: t-multinomial
skills: [multinomial]
---
## Multinomial

La **distribución multinomial** generaliza la binomial al caso en que cada
ensayo admite $r$ resultados, con probabilidades $p_1, \dots, p_r$ que suman
1. Si $X_i$ es la cantidad de ensayos que caen en la categoría $i$ entre $n$
ensayos independientes,

$$P(X_1 = k_1, \dots, X_r = k_r) = \frac{n!}{k_1! \cdots k_r!}\, p_1^{k_1} \cdots p_r^{k_r}, \qquad k_1 + \dots + k_r = n$$

El coeficiente cuenta las formas de asignar los $n$ ensayos a las categorías
con esas cantidades, del mismo modo que el coeficiente binomial cuenta las
posiciones de los éxitos.

Cada componente por separado es binomial, $X_i \sim \text{Bin}(n, p_i)$,
porque basta con agrupar las demás categorías en un único resultado de
fracaso. Las componentes **no** son independientes, ya que su suma vale $n$.

### Eventos sobre varias categorías

Para un evento como "mayoría de verdes y al menos una amarilla" conviene
listar las combinaciones $(k_1, \dots, k_r)$ que lo cumplen, que suelen ser
pocas, y sumar sus probabilidades. Si la lista es larga, la
inclusión-exclusión sobre los eventos "ningún ensayo en la categoría $i$"
suele acortarla, porque

$$P(X_i = 0) = (1 - p_i)^n, \qquad P(X_i = 0,\ X_j = 0) = (1 - p_i - p_j)^n$$

### Condicionar a una categoría

Si se sabe que $k$ de los $n$ ensayos cayeron en la categoría 1, los otros
$n - k$ forman una multinomial sobre las categorías restantes, con las
probabilidades renormalizadas $p_j / (1 - p_1)$.
