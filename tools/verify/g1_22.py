# -*- coding: utf-8 -*-
"""
Ejercicio 1.22 — tres urnas en cadena: probabilidad total y Bayes.

Urna a: 2 rojas, 1 blanca.  Urna b: 3 rojas, 2 blancas.  Urna c: 5 rojas,
3 blancas. Se extrae de a; si sale roja se extrae de b, si sale blanca de c.

El exacto recorre el arbol completo: las cuatro hojas (color 1, color 2) con
su probabilidad. De ahi salen todos los incisos, incluido el condicional
invertido del (c), sin tener que escribir la formula de Bayes a mano.

El inciso (e) cambia las cantidades de bolas por otras con las mismas
proporciones, asi que da lo mismo. Se verifica calculando las dos veces y
comparando, que es justamente lo que el ejercicio pide explicar.
"""
from __future__ import annotations

import random
from fractions import Fraction

from comun import TOL_MONTECARLO, montecarlo

ID = "g1-22"
NUMERO = "1.22"

# (rojas, blancas) de cada urna
URNAS = {"a": (2, 1), "b": (3, 2), "c": (5, 3)}
URNAS_E = {"a": (200, 100), "b": (150, 100), "c": (125, 75)}


def p_roja(urna: tuple[int, int]) -> Fraction:
    r, b = urna
    return Fraction(r, r + b)


def arbol(urnas: dict[str, tuple[int, int]]) -> dict[tuple[str, str], Fraction]:
    """Las cuatro hojas: (color de la 1a, color de la 2a) -> probabilidad."""
    pa = p_roja(urnas["a"])
    pb = p_roja(urnas["b"])
    pc = p_roja(urnas["c"])
    return {
        ("R", "R"): pa * pb,
        ("R", "B"): pa * (1 - pb),
        ("B", "R"): (1 - pa) * pc,
        ("B", "B"): (1 - pa) * (1 - pc),
    }


def incisos(urnas: dict[str, tuple[int, int]]) -> dict[str, Fraction]:
    h = arbol(urnas)
    assert sum(h.values()) == 1, "el arbol no suma 1"

    p_b1 = h[("B", "R")] + h[("B", "B")]
    p_b2 = h[("R", "B")] + h[("B", "B")]
    p_r2 = h[("R", "R")] + h[("B", "R")]
    return {
        "a": p_b1,
        "b": p_b2,
        # (c) P(B1 | R2)
        "c": h[("B", "R")] / p_r2,
        # (d) P(alguna roja) = 1 - P(las dos blancas)
        "d": 1 - h[("B", "B")],
    }


def exacto() -> dict[str, Fraction]:
    base = incisos(URNAS)
    nuevo = incisos(URNAS_E)
    # El (e) no agrega numeros: lo que hay que verificar es que coincidan.
    assert base == nuevo, "con las nuevas cantidades los resultados cambian"
    return base


def _extraer(rng: random.Random, urnas: dict[str, tuple[int, int]]) -> tuple[str, str]:
    def saca(u: tuple[int, int]) -> str:
        r, b = u
        return "R" if rng.randrange(r + b) < r else "B"

    c1 = saca(urnas["a"])
    c2 = saca(urnas["b"]) if c1 == "R" else saca(urnas["c"])
    return c1, c2


def estimado() -> dict[str, float]:
    return {
        "a": montecarlo(lambda rng: _extraer(rng, URNAS)[0] == "B"),
        "b": montecarlo(lambda rng: _extraer(rng, URNAS)[1] == "B"),
        # Para el condicional se simula el cociente: de las veces que la
        # segunda salio roja, en cuantas la primera fue blanca.
        "c": _condicional(),
        "d": montecarlo(lambda rng: "R" in _extraer(rng, URNAS)),
    }


def _condicional(n: int = 400_000, semilla: int = 20260408) -> float:
    rng = random.Random(semilla)
    casos = favorables = 0
    for _ in range(n):
        c1, c2 = _extraer(rng, URNAS)
        if c2 == "R":
            casos += 1
            if c1 == "B":
                favorables += 1
    return favorables / casos if casos else 0.0


TOLERANCIA = TOL_MONTECARLO
