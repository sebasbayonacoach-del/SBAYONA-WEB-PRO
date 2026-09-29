// Cuánto invade de verdad el muelle fijo de la izquierda a cada ancho, y si el
// carril reservado (`--layout-gutter`) le llega. El comentario de
// `luxury-system.css` da por hecho que la columna mide 80 px; si crece con el
// viewport, el carril de 120 px deja de ser suficiente y el chip se come el
// titular. Aquí se mide el borde derecho real del muelle completo (chip +
// burbuja + insignia), no el del chip solo.
//
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-ancho-muelle.mjs http://127.0.0.1:4188
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
const ANCHOS = (process.env.ANCHOS || '1280,1440,1590,1720,1920').split(',').map(Number)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })

for (const ancho of ANCHOS) {
  const p = await browser.newPage({ viewport: { width: ancho, height: 900 } })
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2200)
  const r = await p.evaluate(() => {
    const fijos = [...document.querySelectorAll('body *')].filter((n) => {
      const s = getComputedStyle(n)
      if (s.position !== 'fixed') return false
      const b = n.getBoundingClientRect()
      return b.width > 0 && b.height > 0 && b.left < 320 && b.right < innerWidth * 0.6
    })
    let borde = 0
    let quien = []
    for (const n of fijos) {
      const b = n.getBoundingClientRect()
      if (b.right > borde) {
        borde = b.right
        quien = [n.tagName.toLowerCase() + '.' + String(n.className).split(' ')[0]]
      } else if (Math.abs(b.right - borde) < 1) {
        quien.push(n.tagName.toLowerCase() + '.' + String(n.className).split(' ')[0])
      }
    }
    const h1 = document.querySelector('main h1')
    const cs = getComputedStyle(document.documentElement)
    return {
      muelleDerecha: Math.round(borde),
      muelleAncho: Math.round(borde - 20),
      quien: quien.slice(0, 3),
      h1Left: h1 ? Math.round(h1.getBoundingClientRect().left) : null,
      gutter: cs.getPropertyValue('--layout-gutter').trim(),
      margenH1: h1 ? Math.round(h1.getBoundingClientRect().left - borde) : null,
    }
  })
  const veredicto = r.margenH1 === null ? '?' : r.margenH1 < 0 ? `SOLAPE ${-r.margenH1}px` : `aire ${r.margenH1}px`
  console.log(
    `${String(ancho).padStart(4)} px  muelle 20..${String(r.muelleDerecha).padStart(3)} (ancho ${String(r.muelleAncho).padStart(3)})  ` +
      `--layout-gutter=${r.gutter || 'sin valor'}  H1@${r.h1Left}  → ${veredicto}`,
  )
  console.log(`             el que más invade: ${r.quien.join(', ')}`)
  await p.close()
}

await browser.close()
