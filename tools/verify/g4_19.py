# -*- coding: utf-8 -*-
"""
Ejercicio 4.19 — langostas y moscas en el asado.

L ~ Poisson(2) y M ~ Poisson(8) independientes.

(a) La suma de Poisson independientes es Poisson con la suma de las medias:
    L + M ~ Poisson(10).
(b) Condicionando a L + M = 10, la cantidad de moscas se reparte como una
    binomial: M | (L+M = n) ~ Binomial(n, 8/10). La proporcion 8/10 es la de
    las medias, y es el resultado que vale la pena recordar.
(c) De ahi sale la probabilidad pedida.

El exacto suma las probabilidades exactas con fracciones; el Monte Carlo
sortea las dos Poisson y condiciona por rechazo, que es lo que verifica que la
binomial del inciso (b) sea realmente la distribucion condicional.
"""
from __future__ import annotations

import math
import random
from fractions import Fraction

from comun import TOL_MONTECARLO

ID = "g4-19"
NUMERO = "4.19"

MEDIA_L = 2
MEDIA_M = 8
TOTAL = MEDIA_L + MEDIA_M
CONDICION = 10


def poisson(k: int, media) -> Fraction:
    """P(X = k) exacta, con media racional."""
    m = Fraction(media)
    return m**k / math.factorial(k) * Fraction(1) * _exp_neg(m)


def _exp_neg(m: Fraction):
    """Se deja e^-m como simbolo: se cancela en los cocientes."""
    import sympy as sp

    return sp.exp(-sp.Rational(m))


def binomial(k: int, n: int, p: Fraction) -> Fraction:
    return Fraction(math.comb(n, k)) * p**k * (1 - p) ** (n - k)


P_MOSCA = Fraction(MEDIA_M, TOTAL)   # 8/10


def exacto() -> dict:
    import sympy as sp

    # (a) P(L + M = 10) con la Poisson de media 10
    p_suma = sp.Rational(TOTAL**CONDICION, math.factorial(CONDICION)) * sp.exp(-TOTAL)

    # Control: la suma de Poisson(2) y Poisson(8) tiene que dar Poisson(10).
    # Se verifica por convolucion en el punto 10.
    conv = sum(
        sp.Rational(MEDIA_L**j, math.factorial(j))
        * sp.exp(-MEDIA_L)
        * sp.Rational(MEDIA_M ** (CONDICION - j), math.factorial(CONDICION - j))
        * sp.exp(-MEDIA_M)
        for j in range(CONDICION + 1)
    )
    assert sp.simplify(conv - p_suma) == 0, "la convolucion no da Poisson(10)"

    # (b) y (c) con la binomial condicional
    p_mas_de_2 = 1 - sum(binomial(k, CONDICION, P_MOSCA) for k in range(3))

    return {
        "a": p_suma,
        # claves b1..b3: checkpoints de la funcion de probabilidad condicional
        "b1": binomial(8, CONDICION, P_MOSCA),
        "b2": binomial(10, CONDICION, P_MOSCA),
        "b3": binomial(0, CONDICION, P_MOSCA),
        "c": p_mas_de_2,
    }


def _sortear_poisson(rng: random.Random, media: float) -> int:
    """Knuth: multiplica uniformes hasta bajar de e^-media."""
    objetivo = math.exp(-media)
    k, p = 0, 1.0
    while True:
        p *= rng.random()
        if p <= objetivo:
            return k
        k += 1


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    suma_10 = 0
    for _ in range(n):
        if _sortear_poisson(rng, MEDIA_L) + _sortear_poisson(rng, MEDIA_M) == CONDICION:
            suma_10 += 1

    # Condicional por rechazo: solo cuentan las repeticiones con L+M = 10.
    rng = random.Random(777)
    casos = 0
    cuenta = {8: 0, 10: 0, 0: 0}
    mas_de_2 = 0
    while casos < 200_000:
        l = _sortear_poisson(rng, MEDIA_L)
        m = _sortear_poisson(rng, MEDIA_M)
        if l + m != CONDICION:
            continue
        casos += 1
        if m in cuenta:
            cuenta[m] += 1
        if m > 2:
            mas_de_2 += 1

    return {
        "a": suma_10 / n,
        "b1": cuenta[8] / casos,
        "b2": cuenta[10] / casos,
        "b3": cuenta[0] / casos,
        "c": mas_de_2 / casos,
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    import sympy as sp

    for k, v in exacto().items():
        print(f"  {k}: {sp.nsimplify(v)} = {float(v):.6f}")
