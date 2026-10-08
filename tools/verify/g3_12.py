# -*- coding: utf-8 -*-
"""
Ejercicio 3.12 — E[X sen(XY)] con X, Y uniformes e independientes en (0, pi).

Es una esperanza de una funcion de dos variables: se integra la funcion contra
la densidad conjunta, que por independencia es el producto de las marginales y
vale 1/pi^2 en el cuadrado.

No hay nada raro mas alla de integrar con cuidado. El valor exacto queda en
terminos de sen(pi^2), que no es un numero lindo: conviene no asustarse.
"""
from __future__ import annotations

import math
import random

import sympy as sp

from comun import TOL_MONTECARLO

ID = "g3-12"
NUMERO = "3.12"

x, y = sp.symbols("x y", positive=True)
DENSIDAD = 1 / sp.pi**2


def exacto() -> dict[str, sp.Expr]:
    assert sp.integrate(DENSIDAD, (y, 0, sp.pi), (x, 0, sp.pi)) == 1
    valor = sp.integrate(
        sp.integrate(x * sp.sin(x * y) * DENSIDAD, (y, 0, sp.pi)), (x, 0, sp.pi)
    )
    return {"a": sp.simplify(valor)}


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    total = 0.0
    for _ in range(n):
        xi = rng.uniform(0, math.pi)
        yi = rng.uniform(0, math.pi)
        total += xi * math.sin(xi * yi)
    return {"a": total / n}


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    v = exacto()["a"]
    print(f"  E[X sen(XY)] = {v} = {float(v):.6f}")
