# Estado del contenido

Índice de lo que hay cargado y de lo que falta. El detalle por guía está en los
archivos `guia-N.md` de esta carpeta.

---

## 1. Qué hay

| Guía | Ejercicios | Ítems | Teoría | Cargados |
|---|---|---|---|---|
| 1 | 14 | 40 | 9 | 1.1 – 1.7, 1.10, 1.13, 1.15, 1.16, 1.22, 1.25, 1.28 |
| 2 | 5 | 11 | 4 | 2.1, 2.8, 2.19, 2.22, 2.26 |
| 3 | 6 | 10 | 4 | 3.1, 3.10, 3.12, 3.16, 3.20, 3.26 |
| 4 | 4 | 9 | 3 | 4.6, 4.14, 4.19, 4.24 |
| 5 | 6 | 9 | 3 | 5.9, 5.12, 5.13, 5.16, 5.21, 5.23 |
| 6 | 6 | 10 | 2 | 6.1, 6.6, 6.11, 6.12, 6.19, 6.24 |
| 7 | 6 | 17 | 4 | 7.1, 7.5, 7.6, 7.7, 7.10, 7.15 |
| 8 | 6 | 7 | 2 | 8.2, 8.5, 8.9, 8.12, 8.15, 8.22 |
| **Total** | **53** | **113** | **31** | **44 skills** |

Más 2 parciales con 1 ejercicio verificado cada uno (ver
[examenes.md](examenes.md)).

**Los 128 valores numéricos del contenido están verificados por dos caminos
independientes** y el build los contrasta en cada corrida. Ninguno se escribió
a mano.

Se cargó el **núcleo recomendado** por la cátedra (los ejercicios marcados `!`
en la guía) de cada guía, más algunos de la guía 1 que cubren huecos. Del
núcleo completo —75 ejercicios— quedaron 53.

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

### 2.4 Nada se cruzó contra las resueltas

Es el pendiente grande. Son **339 páginas de escaneos** sin capa de texto, así
que hay que mirarlas a ojo:

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

### 3.1 Enunciados que el extractor no pudo recuperar

Éstos necesitan que alguien lea el PDF y transcriba a mano. Son el cuello de
botella real para seguir cargando.

| Ejercicio | Qué pasó | Página |
|---|---|---|
| 2.2 | el enunciado remite a un **gráfico**; sólo se recuperaron las etiquetas de los ejes | 10 |
| 2.17 | los paréntesis grandes de la intensidad de fallas salieron sin traducir | 14 |
| 3.4 | un glifo sin traducir, más un ítem que pide *definir* una variable | 18 |
| 3.8 | los ítems (a) y (b) salieron ilegibles (se mezclaron enunciado y respuesta) | 17 |
| 3.22 | la densidad conjunta tiene **fracciones incompletas** | 20 |
| 3.32 | corchetes de $E[\cdot]$ sin traducir y límites de sumatoria mal ubicados | 22 |
| 4.3 | la densidad se mezcló con el texto (ver nota abajo) | 22 |
| 4.10 | matriz de rotación con delimitadores sin traducir, más una fracción incompleta | 24 |
| 5.11 | delimitadores grandes sin traducir | 31 |
| 6.14 | los dos ítems **truncados** a mitad de frase | 39 |

**El 2.2 es el que más conviene arreglar.** Los ítems (b) a (e) son justo la
práctica de distinguir $P(-2 < X \le 2)$ de $P(-2 \le X \le 2)$, que es donde
se equivoca todo el mundo. Con que me digas dónde están los tres saltos de la
escalera, se carga entero.

**El 6.14 es el segundo**, porque es el único de la multinomial y por eso falta
ese skill en el catálogo.

**Sobre el 4.3:** la reconstrucción más probable es
$f_X(x) = \frac{12x}{\pi^2(e^x+1)}$, y hay un argumento fuerte a favor —integra
exactamente 1, porque $\int_0^\infty x/(e^x+1)\,dx = \pi^2/12$—. Pero "casi con
seguridad" no alcanza para la regla de no inventar, así que no lo cargué.

### 3.2 Excluidos a propósito

| Motivo | Ejercicios |
|---|---|
| **Demostración** (CLAUDE.md los excluye) | 1.20, 3.23, 8.14, más ítems sueltos de 1.7, 3.32, 4.14 |
| **Simulación** (marcados `Ï`) | 1.11, 1.12, 1.34, 2.11, 2.15, 2.29, 3.31, 3.35, 4.17, 5.25, 8.8, 8.24 |
| **Dependen de un ejercicio no cargado** | 2.16, 5.4, 5.18, 8.21 |
| **No validables con los 4 tipos de respuesta** | ítems que piden describir un espacio muestral o un gráfico |

### 3.3 Cargables sin riesgo, quedaron por tiempo

Éstos no tienen ningún problema: el enunciado salió limpio y la verificación es
directa. Son los candidatos obvios para seguir.

- **4.1** — transformaciones de una discreta, cuatro ítems. Los incisos (c) y
  (d) son no inyectivos, así que hay que sumar probabilidades: es el análogo
  discreto del 4.6.
- **5.10** — las dos funciones de regresión de los RoboCops, como `expresion`.
- **2.13** — distribuciones de $G(X)$, $F_X(X)$ y $G^{-1}(F_X(X))$, como
  `opcion`.
- **5.15** — $\operatorname{cov}(Z, Y)$ con $E[Y \mid Z] = Z^2$. La respuesta es
  0; conviene cargarlo con un ítem `opcion` sobre qué significa ese 0, no sólo
  con el número.
- **7.12** — superposición. El enunciado está limpio pero leído literalmente el
  ítem (a) da $e^{-80}$, que es absurdo. Hay que confirmar la unidad de tiempo
  (página 45) y después entra entero: los ítems (b) y (c) son el corazón del
  tema.

### 3.4 Skills que faltan en el catálogo

No están porque ningún ítem cargado los evalúa, y el validador rompe el build
si una teoría explica un skill que nadie practica (con razón):

| Skill | Entra cuando se cargue |
|---|---|
| `multinomial` | 6.14 |
| `cambio-variable` (jacobiano) | 4.3 o 4.10 |
| `espacio-muestral` | algún ítem descriptivo, como `opcion` |

### 3.5 Skills con un solo ítem

Un skill evaluado por un único ítem **nunca puede llegar a "dominado"**, porque
hace falta 3 intentos limpios en los últimos 5 y cuenta uno por día. Son:
`combinacion-normales`, `esperanza-condicional-evento`, `mezclas`,
`perdida-memoria`, `poisson-compuesto`, `varianza-total`, `variable-aleatoria`.

Se arregla cargando más ejercicios de esas guías. Mientras tanto, es una
limitación a tener en cuenta al mirar el panel: no es que estés flojo, es que
no hay con qué practicar.

---

## 4. Los exámenes

Ver [examenes.md](examenes.md). Resumen: el motor del simulacro está completo,
pero de los 10 ejercicios de los dos parciales sólo 2 están cargados, porque
los otros 8 son de las guías 2 a 8 y requieren modelar cada uno. Ahora que esas
guías tienen skills, cargarlos es posible.

Y los **12 parciales resueltos de 2017–2023** siguen sin tocar: son la
ampliación más barata que queda, y traen la resolución, así que sirven de cruce.
