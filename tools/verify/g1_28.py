# -*- coding: utf-8 -*-
"""
Ejercicio 1.28 — independencia condicional contra independencia.

(a) Dos monedas, a con P(cara)=1/2 y b con P(cara)=1/3. Se elige una al azar
    y se la tira dos veces. Dado que se eligio la a, los tiros son
    independientes; sin condicionar, no lo son, porque el resultado del
    primer tiro informa sobre cual moneda se eligio.

(b) Una moneda equilibrada, dos tiros. Los tiros son independientes; dado
    "salio al menos una ceca", dejan de serlo.

El par de incisos muestra que la independencia no se hereda en ninguna de
las dos direcciones. Como las respuestas son "si" o "no", lo que se verifica
son las cuatro probabilidades que las sostienen: se comparan P(A1 n A2)
contra P(A1)P(A2) en cada escenario, enumerando el espacio muestral con
pesos exactos.
"""
from __future__ import annotations

import random
from fractions import Fraction
from itertools import product

from comun import TOL_MONTECARLO, montecarlo

ID = "g1-28"
NUMERO = "1.28"

P_A = Fraction(1, 2)   # moneda a
P_B = Fraction(1, 3)   # moneda b


def espacio_a() -> dict[tuple[str, str, str], Fraction]:
    """(moneda, tiro1, tiro2) -> probabilidad."""
    h: dict[tuple[str, str, str], Fraction] = {}
    for moneda, p in (("a", P_A), ("b", P_B)):
        for t1, t2 in product("CX", repeat=2):   # C cara, X ceca
            peso = Fraction(1, 2)
            for t in (t1, t2):
                peso *= p if t == "C" else 1 - p
            h[(moneda, t1, t2)] = peso
    return h


def espacio_b() -> dict[tuple[str, str], Fraction]:
    return {(t1, t2): Fraction(1, 4) for t1, t2 in product("CX", repeat=2)}


def _p(espacio: dict, evento) -> Fraction:
    return sum((v for k, v in espacio.items() if evento(k)), Fraction(0))


def _condicional(espacio: dict, evento, dado) -> Fraction:
    base = _p(espacio, dado)
    return _p(espacio, lambda k: dado(k) and evento(k)) / base


def exacto() -> dict[str, Fraction]:
    ea = espacio_a()
    assert sum(ea.values()) == 1
    eb = espacio_b()

    # --- (a) condicionando a la moneda a ---
    es_a = lambda k: k[0] == "a"
    a1_a = lambda k: k[1] == "C"
    a2_a = lambda k: k[2] == "C"

    # --- (b) moneda equilibrada, B = al menos una ceca ---
    hay_ceca = lambda k: "X" in k
    a1_b = lambda k: k[0] == "C"
    a2_b = lambda k: k[1] == "C"

    return {
        # (a) dado B: P(A1 n A2 | B) contra P(A1|B) P(A2|B) -> iguales (1/4)
        "a_cond_conjunta": _condicional(ea, lambda k: a1_a(k) and a2_a(k), es_a),
        "a_cond_producto": _condicional(ea, a1_a, es_a) * _condicional(ea, a2_a, es_a),
        # (a) sin condicionar: 13/72 contra 25/144 -> distintos
        "a_conjunta": _p(ea, lambda k: a1_a(k) and a2_a(k)),
        "a_producto": _p(ea, a1_a) * _p(ea, a2_a),
        # (b) sin condicionar: 1/4 contra 1/4 -> iguales
        "b_conjunta": _p(eb, lambda k: a1_b(k) and a2_b(k)),
        "b_producto": _p(eb, a1_b) * _p(eb, a2_b),
        # (b) dado B: 0 contra 1/9 -> distintos
        "b_cond_conjunta": _condicional(eb, lambda k: a1_b(k) and a2_b(k), hay_ceca),
        "b_cond_producto": _condicional(eb, a1_b, hay_ceca) * _condicional(eb, a2_b, hay_ceca),
    }


def _tirar_a(rng: random.Random) -> tuple[str, str, str]:
    moneda = "a" if rng.random() < 0.5 else "b"
    p = float(P_A if moneda == "a" else P_B)
    return moneda, ("C" if rng.random() < p else "X"), ("C" if rng.random() < p else "X")


def estimado() -> dict[str, float]:
    # Solo se simulan las probabilidades no condicionadas; las condicionales
    # se verifican con el exacto, que enumera el espacio completo.
    return {
        "a_conjunta": montecarlo(lambda rng: all(t == "C" for t in _tirar_a(rng)[1:])),
        "b_conjunta": montecarlo(lambda rng: rng.random() < 0.5 and rng.random() < 0.5),
    }


TOLERANCIA = TOL_MONTECARLO
