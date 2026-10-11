# Estado del contenido

Índice de lo que hay cargado y de lo que falta. El detalle por guía está en los
archivos `guia-N.md` de esta carpeta.

---

## 1. Qué hay

| Guía | Ejercicios | Ítems | Teoría | Cargados |
|---|---|---|---|---|
| 1 | 15 | 43 | 9 | 1.1 – 1.7, 1.9, 1.10, 1.13, 1.15, 1.16, 1.22, 1.25, 1.28 |
| 2 | 9 | 22 | 4 | 2.1, 2.2, 2.8, 2.13, 2.16, 2.17, 2.19, 2.22, 2.26 |
| 3 | 9 | 16 | 4 | 3.1, 3.8, 3.10, 3.12, 3.16, 3.20, 3.22, 3.26, 3.32 |
| 4 | 7 | 22 | 4 | 4.1, 4.3, 4.6, 4.10, 4.14, 4.19, 4.24 |
| 5 | 11 | 21 | 3 | 5.4, 5.9, 5.10, 5.11, 5.12, 5.13, 5.15, 5.16, 5.18, 5.21, 5.23 |
| 6 | 7 | 12 | 3 | 6.1, 6.6, 6.11, 6.12, 6.14, 6.19, 6.24 |
| 7 | 7 | 20 | 4 | 7.1, 7.5, 7.6, 7.7, 7.10, 7.12, 7.15 |
| 8 | 6 | 7 | 2 | 8.2, 8.5, 8.9, 8.12, 8.15, 8.22 |
| **Total** | **71** | **163** | **33** | **46 skills** |

Más **14 parciales** cargados, de los cuales **7 están en el simulacro** (los
completos y de cinco ejercicios; ver [examenes.md](examenes.md)). Los ítems de
examen son 56.

**Los 284 valores del contenido (guías y exámenes, incluidos checkpoints y
expresiones) están verificados por dos caminos independientes** y el build los
contrasta en cada corrida. Ninguno se escribió a mano. Tres valores de
exámenes no coinciden con la resolución y están marcados como discrepancia
(ver [examenes.md §2](examenes.md)).

**El núcleo recomendado por la cátedra** (los ejercicios marcados `!` en la
guía, 75 en las guías 1 a 8) **está cargado entero**, salvo siete ejercicios
que quedan fuera por una razón de fondo (§3). Además hay tres de la guía 1 que
no son del núcleo pero cubren huecos (1.2, 1.4, 1.5).

---

## 2. Lo primero que conviene mirar

### 2.1 El 8.12 da dos respuestas distintas según el método

Aproximación normal: **103**. Binomial exacta: **104**. El contenido carga 103
porque el ejercicio está en el capítulo del TCL. Si la resuelta dice 104, no es
un error. Está explicado en [guia-8.md](guia-8.md) §1.1.

### 2.2 El error del 6.1 que PLAN.md anticipaba

Confirmado: la probabilidad de que un paquete falle la garantía es $0{,}0043$,
no $0{,}01$. Usar $0{,}01$ da $0{,}029$ en el ítem (b) cuando lo correcto es
$0{,}0127$, más del doble. Los dos números están anotados.

### 2.3 El 3.26 es el único lugar donde interpreté el enunciado

Pide un tamaño de muestra y no aclara el método. Por Chebyshev da 50000, por el
TCL 9604. Cargué Chebyshev (la guía 3 no tiene TCL todavía) y lo dejé escrito
en el enunciado del ítem para que no quede ambiguo. Si la cátedra espera el
otro número, hay que cambiarlo.

### 2.4 Casi nada se cruzó contra las resueltas de las guías

Sólo el 1.9 y el 7.12, que se miraron para destrabarlos (coinciden). Es el
pendiente grande. Son **339 páginas de escaneos** sin capa de texto, así que
hay que mirarlas a ojo:

```
npm run rasterizar -- fuentes/resueltas/guia-N
```

| Guía | Resueltas | Páginas |
|---|---|---|
| 1 | RES 1, 2, 3 | 64 |
| 2 | RES 1, 2, SAN | 67 |
| 3 | RES 1, 2, 3 | 75 |
| 4 | RES 2, 3, 4 | 71 |
| 5 | RES 2, 3 | 37 |
| 6 | RES 2, 3 | 39 |
| 7 | RES 2, 3 | 26 |
| 8 | RES 3 | 22 |

