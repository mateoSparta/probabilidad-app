# -*- coding: utf-8 -*-
"""
Parcial del 24-05-2025 (primera fecha, comun a las tres materias).

  1. Caja con 5 blancas, 1 verde y 3 azules. Se extraen dos; si son de
     distinto color se extraen otras dos. Sabiendo que hubo segunda
     extraccion y que salio un par del mismo color, P(la primera fue
     exactamente una blanca y una verde).
  2. f(x, y) = y / (2 x^4) e^(-y/x^2) en 2 < x < 4, y > 0. El examen trae
     dos variantes: Curso 4 pide E(Y | X = 3) y los demas cursos
     P(E(Y | X) < 10). Se carga la de los demas cursos (ver el YAML); la
     del Curso 4 queda como control.
  3. (X, Y) uniforme en R = {0 < x < 3, x - 2 < y < x + 1}. Funcion de
     distribucion de W = |Y - X|.
  4. SPAM Poisson de 4 por hora y NO SPAM Poisson de 6 por hora,
     independientes. Sabiendo que entre las 10:00 y las 11:00 llegaron 8
     SPAM y 6 NO SPAM, P(exactamente un mensaje entre las 10:00 y las
     10:06).
  5. Aportes de 2000 (prob. 0.2) o 4000 (prob. 0.3) por seguidor, 3300
     seguidores. Monto que la recaudacion supera con probabilidad 0.95, por
     TCL.

No hay resuelta: los valores vienen solo de estos modelos, cada uno por dos
caminos independientes.

Enunciado: fuentes/examenes/finales/EP_20250524.pdf.
"""
from __future__ import annotations

import math
import random
from fractions import Fraction
from itertools import combinations

import mpmath as mp
import numpy as np
import sympy as sp

from comun import SEMILLA, Ejercicio, area_region, cuantil_normal, montecarlo_2d

ID_EXAMEN = "ep-20250524"


# ----------------------------------------------------------------- ej 1

# Bolitas distinguibles, con su color.
CAJA = ["B"] * 5 + ["V"] + ["A"] * 3
INDICES = range(len(CAJA))


def exacto_1() -> dict:
    """
    Enumera el espacio completo: todos los pares (primera extraccion,
    segunda extraccion) sobre bolitas distinguibles, y cuenta directamente
    sobre el evento condicionante.
    """
    casos = 0            # hubo 2a extraccion y salieron dos del mismo color
    favorables = 0       # ademas, la 1a fue exactamente una blanca y una verde
    for primera in combinations(INDICES, 2):
        c1 = sorted(CAJA[i] for i in primera)
        if c1[0] == c1[1]:
            continue     # mismo color: no hay segunda extraccion
        resto = [i for i in INDICES if i not in primera]
        for segunda in combinations(resto, 2):
            c2 = [CAJA[i] for i in segunda]
            if c2[0] != c2[1]:
                continue
            # Cada (primera, segunda) tiene el mismo peso: la primera es
            # uniforme entre C(9,2) y la segunda entre C(7,2), y ese segundo
            # factor es el mismo para toda primera que llegue hasta aca.
            casos += 1
            if c1 == ["B", "V"]:
                favorables += 1
    assert casos > 0
    return {"a": Fraction(favorables, casos)}


def estimado_1() -> dict:
    rng = random.Random(SEMILLA)
    casos = favorables = 0
    for _ in range(2_000_000):
        mezcla = CAJA[:]
        rng.shuffle(mezcla)
        c1 = sorted(mezcla[:2])
        if c1[0] == c1[1]:
            continue
        c2 = mezcla[2:4]
        if c2[0] != c2[1]:
            continue
        casos += 1
        if c1 == ["B", "V"]:
            favorables += 1
    return {"a": favorables / casos}


# ----------------------------------------------------------------- ej 2

X0, X1 = 2, 4
COTA_2 = 10


def densidad_2(x, y):
    return y / (2 * x**4) * sp.exp(-y / x**2)


