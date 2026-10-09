# -*- coding: utf-8 -*-
r"""
Tabla de glifos de los PDF de la guia (parte1.pdf / parte2.pdf).

Los PDF estan compilados con LaTeX usando fuentes cuyo mapeo glifo->Unicode
no es el estandar, asi que la capa de texto sale ilegible. Por ejemplo
`PpAq " rwPA ppwq` es en realidad `P(A) = \sum_{w \in A} p(w)`.

El mapeo es sistematico y depende de la FUENTE del span, no del caracter:
en CMR10 (texto corriente) una `p` es una `p`, pero en TeX-matha10 una `p`
es un parentesis que abre. Por eso la sustitucion se aplica span por span.

Las tablas se derivaron enumerando todos los glifos distintos de cada fuente
sobre parte1.pdf y resolviendo cada uno por contexto.
"""

# Fuentes de texto corriente: no se tocan.
FUENTES_TEXTO = ("CMR", "CMBX", "CMTI", "CMTT", "CMSL", "SFRM")

# Fuentes de matematica: se les aplica sustitucion.
FUENTES_MATE = ("TeX-matha", "TeX-mathx", "TeX-mathb", "CMMI", "CMSY", "MSBM")

# Fuentes de simbolos de dificultad (glosario de la guia, pag. 2).
FUENTES_MARCA = ("MarVoSym", "manfnt", "phaistos")

# --- TeX-matha: el grueso de operadores, relaciones y delimitadores ---
MATHA = {
    "p": "(",      "q": ")",      "t": r"\{",     "u": r"\}",
    "r": "[",      "s": "]",      "|": r"\mid",
    "“": "=",      "‰": r"\ne",   "«": r"\approx", "„": r"\sim",
    "`": "+",      "´": "-",      "¨": r"\cdot",  "ˆ": r"\times",  "{": "/",
    "ă": "<",      "ą": ">",      "ď": r"\le",    "ě": r"\ge",
    "P": r"\in",   "Ă": r"\subset",
    "X": r"\cap",  "Y": r"\cup",  "H": r"\emptyset",
    "Ñ": r"\to",   "8": r"\infty", "?": r"\sqrt",
    "˚": "^{*}",   "1": "'",      "K": r"\perp",
}

# --- TeX-mathx: operadores grandes y delimitadores extensibles ---
# Los delimitadores extensibles (partes de llaves multilinea de un caso
# por trozos) no tienen traduccion inline util: quedan como desconocidos
# a proposito, para que el borrador los marque y se revisen a mano.
MATHX = {
    "ř": r"\sum",  "ÿ": r"\sum",
    "ş": r"\int",  "ż": r"\int",
    "ź": r"\prod",
    "Ş": r"\bigcap", "Ť": r"\bigcup",
    "(": r"\left(",
}

# --- Letras de pizarron y caligraficas ---
MSBM = {"R": r"\mathbb{R}", "N": r"\mathbb{N}",
        "Z": r"\mathbb{Z}", "Q": r"\mathbb{Q}"}
CMSY = {"A": r"\mathcal{A}", "E": r"\mathcal{E}", "N": r"\mathcal{N}",
        "F": r"\mathcal{F}", "B": r"\mathcal{B}"}

# --- Marcas de dificultad (glosario, pag. 2 de parte1.pdf) ---
MARCAS = {
    ("MarVoSym", "!"):  "recomendado",     # "Alto. Estos ejercicios son importantes."
    ("MarVoSym", "Ï"):  "simulacion",      # requiere computadora -> FUERA DE ALCANCE
    ("MarVoSym", "h"):  "muy_dificil",
    ("manfnt", "\x7f"): "curva_peligrosa",
    ("phaistos", "A"):  "siga_siga",
    ("phaistos", "c"):  "siga_siga",
    ("TeX-mathb", "O"): "solo_audaces",
}

# --- Acentos: LaTeX los emite como acento suelto + letra base ---
ACENTOS = [
    ("´ı", "í"), ("´a", "á"), ("´e", "é"), ("´o", "ó"), ("´u", "ú"),
    ("´A", "Á"), ("´E", "É"), ("´I", "Í"), ("´O", "Ó"), ("´U", "Ú"),
    ("˜n", "ñ"), ("˜N", "Ñ"), ("¨u", "ü"),
]

LIGADURAS = [("ﬁ", "fi"), ("ﬂ", "fl"), ("ﬀ", "ff"), ("ﬃ", "ffi"), ("ﬄ", "ffl")]

TABLAS = {"TeX-matha": MATHA, "TeX-mathx": MATHX, "MSBM": MSBM, "CMSY": CMSY}

# Nombres de las macros que este modulo puede emitir, mas las que agrega el
# extractor. Se usan para separar una macro de la letra que la sigue: `\inA`
# no es `\in A`, y por regex pura son indistinguibles sin esta lista.
# Ordenadas de mas larga a mas corta para que `\infty` gane sobre `\in`.
def _macros() -> list[str]:
    import re as _re
    nombres = {"frac", "ldots"}
    for tabla in TABLAS.values():
        for valor in tabla.values():
            nombres.update(_re.findall(r"\\([a-zA-Z]+)", valor))
    return sorted(nombres, key=len, reverse=True)


MACROS = _macros()


def familia(fuente: str) -> str:
    """CMR10 -> CMR, TeX-matha7 -> TeX-matha."""
    return fuente.rstrip("0123456789")


def es_mate(fuente: str) -> bool:
    return familia(fuente) in FUENTES_MATE


def es_marca(fuente: str) -> bool:
    return familia(fuente) in FUENTES_MARCA


def decodificar(texto: str, fuente: str) -> tuple[str, list[str]]:
    """
    Traduce un span segun su fuente.
    Devuelve (texto_traducido, [glifos_desconocidos]).
    CMMI (italicas matematicas) y el texto corriente pasan tal cual.
    """
    fam = familia(fuente)
    tabla = TABLAS.get(fam)
    if tabla is None:
        return texto, []

    salida, desconocidos = [], []
    for c in texto:
        if c in tabla:
            salida.append(tabla[c])
        elif not c.strip():
            salida.append(c)
        else:
            salida.append(f"⟨?{fam}:{c}⟩")
            desconocidos.append(f"{fam}:{c}")
    return "".join(salida), desconocidos


def normalizar_texto(t: str) -> str:
    """Acentos y ligaduras del texto corriente."""
    for a, b in LIGADURAS:
        t = t.replace(a, b)
    for a, b in ACENTOS:
        t = t.replace(a, b)
    return t
