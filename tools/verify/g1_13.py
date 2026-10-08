# -*- coding: utf-8 -*-
"""
Ejercicio 1.13 — urna con 10 bolas numeradas del 0 al 9, cinco extracciones.

El mismo juego de cuatro preguntas, una vez con reposicion y otra sin. Es el
ejercicio que separa las cuatro formas de contar (con y sin orden, con y sin
reposicion), asi que el exacto se hace contando sobre el espacio de muestras
ordenadas, que es donde los casos son equiprobables.

Las claves son "aN" y "bN" por el inciso y el numero de pregunta.
"""
from __future__ import annotations

import random
from fractions import Fraction
from math import factorial, perm

from comun import TOL_MONTECARLO, montecarlo

ID = "g1-13"
NUMERO = "1.13"

N = 10   # bolas, numeradas 0..9
K = 5    # extracciones
IMPARES = (1, 3, 5, 7, 9)

TOTAL_CON = N**K        # muestras ordenadas con reposicion
TOTAL_SIN = perm(N, K)  # muestras ordenadas sin reposicion


def exacto() -> dict[str, Fraction]:
    return {
        # --- (a) con reposicion ---
        # 1. las cinco iguales: 10 muestras constantes
        "a1": Fraction(N, TOTAL_CON),
        # 2. en el orden de extraccion se observan 1,3,5,7,9: una sola muestra
        "a2": Fraction(1, TOTAL_CON),
        # 3. se observan los cinco impares (en cualquier orden): 5! muestras
        "a3": Fraction(factorial(K), TOTAL_CON),
        # 4. las cinco distintas: 10*9*8*7*6 muestras
        "a4": Fraction(perm(N, K), TOTAL_CON),
        # --- (b) sin reposicion ---
        # 1. imposible: no se puede repetir
        "b1": Fraction(0),
        "b2": Fraction(1, TOTAL_SIN),
        "b3": Fraction(factorial(K), TOTAL_SIN),
        # 4. sin reposicion siempre salen distintas
        "b4": Fraction(1),
    }


def _con(rng: random.Random) -> list[int]:
    return [rng.randrange(N) for _ in range(K)]


def _sin(rng: random.Random) -> list[int]:
    return rng.sample(range(N), K)


PREGUNTAS = {
    "1": lambda m: len(set(m)) == 1,
    "2": lambda m: m == [1, 3, 5, 7, 9],
    "3": lambda m: set(m) == set(IMPARES),
    "4": lambda m: len(set(m)) == K,
}


def estimado() -> dict[str, float]:
    salida: dict[str, float] = {}
    for inciso, sortear in (("a", _con), ("b", _sin)):
        for n, ev in PREGUNTAS.items():
            salida[inciso + n] = montecarlo(lambda rng, s=sortear, e=ev: e(s(rng)))
    return salida


TOLERANCIA = TOL_MONTECARLO
