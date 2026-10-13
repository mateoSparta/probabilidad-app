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

## Contenido

| Guías 1 a 8 | **53 ejercicios, 113 ítems, 44 skills, 31 bloques de teoría** |
| Simulacro | motor completo; 2 parciales con 1 ejercicio verificado cada uno |
| Progreso | log de intentos, estados de skill, insignias, export/import |
| Persistencia | todo en `localStorage`, sin servidor |
| Navegación | mapa de círculos por ejercicio, índice de temas al costado |
| Ritmo | días hasta el parcial y cuántos ítems por día hacen falta para llegar |

Los **128 valores numéricos** del contenido están verificados por dos caminos
independientes, y el build los contrasta en cada corrida.

Está cargado el núcleo recomendado por la cátedra (los ejercicios marcados `!`
en la guía) de las ocho guías.

**Machete para el examen.** La sección Machete imprime (o guarda en PDF) la
hoja de fórmulas, las tablas de la cátedra (normal, $t$ y
$\chi^2$) y un kit con todo junto. Las tablas las genera y verifica
`tools/verify/tablas.py`; ver [revision/formulas.md](revision/formulas.md).

**Distribuciones.** Las 19 distribuciones de la tabla de la cátedra, cada una
con una calculadora (los valores se escriben en la fórmula o se arrastran sus
líneas sobre el gráfico) y, plegadas, su ficha y tips para la intuición. Cada
cuenta se contrasta con mpmath y con las tablas. Un botón imprime la tabla de
distribuciones de la cátedra, que también va en el kit; ver
[revision/distribuciones.md](revision/distribuciones.md).