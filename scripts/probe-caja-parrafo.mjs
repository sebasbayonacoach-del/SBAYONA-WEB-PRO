// Por qué el `<p>` de `.premium-card` desborda su tarjeta 74-96px. Se imprime su
// caja computada y la cadena de ancestros con ancho, para no arreglar a ciegas:
// si el culpable es un `width` fijo, un `min-width` o una columna de rejilla, el
// remedio es distinto en cada caso.
//
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-caja-parrafo.mjs http://127.0.0.1:4188
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
const p = await browser.newPage({ viewport: { width: 1920, height: 900 } })
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2400)

const r = await p.evaluate(() => {
  const card = document.querySelector('.pain-item.premium-card')
  if (!card) return { error: 'sin tarjeta' }
  const parrafo = [...card.querySelectorAll('p')].find((n) => n.getBoundingClientRect().right > card.getBoundingClientRect().right + 1)
  if (!parrafo) return { error: 'ningún <p> desborda ahora' }
  const caja = (n) => {
    const b = n.getBoundingClientRect()
    const s = getComputedStyle(n)
    return {
      q: (n.tagName.toLowerCase() + '.' + String(n.className).split(' ')[0]).slice(0, 26),
      x: Math.round(b.left),
      w: Math.round(b.width),
      cssW: s.width,
      minW: s.minWidth,
      maxW: s.maxWidth,
      ml: s.marginLeft,
      mr: s.marginRight,
      pl: s.paddingLeft,
      pos: s.position,
      disp: s.display,
      gtc: s.gridTemplateColumns.slice(0, 30),
    }
  }
  const cadena = []
  for (let n = parrafo; n && n !== document.body; n = n.parentElement) cadena.push(caja(n))
  return { cadena: cadena.slice(0, 5), texto: (parrafo.textContent || '').trim().slice(0, 46) }
})

if (r.error) console.log(r.error)
else {
  console.log(`<p> «${r.texto}» y sus ancestros (1920 px):`)
  for (const f of r.cadena)
    console.log(
      `  ${f.q.padEnd(26)} x${String(f.x).padStart(4)} w${String(f.w).padStart(4)} css=${f.cssW.padEnd(9)} min=${f.minW.padEnd(6)} max=${f.maxW.padEnd(8)} marg=${f.ml}|${f.mr} pad=${f.pl} ${f.pos}/${f.disp} gtc=${f.gtc}`,
    )
}
await browser.close()
