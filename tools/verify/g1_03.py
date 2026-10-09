# -*- coding: utf-8 -*-
"""
Ejercicio 1.3 — Omega = {a, b, c} con p(a)=1/2, p(b)=1/3, p(c)=1/6.

Hay que calcular la probabilidad de los 8 subconjuntos. En el contenido va
como `checkpoints`: unos pocos subconjuntos concretos en vez de los 8, que
es lo que se puede validar sin pedir una lista escrita a mano.

El exacto suma los pesos. El Monte Carlo sortea un punto de Omega con esos
pesos y chequea la pertenencia, que es lo que verifica que los pesos esten
bien interpretados.
"""
from __future__ import annotations

import itertools
import random
from fractions import Fraction

from comun import TOL_MONTECARLO, montecarlo

ID = "g1-03"
NUMERO = "1.3"

PESOS = {"a": Fraction(1, 2), "b": Fraction(1, 3), "c": Fraction(1, 6)}

# Los subconjuntos que se le piden al alumno como checkpoints.
# Las claves siguen el orden de los checkpoints del item (a) en el YAML:
# a1 = P(vacio), a2 = P({a}), a3 = P({a,b}), a4 = P(Omega).
PEDIDOS = {
    "a1": frozenset(),
    "a2": frozenset("a"),
    "a3": frozenset("ab"),
    "a4": frozenset("abc"),
    # extra, no va al contenido: sirve de control de coherencia
    "bc": frozenset("bc"),
}


def p(conjunto: frozenset[str]) -> Fraction:
    return sum((PESOS[w] for w in conjunto), Fraction(0))


def exacto() -> dict[str, Fraction]:
    assert p(frozenset("abc")) == 1, "los pesos no suman 1"
    # Los 8 subconjuntos, para dejar constancia de que la medida es coherente.
    todos = [frozenset(c) for n in range(4) for c in itertools.combinations("abc", n)]
    assert len(todos) == 8
    return {k: p(v) for k, v in PEDIDOS.items()}


def _sortear(rng: random.Random) -> str:
    u = rng.random()
    acum = 0.0
    for w, peso in PESOS.items():
        acum += float(peso)
        if u < acum:
            return w
    return "c"


def estimado() -> dict[str, float]:
    def hacer(conjunto: frozenset[str]):
        return lambda rng: _sortear(rng) in conjunto

    return {k: montecarlo(hacer(v)) for k, v in PEDIDOS.items()}


TOLERANCIA = TOL_MONTECARLO
