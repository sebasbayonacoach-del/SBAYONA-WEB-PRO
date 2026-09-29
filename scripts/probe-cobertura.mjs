// Cuánto contenido real ocupa cada sección.
// Quitarle el decorado 3D a una sección que estaba vacía deja la vacía igual, así
// que esto mide la otra mitad del problema: secciones altas donde el contenido
// cubre una fracción pequeña. Se cuenta la cobertura proyectando los recuadros de
// texto, imágenes, canvas y controles sobre el eje vertical de la sección (las
// solapaciones se unen, no se suman dos veces).
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-cobertura.mjs [baseUrl] [/ruta ...]
//
// LIMITACIÓN CONOCIDA: las secciones con `StickyStage` miden poco cubiertas y NO
// es un defecto — su alto es recorrido de scroll con el contenido fijado a una
// pantalla (medido en «NO ES MAGIA. ES MÉTODO»: 3375 px de sección, de los que
// 2700 son el `.sticky-stage`). Confirmar con captura antes de tocar ninguna de
// esas; las demás sí son lectura directa.
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
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2200)
  await p.getByText('RECLAMAR', { exact: false }).first().click({ timeout: 2500 }).catch(() => {})
  const alto = await p.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < alto; y += 1300) {
    await p.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), y)
    await p.waitForTimeout(200)
  }
  const datos = await p.evaluate(() => {
    const secciones = [...document.querySelectorAll('section:not(section section)')].filter(
      (n) => n.offsetHeight > 0,
    )
    return secciones.map((s) => {
      const sr = s.getBoundingClientRect()
      const top = sr.top + window.scrollY
      const h = sr.height
      const tramos = []
      for (const el of s.querySelectorAll('h1,h2,h3,h4,p,li,img,video,canvas,button,a,figure,table,svg')) {
        const r = el.getBoundingClientRect()
        if (r.width < 24 || r.height < 12) continue
        const c = getComputedStyle(el)
        if (c.visibility === 'hidden' || Number(c.opacity) < 0.05) continue
        tramos.push([r.top + window.scrollY - top, r.bottom + window.scrollY - top])
      }
      tramos.sort((a, b) => a[0] - b[0])
      let cubierto = 0
      let fin = 0
      for (const [a, b] of tramos) {
        const ini = Math.max(0, a)
        const f = Math.min(h, b)
        if (f > ini) {
          cubierto += Math.max(0, f - Math.max(ini, fin))
          fin = Math.max(fin, f)
        }
      }
      return {
        titular: (s.querySelector('h1,h2,h3')?.textContent || '(sin titular)').trim().replace(/\s+/g, ' ').slice(0, 34),
        h: Math.round(h),
        cov: h ? Math.round((100 * cubierto) / h) : 0,
      }
    })
  })
  const vacias = datos.filter((d) => d.h > 700 && d.cov < 45)
  console.log(`\n${ruta}: ${datos.length} secciones · ${vacias.length} con cobertura < 45 %`)
  for (const d of vacias) console.log(`  ${d.titular.padEnd(36)} h=${d.h} cov=${d.cov}%`)
  await p.close()
}
await browser.close()
