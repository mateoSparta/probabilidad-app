# -*- coding: utf-8 -*-
"""
Ejercicio 1.6 — el matrimonio Galindez tira 4 dados cada noche.

Si no sale ningun 1 lava el Sr. Galindez; en caso contrario, su esposo.
La pregunta es quien lava mas seguido, asi que hay que comparar las dos
probabilidades, no solo calcular una.
"""
from __future__ import annotations

from fractions import Fraction

from comun import TOL_MONTECARLO, dados, exacto_sobre, montecarlo

ID = "g1-06"
NUMERO = "1.6"

sin_ningun_uno = lambda w: all(d != 1 for d in w)


def exacto() -> dict[str, Fraction]:
    p_senor = exacto_sobre(dados(4), sin_ningun_uno)
    return {
        # (a) le toca al Sr.: no sale ningun 1
        "a": p_senor,
        # el complemento, para poder comparar en el item (b)
        "esposo": 1 - p_senor,
    }


def estimado() -> dict[str, float]:
    tirar = lambda rng: tuple(rng.randint(1, 6) for _ in range(4))
    return {
        "a": montecarlo(lambda rng: sin_ningun_uno(tirar(rng))),
        "esposo": montecarlo(lambda rng: not sin_ningun_uno(tirar(rng))),
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    e = exacto()
    print("P(lava el Sr.) =", e["a"], "=", float(e["a"]))
    print("P(lava el esposo) =", e["esposo"], "=", float(e["esposo"]))
    print("lava mas seguido:", "el esposo" if e["esposo"] > e["a"] else "el Sr.")
