# -*- coding: utf-8 -*-
"""
Ejercicio 6.6 — el primer 2 de un dado.

(a) P(el primer 2 ocurre despues del tercer lanzamiento) = P(no sale 2 en los
    tres primeros) = (5/6)^3.

(b) P(el primer 2 ocurre despues del sexto | no ocurrio en los tres primeros).

Las dos dan **lo mismo**, y ese es el punto: la geometrica tiene perdida de
memoria. Saber que ya pasaron tres lanzamientos sin exito no cambia nada sobre
los que vienen; el dado no se acuerda.

El modelo calcula (b) por definicion de condicional, sin invocar la propiedad,
y despues chequea que coincida con (a). Asi la perdida de memoria queda
verificada.
"""
from __future__ import annotations

import random
from fractions import Fraction

from comun import TOL_MONTECARLO

ID = "g6-06"
NUMERO = "6.6"

P_EXITO = Fraction(1, 6)
Q = 1 - P_EXITO


def exacto() -> dict[str, Fraction]:
    # P(N > n) = q^n: n fracasos seguidos
    p_a = Q**3
    # P(N > 6 | N > 3) = P(N > 6) / P(N > 3)
    p_b = Q**6 / Q**3

    assert p_a == p_b, "la perdida de memoria no se cumplio"

    return {"a": p_a, "b": p_b}


def _primer_dos(rng: random.Random, tope: int = 400) -> int:
    for i in range(1, tope + 1):
        if rng.randint(1, 6) == 2:
            return i
    return tope + 1


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    a = sum(1 for _ in range(n) if _primer_dos(rng) > 3) / n

    rng = random.Random(777)
    casos = favorables = 0
    for _ in range(n):
        N = _primer_dos(rng)
        if N > 3:
            casos += 1
            if N > 6:
                favorables += 1
    return {"a": a, "b": favorables / casos if casos else 0.0}


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
