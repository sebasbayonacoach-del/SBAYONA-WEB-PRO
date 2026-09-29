# El banco pesaba 1,8 MB por escena (2026-09-22)

## Cómo se descubrió

Al cerrar los últimos nueve huecos con su PNG con nombre de hueco, la auditoría
dejó de poder mentir por omisión: el contador de peso del banco daba `0 MB` con
111 archivos, porque dividía **el número de ficheros** entre 1024 en vez de sumar
bytes. Arreglado (`auditar-huecos-imagenes.mjs`), el número real es **203 MB**, y
`dist/` sale a **329 MB**.

Añadí a `probe-imagenes-que-cargan.mjs` la suma de `content-length` por ruta y
luego la independenticé en `scripts/peso-de-imagenes.mjs`. Medido sobre el build
de producción, en escritorio:

| Ruta | Antes | Después |
| --- | --- | --- |
| `/resources` | **41,2 MB** | 4,4 MB |
| `/programs` | **26,1 MB** | 3,7 MB |
| `/` | **19,2 MB** | 4,9 MB |
| `/community` | — | 2,7 MB |
| `/faq` | — | 0,8 MB |
| 5 rutas medidas juntas | ~86,5 MB (las tres de arriba) | **16,4 MB** |

No es un detalle de despliegue: 41 MB en una página son una página que en un
móvil de gama media no llega a pintarse, y las imágenes son el LCP de casi todas
las rutas.

## La causa

`public/images/bayona-generated/` son PNG. Cada escena generada se guardó como
PNG (~1,8 MB) y el sitio **ya tenía** un canal WebP, pero solo miraba `burst/`:

```js
function burstFileSlug(media) {
  const match = media.src.match(/\/images\/burst\/([^/?#]+)\.jpg/i)   // <- solo burst
```

`SceneBackground.jsx` monta `<picture>` con `<source type="image/webp">` cuando
`burstWebpSrcSet()` encuentra variantes en disco, y su propio comentario dice
«mismo `sizes`, `loading`, `alt`, `decoding` y clases: **cero cambio visual**».
El mecanismo estaba; lo que faltaba era que viera el banco.

## Qué se hizo

1. **`scripts/derivar-webp-banco.py`** — genera `-1600.webp` y `-1672.webp` de
   los 111 PNG (q80, el mismo ajuste que usa `burst/`). 222 archivos.
2. **`siteMedia.js`** — `burstFileSlug()` pasa a ser `archivoDeMedio()`, que
   devuelve también la carpeta, y una sola función `webpAnchosDe()` decide los
   anchos. `burstWebpSrcSet()` y `mediaHeroUrls()` consumen esa función, así que
   el preload del LCP y lo que pinta el CSS siguen saliendo del mismo sitio (si
   difieren, el navegador descarga el héroe dos veces: está advertido en el
   fichero).
   **No se tocó ningún componente.**
3. **Cuatro reglas CSS** que apuntaban al PNG de 1,8 MB pasan a su WebP gemelo
   (`community.css` ×2, `faq.css` ×2).
4. **`src/test/imageSourceGovernance.test.js`** — regla nueva: todo PNG del banco
   tiene que tener sus dos WebP. La regla del código es «todos los tienen», sin
   lista de 111 nombres; el test es lo que impide que la premisa se rompa en
   silencio cuando alguien añada una escena.

## Por qué 1600 y 1672, y no el 960/1600 de Burst

`media-scenes.css` resuelve el fondo con `image-set(... 1x, ... 2x)`, y
`image-set()` elige **por densidad de pantalla, no por ancho de caja**. Un
portátil a 1440 px y DPR 1 se queda con el 1x: con 960 sería ampliar un 50 % y
el hero saldría borroso. Con 1600 de 1x no hay ampliación en ningún escritorio
normal, y 1672 (el ancho nativo del banco) cubre las pantallas densas.

Verificado mirándolo, no suponiéndolo: `artifacts/tmp/nitidez-webp.png`, con el
hero de `/resources` y la sección de tramos de `/faq` a 1440 tras el cambio.

## Lo que sigue bajando en PNG, y por qué no lo toco

Cinco descargas, una por ruta, 1,3–2,1 MB cada una:

| Ruta | Archivo | Por qué no le llega el WebP |
| --- | --- | --- |
| `/resources` | `resources-challenge.png` | `Resources.jsx:801` → `poster={...src}` de un `<video>` |
| `/programs` | `programs-service-tecnica.png` | `Programs.jsx:552` → mismo caso, `poster=` |
| `/` | `plan-fuerza-poster.png`, `home-pillar-read.png` | consumidores fuera de `sceneBackgroundProps` |
| `/community` | `community-group.png` | idem |
| `/parkour-academy` | `parkour-hero.png` (2146 KB) | medido el 22-09 a las 20:04 con `probe-imagenes-que-cargan.mjs DETALLE=parkour-hero`: se piden **las tres** (`png`, `-1600.webp` y `-1672.webp`) en la misma visita, o sea tres consumidores distintos de la misma fotografía. No lo produce este trabajo: `parkour-hero` ya estaba registrado antes |

El atributo `poster` de un vídeo no admite `srcset` ni `image-set()`: es una URL
o nada. Señalarlo al `-1600.webp` es una línea por sitio y recortaría ~8 MB, pero
es un cambio en componentes, que el brief prohíbe expresamente. Queda señalado
con el fichero y la línea, no improvisado.

## Herramientas que deja esto

- `scripts/peso-de-imagenes.mjs` — bytes reales por ruta, separando PNG de WebP,
  y lista los PNG que se descargan aunque exista su gemelo (que es exactamente el
  defecto que encontraba). `STRICT=1` + `UMBRAL_MB` para cerrarlo como puerta.
- `scripts/derivar-webp-banco.py` — re-derivado idempotente (`--solo-faltantes`).
- El contador de peso de `auditar-huecos-imagenes.mjs`, que hasta ahora mentía.
