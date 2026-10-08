# Revisión de la Guía 1

Lo que hay que mirar antes de dar la guía por cerrada (PLAN.md §7 paso 7).

Estado: **14 ejercicios cargados, 40 ítems, 12 skills, 9 bloques de teoría.**
Los 42 valores numéricos del contenido están contrastados automáticamente
contra `tools/verify/` en cada `npm run check`.

---

## 1. De dónde salió cada valor

**Ninguno de los 42 valores se escribió a mano.** Todos salen de un modelo en
`tools/verify/`, resuelto por dos caminos independientes —exacto (conteo,
fracciones o sympy) y Monte Carlo con 400.000 repeticiones— que tienen que
coincidir dentro de 0,005. El runner falla si no coinciden.

| Ejercicio | Ítems | Método | Modelo |
|---|---|---|---|
| 1.1 | a, b | exacto | `g1_01.py` — cierra la familia por complemento y unión hasta que no entra nada nuevo |
| 1.2 | a–e | exacto + Monte Carlo | `g1_02.py` — arma las 8 regiones del diagrama de Venn desde los datos |
| 1.3 | a (4 checkpoints) | exacto + Monte Carlo | `g1_03.py` |
| 1.4 | a–d | exacto + Monte Carlo | `g1_04.py` — conteo sobre los 36 pares |
| 1.5 | a–d | exacto + Monte Carlo | `g1_05.py` — producto de las dos urnas, 40 pares |
| 1.6 | a, b | exacto + Monte Carlo | `g1_06.py` — conteo sobre los 1296 resultados de 4 dados |
| 1.7 | b, b8, c, e | exacto + Monte Carlo | `g1_07.py` — geométrica, simulada tirando hasta el primer 6 |
| 1.10 | a–c | exacto + Monte Carlo | `g1_10.py` |
| 1.13 | a, b (4 checkpoints c/u) | exacto + Monte Carlo | `g1_13.py` |
| 1.15 | a–c | exacto + Monte Carlo | `g1_15.py` — multinomial sobre las 105 composiciones |
| 1.16 | a, b | exacto + Monte Carlo | `g1_16.py` — enumera las 330 configuraciones |
| 1.22 | a–e | exacto + Monte Carlo | `g1_22.py` — árbol completo de 4 hojas |
| 1.25 | a | exacto + Monte Carlo | `g1_25.py` — sympy despeja q; el Monte Carlo valida el posterior |
| 1.28 | a, b | exacto + Monte Carlo | `g1_28.py` — enumera el espacio con pesos exactos |

**No se cruzó nada contra las resueltas de la cátedra.** Las tres resueltas de
la guía 1 (`GUIA 1 RES 1/2/3.pdf`, 64 páginas) son escaneos sin capa de texto:
hay que mirarlas a ojo. Eso queda pendiente y es lo primero de la lista de
abajo. Según PLAN.md §7 paso 5, un ítem sin resuelta disponible se marca
`verificado` con el cálculo independiente, que es lo que se hizo; pero el
cruce sigue valiendo la pena, porque es lo que detecta un enunciado mal
interpretado (no un cálculo mal hecho).

---

## 2. Pendientes, en orden de importancia

### 2.1 Cruzar contra las resueltas

```
npm run rasterizar -- fuentes/resueltas/guia-1
```

Deja los PNG en `fuentes/.raster/resueltas/guia-1/`. Hay que comparar cada
valor con el de la resuelta y, si no coinciden, pasar el ítem a
`estado: discrepancia` y anotar los dos valores acá.

Es el paso que PLAN.md §7 marca como no opcional, porque las resueltas tienen
errores conocidos (el 2.3(a) y el 6.1(b) que figuran en el plan).

### 2.2 Dos ejercicios del núcleo que quedaron afuera

**1.9 (Feller, ping-pong).** No se cargó. Dos razones:

- El extractor dejó la fórmula del enunciado corrupta:
  `\frac{1}{3\cdot2k-1de}`, que debería ser algo como
  $\frac{1}{3 \cdot 2^{k-1}}$. Hay que leer la página 4 del PDF y
  transcribirla a mano.
- Los incisos (c) y (d) piden la probabilidad de que el juego dure para
  siempre, que es una serie sobre un espacio muestral infinito. Querría
  verificarlo con cuidado antes de cargar un número.

**1.20.** Excluido a propósito: los dos incisos dicen "Mostrar que", así que
es un ejercicio de demostración y CLAUDE.md los deja afuera. Vale la pena
confirmarlo, porque el contenido conceptual (independencia de a pares que no
implica independencia conjunta) sí está cubierto por el 1.28.

