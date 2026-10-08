# -*- coding: utf-8 -*-
"""
Ejercicio 6.19 — el motoquero y los semaforos.

Cada semaforo esta en rojo con probabilidad 0.45, amarillo 0.05 o verde 0.5,
independientes. El motoquero solo se detiene en rojo. N = cantidad de luces
verdes que atraveso hasta detenerse.

La clave: **el amarillo no cuenta para nada**. No lo detiene y no es verde, asi
que para N es como si ese semaforo no hubiera existido. Entonces hay que
mirar solo los semaforos que son rojo o verde, y entre esos

    P(verde | rojo o verde) = 0.5 / 0.95 = 10/19

con lo cual N es geometrica: P(N = n) = (10/19)^n (9/19).

El error tipico es usar 0.5 como probabilidad de "seguir", que ignora que el
amarillo tambien deja seguir pero sin sumar a N.

El Monte Carlo simula los tres colores, asi que verifica que el adelgazamiento
este bien hecho.
"""
from __future__ import annotations

import random
from fractions import Fraction

from comun import TOL_MONTECARLO, montecarlo

ID = "g6-19"
NUMERO = "6.19"

P_ROJO = Fraction(45, 100)
P_AMARILLO = Fraction(5, 100)
P_VERDE = Fraction(50, 100)

# Mirando solo rojo o verde:
P_SIGUE = P_VERDE / (P_VERDE + P_ROJO)      # 10/19
P_PARA = P_ROJO / (P_VERDE + P_ROJO)        # 9/19


def p_n(n: int) -> Fraction:
    return P_SIGUE**n * P_PARA


def exacto() -> dict[str, Fraction]:
    assert P_ROJO + P_AMARILLO + P_VERDE == 1, "los colores no suman 1"
    # Control: la funcion de probabilidad suma 1 (serie geometrica).
    assert P_PARA / (1 - P_SIGUE) == 1

    return {
        # claves a1..a3: checkpoints de la funcion de probabilidad
        "a1": p_n(0),
        "a2": p_n(1),
        "a3": p_n(3),
        # (b) P(N > 2) = P(los tres primeros rojo-o-verde fueron verdes)
        "b": P_SIGUE**3,
        # El error tipico: usar 0.5 como probabilidad de seguir.
        "b_error_tipico": P_VERDE**3,
    }


def _verdes_hasta_el_rojo(rng: random.Random) -> int:
    verdes = 0
    while True:
        u = rng.random()
        if u < float(P_ROJO):
            return verdes
        if u < float(P_ROJO + P_AMARILLO):
            continue          # amarillo: sigue pero no suma
        verdes += 1           # verde


def estimado() -> dict[str, float]:
    return {
        "a1": montecarlo(lambda r: _verdes_hasta_el_rojo(r) == 0),
        "a2": montecarlo(lambda r: _verdes_hasta_el_rojo(r) == 1),
        "a3": montecarlo(lambda r: _verdes_hasta_el_rojo(r) == 3),
        "b": montecarlo(lambda r: _verdes_hasta_el_rojo(r) > 2),
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
