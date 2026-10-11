# -*- coding: utf-8 -*-
"""
Ejercicio 5.15 — covarianza nula con dependencia.

X normal estandar y E[Y | X] = X^2. Entonces

    cov(X, Y) = E[XY] - E[X] E[Y] = E[X E[Y|X]] - 0 = E[X^3] = 0

por simetria. Y depende de X (su media condicional es X^2), pero la
covarianza no lo detecta, porque solo mide la parte lineal de la dependencia.

El item va como opcion multiple, para que la respuesta no sea un 0 que se
adivina. El modelo verifica el valor y que no dependa de cual Y se elija: el
Monte Carlo usa dos Y distintas con E[Y | X] = X^2.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import SEMILLA

ID = "g5-15"
NUMERO = "5.15"


def exacto() -> dict:
    x = sp.symbols("x", real=True)
    phi = sp.exp(-x**2 / 2) / sp.sqrt(2 * sp.pi)
    e_x3 = sp.integrate(x**3 * phi, (x, -sp.oo, sp.oo))
    e_x = sp.integrate(x * phi, (x, -sp.oo, sp.oo))
    return {"cov": sp.simplify(e_x3 - e_x * sp.integrate(x**2 * phi, (x, -sp.oo, sp.oo))),
            "cov_otra_y": sp.Integer(0)}


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    n = 1_000_000
    s = {"cov": [0.0, 0.0, 0.0], "cov_otra_y": [0.0, 0.0, 0.0]}
    for _ in range(n):
        x = rng.gauss(0, 1)
        for clave, y in (
            ("cov", x * x + rng.gauss(0, 1)),               # ruido aditivo
            ("cov_otra_y", x * x * rng.expovariate(1)),     # ruido multiplicativo, media 1
        ):
            s[clave][0] += x
            s[clave][1] += y
            s[clave][2] += x * y
    return {k: v[2] / n - (v[0] / n) * (v[1] / n) for k, v in s.items()}


# E[X^2 Y^2] es del orden de 15 a 30, de modo que el error estandar con 1e6
# muestras es ~0.005.
TOLERANCIA = 0.03
