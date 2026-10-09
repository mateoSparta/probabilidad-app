# Revisión de la Guía 7

Estado: **6 ejercicios cargados, 17 ítems, 5 skills nuevos, 4 bloques de teoría.**

Es la guía con más ítems cargados de todas, porque el 7.1 solo aporta 7. De los
7 del núcleo recomendado se cargaron 6, y el que falta es por una duda de
interpretación del enunciado, no por la extracción.

---

## 1. Lo cargado

| Ejercicio | Ítems | Qué practica |
|---|---|---|
| 7.1 | a–g | **todo el repertorio**: incrementos, independencia, covarianza con solapamiento, tiempos de espera y condicionamiento |
| 7.5 | a, b, c, d | que las cuatro respuestas sean **iguales**: el proceso no se acuerda |
| 7.6 | a | el exceso sobre un umbral vuelve a ser exponencial |
| 7.7 | a, b | condicionar a $N(t) = n$: la intensidad desaparece |
| 7.10 | a, b | adelgazamiento, y la diferencia entre fallas detectadas y totales |
| 7.15 | a (2 checkpoints) | Poisson compuesto |

El **7.1(c)** da $16 e^{-8}$, que es exactamente el valor que PLAN.md §4.4 usa
como ejemplo de respuesta `numerica`. Buena señal de que el modelado coincide
con lo que esperabas.

El **7.1** vale como ejercicio central de la guía: sus siete ítems recorren casi
todas las propiedades, y los ítems (f) y (g) están puestos uno al lado del otro
a propósito. En (f) se condiciona al **total** ($S_3 = 1/2$) y la intensidad
desaparece de la respuesta; en (g) se condiciona a un **conteo parcial**
($N(1/4) = 1$) y la intensidad sí aparece. Distinguir esos dos casos es lo que
más cuesta de la guía, y las pistas de los dos ítems lo señalan.

---

## 2. Lo que falta del núcleo

### Ejercicio 7.12 — duda de interpretación, no de extracción

El enunciado salió limpio: Lucas emite señales Poisson de intensidad 3 por
minuto, Monk 5 por minuto, independientes. El ítem (a) pide la probabilidad de
que la primera señal después de las 0:00 haya sido emitida **después de las
0:10**.

Leído literalmente, 0:10 son 10 minutos después de 0:00, y con intensidad
combinada 8 por minuto eso da

$$e^{-8 \cdot 10} = e^{-80} \approx 1{,}8 \times 10^{-35}$$

que es un número absurdo para un ejercicio. **No lo cargué porque sospecho que
la unidad no es la que estoy leyendo** —tal vez las intensidades son por hora, o
0:10 son 10 segundos— y preferí no elegir. Hay que mirar la página 45 del PDF.

Es una lástima porque los ítems (b) y (c) son el corazón de la superposición:
(b) da $3/8$ (cada uno gana en proporción a su tasa) y (c) es el producto de (a)
por (b), **porque cuándo llega la primera señal y de quién es son
independientes**. Esa independencia es el resultado más lindo del tema y
convendría tenerlo cargado. Confirmame la unidad y lo cargo entero.

### No hay ejercicios de simulación ni de demostración

En el núcleo de la guía 7 no hay ninguno marcado con `Ï` ni ningún "mostrar
que", así que no se perdió nada por esas dos razones.

---

## 3. El 7.3 y lo que dice PLAN.md

PLAN.md §7 menciona que en el **7.3** las dos resueltas llegan al mismo número
por caminos distintos y una de ellas tiene la fórmula incorrecta. El 7.3 no está
en el núcleo recomendado y no lo cargué, pero vale dejarlo anotado: cuando se
haga el cruce contra las resueltas de esta guía, ése es un caso donde ya se sabe
que hay algo para mirar.

---

## 4. Skills de la guía

| Skill | Ítems que lo evalúan |
|---|---|
| `poisson-incrementos` | 7.1 a, b, c, d, e, g, 7.5 a, b, c, d |
| `tiempos-espera` | 7.1 e, g, 7.6 a, 7.10 a |
| `condicionar-Nt` | 7.1 f, 7.7 a, b |
| `superposicion-adelgazamiento` | 7.10 a, b |
| `poisson-compuesto` | 7.15 a |

Los cinco cubren los seis temas que PLAN.md §4.2 lista para la guía 7
(superposición y adelgazamiento van juntos en un skill, porque se practican
juntos).

Vale notar que `poisson-incrementos` tiene 10 ítems, así que es uno de los
skills mejor cubiertos de todo el contenido, y `poisson-compuesto` tiene uno
solo.

---

## 5. Cosas del modelado que conviene saber

- **7.1(f)** se verifica simulando directamente la propiedad que el enunciado
  afirma: se sortean dos uniformes en $(0, 1/2)$ en vez de simular el proceso y
  condicionar a $S_3 = 1/2$ exacto, que es imposible. Es la única forma de
  hacerlo y queda explicitada en el modelo.
- **7.5** simula los cuatro escenarios por separado (hora fija, hora fija un
  minuto después, minuto al azar entre cuatro, hora uniforme en la hora). Así la
  afirmación de que las cuatro dan igual queda verificada y no asumida.
- **7.10** genera las fallas una por una y decide la detección de cada una, en
  vez de usar directamente el proceso adelgazado. Eso verifica el
  adelgazamiento.
- **7.6** compara con el 5.23, que es el mismo enunciado con bolsas uniformes.
  Con uniformes hay que partir en casos; con exponenciales la falta de memoria
  da la respuesta en un paso. Vale resolverlos uno después del otro.

---

## 6. Pendiente

Sin cruzar contra las resueltas. Para la guía 7 hay dos (`RES 2`, `RES 3`),
26 páginas escaneadas. Es la guía con menos páginas de resueltas, así que el
cruce acá es el más barato de todos.

```
npm run rasterizar -- fuentes/resueltas/guia-7
```
