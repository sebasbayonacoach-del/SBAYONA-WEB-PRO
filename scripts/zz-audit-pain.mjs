// Comprueba si el texto de .pain-column sale cortado a 1920 (clip por overflow).
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
const fb = () => { const c = join(process.env.LOCALAPPDATA || '', 'ms-playwright'); for (const b of readdirSync(c).filter((d) => d.startsWith('chromium-')).sort().reverse()) { const e = join(c, b, 'chrome-win64', 'chrome.exe'); if (existsSync(e)) return e } return null }
const br = await chromium.launch({ executablePath: fb(), headless: true })
const p = await br.newPage({ viewport: { width: Number(process.env.ANCHO || 1920), height: 900 } })
await p.goto((process.argv[2] || 'http://127.0.0.1:4188') + '/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2200)
await p.evaluate(() => document.querySelector('.pain-section')?.scrollIntoView({ block: 'start', behavior: 'instant' }))
await p.waitForTimeout(1200)
const r = await p.evaluate(() => {
  const out = []
  for (const e of document.querySelectorAll('.pain-section *')) {
    const b = e.getBoundingClientRect()
    if (b.width < 10) continue
    const recortado = e.scrollWidth - e.clientWidth
    const cs = getComputedStyle(e)
    if (recortado > 2 && cs.overflowX !== 'visible') {
      out.push({ cls: String(e.className).slice(0, 40), tag: e.tagName.toLowerCase(), scrollW: e.scrollWidth, clientW: e.clientWidth, desborde: recortado, ovf: cs.overflowX, txt: (e.textContent || '').trim().slice(0, 45) })
    }
  }
  const cols = [...document.querySelectorAll('.pain-column, .pain-card, [class*="pain-"]')].map((e) => { const b = e.getBoundingClientRect(); return { cls: String(e.className).slice(0, 40), l: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width) } })
  return { recortados: out.slice(0, 14), cols: cols.slice(0, 18) }
})
console.log(JSON.stringify(r, null, 1))
await br.close()
