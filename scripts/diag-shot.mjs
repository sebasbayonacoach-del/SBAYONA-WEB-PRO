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
const y = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a)) || 5160)
const tag = process.argv.slice(2).find((a) => /^[a-z-]+$/i.test(a) && !/^\d+$/.test(a)) || 'shot'
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const RUTA = process.argv.slice(2).find((a) => a.startsWith('/')) || '/app'
await p.goto('http://localhost:4179' + RUTA, { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2600)
// El bono de llegada bloquea el scroll; sin cerrarlo la captura sale siempre en
// la misma pantalla.
if (process.env.DISMAR) {
  await p.getByText(process.env.DISMAR, { exact: false }).first().click({ timeout: 3000 }).catch(() => {})
  await p.waitForTimeout(800)
}
await p.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
await p.waitForTimeout(900)
await p.screenshot({ path: `artifacts/latest/${tag}-${y}.png` })
console.log('ok', tag, y)
await browser.close()
