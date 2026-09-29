// Cuánto movimiento VIVO tiene cada ruta, medido en el navegador.
// La clase de revelado no es evidencia: una página puede no llevar `ds-reveal`
// y estar llena de animaciones de tiempo. Se cuenta por nodo animado y por
// mecanismo (animación de tiempo vs. gobernada por scroll).
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-movimiento.mjs [baseUrl] [/ruta ...]
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
function findBrowser() {
  const cache = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  for (const b of readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
    const exe = join(cache, b, 'chrome-win64', 'chrome.exe')
    if (existsSync(exe)) return exe
  }
  return null
}
const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => a.startsWith('http')) || 'http://localhost:4179'
import { exigirRutas } from './rutas-de-auditoria.mjs'
const LISTA = exigirRutas(ARGV)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
for (const ruta of LISTA) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2200)
  const m = await p.evaluate(() => {
    const nodos = [...document.querySelectorAll('main *')]
    let tiempo = 0
    let scroll = 0
    let transicion = 0
    for (const el of nodos) {
      const c = getComputedStyle(el)
      if (c.animationName !== 'none' && c.animationName !== '') {
        if (c.animationTimeline && c.animationTimeline !== 'auto') scroll += 1
        else tiempo += 1
      }
      if (c.transitionProperty !== 'none' && c.transitionProperty !== 'all') transicion += 1
    }
    const transform = nodos.filter((el) => {
      const c = getComputedStyle(el)
      return c.transform !== 'none' || c.perspective !== 'none'
    }).length
    return { total: nodos.length, tiempo, scroll, transicion, transform }
  })
  const pct = m.total ? Math.round((100 * (m.tiempo + m.scroll)) / m.total) : 0
  console.log(`${ruta.padEnd(18)} nodos ${String(m.total).padStart(5)} · anim tiempo ${String(m.tiempo).padStart(4)} · por scroll ${String(m.scroll).padStart(4)} · con transición ${String(m.transicion).padStart(4)} · transform/perspectiva ${String(m.transform).padStart(4)} · animado ${pct}%`)
  await p.close()
}
await browser.close()
