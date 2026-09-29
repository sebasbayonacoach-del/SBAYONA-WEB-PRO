// SONDA · de dónde sale el color real del titular de portada.
// El H1 computa `rgb(247,245,241)` (crema) y sin embargo se ve naranja: la
// respuesta solo está en el navegador (gradiente recortado al texto, sombra,
// o un hijo que pinta). Se pregunta y se imprime la cadena de hechos.
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
const findBrowser = () => { const c = join(process.env.LOCALAPPDATA || '', 'ms-playwright'); for (const b of readdirSync(c).filter(d => d.startsWith('chromium-')).sort().reverse()) { const e = join(c, b, 'chrome-win64', 'chrome.exe'); if (existsSync(e)) return e } return null }
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(process.argv[2] || 'http://localhost:4188/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2500)
const r = await page.evaluate(() => {
  const h1 = document.querySelector('h1')
  const word = h1.querySelector('.hero-title-word')
  const lea = (el, n) => { const cs = getComputedStyle(el); return { n, color: cs.color, bgImage: cs.backgroundImage.slice(0, 70), clip: cs.webkitBackgroundClip || cs.backgroundClip, fill: cs.fill, shadow: cs.textShadow.slice(0, 40) } }
  return [lea(h1, 'h1'), lea(word, 'primera palabra'), lea(h1.querySelectorAll('.hero-title-word')[3], 'palabra 4 (frase 2)')]
})
for (const x of r) console.log(`${x.n.padEnd(22)} color=${x.color}  clip=${x.clip}  bg=${x.bgImage}${x.shadow ? '  shadow=' + x.shadow : ''}`)
await browser.close()
