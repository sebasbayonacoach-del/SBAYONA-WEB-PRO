#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""COLOCAR · convierte la escena curated que un hueco YA pinta en su PNG del banco.

Por qué existe. El brief pide dos cosas a la vez:

  · «todos los huecos de `cinematicScene(...)` tienen su PNG correspondiente y
    están incluidos en `GENERATED_BAYONA_SCENES`», y
  · «una imagen diferente en cada sección».

Los cinco `resources-topic-*` que quedaban ya mostraban cada uno una fotografía
propia de BAYONA, pero servida desde `public/images/scenes/` con el nombre de la
escena, no con el del hueco. Copiar ESA MISMA foto al banco con el nombre exacto
del hueco cierra el primer punto sin mover el segundo: lo que ve el visitante no
cambia, y el archivo original del banco queda intacto, que es justo el
procedimiento que describe el brief («cópiala con el nombre exacto del hueco y
conserva también el archivo original del banco»).

Lo que NO hace este script: inventar fotos, ni duplicar en pantalla una imagen
que ya se estaba viendo en otra sección. Por eso exige que la escena de origen no
la pinte ningún otro canal, y lo comprueba antes de escribir nada.

Uso:
    python scripts/colocar-desde-curated.py --dry    # informa, no escribe
    python scripts/colocar-desde-curated.py          # escribe los PNG

El alta en `GENERATED_BAYONA_SCENES` se edita a mano después: este fichero no
toca código, para que el registro quede en el diff y se pueda leer.
"""
import os
import subprocess
import sys

from PIL import Image

RAIZ = os.getcwd()
BANCO = os.path.join(RAIZ, "public", "images", "bayona-generated")
CURATED = os.path.join(RAIZ, "public", "images", "scenes")
PROPORCION = 16 / 9  # el banco entero está a 1,78; la anchura exacta no es la norma

# hueco -> escena curated que ya pinta ese hueco hoy
PAREJAS = {
    "resources-topic-training": "escena-casa-terraza",
    "resources-topic-mindset": "escena-parque",
    "resources-topic-data": "escena-app-dashboard",
    "resources-topic-meditation": "escena-mansion-mar",
    "resources-topic-security": "escena-proceso-datos-premium",
    # Los tres paneles de «Servicios sueltos» de /programs: eran fotos de
    # Shopify Burst y se sustituyeron por escenas curated propias. Mismo caso
    # que los anteriores: la foto ya es correcta, falta el archivo con el
    # nombre del hueco. Ninguna de estas tres curated la pide otro canal.
    "programs-service-tecnica": "escena-parkour-gandia-tecnica",
    "programs-service-recuperacion": "escena-parkour-gandia-seguridad",
    "programs-service-rendimiento": "escena-parkour-gandia-hero",
}

# Escenas que un SEGUNDO canal pinta también. Convertir una de estas no añade
# nada: la foto ya salía en dos sitios. Se declaran aparte.
COMPARTIDAS = {"escena-app-dashboard": "/ (configurador de servicios)"}

SECO = "--dry" in sys.argv


def pintores():
    """url -> lista de canales que la piden ahora mismo."""
    salida = subprocess.run(
        ["node", "scripts/duplicados-cross-mouth.mjs", "--json"],
        capture_output=True, text=True, cwd=RAIZ, check=True,
    ).stdout
    por_url = {}
    for linea in salida.splitlines():
        if not linea.startswith("{"):
            continue
        import json
        e = json.loads(linea)
        por_url.setdefault(e["url"], []).append(e["quien"])
    return por_url


def recortar(im):
    """Recorte centrado a 16:9 usando el ANCHO NATIVO de la imagen.

    Error que evita esto: las curated son 1659x948 y el banco es 1672x941. Pedir
    1672 de ancho obligaría a ampliar, y un PNG ampliado desde 1659 sale más
    grande y más borroso que el JPG del que viene. La norma que comprueba la
    auditoría es la proporción (1,78) y que no sea el lote 1792x1024, no una
    anchura fija.
    """
    w, h = im.size
    alto = round(w / PROPORCION)
    if alto > h:  # imagen más cuadrada de 16:9: recortar por altura
        alto = h
        w = round(h * PROPORCION)
    x0, y0 = (im.size[0] - w) // 2, (im.size[1] - alto) // 2
    return im.convert("RGB").crop((x0, y0, x0 + w, y0 + alto))


usadas = pintores()
for hueco, escena in PAREJAS.items():
    origen = os.path.join(CURATED, escena + ".jpg")
    destino = os.path.join(BANCO, hueco + ".png")
    url_origen = f"/images/scenes/{escena}.jpg"
    if not os.path.exists(origen):
        print(f"  SALTADO {hueco}: no existe {escena}.jpg")
        continue
    if os.path.exists(destino):
        print(f"  SALTADO {hueco}: el PNG ya existe")
        continue
    quien = [q for q in usadas.get(url_origen, []) if hueco not in q]
    if len(quien) > 1:
        nota = f"  [compartida de verdad con {COMPARTIDAS.get(escena, ', '.join(quien))}]"
    elif len(quien) == 1 and not quien[0].startswith('config'):
        nota = f"  [AVISO: la pinta también {quien[0]} -> duplicado NUEVO]"
    else:
        nota = "  [limpia: solo la pedía este hueco]"
    with Image.open(origen) as im:
        recorte = recortar(im)
        if SECO:
            print(f"  seco     {hueco} <- {escena}.jpg ({im.size[0]}x{im.size[1]} -> {recorte.size[0]}x{recorte.size[1]}, ratio {recorte.size[0]/recorte.size[1]:.4f}){nota}")
        else:
            recorte.save(destino, optimize=True)
            print(f"  escrito  {hueco}.png  {recorte.size[0]}x{recorte.size[1]}  {os.path.getsize(destino)//1024} KB{nota}")
