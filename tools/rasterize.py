# -*- coding: utf-8 -*-
"""
Rasteriza un PDF escaneado a PNG por pagina (PLAN.md seccion 7, paso 3).

Las resueltas de fuentes/resueltas/ son escaneos sin capa de texto: hay que
mirarlas. Este script las convierte en imagenes legibles para poder leer los
resultados pagina por pagina.

La salida va a fuentes/.raster/ (ignorada por git: pesa y se regenera).

Uso:
  npm run rasterizar -- fuentes/resueltas/guia-1
  npm run rasterizar -- "fuentes/resueltas/guia-1/GUIA 1 RES 1.pdf"
  npm run rasterizar -- fuentes/resueltas/guia-1 --dpi 200 --paginas 1-6
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pymupdf

RAIZ = Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "fuentes" / ".raster"


def parsear_paginas(spec: str | None, total: int) -> list[int]:
    """'1-6' o '3' o None -> lista de indices 0-based."""
    if not spec:
        return list(range(total))
    if "-" in spec:
        a, b = spec.split("-", 1)
        desde, hasta = int(a), int(b)
    else:
        desde = hasta = int(spec)
    return [i for i in range(desde - 1, hasta) if 0 <= i < total]


def rasterizar(pdf: Path, dpi: int, spec: str | None) -> int:
    doc = pymupdf.open(pdf)
    # Se refleja la estructura de fuentes/ sin repetir el prefijo.
    rel = pdf.relative_to(RAIZ / "fuentes").with_suffix("")
    destino = SALIDA / rel
    destino.mkdir(parents=True, exist_ok=True)

    paginas = parsear_paginas(spec, doc.page_count)
    for i in paginas:
        pix = doc[i].get_pixmap(dpi=dpi)
        salida = destino / f"p{i + 1:03d}.png"
        pix.save(salida)
    print(f"  {pdf.name}: {len(paginas)} pag -> {destino.relative_to(RAIZ)}")
    return len(paginas)


def main() -> int:
    ap = argparse.ArgumentParser(description="Rasteriza PDFs escaneados a PNG.")
    ap.add_argument("ruta", help="PDF o directorio con PDFs (relativo a la raiz del repo)")
    ap.add_argument("--dpi", type=int, default=170, help="resolucion, por defecto 170")
    ap.add_argument("--paginas", default=None, help="rango 1-based, por ejemplo 1-6")
    args = ap.parse_args()

    ruta = (RAIZ / args.ruta).resolve()
    if not ruta.exists():
        print(f"no existe: {args.ruta}", file=sys.stderr)
        return 1

    pdfs = sorted(ruta.glob("*.pdf")) if ruta.is_dir() else [ruta]
    if not pdfs:
        print(f"no hay PDFs en {args.ruta}", file=sys.stderr)
        return 1

    total = sum(rasterizar(p, args.dpi, args.paginas) for p in pdfs)
    print(f"\n  {total} paginas a {args.dpi} dpi en {SALIDA.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
