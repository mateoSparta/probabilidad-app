# -*- coding: utf-8 -*-
"""
Ejercicio 5.11 — esperanza condicional sobre un espacio finito.

Omega = {1, ..., 12} equiprobable. X vale 1 en {1, 2}, 2 en {3, 4, 5, 6} y 3
en {7, ..., 12}. E[Y | X] es, en cada atomo de X, el promedio de Y sobre el
atomo.

  1. Y(w) = w:                     3/2, 9/2, 19/2
  2. Y(w) = sen(pi w/2 - pi/4):    sqrt2/2, 0, -sqrt2/6

El exacto promedia con sympy; el Monte Carlo sortea w.
"""
from __future__ import annotations

import math
import random

import sympy as sp

from comun import SEMILLA, TOL_MONTECARLO

ID = "g5-11"
NUMERO = "5.11"

ATOMOS = {1: range(1, 3), 2: range(3, 7), 3: range(7, 13)}


def Y2(w):
    return sp.sin(sp.pi * w / 2 - sp.pi / 4)


def exacto() -> dict:
    salida = {}
    for x, ws in ATOMOS.items():
        salida[f"a{x}"] = sp.Rational(sum(ws), len(ws))
        salida[f"b{x}"] = sp.nsimplify(sp.simplify(sum(Y2(w) for w in ws) / len(ws)))
    return salida


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    sumas = {k: [0.0, 0.0, 0] for k in ATOMOS}
    for _ in range(400_000):
        w = rng.randint(1, 12)
        x = 1 if w <= 2 else (2 if w <= 6 else 3)
        sumas[x][0] += w
        sumas[x][1] += math.sin(math.pi * w / 2 - math.pi / 4)
        sumas[x][2] += 1
    salida = {}
    for x, (s1, s2, c) in sumas.items():
        salida[f"a{x}"] = s1 / c
        salida[f"b{x}"] = s2 / c
    return salida


# La media de w sobre {7, ..., 12} tiene desvio ~1.7: con ~200000 casos, error ~0.004.
TOLERANCIA = 0.02
