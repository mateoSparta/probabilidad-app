# -*- coding: utf-8 -*-
"""
Ejercicio 4.24 — distancia al origen de un punto uniforme en el cuadrado.

X, Y ~ U(0,1] independientes, R = sqrt(X^2 + Y^2).

Metodo de la F: F_R(r) = P(X^2 + Y^2 <= r^2) es el **area** de la parte del
cuadrado unitario que queda dentro del circulo de radio r. Y ahi esta el
detalle del ejercicio: la formula cambia segun si el circulo entra entero en
el cuadrado o si ya se le salio por los lados.

  0 < r <= 1        el cuarto de circulo entra completo:  pi r^2 / 4
  1 < r <= sqrt(2)  hay que restarle los dos pedazos que se salen

El exacto integra el area con sympy en los dos tramos, asi la formula por
trozos no se asume.
"""
from __future__ import annotations

import math
import random

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo

ID = "g4-24"
NUMERO = "4.24"

x, y = sp.symbols("x y", positive=True)


def area_dentro(r) -> sp.Expr:
    """Area de {(x,y) en (0,1]^2 : x^2 + y^2 <= r^2}, por integracion."""
    rr = sp.Rational(r) if not isinstance(r, sp.Expr) else r
    alto = sp.sqrt(rr**2 - x**2)
    return sp.simplify(
        sp.integrate(sp.Min(1, sp.Max(0, alto)), (x, 0, sp.Min(1, rr)))
    )


def exacto() -> dict[str, sp.Expr]:
    # (a) F_R en puntos de los dos tramos
    f_medio = area_dentro(sp.Rational(1, 2))     # tramo 0 < r <= 1
    f_uno = area_dentro(1)                        # justo en r = 1
    f_ciento_dos = area_dentro(sp.Rational(6, 5))  # tramo 1 < r <= sqrt(2)

    # Control: en r = sqrt(2) tiene que valer 1 (todo el cuadrado).
    f_max = area_dentro(sp.sqrt(2))
    assert sp.simplify(f_max - 1) == 0, f"F_R(sqrt 2) da {f_max}, no 1"

    # En el tramo chico F_R(r) tiene que ser pi r^2 / 4; con r = 1/2, pi/16.
    assert sp.simplify(f_medio - sp.pi / 16) == 0, f"F_R(1/2) da {f_medio}, no pi/16"

    return {
        "a1": f_medio,
        "a2": f_uno,
        "a3": f_ciento_dos,
        # (b) P(R > 1/2)
        "b": sp.simplify(1 - f_medio),
    }


def _r(rng: random.Random) -> float:
    return math.hypot(rng.random(), rng.random())


def estimado() -> dict[str, float]:
    return {
        "a1": montecarlo(lambda rng: _r(rng) <= 0.5),
        "a2": montecarlo(lambda rng: _r(rng) <= 1.0),
        "a3": montecarlo(lambda rng: _r(rng) <= 1.2),
        "b": montecarlo(lambda rng: _r(rng) > 0.5),
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
