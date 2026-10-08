# -*- coding: utf-8 -*-
"""
Primitivas para los modelos de verificacion (PLAN.md seccion 7, paso 4).

La regla de CLAUDE.md es que ningun valor entra al contenido sin venir de una
resuelta y/o de un calculo independiente. Estos helpers son el calculo
independiente: cada ejercicio declara su modelo y el runner lo resuelve por
dos caminos, exacto y Monte Carlo, que tienen que coincidir.
"""
from __future__ import annotations

import itertools
import random
from fractions import Fraction
from typing import Callable, Iterable, Sequence

# Semilla fija: el reporte tiene que ser reproducible.
SEMILLA = 20260408
N_MONTECARLO = 400_000

# Tolerancia del Monte Carlo. El error estandar de una proporcion con
# n = 4e5 es como mucho 0.0008, asi que 0.005 es ~6 sigma: pasa si el modelo
# esta bien y falla si hay un error conceptual.
TOL_MONTECARLO = 0.005


def exacto_sobre(espacio: Iterable[tuple], evento: Callable[[tuple], bool]) -> Fraction:
    """
    Probabilidad exacta por conteo sobre un espacio equiprobable finito.
    Es Laplace: casos favorables sobre casos totales, sin punto flotante.
    """
    total = favorables = 0
    for w in espacio:
        total += 1
        if evento(w):
            favorables += 1
    if total == 0:
        raise ValueError("el espacio muestral esta vacio")
    return Fraction(favorables, total)


def dados(n: int, caras: int = 6) -> Iterable[tuple]:
    """Espacio muestral de n dados equilibrados."""
    return itertools.product(range(1, caras + 1), repeat=n)


def montecarlo(
    sortear: Callable[[random.Random], bool],
    n: int = N_MONTECARLO,
    semilla: int = SEMILLA,
) -> float:
    """Estima P(evento) repitiendo el experimento n veces."""
    rng = random.Random(semilla)
    aciertos = sum(1 for _ in range(n) if sortear(rng))
    return aciertos / n


def extraer_sin_reponer(rng: random.Random, urna: Sequence[str], k: int) -> list[str]:
    """k extracciones sin reposicion de una urna dada como lista de colores."""
    return rng.sample(list(urna), k)


def urna(**colores: int) -> list[str]:
    """urna(roja=5, blanca=3) -> ['roja']*5 + ['blanca']*3"""
    bolas: list[str] = []
    for color, n in colores.items():
        bolas.extend([color] * n)
    return bolas


def algebra_generada(omega: frozenset, generadores: Sequence[frozenset]) -> set[frozenset]:
    """
    La menor algebra de subconjuntos de omega que contiene a los generadores.

    Se cierra por complemento y union hasta que no entra nada nuevo. Sobre un
    omega finito el proceso termina, y como el algebra generada es unica, el
    resultado es la respuesta: no hay nada que adivinar.
    """
    actual: set[frozenset] = {frozenset(), frozenset(omega)}
    actual.update(frozenset(g) for g in generadores)
    while True:
        nuevo = set(actual)
        for a in actual:
            nuevo.add(frozenset(omega) - a)
        for a in actual:
            for b in actual:
                nuevo.add(a | b)
        if nuevo == actual:
            return actual
        actual = nuevo


def como_texto(f: Fraction) -> str:
    """La fraccion tal como va al YAML: exacta, no un decimal redondeado."""
    return str(f.numerator) if f.denominator == 1 else f"{f.numerator}/{f.denominator}"


# ---------------------------------------------------------------------------
# Variables continuas (guias 2 en adelante)
#
# El exacto va con sympy: integrar la densidad en forma simbolica y quedarse
# con el valor exacto, no con un decimal. El Monte Carlo sortea la variable y
# cuenta, que es lo que verifica que la densidad este bien interpretada.
# ---------------------------------------------------------------------------

def p_densidad(densidad, x, desde, hasta):
    """
    Integra una densidad simbolica en [desde, hasta]. Devuelve la expresion
    exacta de sympy, simplificada.
    """
    import sympy as sp

    return sp.simplify(sp.integrate(densidad, (x, desde, hasta)))


