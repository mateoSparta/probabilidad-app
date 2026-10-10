# -*- coding: utf-8 -*-
"""
Primer recuperatorio del 24-11-2018 (version 61.09 - 81.04).

  1. Cuatro personas en fila al azar. P(Alejo antes que Teodoro o que Gaston).
  2. F_X(x) = 1 - e^{-x^2} en x > 0. Distribucion de Y = -ln F_X(X).
  3. 10 tiros con probabilidad de acierto 1/5. X = aciertos totales, Y =
     aciertos en el primer tiro. E[Y | X].
  4. Poisson de 20 por hora desde las 9:00, servicio Exp de media 7 minutos.
     Sabiendo que el primer cliente llego antes de las 9:10, P(salio despues
     de las 9:10).
  5. Camiones con U(7, 8) m^3, a cada uno se le quita U(0, 1). Minima
     cantidad de camiones para que P(alcanza para 600 m^3) > 0.95.

Los items 2 y 3 son expresiones: el exacto devuelve la expresion simbolica y
ademas su valor en puntos concretos, que es lo que contrasta el Monte Carlo.

Resuelta: fuentes/examenes/parciales/04 Parcial Resuelto - EP20181124Res.pdf,
paginas 6 a 11.
"""
from __future__ import annotations

import math
import random
from fractions import Fraction
from itertools import permutations
from math import comb

import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, cuantil_normal, montecarlo

ID_EXAMEN = "ep-20181124"


# ----------------------------------------------------------------- ej 1

def exacto_1() -> dict:
    filas = list(permutations("ATCG"))
    favorables = sum(1 for f in filas if f.index("A") < f.index("T") or f.index("A") < f.index("G"))
    return {"a": Fraction(favorables, len(filas))}


def estimado_1() -> dict:
    def experimento(rng: random.Random) -> bool:
        f = rng.sample("ATCG", 4)
        return f.index("A") < f.index("T") or f.index("A") < f.index("G")

    return {"a": montecarlo(experimento)}


# ----------------------------------------------------------------- ej 2

PUNTOS_2 = (sp.Rational(1, 2), 1, 2)


def exacto_2() -> dict:
    x, y = sp.symbols("x y", positive=True)
    f_x = 1 - sp.exp(-x**2)
    # Y <= y  <=>  F_X(X) >= e^{-y}  <=>  X >= F_X^{-1}(e^{-y}), y F_X es
    # continua y creciente en (0, oo).
    inversa = sp.solve(sp.Eq(f_x, sp.exp(-y)), x)
    inversa = [r for r in inversa if r.is_positive is not False][0]
    f_y = sp.simplify(1 - f_x.subs(x, inversa))
    assert sp.simplify(f_y - (1 - sp.exp(-y))) == 0, f_y
    salida = {"a": f_y}
    for i, t in enumerate(PUNTOS_2, 1):
        salida[f"a_en_{i}"] = f_y.subs(y, t)
    return salida


def estimado_2() -> dict:
    # X = F_X^{-1}(V) con V uniforme: X = sqrt(-ln(1 - V)).
    rng = random.Random(SEMILLA)
    n = 400_000
    muestras = []
    for _ in range(n):
        x = math.sqrt(-math.log(1 - rng.random()))
        muestras.append(-math.log(1 - math.exp(-x * x)))
    return {
        f"a_en_{i}": sum(1 for v in muestras if v <= float(t)) / n
        for i, t in enumerate(PUNTOS_2, 1)
    }


# ----------------------------------------------------------------- ej 3

TIROS, P_ACIERTO = 10, Fraction(1, 5)


def exacto_3() -> dict:
    X = sp.symbols("X")
    phi = {}
    for k in range(TIROS + 1):
        # P(Y = 1, X = k) / P(X = k), con la binomial de los otros 9 tiros.
        conj = P_ACIERTO * (comb(TIROS - 1, k - 1) * P_ACIERTO ** (k - 1) * (1 - P_ACIERTO) ** (TIROS - k) if k else 0)
        marg = comb(TIROS, k) * P_ACIERTO**k * (1 - P_ACIERTO) ** (TIROS - k)
        phi[k] = conj / marg
    assert all(phi[k] == Fraction(k, TIROS) for k in phi)
    salida = {"a": X / TIROS}
    for k in (2, 3):
        salida[f"a_en_{k}"] = phi[k]
    return salida


def estimado_3() -> dict:
    rng = random.Random(SEMILLA)
    cuentas = {2: [0, 0], 3: [0, 0]}
    p = float(P_ACIERTO)
    for _ in range(400_000):
        tiros = [rng.random() < p for _ in range(TIROS)]
        k = sum(tiros)
        if k in cuentas:
            cuentas[k][0] += 1
            cuentas[k][1] += tiros[0]
    return {f"a_en_{k}": c[1] / c[0] for k, c in cuentas.items()}


# ----------------------------------------------------------------- ej 4

LLEGADAS = sp.Rational(20, 60)      # por minuto
SERVICIO = sp.Rational(1, 7)        # tasa, por minuto
CORTE = 10


def exacto_4() -> dict:
    x, t = sp.symbols("x t", positive=True)
    conj = sp.integrate(
        sp.integrate(SERVICIO * sp.exp(-SERVICIO * t), (t, CORTE - x, sp.oo))
        * LLEGADAS * sp.exp(-LLEGADAS * x),
        (x, 0, CORTE),
    )
    return {"a": sp.simplify(conj / (1 - sp.exp(-LLEGADAS * CORTE)))}


def estimado_4() -> dict:
    rng = random.Random(SEMILLA)
    casos = favorables = 0
    for _ in range(400_000):
        llega = rng.expovariate(float(LLEGADAS))
        if llega >= CORTE:
            continue
        casos += 1
        favorables += llega + rng.expovariate(float(SERVICIO)) > CORTE
    return {"a": favorables / casos}


# ----------------------------------------------------------------- ej 5

PLATEA = 600
CONFIANZA = sp.Rational(95, 100)
MEDIA_T = sp.Rational(15, 2) - sp.Rational(1, 2)      # E[X] - E[Y]
VAR_T = sp.Rational(1, 12) + sp.Rational(1, 12)       # var X + var Y


def p_tcl(n: int) -> sp.Expr:
    return 1 - Phi((PLATEA - MEDIA_T * n) / sp.sqrt(VAR_T * n))


def exacto_5() -> dict:
    n = 1
    while p_tcl(n) <= CONFIANZA:
        n += 1
    assert p_tcl(n - 1) <= CONFIANZA < p_tcl(n)
    z = float(cuantil_normal(CONFIANZA))
    a, b = float(MEDIA_T), -z * math.sqrt(float(VAR_T))
    u = (-b + math.sqrt(b * b + 4 * a * PLATEA)) / (2 * a)
    assert math.ceil(u * u) == n
    return {"a": sp.Integer(n), "cota_del_despeje": sp.N(u * u, 5)}


def estimado_5() -> dict:
    """El menor n para el que la probabilidad simulada supera 0.95."""
    def tasa(n: int) -> float:
        rng = random.Random(SEMILLA)
        reps = 10_000
        ok = sum(
            1 for _ in range(reps)
            if sum(rng.uniform(7, 8) - rng.random() for _ in range(n)) > PLATEA
        )
        return ok / reps

    n = 84
    while tasa(n) <= float(CONFIANZA):
        n += 1
    return {"a": n}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("2", exacto_2, estimado_2),
    Ejercicio("3", exacto_3, estimado_3),
    Ejercicio("4", exacto_4, estimado_4),
    Ejercicio("5", exacto_5, estimado_5, tolerancia=0.0),
]
