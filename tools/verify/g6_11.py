# -*- coding: utf-8 -*-
"""
Ejercicio 6.11 — ver los tres colores de un dado desbalanceado.

El dado tiene una cara roja, dos amarillas y tres verdes, asi que los colores
NO son equiprobables: 1/6, 2/6 y 3/6. Se pide la media de lanzamientos hasta
haber visto los tres.

Es el problema del coleccionista, pero con probabilidades distintas, asi que
la formula del caso equiprobable no sirve. El camino que funciona es

    E[T] = suma_{t >= 0} P(T > t)

y P(T > t) —que falte algun color despues de t tiros— sale por
inclusion-exclusion sobre los tres colores. Cada termino es una serie
geometrica, asi que la suma cierra.

El modelo hace la inclusion-exclusion con sympy y el Monte Carlo tira el dado
hasta ver los tres colores, lo cual verifica el planteo completo.
"""
from __future__ import annotations

import random

import sympy as sp

ID = "g6-11"
NUMERO = "6.11"

# color -> probabilidad
COLORES = {"rojo": sp.Rational(1, 6), "amarillo": sp.Rational(2, 6), "verde": sp.Rational(3, 6)}


def exacto() -> dict[str, sp.Expr]:
    assert sum(COLORES.values()) == 1, "las probabilidades no suman 1"

    t = sp.Symbol("t", nonnegative=True, integer=True)
    nombres = list(COLORES)
    total = sp.Integer(0)

    # Inclusion-exclusion: suma sobre subconjuntos no vacios de colores que
    # podrian estar faltando, con signo alternado.
    for tamano in range(1, len(nombres) + 1):
        signo = (-1) ** (tamano - 1)
        for faltantes in _combinaciones(nombres, tamano):
            # P(no sale ninguno de `faltantes` en t tiros)
            p_resto = 1 - sum(COLORES[c] for c in faltantes)
            if p_resto == 0:
                continue   # la serie de 0^t aporta solo el termino t = 0
            total += signo * sp.summation(p_resto**t, (t, 0, sp.oo))
        # El caso p_resto = 0 aporta 1 (el termino t = 0 de 0^t).
        for faltantes in _combinaciones(nombres, tamano):
            if 1 - sum(COLORES[c] for c in faltantes) == 0:
                total += signo * 1

    return {"a": sp.nsimplify(sp.simplify(total))}


def _combinaciones(xs, k):
    from itertools import combinations

    return list(combinations(xs, k))


def _tiradas_hasta_los_tres(rng: random.Random) -> int:
    caras = ["rojo"] + ["amarillo"] * 2 + ["verde"] * 3
    vistos = set()
    tiradas = 0
    while len(vistos) < 3:
        vistos.add(rng.choice(caras))
        tiradas += 1
    return tiradas


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    return {"a": sum(_tiradas_hasta_los_tres(rng) for _ in range(n)) / n}


# E[T] = 6.3 con cola geometrica: el error estandar ronda 0.006.
TOLERANCIA = 0.05

if __name__ == "__main__":
    v = exacto()["a"]
    print(f"  E[T] = {v} = {float(v):.6f}")
