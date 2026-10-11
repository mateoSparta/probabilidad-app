# -*- coding: utf-8 -*-
"""
Ejercicio 3.32 — media muestral y W^2.

X1, X2, ... replicas independientes de X, con media mu y varianza sigma^2.

  E[Xbar] = mu,  var[Xbar] = sigma^2 / n  (las varianzas de independientes se
  suman y el 1/n sale al cuadrado)
  E[W^2] = (1/n) sum E[(Xm - mu)^2] = sigma^2

Se cargan (a) y (b); (c) y (d) dicen "mostrar que", son demostracion.

El exacto calcula con sympy sobre n replicas simbolicas (con n concreto) y
generaliza; el Monte Carlo usa una X exponencial (mu = sigma = 2) con n = 5.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import SEMILLA

ID = "g3-32"
NUMERO = "3.32"

sigma, n = sp.symbols("sigma n", positive=True)
PUNTOS = [(sp.Integer(2), 5), (sp.Rational(1, 2), 12)]


def exacto() -> dict:
    # var de la suma de n independientes = n sigma^2; Xbar = suma / n.
    for k in (1, 3, 7):
        var_media = sp.Rational(1, k**2) * k * sigma**2
        assert sp.simplify(var_media - sigma**2 / k) == 0
    a = sigma**2 / n
    b = sigma**2
    salida = {"a": a, "b": b}
    for i, (s, m) in enumerate(PUNTOS, 1):
        salida[f"a_en_{i}"] = a.subs({sigma: s, n: m})
    salida["b_en_1"] = b.subs(sigma, 2)
    return salida


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    reps = 200_000
    salida = {}
    for i, (s, m) in enumerate(PUNTOS, 1):
        # Exponencial de media s: tiene desvio s.
        medias, w2 = [], []
        for _ in range(reps):
            xs = [rng.expovariate(1 / float(s)) for _ in range(m)]
            medias.append(sum(xs) / m)
            w2.append(sum((x - float(s)) ** 2 for x in xs) / m)
        mu = sum(medias) / reps
        salida[f"a_en_{i}"] = sum((v - mu) ** 2 for v in medias) / reps
        if i == 1:
            salida["b_en_1"] = sum(w2) / reps
    return salida


# var[Xbar] = 0.8 se estima con error ~0.003; E[W^2] = 4 con ~0.01.
TOLERANCIA = 0.05
