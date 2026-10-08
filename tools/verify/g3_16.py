# -*- coding: utf-8 -*-
"""
Ejercicio 3.16 — potencia disipada por una resistencia.

W = r V^2 con r = 3 y V ~ N(6, 1). Se pide E[W].

Es el mismo punto que el 3.10 pero mas directo: E[V^2] no es E[V]^2. La
diferencia es exactamente la varianza, porque
var[V] = E[V^2] - E[V]^2, o sea E[V^2] = sigma^2 + mu^2.

El modelo integra contra la densidad normal en vez de aplicar la identidad, y
despues chequea que coincidan: asi la identidad queda verificada y no asumida.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import TOL_MONTECARLO

ID = "g3-16"
NUMERO = "3.16"

R = 3
MU = 6
SIGMA = 1

v = sp.Symbol("v", real=True)
DENSIDAD = sp.exp(-((v - MU) ** 2) / (2 * SIGMA**2)) / (SIGMA * sp.sqrt(2 * sp.pi))


def exacto() -> dict[str, sp.Expr]:
    assert sp.simplify(sp.integrate(DENSIDAD, (v, -sp.oo, sp.oo))) == 1

    e_v2 = sp.simplify(sp.integrate(v**2 * DENSIDAD, (v, -sp.oo, sp.oo)))
    # La identidad, por el otro camino.
    por_identidad = sp.Integer(SIGMA**2 + MU**2)
    assert sp.simplify(e_v2 - por_identidad) == 0, "la integral no coincide con sigma^2 + mu^2"

    return {
        "a": sp.simplify(R * e_v2),
        "e_v2": e_v2,
        # El error tipico: r * E[V]^2 en vez de r * E[V^2].
        "a_error_tipico": sp.Integer(R * MU**2),
    }


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    return {"a": sum(R * rng.gauss(MU, SIGMA) ** 2 for _ in range(n)) / n}


# Tolerancia absoluta. E[W] = 111 y el error estandar del Monte Carlo es como
# 0.06, asi que 0.5 son unos 8 sigma.
TOLERANCIA = 0.5

if __name__ == "__main__":
    for k, val in exacto().items():
        print(f"  {k}: {val} = {float(val):.6f}")
