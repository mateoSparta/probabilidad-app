# Resultados

Listado de todos los resultados de la app, generado por `npm run check`
(tools/resultados.ts) a partir de los archivos de content/. **No se edita a
mano**: para corregir un resultado, seguir el enlace de la columna "Dónde" y
los pasos de [DOCENTE.md](../DOCENTE.md), "Corregir un resultado".

324 valores en 228 ítems: 163 de las guías y 65 de 14 exámenes. 321 verificados, 3 con discrepancia y 0 del docente.

Estados: *verificado*, la resuelta de la cátedra y el cálculo independiente
de tools/verify/ coinciden; *discrepancia*, no coinciden y la nota explica qué
se cargó; *docente*, lo cargó o lo corrigió el docente.

## Para revisar primero

Las discrepancias y los valores del docente.

| Ítem | Estado | Nota | Dónde |
|---|---|---|---|
| Primer recuperatorio, primer cuatrimestre de 2019, ej. 5 (a) | **discrepancia** | La resuelta concluye 34 a partir de "n > 33.12", pero con 34 pallets la media es 4039.2 y la probabilidad de superar 4000 es 0.835. El despeje correcto da n > 34.23, es decir, 35, y la binomial exacta da el mismo mínimo. Se carga 35. | [ep-20190615.yaml:168](../content/examenes/ep-20190615.yaml#L168) |
| Parcial (parte 2), segundo cuatrimestre de 2021, ej. 3 (a) | **discrepancia** | La resuelta plantea 4720 - 24u <= -723.712 + 3.2896u y concluye u >= 199.6, pero de esa desigualdad sale u >= 5443.712 / 27.2896 = 199.48. La diferencia es de 0.06 % y la tolerancia del ítem acepta los dos valores. Se carga 199.48. | [ep-20211113.yaml:114](../content/examenes/ep-20211113.yaml#L114) |
| Parcial, primer cuatrimestre de 2023, ej. 4 (a) | **discrepancia** | El examen de referencia da 0.371 porque redondea 4/9 a 0.44 antes de sumar la binomial (con 0.44 se obtiene 0.3706). Con 4/9 exacto el resultado es 1817344/4782969 = 0.3800, que es el valor que se carga. | [ep-20230527.yaml:202](../content/examenes/ep-20230527.yaml#L202) |

## Guía 1 · Espacios de probabilidad

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| 1.1 | (a) | la opción correcta | $\{\emptyset,\ \{1,2,3\},\ \{4,5,6\},\ \Omega\}$ |  | verificado | [g1-01.yaml:22](../content/guias/guia-1/ejercicios/g1-01.yaml#L22) |
| 1.1 | (b) | la opción correcta | $8$ |  | verificado | [g1-01.yaml:63](../content/guias/guia-1/ejercicios/g1-01.yaml#L63) |
| 1.3 | (a) | $P(\emptyset)$ | `0` |  | verificado | [g1-03.yaml:25](../content/guias/guia-1/ejercicios/g1-03.yaml#L25) |
| 1.3 | (a) | $P(\{a\})$ | `1/2` | = 0,5 | verificado | [g1-03.yaml:27](../content/guias/guia-1/ejercicios/g1-03.yaml#L27) |
| 1.3 | (a) | $P(\{a, b\})$ | `5/6` | ≈ 0,8333 | verificado | [g1-03.yaml:29](../content/guias/guia-1/ejercicios/g1-03.yaml#L29) |
| 1.3 | (a) | $P(\Omega)$ | `1` |  | verificado | [g1-03.yaml:31](../content/guias/guia-1/ejercicios/g1-03.yaml#L31) |
| 1.2 | (a) | $P(\text{Álgebra II o Probabilidad})$ | `41/50` | = 0,82 | verificado | [g1-02.yaml:20](../content/guias/guia-1/ejercicios/g1-02.yaml#L20) |
| 1.2 | (b) | $P(\text{ni Álgebra II ni Probabilidad})$ | `9/50` | = 0,18 | verificado | [g1-02.yaml:38](../content/guias/guia-1/ejercicios/g1-02.yaml#L38) |
| 1.2 | (c) | $P(\text{alguna de las tres})$ | `37/40` | = 0,925 | verificado | [g1-02.yaml:55](../content/guias/guia-1/ejercicios/g1-02.yaml#L55) |
| 1.2 | (d) | $P(\text{sólo una de las tres})$ | `67/200` | = 0,335 | verificado | [g1-02.yaml:75](../content/guias/guia-1/ejercicios/g1-02.yaml#L75) |
| 1.2 | (e) | $P(\text{ninguna de las tres})$ | `3/40` | = 0,075 | verificado | [g1-02.yaml:100](../content/guias/guia-1/ejercicios/g1-02.yaml#L100) |
| 1.4 | (a) | $P(\text{suma} = 7)$ | `1/6` | ≈ 0,1667 | verificado | [g1-04.yaml:18](../content/guias/guia-1/ejercicios/g1-04.yaml#L18) |
| 1.4 | (b) | $P(\text{primero} > \text{segundo})$ | `5/12` | ≈ 0,4167 | verificado | [g1-04.yaml:36](../content/guias/guia-1/ejercicios/g1-04.yaml#L36) |
| 1.4 | (c) | $P(\text{distintos y suma} \le 7)$ | `1/2` | = 0,5 | verificado | [g1-04.yaml:56](../content/guias/guia-1/ejercicios/g1-04.yaml#L56) |
| 1.4 | (d) | $P(\lvert \text{diferencia} \rvert > 1)$ | `5/9` | ≈ 0,5556 | verificado | [g1-04.yaml:76](../content/guias/guia-1/ejercicios/g1-04.yaml#L76) |
| 1.5 | (a) | $P(\text{ambas rojas})$ | `1/4` | = 0,25 | verificado | [g1-05.yaml:20](../content/guias/guia-1/ejercicios/g1-05.yaml#L20) |
| 1.5 | (b) | $P(\text{mismo color})$ | `19/40` | = 0,475 | verificado | [g1-05.yaml:38](../content/guias/guia-1/ejercicios/g1-05.yaml#L38) |
| 1.5 | (c) | $P(\text{distinto color})$ | `21/40` | = 0,525 | verificado | [g1-05.yaml:56](../content/guias/guia-1/ejercicios/g1-05.yaml#L56) |
| 1.5 | (d) | $P(\text{blanca de } b)$ | `3/5` | = 0,6 | verificado | [g1-05.yaml:73](../content/guias/guia-1/ejercicios/g1-05.yaml#L73) |
| 1.13 | (a) | $P(\text{las cinco iguales})$ | `1/10000` | = 0,0001 | verificado | [g1-13.yaml:23](../content/guias/guia-1/ejercicios/g1-13.yaml#L23) |
| 1.13 | (a) | $P(1, 3, 5, 7, 9 \text{ en ese orden})$ | `1/100000` | ≈ 0,00001 | verificado | [g1-13.yaml:25](../content/guias/guia-1/ejercicios/g1-13.yaml#L25) |
| 1.13 | (a) | $P(\text{los cinco impares})$ | `3/2500` | = 0,0012 | verificado | [g1-13.yaml:27](../content/guias/guia-1/ejercicios/g1-13.yaml#L27) |
| 1.13 | (a) | $P(\text{las cinco distintas})$ | `189/625` | = 0,3024 | verificado | [g1-13.yaml:29](../content/guias/guia-1/ejercicios/g1-13.yaml#L29) |
| 1.13 | (b) | $P(\text{las cinco iguales})$ | `0` |  | verificado | [g1-13.yaml:55](../content/guias/guia-1/ejercicios/g1-13.yaml#L55) |
| 1.13 | (b) | $P(1, 3, 5, 7, 9 \text{ en ese orden})$ | `1/30240` | ≈ 0,00003307 | verificado | [g1-13.yaml:57](../content/guias/guia-1/ejercicios/g1-13.yaml#L57) |
| 1.13 | (b) | $P(\text{los cinco impares})$ | `1/252` | ≈ 0,003968 | verificado | [g1-13.yaml:59](../content/guias/guia-1/ejercicios/g1-13.yaml#L59) |
| 1.13 | (b) | $P(\text{las cinco distintas})$ | `1` |  | verificado | [g1-13.yaml:61](../content/guias/guia-1/ejercicios/g1-13.yaml#L61) |
| 1.15 | (a) | $P(\text{4 en P, 4 en M y 5 en G})$ | `10010/177147` | ≈ 0,05651 | verificado | [g1-15.yaml:22](../content/guias/guia-1/ejercicios/g1-15.yaml#L22) |
| 1.15 | (b) | $P(\text{6 en P y 6 o más en M})$ | `4576/531441` | ≈ 0,008611 | verificado | [g1-15.yaml:42](../content/guias/guia-1/ejercicios/g1-15.yaml#L42) |
| 1.15 | (c) | $P(\text{un puerto con 5 y otro con 4})$ | `10010/59049` | ≈ 0,1695 | verificado | [g1-15.yaml:64](../content/guias/guia-1/ejercicios/g1-15.yaml#L64) |
| 1.16 | (a) | $P(\text{2 en la primera y la última vacía})$ | `7/110` | ≈ 0,06364 | verificado | [g1-16.yaml:22](../content/guias/guia-1/ejercicios/g1-16.yaml#L22) |
| 1.16 | (b) | $P(\text{más de 3 en la cuarta})$ | `7/66` | ≈ 0,1061 | verificado | [g1-16.yaml:44](../content/guias/guia-1/ejercicios/g1-16.yaml#L44) |
| 1.10 | (a) | $P(\text{empieza con } 0{,}314)$ | `1/1000` | = 0,001 | verificado | [g1-10.yaml:20](../content/guias/guia-1/ejercicios/g1-10.yaml#L20) |
| 1.10 | (b) | $P(\text{sin } 0 \text{ en los primeros } 4)$ | `6561/10000` | = 0,6561 | verificado | [g1-10.yaml:40](../content/guias/guia-1/ejercicios/g1-10.yaml#L40) |
| 1.10 | (c) | $P(\text{ningún dígito } 0)$ | `0` |  | verificado | [g1-10.yaml:60](../content/guias/guia-1/ejercicios/g1-10.yaml#L60) |
| 1.6 | (a) | $P(\text{ningún } 1)$ | `625/1296` | ≈ 0,4823 | verificado | [g1-06.yaml:22](../content/guias/guia-1/ejercicios/g1-06.yaml#L22) |
| 1.6 | (b) | la opción correcta | El esposo del Sr. Galíndez |  | verificado | [g1-06.yaml:42](../content/guias/guia-1/ejercicios/g1-06.yaml#L42) |
| 1.28 | (a) | la opción correcta | Dado $B$ son independientes, pero sin condicionar no lo son. |  | verificado | [g1-28.yaml:26](../content/guias/guia-1/ejercicios/g1-28.yaml#L26) |
| 1.28 | (b) | la opción correcta | Son independientes, pero dado $B$ dejan de serlo. |  | verificado | [g1-28.yaml:71](../content/guias/guia-1/ejercicios/g1-28.yaml#L71) |
| 1.22 | (a) | $P(B_1)$ | `1/3` | ≈ 0,3333 | verificado | [g1-22.yaml:23](../content/guias/guia-1/ejercicios/g1-22.yaml#L23) |
| 1.22 | (b) | $P(B_2)$ | `47/120` | ≈ 0,3917 | verificado | [g1-22.yaml:40](../content/guias/guia-1/ejercicios/g1-22.yaml#L40) |
| 1.22 | (c) | $P(B_1 \mid R_2)$ | `25/73` | ≈ 0,3425 | verificado | [g1-22.yaml:63](../content/guias/guia-1/ejercicios/g1-22.yaml#L63) |
| 1.22 | (d) | $P(\text{alguna roja})$ | `7/8` | = 0,875 | verificado | [g1-22.yaml:85](../content/guias/guia-1/ejercicios/g1-22.yaml#L85) |
| 1.22 | (e) | la opción correcta | Porque cada urna mantiene la misma proporción de bolas rojas que antes, y las probabilidades solo dependen de esa proporción. |  | verificado | [g1-22.yaml:110](../content/guias/guia-1/ejercicios/g1-22.yaml#L110) |
| 1.25 | (a) | $P(\text{indica } 1 \mid \text{se emitió } 1)$ | `2089/2090` | ≈ 0,9995 | verificado | [g1-25.yaml:25](../content/guias/guia-1/ejercicios/g1-25.yaml#L25) |
| 1.7 | (b) | $P(A_n)$ | `(5/6)^(n-1) * (1/6)` | en función de $n$ | verificado | [g1-07.yaml:20](../content/guias/guia-1/ejercicios/g1-07.yaml#L20) |
| 1.7 | (b8) | $P(A_8)$ | `78125/1679616` | ≈ 0,04651 | verificado | [g1-07.yaml:42](../content/guias/guia-1/ejercicios/g1-07.yaml#L42) |
| 1.7 | (c) | $P(B_8)$ | `390625/1679616` | ≈ 0,2326 | verificado | [g1-07.yaml:59](../content/guias/guia-1/ejercicios/g1-07.yaml#L59) |
| 1.7 | (e) | $P(B)$ | `0` |  | verificado | [g1-07.yaml:78](../content/guias/guia-1/ejercicios/g1-07.yaml#L78) |
| 1.9 | (a) | $P(\text{gana Juan})$ | `5/21` | ≈ 0,2381 | verificado | [g1-09.yaml:33](../content/guias/guia-1/ejercicios/g1-09.yaml#L33) |
| 1.9 | (a) | $P(\text{gana Pedro})$ | `5/21` | ≈ 0,2381 | verificado | [g1-09.yaml:35](../content/guias/guia-1/ejercicios/g1-09.yaml#L35) |
| 1.9 | (a) | $P(\text{gana María})$ | `4/21` | ≈ 0,1905 | verificado | [g1-09.yaml:37](../content/guias/guia-1/ejercicios/g1-09.yaml#L37) |
| 1.9 | (b) | $P(\text{Juan gana el primero y no termina})$ | `2/9` | ≈ 0,2222 | verificado | [g1-09.yaml:66](../content/guias/guia-1/ejercicios/g1-09.yaml#L66) |
| 1.9 | (c) | $P(\text{no termina})$ | `1/3` | ≈ 0,3333 | verificado | [g1-09.yaml:94](../content/guias/guia-1/ejercicios/g1-09.yaml#L94) |

## Guía 2 · Variables aleatorias y vectores

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| 2.1 | (a) | la opción correcta | No, porque $\{X \le 1\} = \{1\}$ no pertenece a $\mathcal{A}$. |  | verificado | [g2-01.yaml:24](../content/guias/guia-2/ejercicios/g2-01.yaml#L24) |
| 2.1 | (b) | la opción correcta | Sí, porque es constante en los impares y en los pares, que son los bloques de $\mathcal{A}$. |  | verificado | [g2-01.yaml:65](../content/guias/guia-2/ejercicios/g2-01.yaml#L65) |
| 2.1 | (c) | la opción correcta | No, porque $\{X \le 0\} = \{2, 3, 5, 6\}$ no pertenece a $\mathcal{A}$. |  | verificado | [g2-01.yaml:103](../content/guias/guia-2/ejercicios/g2-01.yaml#L103) |
| 2.2 | (a) | la opción correcta | En $-2$ y en $2$, cada uno con probabilidad $1/3$. |  | verificado | [g2-02.yaml:23](../content/guias/guia-2/ejercicios/g2-02.yaml#L23) |
| 2.2 | (b) | $P(-2 < X \le 2)$ | `2/3` | ≈ 0,6667 | verificado | [g2-02.yaml:66](../content/guias/guia-2/ejercicios/g2-02.yaml#L66) |
| 2.2 | (b) | $P(-2 \le X \le 2)$ | `1` |  | verificado | [g2-02.yaml:68](../content/guias/guia-2/ejercicios/g2-02.yaml#L68) |
| 2.2 | (b) | $P(-2 \le X < 2)$ | `2/3` | ≈ 0,6667 | verificado | [g2-02.yaml:70](../content/guias/guia-2/ejercicios/g2-02.yaml#L70) |
| 2.2 | (b) | $P(-2 < X < 2)$ | `1/3` | ≈ 0,3333 | verificado | [g2-02.yaml:72](../content/guias/guia-2/ejercicios/g2-02.yaml#L72) |
| 2.2 | (c) | $P(X \in (-2, -1))$ | `0` |  | verificado | [g2-02.yaml:102](../content/guias/guia-2/ejercicios/g2-02.yaml#L102) |
| 2.2 | (c) | $P(\lvert X \rvert \le 1)$ | `1/3` | ≈ 0,3333 | verificado | [g2-02.yaml:104](../content/guias/guia-2/ejercicios/g2-02.yaml#L104) |
| 2.2 | (c) | $P(X \in (1, 2))$ | `0` |  | verificado | [g2-02.yaml:106](../content/guias/guia-2/ejercicios/g2-02.yaml#L106) |
| 2.2 | (d) | $P(X \le 1{,}5 \mid X < 2)$ | `1` |  | verificado | [g2-02.yaml:131](../content/guias/guia-2/ejercicios/g2-02.yaml#L131) |
| 2.2 | (d) | $P(X \le 1{,}5 \mid X \le 2)$ | `2/3` | ≈ 0,6667 | verificado | [g2-02.yaml:133](../content/guias/guia-2/ejercicios/g2-02.yaml#L133) |
| 2.2 | (e) | $P(X = -2 \mid \lvert X \rvert = 2)$ | `1/2` | = 0,5 | verificado | [g2-02.yaml:155](../content/guias/guia-2/ejercicios/g2-02.yaml#L155) |
| 2.8 | (a) | $P(T_1 > 3)$ | `exp(-3/2)` | ≈ 0,2231 | verificado | [g2-08.yaml:23](../content/guias/guia-2/ejercicios/g2-08.yaml#L23) |
| 2.8 | (a) | $P(T_1 > 5 \mid T_1 > 2)$ | `exp(-3/2)` | ≈ 0,2231 | verificado | [g2-08.yaml:25](../content/guias/guia-2/ejercicios/g2-08.yaml#L25) |
| 2.8 | (b) | $P(T_3 > 3)$ | `29*exp(-3/2)/8` | ≈ 0,8088 | verificado | [g2-08.yaml:49](../content/guias/guia-2/ejercicios/g2-08.yaml#L49) |
| 2.8 | (b) | $P(T_3 > 5 \mid T_3 > 2)$ | `53*exp(-3/2)/20` | ≈ 0,5913 | verificado | [g2-08.yaml:51](../content/guias/guia-2/ejercicios/g2-08.yaml#L51) |
| 2.13 | (a) | la opción correcta | $F_T(t) = F_X\big(G^{-1}(t)\big)$ |  | verificado | [g2-13.yaml:25](../content/guias/guia-2/ejercicios/g2-13.yaml#L25) |
| 2.13 | (b) | la opción correcta | $U$ es uniforme en $(0, 1)$, es decir, $F_U(u) = u$ para $0 < u < 1$. |  | verificado | [g2-13.yaml:63](../content/guias/guia-2/ejercicios/g2-13.yaml#L63) |
| 2.13 | (c) | la opción correcta | $F_V(v) = G(v)$ |  | verificado | [g2-13.yaml:102](../content/guias/guia-2/ejercicios/g2-13.yaml#L102) |
| 2.16 | (a) | $h(1)$ | `1/2` | = 0,5 | verificado | [g2-16.yaml:26](../content/guias/guia-2/ejercicios/g2-16.yaml#L26) |
| 2.16 | (a) | $h(3)$ | `1` |  | verificado | [g2-16.yaml:28](../content/guias/guia-2/ejercicios/g2-16.yaml#L28) |
| 2.16 | (a) | $P(h(X) = 1)$ | `exp(-1)` | ≈ 0,3679 | verificado | [g2-16.yaml:30](../content/guias/guia-2/ejercicios/g2-16.yaml#L30) |
| 2.17 | (a) | $F_T(1)$ | `1 - exp(-1/8)` | ≈ 0,1175 | verificado | [g2-17.yaml:31](../content/guias/guia-2/ejercicios/g2-17.yaml#L31) |
| 2.17 | (a) | $F_T(2)$ | `1 - exp(-1)` | ≈ 0,6321 | verificado | [g2-17.yaml:33](../content/guias/guia-2/ejercicios/g2-17.yaml#L33) |
| 2.17 | (a) | $f_T(1)$ | `3/8 * exp(-1/8)` | ≈ 0,3309 | verificado | [g2-17.yaml:35](../content/guias/guia-2/ejercicios/g2-17.yaml#L35) |
| 2.17 | (b) | $P(T > 1)$ | `exp(-1)` | ≈ 0,3679 | verificado | [g2-17.yaml:60](../content/guias/guia-2/ejercicios/g2-17.yaml#L60) |
| 2.17 | (b) | $P_{\beta = 0{,}5}(T > 4 \mid T > 3)$ | `exp(sqrt(3) - 2)` | ≈ 0,7649 | verificado | [g2-17.yaml:62](../content/guias/guia-2/ejercicios/g2-17.yaml#L62) |
| 2.17 | (b) | $P_{\beta = 1}(T > 4 \mid T > 3)$ | `exp(-1)` | ≈ 0,3679 | verificado | [g2-17.yaml:64](../content/guias/guia-2/ejercicios/g2-17.yaml#L64) |
| 2.17 | (b) | $P_{\beta = 1{,}5}(T > 4 \mid T > 3)$ | `exp(3 * sqrt(3) - 8)` | ≈ 0,06058 | verificado | [g2-17.yaml:66](../content/guias/guia-2/ejercicios/g2-17.yaml#L66) |
| 2.19 | (a) | $f_{X \mid 3 \le X \le 12}(5)$ | `2/27` | ≈ 0,07407 | verificado | [g2-19.yaml:25](../content/guias/guia-2/ejercicios/g2-19.yaml#L25) |
| 2.19 | (a) | $f_{X \mid 3 \le X \le 12}(10)$ | `4/27` | ≈ 0,1481 | verificado | [g2-19.yaml:27](../content/guias/guia-2/ejercicios/g2-19.yaml#L27) |
| 2.19 | (a) | $P(X < 6 \mid 3 \le X \le 12)$ | `1/5` | = 0,2 | verificado | [g2-19.yaml:29](../content/guias/guia-2/ejercicios/g2-19.yaml#L29) |
| 2.19 | (b) | $f_{X \mid X \notin [3, 12]}(2)$ | `2/45` | ≈ 0,04444 | verificado | [g2-19.yaml:55](../content/guias/guia-2/ejercicios/g2-19.yaml#L55) |
| 2.19 | (b) | $f_{X \mid X \notin [3, 12]}(13)$ | `13/45` | ≈ 0,2889 | verificado | [g2-19.yaml:57](../content/guias/guia-2/ejercicios/g2-19.yaml#L57) |
| 2.19 | (b) | $f_{X \mid X \notin [3, 12]}(5)$ | `0` |  | verificado | [g2-19.yaml:59](../content/guias/guia-2/ejercicios/g2-19.yaml#L59) |
| 2.22 | (a) | $P(\lvert Y \rvert < X)$ | `1/2` | = 0,5 | verificado | [g2-22.yaml:20](../content/guias/guia-2/ejercicios/g2-22.yaml#L20) |
| 2.22 | (b) | $f_X(0)$ | `2/pi` | ≈ 0,6366 | verificado | [g2-22.yaml:44](../content/guias/guia-2/ejercicios/g2-22.yaml#L44) |
| 2.22 | (b) | $f_X(1)$ | `sqrt(3)/pi` | ≈ 0,5513 | verificado | [g2-22.yaml:46](../content/guias/guia-2/ejercicios/g2-22.yaml#L46) |
| 2.22 | (b) | $f_Y(0)$ | `1/pi` | ≈ 0,3183 | verificado | [g2-22.yaml:48](../content/guias/guia-2/ejercicios/g2-22.yaml#L48) |
| 2.22 | (b) | $f_Y(1)$ | `sqrt(3)/(2*pi)` | ≈ 0,2757 | verificado | [g2-22.yaml:50](../content/guias/guia-2/ejercicios/g2-22.yaml#L50) |
| 2.22 | (c) | la opción correcta | No, porque el soporte no es un rectángulo y el rango posible de $Y$ depende del valor de $X$. |  | verificado | [g2-22.yaml:83](../content/guias/guia-2/ejercicios/g2-22.yaml#L83) |
| 2.26 | (a) | $P(\text{se encuentran})$ | `8/9` | ≈ 0,8889 | verificado | [g2-26.yaml:25](../content/guias/guia-2/ejercicios/g2-26.yaml#L25) |

## Guía 3 · Esperanza, varianza y covarianza

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| 3.1 | (a) | $E[X]$ | `5/4` | = 1,25 | verificado | [g3-01.yaml:19](../content/guias/guia-3/ejercicios/g3-01.yaml#L19) |
| 3.1 | (b) | $E[X \mid X < 1]$ | `3/4` | = 0,75 | verificado | [g3-01.yaml:51](../content/guias/guia-3/ejercicios/g3-01.yaml#L51) |
| 3.1 | (b) | $E[X \mid X \le 1]$ | `5/6` | ≈ 0,8333 | verificado | [g3-01.yaml:53](../content/guias/guia-3/ejercicios/g3-01.yaml#L53) |
| 3.16 | (a) | $E[W]$ | `111` |  | verificado | [g3-16.yaml:21](../content/guias/guia-3/ejercicios/g3-16.yaml#L21) |
| 3.10 | (a) | $E[\text{área}]$ | `1800/pi` | ≈ 573 | verificado | [g3-10.yaml:21](../content/guias/guia-3/ejercicios/g3-10.yaml#L21) |
| 3.10 | (b) | $E[\text{perímetro}]$ | `pi*sqrt(15)` | ≈ 12,17 | verificado | [g3-10.yaml:51](../content/guias/guia-3/ejercicios/g3-10.yaml#L51) |
| 3.12 | (a) | $E[X \operatorname{sen}(XY)]$ | `(pi^2 - sin(pi^2))/pi^3` | ≈ 0,3322 | verificado | [g3-12.yaml:20](../content/guias/guia-3/ejercicios/g3-12.yaml#L20) |
| 3.8 | (a) | $E[Z \mid Z > 1]$ | `exp(-1/2) / sqrt(2*pi) / (1/2 - erf(1/sqrt(2))/2)` | ≈ 1,525 | verificado | [g3-08.yaml:25](../content/guias/guia-3/ejercicios/g3-08.yaml#L25) |
| 3.8 | (a) | $E[Z \mid Z > 2]$ | `exp(-2) / sqrt(2*pi) / (1/2 - erf(2/sqrt(2))/2)` | ≈ 2,373 | verificado | [g3-08.yaml:27](../content/guias/guia-3/ejercicios/g3-08.yaml#L27) |
| 3.8 | (b) | $\varphi(3)/3$ | `exp(-9/2) / sqrt(2*pi) / 3` | ≈ 0,001477 | verificado | [g3-08.yaml:53](../content/guias/guia-3/ejercicios/g3-08.yaml#L53) |
| 3.8 | (b) | $1 - \Phi(3)$ | `1/2 - erf(3/sqrt(2))/2` | ≈ 0,00135 | verificado | [g3-08.yaml:55](../content/guias/guia-3/ejercicios/g3-08.yaml#L55) |
| 3.8 | (c) | $E[X \mid X > 12]$ | `10 + 2 * exp(-1/2) / sqrt(2*pi) / (1/2 - erf(1/sqrt(2))/2)` | ≈ 13,05 | verificado | [g3-08.yaml:79](../content/guias/guia-3/ejercicios/g3-08.yaml#L79) |
| 3.20 | (a) | $\operatorname{cov}(X, Y)$ | `1/9` | ≈ 0,1111 | verificado | [g3-20.yaml:20](../content/guias/guia-3/ejercicios/g3-20.yaml#L20) |
| 3.20 | (b) | $\operatorname{var}[X + Y]$ | `2/3` | ≈ 0,6667 | verificado | [g3-20.yaml:43](../content/guias/guia-3/ejercicios/g3-20.yaml#L43) |
| 3.20 | (c) | $\operatorname{cov}(3X - Y + 2,\ X + Y)$ | `2/3` | ≈ 0,6667 | verificado | [g3-20.yaml:66](../content/guias/guia-3/ejercicios/g3-20.yaml#L66) |
| 3.22 | (a) | Pendiente | `3/5` | = 0,6 | verificado | [g3-22.yaml:23](../content/guias/guia-3/ejercicios/g3-22.yaml#L23) |
| 3.22 | (a) | Ordenada al origen | `0` |  | verificado | [g3-22.yaml:25](../content/guias/guia-3/ejercicios/g3-22.yaml#L25) |
| 3.32 | (a) | $\operatorname{var}[\bar X]$ | `sigma^2 / n` | en función de $sigma$, $n$ | verificado | [g3-32.yaml:26](../content/guias/guia-3/ejercicios/g3-32.yaml#L26) |
| 3.32 | (b) | $E[W^2]$ | `sigma^2` | en función de $sigma$ | verificado | [g3-32.yaml:53](../content/guias/guia-3/ejercicios/g3-32.yaml#L53) |
| 3.26 | (a) | $n$ | `50000` |  | verificado | [g3-26.yaml:25](../content/guias/guia-3/ejercicios/g3-26.yaml#L25) |

## Guía 4 · Transformaciones de variables aleatorias

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| 4.1 | (a) | $p_Y(-1/2)$ | `1/18` | ≈ 0,05556 | verificado | [g4-01.yaml:22](../content/guias/guia-4/ejercicios/g4-01.yaml#L22) |
| 4.1 | (a) | $p_Y(1)$ | `2/9` | ≈ 0,2222 | verificado | [g4-01.yaml:24](../content/guias/guia-4/ejercicios/g4-01.yaml#L24) |
| 4.1 | (a) | $P(Y \le 0)$ | `5/18` | ≈ 0,2778 | verificado | [g4-01.yaml:26](../content/guias/guia-4/ejercicios/g4-01.yaml#L26) |
| 4.1 | (b) | $p_Y(18)$ | `1/12` | ≈ 0,08333 | verificado | [g4-01.yaml:48](../content/guias/guia-4/ejercicios/g4-01.yaml#L48) |
| 4.1 | (b) | $p_Y(128)$ | `2/9` | ≈ 0,2222 | verificado | [g4-01.yaml:50](../content/guias/guia-4/ejercicios/g4-01.yaml#L50) |
| 4.1 | (b) | $P(Y > 50)$ | `7/12` | ≈ 0,5833 | verificado | [g4-01.yaml:52](../content/guias/guia-4/ejercicios/g4-01.yaml#L52) |
| 4.1 | (c) | $p_Y(2)$ | `2/9` | ≈ 0,2222 | verificado | [g4-01.yaml:75](../content/guias/guia-4/ejercicios/g4-01.yaml#L75) |
| 4.1 | (c) | $p_Y(17)$ | `2/9` | ≈ 0,2222 | verificado | [g4-01.yaml:77](../content/guias/guia-4/ejercicios/g4-01.yaml#L77) |
| 4.1 | (c) | $p_Y(18)$ | `1/9` | ≈ 0,1111 | verificado | [g4-01.yaml:79](../content/guias/guia-4/ejercicios/g4-01.yaml#L79) |
| 4.1 | (d) | $p_Y(92)$ | `1/6` | ≈ 0,1667 | verificado | [g4-01.yaml:104](../content/guias/guia-4/ejercicios/g4-01.yaml#L104) |
| 4.1 | (d) | $p_Y(93)$ | `1/3` | ≈ 0,3333 | verificado | [g4-01.yaml:106](../content/guias/guia-4/ejercicios/g4-01.yaml#L106) |
| 4.1 | (d) | $p_Y(96)$ | `1/3` | ≈ 0,3333 | verificado | [g4-01.yaml:108](../content/guias/guia-4/ejercicios/g4-01.yaml#L108) |
| 4.1 | (d) | $p_Y(128)$ | `0` |  | verificado | [g4-01.yaml:110](../content/guias/guia-4/ejercicios/g4-01.yaml#L110) |
| 4.3 | (a) | $f_{-2X + 1}(-1)$ | `6 / (pi^2 * (e + 1))` | ≈ 0,1635 | verificado | [g4-03.yaml:23](../content/guias/guia-4/ejercicios/g4-03.yaml#L23) |
| 4.3 | (a) | $f_{-2X + 1}(2)$ | `0` |  | verificado | [g4-03.yaml:25](../content/guias/guia-4/ejercicios/g4-03.yaml#L25) |
| 4.3 | (a) | $f_{3X}(3)$ | `4 / (pi^2 * (e + 1))` | ≈ 0,109 | verificado | [g4-03.yaml:27](../content/guias/guia-4/ejercicios/g4-03.yaml#L27) |
| 4.3 | (b) | $f_Y(-1)$ | `4 / (pi^2 * (e + 1))` | ≈ 0,109 | verificado | [g4-03.yaml:48](../content/guias/guia-4/ejercicios/g4-03.yaml#L48) |
| 4.3 | (b) | $f_Y(-8)$ | `2 / (pi^2 * (e^2 + 1))` | ≈ 0,02416 | verificado | [g4-03.yaml:50](../content/guias/guia-4/ejercicios/g4-03.yaml#L50) |
| 4.3 | (b) | $f_Y(1)$ | `0` |  | verificado | [g4-03.yaml:52](../content/guias/guia-4/ejercicios/g4-03.yaml#L52) |
| 4.3 | (c) | $f_Y(5/2)$ | `2 / (pi^2 * (sqrt(e) + 1)) + 32 / (pi^2 * (e^2 + 1))` | ≈ 0,463 | verificado | [g4-03.yaml:73](../content/guias/guia-4/ejercicios/g4-03.yaml#L73) |
| 4.3 | (c) | $f_Y(10/3)$ | `1 / (2 * pi^2 * (e^(1/3) + 1)) + 81 / (2 * pi^2 * (e^3 + 1))` | ≈ 0,2158 | verificado | [g4-03.yaml:75](../content/guias/guia-4/ejercicios/g4-03.yaml#L75) |
| 4.3 | (c) | $f_Y(1)$ | `0` |  | verificado | [g4-03.yaml:77](../content/guias/guia-4/ejercicios/g4-03.yaml#L77) |
| 4.3 | (d) | $f_Y(-2)$ | `12 / (pi^2 * (e + 1)) + 24 / (pi^2 * (e^2 + 1))` | ≈ 0,6169 | verificado | [g4-03.yaml:102](../content/guias/guia-4/ejercicios/g4-03.yaml#L102) |
| 4.3 | (d) | $f_Y(4)$ | `48 / (5 * pi^2 * (e^4 + 1))` | ≈ 0,01749 | verificado | [g4-03.yaml:104](../content/guias/guia-4/ejercicios/g4-03.yaml#L104) |
| 4.3 | (d) | $f_Y(-3)$ | `0` |  | verificado | [g4-03.yaml:106](../content/guias/guia-4/ejercicios/g4-03.yaml#L106) |
| 4.6 | (a) | $P(V_2 = 0)$ | `1/4` | = 0,25 | verificado | [g4-06.yaml:25](../content/guias/guia-4/ejercicios/g4-06.yaml#L25) |
| 4.6 | (a) | $F_{V_2}(1/2)$ | `1/2` | = 0,5 | verificado | [g4-06.yaml:27](../content/guias/guia-4/ejercicios/g4-06.yaml#L27) |
| 4.6 | (a) | $F_{V_2}(0{,}9)$ | `7/10` | = 0,7 | verificado | [g4-06.yaml:29](../content/guias/guia-4/ejercicios/g4-06.yaml#L29) |
| 4.6 | (a) | $P(V_2 = 1)$ | `1/4` | = 0,25 | verificado | [g4-06.yaml:31](../content/guias/guia-4/ejercicios/g4-06.yaml#L31) |
| 4.24 | (a) | $F_R(1/2)$ | `pi/16` | ≈ 0,1963 | verificado | [g4-24.yaml:23](../content/guias/guia-4/ejercicios/g4-24.yaml#L23) |
| 4.24 | (a) | $F_R(1)$ | `pi/4` | ≈ 0,7854 | verificado | [g4-24.yaml:25](../content/guias/guia-4/ejercicios/g4-24.yaml#L25) |
| 4.24 | (a) | $F_R(1{,}2)$ | `pi*1.44/4 - 1.44*acos(1/1.2) + sqrt(1.44 - 1)` | ≈ 0,9509 | verificado | [g4-24.yaml:27](../content/guias/guia-4/ejercicios/g4-24.yaml#L27) |
| 4.24 | (b) | $P(R > 1/2)$ | `1 - pi/16` | ≈ 0,8037 | verificado | [g4-24.yaml:56](../content/guias/guia-4/ejercicios/g4-24.yaml#L56) |
| 4.10 | (a) | $f_{U,V}(0, 0)$ | `1 / (4 * pi)` | ≈ 0,07958 | verificado | [g4-10.yaml:21](../content/guias/guia-4/ejercicios/g4-10.yaml#L21) |
| 4.10 | (a) | $f_{U,V}(1, 1)$ | `exp(-1/2) / (4 * pi)` | ≈ 0,04827 | verificado | [g4-10.yaml:23](../content/guias/guia-4/ejercicios/g4-10.yaml#L23) |
| 4.10 | (a) | $f_U(0)$ | `1 / (2 * sqrt(pi))` | ≈ 0,2821 | verificado | [g4-10.yaml:25](../content/guias/guia-4/ejercicios/g4-10.yaml#L25) |
| 4.10 | (b) | $f_{U,V}(1, 0)$ | `exp(-1/2) / (2 * pi)` | ≈ 0,09653 | verificado | [g4-10.yaml:53](../content/guias/guia-4/ejercicios/g4-10.yaml#L53) |
| 4.10 | (b) | $f_U(0)$ | `1 / sqrt(2 * pi)` | ≈ 0,3989 | verificado | [g4-10.yaml:55](../content/guias/guia-4/ejercicios/g4-10.yaml#L55) |
| 4.10 | (c) | $f_{U,V}(2, 1)$ | `exp(-1) / (4 * pi)` | ≈ 0,02927 | verificado | [g4-10.yaml:78](../content/guias/guia-4/ejercicios/g4-10.yaml#L78) |
| 4.10 | (c) | $f_U(2)$ | `exp(-1) / 2` | ≈ 0,1839 | verificado | [g4-10.yaml:80](../content/guias/guia-4/ejercicios/g4-10.yaml#L80) |
| 4.10 | (c) | $f_V(1)$ | `1 / (2 * pi)` | ≈ 0,1592 | verificado | [g4-10.yaml:82](../content/guias/guia-4/ejercicios/g4-10.yaml#L82) |
| 4.10 | (d) | la opción correcta | Sí, en los tres casos. |  | verificado | [g4-10.yaml:111](../content/guias/guia-4/ejercicios/g4-10.yaml#L111) |
| 4.10 | (e) | $P(Z_1^2 + Z_2^2 > 4)$ | `exp(-2)` | ≈ 0,1353 | verificado | [g4-10.yaml:152](../content/guias/guia-4/ejercicios/g4-10.yaml#L152) |
| 4.10 | (e) | $P(Z_2 > \sqrt{3}\, Z_1)$ | `1/2` | = 0,5 | verificado | [g4-10.yaml:154](../content/guias/guia-4/ejercicios/g4-10.yaml#L154) |
| 4.14 | (a) | $f_U(t)$ | `(l1 + l2) * exp(-t * (l1 + l2))` | en función de $t$, $l1$, $l2$ | verificado | [g4-14.yaml:27](../content/guias/guia-4/ejercicios/g4-14.yaml#L27) |
| 4.14 | (b) | $P(J = 1)$ | `l1 / (l1 + l2)` | en función de $l1$, $l2$ | verificado | [g4-14.yaml:52](../content/guias/guia-4/ejercicios/g4-14.yaml#L52) |
| 4.14 | (c) | $f_W(t)$ | `l1 * l2 * (exp(-l2 * t) + exp(-l1 * t)) / (l1 + l2)` | en función de $t$, $l1$, $l2$ | verificado | [g4-14.yaml:76](../content/guias/guia-4/ejercicios/g4-14.yaml#L76) |
| 4.19 | (a) | $P(L + M = 10)$ | `10^10 * exp(-10) / 10!` | ≈ 0,1251 | verificado | [g4-19.yaml:21](../content/guias/guia-4/ejercicios/g4-19.yaml#L21) |
| 4.19 | (b) | $P(M = 8 \mid L + M = 10)$ | `589824/1953125` | ≈ 0,302 | verificado | [g4-19.yaml:48](../content/guias/guia-4/ejercicios/g4-19.yaml#L48) |
| 4.19 | (b) | $P(M = 10 \mid L + M = 10)$ | `1048576/9765625` | ≈ 0,1074 | verificado | [g4-19.yaml:50](../content/guias/guia-4/ejercicios/g4-19.yaml#L50) |
| 4.19 | (b) | $P(M = 0 \mid L + M = 10)$ | `1/9765625` | ≈ 1,024e-7 | verificado | [g4-19.yaml:52](../content/guias/guia-4/ejercicios/g4-19.yaml#L52) |
| 4.19 | (c) | $P(M > 2 \mid L + M = 10)$ | `9764864/9765625` | ≈ 0,9999 | verificado | [g4-19.yaml:77](../content/guias/guia-4/ejercicios/g4-19.yaml#L77) |

## Guía 5 · Condicionamiento y mezclas

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| 5.9 | (a) | $P(S = 0{,}2 \mid X = 0{,}87)$ | `exp(9/125)/(1 + exp(9/125) + exp(67/500))` | ≈ 0,3339 | verificado | [g5-09.yaml:22](../content/guias/guia-5/ejercicios/g5-09.yaml#L22) |
| 5.4 | (a) | $f_Y(0)$ | `1 / sqrt(2*pi)` | ≈ 0,3989 | verificado | [g5-04.yaml:23](../content/guias/guia-5/ejercicios/g5-04.yaml#L23) |
| 5.4 | (a) | $f_{Y \mid X = 1}(3/5)$ | `5 / (4 * sqrt(2*pi))` | ≈ 0,4987 | verificado | [g5-04.yaml:25](../content/guias/guia-5/ejercicios/g5-04.yaml#L25) |
| 5.4 | (a) | $f_{Y \mid X = 0}(1)$ | `5 / (4 * sqrt(2*pi)) * exp(-25/32)` | ≈ 0,2283 | verificado | [g5-04.yaml:27](../content/guias/guia-5/ejercicios/g5-04.yaml#L27) |
| 5.4 | (b) | la opción correcta | No son independientes, porque la distribución de $Y \mid X = x$ depende de $x$. |  | verificado | [g5-04.yaml:55](../content/guias/guia-5/ejercicios/g5-04.yaml#L55) |
| 5.4 | (c) | $P(1 < XY < 5 \mid X = \sqrt{5})$ | `erf(sqrt(10)/4)` | ≈ 0,7364 | verificado | [g5-04.yaml:92](../content/guias/guia-5/ejercicios/g5-04.yaml#L92) |
| 5.10 | (a) | $\varphi(x)$ | `4*x/5` | en función de $x$ | verificado | [g5-10.yaml:24](../content/guias/guia-5/ejercicios/g5-10.yaml#L24) |
| 5.10 | (b) | $\varphi(y)$ | `y + (6 - y)/16` | en función de $y$ | verificado | [g5-10.yaml:46](../content/guias/guia-5/ejercicios/g5-10.yaml#L46) |
| 5.11 | (a) | $\varphi(1)$ | `3/2` | = 1,5 | verificado | [g5-11.yaml:25](../content/guias/guia-5/ejercicios/g5-11.yaml#L25) |
| 5.11 | (a) | $\varphi(2)$ | `9/2` | = 4,5 | verificado | [g5-11.yaml:27](../content/guias/guia-5/ejercicios/g5-11.yaml#L27) |
| 5.11 | (a) | $\varphi(3)$ | `19/2` | = 9,5 | verificado | [g5-11.yaml:29](../content/guias/guia-5/ejercicios/g5-11.yaml#L29) |
| 5.11 | (b) | $\varphi(1)$ | `sqrt(2)/2` | ≈ 0,7071 | verificado | [g5-11.yaml:50](../content/guias/guia-5/ejercicios/g5-11.yaml#L50) |
| 5.11 | (b) | $\varphi(2)$ | `0` |  | verificado | [g5-11.yaml:52](../content/guias/guia-5/ejercicios/g5-11.yaml#L52) |
| 5.11 | (b) | $\varphi(3)$ | `-sqrt(2)/6` | ≈ -0,2357 | verificado | [g5-11.yaml:54](../content/guias/guia-5/ejercicios/g5-11.yaml#L54) |
| 5.12 | (a) | $E[Y \mid X]$ | `36 - X` | en función de $X$ | verificado | [g5-12.yaml:22](../content/guias/guia-5/ejercicios/g5-12.yaml#L22) |
| 5.12 | (b) | $\operatorname{cov}(X, Y)$ | `-9` |  | verificado | [g5-12.yaml:45](../content/guias/guia-5/ejercicios/g5-12.yaml#L45) |
| 5.13 | (a) | $E[\text{tiempo hasta salir}]$ | `35` |  | verificado | [g5-13.yaml:24](../content/guias/guia-5/ejercicios/g5-13.yaml#L24) |
| 5.15 | (a) | la opción correcta | Vale 0, aunque $Y$ depende de $X$, porque la covarianza sólo detecta la parte lineal de la dependencia. |  | verificado | [g5-15.yaml:25](../content/guias/guia-5/ejercicios/g5-15.yaml#L25) |
| 5.21 | (a) | $E[\text{rollos producidos}]$ | `5` |  | verificado | [g5-21.yaml:23](../content/guias/guia-5/ejercicios/g5-21.yaml#L23) |
| 5.21 | (b) | $E[\text{tela producida}]$ | `125` |  | verificado | [g5-21.yaml:44](../content/guias/guia-5/ejercicios/g5-21.yaml#L44) |
| 5.21 | (c) | $E[\text{tela a stock}]$ | `96` |  | verificado | [g5-21.yaml:77](../content/guias/guia-5/ejercicios/g5-21.yaml#L77) |
| 5.23 | (a) | $E[\text{peso final}]$ | `15/2` | = 7,5 | verificado | [g5-23.yaml:21](../content/guias/guia-5/ejercicios/g5-23.yaml#L21) |
| 5.23 | (a) | $\operatorname{var}(\text{peso final})$ | `11/4` | = 2,75 | verificado | [g5-23.yaml:23](../content/guias/guia-5/ejercicios/g5-23.yaml#L23) |
| 5.16 | (a) | $\operatorname{var}[Y]$ | `6` |  | verificado | [g5-16.yaml:21](../content/guias/guia-5/ejercicios/g5-16.yaml#L21) |
| 5.18 | (a) | $E[Y \mid X]$ | `4*X + 2` | en función de $X$ | verificado | [g5-18.yaml:25](../content/guias/guia-5/ejercicios/g5-18.yaml#L25) |
| 5.18 | (b) | $\operatorname{var}(Y \mid X)$ | `(4*X + 2)^2` | en función de $X$ | verificado | [g5-18.yaml:50](../content/guias/guia-5/ejercicios/g5-18.yaml#L50) |
| 5.18 | (c) | $P(E[Y \mid X] \le 3)$ | `1 - exp(-1/2)` | ≈ 0,3935 | verificado | [g5-18.yaml:74](../content/guias/guia-5/ejercicios/g5-18.yaml#L74) |
| 5.18 | (c) | $P(1 < E[Y \mid X] < 2)$ | `0` |  | verificado | [g5-18.yaml:76](../content/guias/guia-5/ejercicios/g5-18.yaml#L76) |
| 5.18 | (c) | $P(\operatorname{var}(Y \mid X) \le 16)$ | `1 - exp(-1)` | ≈ 0,6321 | verificado | [g5-18.yaml:78](../content/guias/guia-5/ejercicios/g5-18.yaml#L78) |
| 5.18 | (c) | $P(\operatorname{var}(Y \mid X) > 1)$ | `1` |  | verificado | [g5-18.yaml:80](../content/guias/guia-5/ejercicios/g5-18.yaml#L80) |
| 5.18 | (d) | $\operatorname{var}(Y)$ | `24` |  | verificado | [g5-18.yaml:103](../content/guias/guia-5/ejercicios/g5-18.yaml#L103) |

## Guía 6 · Distribuciones discretas

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| 6.1 | (a) | $P(\text{más de un defectuoso})$ | `1 - 0.99^10 - 10*0.01*0.99^9` | ≈ 0,004266 | verificado | [g6-01.yaml:21](../content/guias/guia-6/ejercicios/g6-01.yaml#L21) |
| 6.1 | (b) | $P(\text{devuelven uno de los tres})$ | `3*(1 - 0.99^10 - 10*0.01*0.99^9)*(0.99^10 + 10*0.01*0.99^9)^2` | ≈ 0,01269 | verificado | [g6-01.yaml:45](../content/guias/guia-6/ejercicios/g6-01.yaml#L45) |
| 6.24 | (a) | $P_{k = 1}(\text{1 blanca y 1 negra})$ | `1/3` | ≈ 0,3333 | verificado | [g6-24.yaml:23](../content/guias/guia-6/ejercicios/g6-24.yaml#L23) |
| 6.24 | (a) | $P_{k = 3}(\text{1 blanca y 1 negra})$ | `15/28` | ≈ 0,5357 | verificado | [g6-24.yaml:25](../content/guias/guia-6/ejercicios/g6-24.yaml#L25) |
| 6.24 | (a) | $P_{k = 4}(\text{1 blanca y 1 negra})$ | `5/9` | ≈ 0,5556 | verificado | [g6-24.yaml:27](../content/guias/guia-6/ejercicios/g6-24.yaml#L27) |
| 6.24 | (a) | $P_{k = 6}(\text{1 blanca y 1 negra})$ | `6/11` | ≈ 0,5455 | verificado | [g6-24.yaml:29](../content/guias/guia-6/ejercicios/g6-24.yaml#L29) |
| 6.24 | (b) | la opción correcta | Hay un empate, ya que tanto $k = 4$ como $k = 5$ dan el máximo, $5/9$. |  | verificado | [g6-24.yaml:51](../content/guias/guia-6/ejercicios/g6-24.yaml#L51) |
| 6.14 | (a) | $P(\text{5 de A, 4 de B, 3 de C y 2 de D})$ | `14! / (5! * 4! * 3! * 2!) * 0.4^5 * 0.3^4 * 0.2^3 * 0.1^2` | ≈ 0,01674 | verificado | [g6-14.yaml:23](../content/guias/guia-6/ejercicios/g6-14.yaml#L23) |
| 6.14 | (b) | $P(\text{3 de } C \mid \text{5 de } A)$ | `1792/6561` | ≈ 0,2731 | verificado | [g6-14.yaml:47](../content/guias/guia-6/ejercicios/g6-14.yaml#L47) |
| 6.6 | (a) | $P(\text{más de 3 tiros})$ | `125/216` | ≈ 0,5787 | verificado | [g6-06.yaml:20](../content/guias/guia-6/ejercicios/g6-06.yaml#L20) |
| 6.6 | (b) | $P(\text{más de 6 tiros} \mid \text{más de 3})$ | `125/216` | ≈ 0,5787 | verificado | [g6-06.yaml:41](../content/guias/guia-6/ejercicios/g6-06.yaml#L41) |
| 6.12 | (a) | $P(\text{se llena en el minuto 10})$ | `36*0.8^3*0.2^7` | ≈ 0,0002359 | verificado | [g6-12.yaml:20](../content/guias/guia-6/ejercicios/g6-12.yaml#L20) |
| 6.19 | (a) | $P(N = 0)$ | `9/19` | ≈ 0,4737 | verificado | [g6-19.yaml:25](../content/guias/guia-6/ejercicios/g6-19.yaml#L25) |
| 6.19 | (a) | $P(N = 1)$ | `90/361` | ≈ 0,2493 | verificado | [g6-19.yaml:27](../content/guias/guia-6/ejercicios/g6-19.yaml#L27) |
| 6.19 | (a) | $P(N = 3)$ | `9000/130321` | ≈ 0,06906 | verificado | [g6-19.yaml:29](../content/guias/guia-6/ejercicios/g6-19.yaml#L29) |
| 6.19 | (b) | $P(N > 2)$ | `1000/6859` | ≈ 0,1458 | verificado | [g6-19.yaml:55](../content/guias/guia-6/ejercicios/g6-19.yaml#L55) |
| 6.11 | (a) | $E[\text{lanzamientos}]$ | `73/10` | = 7,3 | verificado | [g6-11.yaml:22](../content/guias/guia-6/ejercicios/g6-11.yaml#L22) |

## Guía 7 · Proceso de Poisson

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| 7.1 | (a) | $P(N(1) = 0)$ | `exp(-2)` | ≈ 0,1353 | verificado | [g7-01.yaml:22](../content/guias/guia-7/ejercicios/g7-01.yaml#L22) |
| 7.1 | (b) | $P(N(1, 2) = 1)$ | `2*exp(-2)` | ≈ 0,2707 | verificado | [g7-01.yaml:39](../content/guias/guia-7/ejercicios/g7-01.yaml#L39) |
| 7.1 | (c) | $P(N(1) = 0,\ N(1, 2) = 1,\ N(2, 4) = 2)$ | `16*exp(-8)` | ≈ 0,005367 | verificado | [g7-01.yaml:56](../content/guias/guia-7/ejercicios/g7-01.yaml#L56) |
| 7.1 | (d) | $\operatorname{cov}(N(1, 3),\ N(2, 4))$ | `2` |  | verificado | [g7-01.yaml:76](../content/guias/guia-7/ejercicios/g7-01.yaml#L76) |
| 7.1 | (e) | $P(S_3 > 1/2)$ | `5*exp(-1)/2` | ≈ 0,9197 | verificado | [g7-01.yaml:100](../content/guias/guia-7/ejercicios/g7-01.yaml#L100) |
| 7.1 | (f) | $P(N(1/4) = 1 \mid S_3 = 1/2)$ | `1/2` | = 0,5 | verificado | [g7-01.yaml:118](../content/guias/guia-7/ejercicios/g7-01.yaml#L118) |
| 7.1 | (g) | $P(S_3 > 1/2 \mid N(1/4) = 1)$ | `3*exp(-1/2)/2` | ≈ 0,9098 | verificado | [g7-01.yaml:143](../content/guias/guia-7/ejercicios/g7-01.yaml#L143) |
| 7.5 | (a) | $P(\text{espera} > 5 \text{ min})$ | `exp(-1)` | ≈ 0,3679 | verificado | [g7-05.yaml:22](../content/guias/guia-7/ejercicios/g7-05.yaml#L22) |
| 7.5 | (b) | $P(\text{espera} > 5 \text{ min})$ | `exp(-1)` | ≈ 0,3679 | verificado | [g7-05.yaml:40](../content/guias/guia-7/ejercicios/g7-05.yaml#L40) |
| 7.5 | (c) | $P(\text{espera} > 5 \text{ min})$ | `exp(-1)` | ≈ 0,3679 | verificado | [g7-05.yaml:60](../content/guias/guia-7/ejercicios/g7-05.yaml#L60) |
| 7.5 | (d) | $P(\text{espera} > 5 \text{ min})$ | `exp(-1)` | ≈ 0,3679 | verificado | [g7-05.yaml:84](../content/guias/guia-7/ejercicios/g7-05.yaml#L84) |
| 7.6 | (a) | $P(\text{peso final} > 7)$ | `exp(-2/3)` | ≈ 0,5134 | verificado | [g7-06.yaml:21](../content/guias/guia-7/ejercicios/g7-06.yaml#L21) |
| 7.7 | (a) | $P(\text{primera antes de las 9:15})$ | `37/64` | ≈ 0,5781 | verificado | [g7-07.yaml:21](../content/guias/guia-7/ejercicios/g7-07.yaml#L21) |
| 7.7 | (b) | $P(\text{segunda antes de las 9:30})$ | `1/2` | = 0,5 | verificado | [g7-07.yaml:46](../content/guias/guia-7/ejercicios/g7-07.yaml#L46) |
| 7.10 | (a) | $E[\text{longitud}]$ | `80/3` | ≈ 26,67 | verificado | [g7-10.yaml:24](../content/guias/guia-7/ejercicios/g7-10.yaml#L24) |
| 7.10 | (a) | $\operatorname{var}(\text{longitud})$ | `6400/9` | ≈ 711,1 | verificado | [g7-10.yaml:26](../content/guias/guia-7/ejercicios/g7-10.yaml#L26) |
| 7.10 | (b) | $E[\text{fallas en un rollo}]$ | `4/3` | ≈ 1,333 | verificado | [g7-10.yaml:52](../content/guias/guia-7/ejercicios/g7-10.yaml#L52) |
| 7.12 | (a) | $P(\text{primera señal después de las 0:10})$ | `exp(-80)` | = 1,805e-35 | verificado | [g7-12.yaml:23](../content/guias/guia-7/ejercicios/g7-12.yaml#L23) |
| 7.12 | (b) | $P(\text{la primera es de Lucas})$ | `3/8` | = 0,375 | verificado | [g7-12.yaml:48](../content/guias/guia-7/ejercicios/g7-12.yaml#L48) |
| 7.12 | (c) | $P(\text{después de las 0:10 y de Lucas})$ | `3/8 * exp(-80)` | = 6,768e-36 | verificado | [g7-12.yaml:71](../content/guias/guia-7/ejercicios/g7-12.yaml#L71) |
| 7.15 | (a) | $E[\text{tiempo de trabajo}]$ | `20` |  | verificado | [g7-15.yaml:24](../content/guias/guia-7/ejercicios/g7-15.yaml#L24) |
| 7.15 | (a) | $\operatorname{var}(\text{tiempo de trabajo})$ | `101` |  | verificado | [g7-15.yaml:27](../content/guias/guia-7/ejercicios/g7-15.yaml#L27) |

## Guía 8 · Normal y teorema central del límite

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| 8.5 | (a) | $P\!\left(X_1 - \tfrac{1}{2} X_2 > 2 - \tfrac{1}{3} X_3\right)$ | `1/2 - erf(sqrt(2))/2` | ≈ 0,02275 | verificado | [g8-05.yaml:21](../content/guias/guia-8/ejercicios/g8-05.yaml#L21) |
| 8.2 | (a) | $c$ | `1/2 - log(3)/4` | ≈ 0,2253 | verificado | [g8-02.yaml:24](../content/guias/guia-8/ejercicios/g8-02.yaml#L24) |
| 8.15 | (a) | $P(\text{ganancia} > \$460)$ | `1/2 + erf(2)/2` | ≈ 0,9977 | verificado | [g8-15.yaml:23](../content/guias/guia-8/ejercicios/g8-15.yaml#L23) |
| 8.9 | (a) | $P(\text{urna } 4)$ | `-erf(sqrt(6)/4)/2 + erf(5*sqrt(6)/12)/2` | ≈ 0,1188 | verificado | [g8-09.yaml:26](../content/guias/guia-8/ejercicios/g8-09.yaml#L26) |
| 8.9 | (b) | la opción correcta | La urna 6, que es la media de $\ell$. |  | verificado | [g8-09.yaml:61](../content/guias/guia-8/ejercicios/g8-09.yaml#L61) |
| 8.12 | (a) | $\text{máximo de reservas}$ | `103` |  | verificado | [g8-12.yaml:25](../content/guias/guia-8/ejercicios/g8-12.yaml#L25) |
| 8.22 | (a) | $\text{paladas}$ | `1762` |  | verificado | [g8-22.yaml:24](../content/guias/guia-8/ejercicios/g8-22.yaml#L24) |

## Exámenes

### Parcial, segundo cuatrimestre de 2017

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 2 | (a) | $E[Y^2]$ | `2/3` | ≈ 0,6667 | verificado | [ep-20171028.yaml:44](../content/examenes/ep-20171028.yaml#L44) |
| Ej. 3 | (a) | $P(\text{exactamente 1 bien recibido})$ | `3 * 0.705 * 0.295^2` | ≈ 0,1841 | verificado | [ep-20171028.yaml:84](../content/examenes/ep-20171028.yaml#L84) |
| Ej. 4 | (a) | $P(\text{2 emisiones y alarma})$ | `11/18 * exp(-2)` | ≈ 0,0827 | verificado | [ep-20171028.yaml:125](../content/examenes/ep-20171028.yaml#L125) |
| Ej. 5 | (a) | $P(\text{tiempo total} > 127 \text{ s})$ | `1/2 - erf(sqrt(2)/3)/2` | ≈ 0,2525 | verificado | [ep-20171028.yaml:167](../content/examenes/ep-20171028.yaml#L167) |

### Primer recuperatorio, segundo cuatrimestre de 2017

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 2 | (a) | $F(t)$ | `1 - exp(-t/5) * (1 + t/5)` | en función de $t$ | verificado | [ep-20171118.yaml:50](../content/examenes/ep-20171118.yaml#L50) |
| Ej. 3 | (a) | $\operatorname{cov}(\text{verdes}, \text{amarillas})$ | `5/16` | = 0,3125 | verificado | [ep-20171118.yaml:94](../content/examenes/ep-20171118.yaml#L94) |
| Ej. 4 | (a) | $P(S_4 > 30,\ \text{hay hobbit y elfo})$ | `exp(-53/60) * (1 + 53/60 + (53/60)^2/2 + (53/60)^3/6) * (1 - ((35/53)^3 + (33/53)^3 - (15/53)^3))` | ≈ 0,4871 | verificado | [ep-20171118.yaml:139](../content/examenes/ep-20171118.yaml#L139) |
| Ej. 5 | (a) | $\text{personas}$ | `29` |  | verificado | [ep-20171118.yaml:183](../content/examenes/ep-20171118.yaml#L183) |

### Segundo recuperatorio, segundo cuatrimestre de 2017

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | $P(\text{no es spam} \mid \text{detectado})$ | `17/41` | ≈ 0,4146 | verificado | [ep-20171207.yaml:31](../content/examenes/ep-20171207.yaml#L31) |
| Ej. 2 | (a) | $E[XY]$ | `-1/6` | ≈ -0,1667 | verificado | [ep-20171207.yaml:69](../content/examenes/ep-20171207.yaml#L69) |
| Ej. 3 | (a) | $P(\text{mayoría verde y algún amarillo})$ | `55/144` | ≈ 0,3819 | verificado | [ep-20171207.yaml:104](../content/examenes/ep-20171207.yaml#L104) |
| Ej. 4 | (a) | $\operatorname{cov}(\text{piñas caídas}, \text{tejas rotas})$ | `1/2` | = 0,5 | verificado | [ep-20171207.yaml:146](../content/examenes/ep-20171207.yaml#L146) |
| Ej. 5 | (a) | $\text{pizzas}$ | `164` |  | verificado | [ep-20171207.yaml:185](../content/examenes/ep-20171207.yaml#L185) |

### Segundo recuperatorio, segundo cuatrimestre de 2017

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | $P(\text{3 en Lima y ninguno en Perú})$ | `7/256` | ≈ 0,02734 | verificado | [ep-20171214.yaml:30](../content/examenes/ep-20171214.yaml#L30) |
| Ej. 2 | (a) | $\operatorname{cov}(X, Y)$ | `-1/3` | ≈ -0,3333 | verificado | [ep-20171214.yaml:66](../content/examenes/ep-20171214.yaml#L66) |
| Ej. 3 | (a) | $F_U(-3/4)$ | `1/16` | = 0,0625 | verificado | [ep-20171214.yaml:105](../content/examenes/ep-20171214.yaml#L105) |
| Ej. 3 | (a) | $F_U(-1/4)$ | `1/4` | = 0,25 | verificado | [ep-20171214.yaml:107](../content/examenes/ep-20171214.yaml#L107) |
| Ej. 3 | (a) | $F_U(1/4)$ | `11/16` | = 0,6875 | verificado | [ep-20171214.yaml:109](../content/examenes/ep-20171214.yaml#L109) |
| Ej. 4 | (a) | $P(N(3) \ge 3 \mid S_1 < 1)$ | `1 - 12*exp(-6)/(1 - exp(-2))` | ≈ 0,9656 | verificado | [ep-20171214.yaml:149](../content/examenes/ep-20171214.yaml#L149) |
| Ej. 5 | (a) | $P(\text{al menos 60 lotes aceptados})$ | `1/2 + erf((63.488 - 59.5) / sqrt(2 * 100 * 0.63488 * 0.36512)) / 2` | ≈ 0,7963 | verificado | [ep-20171214.yaml:192](../content/examenes/ep-20171214.yaml#L192) |

### Parcial, primer cuatrimestre de 2018

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | la opción correcta | No. $P(A \cap B) = 0{,}3$ y $P(A)\,P(B) = 0{,}28$. |  | verificado | [ep-20180526.yaml:36](../content/examenes/ep-20180526.yaml#L36) |
| Ej. 2 | (a) | $f_{U,V}(1, 4)$ | `3*exp(-4)` | ≈ 0,05495 | verificado | [ep-20180526.yaml:96](../content/examenes/ep-20180526.yaml#L96) |
| Ej. 2 | (a) | $f_{U,V}(1/2, 3)$ | `3*exp(-3)` | ≈ 0,1494 | verificado | [ep-20180526.yaml:98](../content/examenes/ep-20180526.yaml#L98) |
| Ej. 2 | (a) | $f_{U,V}(1, 2)$ | `0` |  | verificado | [ep-20180526.yaml:100](../content/examenes/ep-20180526.yaml#L100) |
| Ej. 3 | (a) | $P(\text{colectivo} \mid \text{55 min})$ | `1/3` | ≈ 0,3333 | verificado | [ep-20180526.yaml:143](../content/examenes/ep-20180526.yaml#L143) |
| Ej. 4 | (a) | $\operatorname{var}(\text{monto total})$ | `437500` |  | verificado | [ep-20180526.yaml:186](../content/examenes/ep-20180526.yaml#L186) |
| Ej. 5 | (a) | $P(\text{menos de 1450 kg})$ | `1/2 + erf(25*sqrt(266)/266)/2` | ≈ 0,9849 | verificado | [ep-20180526.yaml:230](../content/examenes/ep-20180526.yaml#L230) |

### Primer recuperatorio, primer cuatrimestre de 2018

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | $P(\text{alguna urna vacía})$ | `137/143` | ≈ 0,958 | verificado | [ep-20180616.yaml:29](../content/examenes/ep-20180616.yaml#L29) |
| Ej. 2 | (a) | $E[X^2 \mid -1 < X \le 3]$ | `31/9` | ≈ 3,444 | verificado | [ep-20180616.yaml:65](../content/examenes/ep-20180616.yaml#L65) |
| Ej. 3 | (a) | Pendiente | `3/5` | = 0,6 | verificado | [ep-20180616.yaml:105](../content/examenes/ep-20180616.yaml#L105) |
| Ej. 3 | (a) | Ordenada al origen | `-1` |  | verificado | [ep-20180616.yaml:107](../content/examenes/ep-20180616.yaml#L107) |
| Ej. 4 | (a) | $P(\text{multas} > \$4000)$ | `1 - 31/25 * exp(-6/25)` | ≈ 0,02458 | verificado | [ep-20180616.yaml:151](../content/examenes/ep-20180616.yaml#L151) |
| Ej. 5 | (a) | $\text{catálogos}$ | `57` |  | verificado | [ep-20180616.yaml:191](../content/examenes/ep-20180616.yaml#L191) |

### Parcial, segundo cuatrimestre de 2018

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | $P(\text{más de 5 tiros} \mid \text{ceca, ceca})$ | `62/125` | = 0,496 | verificado | [ep-20181103.yaml:30](../content/examenes/ep-20181103.yaml#L30) |
| Ej. 2 | (a) | $P(X + Y > 1,\ Y < 0{,}75)$ | `1/8` | = 0,125 | verificado | [ep-20181103.yaml:71](../content/examenes/ep-20181103.yaml#L71) |
| Ej. 3 | (a) | $\operatorname{cov}(X + Y,\ X - Y)$ | `7/12` | ≈ 0,5833 | verificado | [ep-20181103.yaml:107](../content/examenes/ep-20181103.yaml#L107) |
| Ej. 4 | (a) | $P(N(10) = 1 \mid S_3 = 30)$ | `4/9` | ≈ 0,4444 | verificado | [ep-20181103.yaml:148](../content/examenes/ep-20181103.yaml#L148) |
| Ej. 5 | (a) | $P(\text{peso total} > 202{,}8 \text{ kg})$ | `1/2 - erf(7*sqrt(3)/25)/2` | ≈ 0,2464 | verificado | [ep-20181103.yaml:189](../content/examenes/ep-20181103.yaml#L189) |

### Primer recuperatorio, segundo cuatrimestre de 2018

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | $P(\text{Alejo antes que Teodoro o Gastón})$ | `2/3` | ≈ 0,6667 | verificado | [ep-20181124.yaml:28](../content/examenes/ep-20181124.yaml#L28) |
| Ej. 2 | (a) | $F_Y(y)$ | `1 - exp(-y)` | en función de $y$ | verificado | [ep-20181124.yaml:68](../content/examenes/ep-20181124.yaml#L68) |
| Ej. 3 | (a) | $E[Y \mid X]$ | `X/10` | en función de $X$ | verificado | [ep-20181124.yaml:106](../content/examenes/ep-20181124.yaml#L106) |
| Ej. 4 | (a) | $P(\text{sale tras las 9:10} \mid \text{llegó antes})$ | `7/4 * (exp(40/21) - 1) / (exp(10/3) - 1)` | ≈ 0,3702 | verificado | [ep-20181124.yaml:148](../content/examenes/ep-20181124.yaml#L148) |
| Ej. 5 | (a) | $\text{camiones}$ | `87` |  | verificado | [ep-20181124.yaml:191](../content/examenes/ep-20181124.yaml#L191) |

### Parcial, primer cuatrimestre de 2019

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | $\max P(\text{decisión incorrecta})$ | `3/20` | = 0,15 | verificado | [ep-20190601.yaml:31](../content/examenes/ep-20190601.yaml#L31) |
| Ej. 2 | (a) | $P(8 < X + Y < 12)$ | `9/25` | = 0,36 | verificado | [ep-20190601.yaml:71](../content/examenes/ep-20190601.yaml#L71) |
| Ej. 3 | (a) | $P(E[X \mid Y] > 4/3)$ | `3/4` | = 0,75 | verificado | [ep-20190601.yaml:108](../content/examenes/ep-20190601.yaml#L108) |
| Ej. 4 | (a) | $P(N(2) \ge 1 \mid N_A(5) = 2)$ | `1 - 9/25 * exp(-7/6)` | ≈ 0,8879 | verificado | [ep-20190601.yaml:151](../content/examenes/ep-20190601.yaml#L151) |
| Ej. 5 | (a) | $P(\text{más de 170 duran menos de 40 días})$ | `1/2 - erf(41*sqrt(210)/420)/2` | ≈ 0,02272 | verificado | [ep-20190601.yaml:192](../content/examenes/ep-20190601.yaml#L192) |

### Primer recuperatorio, primer cuatrimestre de 2019

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | $P(\text{primera vacía} \mid \text{3 en la última})$ | `1/4` | = 0,25 | verificado | [ep-20190615.yaml:30](../content/examenes/ep-20190615.yaml#L30) |
| Ej. 3 | (a) | $p_{Y \mid Y > 0}(3)$ | `5/8` | = 0,625 | verificado | [ep-20190615.yaml:84](../content/examenes/ep-20190615.yaml#L84) |
| Ej. 3 | (a) | $p_{Y \mid Y > 0}(4)$ | `3/8` | = 0,375 | verificado | [ep-20190615.yaml:86](../content/examenes/ep-20190615.yaml#L86) |
| Ej. 4 | (a) | $E[\text{tiempo hasta el cuarto Select}]$ | `55` |  | verificado | [ep-20190615.yaml:127](../content/examenes/ep-20190615.yaml#L127) |
| Ej. 5 | (a) | $\text{pallets}$ | `35` |  | **discrepancia** | [ep-20190615.yaml:168](../content/examenes/ep-20190615.yaml#L168) |

### Parcial (parte 2), segundo cuatrimestre de 2021

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | $P(\operatorname{var}(X \mid Y) > 2)$ | `1 - 7*exp(-2)` | ≈ 0,05265 | verificado | [ep-20211113.yaml:28](../content/examenes/ep-20211113.yaml#L28) |
| Ej. 2 | (a) | $P(\text{más de 27 sin fallas})$ | `29 * (41/47)^28 * (6/47) + (41/47)^29` | ≈ 0,0999 | verificado | [ep-20211113.yaml:72](../content/examenes/ep-20211113.yaml#L72) |
| Ej. 3 | (a) | $\text{umbral}$ | `199.48` |  | **discrepancia** | [ep-20211113.yaml:114](../content/examenes/ep-20211113.yaml#L114) |

### Parcial, primer cuatrimestre de 2023

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | la opción correcta | No. $P(D \cap M) = 0{,}5$ y $P(D)\,P(M) = 0{,}48$. |  | verificado | [ep-20230527.yaml:37](../content/examenes/ep-20230527.yaml#L37) |
| Ej. 2 | (a) | la opción correcta | $X(1) = 1$, $X(2) = 0$ y $X(\omega) = -2$ para $\omega \in \{3, 4, 5, 6\}$. |  | verificado | [ep-20230527.yaml:98](../content/examenes/ep-20230527.yaml#L98) |
| Ej. 3 | (a) | $F_W(4)$ | `0` |  | verificado | [ep-20230527.yaml:157](../content/examenes/ep-20230527.yaml#L157) |
| Ej. 3 | (a) | $F_W(20)$ | `1/4` | = 0,25 | verificado | [ep-20230527.yaml:159](../content/examenes/ep-20230527.yaml#L159) |
| Ej. 3 | (a) | $F_W(80)$ | `3/4` | = 0,75 | verificado | [ep-20230527.yaml:161](../content/examenes/ep-20230527.yaml#L161) |
| Ej. 4 | (a) | $P(\text{más Enanos que Hobbits})$ | `1817344/4782969` | ≈ 0,38 | **discrepancia** | [ep-20230527.yaml:202](../content/examenes/ep-20230527.yaml#L202) |
| Ej. 5 | (a) | $P(\text{peso} > \text{resistencia})$ | `1/2 - erf(20*sqrt(498)/249)/2` | ≈ 0,005624 | verificado | [ep-20230527.yaml:253](../content/examenes/ep-20230527.yaml#L253) |

### Parcial (primera fecha), primer cuatrimestre de 2025

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | $P(\text{blanca y verde} \mid \text{luego dos iguales})$ | `15/61` | ≈ 0,2459 | verificado | [ep-20250524.yaml:31](../content/examenes/ep-20250524.yaml#L31) |
| Ej. 2 | (a) | $P(E(Y \mid X) < 10)$ | `sqrt(5)/2 - 1` | ≈ 0,118 | verificado | [ep-20250524.yaml:75](../content/examenes/ep-20250524.yaml#L75) |
| Ej. 3 | (a) | $F_W(1/2)$ | `1/3` | ≈ 0,3333 | verificado | [ep-20250524.yaml:118](../content/examenes/ep-20250524.yaml#L118) |
| Ej. 3 | (a) | $F_W(1)$ | `2/3` | ≈ 0,6667 | verificado | [ep-20250524.yaml:120](../content/examenes/ep-20250524.yaml#L120) |
| Ej. 3 | (a) | $F_W(3/2)$ | `5/6` | ≈ 0,8333 | verificado | [ep-20250524.yaml:122](../content/examenes/ep-20250524.yaml#L122) |
| Ej. 4 | (a) | $P(N(6) = 1 \mid N(60) = 14)$ | `14 * 9^13 / 10^14` | ≈ 0,3559 | verificado | [ep-20250524.yaml:162](../content/examenes/ep-20250524.yaml#L162) |
| Ej. 5 | (a) | $\text{monto}$ | `5115251.67` |  | verificado | [ep-20250524.yaml:206](../content/examenes/ep-20250524.yaml#L206) |

### Parcial (segunda fecha), primer cuatrimestre de 2025

| Ejercicio | Ítem | Qué se calcula | Valor | Decimal | Estado | Dónde |
|---|---|---|---|---|---|---|
| Ej. 1 | (a) | $P(\text{hasta 1 defectuosa} \mid \text{rechazada})$ | `6/11` | ≈ 0,5455 | verificado | [ep-20250614.yaml:34](../content/examenes/ep-20250614.yaml#L34) |
| Ej. 2 | (a) | $E[\text{rojas extraídas}]$ | `9/5` | = 1,8 | verificado | [ep-20250614.yaml:76](../content/examenes/ep-20250614.yaml#L76) |
| Ej. 3 | (a) | $F_W(1/3)$ | `1/3` | ≈ 0,3333 | verificado | [ep-20250614.yaml:118](../content/examenes/ep-20250614.yaml#L118) |
| Ej. 3 | (a) | $F_W(3/4)$ | `3/4` | = 0,75 | verificado | [ep-20250614.yaml:120](../content/examenes/ep-20250614.yaml#L120) |
| Ej. 3 | (a) | $F_W(3/2)$ | `1` |  | verificado | [ep-20250614.yaml:122](../content/examenes/ep-20250614.yaml#L122) |
| Ej. 4 | (a) | $P(\text{7 o más correos})$ | `1 - 65/2 * exp(-7)` | ≈ 0,9704 | verificado | [ep-20250614.yaml:163](../content/examenes/ep-20250614.yaml#L163) |
| Ej. 5 | (a) | $\text{seguidores}$ | `1134` |  | verificado | [ep-20250614.yaml:207](../content/examenes/ep-20250614.yaml#L207) |
