# -*- coding: utf-8 -*-
"""
Ejercicio 8.5 — combinacion lineal de normales independientes.

X1, X2, X3 normales independientes de medias 1, 2, 3 y varianzas 1/9, 1/3,
1/2. Se pide P(X1 - X2/2 > 2 - X3/3).

Lo primero es pasar todo a un lado: el evento es Y > 0 con
Y = X1 - X2/2 + X3/3 - 2. Y es una combinacion lineal de normales
independientes, asi que **vuelve a ser normal**, con

    E[Y]   = 1 - 2/2 + 3/3 - 2 = -1
    var[Y] = 1/9 + (1/2)^2 (1/3) + (1/3)^2 (1/2) = 1/9 + 1/12 + 1/18 = 1/4

Ojo con los coeficientes: en la varianza van **al cuadrado**, y el signo menos
de X2 desaparece. Olvidar el cuadrado es el error tipico.

Con media -1 y desvio 1/2, pedir Y > 0 es pedir Z > 2.

El enunciado del PDF tiene los parentesis grandes sin traducir por el
extractor; la expresion se reconstruyo a mano y queda anotado en
revision/guia-8.md.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import Phi, TOL_MONTECARLO, montecarlo

ID = "g8-05"
NUMERO = "8.5"

# (media, varianza, coeficiente en la combinacion)
TERMINOS = [
    (1, sp.Rational(1, 9), sp.Integer(1)),
    (2, sp.Rational(1, 3), sp.Rational(-1, 2)),
    (3, sp.Rational(1, 2), sp.Rational(1, 3)),
]
CONSTANTE = -2


def exacto() -> dict[str, sp.Expr]:
    media = CONSTANTE + sum(coef * mu for mu, _, coef in TERMINOS)
    # Los coeficientes entran al cuadrado, asi que el signo no importa.
    varianza = sum(coef**2 * var for _, var, coef in TERMINOS)

    assert media == -1, f"la media da {media}"
    assert varianza == sp.Rational(1, 4), f"la varianza da {varianza}"

    z = -media / sp.sqrt(varianza)      # P(Y > 0) = P(Z > -media/sigma)
    return {
        "a": sp.simplify(1 - Phi(z)),
        "media": media,
        "varianza": varianza,
        # El error tipico: no elevar los coeficientes al cuadrado.
        "varianza_error_tipico": sum(abs(coef) * var for _, var, coef in TERMINOS),
    }


def estimado() -> dict[str, float]:
    def y(rng: random.Random) -> float:
        total = float(CONSTANTE)
        for mu, var, coef in TERMINOS:
            total += float(coef) * rng.gauss(float(mu), float(var) ** 0.5)
        return total

    return {"a": montecarlo(lambda rng: y(rng) > 0)}


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
