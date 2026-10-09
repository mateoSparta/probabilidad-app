# -*- coding: utf-8 -*-
"""
Ejercicio 7.10 — rollos de alambre cortados en la primera falla detectada.

Las fallas son Poisson de intensidad 1 cada 20 metros, o sea 1/20 por metro.
Cada falla se detecta con probabilidad 0.75, independientemente, y la maquina
corta en la primera detectada.

(a) El **adelgazamiento** dice que las fallas detectadas forman otro proceso de
    Poisson, de intensidad 0.75/20 = 3/80 por metro. El largo del rollo es el
    tiempo de espera hasta el primer evento de ese proceso, o sea exponencial
    de media 80/3 metros. La varianza de una exponencial es el cuadrado de la
    media.

(b) La cantidad total de fallas (detectadas y no) en un rollo es: la detectada
    que corto, mas las que pasaron sin detectarse antes. Esas ultimas son los
    fracasos antes del primer exito con p = 0.75, o sea geometrica de media
    (1-p)/p = 1/3. Total: 1 + 1/3 = 4/3.

El Monte Carlo genera las fallas una por una y decide la deteccion, asi que
verifica el adelgazamiento en vez de aplicarlo.
"""
from __future__ import annotations

import random

import sympy as sp

ID = "g7-10"
NUMERO = "7.10"

METROS_POR_FALLA = 20
P_DETECCION = sp.Rational(75, 100)

LAMBDA = sp.Rational(1, METROS_POR_FALLA)            # fallas por metro
LAMBDA_DETECTADAS = sp.simplify(LAMBDA * P_DETECCION)  # 3/80


def exacto() -> dict[str, sp.Expr]:
    media = sp.simplify(1 / LAMBDA_DETECTADAS)
    return {
        # (a) media y varianza del largo del rollo
        "a1": media,
        "a2": sp.simplify(media**2),
        # (b) media de la cantidad total de fallas en el rollo
        "b": sp.simplify(1 + (1 - P_DETECCION) / P_DETECCION),
    }


def _rollo(rng: random.Random) -> tuple[float, int]:
    """Devuelve (largo del rollo, cantidad total de fallas)."""
    largo = 0.0
    fallas = 0
    while True:
        largo += rng.expovariate(float(LAMBDA))
        fallas += 1
        if rng.random() < float(P_DETECCION):
            return largo, fallas


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    largos, fallas = [], []
    for _ in range(n):
        l, f = _rollo(rng)
        largos.append(l)
        fallas.append(f)
    m = sum(largos) / n
    return {
        "a1": m,
        "a2": sum((x - m) ** 2 for x in largos) / n,
        "b": sum(fallas) / n,
    }


# La media del largo es 80/3 ~ 26.7 y la varianza ~711: la varianza de una
# exponencial tiene mucha dispersion, asi que la tolerancia va holgada.
TOLERANCIA = 12.0

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
