# -*- coding: utf-8 -*-
"""
Primer recuperatorio del 18-11-2017 (version 61.09 - 81.04).

El ejercicio 1 pide simular con numeros aleatorios dados: queda fuera del
alcance de PyE B (CLAUDE.md) y no tiene modelo.

  2. L, M ~ Exp de media 5, independientes. F_{L+M | L<M}.
  3. Semaforos: rojo 0.4, amarillo 0.1, verde 0.5, independientes; se detiene
     en el primer rojo. cov(verdes atravesados, amarillos atravesados).
  4. Hobbits, elfos y dwarves Poisson independientes de 3/5, 2/3 y 1/2 por
     hora. P(el cuarto cliente llega despues de las 0:30 y entre los tres
     primeros hay al menos un hobbit y al menos un elfo).
  5. TCL: 750 g fijos mas 121 galletitas de media 3.75 y desvio 0.5. Maxima
     cantidad de porciones de 40 g con probabilidad no menor que 0.95.

Resuelta: fuentes/examenes/parciales/10 Parcial Resuelto - EP20171118Res.pdf,
paginas 4 a 7.
"""
from __future__ import annotations

import math
import random
from fractions import Fraction

import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, cuantil_normal

ID_EXAMEN = "ep-20171118"


# ----------------------------------------------------------------- ej 2

MEDIA = 5
PUNTOS_2 = (2, 5, 12)


def exacto_2() -> dict:
    l, m, t = sp.symbols("l m t", positive=True)
    f = sp.exp(-l / MEDIA) * sp.exp(-m / MEDIA) / MEDIA**2
    conj = sp.integrate(sp.integrate(f, (m, l, t - l)), (l, 0, t / 2))
    p_l_menor = sp.integrate(sp.integrate(f, (m, l, sp.oo)), (l, 0, sp.oo))
    assert p_l_menor == sp.Rational(1, 2)
    F = sp.simplify(conj / p_l_menor)
    assert sp.simplify(F - (1 - sp.exp(-t / 5) * (1 + t / 5))) == 0, F
    salida = {"a": F}
    for i, v in enumerate(PUNTOS_2, 1):
        salida[f"a_en_{i}"] = F.subs(t, v)
    return salida


def estimado_2() -> dict:
    rng = random.Random(SEMILLA)
    sumas = []
    while len(sumas) < 400_000:
        a, b = rng.expovariate(1 / MEDIA), rng.expovariate(1 / MEDIA)
        if a < b:
            sumas.append(a + b)
    n = len(sumas)
    return {f"a_en_{i}": sum(1 for s in sumas if s <= v) / n for i, v in enumerate(PUNTOS_2, 1)}


# ----------------------------------------------------------------- ej 3

ROJO, AMARILLO = Fraction(4, 10), Fraction(1, 10)


def exacto_3() -> dict:
    """
    Condicionando a N, el semaforo en el que se detiene, que es geometrica.
    Dado N = n, (verdes, amarillos) es multinomial con n - 1 ensayos y
    probabilidades 5/6 y 1/6, de modo que E[V A | N = n] = (n-1)(n-2) pv pa.
    La resuelta va por otro camino (cov(V, N) - var(V)).
    """
    pv = (1 - ROJO - AMARILLO) / (1 - ROJO)
    pa = AMARILLO / (1 - ROJO)
    # Sumas cerradas para N ~ Geom(0.4): E[N-1], E[(N-1)(N-2)].
    q = 1 - ROJO
    e_k = q / ROJO                         # E[N - 1]
    e_kk1 = 2 * q**2 / ROJO**2             # E[(N-1)(N-2)]
    e_va = e_kk1 * pv * pa
    e_v, e_a = e_k * pv, e_k * pa
    return {"a": e_va - e_v * e_a}


def estimado_3() -> dict:
    rng = random.Random(SEMILLA)
    n = 1_000_000
    sv = sa = sva = 0
    for _ in range(n):
        v = a = 0
        while True:
            u = rng.random()
            if u < 0.4:
                break
            if u < 0.5:
                a += 1
            else:
                v += 1
        sv += v
        sa += a
        sva += v * a
    return {"a": sva / n - (sv / n) * (sa / n)}


