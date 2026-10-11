# -*- coding: utf-8 -*-
"""
Parcial del 14-06-2025 (segunda fecha, comun a las tres materias).

  1. Cajas de 10 piezas; el control elige dos sin reposicion y rechaza si
     alguna es defectuosa. Las defectuosas dependen de un dado (0, 1 o 4).
     P(a lo sumo una defectuosa | caja rechazada).
  2. Moneda con P(cara) = 0.3; caja con 6 rojas y 4 azules. Cara: 3 bolas
     sin reposicion; ceca: 3 bolas con reposicion. E[rojas extraidas].
  3. (X, Y) uniforme en R = {0 < x < 4, x - 1 < y < x + 2}. Funcion de
     distribucion de W = (Y - X + 1)/3.
  4. Correos Poisson de 10 por hora, cada uno SPAM con probabilidad 0.7.
     Sabiendo que en una hora llegaron 4 NO SPAM, P(7 o mas en total).
  5. Aportes de 2000 (prob. 0.3) o 4000 (prob. 0.2) por seguidor. Cantidad
     minima de seguidores para que P(recaudacion > 1500000) >= 0.95, por TCL.

No hay resuelta: los valores vienen solo de estos modelos, cada uno por dos
caminos independientes.

Enunciado: fuentes/examenes/finales/EP_20250614.pdf.
"""
from __future__ import annotations

import math
import random
from fractions import Fraction
from math import comb

import numpy as np
import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, area_region, cuantil_normal, montecarlo_2d

ID_EXAMEN = "ep-20250614"


# ----------------------------------------------------------------- ej 1

PIEZAS = 10
ELEGIDAS = 2

# Cuantas defectuosas pone, segun el dado, con su probabilidad.
CAUSAS = {
    0: Fraction(1, 6),   # sale 1
    1: Fraction(4, 6),   # sale 2, 3, 4 o 5
    4: Fraction(1, 6),   # sale 6
}


def p_rechazo(defectuosas: int) -> Fraction:
    """1 - P(las dos elegidas son buenas)."""
    buenas = PIEZAS - defectuosas
    if buenas < ELEGIDAS:
        return Fraction(1)
    return 1 - Fraction(comb(buenas, ELEGIDAS), comb(PIEZAS, ELEGIDAS))


def exacto_1() -> dict:
    assert sum(CAUSAS.values()) == 1, "las causas no suman 1"
    p_rech = sum((p * p_rechazo(d) for d, p in CAUSAS.items()), Fraction(0))
    conjunta = sum(
        (p * p_rechazo(d) for d, p in CAUSAS.items() if d <= 1), Fraction(0)
    )
    return {
        "a": conjunta / p_rech,
        # Se deja la marginal como control: es el denominador de Bayes.
        "p_rechazo": p_rech,
    }


def estimado_1() -> dict:
    rng = random.Random(SEMILLA)
    casos = favorables = 0
    for _ in range(2_000_000):
        dado = rng.randint(1, 6)
        d = 0 if dado == 1 else (1 if dado <= 5 else 4)
        caja = [True] * d + [False] * (PIEZAS - d)   # True = defectuosa
        if any(rng.sample(caja, ELEGIDAS)):
            casos += 1
            if d <= 1:
                favorables += 1
    return {"a": favorables / casos}


# ----------------------------------------------------------------- ej 2

P_CARA = Fraction(3, 10)
ROJAS, AZULES, EXTRAIDAS = 6, 4, 3


def exacto_2() -> dict:
    total = ROJAS + AZULES
    # Cara: hipergeometrica, por su funcion de probabilidad.
    e_cara = sum(
        Fraction(k * comb(ROJAS, k) * comb(AZULES, EXTRAIDAS - k), comb(total, EXTRAIDAS))
        for k in range(EXTRAIDAS + 1)
    )
    # Ceca: binomial con p = 6/10, tambien por su funcion de probabilidad.
    p = Fraction(ROJAS, total)
    e_ceca = sum(
        k * comb(EXTRAIDAS, k) * p**k * (1 - p) ** (EXTRAIDAS - k)
        for k in range(EXTRAIDAS + 1)
    )
    # Las dos esperanzas valen 3 * 6/10: la moneda no cambia la media.
    assert e_cara == e_ceca == EXTRAIDAS * p
    return {
        "a": P_CARA * e_cara + (1 - P_CARA) * e_ceca,
        "e_cara": e_cara,
        "e_ceca": e_ceca,
    }


def estimado_2() -> dict:
    rng = random.Random(SEMILLA)
    caja = ["R"] * ROJAS + ["A"] * AZULES
    n = 400_000
    suma = 0
    for _ in range(n):
        if rng.random() < float(P_CARA):
            bolas = rng.sample(caja, EXTRAIDAS)
        else:
            bolas = [rng.choice(caja) for _ in range(EXTRAIDAS)]
        suma += bolas.count("R")
    return {"a": suma / n}


# ----------------------------------------------------------------- ej 3

PUNTOS_3 = (sp.Rational(1, 3), sp.Rational(3, 4), sp.Rational(3, 2))


def exacto_3() -> dict:
    x, y = sp.symbols("x y", real=True)
    en_r = (x > 0) & (x < 4) & (y > x - 1) & (y < x + 2)
    area_r = area_region(en_r, x, y, 0, 4, -1, 6)
    assert area_r == 12
    salida = {}
    for i, w in enumerate(PUNTOS_3, 1):
        # W <= w  <=>  Y - X <= 3w - 1, intersecado con R.
        recorte = en_r & (y - x <= 3 * w - 1)
        salida[f"a{i}"] = sp.nsimplify(area_region(recorte, x, y, 0, 4, -1, 6) / area_r)
    return salida


