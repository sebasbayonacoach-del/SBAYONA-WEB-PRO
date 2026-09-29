// Foto del primer viewport a un ancho dado, sin desplazamiento. Sirve para ver
// el héroe tal y como lo ve el dueño en su navegador (las sondas de números no
// revelan la composición).
// Uso: MSYS_NO_PATHCONV=1 [RUTA=/parkour-academy] node scripts/foto-ancho.mjs <base> <ancho> <alto> <salida.png>
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

const [BASE, W, H, OUT] = process.argv.slice(2)
const RUTA = process.env.RUTA || '/'
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: Number(W) || 1920, height: Number(H) || 1080 } })
await p.goto((BASE || 'http://127.0.0.1:4188') + RUTA, { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2600)
await p.screenshot({ path: OUT || 'artifacts/tmp/foto-ancho.png' })
console.log('foto:', OUT)
await browser.close()
