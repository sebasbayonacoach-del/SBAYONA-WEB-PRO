// Cadena de contenedores de un selector: quién le mete el hueco. Se usa cuando
// el propio elemento ya está en el grupo del raíl con `!important` y aun así
// mide menos de lo que toca — casi siempre es un ancestro con `padding-inline`
// o un `max-width` propio.
// Uso: MSYS_NO_PATHCONV=1 ANCHO=1440 node scripts/probe-cadena.mjs <base> <ruta> <selector>
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

const [BASE, RUTA, SEL] = process.argv.slice(2)
const ANCHO = Number(process.env.ANCHO) || 1440
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: ANCHO, height: 900 } })
await p.goto((BASE || 'http://localhost:4191') + RUTA, { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2200)
const r = await p.evaluate((sel) => {
  const el = document.querySelector(sel)
  if (!el) return null
  const out = []
  for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
    const s = getComputedStyle(n)
    const b = n.getBoundingClientRect()
    out.push({
      q: n.tagName.toLowerCase() + (n.className ? '.' + String(n.className).trim().split(/\s+/).slice(0, 2).join('.') : ''),
      left: Math.round(b.left),
      width: Math.round(b.width),
      pad: s.paddingLeft === s.paddingRight ? s.paddingLeft : `${s.paddingLeft}/${s.paddingRight}`,
      max: s.maxWidth,
      mar: s.marginLeft === s.marginRight ? s.marginLeft : `${s.marginLeft}/${s.marginRight}`,
      disp: s.display,
      grid: s.gridTemplateColumns === 'none' ? '' : ' ' + s.gridTemplateColumns.slice(0, 40),
    })
    if (out.length > 6) break
  }
  const h1 = document.querySelector('h1')
  return { out, h1left: h1 ? Math.round(h1.getBoundingClientRect().left) : null }
}, SEL)
if (!r) console.log('selector no encontrado:', SEL)
else {
  console.log(`${RUTA}  h1@${r.h1left}  (ancho ${ANCHO})`)
  for (const f of r.out)
    console.log(`   ${f.q.padEnd(34)} left=${String(f.left).padStart(5)} w=${String(f.width).padStart(5)} pad=${f.pad.padEnd(9)} max=${f.max.padEnd(10)} margin=${f.mar.padEnd(7)} ${f.disp}${f.grid}`)
}
await browser.close()
