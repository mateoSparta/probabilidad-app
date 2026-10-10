# -*- coding: utf-8 -*-
"""
Primer parcial del 26-05-2018 (version 61.09 - 81.04).

  1. Interruptores a y b en paralelo. P(a cerrado, b abierto) = 0.4,
     P(a abierto, b cerrado) = 0.1, P(pasa corriente) = 0.7. Son
     independientes "a abierto" y "b abierto"?
  2. f(x, y) = 3 e^{-(2x + y)} en 0 < x < y. Densidad conjunta de
     (U, V) = (X, 2X + Y).
  3. Subte (0.6, U(45, 60)) o colectivo (0.4, U(50, 70)). Tardo 55 minutos:
     P(viajo en colectivo).
  4. Poisson de 10 por hora de 8:00 a 13:00; cada cliente carga 50, 100 o 150
     con probabilidades 0.5, 0.3, 0.2. Varianza del monto total.
  5. TCL: 75 bolsas de media 19.5 y desvio 0.3, cada una pierde U[0, 0.5].
     P(llegan menos de 1450 kg).

Los interruptores estan en paralelo (figura de la pagina 4): pasa corriente
si alguno esta cerrado.

Resuelta: fuentes/examenes/parciales/07 Parcial Resuelto - EP20180526Res.pdf,
paginas 4 a 6.
"""
from __future__ import annotations

import bisect
import math
import random
from fractions import Fraction

import sympy as sp

from comun import SEMILLA, Ejercicio, Phi

ID_EXAMEN = "ep-20180526"


# ----------------------------------------------------------------- ej 1

def exacto_1() -> dict:
    # A = "a abierto", B = "b abierto". Dato: P(A^c B) = 0.4, P(A B^c) = 0.1 y,
    # en paralelo, pasa corriente si alguno esta cerrado: P(A^c U B^c) = 0.7.
    p_ab = 1 - Fraction(7, 10)                 # De Morgan
    p_a = p_ab + Fraction(1, 10)
    p_b = p_ab + Fraction(4, 10)
    assert p_ab != p_a * p_b                   # no son independientes
    return {"p_AB": p_ab, "p_A_por_p_B": p_a * p_b}


def estimado_1() -> dict:
    return {}


# ----------------------------------------------------------------- ej 2

# (u, v) donde se evalua la densidad. El ultimo esta fuera del soporte.
PUNTOS_2 = [(1, 4), (Fraction(1, 2), 3), (1, 2)]


def exacto_2() -> dict:
    x, y, u, v = sp.symbols("x y u v", positive=True)
    f_xy = 3 * sp.exp(-(2 * x + y))
    # Inversa: x = u, y = v - 2u. Jacobiano de la inversa = 1.
    inversa = {x: u, y: v - 2 * u}
    jac = sp.Matrix([u, v - 2 * u]).jacobian([u, v]).det()
    assert jac == 1
    f_uv = sp.simplify(f_xy.subs(inversa) * abs(jac))
    # Soporte: 0 < x < y  <=>  0 < u < v - 2u  <=>  0 < u < v/3.
    dentro = lambda a, b: 0 < a < sp.Rational(b) / 3      # noqa: E731
    # Control: integra 1 sobre el soporte.
    assert sp.integrate(sp.integrate(f_uv, (u, 0, v / 3)), (v, 0, sp.oo)) == 1
    salida = {}
    for i, (a, b) in enumerate(PUNTOS_2, 1):
        valor = f_uv.subs({u: sp.Rational(a), v: b}) if dentro(sp.Rational(a), b) else sp.Integer(0)
        salida[f"a{i}"] = sp.simplify(valor)
    return salida


def estimado_2() -> dict:
    """
    Por rechazo, sin derivar marginales: X ~ Exp(2) e Y ~ Exp(1)
    independientes, condicionadas a X < Y, tienen densidad proporcional a
    e^{-(2x+y)} en 0 < x < y. La densidad de (U, V) se estima contando en un
    cuadrado de lado 2h alrededor de cada punto (todos lejos del borde
    u = v/3).
    """
    rng = random.Random(SEMILLA)
    h, n = 0.2, 2_000_000
    cuentas = [0] * len(PUNTOS_2)
    aceptados = 0
    for _ in range(n):
        a, b = rng.expovariate(2), rng.expovariate(1)
        if a >= b:
            continue
        aceptados += 1
        uu, vv = a, 2 * a + b
        for i, (pu, pv) in enumerate(PUNTOS_2):
            if abs(uu - float(pu)) < h and abs(vv - pv) < h:
                cuentas[i] += 1
    return {f"a{i}": c / aceptados / (2 * h) ** 2 for i, c in enumerate(cuentas, 1)}


