# -*- coding: utf-8 -*-
"""
Ejercicio 1.15 — 13 piratas eligen al azar entre 3 puertos.

Cada pirata elige con probabilidad 1/3 y de forma independiente, asi que el
vector de ocupaciones (n1, n2, n3) es multinomial. El exacto suma pesos
multinomiales sobre las composiciones de 13 en 3 partes, que son 105: mucho
mas barato que recorrer los 3^13 resultados, y da lo mismo.

El inciso (d) ("que Morgan se encuentre entre los 13 piratas") no es una
pregunta de probabilidad sobre este modelo: no se carga, queda anotado en
revision/guia-1.md.
"""
from __future__ import annotations

import random
from fractions import Fraction
from math import factorial

from comun import TOL_MONTECARLO, montecarlo

ID = "g1-15"
NUMERO = "1.15"

PIRATAS = 13
PUERTOS = 3

# Orden de los puertos: 0 Portobelo, 1 Maracaibo, 2 Gibraltar.
PORTOBELO, MARACAIBO, GIBRALTAR = 0, 1, 2

EVENTOS = {
    # (a) cuatro en Portobelo, cuatro en Maracaibo y cinco en Gibraltar
    "a": lambda n: n == (4, 4, 5),
    # (b) exactamente 6 en Portobelo y seis o mas en Maracaibo
    "b": lambda n: n[PORTOBELO] == 6 and n[MARACAIBO] >= 6,
    # (c) en algun puerto exactamente cinco y en algun otro exactamente cuatro
    "c": lambda n: sorted(n) == [4, 4, 5],
}


def composiciones():
    """Todos los (n1, n2, n3) con n1+n2+n3 = 13, con su peso multinomial."""
    total = Fraction(PUERTOS) ** PIRATAS
    for a in range(PIRATAS + 1):
        for b in range(PIRATAS - a + 1):
            c = PIRATAS - a - b
            maneras = factorial(PIRATAS) // (factorial(a) * factorial(b) * factorial(c))
            yield (a, b, c), Fraction(maneras) / total


def exacto() -> dict[str, Fraction]:
    tabla = list(composiciones())
    assert sum(p for _, p in tabla) == 1, "los pesos multinomiales no suman 1"
    return {k: sum((p for n, p in tabla if ev(n)), Fraction(0)) for k, ev in EVENTOS.items()}


def _desembarcar(rng: random.Random) -> tuple[int, int, int]:
    n = [0, 0, 0]
    for _ in range(PIRATAS):
        n[rng.randrange(PUERTOS)] += 1
    return tuple(n)  # type: ignore[return-value]


def estimado() -> dict[str, float]:
    return {
        k: montecarlo(lambda rng, e=ev: e(_desembarcar(rng))) for k, ev in EVENTOS.items()
    }


TOLERANCIA = TOL_MONTECARLO
