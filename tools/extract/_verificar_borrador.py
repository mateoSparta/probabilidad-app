# -*- coding: utf-8 -*-
"""
Chequeo rapido de la calidad del borrador que emite guia.py.

No es parte del pipeline: es la red de seguridad del extractor. Busca los
sintomas de que la traduccion a LaTeX quedo mal y muestra algunos ejercicios
para inspeccion visual.

Uso:  .venv/Scripts/python tools/extract/_verificar_borrador.py
"""
import re
import sys
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parents[2]
BORRADOR = RAIZ / "content" / ".borrador"
BS = chr(92)

# Una macro cortada al medio: el prefijo de una macro conocida seguido de algo
# que no es letra. Sintoma de que el espaciado de macros se paso de listo.
ROTA = re.compile(
    BS + BS + r"(fra|su|subse|cu|ca|inft|lde|mathb|mathca|empt|per|bigca|bigcu)[^a-zA-Z]"
)
# Un indice abierto y nunca cerrado desbalancea las llaves.
LLAVES = re.compile(r"[{}]")


def balanceado(t: str) -> bool:
    nivel = 0
    for c in LLAVES.findall(t):
        nivel += 1 if c == "{" else -1
        if nivel < 0:
            return False
    return nivel == 0


def main() -> int:
    total = rotas = desbalanceadas = sin_traducir = con_aviso = 0
    ejemplos: list[str] = []

    for g in range(1, 13):
        f = BORRADOR / f"guia-{g}.yaml"
        if not f.exists():
            continue
        doc = yaml.safe_load(f.read_text(encoding="utf-8"))
        for e in doc["ejercicios"]:
            txt = e["enunciado"] + " " + " ".join(i["texto"] for i in e.get("items", []))
            total += 1
            if "revisar" in e:
                con_aviso += 1
            m = ROTA.search(txt)
            if m:
                rotas += 1
                if len(ejemplos) < 5:
                    ejemplos.append(f"  macro partida  {e['numero']}: {m.group(0)!r}")
            if not balanceado(txt):
                desbalanceadas += 1
                if len(ejemplos) < 5:
                    ejemplos.append(f"  llaves sin cerrar  {e['numero']}")
            if "⟨?" in txt:
                sin_traducir += 1

    print(f"  ejercicios en el borrador .... {total}")
    print(f"  con aviso de revision ........ {con_aviso}")
    print(f"  glifos sin traducir .......... {sin_traducir}")
    print(f"  macros partidas .............. {rotas}")
    print(f"  llaves desbalanceadas ........ {desbalanceadas}")
    for linea in ejemplos:
        print(linea)

    # Las macros partidas son un bug del extractor, no material a revisar.
    return 1 if rotas else 0


if __name__ == "__main__":
    sys.exit(main())
