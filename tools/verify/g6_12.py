# -*- coding: utf-8 -*-
"""
Ejercicio 6.12 — el estacionamiento que se llena.

Capacidad 3. Cada minuto pasa un coche y quiere estacionar con probabilidad
0.8. Se pide P(se llena en exactamente 10 minutos).

"Exactamente 10" quiere decir que el **tercer** coche que estaciona llega en el
minuto 10. Eso es Pascal (binomial negativa): hubo 2 exitos en los primeros 9
minutos y el tercero cae justo en el decimo.

    P = C(9, 2) p^3 (1-p)^7

El error tipico es usar la binomial y pedir "3 exitos en 10 minutos", que
cuenta tambien los casos en que el estacionamiento se lleno antes.
"""
from __future__ import annotations

import random
from fractions import Fraction
from math import comb

from comun import TOL_MONTECARLO, montecarlo

ID = "g6-12"
NUMERO = "6.12"

CAPACIDAD = 3
P_ESTACIONA = Fraction(8, 10)
MINUTO = 10


def exacto() -> dict[str, Fraction]:
    # Pascal: el k-esimo exito en el ensayo n
    pascal = (
        Fraction(comb(MINUTO - 1, CAPACIDAD - 1))
        * P_ESTACIONA**CAPACIDAD
        * (1 - P_ESTACIONA) ** (MINUTO - CAPACIDAD)
    )
    # El error tipico: binomial, "3 exitos en 10 minutos".
    binom = (
        Fraction(comb(MINUTO, CAPACIDAD))
        * P_ESTACIONA**CAPACIDAD
        * (1 - P_ESTACIONA) ** (MINUTO - CAPACIDAD)
    )
    return {"a": pascal, "a_error_tipico": binom}


def _minuto_en_que_se_llena(rng: random.Random, tope: int = 2000) -> int:
    estacionados = 0
    for minuto in range(1, tope + 1):
        if rng.random() < float(P_ESTACIONA):
            estacionados += 1
            if estacionados == CAPACIDAD:
                return minuto
    return tope + 1


def estimado() -> dict[str, float]:
    return {"a": montecarlo(lambda rng: _minuto_en_que_se_llena(rng) == MINUTO, n=2_000_000)}


# La probabilidad es como 0.0038: con 2 millones el error estandar es 4e-5.
TOLERANCIA = 0.0005

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
