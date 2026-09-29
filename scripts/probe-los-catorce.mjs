// Quién mueve 14px a la izquierda los párrafos respecto a su titular. Patrón
// repetido en proof-section, free-value, cta-stack-section de la portada y
// programs-pain / programs-visualization: titular en x=320 y su <p> en x=306.
// Se imprimen los valores computados que lo explican (margen, padding,
// text-indent, display) para no arreglar a ciegas.
//
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-los-catorce.mjs http://127.0.0.1:4188
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
const p = await browser.newPage({ viewport: { width: Number(process.env.ANCHO || 1920), height: 900 } })
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2400)

const r = await p.evaluate(() => {
  const caja = (n, etiqueta) => {
    const b = n.getBoundingClientRect()
    const s = getComputedStyle(n)
    return `${etiqueta.padEnd(10)} x${String(Math.round(b.left)).padStart(4)} margenIzq=${s.marginLeft} paddingIzq=${s.paddingLeft} textIndent=${s.textIndent} transform=${s.transform.slice(0, 26)} hanging=${s.hangingPunctuation} primerCarácter=«${(n.textContent || '').trim().slice(0, 1)}» hijo0=${n.firstElementChild ? n.firstElementChild.tagName.toLowerCase() + '.' + String(n.firstElementChild.className).split(' ')[0].slice(0, 14) : '—'} padre=.${String(n.parentElement?.className || '').split(' ')[0].slice(0, 20)}`
  }
  const out = []
  for (const sel of ['.proof-section', '.cta-stack-section', '.free-value', '.offer-section']) {
    const s = document.querySelector(sel)
    if (!s) continue
    const h = s.querySelector('h2, h1')
    const par = [...s.querySelectorAll('p')].find((n) => n.getBoundingClientRect().width > 0)
    const filas = []
    if (h) filas.push(caja(h, 'titular'))
    if (par) filas.push(caja(par, 'párrafo'))
    if (h && par) filas.push(caja(par.parentElement, 'contenedorP'))
    out.push({ sel, filas })
  }
  return out
})

for (const grupo of r) {
  console.log(`### ${grupo.sel}`)
  for (const f of grupo.filas) console.log(`    ${f}`)
}
await browser.close()
