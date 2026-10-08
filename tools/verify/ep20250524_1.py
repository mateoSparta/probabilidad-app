# -*- coding: utf-8 -*-
"""
Parcial del 24-05-2025, ejercicio 1.

En una caja hay 5 bolitas blancas, 1 verde y 3 azules. Se extraen al azar dos
bolitas. Si son del mismo color no se sacan mas; si no, se extraen otras dos
(sin reponer ninguna de las extraidas). Sabiendo que hubo una segunda
extraccion, en la cual se obtuvieron dos bolitas del mismo color, se pide la
probabilidad de que en la primera hayan salido exactamente una blanca y una
verde.

El exacto enumera el espacio completo: todos los pares ordenados de
"primera extraccion" y "segunda extraccion" sobre bolitas distinguibles. Con
9 bolitas eso es manejable y evita tener que razonar sobre el condicional:
se cuenta directamente sobre el evento condicionante.
"""
from __future__ import annotations

import random
from fractions import Fraction
from itertools import combinations

from comun import TOL_MONTECARLO

ID = "ep-20250524-1"
NUMERO = "1"

# Bolitas distinguibles, con su color.
CAJA = ["B"] * 5 + ["V"] + ["A"] * 3
INDICES = range(len(CAJA))


def exacto() -> dict[str, Fraction]:
    casos = 0            # hubo 2a extraccion y salieron dos del mismo color
    favorables = 0       # ademas, la 1a fue exactamente una blanca y una verde

    for primera in combinations(INDICES, 2):
        c1 = sorted(CAJA[i] for i in primera)
        if c1[0] == c1[1]:
            continue     # mismo color: no hay segunda extraccion
        resto = [i for i in INDICES if i not in primera]
        for segunda in combinations(resto, 2):
            c2 = [CAJA[i] for i in segunda]
            if c2[0] != c2[1]:
                continue
            # Cada (primera, segunda) tiene el mismo peso: la primera es
            # uniforme entre C(9,2) y la segunda entre C(7,2), y ese segundo
            # factor es el mismo para toda primera que llegue hasta aca.
            casos += 1
            if c1 == ["B", "V"]:
                favorables += 1

    assert casos > 0
    return {"a": Fraction(favorables, casos)}


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    casos = favorables = 0
    for _ in range(2_000_000):
        mezcla = CAJA[:]
        rng.shuffle(mezcla)
        c1 = sorted(mezcla[:2])
        if c1[0] == c1[1]:
            continue
        c2 = mezcla[2:4]
        if c2[0] != c2[1]:
            continue
        casos += 1
        if c1 == ["B", "V"]:
            favorables += 1
    return {"a": favorables / casos if casos else 0.0}


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    v = exacto()["a"]
    print("P =", v, "=", float(v))
