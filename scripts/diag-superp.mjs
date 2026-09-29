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
const A = process.argv.slice(2)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
for (const spec of A.slice(1)) {
  const [ruta, sel] = spec.split('::')
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(A[0] + ruta, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2400)
  await p.getByText('RECLAMAR', { exact: false }).first().click({ timeout: 2500 }).catch(() => {})
  const rango = await p.evaluate(() => {
    const s = document.querySelector('.sticky-stage')
    if (!s) return null
    const r = s.getBoundingClientRect()
    return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }
  })
  if (!rango) { console.log(`${ruta}: sin sticky-stage`); await p.close(); continue }
  let peor = 0
  let detalle = ''
  for (const frac of [0.2, 0.5, 0.8]) {
    await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), rango.top + rango.h * frac - 200)
    await p.waitForTimeout(1100)
    const r = await p.evaluate((s) => {
      const els = [...document.querySelectorAll(s)]
      const grupos = new Map()
      for (const el of els) {
        if (Number(getComputedStyle(el).opacity) <= 0.5) continue
        const b = el.getBoundingClientRect()
        const k = `${Math.round(b.top / 8)}:${Math.round(b.left / 8)}`
        grupos.set(k, (grupos.get(k) || 0) + 1)
      }
      return grupos.size ? Math.max(...grupos.values()) : 0
    }, sel)
    if (r > peor) { peor = r; detalle = `fase ${frac}` }
  }
  console.log(`${ruta}: ${peor > 1 ? 'SUPERPUESTOS ' + peor + ' (' + detalle + ')' : 'ok (uno activo por posición)'}`)
  await p.close()
}
await browser.close()
