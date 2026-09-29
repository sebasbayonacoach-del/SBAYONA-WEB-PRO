// Una sola tabla para decidir el resto del arreglo, en vez de discutir entre dos
// sondas que discreparon (una midió el muelle a 296px y la otra a 404px; resulta
// que la segunda forcejeaba 1920 fijo).
//
// Por ancho: cada elemento `position: fixed` del hemisferio izquierdo con su
// clase y su rect, el raíl del texto del nav, y el borde izquierdo de cada
// titular de la home. Con eso se decide (a) cuánto vale el foso de verdad,
// (b) si el nav comparte raíl con el contenido, (c) cuántos raíles distintos
// hay dentro de la portada.
//
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-railes.mjs http://127.0.0.1:4188
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
const ANCHOS = (process.env.ANCHOS || '1280,1440,1920').split(',').map(Number)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })

for (const ancho of ANCHOS) {
  const p = await browser.newPage({ viewport: { width: ancho, height: 900 } })
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2400)
  // Se barre el scroll como haría un visitante: el muelle cambia de forma al
  // desplazarse y medir solo en reposo es lo que hizo discrepar a las dos sondas.
  for (let y = 0; y <= 2400; y += 600) {
    await p.evaluate((v) => window.scrollTo(0, v), y)
    await p.waitForTimeout(220)
  }
  const r = await p.evaluate(() => {
    const fijos = []
    for (const n of document.querySelectorAll('body *')) {
      const s = getComputedStyle(n)
      if (s.position !== 'fixed' || s.display === 'none' || s.visibility === 'hidden') continue
      const b = n.getBoundingClientRect()
      if (b.width < 4 || b.height < 4) continue
      if (b.left > innerWidth * 0.5) continue
      fijos.push({
        quien: (n.tagName.toLowerCase() + '.' + String(n.className).split(' ')[0]).slice(0, 34),
        x1: Math.round(b.right),
        y: Math.round(b.top),
      })
    }
    fijos.sort((a, b) => b.x1 - a.x1)
    const nav = document.querySelector('.navbar a, .navbar span, .navbar div')
    const navTxt = [...document.querySelectorAll('.navbar *')]
      .filter((n) => (n.textContent || '').trim().length > 2 && n.children.length === 0)
      .map((n) => n.getBoundingClientRect().left)
    const titulares = []
    for (const h of document.querySelectorAll('main h1, main h2')) {
      const b = h.getBoundingClientRect()
      if (b.width === 0) continue
      titulares.push({
        quien: String(h.parentElement?.className || '').split(' ')[0].slice(0, 24) || '?',
        left: Math.round(b.left),
      })
    }
    const col = document.querySelector('.hero-layout')
    return {
      columna: col ? { x1: Math.round(col.getBoundingClientRect().left), w: Math.round(col.getBoundingClientRect().width) } : null,
      navLeft: navTxt.length ? Math.round(Math.min(...navTxt)) : null,
      fijos: fijos.slice(0, 6),
      titulares,
    }
  })
  console.log(`\n════ ${ancho} px ════  columna contenido: x${r.columna?.x1} +${r.columna?.w}   nav texto: x${r.navLeft}`)
  console.log('  fijos izquierda (derecha real, top):')
  for (const f of r.fijos) console.log(`    ${String(f.x1).padStart(4)}  y${String(f.y).padStart(4)}  ${f.quien}`)
  console.log('  raíles de titulares:')
  const porRaíl = new Map()
  for (const t of r.titulares) porRaíl.set(t.left, [...(porRaíl.get(t.left) || []), t.quien])
  for (const [left, quienes] of [...porRaíl.entries()].sort((a, b) => a[0] - b[0]))
    console.log(`    x${String(left).padStart(4)}  (${quienes.length})  ${quienes.slice(0, 4).join(', ')}`)
  await p.close()
}

await browser.close()
