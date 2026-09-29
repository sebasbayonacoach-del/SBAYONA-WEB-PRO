// ¿El chip fijo «PASE VIP» tapa el CTA del héroe, y lo tapa MÁS desde que la
// columna pasó de 1180 a 1280? Este probe responde con el área de intersección,
// en dos posiciones de scroll: reposo y con el CTA centrado (que es como lo ve
// la captura). Sin número comparado, «se solapa» es una impresión.
//
// Uso: MSYS_NO_PATHCONV=1 ANCHO=1305 node scripts/probe-solape-chip-cta.mjs http://127.0.0.1:4188
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
const ANCHO = Number(process.env.ANCHO || 1305)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: ANCHO, height: 823 } })
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2200)

const medir = () =>
  p.evaluate(() => {
    const porTexto = (rx) =>
      [...document.querySelectorAll('a,button,div,span')].find((n) => {
        const t = (n.textContent || '').trim().toUpperCase()
        return rx.test(t) && t.length < 40 && n.getBoundingClientRect().width > 0
      })
    const chip = porTexto(/PASE VIP/)
    const cta = porTexto(/EMPEZAMOS EL RECORRIDO/)
    const r = (n) => {
      if (!n) return null
      const b = n.getBoundingClientRect()
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), pos: getComputedStyle(n).position }
    }
    const a = r(chip)
    const b = r(cta)
    let solape = 0
    if (a && b) {
      const dx = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
      const dy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
      if (dx > 0 && dy > 0) solape = dx * dy
    }
    return {
      scroll: Math.round(window.scrollY),
      chip: a,
      cta: b,
      solapePx2: solape,
      pctCtaCubierto: a && b && b.w * b.h ? Math.round((solape / (b.w * b.h)) * 100) : 0,
    }
  })

console.log(`ancho ${ANCHO} px`)

// Barrer el scroll, no muestrear dos posiciones: el chip es `position: fixed`,
// así que su y es constante mientras el CTA sube — el solape máximo ocurre en
// un punto concreto del recorrido, y muestrear dos deja pasar justo lo que la
// captura enseña.
const alto = await p.evaluate(() => document.documentElement.scrollHeight)
let peor = null
for (let y = 0; y <= Math.min(alto - 800, 2400); y += 80) {
  await p.evaluate((v) => window.scrollTo(0, v), y)
  await p.waitForTimeout(120)
  const m = await medir()
  if (!peor || m.solapePx2 > peor.solapePx2) peor = m
}
console.log('  peor solape del barrido →', JSON.stringify(peor))
const cta = peor.cta
const chip = peor.chip
console.log(
  `  chip x ${chip.x}..${chip.x + chip.w} y ${chip.y}..${chip.y + chip.h}   ` +
    `CTA x ${cta.x}..${cta.x + cta.w} y ${cta.y}..${cta.y + cta.h}   cubre ${peor.pctCtaCubierto}% del botón`,
)

await browser.close()
