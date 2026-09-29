#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""DERIVAR · variantes WebP 960 y 1600 de cada PNG del banco propio.

Por qué existe. `/resources` pedía **41,2 MB** en imágenes medidas en el build
de producción (`probe-imagenes-que-cargan.mjs`, que ahora suma content-length).
No es un problema de este trabajo: `bayona-generated/` son 111 PNG de ~1,8 MB
porque cada escena generada se guardó como PNG, y el sitio solo tenía canal
WebP para `burst/`. En un móvil de gama media eso no es una página lenta, es
una página que no llega a cargarse.

El sitio YA tiene el mecanismo: `SceneBackground.jsx` monta `<picture>` con
`<source type="image/webp">` cuando `burstWebpSrcSet()` encuentra variantes en
disco, y su propio comentario dice «mismo sizes, loading, alt, decoding y
clases: cero cambio visual». Este script produce esas variantes para el banco;
`siteMedia.js` deja de preguntar «¿es burst?» y pasa a preguntar «¿en qué
carpeta está y qué pares tiene?».

Regla que se firma con esto: **todo** PNG de `bayona-generated/` tiene par
`-1600.webp` y `-1672.webp`. Por eso se puede expresar como regla y no como
lista de 111 nombres, y por eso `imageSourceGovernance.test.js` la comprueba:
si alguien añade un PNG sin derivar, el test lo pide.

Por qué 1600 y 1672, y no el 960/1600 que usa `burst/`. Los fondos de sección se
entregan por `image-set(... 1x, ... 2x)` en `SceneBackground.jsx`, y eso elige
por DENSIDAD DE PANTALLA, no por ancho de caja. Un portátil a 1440 px y DPR 1 se
quedaría con el 1x: con 960 sería un upscale del 50 % y el hero saldría blando.
Con 1600 de 1x no hay upscale en ningún escritorio razonable, y 1672 (el ancho
del banco) cubre las pantallas densas. Los dos pesan ~10x menos que el PNG.
El par es fijo para que `siteMedia.js` lo pueda derivar del nombre sin consultar
disco, que es lo que permite no tocar ningún componente.

Uso:
    python scripts/derivar-webp-banco.py --dry
    python scripts/derivar-webp-banco.py
    python scripts/derivar-webp-banco.py --solo-faltantes   # no re-escribe
"""
import os
import sys

from PIL import Image

RAIZ = os.getcwd()
BANCO = os.path.join(RAIZ, "public", "images", "bayona-generated")
PARES = (1600, 1672)
CALIDAD = 80  # el mismo q80 que usan las variantes ya existentes de burst/
SIN_CAMBIAR = "--solo-faltantes" in sys.argv
SECO = "--dry" in sys.argv

pngs = sorted(f for f in os.listdir(BANCO) if f.lower().endswith(".png"))
creados = 0
ahorro_total = 0
for nombre in pngs:
    ruta = os.path.join(BANCO, nombre)
    base = nombre[:-4]
    with Image.open(ruta) as im:
        original = os.path.getsize(ruta)
        im = im.convert("RGB")
        for ancho in PARES:
            destino = os.path.join(BANCO, f"{base}-{ancho}.webp")
            if os.path.exists(destino) and (SIN_CAMBIAR or SECO):
                continue
            alto = round(im.size[1] * ancho / im.size[0])
            variante = im.resize((ancho, alto), Image.LANCZOS)
            if SECO:
                creados += 1
                continue
            variante.save(destino, "WEBP", quality=CALIDAD, method=6)
            creados += 1
            ahorro_total += original - os.path.getsize(destino)

if SECO:
    print(f"seco: {creados} variantes por escribir en {len(pngs)} PNG")
else:
    print(
        f"{creados} variantes WebP escritas desde {len(pngs)} PNG · "
        f"ahorro por petición ≈ {ahorro_total / 1024 / 1024:.0f} MB"
    )