def exacto_2() -> dict:
    x = sp.symbols("x", positive=True)
    y = sp.symbols("y", positive=True)
    f = densidad_2(x, y)
    f_x = sp.simplify(sp.integrate(f, (y, 0, sp.oo)))
    assert sp.integrate(f_x, (x, X0, X1)) == 1
    regresion = sp.simplify(sp.integrate(y * f, (y, 0, sp.oo)) / f_x)
    # E(Y | X = x) es creciente en (2, 4): la condicion es X < raiz.
    raiz = [r for r in sp.solve(sp.Eq(regresion, COTA_2), x) if X0 < r < X1]
    assert len(raiz) == 1
    assert sp.diff(regresion, x).subs(x, raiz[0]) > 0
    return {
        "a": sp.nsimplify(sp.simplify(sp.integrate(f_x, (x, X0, raiz[0])))),
        # Variante del Curso 4, como control: E(Y | X = 3).
        "e_y_dado_3": regresion.subs(x, 3),
    }


def estimado_2() -> dict:
    """
    La regresion por integracion numerica y su raiz por biseccion, y la
    probabilidad final por Monte Carlo: puntos sorteados por rechazo sobre la
    densidad conjunta, sin usar la marginal ni la condicional.
    """
    def regresion(t: float) -> float:
        g = lambda v: v / (2 * t**4) * mp.e ** (-v / t**2)
        return float(mp.quad(lambda v: v * g(v), [0, mp.inf]) / mp.quad(g, [0, mp.inf]))

    lo, hi = float(X0), float(X1)
    for _ in range(60):
        m = (lo + hi) / 2
        if regresion(m) < COTA_2:
            lo = m
        else:
            hi = m
    raiz = (lo + hi) / 2

    # Rechazo sobre (2, 4) x (0, 400). Arriba de 400 la densidad deja afuera
    # menos de 1e-7 de la masa. El maximo de f es e^-1 / 8, en (2, 4).
    rng = np.random.default_rng(SEMILLA)
    techo = math.exp(-1) / 8
    xs = []
    aceptados = 0
    while aceptados < 400_000:
        x = rng.uniform(X0, X1, 2_000_000)
        y = rng.uniform(0, 400, 2_000_000)
        u = rng.uniform(0, techo, 2_000_000)
        ok = u < y / (2 * x**4) * np.exp(-y / x**2)
        xs.append(x[ok])
        aceptados += int(ok.sum())
    xs = np.concatenate(xs)
    return {"a": float(np.mean(xs < raiz)), "e_y_dado_3": regresion(3.0)}


# ----------------------------------------------------------------- ej 3

PUNTOS_3 = (sp.Rational(1, 2), sp.Integer(1), sp.Rational(3, 2))


def exacto_3() -> dict:
    x, y = sp.symbols("x y", real=True)
    en_r = (x > 0) & (x < 3) & (y > x - 2) & (y < x + 1)
    area_r = area_region(en_r, x, y, 0, 3, -2, 4)
    assert area_r == 9
    salida = {}
    for i, w in enumerate(PUNTOS_3, 1):
        recorte = en_r & (y - x <= w) & (y - x >= -w)
        salida[f"a{i}"] = sp.nsimplify(area_region(recorte, x, y, 0, 3, -2, 4) / area_r)
    return salida


def estimado_3() -> dict:
    def punto(rng):
        x, y = rng.uniform(0, 3), rng.uniform(-2, 4)
        return (x, y) if x - 2 < y < x + 1 else None

    return {
        f"a{i}": montecarlo_2d(punto, lambda x, y, w=float(w): abs(y - x) <= w)
        for i, w in enumerate(PUNTOS_3, 1)
    }


# ----------------------------------------------------------------- ej 4

TASA_SPAM, TASA_NO = 4, 6          # por hora
SPAM, NO_SPAM = 8, 6               # vistos entre las 10:00 y las 11:00
VENTANA = sp.Rational(1, 10)       # de 10:00 a 10:06, en horas


