# -*- coding: utf-8 -*-
"""
Ejercicio 2.1 — cuales de estas funciones son variables aleatorias.

Omega = {1,...,6} con el algebra A = {vacio, {1,3,5}, {2,4,6}, Omega}.

X es variable aleatoria respecto de A cuando la preimagen de cualquier
intervalo esta en A. Con un algebra tan chica eso equivale a algo muy
concreto: X tiene que ser **constante en cada atomo** de A, o sea constante
en los impares y constante en los pares. Si no, la preimagen de algun
intervalo parte un atomo y no pertenece a A.

Se verifica calculando las preimagenes de verdad, no razonando: se recorren
todos los subconjuntos que X puede inducir y se chequea que esten en A.

No hay Monte Carlo porque no hay nada aleatorio que simular.
"""
from __future__ import annotations

ID = "g2-01"
NUMERO = "2.1"

OMEGA = (1, 2, 3, 4, 5, 6)
ALGEBRA = {
    frozenset(),
    frozenset({1, 3, 5}),
    frozenset({2, 4, 6}),
    frozenset(OMEGA),
}

FUNCIONES = {
    # (a) X(w) = w
    "a": lambda w: w,
    # (b) X(w) = 1{w es par}
    "b": lambda w: 1 if w % 2 == 0 else 0,
    # (c) X(w) = 1{w en {1,4}}
    "c": lambda w: 1 if w in (1, 4) else 0,
}


def es_variable_aleatoria(X) -> bool:
    """
    Chequea que toda preimagen {w : X(w) <= t} pertenezca al algebra.
    Alcanza con los t que son valores de X: entre dos valores consecutivos la
    preimagen no cambia.
    """
    for t in sorted({X(w) for w in OMEGA}):
        preimagen = frozenset(w for w in OMEGA if X(w) <= t)
        if preimagen not in ALGEBRA:
            return False
    return True


def exacto() -> dict[str, str]:
    salida = {}
    for clave, X in FUNCIONES.items():
        salida[clave] = "si" if es_variable_aleatoria(X) else "no"
        # Se deja constancia de la preimagen que rompe, para el YAML.
        if salida[clave] == "no":
            for t in sorted({X(w) for w in OMEGA}):
                pre = frozenset(w for w in OMEGA if X(w) <= t)
                if pre not in ALGEBRA:
                    salida[clave + "_contraejemplo"] = (
                        "{X <= " + str(t) + "} = " + str(sorted(pre))
                    )
                    break
    return salida


def estimado() -> dict[str, float]:
    return {}


TOLERANCIA = 0.0

if __name__ == "__main__":
    for k, v in exacto().items():
        print(f"  {k}: {v}")
