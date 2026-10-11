# -*- coding: utf-8 -*-
"""
Ejercicio 2.2 — una funcion de distribucion dada por su grafico.

El grafico (pagina 13 de la guia) se lee asi:

    F(x) = 0                 x < -2
           1/3               -2 <= x < -1
           1/3 + (x+1)/6     -1 <= x < 1
           2/3               1 <= x < 2
           1                 x >= 2

Dos saltos de 1/3, en -2 y en 2 (los puntos llenos del grafico), y un tramo
lineal de 1/3 a 2/3 entre -1 y 1, que es una densidad de 1/6. La masa suma
1/3 + 1/3 + 1/3 = 1, que es el control de la lectura.

El exacto trabaja con la F y sus limites laterales; el Monte Carlo sortea X
como la mezcla que describe el grafico (un atomo en cada extremo y una
uniforme en el medio) y cuenta frecuencias.
"""
from __future__ import annotations

import random
from fractions import Fraction as Fr

from comun import SEMILLA, TOL_MONTECARLO

ID = "g2-02"
NUMERO = "2.2"


INF = float("inf")

# (a, b, f): la expresion vale en [a, b).
TRAMOS = [
    (-INF, -2, lambda x: Fr(0)),
    (-2, -1, lambda x: Fr(1, 3)),
    (-1, 1, lambda x: Fr(1, 3) + (x + 1) / 6),
    (1, 2, lambda x: Fr(2, 3)),
    (2, INF, lambda x: Fr(1)),
]


def F(x: Fr) -> Fr:
    return next(f(x) for a, b, f in TRAMOS if a <= x < b)


def F_izq(x: Fr) -> Fr:
    """F(x-): el tramo que termina en x (o que contiene a x por dentro)."""
    return next(f(x) for a, b, f in TRAMOS if a < x <= b)


def exacto() -> dict:
    atomos = {x: F(Fr(x)) - F_izq(Fr(x)) for x in (-2, -1, 1, 2)}
    assert atomos == {-2: Fr(1, 3), -1: 0, 1: 0, 2: Fr(1, 3)}, atomos
    # Control: la parte continua tiene densidad 1/6 en (-1, 1) y masa 1/3.
    assert F_izq(Fr(1)) - F(Fr(-1)) == Fr(1, 3)

    m, d = Fr(-2), Fr(2)
    p_menor_2 = F_izq(d)
    return {
        # (b)
        "b1": F(d) - F(m),                 # P(-2 < X <= 2)
        "b2": F(d) - F_izq(m),             # P(-2 <= X <= 2)
        "b3": F_izq(d) - F_izq(m),         # P(-2 <= X < 2)
        "b4": F_izq(d) - F(m),             # P(-2 < X < 2)
        # (c)
        "c1": F_izq(Fr(-1)) - F(Fr(-2)),   # P(X en (-2, -1))
        "c2": F(Fr(1)) - F_izq(Fr(-1)),    # P(|X| <= 1)
        "c3": F_izq(Fr(2)) - F(Fr(1)),     # P(X en (1, 2))
        # (d)
        "d1": F(Fr(3, 2)) / p_menor_2,     # P(X <= 1.5 | X < 2)
        "d2": F(Fr(3, 2)) / F(d),          # P(X <= 1.5 | X <= 2)
        # (e)
        "e": atomos[-2] / (atomos[-2] + atomos[2]),
    }


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    n = 400_000
    xs = []
    for _ in range(n):
        u = rng.random()
        xs.append(-2.0 if u < 1 / 3 else (2.0 if u < 2 / 3 else rng.uniform(-1, 1)))

    def p(cond) -> float:
        return sum(1 for x in xs if cond(x)) / n

    menor2 = p(lambda x: x < 2)
    return {
        "b1": p(lambda x: -2 < x <= 2),
        "b2": p(lambda x: -2 <= x <= 2),
        "b3": p(lambda x: -2 <= x < 2),
        "b4": p(lambda x: -2 < x < 2),
        "c1": p(lambda x: -2 < x < -1),
        "c2": p(lambda x: abs(x) <= 1),
        "c3": p(lambda x: 1 < x < 2),
        "d1": p(lambda x: x <= 1.5 and x < 2) / menor2,
        "d2": p(lambda x: x <= 1.5),
        "e": p(lambda x: x == -2) / p(lambda x: abs(x) == 2),
    }


TOLERANCIA = TOL_MONTECARLO
