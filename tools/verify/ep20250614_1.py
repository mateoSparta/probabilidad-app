# -*- coding: utf-8 -*-
"""
Parcial del 14-06-2025, ejercicio 1.

Las piezas vienen en cajas de 10. El control elige dos piezas sin reposicion
y rechaza la caja si alguna es defectuosa. El proveedor pone defectuosas
segun un dado: si sale 1 no pone ninguna; si sale 2, 3, 4 o 5 pone 1; si sale
6 pone 4. Sabiendo que una caja fue rechazada, se pide la probabilidad de que
haya colocado a lo sumo una defectuosa.

Es Bayes con tres causas posibles. El exacto arma la tabla de causas y
calcula P(rechazo | d) por conteo hipergeometrico: el complemento de
"rechazar" es que las dos piezas elegidas sean buenas.
"""
from __future__ import annotations

import random
from fractions import Fraction
from math import comb

from comun import TOL_MONTECARLO

ID = "ep-20250614-1"
NUMERO = "1"

PIEZAS = 10
ELEGIDAS = 2

# Cuantas defectuosas pone, segun el dado, con su probabilidad.
CAUSAS = {
    0: Fraction(1, 6),   # sale 1
    1: Fraction(4, 6),   # sale 2, 3, 4 o 5
    4: Fraction(1, 6),   # sale 6
}


def p_rechazo(defectuosas: int) -> Fraction:
    """1 - P(las dos elegidas son buenas)."""
    buenas = PIEZAS - defectuosas
    if buenas < ELEGIDAS:
        return Fraction(1)
    return 1 - Fraction(comb(buenas, ELEGIDAS), comb(PIEZAS, ELEGIDAS))


def exacto() -> dict[str, Fraction]:
    assert sum(CAUSAS.values()) == 1, "las causas no suman 1"

    p_rech = sum((p * p_rechazo(d) for d, p in CAUSAS.items()), Fraction(0))
    conjunta = sum(
        (p * p_rechazo(d) for d, p in CAUSAS.items() if d <= 1), Fraction(0)
    )
    return {
        "a": conjunta / p_rech,
        # Se deja la marginal como control: es el denominador de Bayes.
        "p_rechazo": p_rech,
    }


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    casos = favorables = 0
    for _ in range(2_000_000):
        dado = rng.randint(1, 6)
        d = 0 if dado == 1 else (1 if dado <= 5 else 4)
        caja = [True] * d + [False] * (PIEZAS - d)   # True = defectuosa
        if any(rng.sample(caja, ELEGIDAS)):
            casos += 1
            if d <= 1:
                favorables += 1
    return {"a": favorables / casos if casos else 0.0}


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    e = exacto()
    print("P(a lo sumo una def | rechazada) =", e["a"], "=", float(e["a"]))
    print("P(rechazo) =", e["p_rechazo"], "=", float(e["p_rechazo"]))
