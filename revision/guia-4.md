# Revisión de la Guía 4

Estado: **4 ejercicios cargados, 9 ítems, 3 skills nuevos, 3 bloques de teoría.**

El núcleo recomendado son 7 ejercicios. Se cargaron 4; de los otros 3, uno está
fuera de alcance por simulación y dos quedaron sin cargar por transcripción.

---

## 1. Lo cargado

| Ejercicio | Ítems | Tipo | Qué practica |
|---|---|---|---|
| 4.6 | a (4 checkpoints) | checkpoints | una transformación que **crea átomos** |
| 4.24 | a (3 checkpoints), b | checkpoints + numérica | método de la F con una **fórmula por trozos** |
| 4.14 | a, b, c | **expresión** ×3 | competencia de exponenciales |
| 4.19 | a, b, c | numérica + checkpoints + numérica | suma de Poisson y la binomial condicional |

**El 4.14 es el primer ejercicio que usa en serio el tipo `expresion`.** Hasta
ahora sólo lo usaba el 1.7(b). Las tres respuestas son funciones de
$\lambda_1$, $\lambda_2$ y $t$, y el motor las compara evaluando en seis puntos
al azar de los rangos declarados. Vale la pena probarlo escribiendo la
respuesta de formas algebraicamente distintas pero equivalentes: tiene que
aceptarlas todas.

**Lo que verifica cada modelo, más allá del número:**

- **4.6** chequea que los dos átomos más la masa del tramo central sumen 1.
- **4.14** chequea que la densidad de $W$ integre 1, y deriva $P(J=1)$
  integrando la conjunta en vez de citar el resultado.
- **4.19** calcula $P(L+M=10)$ con la Poisson de media 10 **y** por
  convolución, sumando los 11 términos, y exige que coincidan. Eso verifica que
  la suma de Poisson sea Poisson en vez de asumirlo. El Monte Carlo condiciona
  por rechazo, lo cual verifica que la binomial del inciso (b) sea realmente la
  distribución condicional.
- **4.24** chequea que $F_R(\sqrt{2}) = 1$ y que en el tramo chico coincida con
  $\pi r^2/4$, que son los dos controles que detectan haber errado el tramo.

---

## 2. Lo que falta del núcleo

### 2.1 Ejercicio 4.3 — la densidad salió corrupta

El extractor emitió:

```
Sea X una variable aleatoria\frac{continua12x}{π2(ex+1)}con función densidad f_X(x) = 1{x > 0}
```

Se mezclaron la palabra "continua" y la fórmula. Reconstruyendo, la densidad
casi con seguridad es

$$f_X(x) = \frac{12x}{\pi^2(e^x + 1)}\,\mathbf{1}\{x > 0\}$$

y hay un argumento fuerte a favor: **integra exactamente 1**, porque
$\int_0^\infty x/(e^x+1)\,dx = \pi^2/12$. Que la constante encaje así no es
casualidad.

Aun así no lo cargué, por dos razones. Una, "casi con seguridad" no es
suficiente para la regla de no inventar. Y dos, esta densidad no tiene $F$ en
forma cerrada, así que los cuatro incisos piden densidades de transformaciones
que habría que dejar como expresiones bastante incómodas, y los ítems (c) y (d)
son transformaciones **no monótonas** ($X + X^{-1}$ y $X^2 - 3X$), donde hay
que sumar ramas. Es un ejercicio caro de cargar bien.

Si querés, confirmá la densidad y arranco con los ítems (a) y (b), que son los
monótonos y los más directos.

### 2.2 Ejercicio 4.10 — glifos y fracción incompleta

Tres problemas a la vez:

- el ítem (a).2 define $(U, V)$ con una **matriz de rotación** y los
  delimitadores grandes salieron sin traducir (`⟨?TeX-mathx:ˆ⟩`, `⟨?TeX-mathx:˙⟩`);
- el ítem (c) tiene una fracción incompleta: `P(Z^2 > \sqrt{?/3} Z_1)`;
- los subíndices de $Z_1^2 + Z_2^2$ quedaron desparramados.

