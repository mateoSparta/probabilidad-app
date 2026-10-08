# -*- coding: utf-8 -*-
"""
Ejercicio 2.19 — arandelas: truncamiento de una densidad.

El diametro tiene densidad f(x) = 2x/225 en (0, 15). El control descarta las
arandelas con diametro menor que 3 o mayor que 12.

Condicionar a un evento es quedarse con la densidad en ese pedazo y
renormalizar por la probabilidad del evento. Lo que hay que notar es que la
densidad de las descartadas vive en dos pedazos separados, (0,3) y (12,15),
y vale 0 en el medio: es el error tipico del ejercicio.

Como las respuestas son densidades y no numeros, en el contenido van como
checkpoints: la densidad evaluada en puntos concretos, mas una probabilidad.
"""
from __future__ import annotations

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo, montecarlo_densidad, p_densidad

ID = "g2-19"
NUMERO = "2.19"

x = sp.Symbol("x", positive=True)
DENSIDAD = 2 * x / 225
DESDE, HASTA = 0, 15
CORTE_BAJO, CORTE_ALTO = 3, 12


def p_aceptada() -> sp.Expr:
    return p_densidad(DENSIDAD, x, CORTE_BAJO, CORTE_ALTO)


def exacto() -> dict[str, sp.Expr]:
    assert sp.simplify(p_densidad(DENSIDAD, x, DESDE, HASTA)) == 1, "la densidad no integra 1"

    p_ok = p_aceptada()
    p_mal = 1 - p_ok

    # (a) densidad de las NO descartadas: f(x)/P(aceptada) en (3, 12).
    f_ok = sp.simplify(DENSIDAD / p_ok)
    # (b) densidad de las descartadas: f(x)/P(descartada) en (0,3) y (12,15),
    #     y cero entre 3 y 12.
    f_mal = sp.simplify(DENSIDAD / p_mal)

    return {
        # claves a1..a3 y b1..b3: el orden de los checkpoints en el YAML
        "a1": sp.simplify(f_ok.subs(x, 5)),
        "a2": sp.simplify(f_ok.subs(x, 10)),
        # P(X < 6 | no descartada)
        "a3": sp.simplify(p_densidad(f_ok, x, CORTE_BAJO, 6)),
        "b1": sp.simplify(f_mal.subs(x, 2)),
        "b2": sp.simplify(f_mal.subs(x, 13)),
        # la densidad de las descartadas vale 0 en el medio
        "b3": sp.Integer(0),
        # controles
        "p_aceptada": p_ok,
        "p_descartada": p_mal,
    }


def _sortear(rng) -> float:
    """
    Inversa de la F: con f = 2x/225 en (0,15), F(x) = x^2/225, asi que
    x = 15*sqrt(u). Se sortea asi y no por rechazo para que sea exacto.
    """
    return 15 * rng.random() ** 0.5


def _sortear_aceptada(rng) -> float:
    """Por rechazo: se sortea el diametro hasta que caiga en (3, 12)."""
    while True:
        d = _sortear(rng)
        if CORTE_BAJO <= d <= CORTE_ALTO:
            return d


def _sortear_descartada(rng) -> float:
    while True:
        d = _sortear(rng)
        if not (CORTE_BAJO <= d <= CORTE_ALTO):
            return d


def estimado() -> dict[str, float]:
    return {
        # Las densidades se estiman por ventana; ver montecarlo_densidad.
        "a1": montecarlo_densidad(_sortear_aceptada, 5),
        "a2": montecarlo_densidad(_sortear_aceptada, 10),
        "b1": montecarlo_densidad(_sortear_descartada, 2),
        "b2": montecarlo_densidad(_sortear_descartada, 13),
        "a3": _condicional(),
        "p_aceptada": montecarlo(lambda rng: CORTE_BAJO <= _sortear(rng) <= CORTE_ALTO),
        "p_descartada": montecarlo(
            lambda rng: not (CORTE_BAJO <= _sortear(rng) <= CORTE_ALTO)
        ),
    }


def _condicional(n: int = 400_000, semilla: int = 20260408) -> float:
    """P(X < 6 | no descartada), como cociente de frecuencias."""
    import random

    rng = random.Random(semilla)
    casos = favorables = 0
    for _ in range(n):
        d = _sortear(rng)
        if CORTE_BAJO <= d <= CORTE_ALTO:
            casos += 1
            if d < 6:
                favorables += 1
    return favorables / casos if casos else 0.0


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for clave, v in exacto().items():
        print(f"  {clave}: {v} = {float(v):.6f}")
