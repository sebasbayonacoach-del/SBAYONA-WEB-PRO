import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

/*
 * Guard del segundo canal de imágenes.
 *
 * Por qué existe. El plan de imágenes se servía por dos bocas distintas y solo
 * una estaba vigilada:
 *   1. `siteMedia.js` → `cinematicScene(slot)` → auditado por
 *      `scripts/auditar-huecos-imagenes.mjs`.
 *   2. Literales `url('/images/…')` dentro de los `.css` y de los `style` en
 *      línea → INVISIBLES para la auditoría anterior.
 * En 2026-09-22 la boca 1 estaba limpia y la 2 seguía pintando once JPG del lote
 * defectuoso `bayona-visuals/` en /community, /faq, /entrar y /onboarding. Un
 * plan que solo revisa el config no es un plan: es una mitad.
 *
 * Qué exige:
 *   · ninguna referencia local apunta al lote descartado `bayona-visuals/`;
 *   · toda ruta `/images/...` escrita en el código existe en `public/` y pesa > 0;
 *   · ningún literal de imagen del código fuente viene de un host externo.
 */

const RAIZ = process.cwd()
const SRC = join(RAIZ, 'src')
const EXTENSIONES = ['.css', '.js', '.jsx']

function archivosFuente(dir) {
  const out = []
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name)
    if (entrada.isDirectory()) {
      if (entrada.name === 'test') continue
      out.push(...archivosFuente(ruta))
    } else if (EXTENSIONES.some((x) => entrada.name.endsWith(x))) {
      out.push(ruta)
    }
  }
  return out
}

/** Quita comentarios para no auditar lo que el navegador no ejecuta. */
function sinComentarios(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')
}

/**
 * Excepciones nombradas y fechadas.
 *
 * No son un aforamiento: son dos casos que este guard NO puede cerrar sin
 * mentir, y prefiere dejarlos contados antes que mirar hacia otro lado.
 *
 * · `tienda-suplementos` (2026-09-22): seis fotos de producto del shop apuntan
 *   a FoodiesFeed vía `pub-…r2.dev`. Son BOLAS DE BATIDO genéricas colgadas
 *   como si fueran «whey protein BAYONA», «creatina», etc. Sustituirlas por una
 *   escena de parkour sería peor: mentaría todavía más sobre qué se compra. La
 *   solución real son fotos propias del bote o regenerar el producto, y eso
 *   depende de Sebastián (mismo bloqueo que los 6 huecos de /resources: sin
 *   créditos de generación). Lista congelada y contada abajo.
 */
const EXCEPCIONES_EXTERNAS = Object.freeze([
  'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/blueberry-smoothie-h9j79L9hWbMWBLTR6-zXX.jpg',
  'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/generated/masters/fresh-vegetables-in-midair-AbIlPiCnkYVL-XB8EQm18.jpg',
  'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/delicious-yogurt-parfait-with-fresh-berries-cJtBJzkV30_dBilB8RL6B.jpg',
  'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/fresh-smoothie-with-berries-oVzwlyxZn6V9J_WgdEdZV.jpg',
  'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/high-protein-brunch-with-poached-eggs-beans-and-bacon-DKRP6A53Y9evKXYOaTwIu.jpg',
  'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/mediterranean-chickpea-salad-FQXZ4JsOxxfAd1cbn7-CE.jpg',
])

const ARCHIVOS = archivosFuente(SRC)
const REFERENCIAS = []

