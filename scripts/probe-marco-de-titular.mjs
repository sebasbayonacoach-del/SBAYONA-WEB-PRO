// Qué contenedor fija el `left` del titular en cada ruta. Se usa para alinear el
// héroe de la portada con el resto del sitio: la corrección tiene que ser el
// mismo marco, no un píxel inventado que solo cuadre en un ancho.
//
// Uso: MSYS_NO_PATHCONV=1 ANCHO=1590 node scripts/probe-marco-de-titular.mjs http://127.0.0.1:4188
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

const BASE = process.argv.slice(2).find((a) => a.startsWith('http')) || 'http://127.0.0.1:4188'
const ANCHO = Number(process.env.ANCHO || 1590)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: ANCHO, height: 900 } })

for (const ruta of ['/', '/about', '/programs', '/faq', '/resources', '/community', '/shop', '/app', '/onboarding', '/parkour-academy', '/plan/fuerza', '/plan/elite']) {
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(1800)
  const r = await p.evaluate(() => {
    const h = document.querySelector('main h1')
    if (!h) return { error: 'sin h1' }
    const cadena = []
    for (let n = h; n && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n)
      cadena.push({
        quien: n.tagName.toLowerCase() + (n.className ? '.' + String(n.className).split(' ')[0] : ''),
        left: Math.round(n.getBoundingClientRect().left),
        width: Math.round(n.getBoundingClientRect().width),
        max: s.maxWidth,
        pad: s.paddingLeft,
        margin: s.marginLeft,
      })
    }
    // El marco es el ancestro MÁS EXTERNO que aún tiene left > 0: ese es el que
    // decide el hueco. Los de dentro solo heredan.
    const conHueco = cadena.filter((c) => c.left > 0)
    return { h1left: cadena[0].left, marco: conHueco[conHueco.length - 1], prof: cadena.length }
  })
  if (r.error) console.log(`${ruta.padEnd(12)} ${r.error}`)
  else
    console.log(
      `${ruta.padEnd(12)} h1@${String(r.h1left).padStart(3)}  marco=${r.marco?.quien ?? 'ninguno'} ` +
        `left=${r.marco?.left} width=${r.marco?.width} max=${r.marco?.max} pad=${r.marco?.pad} margin=${r.marco?.margin}`,
    )
}

await browser.close()