**Por dónde empezar:** la guía 7 es la más barata (26 páginas) y la guía 6 es
donde más vale la pena, porque el error del 6.1 ya está identificado y conviene
confirmar que es el único. La guía 8 es la de peor cobertura (una sola
resuelta), así que ahí el cálculo independiente sostiene más peso.

---

## 3. Lo que falta, por qué

### 3.1 Los siete del núcleo que no se cargan

| Ejercicio | Motivo |
|---|---|
| 1.20 | demostración: los dos incisos dicen "mostrar que" |
| 3.23 | demostración |
| 8.14 | demostración |
| 2.11 | simulación (`Ï`) |
| 3.35 | simulación (`Ï`) |
| 3.4 | pide definir una variable aleatoria con ciertas propiedades: infinitas respuestas válidas |
| 8.21 | se transcribe sin problema, pero la respuesta es $\approx 1$ (el total esperado es 6750 h con un desvío de unas 34 h, contra un umbral de 6400 h), así que se adivina |

Además quedan afuera algunos incisos sueltos de ejercicios cargados: las
demostraciones de 1.7, 3.8 (b), 3.32 (c) y (d) y 4.14; las descripciones de un
espacio muestral (1.7 (a), 1.9 (a)); la clasificación y los gráficos del 2.17
((b) y (c)); y el 5.18 (b), que pide repetir todo para los otros vectores del
5.2. Cada YAML lo dice en un comentario.

### 3.2 Cómo se destrabaron los que figuraban como pendientes

La lista anterior de "enunciados que el extractor no pudo recuperar" estaba
mal planteada: el problema era la extracción, no los ejercicios. Leídos en el
PDF, todos estaban completos:

- **2.2**: los saltos se leen sin dudas en el gráfico (átomos de $1/3$ en $-2$
  y en $2$, tramo lineal entre $-1$ y $1$). La fórmula por tramos va en el
  enunciado, con la aclaración de que en la guía es un gráfico.
- **4.3**: la densidad es exactamente la que se había reconstruido.
- **3.22, 4.10, 5.11, 6.14, 2.17, 3.8, 3.32**: enunciados completos en el PDF.
- **2.16, 5.4, 5.18**: remiten a otro ejercicio; la definición que necesitan
  (la $T^*$ del 2.12, la densidad del 3.22, el vector del 5.2 (b)) se copió en
  el enunciado.
- **7.12**: la unidad dudosa se confirmó con la resuelta (GUIA 7 RES 3, página
  11), que también da $e^{-80}$ en el inciso (a).
- **1.9**: la nota anterior decía que los incisos (c) y (d) valían 0, y era
  falso. Con la asignación del enunciado los juegos finitos suman $2/3$, así
  que el juego dura para siempre con probabilidad $1/3$. La resuelta (GUIA 1
  RES 2, páginas 4 y 5) da los mismos valores.
- **5.15** va como opción múltiple, porque la respuesta numérica es 0 y se
  adivina.

Las referencias de página de los ejercicios (`fuente.enunciado`) estaban
corridas hasta en 4 páginas en las guías 2 a 8; se corrigieron con las del
borrador del extractor.

### 3.3 Skills que faltan en el catálogo

| Skill | Entra cuando se cargue |
|---|---|
| `espacio-muestral` | algún ítem descriptivo, como `opcion` |

### 3.4 Skills con un solo ítem

Un skill evaluado por un único ítem **nunca puede llegar a "dominado"**, porque
hace falta 3 intentos limpios en los últimos 5 y cuenta uno por día. Queda uno
solo: `desigualdades` (el 3.26). Se arregla cargando el 3.24, que no es del
núcleo pero es una aplicación directa de Chebyshev.

---

## 4. Los exámenes

Ver [examenes.md](examenes.md). Resumen: hay 14 parciales cargados y 7 en el
simulacro, que ofrece sólo exámenes completos y de cinco ejercicios. Los 12
resueltos de 2017–2023 sirvieron de cruce: coinciden con el cálculo
independiente en todo salvo tres valores, documentados como discrepancia.