for (const archivo of ARCHIVOS) {
  const cuerpo = sinComentarios(readFileSync(archivo, 'utf8'))
  const rel = relative(RAIZ, archivo).replace(/\\/g, '/')
  for (const m of cuerpo.matchAll(/['"(](\/images\/[^'")\s]+)['")]/g)) {
    REFERENCIAS.push({ archivo: rel, url: m[1], externa: false })
  }
  for (const m of cuerpo.matchAll(/https?:\/\/[^'"\s)]+\.(?:png|jpe?g|webp|avif)/gi)) {
    REFERENCIAS.push({ archivo: rel, url: m[0], externa: true })
  }
}

describe('gobernanza de las imágenes servidas por CSS y por código', () => {
  it('encuenta referencias de imagen en los ficheros de estilo y código', () => {
    // Sin esta comprobación el guard aprobaría por ceguera: un cambio de patrón
    // en el regex dejaría el test en verde sin mirar nada.
    expect(ARCHIVOS.length).toBeGreaterThan(20)
    expect(REFERENCIAS.length).toBeGreaterThan(10)
  })

  it('no sirve ningún JPG del lote descartado bayona-visuals', () => {
    const defectuosas = REFERENCIAS.filter((r) => r.url.includes('bayona-visuals/'))
    expect(
      defectuosas.map((r) => `${r.archivo} → ${r.url}`),
      'el lote de 2026-09-21 salió con una retícula de 96 px y contenido de gimnasio/comida',
    ).toEqual([])
  })

  it('no enlaza imágenes desde un host externo salvo las excepciones nombradas', () => {
    const fueraDeLista = REFERENCIAS.filter((r) => r.externa && !EXCEPCIONES_EXTERNAS.includes(r.url))
    expect(
      fueraDeLista.map((r) => `${r.archivo} → ${r.url}`),
      'una imagen externa es un enlace caliente: cae el host y la sección se queda vacía',
    ).toEqual([])

    // La lista no puede crecer de callada: si alguien añade una URL nueva y la
    // mete en EXCEPCIONES_EXTERNAS, este techo salta y hay que justificarla.
    expect(EXCEPCIONES_EXTERNAS.length).toBeLessThanOrEqual(6)
    // Y tampoco puede quedarse con entradas que ya no usa nadie.
    const vivas = new Set(REFERENCIAS.filter((r) => r.externa).map((r) => r.url))
    expect(EXCEPCIONES_EXTERNAS.filter((u) => !vivas.has(u))).toEqual([])
  })

  it('toda ruta local existe en public/ y no pesa cero', () => {
    const rotas = []
    for (const r of REFERENCIAS.filter((x) => !x.externa)) {
      const disco = join(RAIZ, 'public', r.url)
      if (!existsSync(disco)) {
        rotas.push(`${r.archivo} → ${r.url} (no existe)`)
        continue
      }
      if (statSync(disco).size === 0) rotas.push(`${r.archivo} → ${r.url} (0 bytes)`)
    }
    expect(rotas).toEqual([])
  })

  /*
   * Tercer canal: los retratos de experiencia.
   *
   * `src/config/testimonials.js` no pasa por `siteMedia` ni por un CSS, así que
   * los dos controles de arriba eran ciegos a él. Lo que este bloque PUEDE
   * comprobar sin decidir por Sebastián es lo mecánico: que cada retrato
   * declarado existe, pesa, y trae las variantes `-256` y `-960` que consume el
   * `srcset` del globo. Lo que NO puede comprobar un test es si la foto es
   * realmente la persona que firma la cita — eso está abierto en
   * `docs/TESTIMONIOS-SON-STOCK.md`.
   */
  it('cada retrato de experiencia existe y trae sus variantes de srcset', () => {
    const texto = readFileSync(join(RAIZ, 'src', 'config', 'testimonials.js'), 'utf8')
    const imagenes = [...texto.matchAll(/image:\s*['"](\/images\/[^'"]+)['"]/g)].map((m) => m[1])

    expect(imagenes.length, 'el explorador no puede quedarse ciego ante un cambio de forma').toBeGreaterThanOrEqual(10)

    const faltantes = []
    for (const url of imagenes) {
      const base = url.replace(/\.jpg$/, '')
      for (const variante of ['', '-256', '-960']) {
        const disco = join(RAIZ, 'public', `${base}${variante}.jpg`)
        if (!existsSync(disco)) {
          faltantes.push(`${url} → ${base}${variante}.jpg (no existe)`)
        } else if (statSync(disco).size === 0) {
          faltantes.push(`${base}${variante}.jpg (0 bytes)`)
        }
      }
      if (/bayona-visuals|burst\//.test(url)) {
        faltantes.push(`${url} (vive en una carpeta de banco externo)`)
      }
    }
    expect(faltantes).toEqual([])
  })

  /*
   * La regla del WebP del banco.
   *
   * `siteMedia.js` decide los anchos WebP de `bayona-generated/` por REGLA
   * (todo PNG tiene par 1600+1672), no por lista. Eso es más mantenible que 111
   * nombres, pero solo es seguro si alguien vigila que la premisa sea cierta:
   * este test es esa vigilancia. Un PNG nuevo sin derivar no rompe el build ni
   * se ve mal —simplemente vuelve a pesar 1,8 MB en vez de 200 KB—, que es la
   * clase de degradación que sube sola hasta que la página deja de cargar.
   */
  it('todo PNG del banco tiene su par WebP 1600 y 1672 en disco', () => {
    const dir = join(RAIZ, 'public', 'images', 'bayona-generated')
    const pngs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'))
    expect(pngs.length).toBeGreaterThan(100)

    const faltantes = []
    for (const nombre of pngs) {
      const base = nombre.replace(/\.png$/i, '')
      for (const ancho of [1600, 1672]) {
        const webp = join(dir, `${base}-${ancho}.webp`)
        if (!existsSync(webp)) faltantes.push(`${base}-${ancho}.webp (no existe)`)
        else if (statSync(webp).size === 0) faltantes.push(`${base}-${ancho}.webp (0 bytes)`)
      }
    }
    expect(faltantes.slice(0, 12), `faltan ${faltantes.length} variantes; derivar con scripts/derivar-webp-banco.py`).toEqual([])
  })
})
