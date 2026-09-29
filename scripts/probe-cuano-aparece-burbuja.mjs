// Cuándo aparece la burbuja del acompañante: si no está al cargar, el solape con
// el CTA no ocurre en la primera pantalla y el diagnóstico cambia por completo.
// Se barre el scroll y se anota en qué momento aparece y con qué clase.
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
const c = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
let exe = null
for (const b of readdirSync(c).filter(d => d.startsWith('chromium-')).sort().reverse()) { const e = join(c, b, 'chrome-win64', 'chrome.exe'); if (existsSync(e)) { exe = e; break } }
const BASE = process.argv.slice(2).find(a => a.startsWith('http')) || 'http://127.0.0.1:4188'
const br = await chromium.launch({ executablePath: exe, headless: true })
const p = await br.newPage({ viewport: { width: 1280, height: 820 } })
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
const busca = () => p.evaluate(() => {
  const n = [...document.querySelectorAll('body *')].find(x => {
    const s = getComputedStyle(x)
    return s.position === 'fixed' && /Vamos juntos|Ya viste|sigamos|te enseño la casa/i.test(x.textContent || '') && x.getBoundingClientRect().width > 40
  })
  if (!n) return null
  const b = n.getBoundingClientRect()
  const s = getComputedStyle(n)
  return { q: n.tagName.toLowerCase() + '.' + String(n.className).split(' ')[0], z: s.zIndex, x0: Math.round(b.left), x1: Math.round(b.right), y0: Math.round(b.top), y1: Math.round(b.bottom) }
})
console.log('al cargar (2.5s):', JSON.stringify(await (async () => { await p.waitForTimeout(2500); return busca() })()))
for (let i = 1; i <= 8; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), i * 260)
  await p.waitForTimeout(1400)
  const r = await busca()
  console.log(`scroll ${i * 260}px:`, r ? `${r.q} z=${r.z} x${r.x0}..${r.x1} y${r.y0}..${r.y1}` : 'no aparece')
  if (r) break
}
await br.close()
