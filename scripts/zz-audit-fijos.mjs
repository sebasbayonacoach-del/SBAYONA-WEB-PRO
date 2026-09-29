// Mini-sondeo: identificar la capa fija z=9999 y el contenedor interno del nav.
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
const BASE = process.argv[2] || 'http://127.0.0.1:4188'
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
for (const ancho of (process.env.ANCHOS || '1920,1280,390').split(',').map(Number)) {
  const page = await browser.newPage({ viewport: { width: ancho, height: 900 } })
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2200)
  const out = await page.evaluate(() => {
    const info = (el) => {
      const cs = getComputedStyle(el)
      const b = el.getBoundingClientRect()
      return {
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 70),
        z: cs.zIndex, pe: cs.pointerEvents, bg: cs.backgroundColor,
        bgImg: cs.backgroundImage.slice(0, 24), shadow: cs.boxShadow.slice(0, 24),
        rect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)].join(','),
      }
    }
    const fijos = [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'fixed').map(info)
    // nav: hijos del header con caja
    const header = document.querySelector('header')
    const nav = header ? [...header.querySelectorAll('*')].filter((e) => {
      const b = e.getBoundingClientRect()
      return b.width > 200 && b.height > 20 && (e.textContent || '').trim().length > 5
    }).slice(0, 6).map(info) : []
    // borde izquierdo real del contenido del nav: primer y ultimo elemento con texto
    let nl = Infinity, nr = -Infinity
    if (header) for (const t of header.querySelectorAll('a,button,span,div,p')) {
      const txt = [...t.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
      if (!txt) continue
      const b = t.getBoundingClientRect()
      if (!b.width) continue
      nl = Math.min(nl, b.left); nr = Math.max(nr, b.right)
    }
    return { vw: innerWidth, fijos, navInner: nav, navTextL: Math.round(nl), navTextR: Math.round(nr) }
  })
  console.log('### ANCHO', ancho)
  console.log(' nav texto:', out.navTextL, '->', out.navTextR)
  for (const f of out.fijos) console.log('  ', JSON.stringify(f))
  await page.close()
}
await browser.close()
