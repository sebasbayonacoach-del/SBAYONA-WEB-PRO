// Captura el VIEWPORT (lo que ve la persona), no la caja del elemento: es la
// única forma de ver solapes de elementos fijos y composición real.
// Uso: PASOS=4 SALTO=900 MSYS_NO_PATHCONV=1 node scripts/capture-viewport.mjs [baseUrl] /ruta ...
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
const BASE = ARGV.find((a) => a.startsWith('http')) || 'http://localhost:4179'
const RUTAS = ARGV.filter((a) => !a.startsWith('http'))
const PASOS = Number(process.env.PASOS || 5)
const SALTO = Number(process.env.SALTO || 860)
const salida = join('artifacts', 'latest', 'viewport')
mkdirSync(salida, { recursive: true })

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const errores = []

for (const ruta of RUTAS) {
  // ANCHO/ALTO para ver el móvil real (390x844) con la misma herramienta que el
  // escritorio; PREFIJO evita que las capturas móviles pisen las de 1440, que
  // suelen estar siendo revisadas en paralelo.
  const pagina = await browser.newPage({
    viewport: { width: Number(process.env.ANCHO || 1440), height: Number(process.env.ALTO || 900) },
  })
  pagina.on('pageerror', (e) => errores.push(`${ruta}: ${e.message}`))
  await pagina.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  // Las entradas de /app son animaciones con retardo (0,2-1,2 s): con menos
  // espera la primera pantalla se captura con el titular todavía en opacidad 0.
  await pagina.waitForTimeout(Number(process.env.ESPERA_INICIAL || 2600))
  // El bono de llegada es un modal BLOQUEANTE por orden del dueño y pone
  // `body { overflow: hidden }`: sin cerrarlo, el recorrido entero se captura
  // en la misma pantalla. `DISMAR=<texto del botón>` lo cierra antes de bajar.
  if (process.env.DISMAR) {
    await pagina.getByText(process.env.DISMAR, { exact: false }).first().click({ timeout: 4000 }).catch(() => {})
    await pagina.waitForTimeout(900)
  }
  const nombre = `${process.env.PREFIJO || ''}${ruta.replace(/^\//, '') || 'home'}`
  for (let i = 0; i < PASOS; i += 1) {
    await pagina.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), i * SALTO)
    await pagina.waitForTimeout(Number(process.env.ESPERA || 800))
    await pagina.screenshot({ path: join(salida, `${nombre}-${String(i).padStart(2, '0')}.png`) })
  }
  console.log(`${ruta}: ${PASOS} pantallas`)
  await pagina.close()
}
console.log(errores.length ? errores.join('\n') : 'sin errores de JS')
await browser.close()