# ----------------------------------------------------------------- ej 3

P_SUBTE, P_COLE = Fraction(6, 10), Fraction(4, 10)
SUBTE, COLE = (45, 60), (50, 70)
OBSERVADO = 55


def exacto_3() -> dict:
    f_s = Fraction(1, SUBTE[1] - SUBTE[0])
    f_c = Fraction(1, COLE[1] - COLE[0])
    return {"a": P_COLE * f_c / (P_COLE * f_c + P_SUBTE * f_s)}


def estimado_3() -> dict:
    # Las dos densidades son constantes en (54, 56): la ventana no sesga.
    rng = random.Random(SEMILLA)
    casos = cole = 0
    for _ in range(2_000_000):
        en_cole = rng.random() < float(P_COLE)
        t = rng.uniform(*COLE) if en_cole else rng.uniform(*SUBTE)
        if abs(t - OBSERVADO) < 1:
            casos += 1
            cole += en_cole
    return {"a": cole / casos}


# ----------------------------------------------------------------- ej 4

MONTOS = {50: Fraction(1, 2), 100: Fraction(3, 10), 150: Fraction(1, 5)}
MEDIA_N = 10 * 5                       # 10 por hora, de 8:00 a 13:00


def exacto_4() -> dict:
    e_m = sum(m * p for m, p in MONTOS.items())
    e_m2 = sum(m * m * p for m, p in MONTOS.items())
    var_m = e_m2 - e_m**2
    # Varianza total: var(E[S|N]) + E[var(S|N)] = E[M]^2 var N + var M E[N].
    var_s = e_m**2 * MEDIA_N + var_m * MEDIA_N
    assert var_s == MEDIA_N * e_m2
    return {"a": var_s}


def estimado_4() -> dict:
    """
    Varianza muestral de 400000 montos totales. N ~ Poisson(50) se sortea por
    inversion de la funcion de distribucion. Con esa muestra el error estandar
    de la varianza es ~0.22 % (~1000), y la tolerancia es de 5000.
    """
    acum, p, k = [], math.exp(-MEDIA_N), 0
    total = 0.0
    while total < 1 - 1e-15:
        total += p
        acum.append(total)
        k += 1
        p *= MEDIA_N / k
    montos, pesos = list(MONTOS), [float(q) for q in MONTOS.values()]
    rng = random.Random(SEMILLA)
    n = 400_000
    s1 = s2 = 0.0
    for _ in range(n):
        cant = bisect.bisect_left(acum, rng.random())
        s = sum(rng.choices(montos, weights=pesos, k=cant))
        s1 += s
        s2 += s * s
    return {"a": s2 / n - (s1 / n) ** 2}


# ----------------------------------------------------------------- ej 5

BOLSAS, LIMITE = 75, 1450
MEDIA_B, DESVIO_B = sp.Rational(195, 10), sp.Rational(3, 10)
PERDIDA = sp.Rational(1, 2)


def exacto_5() -> dict:
    media = MEDIA_B - PERDIDA / 2
    var = DESVIO_B**2 + PERDIDA**2 / 12
    return {"a": sp.simplify(Phi((LIMITE - BOLSAS * media) / sp.sqrt(BOLSAS * var)))}


def estimado_5() -> dict:
    """
    El enunciado solo da media y desvio de cada bolsa; se simula con pesos
    normales, que es una de las distribuciones compatibles.
    """
    rng = random.Random(SEMILLA)
    m, d, p = float(MEDIA_B), float(DESVIO_B), float(PERDIDA)
    n = 200_000
    ok = sum(
        1 for _ in range(n)
        if sum(rng.gauss(m, d) - rng.uniform(0, p) for _ in range(BOLSAS)) < LIMITE
    )
    return {"a": ok / n}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("2", exacto_2, estimado_2),
    Ejercicio("3", exacto_3, estimado_3),
    Ejercicio("4", exacto_4, estimado_4, tolerancia=5000),
    Ejercicio("5", exacto_5, estimado_5),
]
