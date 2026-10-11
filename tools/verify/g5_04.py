# -*- coding: utf-8 -*-
"""
Ejercicio 5.4 — condicionales de la normal bivariada del 3.22.

f(x, y) = 5/(8 pi) exp(-25/32 (x^2 - 6/5 xy + y^2)): dos normales estandar
con correlacion 3/5 (ver g3_22.py). Entonces

    Y ~ N(0, 1),   Y | X = x ~ N(3x/5, 16/25)

La condicional depende de x, asi que no son independientes.

(b) P(1 < XY < 5 | X = sqrt 5) = P(1/sqrt5 < Y < sqrt5 | X = sqrt 5). La media
condicional es 3/sqrt5 y el desvio 4/5; los dos extremos quedan a
+-(2/sqrt5)/(4/5) = +-sqrt5/2 desvios, y la probabilidad es 2 Phi(sqrt5/2) - 1.

El exacto usa las formulas de la normal; el segundo camino integra la
densidad conjunta dada con cuadratura numerica, sin identificar la normal.
"""
from __future__ import annotations

import mpmath
import sympy as sp

from comun import Phi

ID = "g5-04"
NUMERO = "5.4"


def normal(m, v, t):
    return sp.exp(-(t - m) ** 2 / (2 * v)) / sp.sqrt(2 * sp.pi * v)


def exacto() -> dict:
    R = sp.Rational
    var_c = R(16, 25)
    r5 = sp.sqrt(5)
    return {
        "a1": normal(0, 1, 0),
        "a2": sp.simplify(normal(R(3, 5), var_c, R(3, 5))),
        "a3": sp.simplify(normal(0, var_c, 1)),
        "c": sp.simplify(2 * Phi(r5 / 2) - 1),
    }


def estimado() -> dict:
    mpmath.mp.dps = 25

    def f(x, y):
        return 5 / (8 * mpmath.pi) * mpmath.exp(-mpmath.mpf(25) / 32 * (x * x - mpmath.mpf(6) / 5 * x * y + y * y))

    inf = mpmath.inf

    def cond(x, y):
        return f(x, y) / mpmath.quad(lambda t: f(x, t), [-inf, inf])

    r5 = mpmath.sqrt(5)
    num = mpmath.quad(lambda t: f(r5, t), [1 / r5, r5])
    den = mpmath.quad(lambda t: f(r5, t), [-inf, inf])
    return {
        "a1": float(mpmath.quad(lambda t: f(t, 0), [-inf, inf])),
        "a2": float(cond(1, mpmath.mpf(3) / 5)),
        "a3": float(cond(0, 1)),
        "c": float(num / den),
    }


TOLERANCIA = 1e-9
