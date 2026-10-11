# -*- coding: utf-8 -*-
"""
Ejercicio 4.3 — densidades de transformaciones de una continua.

f_X(x) = 12x / (pi^2 (e^x + 1)) en x > 0. Integra 1, porque
int_0^oo x/(e^x + 1) dx = pi^2/12 (el exacto lo controla).

Cada densidad se evalua en puntos concretos, sumando las ramas de la inversa:
  (a) Y = aX + b:     f_Y(y) = f_X((y - b)/a) / |a|
  (b) Y = -X^3:       f_Y(y) = f_X((-y)^(1/3)) / (3 (-y)^(2/3)), y < 0
  (c) Y = X + 1/X:    dos ramas x = (y -+ sqrt(y^2 - 4))/2, |dy/dx| = |1 - 1/x^2|
  (d) Y = X^2 - 3X:   dos ramas si -9/4 < y < 0, una si y >= 0, |dy/dx| = |2x - 3|

El exacto aplica la formula del cambio de variable rama por rama; el Monte
Carlo sortea X por rechazo (con una exponencial de media 2 como propuesta) y
estima cada densidad contando en una ventana chica alrededor del punto.
"""
from __future__ import annotations

import math
import random

import mpmath
import sympy as sp

from comun import SEMILLA

ID = "g4-03"
NUMERO = "4.3"

x = sp.symbols("x", positive=True)
FX = 12 * x / (sp.pi**2 * (sp.exp(x) + 1))


def f(v):
    v = sp.nsimplify(v)
    return FX.subs(x, v) if v > 0 else sp.Integer(0)


# (item, i): (transformacion, punto, valor exacto por el cambio de variable)
def casos():
    R = sp.Rational
    return {
        "a1": (lambda v: -2 * v + 1, R(-1), f((R(-1) - 1) / -2) / 2),
        "a2": (lambda v: -2 * v + 1, R(2), f((R(2) - 1) / -2) / 2),
        "a3": (lambda v: 3 * v, R(3), f(R(1)) / 3),
        "b1": (lambda v: -v**3, R(-1), f(R(1)) / 3),
        "b2": (lambda v: -v**3, R(-8), f(R(2)) / (3 * 4)),
        "b3": (lambda v: -v**3, R(1), sp.Integer(0)),
        "c1": (lambda v: v + 1 / v, R(5, 2), f(R(1, 2)) / 3 + f(R(2)) / R(3, 4)),
        "c2": (lambda v: v + 1 / v, R(10, 3), f(R(1, 3)) / 8 + f(R(3)) / R(8, 9)),
        "c3": (lambda v: v + 1 / v, R(1), sp.Integer(0)),
        "d1": (lambda v: v**2 - 3 * v, R(-2), f(R(1)) / 1 + f(R(2)) / 1),
        "d2": (lambda v: v**2 - 3 * v, R(4), f(R(4)) / 5),
        "d3": (lambda v: v**2 - 3 * v, R(-3), sp.Integer(0)),
    }


def exacto() -> dict:
    # sympy no da la primitiva cerrada; la integral se controla numericamente.
    masa = mpmath.quad(lambda t: 12 * t / (mpmath.pi**2 * (mpmath.e**t + 1)), [0, mpmath.inf])
    assert abs(masa - 1) < 1e-12, masa
    salida = {}
    for clave, (g, y, valor) in casos().items():
        salida[clave] = sp.simplify(valor)
    # Control de (c) y (d): las raices usadas son las de la ecuacion.
    v = sp.symbols("v", positive=True)
    assert set(sp.solve(sp.Eq(v + 1 / v, sp.Rational(5, 2)), v)) == {sp.Rational(1, 2), 2}
    assert set(sp.solve(sp.Eq(v**2 - 3 * v, -2), v)) == {1, 2}
    return salida


def muestra(rng: random.Random, n: int) -> list[float]:
    """X por rechazo: f(x) <= 1.8 g(x) con g la densidad Exp de media 2."""
    def fx(t):
        return 12 * t / (math.pi**2 * (math.exp(t) + 1))

    xs = []
    while len(xs) < n:
        t = rng.expovariate(0.5)
        if rng.random() * 1.8 * 0.5 * math.exp(-t / 2) <= fx(t):
            xs.append(t)
    return xs


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    n = 1_200_000
    xs = muestra(rng, n)
    h = 0.04
    salida = {}
    for clave, (g, y, _) in casos().items():
        yy = float(y)
        dentro = sum(1 for t in xs if abs(float(g(t)) - yy) < h)
        salida[clave] = dentro / n / (2 * h)
    return salida


# Las densidades miden entre 0.02 y 0.6; con ~1e6 muestras y ventanas de
# 0.08 el error estandar es de ~0.003 en las mas altas.
TOLERANCIA = 0.015
