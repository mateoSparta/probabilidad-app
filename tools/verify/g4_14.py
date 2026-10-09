# -*- coding: utf-8 -*-
"""
Ejercicio 4.14 — competencia de exponenciales.

X1 ~ Exp(l1) y X2 ~ Exp(l2) independientes. U = min, V = max, W = V - U, y
J dice cual gano (1 o 2).

Los tres resultados que vale la pena saberse:

  U ~ Exp(l1 + l2)                      el minimo compite con la suma de tasas
  P(J = 1) = l1 / (l1 + l2)             gana con probabilidad proporcional a su tasa
  W es una mezcla: con prob l1/(l1+l2) es Exp(l2), y si no Exp(l1)

El de W sale de la perdida de memoria: una vez que gano X1, lo que falta para
que llegue X2 vuelve a ser Exp(l2) desde cero.

Como las respuestas son funciones de l1 y l2, en el contenido van como tipo
`expresion`. El exacto las deriva con sympy y el Monte Carlo las verifica en
valores concretos de las tasas.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo_densidad

ID = "g4-14"
NUMERO = "4.14"

l1, l2, t = sp.symbols("l1 l2 t", positive=True)

# Tasas concretas para el Monte Carlo.
L1, L2 = 1.5, 0.5


def exacto() -> dict[str, sp.Expr]:
    # (a) densidad de U = min. P(U > t) = P(X1>t) P(X2>t) = e^{-(l1+l2)t}
    cola_u = sp.exp(-(l1 + l2) * t)
    f_u = sp.simplify(-sp.diff(cola_u, t))
    assert sp.simplify(f_u - (l1 + l2) * sp.exp(-(l1 + l2) * t)) == 0

    # (b) P(J = 1) = P(X1 < X2), integrando la conjunta
    x1, x2 = sp.symbols("x1 x2", positive=True)
    conjunta = l1 * sp.exp(-l1 * x1) * l2 * sp.exp(-l2 * x2)
    p_j1 = sp.simplify(sp.integrate(sp.integrate(conjunta, (x2, x1, sp.oo)), (x1, 0, sp.oo)))

    # (c) densidad de W, como mezcla de las dos exponenciales
    f_w = sp.simplify(
        p_j1 * l2 * sp.exp(-l2 * t) + (1 - p_j1) * l1 * sp.exp(-l1 * t)
    )
    # Control: tiene que integrar 1.
    assert sp.simplify(sp.integrate(f_w, (t, 0, sp.oo))) == 1, "f_W no integra 1"

    return {
        "a": f_u,
        "b": p_j1,
        "c": f_w,
        # Valores en las tasas del Monte Carlo, para poder contrastar.
        "a_en_t1": sp.simplify(f_u.subs({l1: sp.Rational(3, 2), l2: sp.Rational(1, 2), t: 1})),
        "b_num": sp.simplify(p_j1.subs({l1: sp.Rational(3, 2), l2: sp.Rational(1, 2)})),
        "c_en_t1": sp.simplify(f_w.subs({l1: sp.Rational(3, 2), l2: sp.Rational(1, 2), t: 1})),
    }


def _par(rng: random.Random) -> tuple[float, float]:
    return rng.expovariate(L1), rng.expovariate(L2)


def estimado() -> dict[str, float]:
    def u(rng):
        a, b = _par(rng)
        return min(a, b)

    def w(rng):
        a, b = _par(rng)
        return abs(a - b)

    return {
        "a_en_t1": montecarlo_densidad(u, 1.0),
        # P(J=1) se cuenta sobre el mismo par sorteado, no sobre dos pares.
        "b_num": _p_j1(),
        "c_en_t1": montecarlo_densidad(w, 1.0),
    }


def _p_j1(n: int = 400_000, semilla: int = 20260408) -> float:
    rng = random.Random(semilla)
    gana1 = 0
    for _ in range(n):
        a, b = _par(rng)
        if a < b:
            gana1 += 1
    return gana1 / n


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v}")
