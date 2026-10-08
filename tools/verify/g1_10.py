# -*- coding: utf-8 -*-
"""
Ejercicio 1.10 — se sortea un numero al azar en [0, 1].

Los digitos de un uniforme en [0,1] son independientes y uniformes en
{0,...,9}, y eso es lo que permite tratar el problema como conteo.

El Monte Carlo no sortea un float y le mira los digitos: un float64 solo
tiene como 17 digitos significativos, asi que a partir de ahi los digitos
son basura. Sortea los digitos de uno en uno, que es el mismo experimento
y no tiene ese techo.
"""
from __future__ import annotations

import random
from fractions import Fraction

from comun import TOL_MONTECARLO, montecarlo

ID = "g1-10"
NUMERO = "1.10"

# Para el inciso (c) hay que mirar "ningun digito es 0", que es un limite.
# Se aproxima con una cantidad de digitos tan grande que (9/10)^n sea
# indistinguible de 0 para el Monte Carlo.
DIGITOS_PARA_EL_LIMITE = 500


def exacto() -> dict[str, Fraction]:
    return {
        # (a) los primeros tres digitos son 3, 1, 4: el numero cae en
        #     [0.314, 0.315), un intervalo de longitud 1/1000.
        "a": Fraction(1, 1000),
        # (b) ninguno de los primeros 4 digitos es 0: cada digito tiene 9
        #     valores posibles de 10.
        "b": Fraction(9, 10) ** 4,
        # (c) ningun digito es 0: lim (9/10)^n = 0.
        "c": Fraction(0),
    }


def _digito(rng: random.Random) -> int:
    return rng.randint(0, 9)


def estimado() -> dict[str, float]:
    return {
        "a": montecarlo(lambda rng: [_digito(rng) for _ in range(3)] == [3, 1, 4]),
        "b": montecarlo(lambda rng: all(_digito(rng) != 0 for _ in range(4))),
        "c": montecarlo(
            lambda rng: all(_digito(rng) != 0 for _ in range(DIGITOS_PARA_EL_LIMITE))
        ),
    }


TOLERANCIA = TOL_MONTECARLO
