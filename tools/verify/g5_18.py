# -*- coding: utf-8 -*-
"""
Ejercicio 5.18 (a) sobre el vector del 5.2 (b).

f(x, y) = 1/(2x+1) exp(-(2x + y/(4x+2))) en x > 0, y > 0. Integrando en y,
f_X(x) = 2 e^{-2x}: X ~ Exp de intensidad 2. Y | X = x es exponencial de
media 4x + 2.

  E[Y | X] = 4X + 2,  var(Y | X) = (4X + 2)^2
  E[Y|X] >= 2 y var(Y|X) >= 4 siempre, porque X > 0:
    F_{E[Y|X]}(3) = P(X <= 1/4) = 1 - e^{-1/2}
    P(1 < E[Y|X] < 2) = 0
    F_{var(Y|X)}(16) = P(X <= 1/2) = 1 - e^{-1}
    P(var(Y|X) > 1) = 1
  var(Y) = E[var(Y|X)] + var(E[Y|X]) = 20 + 4 = 24

Se carga el inciso (a). El (b) pide repetir todo para los otros vectores del
5.2 y no se carga.

El exacto deriva todo con sympy a partir de la conjunta; el segundo camino
simula para las distribuciones y calcula var(Y) integrando y e y^2 contra la
conjunta, sin la descomposicion de la varianza total.
"""
from __future__ import annotations

import random

import mpmath
import sympy as sp

from comun import SEMILLA

ID = "g5-18"
NUMERO = "5.18"

x, y = sp.symbols("x y", positive=True)
F = 1 / (2 * x + 1) * sp.exp(-(2 * x + y / (4 * x + 2)))


def exacto() -> dict:
    fx = sp.simplify(sp.integrate(F, (y, 0, sp.oo)))
    assert sp.simplify(fx - 2 * sp.exp(-2 * x)) == 0, fx
    cond = sp.simplify(F / fx)
    e_cond = sp.simplify(sp.integrate(y * cond, (y, 0, sp.oo)))
    v_cond = sp.simplify(sp.integrate(y**2 * cond, (y, 0, sp.oo)) - e_cond**2)
    assert sp.simplify(e_cond - (4 * x + 2)) == 0 and sp.simplify(v_cond - (4 * x + 2) ** 2) == 0

    def Fx(t):
        return 1 - sp.exp(-2 * t) if t > 0 else sp.Integer(0)

    E = lambda g: sp.integrate(g * fx, (x, 0, sp.oo))      # noqa: E731
    var_y = sp.simplify(E(v_cond) + E(e_cond**2) - E(e_cond) ** 2)
    X = sp.symbols("X")
    return {
        "a": 4 * X + 2,
        "b": (4 * X + 2) ** 2,
        "a_en_1": e_cond.subs(x, 1),
        "b_en_1": v_cond.subs(x, 1),
        "c1": Fx(sp.Rational(3 - 2, 4)),        # 4X + 2 <= 3
        "c2": sp.Integer(0),                    # 4X + 2 nunca cae en (1, 2)
        "c3": Fx(sp.Rational(4 - 2, 4)),        # (4X+2)^2 <= 16
        "c4": sp.Integer(1),                    # (4X+2)^2 >= 4 > 1
        "d": var_y,
    }


def estimado() -> dict:
    """
    Las distribuciones de E[Y|X] y var(Y|X) se simulan. Los momentos
    condicionales en x = 1 y var(Y) se integran contra la conjunta con
    cuadratura numerica, sin usar que la condicional es exponencial ni la
    descomposicion de la varianza total.
    """
    rng = random.Random(SEMILLA)
    n = 400_000
    medias = [4 * rng.expovariate(2) + 2 for _ in range(n)]
    varianzas = [m * m for m in medias]

    mpmath.mp.dps = 20
    f = lambda a, b: 1 / (2 * a + 1) * mpmath.exp(-(2 * a + b / (4 * a + 2)))      # noqa: E731
    lim = [0, mpmath.inf]
    fx1 = mpmath.quad(lambda b: f(1, b), lim)
    m1 = mpmath.quad(lambda b: b * f(1, b), lim) / fx1
    m2 = mpmath.quad(lambda b: b * b * f(1, b), lim) / fx1
    e1 = mpmath.quad(lambda a, b: b * f(a, b), lim, lim)
    e2 = mpmath.quad(lambda a, b: b * b * f(a, b), lim, lim)
    return {
        "a_en_1": float(m1),
        "b_en_1": float(m2 - m1 * m1),
        "c1": sum(1 for m in medias if m <= 3) / n,
        "c2": sum(1 for m in medias if 1 < m < 2) / n,
        "c3": sum(1 for v in varianzas if v <= 16) / n,
        "c4": sum(1 for v in varianzas if v > 1) / n,
        "d": float(e2 - e1 * e1),
    }


TOLERANCIA = 0.005
