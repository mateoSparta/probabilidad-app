# -*- coding: utf-8 -*-
"""
Segundo recuperatorio del 14-12-2017 (version 61.09 - 81.04).

  1. 8 pasajeros eligen al azar entre 4 estaciones. P(exactamente 3 bajan en
     Lima y ninguno en Peru).
  2. Urna con bolas 1, 2, 3; dos extracciones sin reposicion. cov(X, Y).
  3. (X, Y) uniforme sobre un recinto dado por figura. F_U con U = Y - X.
  4. Poisson de 2 por minuto desde las 10:00. Sabiendo que el primero llego
     antes de las 10:01, P(a las 10:03 hay al menos 3 en la fila).
  5. Cada varilla es admisible (0.8), corta (0.05) o larga (0.15). Un lote se
     acepta si de 5 varillas al menos 4 son admisibles y ninguna corta. TCL:
     P(se aceptan al menos 60 de 100 lotes).

El recinto del 3 (figura de la pagina 6) es la union de la banda
{0 <= y - x <= 1/2} dentro del cuadrado unitario y del triangulo de vertices
(1/2, 0), (1, 0), (1, 1/2). Tiene area 1/2.

Resuelta: fuentes/examenes/parciales/08 Parcial Resuelto - EP20171214Res.pdf,
paginas 5 a 9.
"""
from __future__ import annotations

import math
import random
from fractions import Fraction
from itertools import permutations, product

import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, montecarlo

ID_EXAMEN = "ep-20171214"


# ----------------------------------------------------------------- ej 1

PASAJEROS = 8
LIMA, PIEDRAS, PERU, PLAZA = range(4)


def exacto_1() -> dict:
    casos = favorables = 0
    for eleccion in product(range(4), repeat=PASAJEROS):
        casos += 1
        favorables += eleccion.count(LIMA) == 3 and eleccion.count(PERU) == 0
    return {"a": Fraction(favorables, casos)}


def estimado_1() -> dict:
    def experimento(rng: random.Random) -> bool:
        e = [rng.randrange(4) for _ in range(PASAJEROS)]
        return e.count(LIMA) == 3 and e.count(PERU) == 0

    return {"a": montecarlo(experimento)}


# ----------------------------------------------------------------- ej 2

def exacto_2() -> dict:
    pares = list(permutations((1, 2, 3), 2))
    p = Fraction(1, len(pares))
    ex = sum(a * p for a, _ in pares)
    ey = sum(b * p for _, b in pares)
    exy = sum(a * b * p for a, b in pares)
    return {"a": exy - ex * ey}


def estimado_2() -> dict:
    rng = random.Random(SEMILLA)
    n = 400_000
    sx = sy = sxy = 0
    for _ in range(n):
        a, b = rng.sample((1, 2, 3), 2)
        sx += a
        sy += b
        sxy += a * b
    return {"a": sxy / n - (sx / n) * (sy / n)}


# ----------------------------------------------------------------- ej 3

PUNTOS_3 = (sp.Rational(-3, 4), sp.Rational(-1, 4), sp.Rational(1, 4))


def en_recinto(x: float, y: float) -> bool:
    return 0 <= x <= 1 and 0 <= y <= 1 and (0 <= y - x <= 0.5 or x - y >= 0.5)


