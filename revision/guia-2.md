# Revisión de la Guía 2

Estado: **5 ejercicios cargados, 11 ítems, 6 skills nuevos, 4 bloques de teoría.**

El núcleo recomendado de la guía 2 son 10 ejercicios. Se cargaron 5; de los
otros 5, uno está fuera de alcance por simulación y cuatro quedaron sin cargar
por razones concretas que están abajo.

---

## 1. Lo cargado y de dónde salió

| Ejercicio | Ítems | Tipo | Modelo |
|---|---|---|---|
| 2.1 | a, b, c | opción | `g2_01.py` — calcula las preimágenes y chequea si están en el álgebra |
| 2.8 | a, b (2 checkpoints c/u) | checkpoints | `g2_08.py` — integra la Gamma con sympy; simula como suma de exponenciales |
| 2.19 | a, b (3 checkpoints c/u) | checkpoints | `g2_19.py` — truncamiento, con la densidad verificada por ventana |
| 2.22 | a, b, c | numérica + checkpoints + opción | `g2_22.py` — integra sobre el semicírculo; simula por rechazo |
| 2.26 | a | numérica | `g2_26.py` — área de la región de encuentro |

Todos los valores pasaron por los dos caminos: exacto (sympy) y Monte Carlo
con 400.000 repeticiones.

**Un detalle nuevo del pipeline.** Un valor de densidad no es una frecuencia,
así que no se puede estimar contando. Se agregó `montecarlo_densidad`, que
estima $f(x)$ como $P(\lvert X - x \rvert < h)/2h$ con $h = 0{,}1$. Eso permitió
verificar por dos caminos también las densidades de 2.19 y 2.22, que si no
habrían quedado sostenidas sólo por la integral simbólica.

Al hacerlo apareció un caso que vale conocer: **en el borde del soporte la
ventana cae mitad afuera** y la estimación sale exactamente a la mitad. Pasó
con $f_X(0) = 2/\pi$ del 2.22, donde el semicírculo empieza en $x = 0$. El
helper ahora acepta una ventana de un solo lado.

---

## 2. Lo que falta del núcleo

### 2.1 Ejercicio 2.2 — depende de un gráfico

El enunciado dice "la función de distribución $F_X$ **tiene gráfico de forma**
…" y después viene una figura. El extractor sólo pudo sacar las etiquetas de
los ejes:

```
−3 −2 −1 0 1 2 3   y   0, 1/3, 2/3, 1
```

O sea: una escalera con tres saltos de $1/3$, en puntos que no se pueden
deducir de las etiquetas. **No lo cargué porque habría tenido que adivinar
dónde están los saltos**, y ese es exactamente el tipo de cosa que la regla de
no inventar resultados prohíbe.

Es una lástima porque el ejercicio es muy bueno: los ítems (b) a (e) son justo
la práctica de distinguir $P(-2 < X \le 2)$ de $P(-2 \le X \le 2)$, que es
donde todo el mundo se equivoca. **Mirá la página 10 del PDF**, decime dónde
están los tres saltos y lo cargo entero en cinco minutos.

### 2.2 Ejercicio 2.17 — glifos sin traducir

La función intensidad de fallas salió así del extractor:

```
λ(t) = β/α ⟨?TeX-mathx:ˆ⟩ t/α ⟨?TeX-mathx:˙⟩_{β-1}
```

Los dos glifos sin traducir son **paréntesis grandes extensibles**, que es el
caso que el extractor marca a propósito en vez de adivinar (ver §4.8 del plan).
La expresión real es casi con seguridad

$$\lambda(t) = \frac{\beta}{\alpha} \left(\frac{t}{\alpha}\right)^{\beta-1} \mathbf{1}\{t > 0\}$$

que es la intensidad de una Weibull, y encaja con lo que pide el inciso (b)
(clasificar en fallas tempranas, casuales o por desgaste según $\beta$). Pero
"casi con seguridad" no alcanza: hay que confirmarlo en el PDF.

Cuando se confirme, el ítem (d) es numérico y verificable sin problema. Los
ítems (a) a (c) piden funciones y gráficos, así que van como `checkpoints` y
`opcion`.

### 2.3 Ejercicio 2.16 — referencia a otro ejercicio

Pide una función $h$ tal que $h(X)$ tenga la distribución de la variable
$T^{*}$ "definida en el Ejercicio 2.12". El 2.12 no está cargado, así que el
enunciado no se sostiene solo. Hay que cargar primero el 2.12, o reescribir el
2.16 para que incluya la definición.

### 2.4 Ejercicio 2.11 — fuera de alcance

Marcado con `Ï` en la guía: requiere simulación por computadora. Excluido por
CLAUDE.md, como los otros 11 de ese tipo.

### 2.5 Ejercicio 2.13 — se puede, pero no lo cargué

Pide expresiones para las distribuciones de $G(X)$, $F_X(X)$ y
$G^{-1}(F_X(X))$. Las respuestas son funciones, no números, así que iría como
`opcion` con cuatro expresiones candidatas. Es cargable y verificable por
simulación (comparar la distribución empírica de la transformada contra la
teórica); lo dejé afuera por tiempo, no por un problema. Es el candidato más
fácil para seguir.

---

## 3. Skills de la guía

Seis nuevos, contra los siete temas que PLAN.md §4.2 lista para la guía 2.

| Skill | Ítems que lo evalúan |
|---|---|
| `variable-aleatoria` | 2.1 a, b, c |
| `funcion-distribucion` | 2.8 a |
| `densidad` | 2.8 a, b, 2.19 a, b, 2.22 b |
| `truncamiento` | 2.8 a, b, 2.19 a, b |
| `conjunta-marginales` | 2.22 a, b, c, 2.26 a |
| `independencia-va` | 2.22 c, 2.26 a |

No está `vectores` como skill separado: quedó dentro de
`conjunta-marginales`, que es donde se practica. Y `prob-geometrica`, que es de
la guía 1, se reusa en 2.22 y 2.26, que es justamente lo que el modelo de
skills globales permite.

---

## 4. Decisiones de contenido que conviene que mires

- **2.8** tiene el enunciado corregido a mano. El extractor había aplanado el
  exponente: emitió `(1/2)k` donde el PDF dice $(1/2)^k$. Es el caso conocido
  de los superíndices sobre un paréntesis.
- **2.19(b)** es el ítem donde más vale la pena insistir: la densidad de las
  descartadas vive en dos pedazos y vale **cero** entre 3 y 12. El tercer
  checkpoint pide justamente la densidad en $x = 5$, que es 0, para forzar que
  eso se note.
- **2.22(b)** tiene una asimetría fácil de pasar por alto: el corte en $x$ va
  de $-\sqrt{4-x^2}$ a $\sqrt{4-x^2}$, pero el corte en $y$ va de $0$ a
  $\sqrt{4-y^2}$, porque el semicírculo es sólo la mitad derecha. Por eso
  $f_Y$ lleva un $2\pi$ y $f_X$ no.
- **2.26** da $8/9$. La región de no-encuentro son dos triángulos de área
  $25/2$ cada uno sobre un rectángulo de área 225. Vale notar que los dos
  tiempos de espera son distintos (15 y 5 minutos), así que **no** sale con el
  $|L - M| < c$ del problema clásico del encuentro.

---

## 5. Pendiente de todas las guías

Igual que la guía 1: **nada se cruzó contra las resueltas de la cátedra**. Para
la guía 2 hay tres (`GUIA 2 RES 1`, `RES 2` y `SAN`), 67 páginas escaneadas.

```
npm run rasterizar -- fuentes/resueltas/guia-2
```