def area_region(dentro, x, y, x0, x1, y0, y1):
    """
    Area de una region del plano, por integracion doble sobre el rectangulo
    que la contiene. `dentro` es una condicion de sympy.
    """
    import sympy as sp

    return sp.simplify(
        sp.integrate(sp.Piecewise((1, dentro), (0, True)), (y, y0, y1), (x, x0, x1))
    )


def montecarlo_2d(
    sortear_punto,
    evento,
    n: int = N_MONTECARLO,
    semilla: int = SEMILLA,
) -> float:
    """
    Estima P(evento) sobre puntos del plano. `sortear_punto` devuelve (x, y)
    o None si el sorteo hay que descartarlo (rechazo).
    """
    rng = random.Random(semilla)
    casos = aciertos = 0
    while casos < n:
        p = sortear_punto(rng)
        if p is None:
            continue
        casos += 1
        if evento(*p):
            aciertos += 1
    return aciertos / n


def exponencial(rng: random.Random, intensidad: float) -> float:
    """Una exponencial de intensidad (tasa) dada."""
    return rng.expovariate(intensidad)


def gamma_suma(rng: random.Random, k: int, intensidad: float) -> float:
    """
    Suma de k exponenciales independientes de la misma intensidad, que es el
    tiempo hasta el k-esimo evento. Se simula asi a proposito: verifica que la
    densidad Gamma del enunciado describa ese experimento.
    """
    return sum(rng.expovariate(intensidad) for _ in range(k))


# Semiancho de la ventana para estimar una densidad por Monte Carlo.
# Chico para que el sesgo sea despreciable, grande para que caigan
# suficientes muestras adentro.
VENTANA_DENSIDAD = 0.1


def montecarlo_densidad(
    sortear: Callable[[random.Random], float],
    punto: float,
    h: float = VENTANA_DENSIDAD,
    n: int = N_MONTECARLO,
    semilla: int = SEMILLA,
    lado: str = "ambos",
) -> float:
    """
    Estima f(punto) contando que fraccion de las muestras cae en una ventana
    chica alrededor del punto, dividida por el ancho de la ventana.

    Un valor de densidad no es una frecuencia, asi que no se puede contar
    directo; pero el area bajo la densidad en una ventana chica si lo es. Es
    lo que permite verificar una densidad por dos caminos y no solo con la
    integral simbolica.

    `lado` importa en los **bordes del soporte**: si el punto esta en el
    extremo, la mitad de la ventana cae donde la densidad vale cero y la
    estimacion sale justo a la mitad. Ahi hay que pedir la ventana de un solo
    lado, con "derecha" o "izquierda".
    """
    rng = random.Random(semilla)
    if lado == "derecha":
        dentro = sum(1 for _ in range(n) if punto <= sortear(rng) < punto + h)
        ancho = h
    elif lado == "izquierda":
        dentro = sum(1 for _ in range(n) if punto - h < sortear(rng) <= punto)
        ancho = h
    else:
        dentro = sum(1 for _ in range(n) if abs(sortear(rng) - punto) < h)
        ancho = 2 * h
    return dentro / n / ancho


# ---------------------------------------------------------------------------
# Distribucion normal (guia 8)
#
# No hay scipy, asi que Phi y su inversa se escriben con erf y erfinv de
# sympy. Quedan exactas en forma simbolica, que es lo que se quiere para el
# contenido.
# ---------------------------------------------------------------------------

def Phi(z):
    """Funcion de distribucion normal estandar, exacta."""
    import sympy as sp

    return (1 + sp.erf(sp.nsimplify(z) / sp.sqrt(2))) / 2


def phi(z):
    """Densidad normal estandar, exacta."""
    import sympy as sp

    return sp.exp(-sp.nsimplify(z) ** 2 / 2) / sp.sqrt(2 * sp.pi)


def cuantil_normal(p):
    """
    El z tal que Phi(z) = p. Se obtiene con erfinv, asi que no depende de
    una tabla redondeada: es el valor exacto.
    """
    import sympy as sp

    return sp.sqrt(2) * sp.erfinv(2 * sp.nsimplify(p) - 1)
