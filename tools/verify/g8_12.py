# -*- coding: utf-8 -*-
"""
Ejercicio 8.12 — sobreventa de plazas en una excursion.

Hay 100 plazas, cada reserva se cancela con probabilidad 0.1 y no hay lista de
espera. Si se aceptan n reservas, los que se presentan son Binomial(n, 0.9), y
quedan clientes indignados cuando se presentan **mas de 100**. Se pide el n
maximo que mantiene esa probabilidad en 0.01 o menos.

Por el teorema central del limite la binomial se aproxima por una normal de
media 0.9n y varianza 0.09n, y con correccion por continuidad

    P(X > 100) = P(X >= 101) ~ 1 - Phi( (100.5 - 0.9n) / sqrt(0.09n) )

Pedir que eso sea <= 0.01 da la condicion sobre n.

Aca el segundo camino de verificacion es **mejor que un Monte Carlo**: con
n ~ 100 la binomial se puede sumar exactamente, asi que el modelo calcula la
probabilidad exacta para cada n sin aproximar nada.

Y los dos caminos **NO coinciden**:

    por la aproximacion normal (con o sin correccion)  ->  103
    por la binomial exacta                             ->  104

No es un error de ninguno de los dos: la aproximacion normal sobreestima la
cola en este rango, asi que es conservadora y se queda un lugar antes. Con
n = 104 la probabilidad exacta es 0.0057 (entra en el 0.01) pero la normal la
estima en 0.0121 (no entra).

El contenido carga **103**, que es la respuesta por el TCL, porque el
ejercicio esta en el capitulo del TCL. El 104 queda anotado en fuentes_valor y
en revision/guia-8.md: si la resuelta de la catedra dice 104, no esta mal, usa
otro metodo.
"""
from __future__ import annotations

from fractions import Fraction
from math import comb

import sympy as sp

from comun import Phi

ID = "g8-12"
NUMERO = "8.12"

PLAZAS = 100
P_CANCELA = Fraction(1, 10)
P_SE_PRESENTA = 1 - P_CANCELA
TOPE_RIESGO = Fraction(1, 100)


def p_exacta(n: int) -> Fraction:
    """P(se presentan mas de 100) exacta, sumando la binomial."""
    return sum(
        Fraction(comb(n, k)) * P_SE_PRESENTA**k * P_CANCELA ** (n - k)
        for k in range(PLAZAS + 1, n + 1)
    )


def p_aproximada(n: int) -> sp.Expr:
    """La misma probabilidad por el TCL, con correccion por continuidad."""
    media = sp.Rational(P_SE_PRESENTA) * n
    desvio = sp.sqrt(sp.Rational(P_SE_PRESENTA * P_CANCELA) * n)
    return 1 - Phi((sp.Rational(PLAZAS) + sp.Rational(1, 2) - media) / desvio)


def exacto() -> dict:
    # Maximo n por el calculo exacto
    n_exacto = PLAZAS
    while p_exacta(n_exacto + 1) <= TOPE_RIESGO:
        n_exacto += 1

    # Maximo n por la aproximacion normal
    n_aprox = PLAZAS
    while p_aproximada(n_aprox + 1) <= TOPE_RIESGO:
        n_aprox += 1

    # Maximalidad por cada camino: con n alcanza y con n+1 no.
    assert p_exacta(n_exacto) <= TOPE_RIESGO
    assert p_exacta(n_exacto + 1) > TOPE_RIESGO
    assert p_aproximada(n_aprox) <= TOPE_RIESGO
    assert p_aproximada(n_aprox + 1) > TOPE_RIESGO
    # Los dos caminos NO coinciden, y esta bien que no coincidan: ver el
    # docstring. Lo que se verifica es que la diferencia sea exactamente de 1
    # y en el sentido esperado (la normal es conservadora).
    assert n_aprox == n_exacto - 1, (
        f"se esperaba normal = exacto - 1, dio normal={n_aprox} exacto={n_exacto}"
    )

    return {
        # La respuesta del contenido: la del TCL.
        "a": sp.Integer(n_aprox),
        "n_por_la_binomial_exacta": sp.Integer(n_exacto),
        "p_aprox_con_ese_n": sp.simplify(p_aproximada(n_aprox)),
        "p_aprox_con_uno_mas": sp.simplify(p_aproximada(n_aprox + 1)),
        "p_exacta_con_104": sp.nsimplify(sp.Rational(p_exacta(n_exacto))),
    }


def estimado() -> dict[str, float]:
    """
    No hay Monte Carlo: el segundo camino es el calculo exacto de la binomial,
    que es mejor que simular porque no tiene error de muestreo.
    """
    return {}


TOLERANCIA = 0.0

if __name__ == "__main__":
    e = exacto()
    print(f"  n maximo por el TCL          = {e['a']}")
    print(f"  n maximo por la binomial     = {e['n_por_la_binomial_exacta']}")
    print(f"  P aprox con n={e['a']}            = {float(e['p_aprox_con_ese_n']):.6f}")
    print(f"  P aprox con n+1              = {float(e['p_aprox_con_uno_mas']):.6f}")
    print(f"  P exacta con n=104           = {float(e['p_exacta_con_104']):.6f}")
