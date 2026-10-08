# -*- coding: utf-8 -*-
"""
Ejercicio 2.26 — Lucas y Monk en el bar del CEI.

Minutos desde las 18:00:
  L ~ U(0, 15)   Lucas llega y espera 15 min, o sea esta entre L y L+15.
  M ~ U(5, 20)   Monk llega y espera 5 min, o sea esta entre M y M+5.
  L y M independientes.

Se encuentran si los dos intervalos se solapan, lo cual pasa exactamente
cuando L <= M + 5 y M <= L + 15. Ojo con la asimetria: los dos tiempos de
espera son distintos, asi que la region **no** es simetrica y no se puede
resolver con el |L - M| < c de siempre.

Es probabilidad geometrica en el plano: la conjunta es uniforme sobre el
rectangulo [0,15] x [5,20] y la probabilidad es el area de la region
favorable sobre el area del rectangulo.
"""
from __future__ import annotations

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo_2d

ID = "g2-26"
NUMERO = "2.26"

L_DESDE, L_HASTA = 0, 15
M_DESDE, M_HASTA = 5, 20
ESPERA_LUCAS = 15
ESPERA_MONK = 5

l, m = sp.symbols("l m", real=True)


def se_encuentran(li, mi):
    """Los intervalos [l, l+15] y [m, m+5] se solapan."""
    return (li <= mi + ESPERA_MONK) & (mi <= li + ESPERA_LUCAS)


def exacto() -> dict[str, sp.Expr]:
    area_total = (L_HASTA - L_DESDE) * (M_HASTA - M_DESDE)
    favorable = sp.integrate(
        sp.integrate(
            sp.Piecewise((1, se_encuentran(l, m)), (0, True)), (m, M_DESDE, M_HASTA)
        ),
        (l, L_DESDE, L_HASTA),
    )
    return {"a": sp.nsimplify(sp.simplify(favorable / area_total))}


def estimado() -> dict[str, float]:
    return {
        "a": montecarlo_2d(
            lambda rng: (rng.uniform(L_DESDE, L_HASTA), rng.uniform(M_DESDE, M_HASTA)),
            lambda li, mi: li <= mi + ESPERA_MONK and mi <= li + ESPERA_LUCAS,
        )
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    v = exacto()["a"]
    print(f"  P(se encuentran) = {v} = {float(v):.6f}")
