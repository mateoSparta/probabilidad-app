# -*- coding: utf-8 -*-
"""
Ejercicio 3.20 — covarianza sobre un triangulo.

(X, Y) uniforme sobre el triangulo de vertices (0,0), (2,2), (0,2), que es la
region {0 <= x <= 2, x <= y <= 2} y tiene area 2.

Los incisos (b) y (c) se pueden hacer de dos formas: integrando de nuevo, o
usando las propiedades de la covarianza. El modelo hace las dos y chequea que
coincidan, que es lo que verifica las propiedades en vez de asumirlas:

  var[X+Y]            = var X + var Y + 2 cov(X,Y)
  cov(aX+bY+c, X+Y)   = a var X + (a+b) cov(X,Y) + b var Y
"""
from __future__ import annotations

import random

import sympy as sp

from comun import TOL_MONTECARLO

ID = "g3-20"
NUMERO = "3.20"

x, y = sp.symbols("x y", real=True)
AREA = sp.Integer(2)
DENSIDAD = 1 / AREA


def esperanza(g):
    """E[g(X,Y)] integrando sobre el triangulo: y de x a 2, x de 0 a 2."""
    return sp.simplify(
        sp.integrate(sp.integrate(g * DENSIDAD, (y, x, 2)), (x, 0, 2))
    )


def exacto() -> dict[str, sp.Expr]:
    assert esperanza(1) == 1, "la densidad no integra 1 sobre el triangulo"

    e_x, e_y = esperanza(x), esperanza(y)
    var_x = sp.simplify(esperanza(x**2) - e_x**2)
    var_y = sp.simplify(esperanza(y**2) - e_y**2)
    cov = sp.simplify(esperanza(x * y) - e_x * e_y)

    # (b) por integracion directa y por la propiedad
    var_suma = sp.simplify(esperanza((x + y) ** 2) - esperanza(x + y) ** 2)
    por_propiedad = sp.simplify(var_x + var_y + 2 * cov)
    assert sp.simplify(var_suma - por_propiedad) == 0, "var[X+Y] no coincide"

    # (c) idem para cov(3X - Y + 2, X + Y)
    u = 3 * x - y + 2
    w = x + y
    cov_c = sp.simplify(esperanza(u * w) - esperanza(u) * esperanza(w))
    por_propiedad_c = sp.simplify(3 * var_x + (3 - 1) * cov - var_y)
    assert sp.simplify(cov_c - por_propiedad_c) == 0, "cov del inciso (c) no coincide"

    return {
        "a": cov,
        "b": var_suma,
        "c": cov_c,
        # controles
        "e_x": e_x,
        "e_y": e_y,
        "var_x": var_x,
        "var_y": var_y,
    }


def _punto(rng: random.Random):
    """Rechazo dentro del cuadrado [0,2]x[0,2]."""
    px = rng.uniform(0, 2)
    py = rng.uniform(0, 2)
    return (px, py) if py >= px else None


def _muestras(n: int = 400_000, semilla: int = 20260408):
    rng = random.Random(semilla)
    xs, ys = [], []
    while len(xs) < n:
        p = _punto(rng)
        if p is not None:
            xs.append(p[0])
            ys.append(p[1])
    return xs, ys


def _cov(a, b) -> float:
    n = len(a)
    ma = sum(a) / n
    mb = sum(b) / n
    return sum((ai - ma) * (bi - mb) for ai, bi in zip(a, b)) / n


def estimado() -> dict[str, float]:
    xs, ys = _muestras()
    n = len(xs)
    sumas = [xi + yi for xi, yi in zip(xs, ys)]
    us = [3 * xi - yi + 2 for xi, yi in zip(xs, ys)]
    return {
        "a": _cov(xs, ys),
        "b": _cov(sumas, sumas),
        "c": _cov(us, sumas),
        "e_x": sum(xs) / n,
        "e_y": sum(ys) / n,
        "var_x": _cov(xs, xs),
        "var_y": _cov(ys, ys),
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
