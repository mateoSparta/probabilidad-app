# -*- coding: utf-8 -*-
"""
Las tablas imprimibles (PLAN.md §12.2): las mismas tres de la cátedra
(fuentes/teoria/Tablas.pdf), con su formato.

  normal   Phi(z) y cuantiles habituales      guía 8
  t        cuantiles de la t de Student       guía 10
  chi2     cuantiles de la chi cuadrado       guía 10

Cada valor se calcula por dos caminos independientes (una función especial
contra una integral numérica) y se exige que coincidan al redondeo que se
imprime. Además se contrastan número a número con las tablas de la cátedra.
Si algo no coincide, el script falla y no escribe.

Escribe content/tablas/*.yaml, que no se editan a mano. Se regeneran con

    .venv/Scripts/python tools/verify/tablas.py
"""
from __future__ import annotations

import json
import re
import sys
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

import mpmath as mp
import pymupdf

mp.mp.dps = 40

RAIZ = Path(__file__).resolve().parents[2]
SALIDA = RAIZ / "content" / "tablas"
PDF_TABLAS = RAIZ / "fuentes" / "teoria" / "Tablas.pdf"

ENCABEZADO = """\
# Generado por tools/verify/tablas.py: cada valor sale de dos caminos de
# cálculo independientes, y la normal, la t y la chi cuadrado se contrastan
# además con fuentes/teoria/Tablas.pdf. No editar a mano.
"""

fallas: list[str] = []


# ------------------------------------------------------------- formato

def redondear(x, decimales: int) -> Decimal:
    """Redondeo comercial (la mitad hacia arriba) desde un valor de mpmath."""
    d = Decimal(mp.nstr(mp.mpf(x), 35, strip_zeros=False))
    return d.quantize(Decimal(1).scaleb(-decimales), rounding=ROUND_HALF_UP)


def con_coma(d: Decimal | str) -> str:
    return str(d).replace(".", ",")


def fijo(x, decimales: int) -> str:
    """'0,50399': el valor con una cantidad fija de decimales y coma."""
    return con_coma(redondear(x, decimales))


def coincidir(donde: str, a: str, b: str) -> str:
    if a != b:
        fallas.append(f"{donde}: un camino da {a} y el otro {b}")
    return a


# ---------------------------------------------------- tablas de la cátedra

def leer_catedra():
    """Las tres tablas del PDF, como diccionarios de strings con punto."""
    doc = pymupdf.open(PDF_TABLAS)

    def lineas(i):
        return [x.strip() for x in doc[i].get_text().splitlines() if x.strip()]

    # Normal: filas "0.0" a "3.5", diez columnas cada una.
    l = lineas(0)
    normal = {}
    for j, x in enumerate(l):
        if re.fullmatch(r"\d\.\d", x) and all(re.fullmatch(r"0\.\d{5}|1\.00000", v) for v in l[j + 1:j + 11]):
            for c, v in enumerate(l[j + 1:j + 11]):
                normal[f"{x}{c}"] = v
    k = l.index("Algunos cuantiles habituales")
    alfas = l[k + 2:k + 9]
    zs = l[k + 10:k + 17]
    cuantiles_normal = dict(zip(alfas, zs))

    def por_nu(i, columnas):
        l = lineas(i)
        filas = {}
        j = 0
        while j < len(l):
            v = l[j + 1:j + 1 + columnas]
            if re.fullmatch(r"\d+", l[j]) and len(v) == columnas and all(re.fullmatch(r"\d+\.\d+", x) for x in v):
                filas[int(l[j])] = v
                j += columnas + 1
            else:
                j += 1
        return filas

    return normal, cuantiles_normal, por_nu(1, 8), por_nu(2, 10)


# ------------------------------------------------------------------ tablas

