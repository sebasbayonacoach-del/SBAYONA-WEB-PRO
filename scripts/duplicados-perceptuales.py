#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""SONDA · repeticiones por APARIENCIA, no por bytes.

Por qué existe. `duplicados-cross-mouth.mjs` agrupa por sha256. Eso encuentra la
misma foto con otro nombre solo cuando los bytes coinciden. En cuanto una escena
se reconvertida de JPG a PNG para colocarla en el banco con el nombre de su hueco
—que es justo lo que manda el brief—, la huella cambia y el sha256 declara «única»
una fotografía que el ojo ve repetida. Sin este paso, convertir a PNG sería una
forma de engañar al control.

Compara hashes perceptuales (phash 64 bits + dhash) entre todas las imágenes que
algún canal del sitio pinta, y agrupa las que están a distancia <= 10. Se pasa la
lista por stdin desde el paso de Node, así que la resolución de canales sigue
viviendo en un solo sitio.

Uso:
    node scripts/duplicados-cross-mouth.mjs --json | python scripts/duplicados-perceptuales.py
    UMBRAL=8 node ... | python ...      # más estricto
    STRICT=1 ...                        # sale 1 si hay grupo con 2+ entradas
"""
import json
import os
import sys
from collections import defaultdict

import imagehash
from PIL import Image

RAIZ = os.getcwd()
UMBRAL = int(os.environ.get("UMBRAL", "10"))

entradas = []
for linea in sys.stdin:
    linea = linea.strip()
    if not linea.startswith("{"):
        continue
    try:
        entradas.append(json.loads(linea))
    except json.JSONDecodeError:
        continue

if not entradas:
    print("SIN ENTRADAS: el paso de Node no emitió JSON (¿falta --json?).", file=sys.stderr)
    sys.exit(2)

# Una imagen por archivo, con todas las secciones que la piden.
por_url = {}
for e in entradas:
    url = e["url"]
    if url.startswith("http"):
        continue
    disco = os.path.join(RAIZ, "public", url.lstrip("/").split("?")[0])
    if not os.path.exists(disco):
        continue
    por_url.setdefault(url, {"disco": disco, "quienes": set()})
    por_url[url]["quienes"].add(f'{e.get("pagina", "?")} · {e["quien"]}')

firmas = {}
for url, d in por_url.items():
    try:
        with Image.open(d["disco"]) as im:
            firmas[url] = (imagehash.phash(im), imagehash.dhash(im))
    except Exception as exc:  # noqa: BLE001 - informar el agujero, no callarlo
        print(f"  no se pudo leer {url}: {exc}", file=sys.stderr)

urls = sorted(firmas)
grupos = []
usadas = set()
for i, a in enumerate(urls):
    if a in usadas:
        continue
    grupo = [a]
    usadas.add(a)
    for b in urls[i + 1:]:
        if b in usadas:
            continue
        dist = (firmas[a][0] - firmas[b][0]) + (firmas[a][1] - firmas[b][1])
        if dist / 2 <= UMBRAL:
            grupo.append(b)
            usadas.add(b)
    if len(grupo) > 1:
        grupos.append((grupo, dist))

print(f"imágenes pintadas comparadas: {len(urls)}")
print(f"grupos de la misma fotografía por apariencia: {len(grupos)}")
mismo_lugar = 0
for grupo, _ in grupos:
    paginas = set()
    todas = set()
    for u in grupo:
        print(f"\n  {os.path.basename(u)}")
        for q in sorted(por_url[u]["quienes"]):
            print(f"      {q}")
            paginas.add(q.split(" · ")[0])
        todas |= por_url[u]["quienes"]
    if len(paginas) < len(todas):
        mismo_lugar += 1
        print("    ^ alguna se repite DENTRO de la misma página")

print(f"\ngrupos con repetición dentro de una misma página: {mismo_lugar}")
if os.environ.get("STRICT") and mismo_lugar:
    sys.exit(1)
