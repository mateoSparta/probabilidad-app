# -*- coding: utf-8 -*-
"""
Ejercicio 7.1 — las propiedades basicas del proceso de Poisson.

Intensidad 2. Recorre casi todo lo que hay que saber:

(a)-(b) un incremento N(a,b] es Poisson de media lambda*(b-a): solo importa el
        largo del intervalo, no donde esta.
(c)     los incrementos sobre intervalos **disjuntos** son independientes, asi
        que la conjunta es el producto. Da 16 e^-8, que es el ejemplo que
        PLAN.md usa en la seccion 4.4.
(d)     para intervalos que se **solapan**, la covarianza es la varianza del
        pedazo comun: cov(N(1,3), N(2,4)) = var(N(2,3)) = lambda * 1.
(e)     S_3 > t es lo mismo que N(t) <= 2: el tercer evento no llego todavia.
(f)     condicionado a S_3 = 1/2, los dos primeros eventos son uniformes
        independientes en (0, 1/2). Esto hace que la respuesta sea binomial y
        **no dependa de lambda**.
(g)     por incrementos independientes, lo que pasa despues de 1/4 no depende
        de lo que paso antes.
"""
from __future__ import annotations

import math
import random

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo

ID = "g7-01"
NUMERO = "7.1"

LAMBDA = 2


def pois(k: int, media) -> sp.Expr:
    return sp.Rational(1, math.factorial(k)) * sp.Rational(media) ** k * sp.exp(-sp.Rational(media))


def exacto() -> dict[str, sp.Expr]:
    return {
        "a": pois(0, LAMBDA * 1),
        "b": pois(1, LAMBDA * 1),
        # (c) incrementos disjuntos: producto
        "c": sp.simplify(pois(0, LAMBDA * 1) * pois(1, LAMBDA * 1) * pois(2, LAMBDA * 2)),
        # (d) cov = varianza del solapamiento (2,3], de largo 1
        "d": sp.Integer(LAMBDA * 1),
        # (e) P(S_3 > 1/2) = P(N(1/2) <= 2)
        "e": sp.simplify(sum(pois(k, sp.Rational(LAMBDA, 2)) for k in range(3))),
        # (f) dado S_3 = 1/2, los 2 primeros son U(0,1/2): binomial(2, 1/2)
        "f": sp.Rational(2, 1) * sp.Rational(1, 2) * sp.Rational(1, 2),
        # (g) P(N(1/4,1/2) <= 1), por incrementos independientes
        "g": sp.simplify(sum(pois(k, sp.Rational(LAMBDA, 4)) for k in range(2))),
    }


def _arribos(rng: random.Random, hasta: float) -> list[float]:
    """Tiempos de arribo de un Poisson de intensidad LAMBDA en (0, hasta]."""
    t = 0.0
    salida = []
    while True:
        t += rng.expovariate(LAMBDA)
        if t > hasta:
            return salida
        salida.append(t)


def _cuenta(arribos: list[float], a: float, b: float) -> int:
    return sum(1 for x in arribos if a < x <= b)


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 300_000

    # (a)-(c), (e), (g) por conteo directo
    a = b = c = e = 0
    xs, ys = [], []        # para la covarianza del (d)
    g_casos = g_fav = 0
    for _ in range(n):
        ar = _arribos(rng, 4.0)
        if _cuenta(ar, 0, 1) == 0:
            a += 1
        if _cuenta(ar, 1, 2) == 1:
            b += 1
        if _cuenta(ar, 0, 1) == 0 and _cuenta(ar, 1, 2) == 1 and _cuenta(ar, 2, 4) == 2:
            c += 1
        if _cuenta(ar, 0, 0.5) <= 2:
            e += 1
        xs.append(_cuenta(ar, 1, 3))
        ys.append(_cuenta(ar, 2, 4))
        if _cuenta(ar, 0, 0.25) == 1:
            g_casos += 1
            if _cuenta(ar, 0, 0.5) <= 2:
                g_fav += 1

    mx = sum(xs) / n
    my = sum(ys) / n
    cov = sum((p - mx) * (q - my) for p, q in zip(xs, ys)) / n

    # (f) condicionado a S_3 = 1/2: se simula directo la propiedad, sorteando
    # dos uniformes en (0, 1/2), que es lo que el enunciado afirma.
    f = montecarlo(
        lambda r: sum(1 for _ in range(2) if r.uniform(0, 0.5) < 0.25) == 1
    )

    return {
        "a": a / n,
        "b": b / n,
        "c": c / n,
        "d": cov,
        "e": e / n,
        "f": f,
        "g": g_fav / g_casos if g_casos else 0.0,
    }


# La covarianza del (d) vale 2 y tiene mas dispersion que una proporcion.
TOLERANCIA = 0.03

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
