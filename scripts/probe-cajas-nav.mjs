// Por qué los elementos del nav se montan a 1280px. Se listan sus cajas en
// orden x con lo que manda en cada una (flex-shrink, ancho computado, posición),
// porque el remedio es distinto si es un `position: absolute` mal anclado que si
// es un grupo que no cabe y se solapa al encoger.
//
// Uso: MSYS_NO_PATHCONV=1 ANCHO=1280 node scripts/probe-cajas-nav.mjs http://127.0.0.1:4188
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
const ANCHO = Number(process.env.ANCHO || 1280)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: ANCHO, height: 900 } })
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2400)

const r = await p.evaluate(() => {
  const nav = document.querySelector('.navbar')
  const hoja = (n) => {
    const b = n.getBoundingClientRect()
    const s = getComputedStyle(n)
    return {
      t: ((n.textContent || '').trim().slice(0, 12) || n.className).replace(/\s+/g, ' '),
      x0: Math.round(b.left),
      x1: Math.round(b.right),
      w: Math.round(b.width),
      pos: s.position,
      shrink: s.flexShrink,
      minW: s.minWidth,
      ml: s.marginLeft,
      mr: s.marginRight,
      padre: String(n.parentElement?.className || '').split(' ')[0].slice(0, 18),
    }
  }
  const hojas = [...nav.querySelectorAll('a,button,span,strong')]
    .filter((n) => {
      const s = getComputedStyle(n)
      const b = n.getBoundingClientRect()
      return s.display !== 'none' && b.width > 2 && (n.textContent || '').trim().length > 1
    })
    .map(hoja)
    .sort((a, b) => a.x0 - b.x0)
  const cont = [...nav.querySelectorAll('*')]
    .filter((n) => getComputedStyle(n).display === 'flex')
    .map((n) => {
      const s = getComputedStyle(n)
      const b = n.getBoundingClientRect()
      return {
        q: String(n.className).split(' ')[0].slice(0, 22),
        w: Math.round(b.width),
        gap: s.gap,
        shrink: s.flexShrink,
        wrap: s.flexWrap,
        desb: n.scrollWidth - n.clientWidth,
      }
    })
  return { hojas, cont }
})

console.log(`### nav a ${ANCHO}px, en orden x:`)
let prev = null
for (const f of r.hojas) {
  const choque = prev && f.x0 < prev.x1 ? `  ⟵ CHOCA ${prev.x1 - f.x0}px con «${prev.t}»` : ''
  console.log(`  x${String(f.x0).padStart(4)}..${String(f.x1).padStart(4)} w${String(f.w).padStart(4)} ${f.pos.padEnd(8)} shrink=${f.shrink} .${f.padre.padEnd(18)} «${f.t}»${choque}`)
  prev = f
}
console.log(`  contenedores flex:`)
for (const c of r.cont) console.log(`    .${c.q.padEnd(22)} w=${c.w} gap=${c.gap} wrap=${c.wrap} shrink=${c.shrink} desborda=${c.desb}px`)
await browser.close()
