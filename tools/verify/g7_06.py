# -*- coding: utf-8 -*-
"""
Ejercicio 7.6 — bolsas exponenciales hasta pasar los 5 kilos.

Es el mismo enunciado que el 5.23 pero con bolsas **exponenciales** de media 3
en lugar de uniformes, y eso cambia todo: ahora las bolsas acumuladas forman un
proceso de Poisson de intensidad 1/3 sobre el eje de los kilos.

Y entonces la falta de memoria resuelve el problema de una: lo que sobra por
encima de los 5 kilos —el "exceso"— vuelve a ser exponencial de media 3, sin
importar cuantas bolsas hicieron falta ni cuanto pesaba la ultima.

    P(peso final > 7) = P(exceso > 2) = e^{-2/3}

El error tipico es intentar sumar sobre la cantidad de bolsas. No hace falta.
El Monte Carlo agrega bolsas de verdad, asi que verifica esa simplificacion.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo

ID = "g7-06"
NUMERO = "7.6"

MEDIA_BOLSA = 3
OBJETIVO = 5
PREGUNTA = 7


def exacto() -> dict[str, sp.Expr]:
    exceso = sp.Rational(PREGUNTA - OBJETIVO)
    return {
        "a": sp.exp(-exceso / sp.Rational(MEDIA_BOLSA)),
        # Control: la media del exceso tiene que ser la de una bolsa.
        "media_exceso": sp.Integer(MEDIA_BOLSA),
    }


def _peso_final(rng: random.Random) -> float:
    acum = 0.0
    while acum <= OBJETIVO:
        acum += rng.expovariate(1 / MEDIA_BOLSA)
    return acum


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    excesos = [_peso_final(rng) - OBJETIVO for _ in range(n)]
    return {
        "a": sum(1 for e in excesos if e > PREGUNTA - OBJETIVO) / n,
        "media_exceso": sum(excesos) / n,
    }


# El exceso tiene media 3 y desvio 3: con 400.000 muestras el error estandar
# es como 0.005, asi que 0.05 son 10 sigma.
TOLERANCIA = 0.05

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
