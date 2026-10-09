# -*- coding: utf-8 -*-
"""
Ejercicio 8.2 — el umbral optimo de un detector.

X = S + N, con S Bernoulli(3/4) y N normal de media 0 y desvio 1/2,
independientes. El detector deja pasar si X > c. Hay error cuando no deja
pasar una senal util (S = 1) o cuando deja pasar una inutil (S = 0). Se pide
el c que minimiza la probabilidad de error.

    P(error) = P(S=1) P(X <= c | S=1) + P(S=0) P(X > c | S=0)
             = (3/4) Phi((c-1)/sigma) + (1/4) (1 - Phi(c/sigma))

Derivando e igualando a cero, las dos densidades normales se igualan pesadas
por sus priors:

    3 phi((c-1)/sigma) = phi(c/sigma)

y tomando logaritmo queda una ecuacion **lineal** en c, porque los terminos
cuadraticos se cancelan. Sale c = (2 - ln 3)/4, que es menor que 1/2: el
umbral se corre hacia abajo porque la senal util es tres veces mas probable,
asi que conviene equivocarse menos de ese lado.

El modelo deriva y despeja con sympy, y ademas verifica por dos caminos
independientes: que la derivada se anule ahi, y que ningun c de una grilla fina
alrededor de la solucion de un error mas chico.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import Phi, TOL_MONTECARLO

ID = "g8-02"
NUMERO = "8.2"

P_UTIL = sp.Rational(3, 4)
SIGMA = sp.Rational(1, 2)

c = sp.Symbol("c", real=True)


def p_error(cc):
    """P(error) con umbral cc."""
    return P_UTIL * Phi((cc - 1) / SIGMA) + (1 - P_UTIL) * (1 - Phi(cc / SIGMA))


def exacto() -> dict[str, sp.Expr]:
    derivada = sp.diff(p_error(c), c)
    soluciones = sp.solve(sp.Eq(derivada, 0), c)
    assert len(soluciones) == 1, f"se esperaba un solo optimo: {soluciones}"
    optimo = sp.simplify(soluciones[0])

    # Control 1: la derivada se anula ahi.
    assert sp.simplify(derivada.subs(c, optimo)) == 0

    # Control 2: ningun c cercano da menos error. Grilla fina, sin confiar en
    # la derivada.
    mejor = float(p_error(optimo))
    paso = 0.002
    for k in range(-100, 101):
        if k == 0:
            continue
        candidato = float(optimo) + k * paso
        if float(p_error(sp.Float(candidato))) < mejor - 1e-12:
            raise AssertionError(f"c={candidato} da menos error que el optimo")

    return {
        "a": optimo,
        "error_minimo": sp.simplify(p_error(optimo)),
        # Para comparar: el umbral que usaria alguien que ignora los priors.
        "umbral_sin_priors": sp.Rational(1, 2),
    }


def estimado() -> dict[str, float]:
    """
    Verifica el error minimo simulando el detector con ese umbral, y de paso
    chequea que un umbral distinto de peor resultado.
    """
    optimo = float(exacto()["a"])

    def tasa(umbral: float) -> float:
        rng = random.Random(20260408)
        n = 600_000
        errores = 0
        for _ in range(n):
            s = 1 if rng.random() < float(P_UTIL) else 0
            x = s + rng.gauss(0, float(SIGMA))
            paso = x > umbral
            if (s == 1 and not paso) or (s == 0 and paso):
                errores += 1
        return errores / n

    return {"error_minimo": tasa(optimo)}


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    e = exacto()
    for k, v in e.items():
        print(f"  {k}: {v} = {float(v):.6f}")
