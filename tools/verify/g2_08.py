# -*- coding: utf-8 -*-
"""
Ejercicio 2.8 — tiempo hasta la k-esima particula alfa.

T_k tiene densidad f(t) = (1/2)^k / (k-1)! * t^(k-1) * e^(-t/2) para t > 0,
que es una Gamma de forma k e intensidad 1/2.

Lo que el ejercicio pone a prueba es la perdida de memoria: T_1 es
exponencial y la tiene, asi que P(T_1 > 5 | T_1 > 2) = P(T_1 > 3). T_3 no es
exponencial y no la tiene, asi que ahi el condicional da otra cosa. Las
cuentas de (a) y (b) son las mismas; lo que cambia es el resultado.

El exacto integra la densidad con sympy. El Monte Carlo simula T_k como suma
de k exponenciales, que es lo que verifica que la densidad del enunciado
describa ese experimento y no otro.
"""
from __future__ import annotations

import sympy as sp

from comun import TOL_MONTECARLO, gamma_suma, montecarlo, p_densidad

ID = "g2-08"
NUMERO = "2.8"

INTENSIDAD = sp.Rational(1, 2)
t = sp.Symbol("t", positive=True)


def densidad(k: int):
    return INTENSIDAD**k / sp.factorial(k - 1) * t ** (k - 1) * sp.exp(-INTENSIDAD * t)


def cola(k: int, desde) -> sp.Expr:
    """P(T_k > desde)."""
    return sp.simplify(p_densidad(densidad(k), t, desde, sp.oo))


def exacto() -> dict[str, sp.Expr]:
    salida = {}
    for k, inciso in ((1, "a"), (3, "b")):
        # La densidad tiene que integrar 1: control de que este bien escrita.
        assert sp.simplify(p_densidad(densidad(k), t, 0, sp.oo)) == 1, f"T_{k} no integra 1"
        salida[inciso + "1"] = cola(k, 3)
        salida[inciso + "2"] = sp.simplify(cola(k, 5) / cola(k, 2))
    return salida


def estimado() -> dict[str, float]:
    salida = {}
    for k, inciso in ((1, "a"), (3, "b")):
        salida[inciso + "1"] = montecarlo(lambda rng, k=k: gamma_suma(rng, k, 0.5) > 3)
        # El condicional se estima como cociente de frecuencias.
        salida[inciso + "2"] = _condicional(k)
    return salida


def _condicional(k: int, n: int = 400_000, semilla: int = 20260408) -> float:
    import random

    rng = random.Random(semilla)
    casos = favorables = 0
    for _ in range(n):
        T = gamma_suma(rng, k, 0.5)
        if T > 2:
            casos += 1
            if T > 5:
                favorables += 1
    return favorables / casos if casos else 0.0


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for clave, v in exacto().items():
        print(f"  {clave}: {v} = {float(v):.6f}")
