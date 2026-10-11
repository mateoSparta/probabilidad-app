# -*- coding: utf-8 -*-
"""
Ejercicio 6.14 — multinomial.

Cuatro maquinas A, B, C, D producen el 40, 30, 20 y 10 % de los articulos.

  (a) 14 articulos: P(5 de A, 4 de B, 3 de C, 2 de D), multinomial.
  (b) Sabiendo que exactamente 5 de 14 son de A, cada uno de los otros 9 es
      de C con probabilidad 0.2/0.6 = 1/3, independientemente: binomial
      (9, 1/3) evaluada en 3.

El exacto usa la formula multinomial y, para (b), la definicion de
condicional sumando sobre la multinomial completa; el Monte Carlo sortea los
14 articulos.
"""
from __future__ import annotations

import random
from fractions import Fraction as Fr
from itertools import product
from math import comb, factorial

from comun import SEMILLA, TOL_MONTECARLO

ID = "g6-14"
NUMERO = "6.14"

P = {"A": Fr(4, 10), "B": Fr(3, 10), "C": Fr(2, 10), "D": Fr(1, 10)}
N = 14


def multinomial(cuentas: dict) -> Fr:
    coef = factorial(N)
    p = Fr(1)
    for m, k in cuentas.items():
        coef //= factorial(k)
        p *= P[m] ** k
    return coef * p


def exacto() -> dict:
    a = multinomial({"A": 5, "B": 4, "C": 3, "D": 2})
    # (b) por la definicion: sumando la multinomial sobre (b, c, d).
    conj = den = Fr(0)
    for b, c in product(range(10), repeat=2):
        d = 9 - b - c
        if d < 0:
            continue
        p = multinomial({"A": 5, "B": b, "C": c, "D": d})
        den += p
        if c == 3:
            conj += p
    b_def = conj / den
    assert b_def == comb(9, 3) * Fr(1, 3) ** 3 * Fr(2, 3) ** 6
    return {"a": a, "b": b_def}


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    maquinas, pesos = list(P), [float(p) for p in P.values()]
    n = 400_000
    exito_a = casos_b = exito_b = 0
    for _ in range(n):
        art = rng.choices(maquinas, weights=pesos, k=N)
        na, nb, nc, nd = (art.count(m) for m in "ABCD")
        exito_a += (na, nb, nc, nd) == (5, 4, 3, 2)
        if na == 5:
            casos_b += 1
            exito_b += nc == 3
    return {"a": exito_a / n, "b": exito_b / casos_b}


TOLERANCIA = TOL_MONTECARLO
