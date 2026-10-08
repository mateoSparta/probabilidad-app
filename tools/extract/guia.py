# -*- coding: utf-8 -*-
r"""
Extractor de enunciados de las guias (PLAN.md seccion 7, paso 1).

Lee fuentes/guias/parte*.pdf y emite un BORRADOR por guia en
content/.borrador/guia-N.yaml.

La salida es derivada: no se edita a mano. Si algo sale mal se arregla el
extractor y se vuelve a correr (`npm run extraer`). El contenido definitivo
vive en content/guias/guia-N/ejercicios/*.yaml y se promueve desde el
borrador revisandolo a mano (PLAN.md seccion 7, paso 2).

Que resuelve:
  - split por ejercicio: el numero va en negrita, pero las referencias
    cruzadas tambien, asi que se filtra exigiendo numeracion monotona
  - split por item (a) (b) (c)
  - marcas de dificultad del glosario, incluida la de simulacion, que
    queda fuera de alcance
  - traduccion de la matematica a LaTeX via tools/extract/glifos.py
  - fracciones, subindices y superindices, por geometria

Uso:  npm run extraer
"""
from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

import pymupdf
import yaml

sys.path.insert(0, str(Path(__file__).parent))
import glifos  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
SALIDA = RAIZ / "content" / ".borrador"

NUM_EJ = re.compile(r"^\d{1,2}\.\d{1,2}$")
LETRA_ITEM = re.compile(r"^[a-z]$")

# Una barra de fraccion es una linea horizontal fina y corta. Las lineas
# largas del PDF son reglas de pagina, no fracciones.
ALTO_MAX_BARRA = 1.5
ANCHO_MAX_BARRA = 60.0
ANCHO_MIN_BARRA = 1.0

MARCA_FRAC = "\x00FRAC{}\x00"

# Una macro de LaTeX pegada a la letra que la sigue se parsea como otra macro:
# `\inA` no es `\in A`. Hay que separarlas, pero sin cortar una macro legitima
# (`\infty` empieza con `in`), asi que se mira el token completo y se lo parte
# solo si no es una macro conocida.
RE_TOKEN_MACRO = re.compile(r"\\([a-zA-Z]+)")
MACROS_CONOCIDAS = frozenset(glifos.MACROS)


def _separar_macro(m: re.Match[str]) -> str:
    nombre = m.group(1)
    if nombre in MACROS_CONOCIDAS:
        return m.group(0)
    for mac in glifos.MACROS:  # de la mas larga a la mas corta
        if nombre.startswith(mac):
            return "\\" + mac + " " + nombre[len(mac):]
    return m.group(0)


@dataclass
class Ejercicio:
    numero: str
    guia: int
    paginas: list[int] = field(default_factory=list)
    marcas: set[str] = field(default_factory=set)
    partes: list[list] = field(default_factory=list)  # [destino, texto]
    desconocidos: set[str] = field(default_factory=set)
    item_actual: str | None = None

    def agregar(self, texto: str) -> None:
        destino = self.item_actual or "_enunciado"
        if self.partes and self.partes[-1][0] == destino:
            self.partes[-1][1] += texto
        else:
            self.partes.append([destino, texto])

    def cola(self) -> str:
        return self.partes[-1][1] if self.partes else ""

    def recortar_cola(self) -> str:
        """
        Saca el espacio final y lo devuelve, para que el que cierra un indice
        lo reponga despues de la llave: el espacio separa palabras y va afuera.
        """
        if not self.partes:
            return ""
        txt = self.partes[-1][1]
        sobra = txt[len(txt.rstrip()):]
        self.partes[-1][1] = txt.rstrip()
        return sobra


def barras_de_fraccion(pg) -> list:
    barras = []
    for dr in pg.get_drawings():
        r = dr["rect"]
        if r.height <= ALTO_MAX_BARRA and ANCHO_MIN_BARRA < r.width < ANCHO_MAX_BARRA:
            barras.append(r)
    return barras


