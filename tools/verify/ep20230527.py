# -*- coding: utf-8 -*-
"""
Evaluacion parcial del 27-05-2023 (81.16 - 61.09 - 81.04).

La fuente es un examen de alumno escaneado, corregido con nota 10: las
respuestas de referencia son las de ese examen, que el corrector marco como
bien resueltas.

  1. P(D) = 0.8, P(D U M) = 0.9, P(no M | D) = 0.375. Son D y M
     independientes?
  3. W = 0.2 I^2 con I ~ U(5, 25). Funcion de distribucion de W.
  4. Orcos 0.1, enanos 0.4, hobbits 0.5; entran clientes hasta el quinto orco.
     Sabiendo que entraron 12, P(hay mas enanos que hobbits).
  5. Resistencia N(1200, 120^2); carga 400 + suma de 6 pesos N(80, 16^2).
     P(la carga supera la resistencia).

El ejercicio 2 pide construir una variable aleatoria con ciertas propiedades:
tiene infinitas respuestas correctas y no se carga.

**El 4 no coincide con la resuelta.** El alumno obtuvo 0.371 porque redondeo
4/9 a 0.44 antes de sumar la binomial (con 0.44 da 0.3706). Con 4/9 exacto el
resultado es 1817344/4782969 = 0.3800. Ver revision/examenes.md.

Resuelta: fuentes/examenes/parciales/01 Parcial Resuelto - 27_05_2023.pdf
(escaneo; paginas 2 a 6).
"""
from __future__ import annotations

import random
from fractions import Fraction
from itertools import product
from math import comb

import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, montecarlo

ID_EXAMEN = "ep-20230527"


# ----------------------------------------------------------------- ej 1

def exacto_1() -> dict:
    p_d, p_union, p_no_m_dado_d = Fraction(8, 10), Fraction(9, 10), Fraction(375, 1000)
    p_dm = (1 - p_no_m_dado_d) * p_d
    p_m = p_union - p_d + p_dm
    assert p_dm != p_d * p_m
    return {"p_DM": p_dm, "p_D_por_p_M": p_d * p_m}


def estimado_1() -> dict:
    return {}


# ----------------------------------------------------------------- ej 3

R = sp.Rational(1, 5)
A, B = 5, 25
PUNTOS_3 = (4, 20, 80)


def exacto_3() -> dict:
    w = sp.symbols("w", positive=True)
    # W <= w  <=>  I <= sqrt(w / r), porque I > 0.
    raiz = sp.sqrt(w / R)
    F = sp.Piecewise((0, raiz < A), ((raiz - A) / (B - A), raiz < B), (1, True))
    return {f"a{i}": sp.simplify(F.subs(w, t)) for i, t in enumerate(PUNTOS_3, 1)}


def estimado_3() -> dict:
    rng = random.Random(SEMILLA)
    n = 400_000
    muestras = [float(R) * rng.uniform(A, B) ** 2 for _ in range(n)]
    return {f"a{i}": sum(1 for v in muestras if v <= t) / n for i, t in enumerate(PUNTOS_3, 1)}


# ----------------------------------------------------------------- ej 4

P_ORCO, P_ENANO, P_HOBBIT = Fraction(1, 10), Fraction(4, 10), Fraction(5, 10)
ORCOS, TOTAL = 5, 12


def exacto_4() -> dict:
    # El ultimo es el quinto orco; entre los 11 anteriores hay 4 orcos y 7 que
    # no lo son, y cada uno de esos 7 es enano con probabilidad 0.4 / 0.9.
    resto = TOTAL - ORCOS
    pe = P_ENANO / (P_ENANO + P_HOBBIT)
    def cola(q):
        return sum(comb(resto, e) * q**e * (1 - q) ** (resto - e) for e in range(resto + 1) if e > resto - e)

    return {
        "a": cola(pe),
        # Lo que obtuvo el alumno, con 4/9 redondeado a 0.44.
        "con_4_9_redondeado": sp.N(cola(Fraction(44, 100)), 5),
    }


def estimado_4() -> dict:
    """
    Enumeracion de las 3^11 secuencias de los once primeros clientes, sin
    renormalizar nada: el evento condicionante es "entre los 11 primeros hay
    exactamente 4 orcos" (el duodecimo es el quinto orco, con probabilidad
    0.1 en todos los casos, y se cancela). Un Monte Carlo por rechazo no
    sirve aca, porque P(entraron 12) = 0.0016 deja muy pocos casos.
    """
    probs = {"O": P_ORCO, "E": P_ENANO, "H": P_HOBBIT}
    casos = favorables = Fraction(0)
    for sec in product("OEH", repeat=TOTAL - 1):
        if sec.count("O") != ORCOS - 1:
            continue
        p = Fraction(1)
        for c in sec:
            p *= probs[c]
        casos += p
        if sec.count("E") > sec.count("H"):
            favorables += p
    return {"a": float(favorables / casos)}


# ----------------------------------------------------------------- ej 5

RES_MEDIA, RES_DESVIO = 1200, 120
CABINA, PERSONAS = 400, 6
PESO_MEDIA, PESO_DESVIO = 80, 16


def exacto_5() -> dict:
    # R - W ~ N(1200 - 480, 120^2 + 6 * 16^2), y se pide P(R - W < 400).
    media = RES_MEDIA - PERSONAS * PESO_MEDIA
    var = RES_DESVIO**2 + PERSONAS * PESO_DESVIO**2
    return {"a": sp.simplify(Phi((CABINA - media) / sp.sqrt(var)))}


def estimado_5() -> dict:
    def experimento(rng: random.Random) -> bool:
        carga = CABINA + sum(rng.gauss(PESO_MEDIA, PESO_DESVIO) for _ in range(PERSONAS))
        return carga > rng.gauss(RES_MEDIA, RES_DESVIO)

    return {"a": montecarlo(experimento, n=1_000_000)}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("3", exacto_3, estimado_3),
    Ejercicio("4", exacto_4, estimado_4, tolerancia=1e-9),
    Ejercicio("5", exacto_5, estimado_5),
]
