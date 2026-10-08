# -*- coding: utf-8 -*-
"""
Ejercicio 8.22 — cuantas paladas para llenar el volquete.

Cada palada es de Monk con probabilidad 0.7 y de Lucas con 0.3. El volumen de
la de Lucas es U(2,4) y el de la de Monk U(1,3). Se pide la cantidad de
paladas para que P(volumen total > 4 m^3 = 4000 dm^3) supere 0.95.

El volumen de una palada es una **mezcla** de dos uniformes. Su media y su
varianza salen de la esperanza y la varianza totales, condicionando a quien
palea:

    E[V]   = 0.3 * 3 + 0.7 * 2 = 2.3
    E[V^2] = 0.3 * (9 + 1/3) + 0.7 * (4 + 1/3) = 35/6
    var[V] = 35/6 - 2.3^2

Ojo con la varianza: **no** es el promedio de las dos varianzas. Las dos
uniformes tienen varianza 1/3, pero la mezcla tiene mas, porque las medias son
distintas y eso agrega dispersion. Es el termino var[E[V|quien]] de la varianza
total.

Despues es TCL: la suma de n paladas es aproximadamente normal de media 2.3n y
varianza n var[V], y se busca el menor n que cumpla la condicion.

Como la respuesta es un n, el segundo camino no es simular sino la
**minimalidad**: que con n se cumpla y con n-1 no.
"""
from __future__ import annotations

import math
import random

import sympy as sp

from comun import Phi, cuantil_normal

ID = "g8-22"
NUMERO = "8.22"

# (probabilidad, extremo inferior, extremo superior)
PALEADORES = [
    (sp.Rational(3, 10), 2, 4),   # Lucas
    (sp.Rational(7, 10), 1, 3),   # Monk
]
OBJETIVO_DM3 = 4000              # 4 m^3
CONFIANZA = sp.Rational(95, 100)


def momentos():
    """(E[V], var[V]) de la mezcla."""
    e_v = sum(p * sp.Rational(a + b, 2) for p, a, b in PALEADORES)
    # E[V^2] de una U(a,b) es var + media^2 = (b-a)^2/12 + ((a+b)/2)^2
    e_v2 = sum(
        p * (sp.Rational((b - a) ** 2, 12) + sp.Rational(a + b, 2) ** 2)
        for p, a, b in PALEADORES
    )
    return sp.simplify(e_v), sp.simplify(e_v2 - e_v**2)


def p_supera(n: int) -> sp.Expr:
    """P(suma de n paladas > 4000), por el TCL."""
    e_v, var_v = momentos()
    media = e_v * n
    desvio = sp.sqrt(var_v * n)
    return 1 - Phi((sp.Integer(OBJETIVO_DM3) - media) / desvio)


def exacto() -> dict:
    e_v, var_v = momentos()

    # Control: la varianza de la mezcla tiene que ser mayor que el promedio de
    # las varianzas de las dos uniformes (que es 1/3 en las dos).
    promedio_varianzas = sum(p * sp.Rational((b - a) ** 2, 12) for p, a, b in PALEADORES)
    assert var_v > promedio_varianzas, "la mezcla no agrego dispersion"

    # El menor n que cumple, buscado directamente sobre la condicion.
    n = int(OBJETIVO_DM3 / float(e_v))
    while p_supera(n) <= CONFIANZA:
        n += 1

    # Minimalidad: con n se cumple y con n-1 no.
    assert p_supera(n) > CONFIANZA
    assert p_supera(n - 1) <= CONFIANZA

    # Por el otro camino: despejando con el cuantil de la normal. Sustituyendo
    # u = sqrt(n), la condicion queda cuadratica en u:
    #     e_v u^2 - z sqrt(var_v) u - OBJETIVO = 0
    z = cuantil_normal(CONFIANZA)
    A = float(e_v)
    B = -float(z) * math.sqrt(float(var_v))
    C = -float(OBJETIVO_DM3)
    u = (-B + math.sqrt(B * B - 4 * A * C)) / (2 * A)
    n_despejado = math.ceil(u * u)
    assert n_despejado == n, f"el despeje da {n_despejado} y la busqueda {n}"

    return {
        "a": sp.Integer(n),
        "media_palada": e_v,
        "varianza_palada": var_v,
        "promedio_de_las_varianzas": promedio_varianzas,
    }


def estimado() -> dict[str, float]:
    """
    Verifica que con ese n la probabilidad simulada supere 0.95 y que con n-1
    no. No estima el n: estima la condicion que lo define.
    """
    n = int(exacto()["a"])

    def tasa(cuantas: int) -> float:
        rng = random.Random(20260408)
        reps = 40_000
        exitos = 0
        for _ in range(reps):
            total = 0.0
            for _ in range(cuantas):
                if rng.random() < 0.3:
                    total += rng.uniform(2, 4)
                else:
                    total += rng.uniform(1, 3)
            if total > OBJETIVO_DM3:
                exitos += 1
        return exitos / reps

    return {"tasa_con_n": tasa(n), "tasa_con_n_menos_1": tasa(n - 1)}


TOLERANCIA = 0.0

if __name__ == "__main__":
    e = exacto()
    print(f"  n minimo             = {e['a']}")
    print(f"  E[V]                 = {e['media_palada']} = {float(e['media_palada']):.4f}")
    print(f"  var[V]               = {e['varianza_palada']} = {float(e['varianza_palada']):.4f}")
    print(f"  promedio de varianzas= {e['promedio_de_las_varianzas']} (menor, como debe ser)")
    est = estimado()
    print(f"  simulado con n       = {est['tasa_con_n']:.4f}  (tiene que ser > 0.95)")
    print(f"  simulado con n-1     = {est['tasa_con_n_menos_1']:.4f}  (tiene que ser <= 0.95)")
