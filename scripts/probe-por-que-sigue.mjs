// Por qué sigue en x=426 después de poner `margin-inline: 0`. Responde en una
// pasada: si la regla llegó al CSS servido, si gana la cascada, y si el
// desplazamiento viene del padding del padre en vez del margen del hijo.
//
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-por-que-sigue.mjs http://127.0.0.1:4188
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
await p.waitForTimeout(2600)

const r = await p.evaluate(() => {
  const sel = ['.vision-passage-head', '.pain-header', '.mechanism-header', '.mechanism-body', '.solution-body']
  const out = sel.map((s) => {
    const n = document.querySelector(s)
    if (!n) return { s, error: 'no existe' }
    const cs = getComputedStyle(n)
    const par = n.parentElement
    const pcs = par ? getComputedStyle(par) : null
    const pb = par ? par.getBoundingClientRect() : null
    const b = n.getBoundingClientRect()
    return {
      s,
      left: Math.round(b.left),
      width: Math.round(b.width),
      marginLeft: cs.marginLeft,
      marginRight: cs.marginRight,
      parent: par ? par.tagName.toLowerCase() + '.' + String(par.className).split(' ')[0] : '',
      parentLeft: pb ? Math.round(pb.left) : null,
      parentWidth: pb ? Math.round(pb.width) : null,
      parentPadL: pcs ? pcs.paddingLeft : '',
      parentJustify: pcs ? pcs.justifyContent : '',
      parentAlign: pcs ? pcs.alignItems : '',
      parentDisplay: pcs ? pcs.display : '',
      parentTextAlign: pcs ? pcs.textAlign : '',
    }
  })
  // ¿Llegó la regla al CSS servido?
  let encontrada = 0
  for (const hoja of document.styleSheets) {
    let reglas
    try {
      reglas = hoja.cssRules
    } catch {
      continue
    }
    for (const cr of reglas) {
      const t = cr.cssText || ''
      if (t.includes('margin-inline: 0') && t.includes('pain-header')) encontrada++
    }
  }
  return { out, encontrada }
})

console.log(`regla "margin-inline: 0" con .pain-header encontrada en las hojas servidas: ${r.encontrada}`)
for (const f of r.out) {
  if (f.error) console.log(`  ${f.s}: ${f.error}`)
  else
    console.log(
      `  ${f.s.padEnd(22)} x${f.left} w${f.width}  margen=${f.marginLeft}/${f.marginRight}\n` +
        `      padre ${f.parent} x${f.parentLeft} w${f.parentWidth} pad=${f.parentPadL} ${f.parentDisplay} justify=${f.parentJustify} align=${f.parentAlign} textAlign=${f.parentTextAlign}`,
    )
}
await browser.close()
