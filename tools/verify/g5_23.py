# -*- coding: utf-8 -*-
"""
Ejercicio 5.23 — bolsas de naranjas hasta pasar los 5 kilos.

Cada bolsa pesa U(3, 6) y se agregan hasta que el total supere 5 kilos. Se
pide la media y la varianza del peso final.

Lo que hace manejable el ejercicio: **nunca hacen falta mas de dos bolsas**.
Una sola bolsa pesa entre 3 y 6, asi que si la primera pasa de 5 ya esta; y si
no pasa, la segunda lleva el total a por lo menos 6, que ya supera 5. Entonces

    W = L1                 si L1 > 5     (probabilidad 1/3)
    W = L1 + L2            si L1 <= 5    (probabilidad 2/3)

y las dos ramas se integran directo. El error tipico es tratar la cantidad de
bolsas como geometrica sin notar ese tope.
"""
from __future__ import annotations

import random

import sympy as sp

ID = "g5-23"
NUMERO = "5.23"

A, B = 3, 6
OBJETIVO = 5

l1, l2 = sp.symbols("l1 l2", positive=True)
DENS = sp.Rational(1, B - A)


def exacto() -> dict[str, sp.Expr]:
    # Rama 1: la primera bolsa ya supera el objetivo.
    def rama1(g):
        return sp.integrate(g.subs(l2, 0) * DENS, (l1, OBJETIVO, B))

    # Rama 2: hace falta la segunda.
    def rama2(g):
        return sp.integrate(
            sp.integrate(g * DENS * DENS, (l2, A, B)), (l1, A, OBJETIVO)
        )

    masa = sp.simplify(rama1(sp.Integer(1)) + rama2(sp.Integer(1)))
    assert masa == 1, f"la masa da {masa}, no 1"

    peso1 = l1
    peso2 = l1 + l2
    e_w = sp.simplify(rama1(peso1) + rama2(peso2))
    e_w2 = sp.simplify(rama1(peso1**2) + rama2(peso2**2))
    var_w = sp.simplify(e_w2 - e_w**2)

    # Control: la cantidad de bolsas solo puede ser 1 o 2.
    p_una = sp.Rational(B - OBJETIVO, B - A)
    assert sp.simplify(p_una - sp.Rational(1, 3)) == 0

    return {
        "a1": e_w,
        "a2": var_w,
        "e_w2": e_w2,
        "p_una_bolsa": p_una,
    }


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    pesos = []
    for _ in range(n):
        acum = 0.0
        while acum <= OBJETIVO:
            acum += rng.uniform(A, B)
        pesos.append(acum)
    m = sum(pesos) / n
    var = sum((p - m) ** 2 for p in pesos) / n
    return {
        "a1": m,
        "a2": var,
        "p_una_bolsa": sum(1 for p in pesos if p > OBJETIVO and p <= B) / n,
    }


# E[W] = 7.5 y var[W] = 11/4; el error estandar ronda 0.003 y 0.01.
TOLERANCIA = 0.05

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
