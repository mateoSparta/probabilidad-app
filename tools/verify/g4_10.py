# -*- coding: utf-8 -*-
"""
Ejercicio 4.10 — transformaciones de dos normales estandar independientes.

  1. U = Z1 + Z2, V = Z1 - Z2: jacobiano de la inversa 1/2;
     f(u, v) = e^{-(u^2+v^2)/4} / (4 pi). U y V son N(0, 2) independientes.
  2. Rotacion: la densidad conjunta de dos normales estandar independientes
     solo depende de u^2 + v^2, que la rotacion conserva. Sale lo mismo.
  3. U = Z1^2 + Z2^2, V = Z2/Z1: dos preimagenes por punto (z y -z),
     jacobiano 1/(2(1+v^2)); f(u, v) = (1/2) e^{-u/2} / (pi (1+v^2)).
     U ~ Exp de media 2 y V ~ Cauchy, independientes.

(b) son independientes en los tres casos. (c) P(Z1^2 + Z2^2 > 4) = e^{-2} y
P(Z2 > sqrt(3) Z1) = 1/2, porque es un semiplano que pasa por el origen y la
conjunta es invariante por rotaciones.

El exacto aplica el cambio de variables con sympy; el Monte Carlo sortea las
normales y estima cada densidad en una ventana chica.
"""
from __future__ import annotations

import math
import random

import sympy as sp

from comun import SEMILLA

ID = "g4-10"
NUMERO = "4.10"

u, v, z1, z2 = sp.symbols("u v z1 z2", real=True)
FZ = sp.exp(-(z1**2 + z2**2) / 2) / (2 * sp.pi)
TITA = 1.0          # cualquier angulo da lo mismo


def exacto() -> dict:
    # 1. inversa z1 = (u+v)/2, z2 = (u-v)/2
    inv1 = {z1: (u + v) / 2, z2: (u - v) / 2}
    j1 = sp.Matrix([inv1[z1], inv1[z2]]).jacobian([u, v]).det()
    f1 = sp.simplify(FZ.subs(inv1) * abs(j1))
    f1u = sp.simplify(sp.integrate(f1, (v, -sp.oo, sp.oo)))
    # 2. rotacion: la inversa es la rotacion por -tita, jacobiano 1
    t = sp.Rational(1)
    inv2 = {z1: sp.cos(t) * u + sp.sin(t) * v, z2: -sp.sin(t) * u + sp.cos(t) * v}
    j2 = sp.simplify(sp.Matrix([inv2[z1], inv2[z2]]).jacobian([u, v]).det())
    f2 = sp.simplify(FZ.subs(inv2) * abs(j2))
    # 3. dos preimagenes: z1 = +-sqrt(u/(1+v^2)), z2 = v z1
    up, vp = sp.symbols("u v", positive=True)
    rama = {z1: sp.sqrt(up / (1 + v**2)), z2: v * sp.sqrt(up / (1 + v**2))}
    j3 = sp.simplify(sp.Matrix([rama[z1], rama[z2]]).jacobian([up, v]).det())
    f3 = sp.simplify(2 * FZ.subs(rama) * abs(j3))
    f3u = sp.simplify(sp.integrate(f3, (v, -sp.oo, sp.oo)))
    f3v = sp.simplify(sp.integrate(f3, (up, 0, sp.oo)))
    assert sp.simplify(f3 - f3u * f3v) == 0, "en el caso 3 la conjunta no factoriza"
    assert sp.simplify(f1 - f1u * f1u.subs(u, v)) == 0, "en el caso 1 la conjunta no factoriza"
    return {
        "a1": f1.subs({u: 0, v: 0}),
        "a2": f1.subs({u: 1, v: 1}),
        "a3": f1u.subs(u, 0),
        "b1": sp.simplify(f2.subs({u: 1, v: 0})),
        "b2": sp.simplify(sp.integrate(f2, (v, -sp.oo, sp.oo)).subs(u, 0)),
        "c1": sp.simplify(f3.subs({up: 2, v: 1})),
        "c2": sp.simplify(f3u.subs(up, 2)),
        "c3": sp.simplify(f3v.subs(v, 1)),
        "e1": sp.exp(-2),
        "e2": sp.Rational(1, 2),
    }


def estimado() -> dict:
    rng = random.Random(SEMILLA)
    n = 2_000_000
    h = 0.1
    area = (2 * h) ** 2
    c1 = c2 = c3 = 0
    r1 = r2 = 0
    q1 = q2 = q3 = 0
    p1 = p2 = 0
    raiz3 = math.sqrt(3)
    co, se = math.cos(TITA), math.sin(TITA)
    for _ in range(n):
        a, b = rng.gauss(0, 1), rng.gauss(0, 1)
        s_, d_ = a + b, a - b
        c1 += abs(s_) < h and abs(d_) < h
        c2 += abs(s_ - 1) < h and abs(d_ - 1) < h
        c3 += abs(s_) < h
        ru, rv = co * a - se * b, se * a + co * b
        r1 += abs(ru - 1) < h and abs(rv) < h
        r2 += abs(ru) < h
        uu, vv = a * a + b * b, b / a
        q1 += abs(uu - 2) < h and abs(vv - 1) < h
        q2 += abs(uu - 2) < h
        q3 += abs(vv - 1) < h
        p1 += uu > 4
        p2 += b > raiz3 * a
    return {
        "a1": c1 / n / area,
        "a2": c2 / n / area,
        "a3": c3 / n / (2 * h),
        "b1": r1 / n / area,
        "b2": r2 / n / (2 * h),
        "c1": q1 / n / area,
        "c2": q2 / n / (2 * h),
        "c3": q3 / n / (2 * h),
        "e1": p1 / n,
        "e2": p2 / n,
    }


TOLERANCIA = 0.008
