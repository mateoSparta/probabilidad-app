# -*- coding: utf-8 -*-
"""
Ejercicio 8.15 — ganancia por vender 50 varillas.

La longitud tiene media 30 cm y desvio 2. El precio de venta en pesos es igual
a la longitud en cm, y el costo es 20 por varilla. Entonces la ganancia por
varilla es L - 20, con media 10 y desvio 2 (restar una constante no cambia la
dispersion).

La ganancia total por 50 varillas tiene media 500 y varianza 50 * 4 = 200, o
sea desvio 10 sqrt(2). Por el TCL se la aproxima por una normal y

    P(total > 460) ~ 1 - Phi( (460 - 500) / (10 sqrt 2) ) = Phi(2 sqrt 2)

Lo que vale notar: **no se dice de que distribucion es la longitud**, y no
hace falta. El TCL solo pide media y varianza finitas. Es el ejercicio que
muestra para que sirve el teorema.

El Monte Carlo usa dos distribuciones distintas para la longitud —normal y
uniforme, las dos con media 30 y desvio 2— y las dos tienen que dar el mismo
resultado. Eso verifica que la respuesta no dependa de la distribucion, que es
justamente lo que afirma el TCL.
"""
from __future__ import annotations

import math
import random

import sympy as sp

from comun import Phi, TOL_MONTECARLO

ID = "g8-15"
NUMERO = "8.15"

MEDIA_LARGO = 30
DESVIO_LARGO = 2
COSTO = 20
CANTIDAD = 50
UMBRAL = 460


def exacto() -> dict[str, sp.Expr]:
    media_total = sp.Integer(CANTIDAD * (MEDIA_LARGO - COSTO))
    var_total = sp.Integer(CANTIDAD * DESVIO_LARGO**2)
    desvio_total = sp.sqrt(var_total)

    z = (sp.Integer(UMBRAL) - media_total) / desvio_total
    return {
        "a": sp.simplify(1 - Phi(z)),
        "media_total": media_total,
        "desvio_total": sp.simplify(desvio_total),
    }


def _total(rng: random.Random, sortear_largo) -> float:
    return sum(sortear_largo(rng) - COSTO for _ in range(CANTIDAD))


def estimado() -> dict[str, float]:
    # Dos distribuciones con la misma media y el mismo desvio.
    def normal(rng):
        return rng.gauss(MEDIA_LARGO, DESVIO_LARGO)

    def uniforme(rng):
        # U(a,b) con media 30 y desvio 2: semiancho = 2 sqrt(3)
        h = DESVIO_LARGO * math.sqrt(3)
        return rng.uniform(MEDIA_LARGO - h, MEDIA_LARGO + h)

    salida = {}
    for nombre, sortear in (("a", normal), ("a_con_uniforme", uniforme)):
        rng = random.Random(20260408)
        n = 400_000
        salida[nombre] = sum(1 for _ in range(n) if _total(rng, sortear) > UMBRAL) / n
    return salida


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    e = exacto()
    for k, v in e.items():
        print(f"  {k}: {v} = {float(v):.6f}")
    est = estimado()
    print(f"  simulado con longitudes normales  = {est['a']:.6f}")
    print(f"  simulado con longitudes uniformes = {est['a_con_uniforme']:.6f}")
