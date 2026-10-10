# -*- coding: utf-8 -*-
"""
Segundo recuperatorio del 07-12-2017 (version 61.09 - 81.04).

  1. Detector de spam: P(spam) = 0.15, detecta el spam con 0.8 y marca un mail
     legitimo con 0.1. P(no es spam | detectado como spam).
  2. X ~ U(-1, 1) e Y | X = x ~ U(-x, 1). E[XY].
  3. Dado con caras roja, amarilla x2, verde x3, tirado 5 veces.
     P(mayoria de verdes y al menos una amarilla).
  4. Pinas Poisson de 1 por hora; cada una rompe una teja con 0.25.
     cov(pinas caidas de 10 a 13, tejas rotas de 11 a 15).
  5. TCL: mozzarella U(250, 350) por pizza, hay 50 kg. Maxima cantidad de
     pizzas con probabilidad mayor que 0.95 de que alcance.

Resuelta: fuentes/examenes/parciales/09 Parcial Resuelto - EP20171207Res.pdf,
paginas 5 a 7.
"""
from __future__ import annotations

import math
import random
from fractions import Fraction
from itertools import product

import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, cuantil_normal, montecarlo

ID_EXAMEN = "ep-20171207"


# ----------------------------------------------------------------- ej 1

P_SPAM = Fraction(15, 100)
DETECTA_SPAM, MARCA_LEGITIMO = Fraction(8, 10), Fraction(1, 10)


def exacto_1() -> dict:
    marcado = DETECTA_SPAM * P_SPAM + MARCA_LEGITIMO * (1 - P_SPAM)
    return {"a": MARCA_LEGITIMO * (1 - P_SPAM) / marcado}


def estimado_1() -> dict:
    p_spam, detecta, marca = float(P_SPAM), float(DETECTA_SPAM), float(MARCA_LEGITIMO)
    rng = random.Random(SEMILLA)
    marcados = legitimos = 0
    for _ in range(400_000):
        spam = rng.random() < p_spam
        if rng.random() < (detecta if spam else marca):
            marcados += 1
            legitimos += not spam
    return {"a": legitimos / marcados}


# ----------------------------------------------------------------- ej 2

def exacto_2() -> dict:
    x, y = sp.symbols("x y", real=True)
    # f(x, y) = 1/2 * 1/(1 + x) en -1 < x < 1, -x < y < 1.
    f = sp.Rational(1, 2) / (1 + x)
    e_xy = sp.integrate(sp.integrate(x * y * f, (y, -x, 1)), (x, -1, 1))
    return {"a": sp.simplify(e_xy)}


def estimado_2() -> dict:
    rng = random.Random(SEMILLA)
    n = 1_000_000
    s = 0.0
    for _ in range(n):
        a = rng.uniform(-1, 1)
        s += a * rng.uniform(-a, 1)
    return {"a": s / n}


# ----------------------------------------------------------------- ej 3

CARAS = "RAAVVV"
TIROS = 5


def exacto_3() -> dict:
    casos = favorables = 0
    for tiros in product(CARAS, repeat=TIROS):
        casos += 1
        favorables += tiros.count("V") >= 3 and tiros.count("A") >= 1
    p = Fraction(favorables, casos)

    # Control por la multinomial, como en la resuelta.
    def mul(r, a, v):
        coef = math.factorial(TIROS) // (math.factorial(r) * math.factorial(a) * math.factorial(v))
        return coef * Fraction(1, 6) ** r * Fraction(2, 6) ** a * Fraction(3, 6) ** v

    assert p == mul(1, 1, 3) + mul(0, 2, 3) + mul(0, 1, 4)
    return {"a": p}


def estimado_3() -> dict:
    def experimento(rng: random.Random) -> bool:
        t = [rng.choice(CARAS) for _ in range(TIROS)]
        return t.count("V") >= 3 and t.count("A") >= 1

    return {"a": montecarlo(experimento)}


# ----------------------------------------------------------------- ej 4

LAM, P_ROMPE = 1, Fraction(1, 4)
CAIDAS, ROTAS = (0, 3), (1, 5)          # horas desde las 10:00


def exacto_4() -> dict:
    # Solo comparten las pinas que rompen teja en (1, 3]: es la varianza de un
    # Poisson de media 0.25 * 2.
    comun = max(0, min(CAIDAS[1], ROTAS[1]) - max(CAIDAS[0], ROTAS[0]))
    return {"a": LAM * P_ROMPE * comun}


def estimado_4() -> dict:
    p_rompe = float(P_ROMPE)
    rng = random.Random(SEMILLA)
    n = 1_000_000
    s1 = s2 = s12 = 0.0
    for _ in range(n):
        caidas = rotas = 0
        t = rng.expovariate(LAM)
        while t <= 5:
            if CAIDAS[0] < t <= CAIDAS[1]:
                caidas += 1
            if rng.random() < p_rompe and ROTAS[0] < t <= ROTAS[1]:
                rotas += 1
            t += rng.expovariate(LAM)
        s1 += caidas
        s2 += rotas
        s12 += caidas * rotas
    return {"a": s12 / n - (s1 / n) * (s2 / n)}


# ----------------------------------------------------------------- ej 5

DISPONIBLE = 50_000                     # gramos
A, B = 250, 350
CONFIANZA = sp.Rational(95, 100)


def p_tcl(n: int) -> sp.Expr:
    media = n * sp.Rational(A + B, 2)
    var = n * sp.Rational((B - A) ** 2, 12)
    return Phi((DISPONIBLE - media) / sp.sqrt(var))


def exacto_5() -> dict:
    n = 1
    while p_tcl(n + 1) > CONFIANZA:
        n += 1
    assert p_tcl(n) > CONFIANZA >= p_tcl(n + 1)
    # Despeje de la resuelta: con x = sqrt(n), 6 sqrt(3) x^2 + z x - 1000 sqrt(3) <= 0.
    z = float(cuantil_normal(CONFIANZA))
    r3 = math.sqrt(3)
    x = (-z + math.sqrt(z * z + 4 * 6 * r3 * 1000 * r3)) / (12 * r3)
    assert math.floor(x * x) == n
    return {"a": sp.Integer(n), "cota_del_despeje": sp.N(x * x, 6)}


def estimado_5() -> dict:
    """El mayor n cuya probabilidad simulada de que alcance supera 0.95."""
    def tasa(n: int) -> float:
        rng = random.Random(SEMILLA)
        reps = 10_000
        return sum(
            1 for _ in range(reps) if sum(rng.uniform(A, B) for _ in range(n)) <= DISPONIBLE
        ) / reps

    n = 160
    while tasa(n + 1) > float(CONFIANZA):
        n += 1
    return {"a": n}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("2", exacto_2, estimado_2),
    Ejercicio("3", exacto_3, estimado_3),
    # Producto de dos conteos: con 1e6 repeticiones el error estandar es ~0.0035.
    Ejercicio("4", exacto_4, estimado_4, tolerancia=0.015),
    Ejercicio("5", exacto_5, estimado_5, tolerancia=0.0),
]
