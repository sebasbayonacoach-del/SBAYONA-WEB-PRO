// Captura SECCIONES concretas centradas en viewport, para ver el encuadre real
// de una imagen de fondo detrás de su capa de texto.
//
// Uso:
//   MSYS_NO_PATHCONV=1 node scripts/capture-secciones.mjs http://localhost:4188 \
//     "/community:.community-week,/community:.community-access"
//
// Por qué no vale `capture-viewport.mjs`: ese avanza de 860 en 860 px y puede
// que ninguna parada caiga sobre la sección que quieres mirar. Aquí se hace
// `scrollIntoView({block:'center'})` sobre el selector y se dispara una
// captura por coincidencia, con el revelado por scroll ya forzado.

import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
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

const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => a.startsWith('http')) || 'http://localhost:4188'
const PARES = (ARGV.find((a) => !a.startsWith('http')) || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => {
    const i = s.indexOf(':')
    return { ruta: s.slice(0, i), selector: s.slice(i + 1) }
  })

const salida = join('artifacts', 'tmp', 'secciones')
mkdirSync(salida, { recursive: true })

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })

for (const ancho of [Number(process.env.ANCHO || 1440)]) {
  for (const { ruta, selector } of PARES) {
    const page = await browser.newPage({ viewport: { width: ancho, height: 900 } })
    await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    // Fuerza el revelado de todo el documento antes de mirar: las secciones con
    // `reveal` empiezan en opacity 0 y sin barrido saldrían negras.
    await page.evaluate(async () => {
      const alto = document.body.scrollHeight
      for (let y = 0; y < alto; y += 600) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise((r) => setTimeout(r, 90))
      }
    })
    const n = await page.evaluate((sel) => document.querySelectorAll(sel).length, selector)
    for (let i = 0; i < Math.min(n, 4); i += 1) {
      await page.evaluate(
        ([sel, idx]) => {
          const el = document.querySelectorAll(sel)[idx]
          el?.scrollIntoView({ block: 'center', behavior: 'instant' })
        },
        [selector, i],
      )
      await page.waitForTimeout(1100)
      const nombre = `${ruta.replace(/\W+/g, '-')}-${selector.replace(/\W+/g, '-')}-${i}-${ancho}.png`
      await page.screenshot({ path: join(salida, nombre) })
      console.log(join(salida, nombre))
    }
    await page.close()
  }
}

await browser.close()
