# -*- coding: utf-8 -*-
"""
Ejercicio 3.8 — media de una normal truncada.

Z normal estandar. E[Z | Z > z0] = phi(z0) / (1 - Phi(z0)): el numerador sale
de integrar z phi(z) entre z0 e infinito, que da phi(z0) porque
phi'(z) = -z phi(z).

Se cargan (a), (c) y (d); el (b) dice "deducir", es demostracion.
  a: E[Z | Z > 1] y E[Z | Z > 2].
  b (el inciso (c)): la cota phi(3)/3 contra el valor exacto de P(Z > 3).
  c (el inciso (d)): X = sigma Z + mu con mu = 10, sigma = 2 y x0 = 12, que
     por linealidad da mu + sigma E[Z | Z > (x0 - mu)/sigma].

El exacto integra con sympy; el Monte Carlo sortea normales y promedia sobre
las que superan el umbral.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import SEMILLA, Phi, phi

ID = "g3-08"
NUMERO = "3.8"

z = sp.symbols("z", real=True)
MU, SIGMA, X0 = 10, 2, 12


def media_truncada(z0):
    dens = sp.exp(-z**2 / 2) / sp.sqrt(2 * sp.pi)
    num = sp.integrate(z * dens, (z, z0, sp.oo))
    assert sp.simplify(num - phi(z0)) == 0
    return sp.simplify(num / (1 - Phi(z0)))


def exacto() -> dict:
    return {
        "a1": media_truncada(1),
        "a2": media_truncada(2),
        "b1": sp.simplify(phi(3) / 3),
        "b2": sp.simplify(1 - Phi(3)),
        "c": sp.simplify(MU + SIGMA * media_truncada(sp.Rational(X0 - MU, SIGMA))),
    }


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    n = 2_000_000
    zs = [rng.gauss(0, 1) for _ in range(n)]
    m1 = [v for v in zs if v > 1]
    m2 = [v for v in zs if v > 2]
    xs = [MU + SIGMA * v for v in zs]
    mx = [v for v in xs if v > X0]
    return {
        "a1": sum(m1) / len(m1),
        "a2": sum(m2) / len(m2),
        "b2": sum(1 for v in zs if v > 3) / n,
        "c": sum(mx) / len(mx),
    }


# La media sobre Z > 2 usa ~45000 muestras con desvio ~0.36: error ~0.002.
TOLERANCIA = 0.01
