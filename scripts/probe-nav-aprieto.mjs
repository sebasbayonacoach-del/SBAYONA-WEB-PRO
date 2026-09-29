// Riesgo de apretar el nav: con 120px de foso quedan 1040px para quince
// elementos. Se comprueba de forma numérica, que es más decisivo que mirar la
// captura: si el nav desborda por dentro (scrollWidth > clientWidth) o si dos
// elementos se solapan, el cambio de raíl no vale.
// Además se mira que el borde DERECHO del nav caiga en la misma vertical que el
// de la columna, que es la mitad que faltaba de «alinear a los lados».
//
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-nav-aprieto.mjs http://127.0.0.1:4188
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
    const nav = document.querySelector('.navbar')
    const hojas = [...nav.querySelectorAll('a,button,span,strong,div')].filter((n) => {
      const s = getComputedStyle(n)
      if (s.display === 'none' || s.visibility === 'hidden') return false
      const b = n.getBoundingClientRect()
      return b.width > 2 && b.height > 2 && (n.textContent || '').trim().length > 1 && n.children.length === 0
    })
    const rects = hojas.map((n) => {
      const b = n.getBoundingClientRect()
      return { t: (n.textContent || '').trim().slice(0, 14), x1: Math.round(b.right), x0: Math.round(b.left) }
    })
    let solapes = 0
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j]
        if (Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > 1) solapes++
      }
    const col = document.querySelector('.section-shell')?.getBoundingClientRect()
    const ultimo = rects.length ? Math.max(...rects.map((x) => x.x1)) : null
    return {
      navScroll: nav.scrollWidth - nav.clientWidth,
      elementos: rects.length,
      solapes,
      navDerecha: ultimo,
      colDerecha: col ? Math.round(col.right) : null,
      aireDerecha: col && ultimo ? Math.round(col.right - ultimo) : null,
    }
  })
  const veredicto = r.navScroll > 0 || r.solapes > 0 ? 'APRETADO' : 'cabe'
  console.log(
    `${String(w).padStart(4)} px  ${veredicto}  elementos=${r.elementos} solapes=${r.solapes} desbordeNav=${r.navScroll}px  ` +
      `nav→${r.navDerecha}  columna→${r.colDerecha}  diferencia=${r.aireDerecha}px`,
  )
  await p.close()
}
await browser.close()
