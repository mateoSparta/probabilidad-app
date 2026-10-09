# -*- coding: utf-8 -*-
"""
Ejercicio 5.9 — Bayes para una mezcla continua.

X = S + N, con S equiprobable en {0.1, 0.2, 0.3} y N normal estandar
independiente. Se recibio X = 0.87 y se pregunta por S.

Es Bayes, pero el dato que condiciona es **continuo**, asi que en vez de
probabilidades aparecen densidades: P(S=s | X=x) es proporcional a
f_{X|S=s}(x) P(S=s), y f_{X|S=s}(x) = phi(x - s). Como los tres valores de S
son equiprobables, el prior se cancela y queda el cociente de las tres
densidades normales.

Lo que mas tira el resultado no es la cuenta sino que las tres amplitudes
estan muy juntas (0.1, 0.2, 0.3) frente a un ruido de desvio 1: la senal casi
no informa, y el posterior queda casi uniforme.
"""
from __future__ import annotations

import math
import random

import sympy as sp

from comun import TOL_MONTECARLO

ID = "g5-09"
NUMERO = "5.9"

ALFABETO = [sp.Rational(1, 10), sp.Rational(2, 10), sp.Rational(3, 10)]
OBSERVADO = sp.Rational(87, 100)
BUSCADA = sp.Rational(2, 10)


def phi(z):
    """Densidad normal estandar."""
    return sp.exp(-z**2 / 2) / sp.sqrt(2 * sp.pi)


def exacto() -> dict[str, sp.Expr]:
    pesos = [phi(OBSERVADO - s) for s in ALFABETO]
    total = sum(pesos)
    posterior = [sp.simplify(p / total) for p in pesos]

    # Control: el posterior tiene que sumar 1.
    assert sp.simplify(sum(posterior) - 1) == 0, "el posterior no suma 1"

    indice = ALFABETO.index(BUSCADA)
    return {
        "a": posterior[indice],
        # Los otros dos, para ver que el posterior queda casi uniforme.
        "post_01": posterior[0],
        "post_03": posterior[2],
    }


def estimado() -> dict[str, float]:
    """
    Condicionar a X = 0.87 exacto es imposible al simular, asi que se
    condiciona a una ventana angosta alrededor. Es el mismo truco que
    montecarlo_densidad y por el mismo motivo.
    """
    rng = random.Random(20260408)
    objetivo = float(OBSERVADO)
    h = 0.02
    alfabeto = [float(s) for s in ALFABETO]
    casos = 0
    cuenta = [0, 0, 0]
    intentos = 0
    while casos < 60_000 and intentos < 60_000_000:
        intentos += 1
        i = rng.randrange(3)
        x = alfabeto[i] + rng.gauss(0, 1)
        if abs(x - objetivo) < h:
            casos += 1
            cuenta[i] += 1
    return {
        "a": cuenta[1] / casos,
        "post_01": cuenta[0] / casos,
        "post_03": cuenta[2] / casos,
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
