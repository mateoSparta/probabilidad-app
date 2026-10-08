# -*- coding: utf-8 -*-
"""
Corre todos los modelos de verificacion y emite el reporte (PLAN.md seccion 7,
pasos 4 y 5).

Cada modulo gN_MM.py declara un modelo del ejercicio y lo resuelve por dos
caminos independientes: exacto (conteo o simbolico) y Monte Carlo. Si los dos
coinciden, el valor sirve para el contenido. Si no, es un error del modelo y
hay que mirarlo antes de cargar nada.

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


def modelos(filtro: str | None) -> list[str]:
    nombres = sorted(
        p.stem for p in AQUI.glob("g*_*.py") if not p.stem.startswith("_")
    )
    if filtro:
        clave = filtro.replace("-", "_")
        nombres = [n for n in nombres if n == clave]
    return nombres


def como_texto(v) -> str:
    if isinstance(v, Fraction):
        return str(v.numerator) if v.denominator == 1 else f"{v.numerator}/{v.denominator}"
    return str(v)


def main() -> int:
    filtro = sys.argv[1] if len(sys.argv) > 1 else None
    nombres = modelos(filtro)
    if not nombres:
        print(f"  no hay modelos que coincidan con {filtro!r}")
        return 1

    resultados: dict[str, dict] = {}
    fallas = 0

    for nombre in nombres:
        mod = importlib.import_module(nombre)
        ident = getattr(mod, "ID", nombre.replace("_", "-"))
        exactos = mod.exacto()
        estimados = mod.estimado()
        tol = getattr(mod, "TOLERANCIA", 0.005)

        print(f"\n  {ident}  ({getattr(mod, 'NUMERO', '?')})")
        items: dict[str, dict] = {}
        for clave, valor in exactos.items():
            txt = como_texto(valor)
            fila: dict = {"valor": txt, "metodo": "exacto"}

            if clave in estimados and isinstance(valor, Fraction):
                est = estimados[clave]
                dif = abs(float(valor) - est)
                coincide = dif <= tol
                fila["montecarlo"] = round(est, 6)
                fila["metodo"] = "exacto+montecarlo"
                fila["coincide"] = coincide
                marca = "ok " if coincide else "NO "
                if not coincide:
                    fallas += 1
                print(f"    {marca} {clave:8s} {txt:>14s} = {float(valor):.6f}   mc {est:.6f}  dif {dif:.6f}")
            else:
                print(f"    --  {clave:8s} {txt}   (sin Monte Carlo)")

            items[clave] = fila
        resultados[ident] = {"numero": getattr(mod, "NUMERO", None), "items": items}

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