### 2.3 Ítems de ejercicios cargados que se dejaron de lado

| Ítem | Por qué |
|---|---|
| 1.7 (a) | "Describir un posible espacio muestral": no es validable con ninguno de los 4 tipos de respuesta |
| 1.7 (d) | "Mostrar que $B_{n+1} \subset B_n$": demostración |
| 1.15 (d) | "Calcular la probabilidad de que Morgan se encuentre entre los 13 piratas": no es una pregunta sobre este modelo. Puede ser un chiste del enunciado; conviene confirmarlo |
| 1.22 (c) | Se cargó sólo la parte de calcular. La parte de "describir mediante la notación" quedó afuera por lo mismo que 1.7(a) |

Si querés que los ítems descriptivos entren, la vía es `opcion`: dar cuatro
descripciones de $\Omega$ y que elija la correcta. Es un cambio de contenido,
no de código.

### 2.4 Decisiones de contenido que conviene que mires

- **1.3** pide las probabilidades de los 8 subconjuntos. Se cargó como 4
  checkpoints ($\emptyset$, $\{a\}$, $\{a,b\}$, $\Omega$) en vez de los 8,
  para que no sea tedioso. Si preferís los 8, el validador acepta hasta 4
  checkpoints por ítem, así que habría que subir ese límite o partir el ítem.
- **1.13** se cargó como dos ítems de 4 checkpoints cada uno, uno por inciso.
  Son 8 valores en total y todos están verificados.
- **1.16** depende de leer bien el enunciado: los gatos son *indistinguibles*
  y las 330 configuraciones son equiprobables. Si se interpretara con gatos
  distinguibles ($5^7$ repartos) las respuestas serían otras. La
  interpretación que se tomó es la que dice el enunciado, pero es el tipo de
  cosa que las resueltas pueden haber resuelto distinto: **candidato número
  uno a discrepancia**.
- **1.25** da $q = 2089/2090 \approx 0{,}99952$. Es casi 1 y puede parecer un
  error, pero no lo es: los $1$ son el 95 % del tráfico, así que para que el
  posterior llegue a 0,99 el canal tiene que ser casi perfecto para los $1$.
  La tolerancia del ítem se bajó a $10^{-5}$ porque con el 1 % por defecto
  cualquier número cercano a 1 pasaría.
- **1.6** es un chiste del enunciado: el matrimonio Galíndez tira los dados y
  lava "el Sr. Galíndez" o "su esposo". La respuesta cargada es que lava más
  seguido el esposo, con $671/1296$ contra $625/1296$.

---

## 3. Skills de la guía

Doce, contra los nueve temas que PLAN.md §4.2 lista para la guía 1. La
diferencia es que se separó el conteo en tres (`laplace`, `conteo-muestras`,
`ocupacion`), porque el filtro de chips es más útil así.

| Skill | Ítems que lo evalúan |
|---|---|
| `algebras` | 1.1 a, b |
| `prob-discreta` | 1.3 a |
| `laplace` | 1.4 a–d, 1.5 a, b, d, 1.6 a, 1.13 a, b, 1.15 a, 1.22 a |
| `conteo-muestras` | 1.13 a, b |
| `ocupacion` | 1.15 a–c, 1.16 a, b |
| `prob-geometrica` | 1.10 a–c |
| `inclusion-exclusion` | 1.2 a–e, 1.22 d |
| `condicional` | 1.22 b–e, 1.28 a, b |
| `prob-total` | 1.22 b, e, 1.25 a |
| `bayes` | 1.22 c, 1.25 a |
| `independencia` | 1.5 a, b, c, 1.6 a, b, 1.7 b, b8, c, 1.10 b, 1.28 a, b |
| `continuidad-P` | 1.7 e, 1.10 c |

`espacio-muestral` no está: no quedó ningún ítem que lo evalúe, porque los
ítems descriptivos son los que se dejaron afuera. Si entran como `opcion`,
el skill se agrega.

---

## 4. Lo que falta de la guía 1 más allá del núcleo

El núcleo recomendado por la cátedra son 13 ejercicios; están 11 (faltan 1.9 y
1.20, ver 2.2) más tres que no son del núcleo pero cubren huecos (1.2, 1.4,
1.5). La guía completa tiene 42 ejercicios, 39 en alcance.

Los borradores de los 42 están en `content/.borrador/guia-1.yaml`, con el
enunciado ya traducido a LaTeX. Promover uno es escribir su YAML en
`content/guias/guia-1/ejercicios/` y su modelo en `tools/verify/`.
