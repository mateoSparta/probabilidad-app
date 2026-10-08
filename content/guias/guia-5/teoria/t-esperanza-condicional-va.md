---
id: t-esperanza-condicional-va
skills: [esperanza-condicional, esperanza-total]
---
## E[Y | X] es una variable aleatoria

Hasta la guía 3, condicionar era condicionar a un **evento** y daba un número.
Acá cambia: $E[Y \mid X]$ se condiciona a una **variable**, y el resultado es
otra variable aleatoria.

Primero se calcula la **función de regresión**, que sí es una función común:

$$\varphi(x) = E[Y \mid X = x]$$

y después $E[Y \mid X] = \varphi(X)$: se reemplaza el valor por la variable. Es
aleatoria porque $X$ lo es.

Que sea una variable permite tomarle esperanza, y de ahí sale la herramienta
más útil de la guía, la **esperanza total**:

$$E[Y] = E\big[E[Y \mid X]\big]$$

Promediar las medias condicionales devuelve la media. Se usa cuando el
problema se parte naturalmente en casos: "según qué senda elija la rata",
"según cuál moneda salió".

### Dos cosas que conviene tener a mano

**El planteo puede referirse a sí mismo.** Si al elegir mal la rata vuelve al
punto de partida, la espera que le queda tiene la misma media que la original.
Eso da una ecuación con la incógnita en los dos lados, y se despeja. Olvidarse
ese término es el error más común: da el promedio de los tiempos en vez de la
respuesta.

**Y la identidad de Wald**, para cuando se suma una cantidad aleatoria de
términos:

$$E\!\left[\sum_{i=1}^{N} L_i\right] = E[N]\, E[L]$$

Vale si $N$ es un tiempo de parada sobre los $L_i$, que es el caso típico de
"producir hasta que uno sirva". Suena demasiado bueno —el último término no es
uno cualquiera, es el que cumplió la condición— y la intuición dice que el
total debería ser mayor. Pero no: el último es más largo que el promedio y los
$N-1$ anteriores son más cortos, y las dos cosas se compensan exactamente.
