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
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(A[0] + A[1], { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2200)
const alto = await p.evaluate(() => document.documentElement.scrollHeight)
// Lectura inmediata: el panel se expande al cambiar de capítulo y se pliega solo,
// así que hay que medirlo nada más llegar, no después de esperar.
const peores = new Map()
for (let y = 0; y < alto - 900; y += 500) {
  await p.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), y)
  await p.waitForTimeout(120)
  const r = await p.evaluate(() => {
    const hud = document.querySelector('.universe-scale')
    if (!hud) return []
    const hr = hud.getBoundingClientRect()
    const out = []
    for (const el of document.querySelectorAll('main button, main a[href], main input, main select, main summary')) {
      const b = el.getBoundingClientRect()
      if (b.width < 20 || b.height < 14) continue
      const cx = b.left + b.width / 2
      const cy = b.top + b.height / 2
      if (cx < hr.left || cx > hr.right || cy < hr.top || cy > hr.bottom) continue
      if (hud.contains(el)) continue
      out.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 22)}"`)
    }
    return out
  })
  for (const x of r) if (!peores.has(x)) peores.set(x, y)
}
console.log(`controles bajo el HUD en algún punto: ${peores.size}`)
for (const [k, y] of peores) console.log(`  ${k}  (scroll ${y})`)
await browser.close()