# ----------------------------------------------------------------- ej 4

TASAS = {"h": sp.Rational(3, 5), "e": sp.Rational(2, 3), "d": sp.Rational(1, 2)}
CORTE = sp.Rational(1, 2)


def exacto_4() -> dict:
    lam = sum(TASAS.values())
    mu = lam * CORTE
    # S_4 > 1/2  <=>  N(1/2) <= 3.
    p_tarde = sum(sp.exp(-mu) * mu**k / sp.factorial(k) for k in range(4))
    ph, pe = TASAS["h"] / lam, TASAS["e"] / lam
    # Inclusion-exclusion sobre "ningun hobbit" y "ningun elfo" en 3 clientes.
    p_tipos = 1 - ((1 - ph) ** 3 + (1 - pe) ** 3 - (1 - ph - pe) ** 3)
    return {"a": sp.simplify(p_tarde * p_tipos), "p_tarde": sp.N(p_tarde, 6), "p_tipos": p_tipos}


def estimado_4() -> dict:
    """Simula los tres procesos por separado, sin superponerlos a mano."""
    tasas = {k: float(v) for k, v in TASAS.items()}
    rng = random.Random(SEMILLA)
    n = 400_000
    ok = 0
    for _ in range(n):
        llegadas = []
        for tipo, lam in tasas.items():
            t = rng.expovariate(lam)
            while t < 10:
                llegadas.append((t, tipo))
                t += rng.expovariate(lam)
        llegadas.sort()
        if len(llegadas) < 4 or llegadas[3][0] <= 0.5:
            continue
        primeros = [tp for _, tp in llegadas[:3]]
        ok += "h" in primeros and "e" in primeros
    return {"a": ok / n}


# ----------------------------------------------------------------- ej 5

FIJO, GALLETITAS = 750, 121
MEDIA_G, DESVIO_G = sp.Rational(375, 100), sp.Rational(1, 2)
PORCION = 40
CONFIANZA = sp.Rational(95, 100)


def p_tcl(n: int) -> sp.Expr:
    media = FIJO + GALLETITAS * MEDIA_G
    desvio = sp.sqrt(GALLETITAS) * DESVIO_G
    return 1 - Phi((PORCION * n - media) / desvio)


def exacto_5() -> dict:
    n = 1
    while p_tcl(n + 1) >= CONFIANZA:
        n += 1
    assert p_tcl(n) >= CONFIANZA > p_tcl(n + 1)
    z = float(cuantil_normal(CONFIANZA))
    cota = (float(FIJO + GALLETITAS * MEDIA_G) - z * float(sp.sqrt(GALLETITAS) * DESVIO_G)) / PORCION
    assert math.floor(cota) == n
    return {"a": sp.Integer(n), "cota_del_despeje": sp.N(cota, 6)}


def estimado_5() -> dict:
    """
    El mayor n para el que la torta simulada alcanza con probabilidad >= 0.95.
    Solo se conocen media y desvio de cada galletita; se las toma normales.
    """
    rng = random.Random(SEMILLA)
    m, d = float(MEDIA_G), float(DESVIO_G)
    pesos = sorted(FIJO + sum(rng.gauss(m, d) for _ in range(GALLETITAS)) for _ in range(40_000))
    # P(peso > 40 n) >= 0.95  <=>  el cuantil 0.05 del peso supera 40 n.
    q05 = pesos[int(0.05 * len(pesos))]
    return {"a": math.floor(q05 / PORCION)}


EJERCICIOS = [
    Ejercicio("2", exacto_2, estimado_2),
    # Producto de conteos de cola geometrica: error estandar ~0.004 con 1e6.
    Ejercicio("3", exacto_3, estimado_3, tolerancia=0.02),
    Ejercicio("4", exacto_4, estimado_4),
    Ejercicio("5", exacto_5, estimado_5, tolerancia=0.0),
]
