# BAYONA — archivo de copias (23-09-2026)

Nada de esto se ha borrado. Son **movimientos**, todos reversibles.

El único árbol de trabajo de la web es:

```
C:\Users\sevis\Documents\Qoder\2026-09-19\73d38e0b\bayona-live
```

Publicado en `https://bayona-web.netlify.app`.

## Censo completo de C: (instrumento: `find`, calibrado)

Siete rutas contenían `src/config/siteMedia.js`, o sea siete copias del código:

| # | Ruta | src | tests | banco | veredicto |
| --- | --- | --- | --- | --- | --- |
| 1 | `Documents\Qoder\2026-09-19\73d38e0b\bayona-live` | 448 | 109 | 334 | **LA BUENA** — compila, 750 pruebas verdes, publicada hoy |
| 2 | `…\bayona-live\.snapshot-preagentes` | — | — | — | rollback del 21-09, 4,5 MB. Se queda donde está |
| 3 | `…\bayona-live\.snapshot-anot-20260922-1005` | — | — | — | rollback del 22-09, 4,6 MB. Se queda donde está |
| 4 | `Documents\Codex\2026-07-17\ho\bayona-3d-arena-lab` | 195 | 50 | 0 | obsoleta → `copias-codex/`. Tenía 1 pieza única |
| 5 | `…\ho\bayona-3d-copy - COPIA 1` | 175 | 48 | 0 | obsoleta → `copias-codex/`. Tenía 2 piezas únicas |
| 6 | `…\ho\bayona-3d-copy - COPIA ORIGINAL` | 175 | 48 | 0 | obsoleta → `copias-codex/` |
| 7 | `SEVISIONARI\04 Proyectos\02_NEGOCIOS\BAYONA_Web\02_CONTEXTOS_MAESTROS_ARENA.IA\…\BAYONA_AGENTE_1_EXPORT\WEB` | 175 | 48 | 0 | obsoleta, pero **vive dentro de tu bóveda y no la he tocado** |

Fuera del código: `01_BAYONA-WEB_VERSIONES\OTROS_ARCHIVOS\paquete-home-planes` es otro
proyecto (no tiene `siteMedia.js`), y `00_TODAS_LAS_WEBS\01…09` son solo fichas `.md`
que explican lo que ya se borró el 20-09.

## Qué hay en cada carpeta de este archivo

- `copias-codex/` — los tres árboles viejos de Codex (1,36 GB, con su `.git` intacto:
  `bayona-3d-arena-lab` tiene 2 commits y 11 ficheros sin commitear).
- `builds-huerfanos/` — `dist-a2`, `dist-pk`, `dist-pm`, `dist-verify` (847 MB). Eran
  salidas de `vite build` antiguas; ningún script ni test las lee (solo las mencionan
  dos docs en prosa). El `dist/` actual **no** se ha movido.
- `respaldos-zip/RESTORE-bayona-live-20260920.zip` — 44 MB, foto del árbol del 20-09.
- `stub-BAYONA-vacio/` — lo único que quedaba de `C:\Users\sevis\BAYONA`: un
  `node_modules` vacío. El repo real con git se borró el 20-09; su historia está en
  `SEVISIONARI\04 Proyectos\02_NEGOCIOS\BAYONA_Web\00_TODAS_LAS_WEBS\respaldo-home-bayona-20260920.bundle`
  (126 MB), que **no se ha tocado**.
- `piezas-unicas/` — ver abajo.

## Las tres piezas que NO existen en la buena

Comparadas por ruta relativa `src/…` contra `bayona-live`. Están cableadas (las
referencian otros ficheros), así que son funciones vivas que nunca llegaron:

- `ImmersiveChrome.jsx` — la capa "immersive overhaul": navbar guiada por scroll,
  raíl de sección y firmas visuales por tramo. Solo en la copia 4.
- `PaseBayona.jsx` + `PaseBayona.test.jsx` — el componente del pase de socio con su
  prueba. En las copias 4 y 5.

No las he movido a `bayona-live` a propósito: meter un componente ajeno en el árbol
publicado hoy es un cambio de código, no una limpieza de copias. Si las quieres, se
portan una a una con build y tests detrás.

`CustomCursor.jsx` parecía única pero no lo está: en la buena vive en
`src/engine/effects/CustomCursor.jsx`, reubicada.

## Cómo deshacer

Cada carpeta se mueve de vuelta a su ruta original con `mv`. Las rutas de origen
están en la tabla de arriba.
