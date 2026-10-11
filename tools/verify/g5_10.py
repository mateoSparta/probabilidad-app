# -*- coding: utf-8 -*-
"""
Ejercicio 5.10 — los RoboCops.

6 RoboCops, cada uno fallado con probabilidad 1/4; un fallado se detecta con
probabilidad 4/5. X = fallados, Y = fallados detectados.

  (a) Y | X = x ~ Bin(x, 4/5), asi que E[Y | X = x] = 4x/5.
  (b) Dado Y = y, los y detectados estan fallados seguro. Cada uno de los
      6 - y restantes esta fallado con P(fallado | no detectado)
      = (1/4)(1/5) / (1 - (1/4)(4/5)) = 1/16, independientemente.
      E[X | Y = y] = y + (6 - y)/16.

El exacto arma la conjunta de (X, Y) con Fraction y calcula las dos
esperanzas condicionales para todos los valores; el Monte Carlo las estima.
"""
from __future__ import annotations

import random
from fractions import Fraction as Fr
from math import comb

import sympy as sp

from comun import SEMILLA

ID = "g5-10"
NUMERO = "5.10"

N, P_FALLA, P_DETECTA = 6, Fr(1, 4), Fr(4, 5)


def conjunta() -> dict:
    p = {}
    for x in range(N + 1):
        px = comb(N, x) * P_FALLA**x * (1 - P_FALLA) ** (N - x)
        for y in range(x + 1):
            p[(x, y)] = px * comb(x, y) * P_DETECTA**y * (1 - P_DETECTA) ** (x - y)
    assert sum(p.values()) == 1
    return p


def exacto() -> dict:
    p = conjunta()
    phi = {}
    psi = {}
    for x in range(N + 1):
        px = sum(v for (a, _), v in p.items() if a == x)
        phi[x] = sum(b * v for (a, b), v in p.items() if a == x) / px
        assert phi[x] == Fr(4 * x, 5)
    for y in range(N + 1):
        py = sum(v for (_, b), v in p.items() if b == y)
        psi[y] = sum(a * v for (a, b), v in p.items() if b == y) / py
        assert psi[y] == y + Fr(N - y, 16)
    X, Y = sp.symbols("x y")
    return {
        "a": 4 * X / 5,
        "b": Y + (N - Y) / 16,
        "a_en_3": phi[3],
        "b_en_2": psi[2],
    }


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    s3 = c3 = s2 = c2 = 0
    for _ in range(600_000):
        fallados = sum(rng.random() < 0.25 for _ in range(N))
        detectados = sum(rng.random() < 0.8 for _ in range(fallados))
        if fallados == 3:
            c3 += 1
            s3 += detectados
        if detectados == 2:
            c2 += 1
            s2 += fallados
    return {"a_en_3": s3 / c3, "b_en_2": s2 / c2}


TOLERANCIA = 0.01
