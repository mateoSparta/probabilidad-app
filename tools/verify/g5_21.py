# -*- coding: utf-8 -*-
"""
Ejercicio 5.21 — rollos de tela hasta conseguir uno de 28 metros.

Cada rollo mide U(20, 30). El cliente quiere uno de al menos 28, asi que se
producen rollos hasta que salga uno que sirva.

La cantidad N de rollos es geometrica de parametro p = P(L >= 28) = 1/5, con
E[N] = 5.

Para la longitud total hay dos caminos, y los dos dan 125:

  1. Separando el ultimo rollo, que no es un rollo cualquiera sino uno
     condicionado a medir al menos 28:

         E[total] = E[N-1] * E[L | L < 28] + E[L | L >= 28]
                  =   4     *      24      +      29       = 125

  2. Por la **identidad de Wald**: E[total] = E[N] * E[L] = 5 * 25 = 125.

Que coincidan no es casualidad: Wald vale justamente porque N es un tiempo de
parada sobre una sucesion de rollos independientes e identicos. Lo escribi
mal la primera vez pensando que era una coincidencia del ejercicio, y el
control con otro corte me saco del error: con el corte en 26 los dos metodos
tambien coinciden, y lo hacen para cualquier corte.

Vale la pena tenerlo claro porque el razonamiento intuitivo ("el ultimo rollo
es mas largo que el promedio, asi que el total tiene que ser mayor que
E[N]*E[L]") es tentador y **falso**: el ultimo es mas largo, pero los N-1
anteriores son mas cortos que el promedio, y las dos cosas se compensan
exactamente.

El modelo calcula por los dos caminos y exige que coincidan, asi la identidad
queda verificada en vez de citada.
"""
from __future__ import annotations

import random

import sympy as sp

ID = "g5-21"
NUMERO = "5.21"

A, B = 20, 30
PEDIDO = 28

ell = sp.Symbol("ell", positive=True)
DENSIDAD = sp.Rational(1, B - A)


def _piezas(pedido):
    """(p, E[L | L >= pedido], E[L | L < pedido]) para un corte dado."""
    p = sp.Rational(B - pedido, B - A)
    media_sirve = sp.integrate(ell * DENSIDAD, (ell, pedido, B)) / p
    media_no = sp.integrate(ell * DENSIDAD, (ell, A, pedido)) / (1 - p)
    return p, sp.simplify(media_sirve), sp.simplify(media_no)


def exacto() -> dict[str, sp.Expr]:
    p, media_sirve, media_no = _piezas(PEDIDO)

    e_n = sp.simplify(1 / p)
    e_total = sp.simplify((e_n - 1) * media_no + media_sirve)
    e_stock = sp.simplify(e_total - media_sirve)

    # Control: el stock son los N-1 rollos que no sirvieron.
    assert sp.simplify(e_stock - (e_n - 1) * media_no) == 0

    # Identidad de Wald: E[total] = E[N] * E[L]. Tiene que coincidir con el
    # calculo que separa el ultimo rollo, y no solo para este corte.
    media_rollo = sp.Rational(A + B, 2)
    assert sp.simplify(e_total - e_n * media_rollo) == 0, "Wald no coincide"
    for corte in (22, 24, 26, 29):
        p_c, sirve_c, no_c = _piezas(corte)
        por_casos = sp.simplify((1 / p_c - 1) * no_c + sirve_c)
        por_wald = sp.simplify((1 / p_c) * media_rollo)
        assert sp.simplify(por_casos - por_wald) == 0, f"Wald falla con corte {corte}"

    return {
        "a": e_n,
        "b": e_total,
        "c": e_stock,
        "media_sirve": media_sirve,
        "media_no_sirve": media_no,
        "b_por_wald": sp.simplify(e_n * media_rollo),
    }


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    cant = total = stock = 0.0
    for _ in range(n):
        acum = 0.0
        k = 0
        while True:
            l = rng.uniform(A, B)
            k += 1
            acum += l
            if l >= PEDIDO:
                stock += acum - l
                break
        cant += k
        total += acum
    return {"a": cant / n, "b": total / n, "c": stock / n}


# E[N]=5, E[total]=125: el error estandar ronda 0.05, asi que 0.5 es amplio.
TOLERANCIA = 0.5

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
