# -*- coding: utf-8 -*-
"""
Evaluacion parcial del 01-06-2019 (version 61.09 - 81.04).

  1. Lote de 20 lavarropas, bueno si tiene a lo sumo 1 defectuoso. Se
     controlan 3 sin reposicion y se rechaza si alguno es defectuoso. Maxima
     probabilidad de rechazar un lote bueno.
  2. (X, Y) uniforme en {0 < x < 10, 0 < y < x}. P(8 < X + Y < 12).
  3. f(x, y) = (y^2 x / 2) e^{-xy} en x > 0, 0 < y < 2. P(E[X|Y] > 4/3).
  4. Aires (10 por hora) y Cielos (35 por hora), independientes. Sabiendo que
     entre 0:00 y 0:05 llegaron exactamente 2 de Aires, P(entre 0:00 y 0:02
     llego al menos un avion).
  5. TCL: 500 celulares, cada uno dura menos de 40 dias con probabilidad 0.3.
     P(mas de 170 duran menos de 40 dias).

Resuelta: fuentes/examenes/parciales/03 Parcial Resuelto - EP20190601Res.pdf,
paginas 6 a 11.
"""
from __future__ import annotations

import math
import random
from fractions import Fraction
from math import comb

import mpmath
import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, montecarlo

ID_EXAMEN = "ep-20190601"


# ----------------------------------------------------------------- ej 1

LOTE, CONTROLADOS = 20, 3


def p_rechazo(defectuosos: int) -> Fraction:
    return 1 - Fraction(comb(LOTE - defectuosos, CONTROLADOS), comb(LOTE, CONTROLADOS))


def exacto_1() -> dict:
    # Un lote bueno tiene 0 o 1 defectuosos; la decision incorrecta es rechazarlo.
    return {"a": max(p_rechazo(k) for k in (0, 1))}


def estimado_1() -> dict:
    # El peor caso es el de un defectuoso: con cero nunca se rechaza.
    lote = [True] + [False] * (LOTE - 1)
    return {"a": montecarlo(lambda rng: any(rng.sample(lote, CONTROLADOS)))}


# ----------------------------------------------------------------- ej 2

def exacto_2() -> dict:
    x, y = sp.symbols("x y", positive=True)
    area = sp.integrate(sp.integrate(1, (y, 0, x)), (x, 0, 10))
    # Region 8 < x + y < 12 dentro del triangulo 0 < y < x < 10. Para cada x,
    # y va de max(0, 8 - x) a min(x, 12 - x).
    trozos = [
        (4, 6, 8 - x, x),           # 8 - x < y < x
        (6, 8, 8 - x, 12 - x),
        (8, 10, 0, 12 - x),
    ]
    adentro = sum(sp.integrate(sp.integrate(1, (y, a, b)), (x, x0, x1)) for x0, x1, a, b in trozos)
    return {"a": adentro / area}


def estimado_2() -> dict:
    def punto(rng: random.Random) -> bool:
        while True:
            x, y = rng.uniform(0, 10), rng.uniform(0, 10)
            if y < x:
                return 8 < x + y < 12

    return {"a": montecarlo(punto)}


# ----------------------------------------------------------------- ej 3

UMBRAL_3 = sp.Rational(4, 3)


def exacto_3() -> dict:
    x = sp.symbols("x", positive=True)
    y = sp.symbols("y", positive=True)
    f = y**2 * x / 2 * sp.exp(-x * y)
    f_y = sp.simplify(sp.integrate(f, (x, 0, sp.oo)))
    assert f_y == sp.Rational(1, 2), f_y
    phi = sp.simplify(sp.integrate(x * f, (x, 0, sp.oo)) / f_y)
    assert sp.simplify(phi - 2 / y) == 0, phi
    # 2/y > 4/3 <=> y < 3/2, porque phi es decreciente.
    corte = sp.solve(sp.Eq(phi, UMBRAL_3), y)[0]
    return {"a": sp.integrate(f_y, (y, 0, corte))}


