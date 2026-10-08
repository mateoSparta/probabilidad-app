# Probabilidad y Estadística B — app de estudio

App local para estudiar PyE B (FIUBA 61.09 / 81.04 / CB003) con las guías de
la cátedra. La teoría se presenta como skills que se desbloquean resolviendo
ejercicios, y el panel muestra el estado de cada uno para encontrar los puntos
flojos.

El diseño está en [PLAN.md](PLAN.md), las convenciones en
[CLAUDE.md](CLAUDE.md) y cómo publicarla en [DEPLOY.md](DEPLOY.md).

## Arrancar

```bash
npm install
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt   # pipeline de contenido
npm run dev
```

En Windows, los scripts de Python se invocan por los scripts de npm, así que
no hace falta activar el venv a mano.

## Qué hay hoy

| | |
|---|---|
| Guía 1 | 14 ejercicios, 40 ítems, 12 skills, 9 bloques de teoría |
| Guías 2–8 | borradores extraídos, sin cargar |
| Simulacro | motor completo; 2 parciales con 1 ejercicio verificado cada uno |
| Progreso | log de intentos, estados de skill, insignias, export/import |

Los 44 valores numéricos del contenido están verificados y el build los
contrasta en cada corrida.

Lo que falta, con el detalle de cada cosa:
[revision/guia-1.md](revision/guia-1.md),
[revision/examenes.md](revision/examenes.md) y
[revision/inventario.md](revision/inventario.md).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run check` | typecheck + validador de contenido + smoke + render-check |
| `npm run build` | `check` y después el bundle |
| `npm run extraer` | PDF de las guías → borradores en `content/.borrador/` |
| `npm run inventario` | regenera `revision/inventario.md` |
| `npm run verificar` | corre los modelos de `tools/verify/` y reconcilia |
| `npm run verificar -- g1-22` | sólo un ejercicio |
| `npm run rasterizar -- fuentes/resueltas/guia-1` | escaneos → PNG para leerlos |

`npm run check` es el que hay que correr antes de dar algo por terminado.
Incluye tres cosas que el typecheck no cubre: el validador de contenido
(§4.7 del plan), un smoke test del motor contra el contenido real, y un
render de la app con Vite en modo SSR que verifica que la página se dibuje.

## Cómo está armado

Tres capas, con una frontera dura: **`content/` es la única interfaz entre el
pipeline de contenido y la app.**

```
tools/extract/   PDF → borrador YAML. Determinista. Su salida no se edita a mano.
tools/verify/    cada ejercicio declara un modelo; se resuelve exacto y por
                 Monte Carlo, y los dos tienen que coincidir.
content/         el contenido, como datos.
src/             renderer puro. No sabe nada de ningún ejercicio.
```

El estado del alumno (`localStorage`) queda aparte de todo eso.

## Agregar un ejercicio

1. Buscalo en `content/.borrador/guia-N.yaml`: el enunciado ya está traducido
   a LaTeX. Si el borrador tiene un campo `revisar`, mirá eso primero.
2. Escribí su modelo en `tools/verify/gN_MM.py`, con `exacto()` y `estimado()`.
   Las claves tienen que coincidir con los ids de los ítems (y con `a1`, `a2`…
   para los checkpoints del ítem `a`), porque es así como el validador
   contrasta los valores.
3. `npm run verificar` — si el exacto y el Monte Carlo no coinciden, el modelo
   está mal; no lo cargues.
4. Escribí `content/guias/guia-N/ejercicios/gN-MM.yaml` con los valores que
   salieron del paso 3, sus skills y sus pistas.
5. Agregalo a la secuencia en `guia.yaml`.
6. `npm run check`.

Nunca escribas un valor a mano: el build lo compara contra
`content/.verificacion/resultados.json` y falla si no coinciden. Es la red que
sostiene la regla de CLAUDE.md de no inventar resultados.

## Las fuentes

`fuentes/` es de solo lectura. Dos cosas que conviene saber:

- **Los PDF de las guías tienen capa de texto**, pero con un mapeo
  glifo→Unicode no estándar: el texto crudo sale ilegible. `tools/extract/`
  lo decodifica (ver §4.8 del plan).
- **Las resueltas son escaneos sin capa de texto**: 339 páginas que hay que
  mirar a ojo. Es el costo dominante del proyecto.
