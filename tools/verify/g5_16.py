# -*- coding: utf-8 -*-
"""
Ejercicio 5.16 — varianza total ("teorema de Pitagoras").

X exponencial de media 2, E[Y|X] = X y var[Y|X] = X. Se pide var[Y].

La descomposicion es

    var[Y] = E[ var[Y|X] ] + var[ E[Y|X] ]

o sea: la variabilidad de Y se parte en la que queda **dentro** de cada valor
de X y la que viene de que X **varia**. Aca las dos partes dan E[X] = 2 y
var[X] = 4, asi que var[Y] = 6.

Se la llama Pitagoras porque los dos terminos son los catetos de una
descomposicion ortogonal, y por eso se suman sin termino cruzado.

El modelo construye una Y concreta que cumple las dos condiciones del
enunciado —Y | X ~ Poisson(X), que tiene media y varianza iguales a X— y
verifica la descomposicion por simulacion. Asi se chequea el teorema en vez de
aplicarlo nada mas.
"""
from __future__ import annotations

import math
import random

import sympy as sp

ID = "g5-16"
NUMERO = "5.16"

MEDIA_X = 2

x = sp.Symbol("x", positive=True)
DENSIDAD = sp.exp(-x / MEDIA_X) / MEDIA_X


def exacto() -> dict[str, sp.Expr]:
    assert sp.integrate(DENSIDAD, (x, 0, sp.oo)) == 1

    e_x = sp.integrate(x * DENSIDAD, (x, 0, sp.oo))
    e_x2 = sp.integrate(x**2 * DENSIDAD, (x, 0, sp.oo))
    var_x = sp.simplify(e_x2 - e_x**2)

    # var[Y] = E[var[Y|X]] + var[E[Y|X]] = E[X] + var[X]
    var_y = sp.simplify(e_x + var_x)

    return {
        "a": var_y,
        "e_x": e_x,
        "var_x": var_x,
        # El error tipico: quedarse con un solo termino.
        "a_error_tipico": var_x,
    }


def _sortear_poisson(rng: random.Random, media: float) -> int:
    objetivo = math.exp(-media)
    k, p = 0, 1.0
    while True:
        p *= rng.random()
        if p <= objetivo:
            return k
        k += 1


def estimado() -> dict[str, float]:
    """
    Y | X ~ Poisson(X) cumple E[Y|X] = var[Y|X] = X, que es exactamente lo que
    pide el enunciado. Se simula X y despues Y, y se mide var[Y] directo.
    """
    rng = random.Random(20260408)
    n = 400_000
    ys = []
    for _ in range(n):
        xi = rng.expovariate(1 / MEDIA_X)
        ys.append(_sortear_poisson(rng, xi))
    m = sum(ys) / n
    var = sum((v - m) ** 2 for v in ys) / n
    return {"a": var, "e_x": MEDIA_X, "var_x": MEDIA_X**2}


# var[Y] = 6; el cuarto momento hace que el error estandar sea como 0.05.
TOLERANCIA = 0.3

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
