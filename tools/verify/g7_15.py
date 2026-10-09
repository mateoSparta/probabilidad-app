# -*- coding: utf-8 -*-
"""
Ejercicio 7.15 — Poisson compuesto.

Clientes Poisson de intensidad 4 por hora, y cada servicio consume un tiempo
normal de media 5 minutos y desvio 1/2. Se pide la media y la varianza del
tiempo total de trabajo en una hora.

El total es una suma con una cantidad **aleatoria** de terminos:
T = X_1 + ... + X_N con N ~ Poisson(4). Para eso:

    E[T]   = E[N] E[X]                        = 4 * 5  = 20
    var[T] = E[N] var[X] + var[N] E[X]^2      = 4*0.25 + 4*25 = 101

La segunda formula sale de la varianza total, y el termino que mas pesa es el
segundo: la variabilidad no viene tanto de que cada servicio dure distinto
(desvio 1/2) sino de que **la cantidad de clientes varie**. De los 101, 100
vienen de ahi.

El error tipico es usar var[T] = E[N] var[X] y olvidar ese termino, lo cual
subestima la varianza en un factor de 100.
"""
from __future__ import annotations

import math
import random

import sympy as sp

ID = "g7-15"
NUMERO = "7.15"

INTENSIDAD = 4          # clientes por hora
MEDIA_SERVICIO = 5      # minutos
DESVIO_SERVICIO = sp.Rational(1, 2)


def exacto() -> dict[str, sp.Expr]:
    e_n = sp.Integer(INTENSIDAD)
    var_n = sp.Integer(INTENSIDAD)       # Poisson: media = varianza
    e_x = sp.Integer(MEDIA_SERVICIO)
    var_x = DESVIO_SERVICIO**2

    return {
        "a1": sp.simplify(e_n * e_x),
        "a2": sp.simplify(e_n * var_x + var_n * e_x**2),
        # El error tipico: quedarse con el primer termino.
        "a2_error_tipico": sp.simplify(e_n * var_x),
    }


def _sortear_poisson(rng: random.Random, media: float) -> int:
    objetivo = math.exp(-media)
    k, p = 0, 1.0
    while True:
        p *= rng.random()
        if p <= objetivo:
            return k
        k += 1


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    totales = []
    for _ in range(n):
        clientes = _sortear_poisson(rng, INTENSIDAD)
        totales.append(
            sum(rng.gauss(MEDIA_SERVICIO, float(DESVIO_SERVICIO)) for _ in range(clientes))
        )
    m = sum(totales) / n
    return {"a1": m, "a2": sum((x - m) ** 2 for x in totales) / n}


# E[T] = 20 y var[T] = 101: el error estandar de la varianza ronda 0.5.
TOLERANCIA = 2.0

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