def tabla_normal(catedra, cuantiles_catedra):
    filas = []
    columnas = [f"0,0{c}" for c in range(10)]
    densidad = lambda u: mp.exp(-u * u / 2) / mp.sqrt(2 * mp.pi)
    for decimo in range(36):
        fila = [con_coma(f"{decimo / 10:.1f}")]
        for c in range(10):
            z = mp.mpf(decimo) / 10 + mp.mpf(c) / 100
            a = fijo(mp.ncdf(z), 5)
            b = fijo(mp.mpf(1) / 2 + mp.quad(densidad, [0, z]), 5)
            v = coincidir(f"normal z={z}", a, b)
            oficial = catedra.get(f"{decimo / 10:.1f}{c}")
            if oficial is None:
                fallas.append(f"normal z={z}: no está en la tabla de la cátedra")
            elif oficial.replace(".", ",") != v:
                fallas.append(f"normal z={z}: da {v} y la cátedra {oficial}")
            fila.append(v)
        filas.append(fila)

    alfas = ["0.8", "0.85", "0.9", "0.95", "0.975", "0.99", "0.995"]
    fila_q = ["$z$"]
    for alfa in alfas:
        a = fijo(mp.findroot(lambda z: mp.ncdf(z) - mp.mpf(alfa), 1), 5)
        b = fijo(mp.sqrt(2) * mp.erfinv(2 * mp.mpf(alfa) - 1), 5)
        v = coincidir(f"cuantil normal {alfa}", a, b)
        oficial = cuantiles_catedra.get(alfa)
        if oficial is None or oficial.replace(".", ",") != v:
            fallas.append(f"cuantil normal {alfa}: da {v} y la cátedra {oficial}")
        fila_q.append(v)

    return {
        "id": "normal",
        "titulo": "Tabla de distribución normal",
        "guia": 8,
        "grafico": "normal",
        "recuerda": "$\\Phi(-z) = 1 - \\Phi(z)$",
        "bloques": [
            {"esquina": "$z$", "columnas": columnas, "filas": filas},
            {
                "titulo": "Algunos cuantiles habituales",
                "esquina": "$\\Phi(z)$",
                "columnas": [con_coma(a) for a in alfas],
                "filas": [fila_q],
            },
        ],
    }


def cdf_t(t, nu):
    """Camino A: con la beta incompleta regularizada."""
    t = mp.mpf(t)
    cola = mp.betainc(mp.mpf(nu) / 2, mp.mpf(1) / 2, 0, nu / (nu + t * t), regularized=True) / 2
    return 1 - cola if t >= 0 else cola


def cdf_t_integral(t, nu):
    """Camino B: integrando la densidad."""
    nu = mp.mpf(nu)
    c = mp.gamma((nu + 1) / 2) / (mp.sqrt(nu * mp.pi) * mp.gamma(nu / 2))
    return mp.mpf(1) / 2 + mp.quad(lambda u: c * (1 + u * u / nu) ** (-(nu + 1) / 2), [0, t])


def tabla_t(catedra):
    alfas = ["0.750", "0.800", "0.850", "0.900", "0.950", "0.975", "0.990", "0.995"]
    filas = []
    mp.mp.dps = 25
    for nu in list(range(1, 41)) + [50, 60, 70, 80, 90]:
        fila = [str(nu)]
        for c, alfa in enumerate(alfas):
            ra = mp.findroot(lambda t: cdf_t(t, nu) - mp.mpf(alfa), 1.5)
            rb = mp.findroot(lambda t: cdf_t_integral(t, nu) - mp.mpf(alfa), ra)
            v = coincidir(f"t nu={nu} alfa={alfa}", fijo(ra, 5), fijo(rb, 5))
            oficial = catedra[nu][c]
            if oficial.replace(".", ",") != v:
                fallas.append(f"t nu={nu} alfa={alfa}: da {v} y la cátedra {oficial}")
            fila.append(v)
        filas.append(fila)
    mp.mp.dps = 40
    return {
        "id": "t",
        "titulo": "Cuantiles de la distribución $t$ de Student",
        "guia": 10,
        "grafico": "t",
        "recuerda": "$k_{1-\\alpha} = -k_\\alpha$",
        "bloques": [
            {"esquina": "$\\nu \\backslash \\alpha$", "columnas": [con_coma(a) for a in alfas], "filas": filas},
        ],
    }


