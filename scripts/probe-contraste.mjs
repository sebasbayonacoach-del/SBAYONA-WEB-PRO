// Contraste REAL de los titulares, medido sobre píxeles renderizados.
//
// Por qué existe esta versión: la primera medía la luminancia del `<img>` cruda y
// multiplicaba por un factor estimado del velo. Al cambiar a mano el degradado del
// héroe, los números salieron IDÉNTICOS: la sonda no veía ninguna de las capas que
// se superponen al fondo (velos, degradados, canvas, `backdrop-filter`), así que
// servía para asustarse y no para decidir.
//
// Ahora: se captura la pantalla recortada a la caja del titular, se reinyecta como
// data-URL, se pinta en un canvas y se separan los píxeles del texto (los que
// coinciden con el color computado del titular) del fondo. La ratio WCAG se
// calcula entre el color del texto y la luminancia media del fondo real.
// Umbral: 4,5 para texto normal y 3,0 para grande (≥24 px o ≥18,66 px en negrita),
// que es lo que exige WCAG 1.4.3 para titulares.
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-contraste.mjs [baseUrl] [/ruta ...]
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function findBrowser() {
  const cache = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  if (cache && existsSync(cache)) {
    for (const b of readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
      const exe = join(cache, b, 'chrome-win64', 'chrome.exe')
      if (existsSync(exe)) return exe
    }
  }
  return null
}

const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => a.startsWith('http')) || 'http://localhost:4179'
import { exigirRutas } from './rutas-de-auditoria.mjs'
const LISTA = exigirRutas(ARGV)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
let malos = 0

