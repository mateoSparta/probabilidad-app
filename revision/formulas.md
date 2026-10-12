# Revisión del material para el examen

Estado de la fase 7 (PLAN.md §12): la hoja de fórmulas, las tablas y el kit.
Se ven en la sección **Fórmulas y tablas** del inicio, y el kit se imprime
desde el simulacro.

---

## 1. Las tablas: verificadas

En el examen se puede usar calculadora científica, así que las tablas son
sólo las de la cátedra (`fuentes/teoria/Tablas.pdf`), con el mismo gráfico y
el mismo recuadro "Recuerda" que encabezan cada una. Las genera
`tools/verify/tablas.py` en `content/tablas/`, y no se editan a mano. Se
regeneran con

```bash
.venv/Scripts/python tools/verify/tablas.py
```

| Tabla | Rango | Etapa |
|---|---|---|
| Normal $\Phi(z)$ y cuantiles habituales | $z$ de 0,00 a 3,59 | parcial (guía 8) |
| Cuantiles de $t$ | $\nu$ de 1 a 40, 50 a 90 | final (guía 10) |
| Cuantiles de $\chi^2$ | $\nu$ de 1 a 40, 50 a 90 | final (guía 10) |

Los 1177 valores salen de dos caminos de cálculo independientes que tienen
que coincidir al redondeo impreso (una integral numérica contra una función
especial), **y coinciden además número a número con `Tablas.pdf`**: no hubo
ninguna discrepancia. La calculadora de distribuciones da los mismos números
(ver `revision/distribuciones.md`).

Decisiones:

- **Decimales.** Normal y $t$ con cinco, $\chi^2$ con tres, como las de la
  cátedra.
- **Coma decimal**, como el resto de la app. La cátedra usa punto decimal.
- **Los gráficos** se dibujan con las densidades reales ($t$ con 3 grados de
  libertad y $\chi^2$ con 4), con el área sombreada hasta el cuantil.

Las tablas binomial, de Poisson, de $e^{-x}$ y de combinatorios de la primera
versión se sacaron: con calculadora científica no hacen falta.

## 2. Las fórmulas: para revisar

`content/formulas/guia-N.yaml`, una por guía, de la 1 a la 8: 120 fórmulas
en 40 temas. Cada una es una ficha con su nombre, una descripción breve de
para qué sirve y la expresión centrada. En pantalla van de a dos, y la que no
entra en media fila (o quedaría sola) ocupa la fila entera; a la izquierda,
un índice con las guías y sus temas. **No hay un script que las verifique**,
así que esta es la parte que conviene leer. Salen de:

- las fórmulas de los skills (`content/skills.yaml`), que ya se mostraban en
  el panel de fórmulas de cada ítem;
- la teoría de cada guía (`content/guias/guia-N/teoria/`);
- la tabla de distribuciones de la cátedra
  (`fuentes/teoria/probabilidad_distribuciones.pdf`), para las esperanzas y
  varianzas de las guías 6 a 8 y la notación de Bernoulli, geométrica, Pascal
  e hipergeométrica.

El validador exige nombre, descripción y expresión en cada ficha, parsea
todo con KaTeX y revisa el registro de títulos y descripciones. La expresión
es sólo matemática: un rótulo de texto al principio se rechaza, porque ese
lugar es del nombre.

Lo que agregué respecto de los skills, por si conviene sacar algo:

- **Guía 1:** la regla del producto para $n$ eventos, $P(B \setminus A)$ con
  $A \subset B$, y que la independencia de $A$ y $B$ pasa a los complementos.
- **Guía 2:** $P(X < a) = F_X(a^-)$, $f_X = F_X'$, la densidad uniforme y la
  marginal discreta.
- **Guía 3:** el coeficiente de correlación $\rho$, que aparece en los
  ejercicios 3.22, 5.4 y 5.12, y que covarianza nula no implica
  independencia.
- **Guía 4:** el caso de $g$ decreciente y la convolución discreta.
- **Guía 5:** la densidad condicional $f_{Y \mid X = x}$.
- **Guías 6 a 8:** las varianzas de geométrica, Pascal e hipergeométrica y la
  covarianza de la multinomial (de la tabla de la cátedra), la densidad Gamma
  y $P(S_n > t)$, y la aproximación normal de la Poisson.

**Corrección de paso:** la fórmula del jacobiano en `skills.yaml` había
perdido el `\` que separa las filas de la matriz, y se veía en una sola fila.
Está corregida.

## 3. La impresión

Un solo botón, "Imprimir o guardar PDF", que abre el diálogo del navegador.
Se probó en Edge generando el PDF real:

| Documento | Páginas |
|---|---|
| Fórmulas del parcial | 7 |
| Tablas de todas las guías | 3, una por tabla |
| Kit para el parcial | 9 |

A4, dos columnas para las fórmulas, ninguna guía partida entre dos páginas
(las guías 4 y 5 comparten una), cada tabla con su gráfico, en blanco y
negro. El saludo final es "Suerte en el
examen 🖒"; el 🖒 se ve en Windows (con Segoe UI Symbol), pero puede faltar en
otros sistemas.

## 4. Pendiente

- **Las fórmulas del final** (guías 9 a 12) se escriben al cargar cada guía.
  Hasta entonces, "Final" muestra sólo las tablas de $t$ y $\chi^2$.
