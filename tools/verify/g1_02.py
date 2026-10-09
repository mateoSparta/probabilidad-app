# -*- coding: utf-8 -*-
"""
Ejercicio 1.2 — inclusion-exclusion sobre 200 estudiantes.

De los 200: 137 cursan Algebra II (A), 60 Probabilidad (B), 124 Materiales (C),
33 A y B, 29 B y C, 92 A y C, 18 las tres.

Se arma la particion en las 8 regiones del diagrama de Venn a partir de los
datos y se cuenta sobre ella. Asi (a)-(e) salen del mismo modelo, y el Monte
Carlo sortea un estudiante de los 200 segun esa particion.
"""
from __future__ import annotations

import random
from fractions import Fraction

from comun import TOL_MONTECARLO, montecarlo

ID = "g1-02"
NUMERO = "1.2"

TOTAL = 200
N_A, N_B, N_C = 137, 60, 124
N_AB, N_BC, N_AC = 33, 29, 92
N_ABC = 18

# Las 8 regiones disjuntas, de los datos hacia afuera.
SOLO_ABC = N_ABC
SOLO_AB = N_AB - N_ABC
SOLO_BC = N_BC - N_ABC
SOLO_AC = N_AC - N_ABC
SOLO_A = N_A - SOLO_AB - SOLO_AC - SOLO_ABC
SOLO_B = N_B - SOLO_AB - SOLO_BC - SOLO_ABC
SOLO_C = N_C - SOLO_AC - SOLO_BC - SOLO_ABC
NINGUNA = TOTAL - (SOLO_A + SOLO_B + SOLO_C + SOLO_AB + SOLO_BC + SOLO_AC + SOLO_ABC)

# Cada region, con que materias cursa y cuanta gente tiene.
REGIONES: list[tuple[frozenset[str], int]] = [
    (frozenset("A"), SOLO_A),
    (frozenset("B"), SOLO_B),
    (frozenset("C"), SOLO_C),
    (frozenset("AB"), SOLO_AB),
    (frozenset("BC"), SOLO_BC),
    (frozenset("AC"), SOLO_AC),
    (frozenset("ABC"), SOLO_ABC),
    (frozenset(), NINGUNA),
]

EVENTOS = {
    "a": lambda m: "A" in m or "B" in m,
    "b": lambda m: "A" not in m and "B" not in m,
    "c": lambda m: len(m) >= 1,
    "d": lambda m: len(m) == 1,
    "e": lambda m: len(m) == 0,
}


def exacto() -> dict[str, Fraction]:
    assert sum(n for _, n in REGIONES) == TOTAL, "la particion no suma 200"
    assert all(n >= 0 for _, n in REGIONES), "hay una region negativa: datos inconsistentes"
    return {
        k: Fraction(sum(n for m, n in REGIONES if ev(m)), TOTAL) for k, ev in EVENTOS.items()
    }


def _sortear_estudiante(rng: random.Random) -> frozenset[str]:
    poblacion = [m for m, n in REGIONES for _ in range(n)]
    return rng.choice(poblacion)


def estimado() -> dict[str, float]:
    poblacion = [m for m, n in REGIONES for _ in range(n)]

    def hacer(ev):
        return lambda rng: ev(rng.choice(poblacion))

    return {k: montecarlo(hacer(ev)) for k, ev in EVENTOS.items()}


TOLERANCIA = TOL_MONTECARLO
