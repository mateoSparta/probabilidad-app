# Inventario del material

Generado por `tools/extract/inventario.py`. No editar a mano:
correr `npm run extraer && npm run inventario`.

## Guias: ejercicios y alcance

| Guia | Ejercicios | Simulacion | Demostracion* | En alcance | Items en alcance | Nucleo recomendado |
|---|---|---|---|---|---|---|
| 1 | 42 | 3 | 7 | 39 | 104 | **13 ej / 34 it** |
| 2 | 40 | 3 | 5 | 37 | 87 | **10 ej / 27 it** |
| 3 | 36 | 2 | 9 | 34 | 73 | **12 ej / 33 it** |
| 4 | 28 | 1 | 1 | 27 | 63 | **7 ej / 22 it** |
| 5 | 33 | 1 | 2 | 32 | 57 | **11 ej / 17 it** |
| 6 | 25 | 0 | 1 | 25 | 40 | **7 ej / 10 it** |
| 7 | 26 | 0 | 0 | 26 | 50 | **7 ej / 20 it** |
| 8 | 26 | 2 | 1 | 24 | 26 | **8 ej / 8 it** |
| 9 | 15 | 0 | 11 | 15 | 33 | **6 ej / 15 it** |
| 10 | 22 | 0 | 1 | 22 | 35 | **7 ej / 15 it** |
| 11 | 15 | 0 | 0 | 15 | 18 | **4 ej / 6 it** |
| 12 | 13 | 0 | 2 | 13 | 24 | **5 ej / 12 it** |

**Totales:** 321 ejercicios, 12 de simulacion, 610 items en alcance. Nucleo recomendado por la catedra: 97 ejercicios / 219 items.

\* La columna de demostracion es una heuristica por verbo (`mostrar`, `probar`, `verificar`...). Sobreestima: hay que confirmar cada caso al promover el ejercicio.

### Ejercicios excluidos por simulacion

- Guia 1: 1.11, 1.12, 1.34
- Guia 2: 2.11, 2.15, 2.29
- Guia 3: 3.31, 3.35
- Guia 4: 4.17
- Guia 5: 5.25
- Guia 8: 8.8, 8.24

## Temas por guia

| Guia | Temas |
|---|---|
| 1 | Algebras de eventos, conteo y Laplace, probabilidad geometrica, condicional, probabilidad total, Bayes, independencia |
| 2 | Variable aleatoria, funcion de distribucion, discretas/continuas/mixtas, truncamiento, vectores, conjunta y marginales |
| 3 | Esperanza, esperanza condicional a un evento, varianza, covarianza, momentos |
| 4 | Transformaciones, metodo de la F, cambio de variable, jacobiano, minimo y maximo, competencia de exponenciales |
| 5 | Distribuciones condicionales, mezclas, Bayes para mezclas, esperanza y varianza totales |
| 6 | Bernoulli, binomial, geometrica, Pascal, multinomial, hipergeometrica, perdida de memoria |
| 7 | Proceso de Poisson: incrementos, tiempos de espera, superposicion, adelgazamiento, Poisson compuesto |
| 8 | Normal, teorema central del limite, aproximaciones |
| 9 | Estadistica (fuera de v1) |
| 10 | Estadistica (fuera de v1) |
| 11 | Estadistica (fuera de v1) |
| 12 | Estadistica (fuera de v1) |

## Resueltas disponibles

Todas son escaneos sin capa de texto: hay que rasterizarlas y leerlas (`npm run rasterizar -- fuentes/resueltas/guia-N`). Es el costo dominante del pipeline.

| Guia | Archivos | Paginas | Tipo |
|---|---|---|---|
| 1 | GUIA 1 RES 1, GUIA 1 RES 2, GUIA 1 RES 3 | 64 | escaneado |
| 2 | GUIA 2 RES 1, GUIA 2 RES 2, GUIA 2 SAN | 67 | escaneado |
| 3 | GUIA 3 RES 1, GUIA 3 RES 2, GUIA 3 RES 3 | 75 | escaneado |
| 4 | GUIA 4 RES 2, GUIA 4 RES 3, GUIA 4 RES 4 | 71 | escaneado |
| 5 | GUIA 5 RES 2, GUIA 5 RES 3 | 37 | escaneado |
| 6 | GUIA 6 RES 2, GUIA 6 RES 3 | 39 | escaneado |
| 7 | GUIA 7 RES 2, GUIA 7 RES 3 | 26 | escaneado |
| 8 | GUIA 8 RES 3 | 22 | escaneado |
| 9 | — | 0 | sin resueltas |
| 10 | — | 0 | sin resueltas |
| 11 | — | 0 | sin resueltas |
| 12 | — | 0 | sin resueltas |

