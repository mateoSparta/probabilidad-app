# -*- coding: utf-8 -*-
"""
Ejercicio 3.10 — circulo armado con un alambre.

(a) El alambre mide L (exponencial de media 60). Al cerrarlo en circulo, L es
    el perimetro, asi que el radio es L/(2 pi) y el area L^2/(4 pi). Lo que se
    pide es E[A], y para eso hace falta E[L^2], no E[L]^2.

(b) Al reves: el area A es exponencial de media 15 y se pide el perimetro.
    De A = pi r^2 sale r = sqrt(A/pi) y el perimetro 2 sqrt(pi A), asi que
    hace falta E[sqrt(A)].

El ejercicio existe para mostrar que **la media no pasa por una funcion no
lineal**: E[g(X)] no es g(E[X]). Si uno usara g(E[L]) daria otra cosa, y el
modelo deja los dos numeros para poder compararlos.
"""
from __future__ import annotations

import math
import random

import sympy as sp

from comun import TOL_MONTECARLO

ID = "g3-10"
NUMERO = "3.10"

MEDIA_L = 60      # cm
MEDIA_A = 15      # cm^2

t = sp.Symbol("t", positive=True)


def exponencial_densidad(media):
    return sp.exp(-t / media) / media


def exacto() -> dict[str, sp.Expr]:
    fL = exponencial_densidad(MEDIA_L)
    fA = exponencial_densidad(MEDIA_A)

    # Controles: las densidades integran 1 y tienen la media que dice el enunciado.
    assert sp.integrate(fL, (t, 0, sp.oo)) == 1
    assert sp.integrate(t * fL, (t, 0, sp.oo)) == MEDIA_L

    # (a) E[A] = E[L^2] / (4 pi)
    e_l2 = sp.integrate(t**2 * fL, (t, 0, sp.oo))
    e_area = sp.simplify(e_l2 / (4 * sp.pi))

    # (b) E[P] = 2 sqrt(pi) E[sqrt(A)]
    e_raiz = sp.integrate(sp.sqrt(t) * fA, (t, 0, sp.oo))
    e_perimetro = sp.simplify(2 * sp.sqrt(sp.pi) * e_raiz)

    return {
        "a": e_area,
        "b": e_perimetro,
        # El error tipico: usar la media adentro de la funcion.
        "a_error_tipico": sp.simplify(MEDIA_L**2 / (4 * sp.pi)),
        "b_error_tipico": sp.simplify(2 * sp.sqrt(sp.pi * MEDIA_A)),
    }


def estimado() -> dict[str, float]:
    rng = random.Random(20260408)
    n = 400_000
    area = sum((rng.expovariate(1 / MEDIA_L) ** 2) / (4 * math.pi) for _ in range(n)) / n
    rng = random.Random(20260408)
    perim = sum(
        2 * math.sqrt(math.pi * rng.expovariate(1 / MEDIA_A)) for _ in range(n)
    ) / n
    return {"a": area, "b": perim}


# La tolerancia es absoluta. E[A] ronda 573 y L^2 tiene cola pesada: con
# 400.000 muestras el error estandar del Monte Carlo es como 2, asi que 10 son
# unos 5 sigma. Mas apretado fallaria de casualidad.
TOLERANCIA = 10.0

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
