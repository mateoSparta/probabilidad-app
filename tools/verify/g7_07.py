# -*- coding: utf-8 -*-
"""
Ejercicio 7.7 — condicionar a N(t) = n.

Llamadas Poisson de intensidad 4 por hora. Se sabe que entre las 9:00 y las
10:00 arribaron **exactamente 3**.

La propiedad que resuelve todo: condicionado a N(1 hora) = 3, los tres tiempos
de arribo son **uniformes independientes** en esa hora. Deja de haber proceso
de Poisson; quedan tres puntos tirados al azar en el intervalo.

Y entonces las dos respuestas son binomiales y **no dependen de la
intensidad**: el 4 por hora desaparece de la cuenta. Eso es lo que conviene
notar.

  (a) la primera antes de 9:15  =  P(al menos una de las 3 cae en el primer cuarto)
  (b) la segunda antes de 9:30  =  P(al menos dos de las 3 caen en la primera mitad)
"""
from __future__ import annotations

import random
from fractions import Fraction
from math import comb

from comun import TOL_MONTECARLO, montecarlo

ID = "g7-07"
NUMERO = "7.7"

ARRIBOS = 3


def binomial(k: int, n: int, p: Fraction) -> Fraction:
    return Fraction(comb(n, k)) * p**k * (1 - p) ** (n - k)


def exacto() -> dict[str, Fraction]:
    # (a) al menos 1 de 3 en el primer cuarto de hora
    p_cuarto = Fraction(1, 4)
    a = 1 - binomial(0, ARRIBOS, p_cuarto)

    # (b) al menos 2 de 3 en la primera media hora
    p_mitad = Fraction(1, 2)
    b = 1 - binomial(0, ARRIBOS, p_mitad) - binomial(1, ARRIBOS, p_mitad)

    return {"a": a, "b": b}


def _tres_uniformes(rng: random.Random) -> list[float]:
    """Los tres arribos condicionados a N(1) = 3: uniformes en (0,1) de hora."""
    return sorted(rng.random() for _ in range(ARRIBOS))


def estimado() -> dict[str, float]:
    return {
        "a": montecarlo(lambda r: _tres_uniformes(r)[0] < 0.25),
        "b": montecarlo(lambda r: _tres_uniformes(r)[1] < 0.5),
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
