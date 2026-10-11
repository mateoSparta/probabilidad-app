# -*- coding: utf-8 -*-
"""
Ejercicio 7.12 — superposicion y competencia.

Lucas emite senales Poisson de intensidad 3 por minuto y Monk de intensidad
5 por minuto, independientes. La superposicion es Poisson de intensidad 8.

  (a) P(la primera senal es despues de las 0:10) = e^{-8 * 10} = e^{-80}.
  (b) P(la primera es de Lucas) = 3/8.
  (c) Cuando llega la primera y de quien es son independientes:
      P(despues de 0:10 y de Lucas) = (3/8) e^{-80}.

La lectura literal (10 minutos, intensidades por minuto) da un numero
minusculo; la resuelta (GUIA 7 RES 3, pagina 11) usa la misma lectura.

e^{-80} no se puede simular. El Monte Carlo verifica (b) y la factorizacion
de (c) con un tiempo chico, t = 0.1 minutos, donde las probabilidades son
estimables.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import SEMILLA, TOL_MONTECARLO

ID = "g7-12"
NUMERO = "7.12"

LUCAS, MONK = 3, 5
T, T_CHICO = 10, sp.Rational(1, 10)


def exacto() -> dict:
    lam = LUCAS + MONK
    p_lucas = sp.Rational(LUCAS, lam)
    # (c) integrando la densidad de la primera de Lucas mientras Monk no llego.
    s = sp.symbols("s", positive=True)

    def conjunta(t):
        return sp.integrate(LUCAS * sp.exp(-LUCAS * s) * sp.exp(-MONK * s), (s, t, sp.oo))

    assert sp.simplify(conjunta(T) - p_lucas * sp.exp(-lam * T)) == 0
    return {
        "a": sp.exp(-lam * T),
        "b": p_lucas,
        "c": sp.simplify(conjunta(T)),
        "a_chico": sp.exp(-lam * T_CHICO),
        "c_chico": sp.simplify(conjunta(T_CHICO)),
    }


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    n = 400_000
    lucas = tarde = ambas = 0
    for _ in range(n):
        tl, tm = rng.expovariate(LUCAS), rng.expovariate(MONK)
        es_lucas = tl < tm
        es_tarde = min(tl, tm) > float(T_CHICO)
        lucas += es_lucas
        tarde += es_tarde
        ambas += es_lucas and es_tarde
    return {"b": lucas / n, "a_chico": tarde / n, "c_chico": ambas / n}


TOLERANCIA = TOL_MONTECARLO
