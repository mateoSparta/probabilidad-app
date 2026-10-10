# -*- coding: utf-8 -*-
"""
Primer recuperatorio del 15-06-2019 (version 61.09 - 81.04).

El ejercicio 2 pide simular con numeros aleatorios dados: queda fuera del
alcance de PyE B (CLAUDE.md) y no tiene modelo.

  1. 12 bolas indistinguibles en 5 urnas, configuraciones equiprobables.
     P(urna 1 vacia | urna 5 con exactamente 3).
  3. p_X(x) = 2^x / (7 x!) en {0,...,4}, Y = 4X - X^2. Funcion de
     probabilidad de Y | Y > 0.
  4. Poisson de 15 por hora, cada cliente es Select con probabilidad 0.2.
     Sabiendo que entre 10:00 y 10:15 entraron 2 Select, esperanza del tiempo
     desde las 10:00 hasta el cuarto Select.
  5. Pallets de 198 ladrillos, cada uno util con probabilidad 0.6. Minima
     cantidad de pallets para que P(ladrillos utiles > 4000) > 0.95.

**El 5 no coincide con la resuelta.** La resuelta despeja "n > 33.12" y
concluye 34, pero con 34 pallets la media es 4039.2 y el desvio 40.2, de modo
que P(T > 4000) ~ Phi(0.975) = 0.835. El minimo es 35. El error esta en el
despeje: 4000 / 118.8 = 33.67 ya es mayor que 33.12, asi que 33.12 no puede
ser la cota. Ver revision/examenes.md.

Resuelta: fuentes/examenes/parciales/02 Parcial Resuelto - EP20190615Res.pdf,
paginas 5 a 8.
"""
from __future__ import annotations

import math
import random
from fractions import Fraction
from itertools import combinations
from math import comb, factorial

import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, cuantil_normal, montecarlo

ID_EXAMEN = "ep-20190615"


# ----------------------------------------------------------------- ej 1

BOLAS, URNAS = 12, 5


def configuraciones():
    """Todas las (n1, ..., n5) con suma 12, por barras y estrellas."""
    total = BOLAS + URNAS - 1
    for barras in combinations(range(total), URNAS - 1):
        cortes = (-1, *barras, total)
        yield tuple(cortes[i + 1] - cortes[i] - 1 for i in range(URNAS))


def exacto_1() -> dict:
    todas = list(configuraciones())
    assert len(todas) == comb(16, 12)
    b = [c for c in todas if c[4] == 3]
    ab = [c for c in b if c[0] == 0]
    # Control contra la cuenta de la resuelta: C(11, 9) / C(12, 3).
    assert Fraction(len(ab), len(b)) == Fraction(comb(11, 9), comb(12, 3))
    return {"a": Fraction(len(ab), len(b))}


def estimado_1() -> dict:
    total = BOLAS + URNAS - 1
    rng = random.Random(SEMILLA)
    casos = favorables = 0
    for _ in range(400_000):
        barras = sorted(rng.sample(range(total), URNAS - 1))
        cortes = (-1, *barras, total)
        c = [cortes[i + 1] - cortes[i] - 1 for i in range(URNAS)]
        if c[4] == 3:
            casos += 1
            favorables += c[0] == 0
    return {"a": favorables / casos}


# ----------------------------------------------------------------- ej 3

def p_x(x: int) -> Fraction:
    return Fraction(2**x, 7 * factorial(x))


def exacto_3() -> dict:
    sop = range(5)
    assert sum(p_x(x) for x in sop) == 1
    p_y: dict[int, Fraction] = {}
    for x in sop:
        y = 4 * x - x * x
        p_y[y] = p_y.get(y, Fraction(0)) + p_x(x)
    positivo = sum(p for y, p in p_y.items() if y > 0)
    return {"a1": p_y[3] / positivo, "a2": p_y[4] / positivo}


