# -*- coding: utf-8 -*-
"""
Ejercicio 1.1 — la menor algebra que contiene ciertos subconjuntos.

No es un ejercicio numerico, asi que en el contenido va como `opcion`. Pero
la respuesta igual se verifica: el algebra generada por una familia es unica,
y se la calcula cerrando por complemento y union hasta que no entra nada
nuevo. Lo que se verifica es la lista de conjuntos que la forman.

No hay Monte Carlo porque no hay nada aleatorio que simular.
"""
from __future__ import annotations

from comun import algebra_generada

ID = "g1-01"
NUMERO = "1.1"

OMEGA = frozenset({1, 2, 3, 4, 5, 6})


def como_texto(familia: set[frozenset]) -> str:
    """Notacion de conjuntos, ordenada, para poder comparar contra el YAML."""
    partes = sorted(
        ("∅" if not s else "{" + ",".join(str(x) for x in sorted(s)) + "}" for s in familia),
        key=lambda t: (len(t), t),
    )
    return "{" + ", ".join(partes) + "}"


def exacto() -> dict[str, str]:
    a = algebra_generada(OMEGA, [frozenset({1, 2, 3})])
    b = algebra_generada(OMEGA, [frozenset({1, 2}), frozenset({3, 4}), frozenset({5, 6})])
    return {
        "a": como_texto(a),
        "b": como_texto(b),
        "a_cardinal": str(len(a)),
        "b_cardinal": str(len(b)),
    }


def estimado() -> dict[str, float]:
    return {}


TOLERANCIA = 0.0