def detectar_fracciones(spans: list[dict], barras: list) -> dict:
    """
    Asocia spans a barras de fraccion.

    TeX dibuja la barra tan ancha como el mas ancho entre numerador y
    denominador, y los centra. Entonces se exige que el span este contenido
    horizontalmente en la barra y se lo clasifica por el lado en que cae su
    linea de base. Es una condicion fuerte: el texto corriente no la cumple.
    """
    asign: dict[int, tuple[int, str]] = {}
    for bi, bar in enumerate(barras):
        for si, s in enumerate(spans):
            x0, _, x1, _ = s["bbox"]
            if x0 < bar.x0 - 1.2 or x1 > bar.x1 + 1.2:
                continue
            oy = s["origin"][1]
            alcance = 1.6 * s["size"]
            if bar.y0 - alcance < oy <= bar.y0:
                asign[si] = (bi, "num")
            elif bar.y0 < oy < bar.y0 + alcance:
                asign[si] = (bi, "den")
    return asign


def nivel_de_indice(s: dict, base_y: float, tam_cuerpo: float) -> str:
    """Devuelve base, sub o sup segun el tamano del span y su linea de base."""
    if s["size"] >= 0.85 * tam_cuerpo:
        return "base"
    dy = s["origin"][1] - base_y
    if dy > 0.4:
        return "sub"
    if dy < -0.4:
        return "sup"
    return "base"


