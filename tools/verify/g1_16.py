# -*- coding: utf-8 -*-
"""
Ejercicio 1.16 — 7 gatos indistinguibles en 5 cajas.

El enunciado dice que los gatos son indistinguibles y que **todas las
configuraciones distintas son equiprobables**. Eso cambia el espacio
muestral: los casos equiprobables son las C(11,4) = 330 configuraciones
(n1,...,n5) con suma 7, no los 5^7 repartos de gatos distinguibles.

Es la trampa del ejercicio, y por eso el Monte Carlo sortea una
configuracion al azar entre las 330 y no un puerto por gato: simular gatos
distinguibles contestaria otra pregunta.
"""
from __future__ import annotations

import random
from fractions import Fraction

from comun import TOL_MONTECARLO, montecarlo

ID = "g1-16"
NUMERO = "1.16"

GATOS = 7
CAJAS = 5

EVENTOS = {
    # (a) la primera caja con exactamente dos gatos y la ultima vacia
    "a": lambda n: n[0] == 2 and n[-1] == 0,
    # (b) la cuarta caja con mas de 3 gatos
    "b": lambda n: n[3] > 3,
}


def configuraciones() -> list[tuple[int, ...]]:
    """Las (n1,...,n5) con n_i >= 0 y suma 7."""
    salida: list[tuple[int, ...]] = []

    def rec(resto: int, faltan: int, acum: tuple[int, ...]) -> None:
        if faltan == 1:
            salida.append(acum + (resto,))
            return
        for k in range(resto + 1):
            rec(resto - k, faltan - 1, acum + (k,))

    rec(GATOS, CAJAS, ())
    return salida


TODAS = configuraciones()


def exacto() -> dict[str, Fraction]:
    # C(7+5-1, 5-1) = C(11,4) = 330
    assert len(TODAS) == 330, f"se esperaban 330 configuraciones, hay {len(TODAS)}"
    return {
        k: Fraction(sum(1 for n in TODAS if ev(n)), len(TODAS)) for k, ev in EVENTOS.items()
    }


def estimado() -> dict[str, float]:
    return {
        k: montecarlo(lambda rng, e=ev: e(rng.choice(TODAS))) for k, ev in EVENTOS.items()
    }


TOLERANCIA = TOL_MONTECARLO
