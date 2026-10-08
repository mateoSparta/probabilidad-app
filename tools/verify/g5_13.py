# -*- coding: utf-8 -*-
"""
Ejercicio 5.13 — la rata en el laberinto.

Tres sendas equiprobables: la 1 la devuelve al inicio despues de 12 minutos,
la 2 despues de 14, y la 3 la saca en 9. Se pide el tiempo medio hasta salir.

Es esperanza total con **autorreferencia**: si vuelve al inicio, por falta de
memoria del mecanismo la espera que le queda tiene la misma media que la
original. Llamando m a E[T]:

    m = (1/3)(12 + m) + (1/3)(14 + m) + (1/3)(9)

y despejando m = 35. El error tipico es olvidar el "+ m" de las dos sendas que
vuelven, lo cual da 35/3 = 11.67, el promedio de los tres tiempos.

El Monte Carlo simula el recorrido completo de la rata, asi que verifica el
planteo autorreferente y no solo el despeje.
"""
from __future__ import annotations

import random

import sympy as sp

ID = "g5-13"
NUMERO = "5.13"

SENDAS = {1: (12, True), 2: (14, True), 3: (9, False)}  # (minutos, vuelve al inicio)


def exacto() -> dict[str, sp.Expr]:
    m = sp.Symbol("m", positive=True)
    ecuacion = sp.Eq(
        m,
        sum(
            sp.Rational(1, len(SENDAS)) * (t + (m if vuelve else 0))
            for t, vuelve in SENDAS.values()
        ),
    )
    soluciones = sp.solve(ecuacion, m)
    assert len(soluciones) == 1, f"se esperaba una sola solucion: {soluciones}"

    return {
        "a": sp.nsimplify(soluciones[0]),
        # El error tipico: promediar los tres tiempos sin el termino recursivo.
        "a_error_tipico": sp.Rational(sum(t for t, _ in SENDAS.values()), len(SENDAS)),
    }


def _recorrido(rng: random.Random, tope: int = 10_000) -> float:
    total = 0.0
    for _ in range(tope):
        minutos, vuelve = SENDAS[rng.randint(1, 3)]
        total += minutos
        if not vuelve:
            return total
    return total


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    return {"a": sum(_recorrido(rng) for _ in range(n)) / n}


# E[T] = 35 y el tiempo tiene cola geometrica: con 400.000 muestras el error
# estandar es como 0.04, asi que 0.5 son unos 12 sigma.
TOLERANCIA = 0.5

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
