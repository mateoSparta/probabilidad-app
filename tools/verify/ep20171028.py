# -*- coding: utf-8 -*-
"""
Primer parcial del 28-10-2017 (version 61.09 - 81.04).

El ejercicio 1 pide simular con numeros aleatorios dados: queda fuera del
alcance de PyE B (CLAUDE.md) y no tiene modelo.

  2. X ~ U(-1, 1) e Y | X = x ~ N(x, x^2). Se pide E[Y^2].
  3. Tres bits por un canal binario. P(exactamente uno se recibe bien).
  4. Proceso de Poisson de intensidad 4 por hora; la alarma suena si dos
     emisiones consecutivas estan a 5 minutos o menos. P(N(9:00, 9:30] = 2 y
     suena la alarma).
  5. TCL: 3600 tiempos con densidad 0.04 e^{-0.04 (t - 10)} en t > 10. P(la
     suma supera 127000 ms).

Resuelta: fuentes/examenes/parciales/11 Parcial Resuelto - EP20171028Res.pdf,
paginas 4 y 5.
"""
from __future__ import annotations

import random
from fractions import Fraction

import mpmath
import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, montecarlo

ID_EXAMEN = "ep-20171028"


# ----------------------------------------------------------------- ej 2

def exacto_2() -> dict:
    # E[Y^2 | X = x] = var + media^2 = x^2 + x^2. Integrando contra 1/2 en (-1, 1).
    x = sp.symbols("x")
    e_y2 = sp.integrate(2 * x**2 * sp.Rational(1, 2), (x, -1, 1))
    # Control por el otro camino de la resuelta: var(Y) + E[Y]^2, con varianza
    # total. E[Y|X] = X, var(Y|X) = X^2.
    var_x = sp.Rational(1, 3)            # (1 - (-1))^2 / 12
    e_x2 = sp.Rational(1, 3)
    assert var_x + e_x2 + 0 == e_y2
    return {"a": e_y2}


def estimado_2() -> dict:
    rng = random.Random(SEMILLA)
    n = 400_000
    total = 0.0
    for _ in range(n):
        x = rng.uniform(-1, 1)
        y = rng.gauss(x, abs(x))
        total += y * y
    return {"a": total / n}


# ----------------------------------------------------------------- ej 3

P_UNO = Fraction(7, 10)
P_BIEN_SI_UNO = Fraction(6, 10)
P_BIEN_SI_CERO = Fraction(95, 100)
BITS = 3


def exacto_3() -> dict:
    p = P_BIEN_SI_UNO * P_UNO + P_BIEN_SI_CERO * (1 - P_UNO)
    return {"a": BITS * p * (1 - p) ** 2, "p_bien": p}


def estimado_3() -> dict:
    p_uno, si_uno, si_cero = float(P_UNO), float(P_BIEN_SI_UNO), float(P_BIEN_SI_CERO)

    def experimento(rng: random.Random) -> bool:
        bien = 0
        for _ in range(BITS):
            uno = rng.random() < p_uno
            acierta = rng.random() < (si_uno if uno else si_cero)
            bien += acierta
        return bien == 1

    return {"a": montecarlo(experimento)}


# ----------------------------------------------------------------- ej 4

INTENSIDAD = 4                    # por hora
LARGO = sp.Rational(1, 2)         # de 9:00 a 9:30, en horas
UMBRAL = sp.Rational(5, 60)       # 5 minutos, en horas


def exacto_4() -> dict:
    mu = INTENSIDAD * LARGO
    p_dos = sp.exp(-mu) * mu**2 / 2
    # Dado N = 2, los dos tiempos son U(0, 1/2) independientes. La alarma suena
    # si |U1 - U2| <= 5 min: el complemento son dos triangulos de cateto
    # 1/2 - 1/12, sobre el area del cuadrado.
    u1, u2 = sp.symbols("u1 u2", positive=True)
    lejos = 2 * sp.integrate(sp.integrate(1, (u2, u1 + UMBRAL, LARGO)), (u1, 0, LARGO - UMBRAL))
    p_alarma = 1 - lejos / LARGO**2
    assert p_alarma == sp.Rational(11, 36)
    return {"a": sp.simplify(p_dos * p_alarma)}


def estimado_4() -> dict:
    lam, largo, umbral = INTENSIDAD, float(LARGO), float(UMBRAL)

    def experimento(rng: random.Random) -> bool:
        tiempos, t = [], rng.expovariate(lam)
        while t <= largo:
            tiempos.append(t)
            t += rng.expovariate(lam)
        return len(tiempos) == 2 and tiempos[1] - tiempos[0] <= umbral

    return {"a": montecarlo(experimento)}


# ----------------------------------------------------------------- ej 5

PAQUETES = 3600
TASA = sp.Rational(4, 100)        # por ms
CORRIMIENTO = 10                  # ms
TOTAL_MS = 2 * 60 * 1000 + 7 * 1000


def exacto_5() -> dict:
    # Cada tiempo es 10 + Exp(0.04): media 35, varianza 25^2.
    media = PAQUETES * (CORRIMIENTO + 1 / TASA)
    desvio = sp.sqrt(PAQUETES / TASA**2)
    assert (media, desvio) == (126000, 1500)
    return {"a": sp.simplify(1 - Phi((TOTAL_MS - media) / desvio))}


def estimado_5() -> dict:
    """
    El segundo camino no es simular sino la distribucion exacta de la suma:
    36000 + Gamma(3600, 0.04). La diferencia con el TCL es el error de la
    aproximacion, que con n = 3600 es del orden de 1e-3.
    """
    excedente = float(TASA) * (TOTAL_MS - PAQUETES * CORRIMIENTO)
    cola = mpmath.gammainc(PAQUETES, excedente, mpmath.inf, regularized=True)
    return {"a": float(cola)}


EJERCICIOS = [
    Ejercicio("2", exacto_2, estimado_2),
    Ejercicio("3", exacto_3, estimado_3),
    Ejercicio("4", exacto_4, estimado_4),
    Ejercicio("5", exacto_5, estimado_5),
]
