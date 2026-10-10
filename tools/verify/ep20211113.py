# -*- coding: utf-8 -*-
"""
Primer parcial (parte 2), tema 2, del 13-11-2021 (61.06 - 81.16 - 61.09 -
81.04).

  1. p(x, y) = 2^y y^x e^{-(2 + y/2)} / (2^x y! x!) en N0 x N0.
     P(var(X | Y) > 2).
  2. Rollos de tela: hilado 0.16, tenido 0.08, ambas 0.06. De 30 rollos,
     exactamente 1 tiene ambas fallas. P(mas de 27 no tienen fallas).
  3. Manzanas U[180, 220]; premium si superan un umbral. Minimo umbral para
     que un cajon de 48 premium pese mas de 10 kg con probabilidad >= 0.95.

**El 3 no coincide del todo con la resuelta.** La resuelta llega a
4720 - 24u <= -723.712 + 3.2896u y concluye u >= 199.6, pero de ahi sale
u >= 5443.712 / 27.2896 = 199.48. La diferencia es de 0.06 % y las dos caen
dentro de la tolerancia del item. Ver revision/examenes.md.

Resuelta: fuentes/examenes/parciales/12 Parcial Resuelto - EP 20211113Res.pdf
(escaneo; paginas 2 a 5).
"""
from __future__ import annotations

import math
import random
from fractions import Fraction

import sympy as sp

from comun import SEMILLA, Ejercicio, cuantil_normal, montecarlo

ID_EXAMEN = "ep-20211113"


# ----------------------------------------------------------------- ej 1

def p_conjunta(x: int, y: int) -> float:
    return 2**y * y**x * math.exp(-(2 + y / 2)) / (2**x * math.factorial(y) * math.factorial(x))


def exacto_1() -> dict:
    # Factoriza: Y ~ Poi(2) y X | Y = y ~ Poi(y/2), asi que var(X | Y) = Y / 2.
    # var(X|Y) > 2  <=>  Y > 4.
    k = sp.symbols("k", integer=True, nonnegative=True)
    p = 1 - sp.summation(sp.exp(-2) * 2**k / sp.factorial(k), (k, 0, 4))
    return {"a": sp.simplify(p)}


def estimado_1() -> dict:
    """
    Sin usar la factorizacion: para cada y se calcula var(X | Y = y) sumando
    la conjunta en x, y se suma P(Y = y) donde esa varianza supera 2.
    """
    total = 0.0
    for y in range(60):
        px = [p_conjunta(x, y) for x in range(80)]
        py = sum(px)
        if py < 1e-300:
            continue
        m1 = sum(x * p for x, p in enumerate(px)) / py
        m2 = sum(x * x * p for x, p in enumerate(px)) / py
        if m2 - m1 * m1 > 2 + 1e-9:
            total += py
    return {"a": total}


# ----------------------------------------------------------------- ej 2

HILADO, TENIDO, AMBAS = Fraction(16, 100), Fraction(8, 100), Fraction(6, 100)
ROLLOS, MAS_DE = 30, 27


def exacto_2() -> dict:
    sin_fallas = 1 - (HILADO + TENIDO - AMBAS)
    # Los otros 29 rollos no tienen ambas fallas: se condiciona a eso.
    p = sin_fallas / (1 - AMBAS)
    resto = ROLLOS - 1
    cola = sum(
        math.comb(resto, k) * p**k * (1 - p) ** (resto - k) for k in range(MAS_DE + 1, resto + 1)
    )
    return {"a": cola, "p_sin_fallas_dado": p}


def estimado_2() -> dict:
    # Cada rollo: ambas (0.06), solo hilado (0.10), solo tenido (0.02), ninguna (0.82).
    probs = [float(AMBAS), float(HILADO - AMBAS), float(TENIDO - AMBAS)]
    rng = random.Random(SEMILLA)
    casos = favorables = 0
    for _ in range(1_000_000):
        ambas = sanos = 0
        for _ in range(ROLLOS):
            u = rng.random()
            if u < probs[0]:
                ambas += 1
            elif u >= sum(probs):
                sanos += 1
        if ambas == 1:
            casos += 1
            favorables += sanos > MAS_DE
    return {"a": favorables / casos}


# ----------------------------------------------------------------- ej 3

A, B = 180, 220
CAJON, OBJETIVO = 48, 10_000
CONFIANZA = sp.Rational(95, 100)


def exacto_3() -> dict:
    u = sp.symbols("u", positive=True)
    # Una premium es U(u, 220): media (220 + u)/2, varianza (220 - u)^2/12.
    media = CAJON * (B + u) / 2
    desvio = sp.sqrt(CAJON * (B - u) ** 2 / 12)
    z = cuantil_normal(CONFIANZA)
    # P(C > 10000) >= 0.95  <=>  (10000 - media) / desvio <= -z. El desvio es
    # 2 (220 - u) > 0, asi que la condicion es lineal en u.
    corte = sp.solve(sp.Eq(OBJETIVO - media, -z * 2 * (B - u)), u)[0]
    # sympy no sabe que u < 220; se compara en puntos del rango.
    assert all(desvio.subs(u, t) == 2 * (B - t) for t in (181, 200, 219))
    return {
        # Un umbral en gramos se informa al centesimo.
        "a": Fraction(round(float(corte) * 100), 100),
        "sin_redondear": sp.N(corte, 12),
        "segun_la_resuelta": sp.Rational(1996, 10),
    }


def estimado_3() -> dict:
    """
    Busqueda por biseccion del umbral con la probabilidad del TCL en punto
    flotante, sin despejar: verifica el despeje, no la aproximacion.
    """
    def p(umbral: float) -> float:
        media = CAJON * (B + umbral) / 2
        desvio = math.sqrt(CAJON * (B - umbral) ** 2 / 12)
        z = (OBJETIVO - media) / desvio
        return 1 - (1 + math.erf(z / math.sqrt(2))) / 2

    lo, hi = float(A), float(B) - 1e-9
    for _ in range(100):
        m = (lo + hi) / 2
        if p(m) >= float(CONFIANZA):
            hi = m
        else:
            lo = m
    return {"a": hi}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("2", exacto_2, estimado_2),
    # El exacto se redondea al centesimo; la biseccion no.
    Ejercicio("3", exacto_3, estimado_3, tolerancia=0.005),
]
