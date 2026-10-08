# -*- coding: utf-8 -*-
"""
Ejercicio 1.4 — un dado equilibrado se arroja dos veces.

El espacio muestral son los 36 pares equiprobables, asi que el valor exacto
es conteo directo. El Monte Carlo sortea dos dados.
"""
from __future__ import annotations

from fractions import Fraction

from comun import TOL_MONTECARLO, dados, exacto_sobre, montecarlo

ID = "g1-04"
NUMERO = "1.4"

EVENTOS = {
    "a": lambda w: w[0] + w[1] == 7,
    "b": lambda w: w[0] > w[1],
    "c": lambda w: w[0] != w[1] and w[0] + w[1] <= 7,
    "d": lambda w: abs(w[0] - w[1]) > 1,
}


def exacto() -> dict[str, Fraction]:
    return {k: exacto_sobre(dados(2), ev) for k, ev in EVENTOS.items()}


def estimado() -> dict[str, float]:
    def hacer(ev):
        return lambda rng: ev((rng.randint(1, 6), rng.randint(1, 6)))

    return {k: montecarlo(hacer(ev)) for k, ev in EVENTOS.items()}


TOLERANCIA = TOL_MONTECARLO
