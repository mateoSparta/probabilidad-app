# -*- coding: utf-8 -*-
"""
Ejercicio 2.17 — intensidad de fallas de Weibull.

lambda(t) = (beta/alpha) (t/alpha)^(beta-1) en t > 0. Como
P(T > t) = exp(-int_0^t lambda), resulta la Weibull:

    F(t) = 1 - exp(-(t/alpha)^beta),   f(t) = lambda(t) exp(-(t/alpha)^beta)

(a) se evalua en alpha = 2, beta = 3. El item b (el inciso (d) de la guia) pide, con alpha = 1 y
beta = 0.5, 1, 1.5, P(T > 1) y P(T > 4 | T > 3). P(T > 1) = e^{-1} para los
tres beta, porque (1/1)^beta = 1, y el condicional crece o decrece con beta
segun las fallas sean tempranas o por desgaste; con beta = 1 es la perdida
de memoria: P(T > 4 | T > 3) = P(T > 1).

El exacto integra la intensidad con sympy; el Monte Carlo sortea con
random.weibullvariate, que es una implementacion independiente.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import SEMILLA, TOL_MONTECARLO

ID = "g2-17"
NUMERO = "2.17"

t, s = sp.symbols("t s", positive=True)
BETAS = (sp.Rational(1, 2), sp.Integer(1), sp.Rational(3, 2))


def F(alfa, beta):
    lam = (beta / alfa) * (s / alfa) ** (beta - 1)
    return 1 - sp.exp(-sp.integrate(lam, (s, 0, t)))


def exacto() -> dict:
    Fa = sp.simplify(F(sp.Integer(2), sp.Integer(3)))
    fa = sp.diff(Fa, t)
    assert sp.simplify(Fa - (1 - sp.exp(-(t / 2) ** 3))) == 0
    salida = {
        "a1": sp.simplify(Fa.subs(t, 1)),
        "a2": sp.simplify(Fa.subs(t, 2)),
        "a3": sp.simplify(fa.subs(t, 1)),
    }
    colas = []
    for b in BETAS:
        cola = 1 - F(sp.Integer(1), b)
        colas.append(sp.simplify(cola.subs(t, 1)))
    assert all(sp.simplify(c - sp.exp(-1)) == 0 for c in colas), colas
    salida["b1"] = colas[0]
    for i, b in enumerate(BETAS, 2):
        cola = 1 - F(sp.Integer(1), b)
        salida[f"b{i}"] = sp.simplify(cola.subs(t, 4) / cola.subs(t, 3))
    return salida


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    n = 400_000
    xs = [rng.weibullvariate(2, 3) for _ in range(n)]
    h = 0.02
    salida = {
        "a1": sum(1 for x in xs if x <= 1) / n,
        "a2": sum(1 for x in xs if x <= 2) / n,
        "a3": sum(1 for x in xs if abs(x - 1) < h) / n / (2 * h),
    }
    for i, b in enumerate(BETAS, 2):
        ys = [rng.weibullvariate(1, float(b)) for _ in range(n)]
        if i == 2:
            salida["b1"] = sum(1 for y in ys if y > 1) / n
        mas3 = [y for y in ys if y > 3]
        salida[f"b{i}"] = sum(1 for y in mas3 if y > 4) / len(mas3)
    return salida


# El condicional con beta = 1/2 se estima sobre los ~18 % que superan 3; el
# de beta = 3/2, sobre ~0.5 % (unos 2000 casos), con error estandar ~0.005.
TOLERANCIA = 0.02
