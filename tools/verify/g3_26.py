# -*- coding: utf-8 -*-
"""
Ejercicio 3.26 — cuantos individuos hacen falta para estimar una proporcion.

Se eligen n individuos al azar y se usa la proporcion de fumadores de la
muestra para estimar la de la poblacion. Se pide el n que garantice que el
error no pase de 0.01 con probabilidad al menos 0.95.

La proporcion muestral tiene media p y varianza p(1-p)/n. Con **Chebyshev**:

    P(|p_gorro - p| >= 0.01) <= var / 0.01^2 = p(1-p) / (n * 0.0001)

y como p(1-p) <= 1/4 para todo p, la cota en el caso peor es 2500/n. Pedir que
sea <= 0.05 da n >= 50000.

Que sea Chebyshev importa: la guia 3 todavia no tiene el teorema central del
limite, y por el TCL (guia 8) el n sale mucho mas chico, 9604. El enunciado
del contenido lo aclara para que no quede ambiguo, y aca se calculan los dos
numeros para dejar la diferencia a la vista.

Sobre la verificacion: la respuesta es un n, y un Monte Carlo no puede
devolver un n. Asi que el segundo camino no es simular sino **chequear la
minimalidad**: que con n la cota alcance y con n-1 no. Eso fija el valor sin
depender del despeje simbolico. El Monte Carlo se usa aparte, nada mas para
confirmar que la desigualdad de Chebyshev efectivamente se cumple.
"""
from __future__ import annotations

import math
import random

import sympy as sp

ID = "g3-26"
NUMERO = "3.26"

ERROR = sp.Rational(1, 100)        # 0.01
CONFIANZA = sp.Rational(95, 100)   # 0.95
VARIANZA_PEOR = sp.Rational(1, 4)  # el maximo de p(1-p)


def cota_chebyshev(n) -> sp.Expr:
    """La cota de Chebyshev para P(|p_gorro - p| >= ERROR) en el caso peor."""
    return sp.Rational(VARIANZA_PEOR) / (sp.Integer(n) * ERROR**2)


def exacto() -> dict[str, sp.Expr]:
    fallo = 1 - CONFIANZA   # 0.05

    n = sp.ceiling(VARIANZA_PEOR / (fallo * ERROR**2))

    # Minimalidad: con n alcanza y con n-1 no. Es el segundo camino.
    assert cota_chebyshev(n) <= fallo, f"con n={n} la cota no alcanza"
    assert cota_chebyshev(n - 1) > fallo, f"con n-1={n - 1} la cota ya alcanzaba"

    # Para comparar: el n que daria el TCL, con z el cuantil 0.975.
    z = sp.Rational(196, 100)
    n_tcl = sp.ceiling((z / ERROR) ** 2 * VARIANZA_PEOR)

    return {
        "a": n,
        "cota_con_n": cota_chebyshev(n),
        "n_por_tcl": n_tcl,
    }


def estimado() -> dict[str, float]:
    """
    No simula la respuesta: simula la desigualdad. Con p = 1/2 (el caso peor)
    y un n chico, se compara la probabilidad real de errar contra la cota de
    Chebyshev para ese n. Tiene que quedar por debajo.
    """
    return {}


def comprobar_chebyshev(n: int = 2500, p: float = 0.5, error: float = 0.02) -> tuple:
    """Devuelve (probabilidad simulada, cota de Chebyshev) para ese n."""
    rng = random.Random(20260408)
    repeticiones = 200_000
    sd = math.sqrt(p * (1 - p) / n)
    malas = sum(1 for _ in range(repeticiones) if abs(rng.gauss(p, sd) - p) >= error)
    simulada = malas / repeticiones
    cota = p * (1 - p) / (n * error**2)
    return simulada, cota


TOLERANCIA = 0.0

if __name__ == "__main__":
    e = exacto()
    print(f"  n por Chebyshev = {e['a']}   (cota con ese n: {e['cota_con_n']})")
    print(f"  n por TCL       = {e['n_por_tcl']}")
    sim, cota = comprobar_chebyshev()
    print(f"  control: P(errar) simulada = {sim:.5f}  <=  cota de Chebyshev = {cota:.5f}")
    assert sim <= cota, "la desigualdad de Chebyshev no se cumplio en la simulacion"
    print("  la desigualdad se cumple")
