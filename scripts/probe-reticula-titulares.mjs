// ¿El hueco izquierdo del héroe es suyo o es la retícula del sitio? Mide el
// `left` de los primeros titulares de varias secciones y rutas a un ancho dado,
// y además imprime el estilo de `.hero-layout`, que es el eslabón que introduce
// el desplazamiento. Sin esto se tiende a "arreglar" el héroe y romper la
// alineación con el resto de la página.
//
// Uso: MSYS_NO_PATHCONV=1 ANCHO=1590 node scripts/probe-reticula-titulares.mjs http://127.0.0.1:4188
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
const ANCHO = Number(process.env.ANCHO || 1590)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: ANCHO, height: 900 } })

for (const ruta of ['/', '/about', '/programs', '/community', '/resources', '/faq', '/shop']) {
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(1800)
  const r = await p.evaluate(() => {
    const out = []
    for (const h of document.querySelectorAll('main h1, main h2')) {
      const rect = h.getBoundingClientRect()
      if (rect.width === 0) continue
      out.push({
        txt: (h.textContent || '').trim().slice(0, 26),
        tag: h.tagName,
        left: Math.round(rect.left),
        padre: h.parentElement ? h.parentElement.className.toString().split(' ')[0] : '',
      })
      if (out.length >= 4) break
    }
    const hl = document.querySelector('.hero-layout')
    const cs = hl ? getComputedStyle(hl) : null
    return {
      titulares: out,
      hero: hl
        ? {
            display: cs.display,
            justify: cs.justifyContent,
            align: cs.alignItems,
            grid: cs.gridTemplateColumns,
            maxWidth: cs.maxWidth,
            padInline: cs.paddingLeft,
            width: Math.round(hl.getBoundingClientRect().width),
            left: Math.round(hl.getBoundingClientRect().left),
          }
        : null,
    }
  })
  const fila = r.titulares.map((t) => `${t.tag} ${t.txt}…@${t.left}`).join(' | ')
  console.log(`${ruta.padEnd(12)} ${fila}`)
  if (r.hero) console.log(`${''.padEnd(12)} .hero-layout → display=${r.hero.display} justify=${r.hero.justify} align=${r.hero.align} grid=${r.hero.grid} max=${r.hero.maxWidth} pad=${r.hero.padInline} width=${r.hero.width} left=${r.hero.left}`)
}

await browser.close()
