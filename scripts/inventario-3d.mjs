// Inventario para escribir el guion 3D de cada ruta.
// El objeto del cycler SIEMPRE cae centrado en la banda visible de su sección
// (comprobado: mover cameraPosition.y casi no lo desplaza), así que lo único que
// decide si un tramo aguanta decorado es el HUECO que deja su propio contenido.
// Por sección mide:
//   · si el fondo es CLARO (hueso) —un objeto oscuro detrás de texto oscuro es
//     ilegible pase lo que pase con el z-index—,
//   · si el titular va centrado o a sangre,
//   · la corrida vertical libre más larga en la franja central (x 25–75 %),
//     que es por donde barre el objeto al hacer scroll.
// Uso: MSYS_NO_PATHCONV=1 node scripts/inventario-3d.mjs [baseUrl] [/ruta ...]
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

const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => a.startsWith('http')) || 'http://localhost:4179'
import { exigirRutas } from './rutas-de-auditoria.mjs'
const LISTA = exigirRutas(ARGV)

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })

for (const ruta of LISTA) {
  const pagina = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await pagina.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await pagina.waitForTimeout(2400)
  // Recorremos la página para que las secciones con revelado por scroll tengan
  // su layout definitivo antes de medir.
  const alto = await pagina.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < alto; y += 1400) {
    await pagina.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
    await pagina.waitForTimeout(180)
  }
  await pagina.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await pagina.waitForTimeout(400)

  const datos = await pagina.evaluate(() => {
    // MISMOS criterios que `RouteSceneCycler.liveSections()`: secciones de
    // primer nivel, con altura, y sin lienzo propio (esas ya deciden solas).
    const secciones = [...document.querySelectorAll('section:not(section section)')].filter(
      (node) => node.offsetHeight > 0 && !node.querySelector('canvas'),
    )
    return secciones.map((s) => {
      const rect = s.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const h = Math.round(rect.height)
      const c = getComputedStyle(s)
      // Luminancia del fondo efectivo (puede venir de un degradado: se mira el
      // color de fondo plano y, si es transparente, el del ancestro con color).
      let nodo = s
      let fondo = 'rgba(0, 0, 0, 0)'
      while (nodo) {
        const cc = getComputedStyle(nodo).backgroundColor
        if (cc && cc !== 'rgba(0, 0, 0, 0)' && cc !== 'transparent') {
          fondo = cc
          break
        }
        nodo = nodo.parentElement
      }
      const m = fondo.match(/(\d+),\s*(\d+),\s*(\d+)/)
      const lum = m ? (0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3]) / 255 : 0
      const titular = s.querySelector('h1, h2, h3')
      const tc = titular ? getComputedStyle(titular) : null
      // Corrida libre en la franja central.
      const textos = [...s.querySelectorAll('h1, h2, h3, h4, p, li, td, th, button, a, figcaption')]
      const ocupado = []
      for (const el of textos) {
        const r = el.getBoundingClientRect()
        const x0 = r.left
        const x1 = r.right
        if (x1 < innerWidth * 0.25 || x0 > innerWidth * 0.75) continue
        if (!el.textContent.trim()) continue
        ocupado.push([r.top + window.scrollY - top, r.bottom + window.scrollY - top])
      }
      ocupado.sort((a, b) => a[0] - b[0])
      let libre = 0
      let cursor = 0
      for (const [ini, fin] of ocupado) {
        if (ini > cursor) libre = Math.max(libre, ini - cursor)
        cursor = Math.max(cursor, fin)
      }
      libre = Math.max(libre, h - cursor)
      return {
        titular: (titular?.textContent || '(sin titular)').trim().replace(/\s+/g, ' ').slice(0, 40),
        h,
        claro: lum > 0.55,
        centrado: tc ? /center/.test(tc.textAlign) || tc.marginLeft === tc.marginRight : false,
        libre: Math.round(libre),
      }
    })
  })

  console.log(`\n===== ${ruta} =====`)
  datos.forEach((d, i) => {
    const veredicto = d.claro ? 'SIN OBJETO (fondo claro)' : d.libre < 320 ? 'SIN OBJETO (sin hueco)' : d.centrado ? 'compacto/bajo' : 'vertical ok'
    console.log(
      `${String(i).padStart(2)} ${d.titular.padEnd(42)} h=${String(d.h).padStart(5)} ${d.claro ? 'CLARO' : 'oscuro'} ${d.centrado ? 'centr ' : 'sangr'} libre=${String(d.libre).padStart(4)} → ${veredicto}`,
    )
  })
  await pagina.close()
}

await browser.close()
