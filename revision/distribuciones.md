# Revisión de la calculadora de distribuciones

Estado de la fase 8 (PLAN.md §12.4). La sección **Distribuciones** del inicio
tiene una ficha y una calculadora para cada una de las 19 distribuciones de
`fuentes/teoria/probabilidad_distribuciones.pdf`: seis discretas, once
continuas, la multinomial y la normal bivariada.

---

## 1. Las cuentas: verificadas

`src/dominio/distribuciones.ts` calcula funciones de probabilidad y
densidades, funciones de distribución, cuantiles y momentos. Usa funciones
especiales propias (logaritmo de la función Gamma, gamma y beta incompletas
regularizadas), sin dependencias nuevas. Se contrastan en cada `npm run check`
de dos maneras.

**Contra mpmath.** `tools/verify/distribuciones.py` recalcula todo con
fórmulas independientes a 30 dígitos: sumas exactas en las discretas,
integrales y bisección en las continuas, y una integral doble para la normal
bivariada. Escribe `content/.verificacion/distribuciones.json`, y
`tools/smoke.ts` compara contra ese archivo.

| Qué | Casos | Tolerancia |
|---|---|---|
| $p_X$ o $f_X$, y $F_X$ | 34 juegos de parámetros (dos por univariada), 100 puntos | $10^{-9}$ relativa |
| Cuantiles | 102 | exactos en las discretas, $10^{-8}$ en las continuas |
| Esperanza y varianza | 34 juegos, incluidos los que no existen (Cauchy) y una varianza infinita (Pareto con $\alpha = 1{,}5$) | $10^{-9}$ |
| Multinomial | 2 | $10^{-9}$ |
| Normal bivariada | 3, entre ellos $\rho = 0{,}5$ en $(0, 0)$, que vale $1/3$ | $10^{-8}$ |

Se regenera con

```bash
.venv/Scripts/python tools/verify/distribuciones.py
```

**Contra las tablas impresas.** Las 1177 celdas de la normal, la $t$ y la
$\chi^2$ de `content/tablas/` coinciden con la calculadora al redondeo de la
tabla. Con la tabla en la mano o con la calculadora se obtiene el mismo
número.

## 2. Para revisar: los textos

Lo que no es cuenta está en `content/distribuciones.yaml`. Notación, soporte,
parámetros, función, esperanza, varianza, funciones de supervivencia y
equivalencias son los de la tabla de la cátedra, igual que los modelos de las
discretas ("Algunos modelos" del PDF).

**Los modelos de las continuas y de las multivariadas son propios**, porque la
tabla no los trae. Conviene leerlos:

| Distribución | Lo que dice el modelo |
|---|---|
| Uniforme | un punto al azar en un intervalo; probabilidad proporcional a la longitud |
| Exponencial | tiempos de espera sin memoria; primer evento de un proceso de Poisson |
| Gamma | con $\nu$ entero, el $\nu$-ésimo evento de un proceso de Poisson |
| Normal | errores de medición; sumas y promedios por el teorema central del límite |
| $\chi^2$ | suma de $k$ normales estándar al cuadrado; $(n-1)S^2/\sigma^2 \sim \chi^2_{n-1}$ |
| $t$ | el promedio estandarizado con el desvío estimado; se parece a la normal con $\nu$ grande |
| Weibull | tiempos de vida; la tasa de falla según $c$ |
| Rayleigh | la distancia al origen de un punto con coordenadas normales centradas |
| Pareto | magnitudes de cola pesada (ingresos, tamaños de archivos) |
| Beta | proporciones; la a priori habitual de una probabilidad |
| Cauchy | el cociente de dos normales estándar; sin esperanza ni varianza |
| Multinomial | los conteos de cada resultado en $n$ repeticiones |
| Normal bivariada | marginales y condicionales normales, con la fórmula de la condicional |

Las de $\chi^2$, $t$ y Beta mencionan las guías 10 a 12, que todavía no están
cargadas. Conviene confirmar esas referencias al cargarlas.

La ficha de la Gamma lleva una nota con las propiedades de $\Gamma$
($\Gamma(n) = (n-1)!$, $\Gamma(t+1) = t\,\Gamma(t)$, $\Gamma(1/2) = \sqrt\pi$).

**Corrección de paso:** el modelo de la $\chi^2$ decía que era "la de la
varianza muestral". Es la de $(n-1)S^2/\sigma^2$, y así quedó.

## 3. Decisiones

- **Eventos.** En las discretas se cuentan los extremos: $P(X = x)$,
  $P(X \le x)$, $P(X \ge x)$ y $P(a \le X \le b)$. En las continuas,
  $P(X \le x)$, $P(X > x)$ y $P(a < X < b)$, que no cambian con $\le$.
- **Cuantil.** El menor $x$ con $F_X(x) \ge \alpha$; en las continuas, el que
  cumple $F_X(x) = \alpha$. Arrastrar la línea del cuantil cambia $\alpha$.
- **Parámetros**, los de la tabla: la normal con $\sigma^2$, la Weibull con
  $(c, \alpha)$, la hipergeométrica con $(N, d, n)$. Un parámetro fuera de
  rango se marca en el campo, con el motivo.
- **Arrastrar redondea**: enteros en las discretas y, en las continuas, dos
  cifras significativas más que el rango del gráfico. Escribiendo el valor se
  usa cualquier precisión.
- **Normal bivariada:** $P(X_1 \le a, X_2 \le b)$ por integración numérica de
  $\varphi(u)\,\Phi\big((k - \rho u)/\sqrt{1 - \rho^2}\big)$ (Simpson con 4000
  subintervalos), y la condicional $X_2 \mid X_1 = x_1$ con su probabilidad.
  El punto $(a, b)$ se arrastra sobre las elipses de 1, 2 y 3 desvíos.
- **Multinomial:** $k$ de 2 a 6. La última probabilidad y el último conteo se
  completan solos, para que sumen 1 y $n$.
- **De la ficha a la tabla.** La normal, la $t$ y la $\chi^2$ tienen un
  enlace a su tabla en Fórmulas y tablas. Al volver, sigue elegida la misma
  distribución (mientras la app esté abierta; no se guarda).
