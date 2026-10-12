# -*- coding: utf-8 -*-
"""
Corre todos los modelos de verificacion y emite el reporte (PLAN.md seccion 7,
pasos 4 y 5).

Cada modulo gN_MM.py declara un modelo del ejercicio y lo resuelve por dos
caminos independientes: exacto (conteo o simbolico) y Monte Carlo. Si los dos
coinciden, el valor sirve para el contenido. Si no, es un error del modelo y
hay que mirarlo antes de cargar nada.

Un modulo de examen (epAAAAMMDD.py) declara en cambio una lista EJERCICIOS,
con un modelo por ejercicio. La clave de cada uno es `<ID_EXAMEN>-<numero>`,
que es la que busca tools/check.ts.

La salida va a content/.verificacion/resultados.json, que es lo que compara
tools/check.ts contra los valores del YAML: asi un valor que se tocó a mano
sin recalcular hace fallar el build.

Uso:  npm run verificar
      npm run verificar -- g1-04        (un solo ejercicio)
"""
from __future__ import annotations

import importlib
import json
import sys
from fractions import Fraction
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
SALIDA = RAIZ / "content" / ".verificacion" / "resultados.json"

sys.path.insert(0, str(AQUI))


#  Los modulos de infraestructura no son modelos.
NO_SON_MODELOS = {"comun", "runner", "tablas", "distribuciones"}


def modelos(filtro: str | None) -> list[str]:
    nombres = sorted(
        p.stem
        for p in AQUI.glob("*.py")
        if not p.stem.startswith("_") and p.stem not in NO_SON_MODELOS
    )
    if filtro:
        clave = filtro.replace("-", "_")
        # Los de examen se piden como ep-20171028 y el modulo es ep20171028.
        nombres = [n for n in nombres if n in (clave, filtro.replace("-", ""))]
    return nombres


def modelos_de(mod, nombre: str):
    """
    (ident, numero, exacto, estimado, tolerancia) de cada modelo del modulo:
    uno solo en los de guia, uno por ejercicio en los de examen.
    """
    if hasattr(mod, "EJERCICIOS"):
        for ej in mod.EJERCICIOS:
            yield f"{mod.ID_EXAMEN}-{ej.numero}", ej.numero, ej.exacto, ej.estimado, ej.tolerancia
        return
    yield (
        getattr(mod, "ID", nombre.replace("_", "-")),
        getattr(mod, "NUMERO", None),
        mod.exacto,
        mod.estimado,
        getattr(mod, "TOLERANCIA", 0.005),
    )


def como_texto(v) -> str:
    """
    El valor tal como va al YAML. Tiene que quedar en una sintaxis que math.js
    entienda, porque tools/check.ts lo evalua con math.js para contrastarlo
    contra el contenido: de ahi el `**` -> `^`.
    """
    if isinstance(v, Fraction):
        return str(v.numerator) if v.denominator == 1 else f"{v.numerator}/{v.denominator}"
    return str(v).replace("**", "^")


def como_numero(v):
    """El valor como float, o None si no es un escalar."""
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def main() -> int:
    filtro = sys.argv[1] if len(sys.argv) > 1 else None
    nombres = modelos(filtro)
    if not nombres:
        print(f"  no hay modelos que coincidan con {filtro!r}")
        return 1

    resultados: dict[str, dict] = {}
    fallas = 0

    modelos_a_correr = [
        m for nombre in nombres for m in modelos_de(importlib.import_module(nombre), nombre)
    ]
    for ident, numero, f_exacto, f_estimado, tol in modelos_a_correr:
        exactos = f_exacto()
        estimados = f_estimado()

        print(f"\n  {ident}  ({numero if numero is not None else '?'})")
        items: dict[str, dict] = {}
        for clave, valor in exactos.items():
            txt = como_texto(valor)
            fila: dict = {"valor": txt, "metodo": "exacto"}

            exacto_num = como_numero(valor)
            if clave in estimados and exacto_num is not None:
                est = estimados[clave]
                dif = abs(exacto_num - est)
                coincide = dif <= tol
                fila["montecarlo"] = round(est, 6)
                fila["metodo"] = "exacto+montecarlo"
                fila["coincide"] = coincide
                marca = "ok " if coincide else "NO "
                if not coincide:
                    fallas += 1
                print(
                    f"    {marca} {clave:10s} {txt:>22s} = {exacto_num:.6f}"
                    f"   mc {est:.6f}  dif {dif:.6f}"
                )
            else:
                print(f"    --  {clave:10s} {txt}   (sin Monte Carlo)")

            items[clave] = fila
        resultados[ident] = {"numero": numero, "items": items}

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(
        json.dumps(resultados, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"\n  escrito {SALIDA.relative_to(RAIZ)}")

    if fallas:
        print(f"\n  {fallas} valor(es) donde el exacto y el Monte Carlo NO coinciden.")
        print("  Es un error del modelo: revisarlo antes de cargar el contenido.")
        return 1
    print("  exacto y Monte Carlo coinciden en todo.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
