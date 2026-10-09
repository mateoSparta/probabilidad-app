# -*- coding: utf-8 -*-
"""
Ejercicio 2.22 — punto uniforme sobre un semicirculo.

Lambda = {(x,y) : x^2 + y^2 <= 4, x >= 0}: el semicirculo derecho de radio 2.
Uniforme quiere decir densidad constante 1/area, con area = 2*pi.

Las marginales NO son uniformes aunque la conjunta si lo sea: cada una sale
de integrar la conjunta sobre la otra variable, y el ancho de la region
cambia con la variable. Y X e Y no son independientes, porque el soporte no
es un rectangulo: saber que X esta cerca de 2 restringe a Y a estar cerca
de 0.

El exacto integra con sympy. El Monte Carlo sortea por rechazo dentro del
cuadrado que contiene al semicirculo, que es la forma directa de simular una
uniforme sobre una region cualquiera.
"""
from __future__ import annotations

import sympy as sp

from comun import TOL_MONTECARLO, montecarlo_2d, montecarlo_densidad

ID = "g2-22"
NUMERO = "2.22"

R = 2
AREA = sp.pi * R**2 / 2

x, y = sp.symbols("x y", real=True)


def exacto() -> dict[str, sp.Expr]:
    # (a) P(|Y| < X). En polares |y| < x con x >= 0 es el sector
    # -pi/4 < theta < pi/4, o sea media de las dos mitades del semicirculo.
    # Se calcula igual por integracion, para no depender del argumento.
    alto = sp.sqrt(R**2 - x**2)
    p_a = sp.simplify(
        sp.integrate(
            sp.integrate(1 / AREA, (y, -sp.Min(alto, x), sp.Min(alto, x))), (x, 0, R)
        )
    )

    # (b) marginales
    f_X = sp.simplify(2 * sp.sqrt(R**2 - x**2) / AREA)         # 0 <= x <= 2
    ancho = sp.sqrt(R**2 - y**2)
    f_Y = sp.simplify(ancho / AREA)                            # -2 <= y <= 2

    # (c) Independencia: se compara el producto de las marginales contra la
    # conjunta en un punto del soporte. Si difieren, no son independientes.
    producto = sp.simplify(f_X.subs(x, 1) * f_Y.subs(y, 1))
    conjunta = sp.simplify(1 / AREA)
    assert sp.simplify(producto - conjunta) != 0, "el producto coincide con la conjunta"

    return {
        "a": p_a,
        # claves b1..b4: el orden de los checkpoints en el YAML
        "b1": sp.simplify(f_X.subs(x, 0)),
        "b2": sp.simplify(f_X.subs(x, 1)),
        "b3": sp.simplify(f_Y.subs(y, 0)),
        "b4": sp.simplify(f_Y.subs(y, 1)),
        # control: las marginales tienen que integrar 1
        "int_fX": sp.simplify(sp.integrate(f_X, (x, 0, R))),
        "int_fY": sp.simplify(sp.integrate(f_Y, (y, -R, R))),
        # control del inciso (c)
        "c_producto_marginales": producto,
        "c_conjunta": conjunta,
    }


def _punto(rng):
    """Rechazo dentro del rectangulo [0,2] x [-2,2]."""
    px = rng.uniform(0, R)
    py = rng.uniform(-R, R)
    return (px, py) if px * px + py * py <= R * R else None


def _coordenada(cual: int):
    """Sortea un punto del semicirculo por rechazo y devuelve una coordenada."""

    def sortear(rng) -> float:
        while True:
            p = _punto(rng)
            if p is not None:
                return p[cual]

    return sortear


def estimado() -> dict[str, float]:
    return {
        "a": montecarlo_2d(_punto, lambda px, py: abs(py) < px),
        # Las marginales se estiman por ventana; ver montecarlo_densidad.
        # x = 0 es el borde del soporte: la ventana va de un solo lado.
        "b1": montecarlo_densidad(_coordenada(0), 0, lado="derecha"),
        "b2": montecarlo_densidad(_coordenada(0), 1),
        "b3": montecarlo_densidad(_coordenada(1), 0),
        "b4": montecarlo_densidad(_coordenada(1), 1),
    }


TOLERANCIA = TOL_MONTECARLO

if __name__ == "__main__":
    for clave, v in exacto().items():
        print(f"  {clave}: {v} = {float(v):.6f}")
