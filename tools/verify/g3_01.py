# -*- coding: utf-8 -*-
"""
Ejercicio 3.1 — esperanza de una variable mixta.

F_X(x) = x^3/3 en [0,1) + (2x+1)/6 en [1,2) + 1 en x >= 2.

Lo importante es que **F tiene saltos**: en x=1 pasa de 1/3 a 1/2 y en x=2 de
5/6 a 1. Esos saltos son masa puntual de 1/6 cada uno, asi que X no es
continua: es mixta. La esperanza tiene entonces dos partes, la integral de la
densidad donde F es derivable y la suma de los atomos.

Y por eso E[X | X < 1] y E[X | X <= 1] dan distinto: el atomo en 1 entra en
uno y no en el otro. Es el punto del ejercicio.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo

ID = "g3-01"
NUMERO = "3.1"

x = sp.Symbol("x", real=True)

# F por tramos
F1 = x**3 / 3            # 0 <= x < 1
F2 = (2 * x + 1) / 6     # 1 <= x < 2

# Densidades (derivadas de F) en cada tramo continuo
f1 = sp.diff(F1, x)      # x^2   en (0,1)
f2 = sp.diff(F2, x)      # 1/3   en (1,2)

# Atomos: el salto de F en cada punto
ATOMO_1 = sp.simplify(F2.subs(x, 1) - F1.subs(x, 1))   # 1/6
ATOMO_2 = sp.simplify(1 - F2.subs(x, 2))               # 1/6


def exacto() -> dict[str, sp.Expr]:
    # Control: la masa total tiene que ser 1.
    masa = (
        sp.integrate(f1, (x, 0, 1))
        + ATOMO_1
        + sp.integrate(f2, (x, 1, 2))
        + ATOMO_2
    )
    assert sp.simplify(masa) == 1, f"la masa total da {sp.simplify(masa)}, no 1"
    assert ATOMO_1 > 0 and ATOMO_2 > 0, "se esperaban dos atomos positivos"

    # (a) E[X] = integral de x f(x) en los tramos + suma de atomos por su valor
    e_x = (
        sp.integrate(x * f1, (x, 0, 1))
        + 1 * ATOMO_1
        + sp.integrate(x * f2, (x, 1, 2))
        + 2 * ATOMO_2
    )

    # (b) condicionales. Ojo con el atomo en 1: entra en {X <= 1} y no en {X < 1}.
    p_menor = sp.integrate(f1, (x, 0, 1))                 # P(X < 1) = 1/3
    e_menor = sp.integrate(x * f1, (x, 0, 1))
    p_menor_igual = p_menor + ATOMO_1                      # P(X <= 1) = 1/2
    e_menor_igual = e_menor + 1 * ATOMO_1

    return {
        "a": sp.simplify(e_x),
        "b1": sp.simplify(e_menor / p_menor),
        "b2": sp.simplify(e_menor_igual / p_menor_igual),
        # controles
        "p_menor": sp.simplify(p_menor),
        "p_menor_igual": sp.simplify(p_menor_igual),
        "atomo_en_1": ATOMO_1,
        "atomo_en_2": ATOMO_2,
    }


def _sortear(rng: random.Random) -> float:
    """
    Inversa de F, tramo por tramo. Los atomos salen solos: para u en
    [1/3, 1/2) la inversa devuelve 1, y para u >= 5/6 devuelve 2.
    """
    u = rng.random()
    if u < 1 / 3:
        return (3 * u) ** (1 / 3)      # F1(x) = x^3/3
    if u < 1 / 2:
        return 1.0                      # atomo
    if u < 5 / 6:
        return (6 * u - 1) / 2          # F2(x) = (2x+1)/6
    return 2.0                          # atomo


def _media_condicional(cond, n: int = 400_000, semilla: int = 20260408) -> float:
    rng = random.Random(semilla)
    suma = casos = 0
    for _ in range(n):
        v = _sortear(rng)
        if cond(v):
            suma += v
            casos += 1
    return suma / casos if casos else 0.0


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    media = sum(_sortear(rng) for _ in range(n)) / n
    return {
        "a": media,
        "b1": _media_condicional(lambda v: v < 1),
        "b2": _media_condicional(lambda v: v <= 1),
        "p_menor": montecarlo(lambda r: _sortear(r) < 1),
        "p_menor_igual": montecarlo(lambda r: _sortear(r) <= 1),
        "atomo_en_1": montecarlo(lambda r: _sortear(r) == 1.0),
        "atomo_en_2": montecarlo(lambda r: _sortear(r) == 2.0),
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
