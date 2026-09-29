// Para cada titular de la portada: su borde izquierdo, el de su contenedor
// inmediato, y qué propiedad lo está desviando (centrado por `margin-inline:
// auto`, `text-align: center` heredado, o un `max-width` menor dentro de una
// columna centrada). Sin esto la normalización se escribe a ojo y se olvida
// alguna.
//
// Uso: MSYS_NO_PATHCONV=1 ANCHO=1920 node scripts/probe-por-que-desvia.mjs http://127.0.0.1:4188
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
const ANCHO = Number(process.env.ANCHO || 1920)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: ANCHO, height: 900 } })
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2600)

const filas = await p.evaluate(() => {
  const out = []
  for (const h of document.querySelectorAll('main h1, main h2')) {
    const b = h.getBoundingClientRect()
    if (b.width === 0) continue
    const s = getComputedStyle(h)
    const par = h.parentElement
    const ps = par ? getComputedStyle(par) : null
    const pb = par ? par.getBoundingClientRect() : null
    // Se sube hasta el `.section-shell` / contenedor de columna más cercano
    let col = h.parentElement
    while (col && col.getBoundingClientRect().width < b.width * 1.2) col = col.parentElement
    out.push({
      txt: (h.textContent || '').trim().slice(0, 22),
      tag: h.tagName,
      cls: String(h.className).split(' ')[0].slice(0, 22),
      left: Math.round(b.left),
      hMax: s.maxWidth,
      hMargin: s.marginLeft === s.marginRight ? `auto?${s.marginLeft}` : `${s.marginLeft}|${s.marginRight}`,
      hAlign: s.textAlign,
      par: par ? String(par.className).split(' ')[0].slice(0, 22) : '',
      parLeft: pb ? Math.round(pb.left) : null,
      parWidth: pb ? Math.round(pb.width) : null,
      parJustify: ps ? ps.justifyContent : '',
      parAlign: ps ? ps.alignItems : '',
      parDisplay: ps ? ps.display : '',
      colLeft: col ? Math.round(col.getBoundingClientRect().left) : null,
      colCls: col ? String(col.className).split(' ')[0].slice(0, 20) : '',
    })
  }
  return out
})

for (const f of filas) {
  console.log(
    `x${String(f.left).padStart(4)}  ${f.tag} «${f.txt}»\n` +
      `        h: .${f.cls} max=${f.hMax} margin=${f.hMargin} align=${f.hAlign}\n` +
      `        padre: .${f.par} (x${f.parLeft} w${f.parWidth}) ${f.parDisplay} justify=${f.parJustify} align=${f.parAlign}\n` +
      `        columna: .${f.colCls} x${f.colLeft}`,
  )
}
await browser.close()
