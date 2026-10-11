# -*- coding: utf-8 -*-
"""
Ejercicio 4.1 — transformaciones de una variable discreta.

X toma los valores k/8, k = 0, ..., 8, con p_X(x) = (2/9) x, o sea
P(X = k/8) = k/36. Suma 1: (0 + 1 + ... + 8)/36 = 36/36.

Las cuatro transformaciones, evaluadas en x = k/8:
  (a) 2X - 1 = k/4 - 1                  inyectiva
  (b) 128 X^2 = 2 k^2                   inyectiva en el soporte
  (c) -64X^2 + 64X + 2 = 2 + k(8 - k)   simetrica en k <-> 8 - k
  (d) 64X^2 - 96X + 128 = k^2 - 12k + 128   simetrica en k <-> 12 - k

En (c) y (d) valores distintos de X caen en el mismo Y y las probabilidades
se suman. Es el analogo discreto del 4.6.

El exacto suma con Fraction sobre el soporte; el Monte Carlo sortea X.
"""
from __future__ import annotations

import random
from collections import Counter
from fractions import Fraction as Fr

from comun import SEMILLA, TOL_MONTECARLO

ID = "g4-01"
NUMERO = "4.1"

SOPORTE = {Fr(k, 8): Fr(k, 36) for k in range(9)}

G = {
    "a": lambda x: 2 * x - 1,
    "b": lambda x: 128 * x**2,
    "c": lambda x: -64 * x**2 + 64 * x + 2,
    "d": lambda x: 64 * x**2 - 96 * x + 128,
}

# Lo que se pregunta de cada una: ("p", y) es p_Y(y); ("<=", y) es P(Y <= y);
# (">", y) es P(Y > y).
PREGUNTAS = {
    "a": [("p", Fr(-1, 2)), ("p", Fr(1)), ("<=", Fr(0))],
    "b": [("p", Fr(18)), ("p", Fr(128)), (">", Fr(50))],
    "c": [("p", Fr(2)), ("p", Fr(17)), ("p", Fr(18))],
    "d": [("p", Fr(92)), ("p", Fr(93)), ("p", Fr(96)), ("p", Fr(128))],
}


def evaluar(dist, tipo, y):
    if tipo == "p":
        return dist.get(y, 0)
    if tipo == "<=":
        return sum(p for v, p in dist.items() if v <= y)
    return sum(p for v, p in dist.items() if v > y)


def exacto() -> dict:
    assert sum(SOPORTE.values()) == 1
    salida = {}
    for item, g in G.items():
        dist: dict = {}
        for x, p in SOPORTE.items():
            dist[g(x)] = dist.get(g(x), 0) + p
        assert sum(dist.values()) == 1
        for i, (tipo, y) in enumerate(PREGUNTAS[item], 1):
            salida[f"{item}{i}"] = Fr(evaluar(dist, tipo, y))
    return salida


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    n = 400_000
    xs = rng.choices(list(SOPORTE), weights=[float(p) for p in SOPORTE.values()], k=n)
    salida = {}
    for item, g in G.items():
        cuenta = Counter(g(x) for x in xs)
        dist = {y: c / n for y, c in cuenta.items()}
        for i, (tipo, y) in enumerate(PREGUNTAS[item], 1):
            salida[f"{item}{i}"] = float(evaluar(dist, tipo, y))
    return salida


TOLERANCIA = TOL_MONTECARLO
