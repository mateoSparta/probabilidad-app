# -*- coding: utf-8 -*-
"""
Ejercicio 1.9 — el ping-pong de Feller.

Juan, Pedro y Maria. El que gana sigue, el que pierde sale y entra el que no
jugaba. Se gana la cerveza el primero que gana dos partidos seguidos. El
primer partido es Juan-Pedro, y Juan lo gana con probabilidad 5/9. A cada
juego que dura exactamente k partidos se le asigna probabilidad
1/(3 2^(k-1)).

Hay exactamente dos juegos de cada longitud k >= 2, uno por cada ganador del
primer partido. Sumando, los juegos finitos tienen probabilidad
2 sum_{k>=2} 1/(3 2^(k-1)) = 2/3: el tercio que falta es de los dos juegos
infinitos, (JMP)^oo y (PMJ)^oo. Es el punto del ejercicio: con esta
asignacion, que el juego dure para siempre tiene probabilidad positiva.

Se cargan los incisos (b), (c) y (d) de la guia, como items a, b y c.

  (b) quien se toma la cerveza: el ganador rota con periodo 3 en k.
  (c) Juan gana el primero y el juego no termina: 5/9 - (juegos finitos que
      empiezan con Juan) = 5/9 - 1/3 = 2/9 (continuidad de P).
  (d) el juego no termina: 1 - 2/3 = 1/3.

El exacto suma las series geometricas con sympy. El segundo camino genera los
juegos jugando las reglas partido por partido (quien juega, quien entra, cuando
termina) hasta 60 partidos, y suma los pesos dados; asi verifica que hay dos
juegos por longitud y quien gana cada uno.
"""
from __future__ import annotations

from fractions import Fraction as Fr

import sympy as sp

ID = "g1-09"
NUMERO = "1.9"

P_JUAN_PRIMERO = Fr(5, 9)


def exacto() -> dict:
    k = sp.symbols("k", integer=True, positive=True)
    peso = 1 / (3 * 2 ** (k - 1))
    # Desde Juan: el ganador de la cerveza es Juan si k = 2 mod 3, Maria si
    # k = 0 mod 3 y Pedro si k = 1 mod 3. Desde Pedro, Juan y Pedro se cambian.
    j = sp.symbols("j", integer=True, nonnegative=True)
    s2 = sp.summation(peso.subs(k, 3 * j + 2), (j, 0, sp.oo))
    s0 = sp.summation(peso.subs(k, 3 * j + 3), (j, 0, sp.oo))
    s1 = sp.summation(peso.subs(k, 3 * j + 4), (j, 0, sp.oo))
    finitos_juan = sp.nsimplify(s0 + s1 + s2)
    return {
        "a1": sp.nsimplify(s2 + s1),        # Juan
        "a2": sp.nsimplify(s1 + s2),        # Pedro
        "a3": sp.nsimplify(2 * s0),         # Maria
        "b": sp.Rational(P_JUAN_PRIMERO) - finitos_juan,
        "c": 1 - 2 * finitos_juan,
    }


def juegos(max_partidos: int = 60):
    """Todos los juegos que terminan en a lo sumo max_partidos, con su ganador."""
    salida = []
    pendientes = [("J", "P", "M", ["J"]), ("P", "J", "M", ["P"])]
    # (ganador del ultimo, perdedor del ultimo, el que espera, secuencia)
    while pendientes:
        gano, perdio, espera, seq = pendientes.pop()
        if len(seq) >= 2 and seq[-1] == seq[-2]:
            salida.append((len(seq), seq[-1], seq[0]))
            continue
        if len(seq) >= max_partidos:
            continue
        # Juegan el ganador y el que esperaba.
        for nuevo in (gano, espera):
            otro = espera if nuevo == gano else gano
            pendientes.append((nuevo, otro, perdio, seq + [nuevo]))
    return salida


def estimado() -> dict:
    tot = {"J": Fr(0), "P": Fr(0), "M": Fr(0)}
    finitos_juan = Fr(0)
    por_largo: dict[int, int] = {}
    for largo, ganador, primero in juegos():
        p = Fr(1, 3 * 2 ** (largo - 1))
        tot[ganador] += p
        por_largo[largo] = por_largo.get(largo, 0) + 1
        if primero == "J":
            finitos_juan += p
    assert all(c == 2 for c in por_largo.values()), por_largo
    finitos = sum(tot.values())
    return {
        "a1": float(tot["J"]),
        "a2": float(tot["P"]),
        "a3": float(tot["M"]),
        "b": float(P_JUAN_PRIMERO - finitos_juan),
        "c": float(1 - finitos),
    }


# El truncamiento en 60 partidos deja afuera una masa de orden 2^-59.
TOLERANCIA = 1e-9
