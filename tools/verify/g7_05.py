# -*- coding: utf-8 -*-
"""
Ejercicio 7.5 — los colectivos de la linea 61.09.

Arriban segun un Poisson de intensidad 12 por hora, o sea 1 cada 5 minutos en
promedio. Cuatro personas llegan a la parada de formas distintas y a todas se
les pregunta lo mismo: la probabilidad de esperar mas de 5 minutos.

Las cuatro respuestas son **iguales**, y ese es todo el ejercicio:

  (a) Andres llega a una hora fija.
  (b) Jemina llega un minuto despues: por incrementos estacionarios, da igual.
  (c) Matias llega a un minuto al azar entre cuatro.
  (d) Magdalena llega a una hora uniforme en toda la hora.

En (c) y (d) la hora de llegada es aleatoria pero **independiente** del
proceso, asi que condicionando a cualquier hora se obtiene lo mismo, y
promediar cosas iguales da eso mismo. Es la propiedad de falta de memoria del
proceso: no importa cuando llegues, lo que falta siempre es Exp(1/5 min).

El modelo simula los cuatro escenarios por separado, que es lo que verifica la
afirmacion en vez de asumirla.
"""
from __future__ import annotations

import random

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo

ID = "g7-05"
NUMERO = "7.5"

INTENSIDAD_POR_HORA = 12
ESPERA_MIN = 5
POR_MINUTO = sp.Rational(INTENSIDAD_POR_HORA, 60)   # 1/5


def exacto() -> dict[str, sp.Expr]:
    # P(no llega ningun colectivo en 5 minutos) = e^{-lambda * 5}
    p = sp.exp(-POR_MINUTO * ESPERA_MIN)
    return {"a": p, "b": p, "c": p, "d": p}


def _espera_desde(rng: random.Random, llegada: float) -> float:
    """Tiempo hasta el primer arribo posterior a `llegada`, en minutos."""
    t = 0.0
    while True:
        t += rng.expovariate(float(POR_MINUTO))
        if t > llegada:
            return t - llegada


def estimado() -> dict[str, float]:
    return {
        # Andres: hora fija (minuto 30)
        "a": montecarlo(lambda r: _espera_desde(r, 30.0) > ESPERA_MIN),
        # Jemina: un minuto despues
        "b": montecarlo(lambda r: _espera_desde(r, 31.0) > ESPERA_MIN),
        # Matias: minuto 32, 33, 34 o 35 equiprobable
        "c": montecarlo(
            lambda r: _espera_desde(r, 30.0 + r.choice([2, 3, 4, 5])) > ESPERA_MIN
        ),
        # Magdalena: uniforme en toda la hora
        "d": montecarlo(lambda r: _espera_desde(r, r.uniform(0, 60)) > ESPERA_MIN),
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v} = {float(v):.6f}")
