# -*- coding: utf-8 -*-
"""
Ejercicio 1.7 — se tira un dado hasta el primer 6; N = numero de tiradas.

N es geometrica de parametro 1/6: P(N = n) = (5/6)^(n-1) (1/6), y
P(N > n) = (5/6)^n, que es la probabilidad de n fracasos seguidos.

El exacto es simbolico (sympy), no conteo: el espacio muestral es infinito.
El Monte Carlo simula la sucesion de tiradas hasta el primer 6, lo cual es
justamente lo que hay que chequear: que la formula describa el experimento.
"""
from __future__ import annotations

import random
from fractions import Fraction

from comun import TOL_MONTECARLO, montecarlo

ID = "g1-07"
NUMERO = "1.7"

P_EXITO = Fraction(1, 6)
Q = 1 - P_EXITO


def p_igual(n: int) -> Fraction:
    """P(N = n)."""
    return Q ** (n - 1) * P_EXITO


def p_mayor(n: int) -> Fraction:
    """P(N > n): n fracasos seguidos."""
    return Q**n


def exacto() -> dict[str, Fraction]:
    return {
        # (b) P(A_1), P(A_8)
        "b1": p_igual(1),
        "b8": p_igual(8),
        # (c) P(B_8); P(B_1) se deja como control
        "c": p_mayor(8),
        "c1": p_mayor(1),
        # (e) P(B) con B = interseccion de todos los B_n: el dado nunca sale 6
        "e": Fraction(0),
    }


def _tirar_hasta_seis(rng: random.Random, tope: int = 400) -> int:
    """Devuelve N, o tope+1 si no salio 6 (la cola es despreciable)."""
    for i in range(1, tope + 1):
        if rng.randint(1, 6) == 6:
            return i
    return tope + 1


def estimado() -> dict[str, float]:
    return {
        "b1": montecarlo(lambda rng: _tirar_hasta_seis(rng) == 1),
        "b8": montecarlo(lambda rng: _tirar_hasta_seis(rng) == 8),
        "c": montecarlo(lambda rng: _tirar_hasta_seis(rng) > 8),
        "c1": montecarlo(lambda rng: _tirar_hasta_seis(rng) > 1),
        "e": montecarlo(lambda rng: _tirar_hasta_seis(rng) > 400),
    }


TOLERANCIA = TOL_MONTECARLO