def procesar_pagina(pg, num_pag: int, estado: dict) -> None:
    """Recorre una pagina y va llenando estado['ejercicios']."""
    spans: list[dict] = []
    lineas: list[list[int]] = []
    for b in pg.get_text("dict")["blocks"]:
        for linea in b.get("lines", []):
            idxs = []
            for s in linea["spans"]:
                idxs.append(len(spans))
                spans.append(s)
            if idxs:
                lineas.append(idxs)

    frac = detectar_fracciones(spans, barras_de_fraccion(pg))
    bufs: dict[int, dict[str, list[str]]] = {}
    emitidas: set[int] = set()

    # El numero de pagina vive en el margen; no es parte de ningun enunciado.
    margen_sup = 55.0
    margen_inf = pg.rect.height - 45.0

    for n_linea, idxs in enumerate(lineas):
        ss = [spans[i] for i in idxs]
        tam_cuerpo = max(s["size"] for s in ss)
        base_y = max(ss, key=lambda s: s["size"])["origin"][1]

        if not (margen_sup < base_y < margen_inf):
            continue
        # Numero de pagina: linea de un solo span, un entero suelto, en
        # letra chica y arriba de todo. Un numerador de fraccion tambien es
        # una linea de un solo digito, pero nunca cae en esa franja.
        if (
            len(ss) == 1
            and ss[0]["text"].strip().isdigit()
            and ss[0]["size"] < 9
            and base_y < 115
        ):
            continue

        # Union con la linea anterior: LaTeX corta palabras con guion, y
        # cuando no hay guion el corte equivale a un espacio.
        ej_abierto: Ejercicio | None = estado["actual"]
        if n_linea > 0 and ej_abierto is not None and ej_abierto.partes:
            cola = ej_abierto.cola()
            if cola.endswith("-"):
                ej_abierto.partes[-1][1] = cola[:-1]
            elif cola and not cola.endswith((" ", "(", "{", "_", "^")):
                ej_abierto.agregar(" ")

        indice_abierto: str | None = None
        prev: dict | None = None

        for i in idxs:
            s = spans[i]
            bruto = s["text"]
            fam = glifos.familia(s["font"])
            ej: Ejercicio | None = estado["actual"]

            # --- marcas de dificultad ---
            clave = (fam, bruto.strip())
            if clave in glifos.MARCAS:
                if ej is not None:
                    ej.marcas.add(glifos.MARCAS[clave])
                prev = s
                continue
            if glifos.es_marca(s["font"]):
                prev = s
                continue

            # --- numero de ejercicio (negrita y monotono) ---
            if s["font"].startswith("CMBX") and NUM_EJ.match(bruto.strip()):
                g, n = (int(x) for x in bruto.strip().split("."))
                if n == estado["ultimo"].get(g, 0) + 1:
                    estado["ultimo"][g] = n
                    nuevo = Ejercicio(numero=bruto.strip(), guia=g, paginas=[num_pag])
                    estado["ejercicios"].append(nuevo)
                    estado["actual"] = nuevo
                    indice_abierto = None
                    prev = s
                    continue
                # si no es monotono es una referencia cruzada: sigue como texto

            if ej is None:
                prev = s
                continue
            if num_pag not in ej.paginas:
                ej.paginas.append(num_pag)

            # --- letra de item: (a) (b) (c) ---
            if s["font"].startswith("CMBX") and LETRA_ITEM.match(bruto.strip()):
                if ej.cola().rstrip().endswith("("):
                    ej.partes[-1][1] = ej.cola().rstrip()[:-1]
                    ej.item_actual = bruto.strip()
                    estado["saltar_parentesis"] = True
                    indice_abierto = None
                    prev = s
                    continue
            if estado.get("saltar_parentesis"):
                estado["saltar_parentesis"] = False
                if bruto.lstrip().startswith(")"):
                    bruto = bruto.lstrip()[1:]
                    if not bruto:
                        prev = s
                        continue

            # --- fracciones ---
            if i in frac:
                bi, lado = frac[i]
                t, desc = glifos.decodificar(bruto, s["font"])
                ej.desconocidos.update(desc)
                bufs.setdefault(bi, {"num": [], "den": []})[lado].append(t.strip())
                if bi not in emitidas:
                    emitidas.add(bi)
                    ej.agregar(MARCA_FRAC.format(bi))
                prev = s
                continue

            # --- subindices y superindices ---
            # Un span de solo espacios no define nivel propio: si lo hiciera,
            # el espacio fino que TeX mete antes de una fraccion abriria un
            # superindice espurio.
            nivel = (
                (indice_abierto or "base")
                if not bruto.strip()
                else nivel_de_indice(s, base_y, tam_cuerpo)
            )
            if nivel != indice_abierto:
                if indice_abierto is not None:
                    ej.agregar("}" + ej.recortar_cola())
                if nivel == "sub":
                    ej.agregar("_{")
                elif nivel == "sup":
                    ej.agregar("^{")
                indice_abierto = None if nivel == "base" else nivel

            # --- espacio deducido de la geometria ---
            if prev is not None and nivel == "base":
                hueco = s["bbox"][0] - prev["bbox"][2]
                if hueco > 0.05 * tam_cuerpo and not bruto.startswith(" "):
                    ej.agregar(" ")

            t, desc = glifos.decodificar(bruto, s["font"])
            ej.desconocidos.update(desc)
            ej.agregar(t)
            prev = s

        if indice_abierto is not None and estado["actual"] is not None:
            abierto = estado["actual"]
            abierto.agregar("}" + abierto.recortar_cola())

    # resolver los marcadores de fraccion emitidos en esta pagina
    if bufs:
        for ej in estado["ejercicios"]:
            for parte in ej.partes:
                txt = parte[1]
                if "\x00" not in txt:
                    continue
                for bi, lados in bufs.items():
                    marca = MARCA_FRAC.format(bi)
                    if marca in txt:
                        num = "".join(lados["num"]) or "?"
                        den = "".join(lados["den"]) or "?"
                        txt = txt.replace(marca, "\\frac{" + num + "}{" + den + "}")
                parte[1] = txt


def limpiar(t: str) -> str:
    t = glifos.normalizar_texto(t)
    # El PDF trae la omega como U+2126 (signo ohm) y pegada a la palabra que
    # sigue, porque la mete en el mismo span. Se normaliza a omega griega y
    # se la separa: es un simbolo suelto, asi que separarla es seguro.
    t = t.replace("Ω", "Ω")
    t = re.sub("Ω(?=[a-záéíóúñ])", "Ω ", t)
    t = RE_TOKEN_MACRO.sub(_separar_macro, t)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\s+([,.;:])", r"\1", t)
    t = re.sub(r"\(\s+", "(", t)
    t = re.sub(r"\s+([)\]])", r"\1", t)
    t = re.sub(r"(_|\^)\{\}", "", t)
    t = re.sub(r"\s*\.\s*\.\s*\.", r"\\ldots", t)
    return t.strip()


