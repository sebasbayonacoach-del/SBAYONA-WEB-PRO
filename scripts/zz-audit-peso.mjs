// Peso visual de los elementos que compiten en la primera pantalla (1920).
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
const fb = () => { const c = join(process.env.LOCALAPPDATA || '', 'ms-playwright'); for (const b of readdirSync(c).filter((d) => d.startsWith('chromium-')).sort().reverse()) { const e = join(c, b, 'chrome-win64', 'chrome.exe'); if (existsSync(e)) return e } return null }
const br = await chromium.launch({ executablePath: fb(), headless: true })
const p = await br.newPage({ viewport: { width: Number(process.env.ANCHO || 1920), height: 900 } })
await p.goto((process.argv[2] || 'http://127.0.0.1:4188') + '/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2500)
const r = await p.evaluate(() => {
  const sel = ['.hero-module h1', '.hero-subheadline', '.hero-kicker', '.gold-button', '.hero-action-option', '.arrival-bonus-layer', '.companion', '.companion-orb', '.whatsapp-button', '.universe-scale', '.navbar', '.vision-section h2', '.free-value h2', '.pain-section h2']
  return sel.map((s) => {
    const e = document.querySelector(s)
    if (!e) return [s, null]
    const cs = getComputedStyle(e)
    const b = e.getBoundingClientRect()
    return [s, { fs: cs.fontSize, fw: cs.fontWeight, color: cs.color.slice(0, 20), bg: cs.backgroundColor.slice(0, 20), x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width) }]
  })
})
for (const [s, v] of r) console.log(s.padEnd(22), v ? JSON.stringify(v) : '-')
await br.close()
