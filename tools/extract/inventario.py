# -*- coding: utf-8 -*-
"""
Genera revision/inventario.md: el mapa completo del material disponible.

Sirve para dos cosas:
  - saber cuanto hay que hacer, por guia, y con que cobertura de resueltas
  - saber que ejercicios quedan fuera de alcance y por que

Se alimenta del borrador que emite guia.py, asi que hay que correr
`npm run extraer` antes.

Uso:  npm run inventario
"""
from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

import pymupdf
import yaml

RAIZ = Path(__file__).resolve().parents[2]
BORRADOR = RAIZ / "content" / ".borrador"
DESTINO = RAIZ / "revision" / "inventario.md"

# Verbos que delatan un ejercicio de demostracion. Es una heuristica que
# sobreestima: hay que confirmarla a mano al promover cada ejercicio.
DEMO = re.compile(r"\b(mostrar|probar|demostrar|verificar|deducir|justificar)\b", re.I)

TEMAS = {
    1: "Algebras de eventos, conteo y Laplace, probabilidad geometrica, condicional, probabilidad total, Bayes, independencia",
    2: "Variable aleatoria, funcion de distribucion, discretas/continuas/mixtas, truncamiento, vectores, conjunta y marginales",
    3: "Esperanza, esperanza condicional a un evento, varianza, covarianza, momentos",
    4: "Transformaciones, metodo de la F, cambio de variable, jacobiano, minimo y maximo, competencia de exponenciales",
    5: "Distribuciones condicionales, mezclas, Bayes para mezclas, esperanza y varianza totales",
    6: "Bernoulli, binomial, geometrica, Pascal, multinomial, hipergeometrica, perdida de memoria",
    7: "Proceso de Poisson: incrementos, tiempos de espera, superposicion, adelgazamiento, Poisson compuesto",
    8: "Normal, teorema central del limite, aproximaciones",
    9: "Estadistica (fuera de v1)",
    10: "Estadistica (fuera de v1)",
    11: "Estadistica (fuera de v1)",
    12: "Estadistica (fuera de v1)",
}


def escanear_pdf(p: Path) -> dict:
    """Clasifica un PDF en escaneado o con capa de texto."""
    doc = pymupdf.open(p)
    n = doc.page_count
    sondeo = range(min(n, 6))
    chars = sum(len(doc[i].get_text().strip()) for i in sondeo) / max(len(list(sondeo)), 1)
    return {
        "nombre": p.name,
        "paginas": n,
        "chars": round(chars),
        "escaneado": chars < 120,
    }


def tabla(filas: list[list[str]], encabezado: list[str]) -> list[str]:
    out = ["| " + " | ".join(encabezado) + " |",
           "|" + "|".join("---" for _ in encabezado) + "|"]
    for f in filas:
        out.append("| " + " | ".join(str(c) for c in f) + " |")
    return out