def a_dict(ej: Ejercicio) -> dict:
    enunciado = "".join(t for d, t in ej.partes if d == "_enunciado")
    items: list[dict] = []
    for destino, txt in ej.partes:
        if destino == "_enunciado":
            continue
        if items and items[-1]["id"] == destino:
            items[-1]["texto"] += txt
        else:
            items.append({"id": destino, "texto": txt})

    todo_el_texto = enunciado + " " + " ".join(i["texto"] for i in items)

    revisar: list[str] = []
    for g in sorted(ej.desconocidos):
        revisar.append("glifo sin traducir: " + g)
    if not items and re.search(r"\(\s*[a-z]\s*\)", enunciado):
        revisar.append("parece tener items pero no se detectaron")
    if "{?}" in todo_el_texto:
        revisar.append("fraccion incompleta")
    # Los limites de un operador grande (sumatoria, interseccion, integral)
    # se colocan arriba y abajo del simbolo, no a su derecha: la deteccion
    # por linea de base los ubica mal y hay que acomodarlos a mano.
    if re.search(r"\\(sum|prod|int|bigcap|bigcup)", todo_el_texto):
        revisar.append("revisar los limites del operador grande")

    d: dict = {
        "numero": ej.numero,
        "paginas": ej.paginas,
        "marcas": sorted(ej.marcas),
        "en_alcance": "simulacion" not in ej.marcas,
        "enunciado": limpiar(enunciado),
    }
    if items:
        d["items"] = [{"id": i["id"], "texto": limpiar(i["texto"])} for i in items]
    if revisar:
        d["revisar"] = revisar
    return d


def extraer(pdf: Path, guias: range) -> dict[int, list[dict]]:
    doc = pymupdf.open(pdf)
    estado: dict = {"ejercicios": [], "actual": None, "ultimo": {}}
    for i, pg in enumerate(doc):
        procesar_pagina(pg, i + 1, estado)

    por_guia: dict[int, list[dict]] = {g: [] for g in guias}
    for ej in estado["ejercicios"]:
        if ej.guia in por_guia:
            por_guia[ej.guia].append(a_dict(ej))
    return por_guia


def main() -> int:
    SALIDA.mkdir(parents=True, exist_ok=True)
    trabajos = [
        (RAIZ / "fuentes" / "guias" / "parte1.pdf", range(1, 9)),
        (RAIZ / "fuentes" / "guias" / "parte2.pdf", range(9, 13)),
    ]
    total_ej = total_rev = 0
    for pdf, guias in trabajos:
        if not pdf.exists():
            print("  ! falta " + str(pdf))
            continue
        for g, ejs in sorted(extraer(pdf, guias).items()):
            if not ejs:
                continue
            rev = sum(1 for e in ejs if "revisar" in e)
            fuera = sum(1 for e in ejs if not e["en_alcance"])
            destino = SALIDA / f"guia-{g}.yaml"
            doc = {
                "_generado_por": "tools/extract/guia.py -- NO EDITAR A MANO",
                "guia": g,
                "fuente": str(pdf.relative_to(RAIZ)).replace("\\", "/"),
                "ejercicios": ejs,
            }
            with destino.open("w", encoding="utf-8") as f:
                yaml.safe_dump(doc, f, allow_unicode=True, sort_keys=False, width=100)
            print(
                f"  guia {g:2d}: {len(ejs):3d} ejercicios  "
                f"({fuera} fuera de alcance, {rev} a revisar)"
            )
            total_ej += len(ejs)
            total_rev += rev
    print(f"\n  total: {total_ej} ejercicios, {total_rev} con avisos de revision")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