def estimado_3() -> dict:
    # Rechazo sobre el rectangulo [0, 4] x [-1, 6]: no supone nada sobre la
    # forma de R ni sobre la distribucion de Y - X.
    def punto(rng):
        x, y = rng.uniform(0, 4), rng.uniform(-1, 6)
        return (x, y) if x - 1 < y < x + 2 else None

    return {
        f"a{i}": montecarlo_2d(punto, lambda x, y, w=float(w): (y - x + 1) / 3 <= w)
        for i, w in enumerate(PUNTOS_3, 1)
    }


# ----------------------------------------------------------------- ej 4

INTENSIDAD = 10            # correos por hora
P_SPAM = sp.Rational(7, 10)
NO_SPAM_VISTOS = 4
UMBRAL = 7


def exacto_4() -> dict:
    # Por adelgazamiento, SPAM y NO SPAM son Poisson independientes de medias
    # 7 y 3. Dado NO SPAM = 4, total >= 7 equivale a SPAM >= 3.
    media_spam = INTENSIDAD * P_SPAM
    faltan = UMBRAL - NO_SPAM_VISTOS
    cola = 1 - sum(sp.exp(-media_spam) * media_spam**k / sp.factorial(k) for k in range(faltan))
    a = sp.nsimplify(sp.simplify(cola))

    # Por el otro camino, sin usar la independencia: condicionar sobre el
    # total N ~ Poisson(10) y adelgazar con la binomial.
    def conjunta(n: int) -> float:
        p_n = math.exp(-INTENSIDAD + n * math.log(INTENSIDAD) - math.lgamma(n + 1))
        q = 1 - float(P_SPAM)
        return p_n * comb(n, NO_SPAM_VISTOS) * q**NO_SPAM_VISTOS * (1 - q) ** (n - NO_SPAM_VISTOS)

    den = sum(conjunta(n) for n in range(NO_SPAM_VISTOS, 200))
    num = sum(conjunta(n) for n in range(UMBRAL, 200))
    assert abs(num / den - float(a)) < 1e-12, (num / den, float(a))
    return {"a": a}


def estimado_4() -> dict:
    rng = np.random.default_rng(SEMILLA)
    n = 4_000_000
    total = rng.poisson(INTENSIDAD, n)
    no_spam = rng.binomial(total, 1 - float(P_SPAM))
    casos = no_spam == NO_SPAM_VISTOS
    return {"a": float(np.mean(total[casos] >= UMBRAL))}


# ----------------------------------------------------------------- ej 5

APORTES = {0: Fraction(5, 10), 2000: Fraction(3, 10), 4000: Fraction(2, 10)}
META = 1_500_000
CONFIANZA = sp.Rational(95, 100)


def momentos_5() -> tuple[Fraction, Fraction]:
    assert sum(APORTES.values()) == 1
    media = sum(v * p for v, p in APORTES.items())
    varianza = sum(v * v * p for v, p in APORTES.items()) - media**2
    return media, varianza


def p_tcl_5(n: int) -> sp.Expr:
    media, varianza = momentos_5()
    return 1 - Phi((META - n * media) / sp.sqrt(n * varianza))


def exacto_5() -> dict:
    media, varianza = momentos_5()
    n = 1
    while p_tcl_5(n) < CONFIANZA:
        n += 1
    assert p_tcl_5(n - 1) < CONFIANZA <= p_tcl_5(n)

    # Por el otro camino: con u = sqrt(n) queda una cuadratica.
    z = float(cuantil_normal(CONFIANZA))
    a, b = float(media), -z * math.sqrt(float(varianza))
    u = (-b + math.sqrt(b * b + 4 * a * META)) / (2 * a)
    assert math.ceil(u * u) == n, (u * u, n)

    return {
        "a": sp.Integer(n),
        "media_aporte": media,
        "varianza_aporte": varianza,
        "cota_del_despeje": sp.N(u * u, 6),
    }


def estimado_5() -> dict:
    """
    El minimo con la distribucion exacta de la recaudacion. En unidades de
    2000, cada aporte vale 0, 1 o 2, y la suma se obtiene convolucionando.
    """
    pesos = np.array([float(APORTES[0]), float(APORTES[2000]), float(APORTES[4000])])
    umbral = META // 2000                 # recaudacion > META  <=>  suma > 750
    dist = np.array([1.0])
    n = 0
    while True:
        n += 1
        dist = np.convolve(dist, pesos)
        if dist[umbral + 1:].sum() >= float(CONFIANZA):
            return {"a": n}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    # La media de rojas tiene desvio ~0.85 por extraccion: con 4e5 muestras el
    # error estandar es ~0.0013.
    Ejercicio("2", exacto_2, estimado_2, tolerancia=0.01),
    Ejercicio("3", exacto_3, estimado_3),
    Ejercicio("4", exacto_4, estimado_4),
    # La distribucion exacta da el mismo minimo que el TCL, y el despeje da
    # 1134 con cualquier redondeo de z entre 1.64 y 1.65.
    Ejercicio("5", exacto_5, estimado_5, tolerancia=0.0),
]
