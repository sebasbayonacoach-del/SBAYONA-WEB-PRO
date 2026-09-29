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
for (const ruta of A.slice(1)) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(A[0] + ruta, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2200)
  const m = await p.evaluate(() => {
    const secs = [...document.querySelectorAll('section:not(section section)')].filter((s) => s.offsetHeight > 0)
    // `querySelector` no mira al propio elemento: cuando la clase de revelado va
    // PUESTA EN la sección (lo normal en esta web), la sección contaba como sin
    // revelado y el porcentaje salía a la mitad. `matches` o `querySelector`.
    const conReveal = secs.filter((s) => s.matches('[class*="reveal"]') || s.querySelector('[class*="reveal"]')).length
    const familias = {}
    for (const el of document.querySelectorAll('[class*="reveal"]')) {
      for (const c of el.classList) if (c.includes('reveal')) familias[c] = (familias[c] || 0) + 1
    }
    return { total: secs.length, conReveal, familias }
  })
  console.log(`${ruta.padEnd(18)} secciones ${String(m.total).padStart(2)} · con revelado ${String(m.conReveal).padStart(2)} (${Math.round((100 * m.conReveal) / m.total)}%) · ${Object.entries(m.familias).map(([k, v]) => `${k}×${v}`).join(' ')}`)
  await p.close()
}
await browser.close()
