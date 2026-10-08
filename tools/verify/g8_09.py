# -*- coding: utf-8 -*-
"""
Ejercicio 8.9 — el experimento de Galton.

La bola se mueve cada 10 segundos a izquierda o derecha con igual
probabilidad. En dos minutos hace 12 pasos, asi que la cantidad L de pasos a
la izquierda es Binomial(12, 1/2), con media 6 y varianza 3.

Se pide **estimar** P(L = 4) con la aproximacion normal, y decir a que urna es
mas probable que vaya.

El detalle que hace a la aproximacion: L es discreta y la normal es continua,
asi que para aproximar una probabilidad puntual hay que usar la **correccion
por continuidad** e integrar la densidad normal entre 3.5 y 4.5. Hacerlo sin
correccion —evaluando la densidad en 4— da casi lo mismo aca, y el modelo
calcula las tres cosas (las dos aproximaciones y el valor exacto) para que la
comparacion quede a la vista.

La urna mas probable es la 6, que es la media: la binomial con p = 1/2 es
simetrica y su moda esta en n/2.
"""
from __future__ import annotations

import random
from math import comb

import sympy as sp

from comun import Phi, phi, TOL_MONTECARLO, montecarlo

ID = "g8-09"
NUMERO = "8.9"

PASOS = 12          # dos minutos a un paso cada 10 segundos
URNA = 4


def exacto() -> dict[str, sp.Expr]:
    media = sp.Rational(PASOS, 2)
    varianza = sp.Rational(PASOS, 4)
    sigma = sp.sqrt(varianza)

    # Aproximacion normal con correccion por continuidad
    z_alto = (sp.Rational(URNA) + sp.Rational(1, 2) - media) / sigma
    z_bajo = (sp.Rational(URNA) - sp.Rational(1, 2) - media) / sigma
    aprox = sp.simplify(Phi(z_alto) - Phi(z_bajo))

    # Sin correccion: la densidad evaluada en el punto
    aprox_sin = sp.simplify(phi((sp.Rational(URNA) - media) / sigma) / sigma)

    # Valor exacto de la binomial
    exacta = sp.Rational(comb(PASOS, URNA), 2**PASOS)

    return {
        "a": aprox,
        "aprox_sin_correccion": aprox_sin,
        "binomial_exacta": exacta,
        "urna_mas_probable": sp.Integer(PASOS // 2),
    }


def estimado() -> dict[str, float]:
    def izquierdas(rng: random.Random) -> int:
        return sum(1 for _ in range(PASOS) if rng.random() < 0.5)

    return {
        # El Monte Carlo estima la probabilidad **exacta**, no la aproximacion:
        # se compara contra `binomial_exacta`.
        "binomial_exacta": montecarlo(lambda rng: izquierdas(rng) == URNA),
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