for (const ruta of LISTA) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2400)
  await p.getByText('RECLAMAR', { exact: false }).first().click({ timeout: 2200 }).catch(() => {})
  const alto = await p.evaluate(() => document.documentElement.scrollHeight)
  const vistos = new Map()
  for (let y = 0; y < alto - 400; y += 700) {
    await p.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), y)
    await p.waitForTimeout(320)
    const candidatos = await p.evaluate(() => {
      const out = []
      // Cuerpo además de titulares: el umbral ya se decide por tamaño y peso
      // (línea ~103), así que medir `p`/`li` con el mismo WCAG es lo que falta
      // para ver los grises pequeños sobre foto, que son los que se escapan.
      for (const h of document.querySelectorAll(
        'main h1, main h2, main h3, main p, main li, main dd, main figcaption, main small, main label, main td, main th',
      )) {
        const b = h.getBoundingClientRect()
        if (b.width < 60 || b.height < 16) continue
        if (b.top < 80 || b.bottom > innerHeight - 16) continue
        const c = getComputedStyle(h)
        if (Number(c.opacity) < 0.6) continue
        out.push({
          texto: h.textContent.trim().slice(0, 30),
          // Que sea el texto y el ratio no dice QUÉ regla hay que tocar. Sin
          // identidad de elemento la lista de 19 de la home era un enigma.
          sel:
            h.tagName.toLowerCase() +
            (typeof h.className === 'string' && h.className.trim()
              ? '.' + h.className.trim().split(/\s+/).slice(0, 2).join('.')
              : ''),
          caja: { x: b.x, y: b.y, width: b.width, height: b.height },
          color: c.color,
          fs: parseFloat(c.fontSize),
          fw: Number(c.fontWeight) || 400,
        })
      }
      return out
    })
    for (const cand of candidatos) {
      const png = await p.screenshot({ clip: cand.caja })
      const b64 = png.toString('base64')
      /*
       * AZCARROME, 21-09: hasta aquí el color del texto se sacaba con
       * `color.match(/[\d.]+/g)` y se dividía entre 255. Para un
       * `color(srgb 0.968 0.96 0.945 / 0.85)` eso da 0,97 en lugar de 247: la
       * sonda creía que el rótulo de `.free-value-eyebrow` era casi negro y
       * denunciaba ratio 3,13 cuando es blanco al 85 % (ratio real ~5,3). Los
       * `color(srgb …)` los escribe así Chrome cuando el CSS usa
       * `color-mix(… , transparent)`, o sea TODOS los rótulos del atelier. Se
       * parsea bien y se compone el alfa sobre el fondo medido, que es lo que
       * el navegador pinta.
       */
      const fg = parseColor(cand.color)
      const medida = await p.evaluate(async ({ b64, fg }) => {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await img.decode()
        const cv = document.createElement('canvas')
        cv.width = img.naturalWidth
        cv.height = img.naturalHeight
        const ctx = cv.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)
        const d = ctx.getImageData(0, 0, cv.width, cv.height).data
        // El píxel pintado del glifo es el color YA compuesto sobre el fondo.
        const br = fg.r * fg.a + 255 * (1 - fg.a)
        const bg2 = fg.g * fg.a + 255 * (1 - fg.a)
        const bb = fg.b * fg.a + 255 * (1 - fg.a)
        let n = 0
        let sr = 0
        let sg = 0
        let sb = 0
        let glifos = 0
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 250) continue
          const cerca = Math.abs(d[i] - br) + Math.abs(d[i + 1] - bg2) + Math.abs(d[i + 2] - bb) < 90
          if (cerca) { glifos += 1; continue }
          n += 1
          sr += d[i]
          sg += d[i + 1]
          sb += d[i + 2]
        }
        if (!n || !glifos) return null
        return { bgR: sr / n, bgG: sg / n, bgB: sb / n, glifosPct: (100 * glifos) / (n + glifos) }
      }, { b64, fg })
      if (!medida) continue
      const lt = lum(fg.r * fg.a + medida.bgR * (1 - fg.a), fg.g * fg.a + medida.bgG * (1 - fg.a), fg.b * fg.a + medida.bgB * (1 - fg.a))
      const lb = lum(medida.bgR, medida.bgG, medida.bgB)
      const ratio = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05)
      const umbral = cand.fs >= 24 || (cand.fs >= 18.66 && cand.fw >= 700) ? 3 : 4.5
      if (ratio < umbral) {
        const k = `"${cand.texto}" ratio=${ratio.toFixed(2)} (umbral ${umbral}) fondo=${lb.toFixed(3)} ${cand.color} [${cand.sel}]`
        if (!vistos.has(k)) vistos.set(k, y)
      }
    }
  }
  malos += vistos.size
  if (vistos.size) {
    console.log(`\n${ruta}: ${vistos.size} textos por debajo de su umbral`)
    for (const [k, y] of vistos) console.log(`  ${k}  (scroll ${y})`)
  } else {
    console.log(`${ruta}: todos los textos por encima de su umbral`)
  }
  await p.close()
}
console.log(`\nTOTAL: ${malos}`)
await browser.close()

function lum(r, g, b) {
  const f = (v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/**
 * `rgb()`/`rgba()` vienen en 0-255; `color(srgb …)`/`color(display-p3 …)` en
 * 0-1 y con el alfa tras una barra. Confundirlos (hacer `0.968/255`) convierte
 * un blanco roto en negro y dispara el ratio a la basura.
 */
function parseColor(color) {
  const s = String(color).trim()
  const func = s.match(/^color\(\s*(srgb|display-p3)\s+([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i)
  if (func) {
    const canal = (v) => (v.endsWith('%') ? (parseFloat(v) / 100) * 255 : parseFloat(v) * 255)
    return {
      r: canal(func[2]),
      g: canal(func[3]),
      b: canal(func[4]),
      a: func[5] === undefined ? 1 : parseFloat(func[5]),
    }
  }
  const nums = (s.match(/[\d.]+%?/g) || []).map((v) =>
    v.endsWith('%') ? (parseFloat(v) / 100) * 255 : Number(v),
  )
  if (nums.length >= 3) {
    return { r: nums[0], g: nums[1], b: nums[2], a: nums.length >= 4 ? nums[3] : 1 }
  }
  return { r: 255, g: 255, b: 255, a: 1 }
}
