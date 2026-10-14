# Probabilidad y Estadística B — app de estudio

App local para estudiar PyE B (FIUBA 61.09 / 81.04 / CB003) con las guías de
la cátedra. La teoría se presenta como skills que se desbloquean resolviendo
ejercicios, y el panel muestra el estado de cada uno para encontrar los puntos
flojos.

## Arrancar

```bash
npm install
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt   # pipeline de contenido
npm run dev
```

En Windows, los scripts de Python se invocan por los scripts de npm, así que
no hace falta activar el venv a mano.

## Para el docente

Para cambiar las fechas de los exámenes, corregir un resultado o cargar
ejercicios sin programar, ver **[DOCENTE.md](DOCENTE.md)**. Las plantillas
para copiar están en [plantillas/](plantillas/), y todos los resultados, en
un solo listado, en [revision/resultados.md](revision/resultados.md).

## Contenido

| Guías 1 a 8 | **71 ejercicios, 163 ítems, 46 habilidades, 33 bloques de teoría** |
| Simulacro | motor completo; 14 exámenes con 65 ítems |
| Progreso | log de intentos, estados de skill, insignias, export/import |
| Persistencia | todo en `localStorage`, sin servidor |
| Navegación | mapa de círculos por ejercicio, índice de temas al costado |
| Ritmo | días hasta el parcial y cuántos ítems por día hacen falta para llegar |

Los **324 resultados** del contenido están listados en
[revision/resultados.md](revision/resultados.md): 321 están verificados por
dos caminos independientes (la resolución de la cátedra y un cálculo propio
en `tools/verify/`), y 3 son discrepancias documentadas. El build los
contrasta en cada corrida.

Está cargado el núcleo recomendado por la cátedra (los ejercicios marcados `!`
en la guía) de las ocho guías.

**Machete para el examen.** Todo lo que se imprime (o se guarda en PDF) está
en la sección Machete, en tres pestañas: la hoja de fórmulas, las tablas de la
cátedra (normal, $t$ y $\chi^2$) y la teoría de las distribuciones. Al lado,
un kit para el examen con todo junto. Las tablas las genera y verifica
`tools/verify/tablas.py`; ver [revision/formulas.md](revision/formulas.md).

**Distribuciones.** Las 19 distribuciones de la tabla de la cátedra, cada una
con una calculadora (los valores se escriben en la fórmula o se arrastran sus
líneas sobre el gráfico) y, plegadas, su ficha y tips para la intuición. Cada
cuenta se contrasta con mpmath y con las tablas. La teoría de las
distribuciones se imprime desde el Machete; ver
[revision/distribuciones.md](revision/distribuciones.md).