def estimado_3() -> dict:
    """
    Por cuadratura numerica, sin simplificar nada: phi(y) se calcula como
    cociente de dos integrales en x, el corte se busca por biseccion y la
    probabilidad es la integral de la marginal hasta el corte.
    """
    def f(x, y):
        return y * y * x / 2 * mpmath.e ** (-x * y)

    def phi(y):
        return mpmath.quad(lambda x: x * f(x, y), [0, mpmath.inf]) / mpmath.quad(
            lambda x: f(x, y), [0, mpmath.inf]
        )

    a, b = 0.1, 2.0
    for _ in range(60):
        m = (a + b) / 2
        if phi(m) > 4 / 3:
            a = m
        else:
            b = m
    marginal = mpmath.quad(lambda y: mpmath.quad(lambda x: f(x, y), [0, mpmath.inf]), [0, a])
    return {"a": float(marginal)}


# ----------------------------------------------------------------- ej 4

AIRES, CIELOS = sp.Rational(10, 60), sp.Rational(35, 60)    # por minuto
VENTANA, TRAMO, LLEGARON = 5, 2, 2


def exacto_4() -> dict:
    # Dado N_A(0, 5] = 2, los dos arribos de Aires son U(0, 5) independientes.
    # Cielos es independiente de Aires y no se condiciona.
    ninguno_aires = (sp.Rational(VENTANA - TRAMO, VENTANA)) ** LLEGARON
    ninguno_cielos = sp.exp(-CIELOS * TRAMO)
    p = 1 - ninguno_aires * ninguno_cielos

    # Control con la cuenta de la resuelta, por la definicion de condicional.
    def poi(mu, k):
        return sp.exp(-mu) * mu**k / sp.factorial(k)

    por_definicion = 1 - (
        poi((AIRES + CIELOS) * TRAMO, 0) * poi(AIRES * (VENTANA - TRAMO), LLEGARON)
    ) / poi(AIRES * VENTANA, LLEGARON)
    assert sp.simplify(p - por_definicion) == 0
    return {"a": sp.simplify(p)}


def estimado_4() -> dict:
    a, c = float(AIRES), float(CIELOS)
    rng = random.Random(SEMILLA)
    casos = favorables = 0
    for _ in range(400_000):
        llegadas_a, t = [], rng.expovariate(a)
        while t <= VENTANA:
            llegadas_a.append(t)
            t += rng.expovariate(a)
        if len(llegadas_a) != LLEGARON:
            continue
        casos += 1
        primera_c = rng.expovariate(c)
        favorables += min(llegadas_a[0], primera_c) <= TRAMO
    return {"a": favorables / casos}


# ----------------------------------------------------------------- ej 5

CELULARES, P_CORTO, LIMITE = 500, sp.Rational(3, 10), 170


def exacto_5() -> dict:
    media = CELULARES * P_CORTO
    desvio = sp.sqrt(CELULARES * P_CORTO * (1 - P_CORTO))
    return {
        # Con correccion por continuidad: P(T > 170) = P(T >= 170.5).
        "a": sp.simplify(1 - Phi((LIMITE + sp.Rational(1, 2) - media) / desvio)),
        # La resuelta da primero este, sin la correccion.
        "sin_correccion": sp.N(1 - Phi((LIMITE - media) / desvio), 6),
    }


def estimado_5() -> dict:
    """La binomial exacta, sumada en escala log."""
    p = float(P_CORTO)
    base = math.lgamma(CELULARES + 1)
    cola = sum(
        math.exp(
            base - math.lgamma(k + 1) - math.lgamma(CELULARES - k + 1)
            + k * math.log(p) + (CELULARES - k) * math.log(1 - p)
        )
        for k in range(LIMITE + 1, CELULARES + 1)
    )
    return {"a": cola}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("2", exacto_2, estimado_2),
    Ejercicio("3", exacto_3, estimado_3),
    Ejercicio("4", exacto_4, estimado_4),
    Ejercicio("5", exacto_5, estimado_5),
]
