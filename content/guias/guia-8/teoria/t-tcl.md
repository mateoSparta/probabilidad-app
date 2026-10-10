---
id: t-tcl
skills: [tcl, aproximacion-normal]
---
## Teorema central del límite

Si $X_1, X_2, \dots$ son independientes, con la misma distribución, media
$\mu$ y varianza $\sigma^2$ finitas, entonces, para $n$ grande,

$$S_n = \sum_{i=1}^{n} X_i \approx N\!\left(n\mu,\ n\sigma^2\right)$$

**Lo notable es que el teorema no requiere conocer la distribución de las
$X_i$.** Si un enunciado indica que la longitud tiene media 30 y desvío 2 sin
aclarar la distribución, la omisión es deliberada, porque la media y la
varianza son suficientes.

El procedimiento consiste en calcular $E[S_n]$ y $\operatorname{var}[S_n]$,
estandarizar y buscar en la tabla.

### Cuando la incógnita es $n$

Muchos ejercicios invierten la pregunta y piden el valor de $n$ que
garantiza cierta probabilidad. En ese caso se plantea la condición, se
estandariza y se despeja $n$ de una desigualdad en la que aparece
$\sqrt{n}$. Con la sustitución $u = \sqrt{n}$ se obtiene una ecuación
cuadrática.

Como $n$ debe ser entero, conviene **verificar la minimalidad**, es decir,
comprobar que con el $n$ hallado la condición se cumple y con $n-1$ (o
$n+1$, según el sentido de la desigualdad) no. Esta verificación evita
errores de redondeo.

En el ejercicio 3.26 se resolvió el mismo tipo de pregunta con la
desigualdad de Chebyshev, que requería 50000 datos, mientras que el TCL
requiere 9604. Chebyshev ofrece una garantía sin supuestos sobre la
distribución; el TCL da un valor más ajustado bajo el supuesto de que la
aproximación normal es adecuada.

### Corrección por continuidad

Al aproximar una variable **discreta** por una normal se produce un
desajuste, porque la variable discreta concentra la probabilidad en los
enteros y la normal la distribuye de manera continua. La corrección consiste
en extender medio punto a cada lado:

$$P(X = k) \approx \Phi\!\left(\frac{k + 0{,}5 - \mu}{\sigma}\right) - \Phi\!\left(\frac{k - 0{,}5 - \mu}{\sigma}\right)$$

$$P(X > k) = P(X \ge k + 1) \approx 1 - \Phi\!\left(\frac{k + 0{,}5 - \mu}{\sigma}\right)$$

Sin la corrección, la aproximación de $P(X = k)$ daría cero.

**Los resultados de una aproximación pueden diferir de los exactos.** Cuando
la respuesta es un entero, como la cantidad de reservas que pueden
aceptarse, la aproximación normal y el cálculo exacto pueden dar valores
distintos. Ambos resultados son correctos dentro de su método, y conviene
tenerlo presente al comparar con una resolución que use el otro
procedimiento.
