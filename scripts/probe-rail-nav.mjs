// De dónde sale el desplazamiento del nav, comparado con el del contenido.
// El nav es el único elemento fijo que se lee siempre, y si su raíl no coincide
// con el de la columna, la página entera parece descolocada aunque cada hoja
// esté bien.
//
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-rail-nav.mjs http://127.0.0.1:4188
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

const BASE = process.argv.slice(2).find((a) => a.startsWith('http')) || 'http://127.0.0.1:4188'
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })

for (const w of (process.env.ANCHOS || '1280,1440,1920').split(',').map(Number)) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } })
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2200)
  const r = await p.evaluate(() => {
    const logo = [...document.querySelectorAll('.navbar *')].find((n) => (n.textContent || '').trim() === 'BAYONA')
    const cadena = []
    for (let n = logo; n && n !== document.body; n = n.parentElement) {
      const b = n.getBoundingClientRect()
      const s = getComputedStyle(n)
      cadena.push({
        q: (n.tagName.toLowerCase() + (n.className ? '.' + String(n.className).split(' ')[0] : '')).slice(0, 22),
        x: Math.round(b.left),
        w: Math.round(b.width),
        padL: s.paddingLeft,
        max: s.maxWidth,
      })
    }
    const col = document.querySelector('.section-shell')
    const h1 = document.querySelector('main h1')
    return {
      cadena: cadena.slice(0, 5),
      contenido: col ? Math.round(col.getBoundingClientRect().left) : null,
      h1: h1 ? Math.round(h1.getBoundingClientRect().left) : null,
    }
  })
  console.log(`### ${w} px   contenido(section-shell)=x${r.contenido}   h1=x${r.h1}`)
  for (const f of r.cadena) console.log(`    ${f.q.padEnd(24)} x${String(f.x).padStart(4)} w${String(f.w).padStart(4)} padL=${f.padL} max=${f.max}`)
  await p.close()
}
await browser.close()
