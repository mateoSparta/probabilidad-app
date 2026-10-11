# Revisión del material para el examen

Estado de la fase 7 (PLAN.md §12): la hoja de fórmulas, las tablas y el kit.
Se ven en la sección **Fórmulas y tablas** del inicio, y el kit se imprime
desde el simulacro.

---

## 1. Las tablas: verificadas

`content/tablas/` tiene siete tablas generadas por `tools/verify/tablas.py`,
que no se editan a mano. Se regeneran con

```bash
.venv/Scripts/python tools/verify/tablas.py
```

| Tabla | Rango | Etapa |
|---|---|---|
| Factoriales y combinatorios | $n!$ hasta 20; $\binom{n}{k}$ hasta $n = 20$, $k \le 10$ | parcial (guía 1) |
| Binomial acumulada | $n$ de 2 a 20, $p$ de 0,05 a 0,50 | parcial (guía 6) |
| Poisson acumulada | $\lambda$ de 0,1 a 20 | parcial (guía 7) |
| $e^{-x}$ | $x$ de 0 a 20 | parcial (guía 7) |
| Normal $\Phi(z)$ y cuantiles | $z$ de 0,00 a 3,59, los de la cátedra | parcial (guía 8) |
| Cuantiles de $t$ | $\nu$ de 1 a 40, 50 a 90 | final (guía 10) |
| Cuantiles de $\chi^2$ | $\nu$ de 1 a 40, 50 a 90 | final (guía 10) |

Los 4765 valores salen de dos caminos de cálculo independientes que tienen
que coincidir al redondeo impreso: una suma exacta contra una función
incompleta (binomial, Poisson), una integral numérica contra una función
especial (normal, $t$, $\chi^2$), y así. **La normal, la $t$ y la $\chi^2$
coinciden además número a número con `fuentes/teoria/Tablas.pdf`**: no hubo
ninguna discrepancia.

Decisiones:

- **Decimales.** Normal y $t$ con cinco, $\chi^2$ con tres, como las de la
  cátedra. Binomial, Poisson y $e^{-x}$ hasta 2,99 con cuatro; $e^{-x}$ de 3
  a 9,9 con cinco, para que todas las celdas tengan el mismo ancho; de 10 a 20,
  en notación científica.
- **Coma decimal y punto de miles**, como el resto de la app. La cátedra usa
  punto decimal.
- **Poisson:** cada columna termina en el primer 1,0000; las celdas vacías
  valen 1,0000, y la descripción de la tabla lo dice.
- **Binomial:** sólo $p \le 0{,}5$; para $p > 0{,}5$ la descripción da la
  relación con $1 - p$.

## 2. Las fórmulas: para revisar

`content/formulas/guia-N.yaml`, una por guía, de la 1 a la 8: 122 fórmulas
en 40 temas. **No hay un script que las verifique**, así que esta es la parte
que conviene leer. Salen de:

- las fórmulas de los skills (`content/skills.yaml`), que ya se mostraban en
  el panel de fórmulas de cada ítem;
- la teoría de cada guía (`content/guias/guia-N/teoria/`);
- la tabla de distribuciones de la cátedra
  (`fuentes/teoria/probabilidad_distribuciones.pdf`), para las esperanzas y
  varianzas de las guías 6 a 8 y la notación de Bernoulli, geométrica, Pascal
  e hipergeométrica.

El validador parsea cada una con KaTeX y revisa el registro de títulos y
notas.

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
perdido el `\\` que separa las filas de la matriz, y se veía en una sola fila.
Está corregida.

## 3. La impresión

Un solo botón, "Imprimir o guardar PDF", que abre el diálogo del navegador.
Se probó en Edge generando el PDF real:

| Documento | Páginas |
|---|---|
| Fórmulas del parcial | 3 |
| Tablas del parcial | 6 |
| Kit para el parcial | 9 |

A4, dos columnas para las fórmulas, cada guía entera en su página, la
binomial y la Poisson en dos columnas, en blanco y negro. El saludo final es
"Suerte en el examen 🖒"; el 🖒 se ve en Windows (con Segoe UI Symbol), pero
puede faltar en otros sistemas.

## 4. Pendiente

- **Las fórmulas del final** (guías 9 a 12) se escriben al cargar cada guía.
  Hasta entonces, "Final" muestra sólo las tablas de $t$ y $\chi^2$.
- **La lista de tablas** conviene confirmarla resolviendo a mano, sin
  calculadora, un parcial completo (PLAN.md §12.5).
