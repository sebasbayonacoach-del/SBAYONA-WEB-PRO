// Foto del estado exacto que el barrido señala: burbuja montada y usuario de
// vuelta al inicio. Sin esto no se puede saber si el solape geométrico se ve.
// Uso: MSYS_NO_PATHCONV=1 node scripts/foto-burbuja-sobre-cta.mjs <base> <salida.png>
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

const args = process.argv.slice(2)
const BASE = args.find((a) => a.startsWith('http')) || 'http://127.0.0.1:4188'
const OUT = args.find((a) => !a.startsWith('http')) || 'artifacts/tmp/burbuja-sobre-cta.png'
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: 1280, height: 820 } })
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2200)
await p.evaluate(() => window.scrollTo(0, 400))
await p.waitForTimeout(1600)
await p.evaluate(() => window.scrollTo(0, 0))
await p.waitForTimeout(1600)
const estado = await p.evaluate(() => {
  const bub = document.querySelector('.companion')
  const cta = [...document.querySelectorAll('a,button')].find((n) => /EMPEZAMOS EL RECORRIDO/i.test(n.textContent || ''))
  if (!bub || !cta) return { bub: !!bub, cta: !!cta }
  const s = getComputedStyle(bub)
  const a = cta.getBoundingClientRect(), b = bub.getBoundingClientRect()
  return {
    bub: true,
    ctaFound: true,
    opacity: s.opacity,
    eventos: s.pointerEvents,
    z: s.zIndex,
    burbuja: [b.left, b.top, b.right, b.bottom].map(Math.round).join(','),
    cta: [a.left, a.top, a.right, a.bottom].map(Math.round).join(','),
  }
})
console.log(JSON.stringify(estado))
await p.screenshot({ path: OUT })
console.log('foto:', OUT)
await browser.close()
