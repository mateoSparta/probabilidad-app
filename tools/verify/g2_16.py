# -*- coding: utf-8 -*-
"""
Ejercicio 2.16 — transformar una exponencial en la T* del 2.12.

X ~ Exp de intensidad 1/2. T* = min(T, 1) con T ~ Exp(1) (Ejercicio 2.12):
F_{T*}(t) = 1 - e^{-t} en [0, 1) y 1 desde t = 1, con un atomo de e^{-1} en 1.

La h no decreciente es h = F_{T*}^{-1} o F_X (la inversa generalizada de
F_{T*} compuesta con F_X): como F_X(x) = 1 - e^{-x/2}, resulta
-ln(1 - F_X(x)) = x/2, y la inversa generalizada corta en 1:

    h(x) = min(x/2, 1)

El enunciado pide "una" funcion; con h no decreciente es unica, y el item lo
aclara. El exacto arma h por la composicion y la evalua; el Monte Carlo
compara la distribucion de h(X) con la de T* sorteada por separado.
"""
from __future__ import annotations

import math
import random

import sympy as sp

from comun import SEMILLA, TOL_MONTECARLO

ID = "g2-16"
NUMERO = "2.16"

PUNTOS = (sp.Rational(3, 10), sp.Rational(7, 10))


def F_inv_Tstar(u):
    """Inversa generalizada de F_{T*}: el menor t con F_{T*}(t) >= u."""
    return sp.Min(-sp.log(1 - u), 1)


def h(x):
    return F_inv_Tstar(1 - sp.exp(-x / 2))


def exacto() -> dict:
    x = sp.symbols("x", positive=True)
    assert sp.simplify(h(x) - sp.Min(x / 2, 1)) == 0 or all(
        sp.simplify(h(sp.Rational(k, 4)) - min(sp.Rational(k, 8), 1)) == 0 for k in range(1, 20)
    )
    salida = {
        "a1": sp.simplify(h(sp.Integer(1))),
        "a2": sp.simplify(h(sp.Integer(3))),
        # P(h(X) = 1) = P(X >= 2), que tiene que ser el atomo de T* en 1.
        "a3": sp.exp(-sp.Rational(1, 2) * 2),
    }
    for i, t in enumerate(PUNTOS, 1):
        salida[f"dist{i}"] = 1 - sp.exp(-t)          # F_{T*}(t) en [0, 1)
    return salida


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    n = 400_000
    hx = [min(rng.expovariate(0.5) / 2, 1.0) for _ in range(n)]
    tstar = [min(rng.expovariate(1.0), 1.0) for _ in range(n)]
    salida = {
        "a3": sum(1 for v in hx if v == 1.0) / n,
        "atomo_Tstar": sum(1 for v in tstar if v == 1.0) / n,
    }
    for i, t in enumerate(PUNTOS, 1):
        salida[f"dist{i}"] = sum(1 for v in hx if v <= float(t)) / n
    # Las dos muestras tienen que tener la misma distribucion.
    assert abs(salida["a3"] - salida["atomo_Tstar"]) < 0.005
    return salida


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    print(exacto())
    print(math.exp(-1))
