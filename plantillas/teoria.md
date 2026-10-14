---
# PLANTILLA · Bloque de teoría
#
# Cada guía alterna bloques de teoría y ejercicios. Un bloque es un texto
# breve (no más de unas 250 palabras) que se lee antes de los ejercicios
# que lo practican.
#
# Cómo usarla (detalle en DOCENTE.md, "Agregar un bloque de teoría"):
#   1. Copiar este archivo a content/guias/guia-N/teoria/ con el nombre de su
#      id: t-mi-tema.md.
#   2. Reemplazar el ejemplo. Las líneas que empiezan con # son explicaciones
#      y se pueden borrar.
#   3. Agregar `- teoria: t-mi-tema` en content/guias/guia-N/guia.yaml, antes
#      de los ejercicios que lo practican.
#   4. Correr `npm run check`. Cada habilidad del bloque tiene que estar
#      evaluada por algún ítem.
id: t-mi-tema               # igual al nombre del archivo, sin .md
skills: [inclusion-exclusion]   # las habilidades que presenta
---
## Título del bloque

El texto admite fórmulas en línea, como $P(A^c) = 1 - P(A)$, y en su propio
renglón:

$$P(A \cup B) = P(A) + P(B) - P(A \cap B).$$

También admite **negrita** y listas:

- un punto de la lista;
- otro punto, con una fórmula $P(\emptyset) = 0$.
