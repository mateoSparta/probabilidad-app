---
id: t-tcl
skills: [tcl, aproximacion-normal]
---
## Teorema central del límite

Si $X_1, X_2, \dots$ son independientes, con la misma distribución, media
$\mu$ y varianza $\sigma^2$ finitas, entonces para $n$ grande

$$S_n = \sum_{i=1}^{n} X_i \approx N\!\left(n\mu,\ n\sigma^2\right)$$

**Lo notable es lo que el teorema no pide**: no hace falta saber de qué
distribución vienen las $X_i$. Si un enunciado dice "la longitud tiene media
30 y desvío 2" y nunca aclara la distribución, no es un olvido: es que no hace
falta. Con media y varianza alcanza.

El procedimiento es siempre: calcular $E[S_n]$ y $\operatorname{var}[S_n]$,
estandarizar y buscar en la tabla.

### Dimensionar: cuando la incógnita es $n$

Muchos ejercicios dan vuelta la pregunta: en vez de pedir una probabilidad,
piden el $n$ que garantiza cierta probabilidad. Ahí hay que plantear la
condición, estandarizar, y despejar $n$ de una desigualdad donde aparece
$\sqrt{n}$. Sustituyendo $u = \sqrt{n}$ queda una cuadrática.

Como $n$ tiene que ser entero, conviene **verificar la minimalidad**: que con
el $n$ hallado la condición se cumpla y con $n-1$ (o $n+1$, según el sentido)
no. Es la forma de no equivocarse al redondear.

Comparalo con el 3.26: ahí el mismo tipo de pregunta se resolvía con Chebyshev
y pedía 50000 datos, mientras el TCL pide 9604 para lo mismo. Chebyshev da una
garantía que no supone nada; el TCL da un número ajustado suponiendo que la
aproximación sirve.

### Corrección por continuidad

Al aproximar una variable **discreta** por la normal hay un desajuste: la
discreta pone masa en los enteros y la normal reparte densidad en todo el eje.
La corrección es estirar medio punto a cada lado:

$$P(X = k) \approx \Phi\!\left(\frac{k + 0.5 - \mu}{\sigma}\right) - \Phi\!\left(\frac{k - 0.5 - \mu}{\sigma}\right)$$

$$P(X > k) = P(X \ge k + 1) \approx 1 - \Phi\!\left(\frac{k + 0.5 - \mu}{\sigma}\right)$$

Sin la corrección, $P(X = k)$ daría cero, que es claramente inútil.

**La aproximación es una aproximación.** Cuando la respuesta es un entero
—"cuántas reservas aceptar"— puede pasar que la normal y el cálculo exacto den
números distintos, y ninguno de los dos está mal: son métodos distintos. Vale
la pena tenerlo presente para no desconfiar de tu cuenta si no coincide con una
resuelta.
