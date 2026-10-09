# -*- coding: utf-8 -*-
"""
Ejercicio 4.6 — limitador no lineal.

V1 ~ U[180, 220] pasa por g(v) = (v-190)/20 en [190,210], 1 si v > 210, y 0
si v < 190. Se pide la distribucion de V2 = g(V1).

Lo interesante: g **aplasta** dos tramos del dominio en un solo valor cada
uno. Todo el intervalo [180,190) va a 0 y todo (210,220] va a 1. Eso le mete
dos atomos a V2, asi que V2 es mixta aunque V1 sea continua. Es el punto del
ejercicio: una transformacion no inyectiva puede crear masa puntual.

El metodo es el de la F: F_{V2}(t) = P(g(V1) <= t), traducido a un evento
sobre V1.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo

ID = "g4-06"
NUMERO = "4.6"

A, B = 180, 220          # rango de V1
CORTE_BAJO, CORTE_ALTO = 190, 210


def g(v):
    """El limitador."""
    if v < CORTE_BAJO:
        return 0.0
    if v > CORTE_ALTO:
        return 1.0
    return (v - CORTE_BAJO) / (CORTE_ALTO - CORTE_BAJO)


def F(t) -> sp.Expr:
    """
    F_{V2}(t) exacta. Para 0 <= t < 1 el evento {g(V1) <= t} es
    {V1 < 190} union {190 <= V1 <= 190 + 20t}.
    """
    total = sp.Integer(B - A)
    if t < 0:
        return sp.Integer(0)
    if t >= 1:
        return sp.Integer(1)
    largo = sp.Rational(CORTE_BAJO - A) + sp.Rational(CORTE_ALTO - CORTE_BAJO) * sp.Rational(t)
    return sp.simplify(largo / total)


def exacto() -> dict[str, sp.Expr]:
    # Atomos: los dos tramos que g aplasta.
    atomo_0 = sp.Rational(CORTE_BAJO - A, B - A)
    atomo_1 = sp.Rational(B - CORTE_ALTO, B - A)

    # Control: en el tramo central V2 es uniforme con densidad 1/2, asi que
    # la masa total tiene que dar 1.
    masa_central = sp.Rational(CORTE_ALTO - CORTE_BAJO, B - A)
    assert sp.simplify(atomo_0 + atomo_1 + masa_central) == 1, "la masa no da 1"

    return {
        # claves a1..a4: el orden de los checkpoints en el YAML
        "a1": atomo_0,              # P(V2 = 0)
        "a2": F(sp.Rational(1, 2)),  # F(1/2)
        "a3": F(sp.Rational(9, 10)),  # F(0.9)
        "a4": atomo_1,              # P(V2 = 1)
    }


def _sortear(rng: random.Random) -> float:
    return g(rng.uniform(A, B))


def estimado() -> dict[str, float]:
    return {
        "a1": montecarlo(lambda r: _sortear(r) == 0.0),
        "a2": montecarlo(lambda r: _sortear(r) <= 0.5),
        "a3": montecarlo(lambda r: _sortear(r) <= 0.9),
        "a4": montecarlo(lambda r: _sortear(r) == 1.0),
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