def exacto_3() -> dict:
    x, y = sp.symbols("x y", real=True)
    # Area de {y - x <= u} dentro del recinto, integrando en x sobre [0, 1]:
    # la banda aporta el corte y en [x, min(x + u, x + 1/2, 1)] y el triangulo
    # el corte y en [0, x - 1/2] (siempre por debajo de x + u si u >= -1/2).
    def area_hasta(u):
        u = sp.Rational(u)
        banda = sp.Integer(0)
        if u >= 0:
            tope = sp.Min(u, sp.Rational(1, 2))
            banda = sp.integrate(sp.Min(x + tope, 1) - x, (x, 0, 1))
        if u >= -sp.Rational(1, 2):
            tri = sp.integrate(x - sp.Rational(1, 2), (x, sp.Rational(1, 2), 1))
        elif u >= -1:
            # y <= x + u y y >= 0, con x - y >= 1/2 automaticamente.
            tri = sp.integrate(x + u, (x, -u, 1))
        else:
            tri = sp.Integer(0)
        return sp.simplify(banda + tri)

    total = area_hasta(1)
    assert total == sp.Rational(1, 2), total
    return {f"a{i}": area_hasta(t) / total for i, t in enumerate(PUNTOS_3, 1)}


def estimado_3() -> dict:
    rng = random.Random(SEMILLA)
    n = 0
    cuentas = [0] * len(PUNTOS_3)
    while n < 400_000:
        px, py = rng.random(), rng.random()
        if not en_recinto(px, py):
            continue
        n += 1
        for i, t in enumerate(PUNTOS_3):
            cuentas[i] += py - px <= float(t)
    return {f"a{i}": c / n for i, c in enumerate(cuentas, 1)}


# ----------------------------------------------------------------- ej 4

LAM = 2                 # por minuto


def exacto_4() -> dict:
    def poi(mu, k):
        return sp.exp(-mu) * sp.Integer(mu) ** k / sp.factorial(k)

    # N(0,1] >= 1 y N(0,3] <= 2: (1, N(1,3] <= 1) o (2, N(1,3] = 0).
    a = poi(LAM, 1) * (poi(2 * LAM, 0) + poi(2 * LAM, 1)) + poi(LAM, 2) * poi(2 * LAM, 0)
    return {"a": sp.simplify(1 - a / (1 - poi(LAM, 0)))}


def estimado_4() -> dict:
    rng = random.Random(SEMILLA)
    casos = favorables = 0
    for _ in range(400_000):
        t, hasta1, hasta3 = rng.expovariate(LAM), 0, 0
        while t <= 3:
            hasta3 += 1
            hasta1 += t <= 1
            t += rng.expovariate(LAM)
        if hasta1 >= 1:
            casos += 1
            favorables += hasta3 >= 3
    return {"a": favorables / casos}


# ----------------------------------------------------------------- ej 5

P_ADM, P_CORTA, P_LARGA = Fraction(8, 10), Fraction(5, 100), Fraction(15, 100)
VARILLAS, LOTES, MINIMO = 5, 100, 60


def p_aceptar() -> Fraction:
    """Multinomial: (4 admisibles, 0 cortas, 1 larga) o (5, 0, 0)."""
    total = Fraction(0)
    for adm, cor, lar in ((4, 0, 1), (5, 0, 0)):
        coef = math.factorial(VARILLAS) // (math.factorial(adm) * math.factorial(cor) * math.factorial(lar))
        total += coef * P_ADM**adm * P_CORTA**cor * P_LARGA**lar
    return total


def exacto_5() -> dict:
    p = sp.Rational(p_aceptar())
    assert p == sp.Rational(63488, 100000)
    media, desvio = LOTES * p, sp.sqrt(LOTES * p * (1 - p))
    # Correccion por continuidad: al menos 60 es mas de 59.5.
    return {
        "a": 1 - Phi((MINIMO - sp.Rational(1, 2) - media) / desvio),
        "p_aceptar": p,
    }


def estimado_5() -> dict:
    """La binomial exacta de los lotes aceptados."""
    p = float(p_aceptar())
    cola = sum(math.comb(LOTES, k) * p**k * (1 - p) ** (LOTES - k) for k in range(MINIMO, LOTES + 1))
    return {"a": cola}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("2", exacto_2, estimado_2),
    Ejercicio("3", exacto_3, estimado_3),
    Ejercicio("4", exacto_4, estimado_4),
    Ejercicio("5", exacto_5, estimado_5),
]
