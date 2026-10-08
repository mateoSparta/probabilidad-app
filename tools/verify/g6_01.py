# -*- coding: utf-8 -*-
"""
Ejercicio 6.1 — garantia de los paquetes de discos.

Cada disco es defectuoso con probabilidad 0.01, los paquetes son de 10, y la
garantia se incumple si hay **2 o mas** defectuosos en el paquete.

PLAN.md seccion 7 cita este ejercicio como un error conocido de las
resueltas: ahi se usa p = 0.01 para el paquete, cuando lo que corresponde es
P(X >= 2) con X ~ Binomial(10, 0.01), que da como 0.0043. Son dos ordenes de
magnitud de diferencia en la segunda parte, asi que el modelo deja los dos
numeros anotados.

La segunda parte es una binomial de segundo nivel: 3 paquetes, cada uno
incumple con esa probabilidad, y se pide exactamente uno.
"""
from __future__ import annotations

import random
from fractions import Fraction
from math import comb

from comun import TOL_MONTECARLO, montecarlo

ID = "g6-01"
NUMERO = "6.1"

P_DEFECTUOSO = Fraction(1, 100)
POR_PAQUETE = 10
PERMITIDOS = 1      # la garantia admite hasta 1 defectuoso
PAQUETES = 3


def binomial(k: int, n: int, p: Fraction) -> Fraction:
    return Fraction(comb(n, k)) * p**k * (1 - p) ** (n - k)


def exacto() -> dict[str, Fraction]:
    # (a) proporcion de paquetes que NO satisface la garantia
    p_falla = 1 - sum(
        binomial(k, POR_PAQUETE, P_DEFECTUOSO) for k in range(PERMITIDOS + 1)
    )

    # (b) de 3 paquetes, exactamente uno incumple
    p_uno = binomial(1, PAQUETES, p_falla)

    return {
        "a": p_falla,
        "b": p_uno,
        # El error que PLAN.md senala en las resueltas: usar 0.01 en lugar de
        # P(X >= 2) para el paquete.
        "b_error_de_la_resuelta": binomial(1, PAQUETES, P_DEFECTUOSO),
    }


def _paquete_falla(rng: random.Random) -> bool:
    malos = sum(1 for _ in range(POR_PAQUETE) if rng.random() < float(P_DEFECTUOSO))
    return malos > PERMITIDOS


def estimado() -> dict[str, float]:
    return {
        "a": montecarlo(_paquete_falla, n=4_000_000),
        "b": montecarlo(
            lambda rng: sum(1 for _ in range(PAQUETES) if _paquete_falla(rng)) == 1,
            n=4_000_000,
        ),
    }


# Las dos probabilidades son chicas (0.0043 y 0.013): con 4 millones de
# muestras el error estandar ronda 3e-5, asi que 0.0005 son muchos sigma.
TOLERANCIA = 0.0005

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
