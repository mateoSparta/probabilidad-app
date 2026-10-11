# -*- coding: utf-8 -*-
"""
Ejercicio 2.13 — distribuciones de G(X), F_X(X) y G^{-1}(F_X(X)).

Las respuestas son formulas, asi que los items van como opcion multiple. El
modelo verifica cada formula correcta con una X y una G concretas, y verifica
tambien que los distractores fallen:

  (a) T = G(X), G continua y estrictamente creciente:  F_T(t) = F_X(G^{-1}(t))
  (b) U = F_X(X):                                       uniforme en (0, 1)
  (c) V = G^{-1}(F_X(X)), G: R -> (0, 1) creciente:     F_V = G

Se usa X ~ Exp(1), G(x) = x^3 + x para (a) y la logistica
G(x) = 1 / (1 + e^{-x}) para (c). El exacto evalua las formulas; el Monte
Carlo mide las frecuencias de las variables transformadas.
"""
from __future__ import annotations

import math
import random

from comun import SEMILLA, TOL_MONTECARLO

ID = "g2-13"
NUMERO = "2.13"


def F_X(x: float) -> float:
    return 1 - math.exp(-x) if x > 0 else 0.0


def G_a(x: float) -> float:
    return x**3 + x


def G_a_inv(t: float) -> float:
    # x^3 + x = t tiene una sola raiz real; se busca por biseccion.
    lo, hi = -abs(t) - 1, abs(t) + 1
    for _ in range(200):
        m = (lo + hi) / 2
        if G_a(m) < t:
            lo = m
        else:
            hi = m
    return (lo + hi) / 2


def G_c(x: float) -> float:
    return 1 / (1 + math.exp(-x))


def G_c_inv(u: float) -> float:
    return math.log(u / (1 - u))


PUNTOS_A = (0.5, 2.0, 10.0)
PUNTOS_B = (0.2, 0.5, 0.9)
PUNTOS_C = (-1.0, 0.0, 1.5)


def exacto() -> dict:
    salida = {}
    for i, t in enumerate(PUNTOS_A, 1):
        salida[f"a{i}"] = F_X(G_a_inv(t))
        # El distractor F_X(G(t)) da otra cosa: tiene que diferir.
        assert abs(F_X(G_a(t)) - F_X(G_a_inv(t))) > 0.05
    for i, u in enumerate(PUNTOS_B, 1):
        salida[f"b{i}"] = u
    for i, v in enumerate(PUNTOS_C, 1):
        salida[f"c{i}"] = G_c(v)
        # Uniforme en (0, 1) es un distractor: en v = 1.5 no coincide.
    assert abs(G_c(1.5) - 1.5) > 0.5
    return salida


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    n = 400_000
    xs = [rng.expovariate(1) for _ in range(n)]
    t = [G_a(x) for x in xs]
    u = [F_X(x) for x in xs]
    v = [G_c_inv(min(max(ui, 1e-15), 1 - 1e-15)) for ui in u]
    salida = {}
    for i, p in enumerate(PUNTOS_A, 1):
        salida[f"a{i}"] = sum(1 for y in t if y <= p) / n
    for i, p in enumerate(PUNTOS_B, 1):
        salida[f"b{i}"] = sum(1 for y in u if y <= p) / n
    for i, p in enumerate(PUNTOS_C, 1):
        salida[f"c{i}"] = sum(1 for y in v if y <= p) / n
    return salida


TOLERANCIA = TOL_MONTECARLO