**Total a leer visualmente: 401 paginas.**

## Examenes

### Parciales e integradoras 2025 (`fuentes/examenes/finales/`)

Una pagina cada uno y con capa de texto limpia: transcripcion trivial. Los `*-ProbIND` son de la cursada de Industrial y quedan excluidos, pero cuidado: los parciales comunes traen las tres materias en el encabezado, asi que el filtro va por ejercicio y variante, no por archivo.

| Archivo | Paginas | Capa de texto |
|---|---|---|
| EI-20250717-ProbIND | 1 | texto |
| EI-20250717-PyE-B | 1 | texto |
| EI-20250807-ProbIND | 1 | texto |
| EI-20250807-PyE-A-B | 1 | texto |
| EI_20250710-PyE-B | 1 | texto |
| EP_20250524 | 1 | texto |
| EP_20250614 | 1 | texto |

### Parciales resueltos 2017-2023 (`fuentes/examenes/parciales/`)

No figuran en PLAN.md. Traen enunciado **y** resolucion, y casi todos tienen capa de texto: son material de verificacion cruzada casi gratis. Hay que confirmar que los temas de 2017-2018 sigan dentro del programa.

| Archivo | Paginas | Capa de texto |
|---|---|---|
| 01 Parcial Resuelto - 27_05_2023 | 6 | escaneado |
| 02 Parcial Resuelto - EP20190615Res | 8 | texto |
| 03 Parcial Resuelto - EP20190601Res | 11 | texto |
| 04 Parcial Resuelto - EP20181124Res | 11 | texto |
| 05 Parcial Resuelto - EP20181103Res | 11 | texto |
| 06 Parcial Resuelto - EP20180616Res | 8 | texto |
| 07 Parcial Resuelto - EP20180526Res | 6 | texto |
| 08 Parcial Resuelto - EP20171214Res | 9 | texto |
| 09 Parcial Resuelto - EP20171207Res | 7 | texto |
| 10 Parcial Resuelto - EP20171118Res | 7 | texto |
| 11 Parcial Resuelto - EP20171028Res | 5 | texto |
| 12 Parcial Resuelto - EP 20211113Res | 5 | texto |

## Avisos del extractor

Ejercicios cuyo borrador necesita repaso manual antes de promoverse.

| Motivo | Cantidad |
|---|---|
| glifo sin traducir | 40 |
| revisar los limites del operador grande | 22 |
| fraccion incompleta | 16 |
| parece tener items pero no se detectaron | 12 |

<details><summary>Detalle por ejercicio</summary>

