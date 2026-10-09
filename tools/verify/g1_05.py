# -*- coding: utf-8 -*-
"""
Ejercicio 1.5 — dos urnas, una extraccion de cada una.

Urna a: 5 rojas, 3 blancas.  Urna b: 2 rojas, 3 blancas.
Las extracciones son independientes, una de cada urna.

El exacto enumera el producto de las dos urnas (8 x 5 = 40 pares
equiprobables), que es la forma de no equivocarse con los pesos.
"""
from __future__ import annotations

import itertools
from fractions import Fraction

from comun import TOL_MONTECARLO, exacto_sobre, montecarlo, urna

ID = "g1-05"
NUMERO = "1.5"

URNA_A = urna(roja=5, blanca=3)
URNA_B = urna(roja=2, blanca=3)

EVENTOS = {
    "a": lambda w: w[0] == "roja" and w[1] == "roja",
    "b": lambda w: w[0] == w[1],
    "c": lambda w: w[0] != w[1],
    "d": lambda w: w[1] == "blanca",
}


def exacto() -> dict[str, Fraction]:
    espacio = list(itertools.product(URNA_A, URNA_B))
    return {k: exacto_sobre(espacio, ev) for k, ev in EVENTOS.items()}


def estimado() -> dict[str, float]:
    def hacer(ev):
        return lambda rng: ev((rng.choice(URNA_A), rng.choice(URNA_B)))

    return {k: montecarlo(hacer(ev)) for k, ev in EVENTOS.items()}


TOLERANCIA = TOL_MONTECARLO