def estimado_3() -> dict:
    rng = random.Random(SEMILLA)
    pesos = [float(p_x(x)) for x in range(5)]
    tres = cuatro = 0
    for x in rng.choices(range(5), weights=pesos, k=400_000):
        y = 4 * x - x * x
        tres += y == 3
        cuatro += y == 4
    return {"a1": tres / (tres + cuatro), "a2": cuatro / (tres + cuatro)}


# ----------------------------------------------------------------- ej 4

INTENSIDAD = 15                     # clientes por hora
P_SELECT = sp.Rational(1, 5)
VENTANA = 15                        # minutos
YA_LLEGARON, BUSCADO = 2, 4


def exacto_4() -> dict:
    tasa_min = INTENSIDAD * P_SELECT / 60           # Select por minuto
    # Por incrementos independientes, lo que pasa despues de las 10:15 no
    # depende de lo anterior: faltan 2 Select, una Gamma(2, tasa).
    return {"a": VENTANA + (BUSCADO - YA_LLEGARON) / tasa_min}


def estimado_4() -> dict:
    tasa = INTENSIDAD / 60          # clientes por minuto, sin adelgazar
    p = float(P_SELECT)
    rng = random.Random(SEMILLA)
    casos, suma = 0, 0.0
    for _ in range(400_000):
        t, selects, en_ventana, cuarto = 0.0, 0, 0, None
        while cuarto is None:
            t += rng.expovariate(tasa)
            if rng.random() < p:
                selects += 1
                if t <= VENTANA:
                    en_ventana += 1
                if selects == BUSCADO:
                    cuarto = t
        if en_ventana == YA_LLEGARON:
            casos += 1
            suma += cuarto
    return {"a": suma / casos}


# ----------------------------------------------------------------- ej 5

POR_PALLET = 198
P_UTIL = sp.Rational(3, 5)
PARED = 4000
CONFIANZA = sp.Rational(95, 100)


def p_tcl(n: int) -> sp.Expr:
    media = n * POR_PALLET * P_UTIL
    desvio = sp.sqrt(n * POR_PALLET * P_UTIL * (1 - P_UTIL))
    return 1 - Phi((PARED - media) / desvio)


def cola_binomial(n: int, k: int, p: float) -> float:
    """P(Bin(n, p) > k), sumando la funcion de probabilidad en escala log."""
    lp, lq = math.log(p), math.log(1 - p)
    base = math.lgamma(n + 1)
    return sum(
        math.exp(base - math.lgamma(j + 1) - math.lgamma(n - j + 1) + j * lp + (n - j) * lq)
        for j in range(k + 1, n + 1)
    )


def exacto_5() -> dict:
    n = 1
    while p_tcl(n) <= CONFIANZA:
        n += 1
    assert p_tcl(n - 1) <= CONFIANZA < p_tcl(n)

    # Por el otro camino: despeje con u = sqrt(n), que deja una cuadratica.
    z = float(cuantil_normal(CONFIANZA))
    a = float(POR_PALLET * P_UTIL)
    b = -z * math.sqrt(float(POR_PALLET * P_UTIL * (1 - P_UTIL)))
    u = (-b + math.sqrt(b * b + 4 * a * PARED)) / (2 * a)
    assert math.ceil(u * u) == n, (u * u, n)

    return {
        "a": sp.Integer(n),
        # La resuelta dice 34. Con 34 pallets la probabilidad no llega:
        "p_con_34": sp.N(p_tcl(34), 6),
        "cota_del_despeje": sp.N(u * u, 6),
    }


def estimado_5() -> dict:
    """La distribucion exacta (binomial) da el mismo minimo que el TCL."""
    p = float(P_UTIL)
    n = 1
    while cola_binomial(n * POR_PALLET, PARED, p) <= float(CONFIANZA):
        n += 1
    return {"a": n}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("3", exacto_3, estimado_3),
    # El 4 es una esperanza en minutos: el error estandar del Monte Carlo es
    # ~0.12 min (desvio 28 sobre ~53000 casos aceptados).
    Ejercicio("4", exacto_4, estimado_4, tolerancia=0.5),
    Ejercicio("5", exacto_5, estimado_5, tolerancia=0.0),
]
