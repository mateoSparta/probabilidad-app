# Revisión de la Guía 3

Estado: **6 ejercicios cargados, 10 ítems, 6 skills nuevos, 4 bloques de teoría.**

El núcleo recomendado son 12 ejercicios. Se cargaron 6; de los otros 6, uno
está fuera de alcance por simulación, uno es de demostración y cuatro quedaron
sin cargar por problemas de transcripción.

---

## 1. Lo cargado y de dónde salió

| Ejercicio | Ítems | Tema | Modelo |
|---|---|---|---|
| 3.1 | a, b | esperanza de una variable **mixta** | `g3_01.py` |
| 3.16 | a | $E[g(X)]$ con la identidad $E[X^2] = \sigma^2 + \mu^2$ | `g3_16.py` |
| 3.10 | a, b | $E[g(X)] \ne g(E[X])$ | `g3_10.py` |
| 3.12 | a | esperanza de una función de dos variables | `g3_12.py` |
| 3.20 | a, b, c | covarianza y sus propiedades | `g3_20.py` |
| 3.26 | a | Chebyshev para dimensionar una muestra | `g3_26.py` |

**Qué verifica cada modelo, más allá del número.** En esta guía varios modelos
hacen la cuenta por los dos caminos y comparan, lo cual verifica la propiedad
en vez de asumirla:

- **3.16** integra $v^2$ contra la densidad normal y lo compara contra
  $\sigma^2 + \mu^2$. Si la identidad estuviera mal aplicada, el `assert` falla.
- **3.20** calcula $\operatorname{var}[X+Y]$ integrando $(X+Y)^2$ directo y
  también con $\operatorname{var} X + \operatorname{var} Y + 2\operatorname{cov}$,
  y exige que coincidan. Lo mismo con la covarianza del inciso (c).
- **3.1** chequea que la masa total dé 1 (integrales + átomos) antes de
  calcular nada, que es el control que detecta haberse olvidado un salto.

**3.26 se verifica distinto, y vale explicarlo.** Su respuesta es un $n$, y un
Monte Carlo no puede devolver un $n$. Así que el segundo camino no es simular
sino **chequear la minimalidad**: que con $n = 50000$ la cota de Chebyshev
alcance y con $49999$ no. Eso fija el valor sin depender del despeje
simbólico. Aparte, el modelo simula la desigualdad de Chebyshev en un caso
chico para confirmar que efectivamente se cumple.

---

## 2. Lo que falta del núcleo

### 2.1 Ejercicio 3.8 — depende de la tabla normal (guía 8)

Pide $E[Z \mid Z > z_0]$ para $Z$ normal estándar, deducir la cota
$1 - \Phi(z_0) \le \varphi(z_0)/z_0$ y compararla con el valor tabulado para
$P(Z > 3)$.

Dos razones para dejarlo:

- Necesita $\Phi$ y la tabla normal, que son de la guía 8. Cuando cargue la
  guía 8 y exista el skill `normal`, este ejercicio entra naturalmente.
- El extractor dejó los ítems (a) y (b) ilegibles:
  `Z | Z > z_{0\frac{ϕ(z0)}{z0}}` y `Deducir que 1 - Φ(z_{0}) \le.` — se
  mezclaron el enunciado y la respuesta del salto de línea. Hay que
  transcribirlo del PDF.

El ítem (b) es "deducir", o sea demostración, así que queda afuera igual. Los
ítems (a) y (d) son expresiones en $z_0$ (y en $x_0, \mu, \sigma$), así que van
como tipo `expresion`, y el (c) es numérico.

### 2.2 Ejercicio 3.4 — glifo sin traducir y respuesta abierta

El ítem (a) salió con un glifo sin traducir y pide **definir** una variable
aleatoria con ciertas propiedades y después decir si es única. No es una
respuesta validable con ninguno de los cuatro tipos: es una construcción.

Se podría cargar como `opcion` dando cuatro definiciones candidatas y pidiendo
cuál cumple. Hay que decidir si vale la pena.

### 2.3 Ejercicio 3.22 — fracción incompleta

La densidad conjunta salió así:

```
f_{X,Y}(x, y) = 5/(8π) e^{-?/2532} (x2 - ?/65 xy + y2)
```

Los `?` son fracciones que el extractor no pudo reconstruir, y sin ellas la
densidad no está definida. Pide la recta de regresión de $Y$ dada $X$, que es
un buen ejercicio de covarianza. **Hay que leer la página 20 del PDF** y
transcribir la densidad a mano.

