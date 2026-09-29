// Barrido: borde derecho del muelle fijo vs borde izquierdo de la columna.
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
function fb() { const c = join(process.env.LOCALAPPDATA || '', 'ms-playwright'); for (const b of readdirSync(c).filter((d) => d.startsWith('chromium-')).sort().reverse()) { const e = join(c, b, 'chrome-win64', 'chrome.exe'); if (existsSync(e)) return e } return null }
const BASE = process.argv[2] || 'http://127.0.0.1:4188'
const browser = await chromium.launch({ executablePath: fb(), headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
console.log('ancho | columnaL | chipR | burbujaR | whatsappL | badgeL | desbordeChip | desbordeBurbuja')
for (const ancho of [1100, 1200, 1280, 1360, 1440, 1590, 1720, 1920, 2560]) {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  const m = await page.evaluate(() => {
    const q = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return b.width < 2 ? null : { l: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width) } }
    return {
      col: q('.hero-layout'),
      chip: q('.arrival-bonus-layer'),
      bub: q('.companion') || q('[class*="companion-bubble"]'),
      wa: q('.whatsapp-button'),
      badge: q('.universe-scale'),
    }
  })
  const colL = m.col ? m.col.l : '-'
  console.log([ancho, colL, m.chip && m.chip.r, m.bub && m.bub.r, m.wa && m.wa.l, m.badge && m.badge.l,
    m.chip && m.col ? m.chip.r - m.col.l : '-', m.bub && m.col ? m.bub.r - m.col.l : '-'].join(' | '))
}
await browser.close()
