import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
function findBrowser() {
  const cache = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  for (const b of readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
    const exe = join(cache, b, 'chrome-win64', 'chrome.exe')
    if (existsSync(exe)) return exe
  }
  return null
}
const [BASE, RUTA, SEL] = process.argv.slice(2)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(BASE + RUTA, { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2600)
// El bono de llegada bloquea el scroll y tapa el fotograma: sin cerrarlo, la
// captura sale siempre con el modal encima.
if (process.env.DISMAR) {
  await p.getByText(process.env.DISMAR, { exact: false }).first().click({ timeout: 3000 }).catch(() => {})
  await p.waitForTimeout(800)
}
const top = await p.evaluate((s) => {
  const el = document.querySelector(s)
  return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : -1
}, SEL)
console.log('top', top)
if (top >= 0) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.max(0, top - 120))
  // 2,2 s: las entradas por `view()` y los borrados de `clip-path` necesitan
  // asentarse, o se captura el titular a media tinta.
  await p.waitForTimeout(2200)
  // El nombre sale del selector, no de la ruta: así dos secciones de la misma
  // página no se pisan el fichero.
  const nombre = SEL.replace(/[^a-z0-9]/gi, '').slice(-18)
  await p.screenshot({ path: `artifacts/latest/seccion-${nombre}.png` })
  console.log(`guardado seccion-${nombre}.png`)
}
await browser.close()