| Guia | Ejercicio | Motivo |
|---|---|---|
| 1 | 1.3 | parece tener items pero no se detectaron; revisar los limites del operador grande |
| 1 | 1.7 | revisar los limites del operador grande |
| 1 | 1.8 | parece tener items pero no se detectaron; revisar los limites del operador grande |
| 1 | 1.11 | revisar los limites del operador grande |
| 1 | 1.29 | revisar los limites del operador grande |
| 1 | 1.31 | revisar los limites del operador grande |
| 1 | 1.32 | glifo sin traducir: TeX-mathx:$; glifo sin traducir: TeX-mathx:%; glifo sin traducir: TeX-mathx:&; glifo sin traducir: TeX-mathx:’; fraccion incompleta |
| 1 | 1.33 | revisar los limites del operador grande |
| 1 | 1.34 | revisar los limites del operador grande |
| 2 | 2.7 | parece tener items pero no se detectaron |
| 2 | 2.9 | fraccion incompleta; revisar los limites del operador grande |
| 2 | 2.10 | revisar los limites del operador grande |
| 2 | 2.17 | glifo sin traducir: TeX-mathx:ˆ; glifo sin traducir: TeX-mathx:˙ |
| 2 | 2.18 | glifo sin traducir: TeX-mathx:¯; glifo sin traducir: TeX-mathx:´; parece tener items pero no se detectaron; fraccion incompleta |
| 2 | 2.24 | fraccion incompleta |
| 2 | 2.29 | glifo sin traducir: TeX-mathx:`; glifo sin traducir: TeX-mathx:˘ |
| 2 | 2.31 | parece tener items pero no se detectaron |
| 3 | 3.4 | glifo sin traducir: TeX-mathx:␣ |
| 3 | 3.19 | parece tener items pero no se detectaron |
| 3 | 3.22 | fraccion incompleta |
| 3 | 3.31 | revisar los limites del operador grande |
| 3 | 3.32 | glifo sin traducir: TeX-mathx:“; glifo sin traducir: TeX-mathx:‰; revisar los limites del operador grande |
| 3 | 3.34 | fraccion incompleta; revisar los limites del operador grande |
| 3 | 3.35 | revisar los limites del operador grande |
| 3 | 3.36 | revisar los limites del operador grande |
| 4 | 4.1 | glifo sin traducir: TeX-mathx:␣ |
| 4 | 4.2 | glifo sin traducir: TeX-mathx:`; glifo sin traducir: TeX-mathx:ˇ; glifo sin traducir: TeX-mathx:˘ |
| 4 | 4.9 | glifo sin traducir: TeX-mathx:`; glifo sin traducir: TeX-mathx:˘ |
| 4 | 4.10 | glifo sin traducir: TeX-mathx:ˆ; glifo sin traducir: TeX-mathx:˙; fraccion incompleta |
| 4 | 4.17 | glifo sin traducir: TeX-mathx:a; fraccion incompleta; revisar los limites del operador grande |
| 4 | 4.24 | fraccion incompleta |
| 4 | 4.25 | fraccion incompleta |
| 4 | 4.26 | parece tener items pero no se detectaron |
| 4 | 4.27 | revisar los limites del operador grande |
| 4 | 4.28 | glifo sin traducir: TeX-mathx:`; glifo sin traducir: TeX-mathx:ś; glifo sin traducir: TeX-mathx:˘ |
| 5 | 5.4 | fraccion incompleta |
| 5 | 5.8 | fraccion incompleta |
| 5 | 5.11 | glifo sin traducir: TeX-mathx:`; glifo sin traducir: TeX-mathx:˘ |
| 5 | 5.19 | glifo sin traducir: TeX-mathx:ˆ; glifo sin traducir: TeX-mathx:˙ |
| 5 | 5.27 | parece tener items pero no se detectaron |
| 5 | 5.29 | fraccion incompleta |
| 8 | 8.5 | glifo sin traducir: TeX-mathx:`; glifo sin traducir: TeX-mathx:˘ |
| 8 | 8.8 | glifo sin traducir: TeX-mathx:a; glifo sin traducir: TeX-mathx:¸; glifo sin traducir: TeX-mathx:ˆ; glifo sin traducir: TeX-mathx:˙; glifo sin traducir: TeX-mathx:˜; fraccion incompleta |
| 8 | 8.14 | revisar los limites del operador grande |
| 8 | 8.24 | fraccion incompleta |
| 9 | 9.2 | parece tener items pero no se detectaron |
| 9 | 9.3 | revisar los limites del operador grande |
| 9 | 9.13 | glifo sin traducir: TeX-mathx:`; glifo sin traducir: TeX-mathx:ˆ; glifo sin traducir: TeX-mathx:˘; glifo sin traducir: TeX-mathx:˙; fraccion incompleta; revisar los limites del operador grande |
| 10 | 10.10 | revisar los limites del operador grande |
| 10 | 10.16 | parece tener items pero no se detectaron |
| 11 | 11.5 | revisar los limites del operador grande |
| 11 | 11.9 | parece tener items pero no se detectaron |
| 12 | 12.12 | parece tener items pero no se detectaron |

</details>

