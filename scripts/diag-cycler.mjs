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
const A = process.argv.slice(2)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(A[0] + A[1], { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2400)
await p.getByText('RECLAMAR', { exact: false }).first().click({ timeout: 2500 }).catch(() => {})
await p.waitForTimeout(600)
await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), Number(A[2]))
await p.waitForTimeout(1200)
const out = await p.evaluate(() => {
  const capas = [...document.querySelectorAll('[data-scene-cycler]')]
  const lijos = [...document.querySelectorAll('main section > div')]
  const info = capas.map((el) => {
    const r = el.getBoundingClientRect()
    const cv = el.querySelector('canvas')
    return `capa top=${Math.round(r.top)} h=${Math.round(r.height)} display=${getComputedStyle(el).display} clip=${el.style.clipPath.slice(0, 40)} op=${getComputedStyle(el).opacity} canvas=${cv ? cv.width + 'x' + cv.height : 'NO'}`
  })
  const secciones = [...document.querySelectorAll('section:not(section section)')].filter((s) => s.offsetHeight > 0)
  const active = secciones.map((s, i) => ({ i, r: s.getBoundingClientRect(), t: (s.querySelector('h1,h2,h3')?.textContent || '').trim().slice(0, 24) }))
    .filter((x) => x.r.top < innerHeight && x.r.bottom > 0)
    .map((x) => `visible[${x.i}] "${x.t}" ${Math.round(x.r.top)}..${Math.round(x.r.bottom)}`)
  return [...info, ...active].join('\n')
})
console.log(out || 'sin capa del cycler')
await browser.close()
