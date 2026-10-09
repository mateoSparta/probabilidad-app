# -*- coding: utf-8 -*-
"""
Ejercicio 5.12 — 36 tiradas de un dado, pares contra impares.

X = cantidad de pares, Y = cantidad de impares. La trampa esta en que
X + Y = 36 **siempre**: Y no es una variable nueva, es 36 - X. Por eso:

  E[Y | X] = 36 - X      (no hay nada que promediar: Y esta determinada por X)
  cov(X, Y) = cov(X, 36 - X) = -var[X]

y como X ~ Binomial(36, 1/2), var[X] = 36 * 1/4 = 9, asi que la covarianza es
-9. Negativa y lo mas grande posible en modulo: la correlacion es -1, porque
una determina a la otra.

El modelo calcula la covarianza por definicion sobre la binomial, sin usar la
identidad, y despues chequea que coincida con -var[X].
"""
from __future__ import annotations

import random
from fractions import Fraction
from math import comb

from comun import TOL_MONTECARLO

ID = "g5-12"
NUMERO = "5.12"

TIRADAS = 36
P_PAR = Fraction(1, 2)


def exacto() -> dict[str, Fraction]:
    # Distribucion de X: binomial(36, 1/2)
    p = {k: Fraction(comb(TIRADAS, k)) * P_PAR**k * (1 - P_PAR) ** (TIRADAS - k)
         for k in range(TIRADAS + 1)}
    assert sum(p.values()) == 1, "la binomial no suma 1"

    e_x = sum(k * pk for k, pk in p.items())
    e_x2 = sum(k**2 * pk for k, pk in p.items())
    var_x = e_x2 - e_x**2

    # Covarianza por definicion, con Y = 36 - X.
    e_y = sum((TIRADAS - k) * pk for k, pk in p.items())
    e_xy = sum(k * (TIRADAS - k) * pk for k, pk in p.items())
    cov = e_xy - e_x * e_y

    assert cov == -var_x, f"cov da {cov} y -var[X] da {-var_x}"

    return {
        "b": cov,
        "var_x": var_x,
        "e_x": e_x,
    }


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 200_000
    xs, ys = [], []
    for _ in range(n):
        pares = sum(1 for _ in range(TIRADAS) if rng.randint(1, 6) % 2 == 0)
        xs.append(pares)
        ys.append(TIRADAS - pares)
    mx = sum(xs) / n
    my = sum(ys) / n
    cov = sum((a - mx) * (b - my) for a, b in zip(xs, ys)) / n
    return {
        "b": cov,
        "var_x": sum((a - mx) ** 2 for a in xs) / n,
        "e_x": mx,
    }


# La covarianza vale -9 y la varianza 9: con 200.000 muestras el error
# estandar es como 0.03, asi que 0.2 son varios sigma.
TOLERANCIA = 0.2

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
