# -*- coding: utf-8 -*-
"""
Evaluacion parcial del 03-11-2018 (version 61.09 - 81.04).

  1. Moneda con P(cara) = 3/5, se tira hasta dos caras consecutivas. Si en los
     dos primeros tiros no salio cara, P(hacen falta mas de 5 tiros).
  2. f(x, y) = 2 en 0 < x < y < 1. P(X + Y > 1, Y < 0.75).
  3. X ~ Exp(1), Y | X = x ~ U(0, x). cov(X + Y, X - Y).
  4. Colectivos Poisson de 12 por hora; Kira sube al tercero despues de las
     8:00 y subio a las 8:30. P(entre 8:00 y 8:10 llego exactamente uno).
  5. Truchas U(1, 5); se conservan las de 3 kg o mas. Con 50 conservadas,
     P(peso total > 202.8).

Resuelta: fuentes/examenes/parciales/05 Parcial Resuelto - EP20181103Res.pdf,
paginas 7 a 11.
"""
from __future__ import annotations

import random
from fractions import Fraction
from itertools import product

import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, montecarlo

ID_EXAMEN = "ep-20181103"


# ----------------------------------------------------------------- ej 1

P_CARA = Fraction(3, 5)
TIROS = 5


def exacto_1() -> dict:
    # Se enumeran los tiros 3, 4 y 5 (los dos primeros son ceca por dato) y se
    # ve si aparecen dos caras seguidas antes del sexto tiro.
    termina = Fraction(0)
    for resto in product((0, 1), repeat=TIROS - 2):
        tiros = (0, 0) + resto
        p = Fraction(1)
        for t in resto:
            p *= P_CARA if t else 1 - P_CARA
        if any(tiros[i] and tiros[i + 1] for i in range(TIROS - 1)):
            termina += p
    return {"a": 1 - termina}


def estimado_1() -> dict:
    p = float(P_CARA)
    rng = random.Random(SEMILLA)
    casos = favorables = 0
    for _ in range(400_000):
        tiros, n = [], 0
        while True:
            tiros.append(rng.random() < p)
            n += 1
            if n >= 2 and tiros[-1] and tiros[-2]:
                break
        if not tiros[0] and not tiros[1]:
            casos += 1
            favorables += n > TIROS
    return {"a": favorables / casos}


# ----------------------------------------------------------------- ej 2

def exacto_2() -> dict:
    x, y = sp.symbols("x y", positive=True)
    # x < y, x + y > 1, y < 3/4: para cada y en (1/2, 3/4), x va de 1 - y a y.
    p = sp.integrate(sp.integrate(2, (x, 1 - y, y)), (y, sp.Rational(1, 2), sp.Rational(3, 4)))
    return {"a": p}


def estimado_2() -> dict:
    def punto(rng: random.Random) -> bool:
        a, b = rng.random(), rng.random()
        x, y = min(a, b), max(a, b)          # uniforme en el triangulo x < y
        return x + y > 1 and y < 0.75

    return {"a": montecarlo(punto)}


# ----------------------------------------------------------------- ej 3

def exacto_3() -> dict:
    x, y = sp.symbols("x y", positive=True)
    f = sp.exp(-x) / x                       # f_X(x) * f_{Y|X=x}(y) en 0 < y < x

    def e(g):
        return sp.integrate(sp.integrate(g * f, (y, 0, x)), (x, 0, sp.oo))

    cov = e((x + y) * (x - y)) - e(x + y) * e(x - y)
    return {"a": sp.simplify(cov)}


def estimado_3() -> dict:
    rng = random.Random(SEMILLA)
    # X^2 tiene cola pesada (E[X^4] = 24): con 2e6 muestras el error estandar
    # de la covarianza es ~0.003.
    n = 2_000_000
    s = d = sd = 0.0
    for _ in range(n):
        x = rng.expovariate(1)
        y = rng.uniform(0, x)
        s += x + y
        d += x - y
        sd += (x + y) * (x - y)
    return {"a": sd / n - (s / n) * (d / n)}


# ----------------------------------------------------------------- ej 4

INTENSIDAD = sp.Rational(12, 60)     # por minuto


def exacto_4() -> dict:
    # Que el tercero llegue a las 8:30 significa que en (8:00, 8:30) llegaron
    # exactamente 2. Dado eso, cada uno cae en los primeros 10 minutos con
    # probabilidad 1/3, independientemente.
    p = sp.Rational(10, 30)
    binomial = 2 * p * (1 - p)

    # Control por la definicion, con la densidad del tercer arribo.
    def poi(mu, k):
        return sp.exp(-mu) * mu**k / sp.factorial(k)

    lam = INTENSIDAD
    por_definicion = poi(lam * 10, 1) * poi(lam * 20, 1) / poi(lam * 30, 2)
    assert sp.simplify(binomial - por_definicion) == 0
    return {"a": binomial}


def estimado_4() -> dict:
    """
    Se condiciona a que el tercer arribo caiga en (30 - h, 30 + h), con h
    chico, que es la version simulable de "subio a las 8:30". El sesgo por el
    ancho de la ventana es de segundo orden y en t = 30 casi se anula; el
    error estandar con ~70000 casos aceptados es ~0.002.
    """
    lam, h = float(INTENSIDAD), 1.0
    rng = random.Random(SEMILLA)
    casos = favorables = 0
    for _ in range(4_000_000):
        t1 = rng.expovariate(lam)
        t2 = t1 + rng.expovariate(lam)
        t3 = t2 + rng.expovariate(lam)
        if abs(t3 - 30) < h:
            casos += 1
            favorables += (t1 <= 10) != (t2 <= 10)
    return {"a": favorables / casos}


# ----------------------------------------------------------------- ej 5

TRUCHAS, UMBRAL = 50, sp.Rational(2028, 10)


def exacto_5() -> dict:
    # Cada conservada es U(3, 5): media 4, varianza 4/12.
    media, var = 4, sp.Rational(1, 3)
    return {"a": sp.simplify(1 - Phi((UMBRAL - TRUCHAS * media) / sp.sqrt(TRUCHAS * var)))}


def estimado_5() -> dict:
    u = float(UMBRAL)
    return {"a": montecarlo(lambda rng: sum(rng.uniform(3, 5) for _ in range(TRUCHAS)) > u, n=200_000)}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("2", exacto_2, estimado_2),
    Ejercicio("3", exacto_3, estimado_3, tolerancia=0.015),
    Ejercicio("4", exacto_4, estimado_4, tolerancia=0.01),
    Ejercicio("5", exacto_5, estimado_5),
]
