# -*- coding: utf-8 -*-
"""
Primer recuperatorio del 16-06-2018 (version 61.09 - 81.04).

  1. 10 bolas indistinguibles en 6 urnas, configuraciones equiprobables.
     P(al menos una urna vacia).
  2. F_X dada por un grafico (aca, como formula a trozos). E[X^2 | -1 < X <= 3].
  3. X ~ U(-1, 1) y E[Y | X] = X^3 - 1. Recta de regresion de Y dada X.
  4. Radares Poisson de 1/25 por km; cada uno se detecta con 0.985. Multa de
     $4000 por radar no detectado. P(mas de $4000 en multas en 400 km).
  5. Catalogos: cada uno rinde $400 (0.1), $300 (0.4) o nada (0.5). Minima
     cantidad para que P(ingreso >= 7000) > 0.95.

El grafico del 2 se transcribio como formula leyendo la figura de la pagina 6:
saltos de 1/16, 1/8, 1/8 y 1/4 en -1, 1, 3 y 4, y pendientes 1/16 en (-2, 1)
y 1/4 en (3, 4). El exacto verifica que esa F sea una funcion de distribucion
y que pase por los valores marcados en el eje.

Resuelta: fuentes/examenes/parciales/06 Parcial Resuelto - EP20180616Res.pdf,
paginas 5 a 8.
"""
from __future__ import annotations

import math
import random
from fractions import Fraction
from itertools import combinations
from math import comb

import sympy as sp

from comun import SEMILLA, Ejercicio, Phi, cuantil_normal, montecarlo

ID_EXAMEN = "ep-20180616"


# ----------------------------------------------------------------- ej 1

BOLAS, URNAS = 10, 6


def exacto_1() -> dict:
    total = BOLAS + URNAS - 1
    casos = vacias = 0
    for barras in combinations(range(total), URNAS - 1):
        cortes = (-1, *barras, total)
        ocup = [cortes[i + 1] - cortes[i] - 1 for i in range(URNAS)]
        casos += 1
        vacias += 0 in ocup
    assert casos == comb(15, 10) and casos - vacias == comb(9, 4)
    return {"a": Fraction(vacias, casos)}


def estimado_1() -> dict:
    total = BOLAS + URNAS - 1

    def experimento(rng: random.Random) -> bool:
        barras = sorted(rng.sample(range(total), URNAS - 1))
        cortes = (-1, *barras, total)
        return any(cortes[i + 1] - cortes[i] == 1 for i in range(URNAS))

    return {"a": montecarlo(experimento)}


# ----------------------------------------------------------------- ej 2

x = sp.symbols("x", real=True)
R = sp.Rational
# (b, expresion): la expresion vale en [b anterior, b).
TRAMOS = [
    (-2, sp.Integer(0)),
    (-1, (x + 2) / 16),
    (1, (x + 3) / 16),
    (3, R(3, 8)),
    (4, R(1, 2) + (x - 3) / 4),
    (sp.oo, sp.Integer(1)),
]
F_X = sp.Piecewise(*((e, x < b) for b, e in TRAMOS[:-1]), (1, True))
ATOMOS = (-1, 1, 3, 4)


def exacto_2() -> dict:
    # Valores marcados en el eje del grafico.
    marcados = {-2: 0, -1: R(1, 8), 1: R(3, 8), 3: R(1, 2), 4: 1}
    for punto, valor in marcados.items():
        assert F_X.subs(x, punto) == valor, (punto, F_X.subs(x, punto))
    # Salto en cada borde: el tramo de la derecha menos el de la izquierda.
    saltos = {
        b: TRAMOS[i + 1][1].subs(x, b) - e.subs(x, b)
        for i, (b, e) in enumerate(TRAMOS[:-1])
        if TRAMOS[i + 1][1].subs(x, b) != e.subs(x, b)
    }
    assert saltos == {-1: R(1, 16), 1: R(1, 8), 3: R(1, 8), 4: R(1, 4)}, saltos
    densidad = sp.diff(F_X, x)

    def esperanza_en(g, a, b):
        """E[g(X) 1{a < X <= b}]: parte continua mas atomos."""
        continua = sp.integrate(g * densidad, (x, a, b))
        discreta = sum(g.subs(x, t) * saltos[t] for t in ATOMOS if a < t <= b)
        return continua + discreta

    total = esperanza_en(sp.Integer(1), -10, 10)
    assert total == 1, total
    num = esperanza_en(x**2, -1, 3)
    den = F_X.subs(x, 3) - F_X.subs(x, -1)
    return {"a": sp.nsimplify(num / den)}


def sortear_x(rng: random.Random) -> float:
    """Inversa generalizada de F_X: el menor x con F_X(x) >= u."""
    u = rng.random()
    if u < 1 / 16:
        return -2 + 16 * u
    if u < 1 / 8:
        return -1.0
    if u < 1 / 4:
        return 16 * u - 3
    if u < 3 / 8:
        return 1.0
    if u < 1 / 2:
        return 3.0
    if u < 3 / 4:
        return 3 + 4 * (u - 1 / 2)
    return 4.0


def estimado_2() -> dict:
    # X^2 condicionada tiene desvio ~3.6: con ~450000 casos aceptados el error
    # estandar de la media es ~0.005.
    rng = random.Random(SEMILLA)
    casos, suma = 0, 0.0
    for _ in range(1_200_000):
        v = sortear_x(rng)
        if -1 < v <= 3:
            casos += 1
            suma += v * v
    return {"a": suma / casos}