def cdf_chi2(x, nu):
    return mp.gammainc(mp.mpf(nu) / 2, 0, mp.mpf(x) / 2, regularized=True)


def cdf_chi2_integral(x, nu):
    k = mp.mpf(nu) / 2
    c = 1 / (2**k * mp.gamma(k))
    return mp.quad(lambda u: c * u ** (k - 1) * mp.exp(-u / 2), [0, x])


def tabla_chi2(catedra):
    alfas = ["0.005", "0.010", "0.025", "0.050", "0.100", "0.900", "0.950", "0.975", "0.990", "0.995"]
    filas = []
    mp.mp.dps = 25
    for nu in list(range(1, 41)) + [50, 60, 70, 80, 90]:
        fila = [str(nu)]
        for c, alfa in enumerate(alfas):
            # Camino A: bracketing sobre la gamma incompleta, que no se sale
            # de x > 0. Camino B: secante sobre la integral, desde A.
            techo = nu + 12 * mp.sqrt(2 * nu) + 30
            ra = mp.findroot(lambda x: cdf_chi2(x, nu) - mp.mpf(alfa), (mp.mpf("1e-15"), techo), solver="illinois")
            rb = mp.findroot(lambda x: cdf_chi2_integral(x, nu) - mp.mpf(alfa), (ra * mp.mpf("0.999"), ra * mp.mpf("1.001")))
            v = coincidir(f"chi2 nu={nu} alfa={alfa}", fijo(ra, 3), fijo(rb, 3))
            oficial = catedra[nu][c]
            if oficial.replace(".", ",") != v:
                fallas.append(f"chi2 nu={nu} alfa={alfa}: da {v} y la cátedra {oficial}")
            fila.append(v)
        filas.append(fila)
    mp.mp.dps = 40
    return {
        "id": "chi2",
        "titulo": "Cuantiles de la distribución $\\chi^2$",
        "guia": 10,
        "grafico": "chi2",
        "bloques": [
            {"esquina": "$\\nu \\backslash \\alpha$", "columnas": [con_coma(a) for a in alfas], "filas": filas},
        ],
    }


# ------------------------------------------------------------------ salida

def escribir(tabla: dict, orden: int) -> None:
    """YAML con una fila por renglón (en estilo de flujo, que es JSON)."""
    def q(s):
        return "'" + s.replace("'", "''") + "'" if s is not None else "null"

    lineas = [ENCABEZADO, f"id: {tabla['id']}", f"titulo: {q(tabla['titulo'])}",
              f"guia: {tabla['guia']}", f"orden: {orden}", f"grafico: {tabla['grafico']}"]
    if tabla.get("recuerda"):
        lineas.append(f"recuerda: {q(tabla['recuerda'])}")
    lineas.append("bloques:")
    for b in tabla["bloques"]:
        lineas.append(f"  - titulo: {q(b.get('titulo'))}")
        lineas.append(f"    esquina: {q(b['esquina'])}")
        lineas.append(f"    columnas: {json.dumps(b['columnas'], ensure_ascii=False)}")
        lineas.append("    filas:")
        for f in b["filas"]:
            lineas.append(f"      - {json.dumps(f, ensure_ascii=False)}")
    (SALIDA / f"{tabla['id']}.yaml").write_text("\n".join(lineas) + "\n", encoding="utf-8")


def main() -> int:
    normal, cuantiles, t, chi2 = leer_catedra()
    tablas = [tabla_normal(normal, cuantiles), tabla_t(t), tabla_chi2(chi2)]
    if fallas:
        print(f"{len(fallas)} valor(es) no coinciden:")
        for f in fallas[:40]:
            print("  ", f)
        return 1
    SALIDA.mkdir(parents=True, exist_ok=True)
    for orden, tabla in enumerate(tablas, 1):
        escribir(tabla, orden)
    celdas = sum(len(f) - 1 for t in tablas for b in t["bloques"] for f in b["filas"])
    print(f"tablas: {len(tablas)} tablas, {celdas} valores, todos por dos caminos;")
    print("        iguales número a número a las de la cátedra.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
