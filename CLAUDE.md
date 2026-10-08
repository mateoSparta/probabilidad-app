# Contexto
App local para estudiar Probabilidad (FIUBA) con guías gamificadas. Ver PLAN.md.

# Reglas
- Todo el contenido y la UI en español rioplatense neutro.
- La materia es PyE B (61.09/81.04, CB003). Nada de la cursada de Industrial: sin simulación, sin R, sin exámenes *-ProbIND.
- Nunca inventar un resultado: cada `valor` debe venir de una resuelta Y/O de un script en tools/verify/. Si no coinciden, estado `discrepancia` y entrada en revision/.
- No incluir demostraciones ni ejercicios Ï.
- Contenido = datos. No hardcodear ejercicios en src/.
- Correr `npm run check` y `npm run build` antes de dar una tarea por terminada.
- Pistas: graduadas, la última es un plan sin cuentas. Nunca la resolución completa.
- Fuentes en fuentes/ son de solo lectura.

# Entorno
- Windows (PowerShell). Claude Code ejecuta comandos vía Git Bash.
- Scripts de tools/ en Python o Node, nunca en bash.
- PDFs: usar pymupdf (fitz) para rasterizar y extraer texto; no hay Poppler.
- Rutas con espacios ("Mateo Sparta"): siempre entre comillas.