# ----------------------------------------------------------------- ej 3

def exacto_3() -> dict:
    t = sp.symbols("t", real=True)
    dens = R(1, 2)
    e = lambda g: sp.integrate(g * dens, (t, -1, 1))     # noqa: E731
    phi = t**3 - 1
    e_x, var_x = e(t), e(t**2) - e(t) ** 2
    e_y = e(phi)                        # E[Y] = E[E[Y|X]]
    cov = e(t * phi) - e_x * e_y        # E[XY] = E[X E[Y|X]]
    pendiente = cov / var_x
    return {"a1": pendiente, "a2": e_y - pendiente * e_x}


def estimado_3() -> dict:
    """
    La recta solo depende de E[Y|X], asi que cualquier Y con esa esperanza
    condicional sirve: se suma un ruido normal de media 0 a X^3 - 1.
    """
    rng = random.Random(SEMILLA)
    n = 400_000
    sx = sy = sxx = sxy = 0.0
    for _ in range(n):
        v = rng.uniform(-1, 1)
        w = v**3 - 1 + rng.gauss(0, 0.5)
        sx += v
        sy += w
        sxx += v * v
        sxy += v * w
    mx, my = sx / n, sy / n
    pend = (sxy / n - mx * my) / (sxx / n - mx * mx)
    return {"a1": pend, "a2": my - pend * mx}


# ----------------------------------------------------------------- ej 4

RADARES = R(1, 25)                 # por km
P_DETECTA = R(985, 1000)
KM = 400


def exacto_4() -> dict:
    mu = RADARES * (1 - P_DETECTA) * KM          # adelgazamiento
    # Mas de $4000 es mas de una multa: N >= 2.
    return {"a": sp.simplify(1 - sp.exp(-mu) * (1 + mu))}


def estimado_4() -> dict:
    lam, p = float(RADARES), float(P_DETECTA)

    def experimento(rng: random.Random) -> bool:
        multas, km = 0, rng.expovariate(lam)
        while km <= KM:
            multas += rng.random() >= p
            km += rng.expovariate(lam)
        return 4000 * multas > 4000

    return {"a": montecarlo(experimento)}


# ----------------------------------------------------------------- ej 5

VALORES = {400: R(1, 10), 300: R(4, 10), 0: R(5, 10)}
OBJETIVO = 7000
CONFIANZA = R(95, 100)


def momentos():
    media = sum(v * p for v, p in VALORES.items())
    var = sum(v * v * p for v, p in VALORES.items()) - media**2
    return media, var


def p_tcl(n: int) -> sp.Expr:
    media, var = momentos()
    return 1 - Phi((OBJETIVO - n * media) / sp.sqrt(n * var))


def exacto_5() -> dict:
    media, var = momentos()
    assert (media, var) == (160, 26400)
    n = 1
    while p_tcl(n) <= CONFIANZA:
        n += 1
    assert p_tcl(n - 1) <= CONFIANZA < p_tcl(n)
    z = float(cuantil_normal(CONFIANZA))
    b = -z * math.sqrt(float(var))
    u = (-b + math.sqrt(b * b + 4 * float(media) * OBJETIVO)) / (2 * float(media))
    assert math.ceil(u * u) == n
    return {
        "a": sp.Integer(n),
        "cota_del_despeje": sp.N(u * u, 6),
        # Con la distribucion exacta alcanza con uno menos. El enunciado pide
        # estimar, y la resuelta usa el TCL, asi que la respuesta es la del TCL.
        "n_con_la_distribucion_exacta": sp.Integer(n_exacto()),
    }


def cola_exacta(n: int) -> float:
    """P(suma >= 7000) con la distribucion exacta, por convolucion en pasos de $100."""
    dist = {0: 1.0}
    paso = {v // 100: float(p) for v, p in VALORES.items()}
    for _ in range(n):
        nueva: dict[int, float] = {}
        for s, ps in dist.items():
            for v, pv in paso.items():
                nueva[s + v] = nueva.get(s + v, 0.0) + ps * pv
        dist = nueva
    return sum(p for s, p in dist.items() if s >= OBJETIVO // 100)


def n_exacto() -> int:
    """El menor n con la distribucion exacta de la suma, sin TCL."""
    n = 1
    while cola_exacta(n) <= float(CONFIANZA):
        n += 1
    return n


def estimado_5() -> dict:
    """
    La misma condicion del TCL evaluada en punto flotante con math.erf, sin
    sympy: verifica la busqueda y el despeje, no la aproximacion.
    """
    media, var = (float(v) for v in momentos())

    def p(n: int) -> float:
        z = (OBJETIVO - n * media) / math.sqrt(n * var)
        return 1 - (1 + math.erf(z / math.sqrt(2))) / 2

    n = 1
    while p(n) <= float(CONFIANZA):
        n += 1
    return {"a": n}


EJERCICIOS = [
    Ejercicio("1", exacto_1, estimado_1),
    Ejercicio("2", exacto_2, estimado_2, tolerancia=0.03),
    Ejercicio("3", exacto_3, estimado_3),
    Ejercicio("4", exacto_4, estimado_4),
    Ejercicio("5", exacto_5, estimado_5, tolerancia=0.0),
]
