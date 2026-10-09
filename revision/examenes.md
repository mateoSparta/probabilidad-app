# Revisión de los exámenes

Estado del modo simulacro (PLAN.md §6).

El motor está completo: pool, timer configurable, toggles, entrega, nota de
0 a 10 y veredicto con el criterio de la cátedra. Lo que falta es **contenido**,
y falta porque los ejercicios 2 a 5 de los parciales son de las guías 2 a 8.

---

## 1. Qué se puede rendir hoy

| Examen | Ejercicios | Rendibles | Qué cubre lo rendible |
|---|---|---|---|
| Parcial 24-05-2025 | 5 | **1** | Bayes sobre extracciones en cadena (guía 1) |
| Parcial 14-06-2025 | 5 | **1** | Bayes con tres causas y conteo hipergeométrico (guía 1) |

Los dos ejercicios cargados están verificados por exacto + Monte Carlo:

- 24-05 ej 1 → $15/61$ (`tools/verify/ep20250524_1.py`). Control a mano:
  $45/183 = 15/61$.
- 14-06 ej 1 → $6/11$, con $P(\text{rechazo}) = 11/45$ como control
  (`tools/verify/ep20250614_1.py`).

Como el examen va recortado, **la nota se reescala sobre los ejercicios
presentados y el veredicto se marca parcial**. Es el mecanismo que PLAN.md §6
ya preveía para las integradoras hasta que lleguen las guías 9–12; acá se usa
el mismo. La app lo dice en pantalla, así que no hay forma de confundir un
"aprobaría" sobre un ejercicio con uno sobre cinco.

La decisión de fondo: antes un examen corto que un valor inventado. Un
ejercicio entra al pool sólo si tiene ítems con respuesta verificada, y el
validador falla si un ejercicio dice `cargado: true` sin ítems o al revés.

## 2. Qué falta, por examen

Los enunciados de los 10 ejercicios están transcriptos en
`content/examenes/*.yaml`, así que cargarlos es escribir sus ítems y su modelo
de verificación, no transcribir.

| Examen | Ej | Guías | Qué hace falta |
|---|---|---|---|
| 24-05 | 2 | 5 | Esperanza condicional. **Tiene variantes por curso**: Curso 4 pide $E(Y\mid X=3)$, los otros $P(E(Y\mid X) < 10)$. Hay que definir el campo `curso` en la configuración (PLAN.md §6) y elegir la variante |
| 24-05 | 3 | 2, 4 | Conjunta uniforme y distribución de $W = \lvert Y - X\rvert$. Va como `checkpoints` |
| 24-05 | 4 | 7 | Poisson: superposición y condicionamiento a $N(t)=n$ |
| 24-05 | 5 | 8 | TCL. **El enunciado quedó cortado** en la transcripción: hay que completarlo del PDF |
| 14-06 | 2 | 3, 6 | Esperanza de una mezcla de hipergeométrica y binomial |
| 14-06 | 3 | 2, 4 | Igual que el 3 del 24-05, con otra región |
| 14-06 | 4 | 7 | Poisson: adelgazamiento |
| 14-06 | 5 | 8 | TCL, hallar el $n$ mínimo |

## 3. Exámenes que todavía no se cargaron

### 3.1 Las tres integradoras de PyE B

`EI_20250710-PyE-B.pdf`, `EI-20250717-PyE-B.pdf`, `EI-20250807-PyE-A-B.pdf`.
Son de una página y con capa de texto limpia. Según PLAN.md §6 los ejercicios
1–3 están en alcance y el 4 y el 5 son de estadística (guías 9–12). El toggle
"Incluir integradoras" ya existe en la app y el pool las va a tomar en cuanto
tengan un ejercicio verificado.

### 3.2 Los dos `*-ProbIND`

`EI-20250717-ProbIND.pdf` y `EI-20250807-ProbIND.pdf` quedan **excluidos**: son
de la cursada de Industrial.

**Cuidado con el filtro.** Los parciales comunes traen las tres materias en el
encabezado:

```
PROBABILIDAD - 81.16 CB004
PROBABILIDAD y ESTADÍSTICA A - 61.06 81.03
PROBABILIDAD y ESTADÍSTICA B - 61.09 81.04 CB003
```

Así que el filtro por encabezado **no alcanza**: hay que filtrar por ejercicio
y por variante, no por archivo. Por eso el esquema tiene `guias` y
`en_alcance` en cada ejercicio y no en el examen.

### 3.3 Los 12 parciales resueltos de 2017–2023

`fuentes/examenes/parciales/` tiene 12 parciales **con resolución**, y 11 con
capa de texto (sólo el `01` está escaneado). PLAN.md no los menciona. Son la
oportunidad más barata que queda:

- amplían el pool de simulacro de 2 exámenes a 14;
- traen la resolución, así que sirven de **verificación cruzada** para los
  valores que hoy sólo tienen cálculo independiente;
- la transcripción es casi gratis porque hay capa de texto.

Lo que hay que confirmar antes: que los temas de 2017–2018 sigan dentro del
programa actual de PyE B.

## 4. Pendiente de diseño

- **El campo `curso`.** PLAN.md §6 dice que se carga la variante que
  corresponde al curso de Mateo, definido en la configuración. El esquema ya
  tiene `variante` por ejercicio, pero la configuración todavía no tiene
  `curso` ni la app elige por él: hace falta recién cuando se cargue el ej 2
  del 24-05, que es el único con variantes hasta ahora.
- **Reintentar un simulacro.** Hoy se puede abandonar y empezar otro, pero el
  intento por ítem por día sigue valiendo, así que rendir el mismo examen dos
  veces en el día no vuelve a contar para las insignias. Es lo que dice §5 y
  probablemente sea lo correcto, pero conviene confirmarlo cuando el pool sea
  más grande.