def main() -> int:
    L: list[str] = []
    L.append("# Inventario del material")
    L.append("")
    L.append("Generado por `tools/extract/inventario.py`. No editar a mano:")
    L.append("correr `npm run extraer && npm run inventario`.")
    L.append("")

    # ---------- guias ----------
    L.append("## Guias: ejercicios y alcance")
    L.append("")
    filas = []
    tot = Counter()
    detalle_fuera: dict[int, list[str]] = {}
    for g in range(1, 13):
        f = BORRADOR / f"guia-{g}.yaml"
        if not f.exists():
            continue
        doc = yaml.safe_load(f.read_text(encoding="utf-8"))
        ejs = doc["ejercicios"]
        sim = [e["numero"] for e in ejs if "simulacion" in e["marcas"]]
        rec = [e for e in ejs if "recomendado" in e["marcas"]]
        demo = [
            e["numero"] for e in ejs
            if e["numero"] not in sim
            and DEMO.search(e["enunciado"] + " ".join(i["texto"] for i in e.get("items", [])))
        ]
        items = sum(max(len(e.get("items", [])), 1) for e in ejs if e["en_alcance"])
        items_rec = sum(max(len(e.get("items", [])), 1) for e in rec)
        filas.append([
            g, len(ejs), len(sim), len(demo),
            len(ejs) - len(sim), items,
            f"**{len(rec)} ej / {items_rec} it**",
        ])
        detalle_fuera[g] = sim
        tot["ej"] += len(ejs)
        tot["sim"] += len(sim)
        tot["items"] += items
        tot["rec"] += len(rec)
        tot["items_rec"] += items_rec

    L += tabla(filas, ["Guia", "Ejercicios", "Simulacion", "Demostracion*",
                       "En alcance", "Items en alcance", "Nucleo recomendado"])
    L.append("")
    L.append(f"**Totales:** {tot['ej']} ejercicios, {tot['sim']} de simulacion, "
             f"{tot['items']} items en alcance. "
             f"Nucleo recomendado por la catedra: {tot['rec']} ejercicios / {tot['items_rec']} items.")
    L.append("")
    L.append("\\* La columna de demostracion es una heuristica por verbo "
             "(`mostrar`, `probar`, `verificar`...). Sobreestima: hay que "
             "confirmar cada caso al promover el ejercicio.")
    L.append("")
    L.append("### Ejercicios excluidos por simulacion")
    L.append("")
    for g, nums in sorted(detalle_fuera.items()):
        if nums:
            L.append(f"- Guia {g}: {', '.join(nums)}")
    L.append("")

    # ---------- temas ----------
    L.append("## Temas por guia")
    L.append("")
    L += tabla([[g, TEMAS[g]] for g in sorted(TEMAS)], ["Guia", "Temas"])
    L.append("")

    # ---------- resueltas ----------
    L.append("## Resueltas disponibles")
    L.append("")
    L.append("Todas son escaneos sin capa de texto: hay que rasterizarlas y "
             "leerlas (`npm run rasterizar -- fuentes/resueltas/guia-N`). "
             "Es el costo dominante del pipeline.")
    L.append("")
    filas = []
    tot_pag = 0
    for g in range(1, 13):
        d = RAIZ / "fuentes" / "resueltas" / f"guia-{g}"
        if not d.exists():
            continue
        pdfs = sorted(d.glob("*.pdf"))
        if not pdfs:
            filas.append([g, "—", 0, "sin resueltas"])
            continue
        info = [escanear_pdf(p) for p in pdfs]
        pags = sum(i["paginas"] for i in info)
        tot_pag += pags
        tipo = "escaneado" if all(i["escaneado"] for i in info) else "mixto"
        filas.append([g, ", ".join(i["nombre"].replace(".pdf", "") for i in info), pags, tipo])
    L += tabla(filas, ["Guia", "Archivos", "Paginas", "Tipo"])
    L.append("")
    L.append(f"**Total a leer visualmente: {tot_pag} paginas.**")
    L.append("")

    # ---------- examenes ----------
    L.append("## Examenes")
    L.append("")
    for sub, titulo, nota in [
        ("finales", "Parciales e integradoras 2025 (`fuentes/examenes/finales/`)",
         "Una pagina cada uno y con capa de texto limpia: transcripcion trivial. "
         "Los `*-ProbIND` son de la cursada de Industrial y quedan excluidos, "
         "pero cuidado: los parciales comunes traen las tres materias en el "
         "encabezado, asi que el filtro va por ejercicio y variante, no por archivo."),
        ("parciales", "Parciales resueltos 2017-2023 (`fuentes/examenes/parciales/`)",
         "No figuran en PLAN.md. Traen enunciado **y** resolucion, y casi todos "
         "tienen capa de texto: son material de verificacion cruzada casi gratis. "
         "Hay que confirmar que los temas de 2017-2018 sigan dentro del programa."),
    ]:
        d = RAIZ / "fuentes" / "examenes" / sub
        if not d.exists():
            continue
        L.append(f"### {titulo}")
        L.append("")
        L.append(nota)
        L.append("")
        filas = []
        for p in sorted(d.glob("*.pdf")):
            i = escanear_pdf(p)
            filas.append([i["nombre"].replace(".pdf", ""), i["paginas"],
                          "escaneado" if i["escaneado"] else "texto"])
        L += tabla(filas, ["Archivo", "Paginas", "Capa de texto"])
        L.append("")

    # ---------- avisos del extractor ----------
    L.append("## Avisos del extractor")
    L.append("")
    L.append("Ejercicios cuyo borrador necesita repaso manual antes de promoverse.")
    L.append("")
    motivos = Counter()
    filas = []
    for g in range(1, 13):
        f = BORRADOR / f"guia-{g}.yaml"
        if not f.exists():
            continue
        doc = yaml.safe_load(f.read_text(encoding="utf-8"))
        for e in doc["ejercicios"]:
            for m in e.get("revisar", []):
                motivos[m.split(":")[0]] += 1
            if "revisar" in e:
                filas.append([g, e["numero"], "; ".join(e["revisar"])])
    L += tabla([[m, n] for m, n in motivos.most_common()], ["Motivo", "Cantidad"])
    L.append("")
    L.append("<details><summary>Detalle por ejercicio</summary>")
    L.append("")
    L += tabla(filas, ["Guia", "Ejercicio", "Motivo"])
    L.append("")
    L.append("</details>")
    L.append("")

    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text("\n".join(L) + "\n", encoding="utf-8")
    print(f"  escrito {DESTINO.relative_to(RAIZ)} ({len(L)} lineas)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