def exacto_4() -> dict:
    # Dados los conteos, los 14 arribos son uniformes independientes en la
    # hora, y cada uno cae en la ventana con probabilidad 1/10.
    total = SPAM + NO_SPAM
    a = total * VENTANA * (1 - VENTANA) ** (total - 1)

    # Por el otro camino, sin el resultado de las uniformes: incrementos
    # independientes sobre [0, 1/10] y [1/10, 1] para cada proceso, y Bayes.
    def poisson(media, k):
        return sp.exp(-media) * media**k / sp.factorial(k)

    def conteo(tasa, n, en_ventana):
        return poisson(tasa * VENTANA, en_ventana) * poisson(tasa * (1 - VENTANA), n - en_ventana)

    condicion = sum(conteo(TASA_SPAM, SPAM, s) for s in range(SPAM + 1)) * sum(
        conteo(TASA_NO, NO_SPAM, t) for t in range(NO_SPAM + 1)
    )
    uno = conteo(TASA_SPAM, SPAM, 1) * conteo(TASA_NO, NO_SPAM, 0) + conteo(
        TASA_SPAM, SPAM, 0
    ) * conteo(TASA_NO, NO_SPAM, 1)
    assert sp.simplify(uno / condicion - a) == 0
    return {"a": a}


def estimado_4() -> dict:
    """Incrementos independientes, sorteados con numpy, y se condiciona."""
    rng = np.random.default_rng(SEMILLA)
    v = float(VENTANA)
    casos = favorables = 0
    for _ in range(20):
        n = 2_000_000
        s1 = rng.poisson(TASA_SPAM * v, n)
        s2 = rng.poisson(TASA_SPAM * (1 - v), n)
        t1 = rng.poisson(TASA_NO * v, n)
        t2 = rng.poisson(TASA_NO * (1 - v), n)
        ok = (s1 + s2 == SPAM) & (t1 + t2 == NO_SPAM)
        casos += int(ok.sum())
        favorables += int((ok & (s1 + t1 == 1)).sum())
    return {"a": favorables / casos}


# ----------------------------------------------------------------- ej 5

APORTES = {0: Fraction(5, 10), 2000: Fraction(2, 10), 4000: Fraction(3, 10)}
SEGUIDORES = 3300
CONFIANZA = sp.Rational(95, 100)


def exacto_5() -> dict:
    assert sum(APORTES.values()) == 1
    media = sum(v * p for v, p in APORTES.items())
    varianza = sum(v * v * p for v, p in APORTES.items()) - media**2
    z = cuantil_normal(CONFIANZA)
    # P(S > m) = 0.95  <=>  (m - n media) / desvio = -z.
    monto = SEGUIDORES * media - z * sp.sqrt(SEGUIDORES * varianza)

    # Por el otro camino: biseccion sobre la probabilidad del TCL, sin despejar.
    mu, sigma = SEGUIDORES * float(media), math.sqrt(SEGUIDORES * float(varianza))
    lo, hi = mu - 10 * sigma, mu
    for _ in range(200):
        m = (lo + hi) / 2
        if 1 - (1 + math.erf((m - mu) / sigma / math.sqrt(2))) / 2 >= float(CONFIANZA):
            lo = m
        else:
            hi = m
    assert abs(lo - float(monto)) < 1e-6, (lo, float(monto))

    return {
        # Un monto en pesos se informa al centavo.
        "a": Fraction(round(float(monto) * 100), 100),
        "sin_redondear": sp.N(monto, 12),
        "media_aporte": media,
        "varianza_aporte": varianza,
    }


def estimado_5() -> dict:
    """
    El monto con la distribucion exacta de la recaudacion: en unidades de
    2000 cada aporte vale 0, 1 o 2, y la suma se obtiene convolucionando. Es
    el mayor m de la red con P(S > m) >= 0.95.
    """
    pesos = np.array([float(APORTES[0]), float(APORTES[2000]), float(APORTES[4000])])
    dist = np.array([1.0])
    for _ in range(SEGUIDORES):
        dist = np.convolve(dist, pesos)
    supera = 1 - np.cumsum(dist)                 # supera[k] = P(S > 2000 k)
    k = int(np.nonzero(supera >= float(CONFIANZA))[0].max())
    return {"a": 2000 * k}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("2", exacto_2, estimado_2),
    Ejercicio("3", exacto_3, estimado_3),
    # Hay unos 190000 casos que cumplen la condicion: el error estandar del
    # Monte Carlo es ~0.0011.
    Ejercicio("4", exacto_4, estimado_4),
    # La distribucion exacta vive en multiplos de 2000: su cuantil puede
    # diferir del TCL en un paso de la red, mas el efecto de la asimetria.
    Ejercicio("5", exacto_5, estimado_5, tolerancia=4000),
]