### 2.4 Ejercicio 3.32 — glifos y demostraciones

Los corchetes grandes de $E[\cdot]$ y $\operatorname{var}[\cdot]$ salieron sin
traducir, y los límites de las sumatorias quedaron mal ubicados (es el caso que
el extractor marca a propósito). Además los ítems (c) y (d) dicen "mostrar
que", así que son demostración.

Los ítems (a) y (b) sí son cargables —$E[\bar X]$, $\operatorname{var}[\bar X]$
y $E[W^2]$ en función de $\mu$ y $\sigma^2$, como tipo `expresion`— una vez
arreglado el enunciado. Es el contenido que después sostiene la guía 8.

### 2.5 Ejercicio 3.23 — demostración

"Demostrar que $P(X \ge 60) \le 0{,}25$". Excluido por CLAUDE.md. El contenido
(Markov) está cubierto por la teoría y se practica en el 3.26.

### 2.6 Ejercicio 3.35 — fuera de alcance

Marcado con `Ï`: requiere simulación.

---

## 3. Mejoras al pipeline que salieron de esta guía

Las dos las encontraron los chequeos, no yo:

**El smoke test tenía un sondeo demasiado blando.** Para verificar que el motor
rechaza un valor equivocado, probaba con `valor + 1`. Con respuestas grandes
—$1800/\pi \approx 573$, o $50000$— el 1 % de tolerancia por defecto se come
ese 1 y el valor equivocado pasaba como bueno. Ahora el sondeo se aparta en
proporción a la tolerancia declarada.

**Y eso destapó un problema de contenido real**: el 1 % por defecto existe para
absorber el redondeo de la tabla normal (PLAN.md §11), pero sobre una respuesta
grande es enorme. Con el valor 111 aceptaba 112; con 50000 aceptaba todo el
rango 49500–50500.

Así que el validador tiene una regla nueva: **avisa si la respuesta es un
entero exacto y la tolerancia admite el entero de al lado**. Con eso se
ajustaron las tolerancias de 3.10, 3.16 y 3.26. Conviene tenerlo en cuenta al
cargar ejercicios nuevos: la tolerancia por defecto sirve para respuestas del
orden de 1, no para cualquier escala.

---

## 4. Skills de la guía

| Skill | Ítems que lo evalúan |
|---|---|
| `esperanza` | 3.1 a, b, 3.10 a, b |
| `momentos` | 3.10 a, b, 3.12 a, 3.16 a |
| `esperanza-condicional-evento` | 3.1 b |
| `varianza` | 3.16 a, 3.20 b, 3.26 a |
| `covarianza` | 3.20 a, b, c |
| `desigualdades` | 3.26 a |

`esperanza-condicional-evento` lo evalúa un solo ítem, que es poco: con un
único ítem el skill nunca puede llegar a "dominado", porque el estado se mide
sobre los últimos 5 intentos y el máximo es uno por día. Cuando se carguen más
ejercicios de la guía 3 se arregla solo; mientras tanto, es una limitación a
tener en cuenta al mirar el panel.

---

## 5. Decisiones de contenido que conviene que mires

- **3.1** tiene el enunciado corregido a mano: el extractor aplanó $x^3/3$ a
  `x3/3`. Confirmé que con $x^3/3$ la distribución es coherente (la masa da 1 y
  hay dos átomos de $1/6$), lo cual es evidencia fuerte de que la
  interpretación es la correcta.
- **3.26** se cargó pidiendo explícitamente **Chebyshev**. El enunciado
  original no lo aclara, y por el TCL el $n$ sale 9604 en vez de 50000. Como la
  guía 3 no tiene todavía el TCL, Chebyshev es lo que corresponde, pero lo
  dejé escrito en el ítem para que no quede ambiguo. **Si la cátedra espera el
  otro número, hay que cambiarlo**, y es el único lugar de todo el contenido
  donde tomé una decisión de interpretación de ese tipo.
- **3.10** y **3.16** tienen el error típico cargado como valor de control en
  `fuentes_valor`: $900/\pi$ y $108$, que son lo que da pasar la media por
  dentro de la función. No se muestran al alumno, pero quedan documentados.

---

## 6. Pendiente

Sin cruzar contra las resueltas. Para la guía 3 hay tres (`RES 1`, `RES 2`,
`RES 3`), 75 páginas escaneadas.

```
npm run rasterizar -- fuentes/resueltas/guia-3
```
