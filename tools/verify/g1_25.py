# -*- coding: utf-8 -*-
"""
Ejercicio 1.25 — canal binario: Bayes al reves.

Datos: el 5% de los bits emitidos es 0, y P(el receptor indica 0 | se emitio
un 0) = 0.9. Se pide la probabilidad q = P(indica 1 | se emitio un 1) que
hace que P(se emitio un 0 | indica 0) = 0.99.

Es Bayes resuelto para la incognita, no aplicado. Con sympy se despeja q de
la ecuacion, y el Monte Carlo verifica que con esa q el posterior da 0.99,
que es la unica forma de chequear que se despejo bien.
"""
from __future__ import annotations

import random
from fractions import Fraction

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo

ID = "g1-25"
NUMERO = "1.25"

P_CERO = Fraction(5, 100)          # P(se emitio un 0)
P_IND0_DADO_0 = Fraction(9, 10)    # P(indica 0 | se emitio 0)
POSTERIOR = Fraction(99, 100)      # P(se emitio 0 | indica 0) buscado


def exacto() -> dict[str, Fraction]:
    q = sp.Symbol("q", positive=True)
    p0, p1 = sp.Rational(P_CERO), 1 - sp.Rational(P_CERO)
    # P(indica 0) = P(indica 0|0)P(0) + P(indica 0|1)P(1), y
    # P(indica 0|1) = 1 - q.
    p_ind0 = sp.Rational(P_IND0_DADO_0) * p0 + (1 - q) * p1
    ecuacion = sp.Eq(sp.Rational(P_IND0_DADO_0) * p0 / p_ind0, sp.Rational(POSTERIOR))
    soluciones = sp.solve(ecuacion, q)
    assert len(soluciones) == 1, f"se esperaba una sola solucion, salieron {soluciones}"
    valor = sp.nsimplify(soluciones[0])
    q = Fraction(int(sp.numer(valor)), int(sp.denom(valor)))
    # Se devuelve tambien el posterior que resulta de esa q: es lo que el
    # Monte Carlo puede comparar, porque q en si no es una frecuencia.
    return {"a": q, "posterior": _posterior(q)}


def estimado() -> dict[str, float]:
    """
    Con la q despejada, simula el canal y estima el posterior. Si el despeje
    esta bien, tiene que dar 0.99. Se compara contra ese 0.99, no contra q.
    """
    q = float(exacto()["a"])
    rng = random.Random(20260408)
    casos = favorables = 0
    # Se necesita mucha muestra porque "indica 0" es raro: solo el 5% de los
    # bits es 0 y el canal es casi perfecto para los 1.
    for _ in range(2_000_000):
        emitido = 0 if rng.random() < float(P_CERO) else 1
        if emitido == 0:
            indica = 0 if rng.random() < float(P_IND0_DADO_0) else 1
        else:
            indica = 1 if rng.random() < q else 0
        if indica == 0:
            casos += 1
            if emitido == 0:
                favorables += 1
    return {"posterior": favorables / casos if casos else 0.0}


def _posterior(q: Fraction) -> Fraction:
    """P(se emitio 0 | indica 0) con una q dada."""
    p0, p1 = P_CERO, 1 - P_CERO
    p_ind0 = P_IND0_DADO_0 * p0 + (1 - q) * p1
    return P_IND0_DADO_0 * p0 / p_ind0


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    e = exacto()
    print("q =", e["a"], "=", float(e["a"]))
    print("posterior con esa q =", e["posterior"])
