// Censo de ENLACES DE CONTACTO renderizados, ruta por ruta, en el paquete local.
// No lee el bundle: abre cada pagina, deja que React monte el DOM y pregunta por
// los href reales que veria alguien que pincha.
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

const BASE = process.argv[2] || 'http://localhost:4173'
const RUTAS = (process.argv[3] || '').split(',').filter(Boolean)

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
let total = 0
const sospecha = []

for (const ruta of RUTAS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2800)
  const datos = await page.evaluate(() => {
    const out = []
    for (const a of document.querySelectorAll('a[href]')) {
      const h = a.getAttribute('href') || ''
      if (/wa\.me|whatsapp|tel:|mailto:/i.test(h)) out.push({ href: h, texto: (a.textContent || '').trim().slice(0, 40) })
    }
    return { out, botones: [...document.querySelectorAll('button')].map((b) => (b.textContent || '').trim()).filter((t) => /lo quiero|reservar|empezar|whatsapp|escrí|escrib/i.test(t)).slice(0, 12) }
  })
  total += datos.out.length
  const malos = datos.out.filter((d) => /6149|undefined|NaN|XX|\+\s*$|wa\.me\/\?/i.test(d.href))
  if (malos.length) sospecha.push([ruta, malos])
  console.log(`${ruta.padEnd(22)} enlaces contacto: ${String(datos.out.length).padStart(2)}  botones CTA: ${datos.botones.length}  ${[...new Set(datos.out.map((d) => d.href.replace(/\?.*/, '')))].join(' , ').slice(0, 120)}`)
  await page.close()
}
console.log('TOTAL enlaces:', total)
console.log(sospecha.length ? 'SOSPECHA:\n' + JSON.stringify(sospecha, null, 1) : 'sin enlaces rotos o con 614/undefined')
await browser.close()
