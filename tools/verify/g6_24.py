# -*- coding: utf-8 -*-
"""
Ejercicio 6.24 — cuantas blancas habia en la urna.

En la urna hay k blancas y 5 negras, con 0 <= k <= 6. Se extraen 2 sin
reposicion y sale 1 blanca y 1 negra. Para cada k se pide la probabilidad de
observar ese resultado, y cual k la maximiza.

Es hipergeometrica:

    P(1 blanca, 1 negra | k) = k * 5 / C(k+5, 2) = 10k / ((k+5)(k+4))

Lo interesante del resultado: el maximo **no es unico**. k = 4 y k = 5 dan
exactamente el mismo valor, 5/9. Tiene sentido: con 4 blancas y 5 negras, o
con 5 y 5, la mezcla esta igual de equilibrada para sacar una de cada color.
Es el tipo de cosa que conviene no pasar por alto al contestar "que valor de k".
"""
from __future__ import annotations

import random
from fractions import Fraction
from math import comb

from comun import TOL_MONTECARLO

ID = "g6-24"
NUMERO = "6.24"

NEGRAS = 5
K_MAX = 6


def p_para_k(k: int) -> Fraction:
    total = k + NEGRAS
    if total < 2:
        return Fraction(0)
    return Fraction(k * NEGRAS, comb(total, 2))


def exacto() -> dict:
    valores = {k: p_para_k(k) for k in range(K_MAX + 1)}
    maximo = max(valores.values())
    argmax = sorted(k for k, v in valores.items() if v == maximo)

    # El maximo se alcanza en mas de un k: hay que decirlo.
    assert len(argmax) == 2, f"se esperaban dos maximos, hay {argmax}"

    salida: dict = {f"k{k}": v for k, v in valores.items()}
    salida["maximo"] = maximo
    return salida


def estimado() -> dict[str, float]:
    salida = {}
    rng = random.Random(20260408)
    for k in range(K_MAX + 1):
        urna = ["b"] * k + ["n"] * NEGRAS
        if len(urna) < 2:
            salida[f"k{k}"] = 0.0
            continue
        n = 400_000
        aciertos = 0
        for _ in range(n):
            dos = rng.sample(urna, 2)
            if sorted(dos) == ["b", "n"]:
                aciertos += 1
        salida[f"k{k}"] = aciertos / n
    salida["maximo"] = max(salida.values())
    return salida


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    e = exacto()
    for k, v in e.items():
        print(f"  {k}: {v} = {float(v):.6f}")