Es un ejercicio importante —rotación de normales, independencia después de la
transformación, y la chi-cuadrado implícita en $Z_1^2 + Z_2^2$— pero hay que
transcribirlo del PDF entero. **Página 24.**

### 2.3 Ejercicio 4.1 — cargable, no lo cargué

Transformaciones de una variable discreta: cuatro transformaciones de la misma
$X$. El único problema de extracción es el delimitador del conjunto
$\{k/8 : k = 0,\dots,8\}$, que es reconstruible sin dudas, y la función de
probabilidad $p_X(x) = (2/9)x$ suma 1 sobre ese conjunto, lo cual confirma la
lectura.

Lo dejé por volumen: son cuatro ítems y cada uno pide una función de
probabilidad entera, o sea varios checkpoints cada uno. Es trabajo mecánico y
sin riesgo. Es el candidato más fácil para seguir en esta guía.

Vale notar que los ítems (c) y (d) son interesantes: $-64X^2 + 64X + 2$ y
$64X^2 - 96X + 128$ no son inyectivas sobre el soporte, así que valores
distintos de $X$ colapsan en el mismo $Y$ y hay que **sumar** probabilidades.
Es el análogo discreto de lo que practica el 4.6.

### 2.4 Ejercicio 4.17 — fuera de alcance

Marcado con `Ï`: requiere simulación.

---

## 3. Skills de la guía

Tres nuevos. PLAN.md §4.2 lista cinco temas para la guía 4; faltan dos:

| Skill | Ítems que lo evalúan |
|---|---|
| `transformacion-F` | 4.6 a, 4.24 a, b, 4.14 a |
| `min-max` | 4.14 a, b, c |
| `suma-independientes` | 4.19 a, b, c |

**No está `cambio-variable` (el jacobiano)** porque ningún ítem cargado lo
evalúa: el 4.6 y el 4.24 se resuelven por el método de la F, y los ejercicios
que pedían densidad por cambio de variable son justo el 4.3 y el 4.10, los dos
que quedaron afuera. El validador exige que todo skill de un bloque de teoría
esté evaluado por algún ítem, así que agregarlo antes de cargar esos
ejercicios rompería el build —y con razón: sería teoría que se lee y no se
practica.

La teoría de `t-metodo-F` igual explica la fórmula del cambio de variable,
porque es la contracara del método de la F, pero el skill no existe todavía.

---

## 4. Decisiones de contenido que conviene que mires

- **4.6**: el enunciado define $g$ con dos indicadoras y no dice explícitamente
  qué pasa cuando $v < 190$. De la estructura se deduce que $g = 0$ ahí (la
  primera indicadora no se activa y la segunda tampoco), y eso es lo que
  modelé. Da un átomo de $1/4$ en 0. Si la intención fuera otra, el ítem
  cambia.
- **4.14** pide escribir las respuestas con `l1`, `l2` y `t`. Está dicho en el
  enunciado, pero es una convención de la app y no del ejercicio: si te resulta
  incómodo se puede cambiar por `lambda1`/`lambda2`.
- **4.19** anticipa la Poisson, que PLAN.md ubica en la guía 7. Está así en la
  guía de la cátedra, y seguí su orden. El resultado de la binomial condicional
  vuelve a aparecer en la guía 7 como adelgazamiento, y la teoría lo dice.
- **4.24(a)** tiene el tercer checkpoint con un valor feo:
  $\pi(1{,}44)/4 - 1{,}44\arccos(1/1{,}2) + \sqrt{0{,}44} \approx 0{,}9509$. Es
  el tramo interesante (el círculo ya se salió del cuadrado) y por eso lo dejé,
  pero es el checkpoint más duro de todo el contenido cargado hasta ahora.

---

## 5. Pendiente

Sin cruzar contra las resueltas. Para la guía 4 hay tres (`RES 2`, `RES 3`,
`RES 4`), 71 páginas escaneadas.

```
npm run rasterizar -- fuentes/resueltas/guia-4
```
