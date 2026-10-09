# Revisión de la Guía 8

Estado: **6 ejercicios cargados, 7 ítems, 4 skills nuevos, 2 bloques de teoría.**

De los 8 del núcleo recomendado se cargaron 6. Los dos que faltan son uno de
demostración y uno que depende de un ejercicio no cargado.

---

## 1. Lo que hay que leer de esta guía

### 1.1 El 8.12 da dos respuestas distintas según el método

Es el hallazgo más importante de toda la carga de contenido, así que va
primero.

El ejercicio pide el número máximo de reservas que se pueden aceptar para que
la probabilidad de dejar gente afuera no pase de $0{,}01$. Con 100 plazas y
cancelaciones del 10 %:

| método | respuesta |
|---|---|
| aproximación normal (con corrección por continuidad) | **103** |
| aproximación normal (sin corrección) | **103** |
| suma exacta de la binomial | **104** |

Los números detrás:

| $n$ | $P(>100)$ exacta | $P(>100)$ por la normal |
|---|---|---|
| 103 | $0{,}0015$ | $0{,}0052$ |
| 104 | $0{,}0057$ | $0{,}0121$ |
| 105 | $0{,}0167$ | — |

Con $n = 104$ la probabilidad exacta **entra** en el $0{,}01$ pero la
aproximación normal **no**, porque sobreestima la cola en este rango. Ninguno
de los dos está mal: son métodos distintos.

**El contenido carga 103**, que es la respuesta por el TCL, porque el ejercicio
está en el capítulo del TCL y el enunciado del ítem lo dice explícitamente. La
última pista avisa del 104 y explica por qué.

**Qué mirar cuando cruces contra la resuelta:** si la resuelta dice 104, no es
un error, usó la binomial exacta. Si dice 103, coincide. Lo que sí sería un
error es que diga otra cosa. Y si la cátedra espera 104, hay que cambiar el
valor del ítem y la pista.

### 1.2 Las respuestas de esta guía salen de una tabla redondeada

PLAN.md §11 lo anticipaba: las respuestas que pasan por $\Phi$ dependen de
cuántos decimales tenga la tabla. Los ítems de esta guía usan el 1 % de
tolerancia por defecto, que absorbe ese redondeo. El modelo calcula $\Phi$ con
`erf` de sympy, así que el valor guardado es el exacto, no el tabulado.

El 8.9 lleva la tolerancia a 3 % a propósito, para aceptar las tres respuestas
razonables: la aproximación con corrección por continuidad ($0{,}1188$), sin
corrección ($0{,}1183$) y el valor exacto de la binomial ($0{,}1208$). El
enunciado pide la aproximación, pero no tiene sentido marcar mal a alguien que
además calculó el exacto.

### 1.3 Esta guía tiene la peor cobertura de resueltas

PLAN.md §11 también lo anticipaba: para la guía 8 hay **una sola** resuelta
(`GUIA 8 RES 3`, 22 páginas), contra dos o tres de las demás. Así que es la
guía donde el cálculo independiente sostiene más peso y donde menos se puede
cruzar.

---

## 2. Lo cargado

| Ejercicio | Ítems | Qué practica |
|---|---|---|
| 8.5 | a | combinación lineal de normales (coeficientes **al cuadrado** en la varianza) |
| 8.2 | a | optimizar un umbral: aparece la densidad y la ecuación queda lineal |
| 8.15 | a | el TCL **sin saber la distribución** |
| 8.9 | a, b | corrección por continuidad, y la moda de una binomial simétrica |
| 8.12 | a | dimensionar, y el límite de la aproximación (ver 1.1) |
| 8.22 | a | mezcla + TCL + despejar $n$ |

**Verificaciones que valen la pena mencionar:**

- **8.15** se simula con longitudes **normales** y con longitudes **uniformes**
  de la misma media y desvío, y las dos dan $0{,}9978$. Eso verifica
  literalmente lo que afirma el TCL: que la respuesta no depende de la
  distribución de origen. Es la verificación más linda de todo el contenido.
- **8.2** no se queda en derivar: recorre una grilla fina de 200 valores de $c$
  alrededor de la solución y exige que ninguno dé menos error. Así el óptimo
  queda verificado y no sólo despejado.
- **8.22** calcula el $n$ de dos formas (búsqueda directa sobre la condición y
  despeje de la cuadrática), y además simula: con 1762 paladas la probabilidad
  da $0{,}9551$ y con 1761 da $0{,}9476$. La minimalidad queda verificada por
  simulación, no sólo por álgebra.
- **8.22** chequea con un `assert` que la varianza de la mezcla sea **mayor**
  que el promedio de las dos varianzas, que es el error típico del ejercicio.

---

## 3. Lo que falta del núcleo

### 3.1 Ejercicio 8.14 — demostración

"Usando el Teorema Central del Límite demostrar que
$\lim_{n \to \infty} e^{-n}\sum_{k=0}^{n} \frac{n^k}{k!} = \frac{1}{2}$".
Excluido por CLAUDE.md. Es un ejercicio muy lindo —el límite sale de que una
Poisson de media $n$ es la suma de $n$ Poisson de media 1, y la suma hasta $n$
es la probabilidad de estar por debajo de la media— pero es demostración.

El extractor además dejó los límites de la sumatoria mal ubicados, como avisa
para todos los operadores grandes.

### 3.2 Ejercicio 8.21 — depende del 7.8 y la respuesta es trivial

Dice "[ver Ejercicio 7.8]" y el 7.8 no está cargado. Pero además, al modelarlo
la respuesta sale $\approx 1$: el tiempo total de espera tiene media 6750 horas
con desvío de unas 34, así que superar 6400 horas está a 10 desvíos de
distancia. Un ítem cuya respuesta es "prácticamente 1" se adivina, así que no
aporta mucho como ejercicio de la app.

Vale confirmar la cuenta antes de descartarlo: con intensidad 50 por minuto y
trenes cada 15 minutos, cada pasajero espera en promedio 7,5 minutos y hay 72
intervalos entre las 4:00 y las 22:00. Si la intención del enunciado fuera otra
—otra unidad, u otro umbral— el ejercicio se vuelve interesante.

### 3.3 Ejercicios 8.8 y 8.24 — fuera de alcance

Los dos marcados con `Ï`: requieren simulación.

---

## 4. Skills de la guía

| Skill | Ítems que lo evalúan |
|---|---|
| `normal` | 8.2 a, 8.5 a, 8.15 a |
| `combinacion-normales` | 8.5 a |
| `tcl` | 8.12 a, 8.15 a, 8.22 a |
| `aproximacion-normal` | 8.9 a, b, 8.12 a |

Los cuatro cubren los tres temas que PLAN.md §4.2 lista para la guía 8 (normal,
TCL, aproximaciones), más la combinación lineal como skill aparte.

`combinacion-normales` tiene un solo ítem, así que no puede llegar a
"dominado". Se arregla cargando más ejercicios de la guía 8, que tiene varios
del mismo tipo entre los no recomendados.

---

## 5. Pendiente

```
npm run rasterizar -- fuentes/resueltas/guia-8
```

Y acordate de lo de 1.1: el 8.12 es el primer lugar donde conviene mirar.
