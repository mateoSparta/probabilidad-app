# -*- coding: utf-8 -*-
"""
Ejercicio 3.22 — recta de regresion de una normal bivariada.

f(x, y) = 5/(8 pi) exp(-25/32 (x^2 - 6/5 xy + y^2)).

El exponente es -1/2 [x y] A [x y]^t con A = 25/16 [[1, -3/5], [-3/5, 1]].
Su inversa es la matriz de covarianza, Sigma = [[1, 3/5], [3/5, 1]]: dos
normales estandar con correlacion 3/5. La constante confirma la lectura,
porque 1 / (2 pi sqrt(det Sigma)) = 1 / (2 pi 4/5) = 5/(8 pi).

La recta de regresion es y = cov/var (x - E X) + E Y = 3x/5.

El exacto invierte la matriz con sympy; el segundo camino integra los
momentos de la densidad dada con cuadratura numerica (mpmath), sin pasar por
la matriz.
"""
from __future__ import annotations

import mpmath
import sympy as sp

ID = "g3-22"
NUMERO = "3.22"


def exacto() -> dict:
    A = sp.Rational(25, 16) * sp.Matrix([[1, -sp.Rational(3, 5)], [-sp.Rational(3, 5), 1]])
    S = A.inv()
    assert sp.simplify(1 / (2 * sp.pi * sp.sqrt(S.det())) - 5 / (8 * sp.pi)) == 0
    pendiente = S[0, 1] / S[0, 0]
    return {"a1": pendiente, "a2": sp.Integer(0)}


def estimado() -> dict:
    mpmath.mp.dps = 20

    def f(x, y):
        return 5 / (8 * mpmath.pi) * mpmath.exp(-mpmath.mpf(25) / 32 * (x * x - mpmath.mpf(6) / 5 * x * y + y * y))

    lim = [-12, 12]

    def E(g):
        return mpmath.quad(lambda x, y: g(x, y) * f(x, y), lim, lim)

    masa = E(lambda x, y: 1)
    ex, ey = E(lambda x, y: x), E(lambda x, y: y)
    vx = E(lambda x, y: x * x) - ex**2
    cxy = E(lambda x, y: x * y) - ex * ey
    assert abs(masa - 1) < 1e-8
    pend = cxy / vx
    return {"a1": float(pend), "a2": float(ey - pend * ex)}


TOLERANCIA = 1e-6
