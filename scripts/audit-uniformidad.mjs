// Auditoría de uniformidad y puertas, ruta por ruta, en build de producción.
// Sustituye a las sondas sueltas (titulos/recortes/overlays) que no viajaron con
// el traslado del repo: una sola pasada mide, por ruta,
//   1. familias de tamaño/peso de h1-h4 (la uniformidad que pide el brief),
//   2. titulares recortados o desbordados (scrollWidth > clientWidth),
//   3. desbordamiento horizontal del documento,
//   4. elementos FIJOS que tapan el centro del contenido en tres puntos de scroll.
// Uso: MSYS_NO_PATHCONV=1 node scripts/audit-uniformidad.mjs [baseUrl] [/ruta ...]
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

/*
 * La lista vivía aquí y estaba mal: medía `/parkour`, que no es una ruta del
 * enrutador (`App.jsx:212` declara `/parkour-academy`), así que una de mis
 * «9 rutas comerciales uniformes» era la página 404. Se pasa al módulo
 * compartido, que además se niega a seguir si una entrada deja de existir.
 */
import { exigirRutas } from './rutas-de-auditoria.mjs'
const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => a.startsWith('http')) || 'http://localhost:4179'

const listas = exigirRutas(ARGV)

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
// ANCHO=390 ALTO=844 para el móvil real: la escala canónica de titulares cambia
// de cuerpo con `clamp()`, y un titular que cabe en 1440 puede partirse en 390.
const ANCHO = Number(process.env.ANCHO || 1440)
const ALTO = Number(process.env.ALTO || 900)
const fallos = []

for (const ruta of listas) {
  const pagina = await browser.newPage({ viewport: { width: ANCHO, height: ALTO } })
  pagina.on('pageerror', (e) => fallos.push(`${ruta} JS: ${e.message}`))
  await pagina.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await pagina.waitForTimeout(2600)

  const medida = await pagina.evaluate(() => {
    const red = (n) => Math.round(Number(n) * 10) / 10
    const titulos = [...document.querySelectorAll('main h1, main h2, main h3, main h4')]
      // Los rótulos dentro de las maquetas de dispositivo (teléfono, tablet,
      // reloj) son ARTEFACTO de interfaz, no titular de página: su peso y cuerpo
      // los decide el dibujo de la pantalla, no la escala editorial del sitio.
      .filter((el) => !el.closest('.app-phone-module, .app-tablet-module, .app-watch-module'))
    const familias = {}
    const recortados = []
    for (const el of titulos) {
      const c = getComputedStyle(el)
      const clave = `${el.tagName} ${red(parseFloat(c.fontSize))}px ${c.fontWeight}`
      familias[clave] = (familias[clave] || 0) + 1
      // Solo es recorte real si la caja RECORTA (overflow hidden/clip) o si la
      // palabra desborda de verdad la columna. Con `overflow: visible`, un
      // desborde de ~10 px sobre una caja de 350 cae dentro del padding de la
      // sección y no pierde un glifo: medirlo con tolerancia de 2 px convertía
      // la auditoría en un generador de falsos positivos (así salieron «CUATRO
      // PLANES» y «CUATRO NIVELES», a 11 px).
      const oculto = c.overflowY !== 'visible' || c.overflowX !== 'visible'
      const desbordeX = el.scrollWidth - el.clientWidth
      const horizontal = desbordeX > Math.max(16, el.clientWidth * 0.06)
      const vertical = oculto && el.scrollHeight > el.clientHeight + 2
      if (horizontal || vertical) {
        const caja = el.getBoundingClientRect()
        if (caja.width > 0) {
          recortados.push(`${el.tagName} "${el.textContent.trim().slice(0, 30)}" +${desbordeX}px`)
        }
      }
    }
    const doc = document.documentElement
    return {
      alto: doc.scrollHeight,
      overflowX: doc.scrollWidth - doc.clientWidth,
      familias,
      recortados,
    }
  })

  // Solapes de elementos fijos en tres puntos de scroll: solo cuenta si el
  // elemento fijo cubre el centro de un bloque de texto EN LOS TRES PUNTOS.
  // Una barra que tapa contenido mientras pasa el scroll es diseño (navbar
  // translúcida, panel de escala); una que lo tapa siempre es un bloqueo.
  const conteo = new Map()
  for (const y of [400, Math.round(medida.alto / 2), medida.alto - 1200]) {
    await pagina.evaluate((yy) => window.scrollTo({ top: Math.max(0, yy), behavior: 'instant' }), y)
    await pagina.waitForTimeout(700)
    const tapa = await pagina.evaluate(() => {
      const fijos = [...document.querySelectorAll('body *')].filter((el) => {
        const c = getComputedStyle(el)
        if (c.position !== 'fixed' || c.display === 'none' || c.visibility === 'hidden') return false
        const r = el.getBoundingClientRect()
        return r.height > 40 && r.width > 120 && Number(c.opacity) > 0.05
      })
      const textos = [...document.querySelectorAll('main h1, main h2, main h3, main p, main button, main a')]
      const malos = []
      for (const f of fijos) {
        const rf = f.getBoundingClientRect()
        const cx = rf.left + rf.width / 2
        const cy = rf.top + rf.height / 2
        for (const t of textos) {
          const rt = t.getBoundingClientRect()
          if (rt.width < 60 || rt.height < 16) continue
          const tcx = rt.left + rt.width / 2
          const tcy = rt.top + rt.height / 2
          const dentroCentro = tcx > rf.left && tcx < rf.right && tcy > rf.top && tcy < rf.bottom
          const area = Math.max(0, Math.min(rf.right, rt.right) - Math.max(rf.left, rt.left)) *
            Math.max(0, Math.min(rf.bottom, rt.bottom) - Math.max(rf.top, rt.top))
          if (dentroCentro || area > 0.3 * rt.width * rt.height) {
            // El propio contenido del fijo (su texto interno) no cuenta como tapado.
            if (f.contains(t)) continue
            malos.push(`${(f.className || f.tagName).toString().split(' ')[0]} > ${t.tagName} "${t.textContent.trim().slice(0, 24)}"`)
            break
          }
        }
      }
      return malos
    })
    for (const m of tapa) conteo.set(m, (conteo.get(m) || 0) + 1)
  }
  const solapes = [...conteo.entries()].filter(([, n]) => n >= 3).map(([m]) => m)

  const lineas = Object.entries(medida.familias).sort((a, b) => b[1] - a[1])
  console.log(`\n=== ${ruta} · alto ${medida.alto}px · overflowX ${medida.overflowX}px`)
  console.log('  titulos: ' + lineas.map(([k, v]) => `${k} ×${v}`).join(' | '))
  if (medida.recortados.length) console.log('  RECORTADOS: ' + medida.recortados.join(' | '))
  if (solapes.length) console.log('  BLOQUEO FIJO PERMANENTE: ' + solapes.join(' | '))
  if (medida.overflowX > 2) fallos.push(`${ruta}: overflow horizontal ${medida.overflowX}px`)
  if (medida.recortados.length) fallos.push(`${ruta}: ${medida.recortados.length} titulares recortados`)
  if (solapes.length) fallos.push(`${ruta}: fijo tapando contenido en los 3 puntos`)
  await pagina.close()
}

console.log(fallos.length ? `\nFALLOS:\n- ${fallos.join('\n- ')}` : '\nSIN FALLOS de uniformidad/puertas')
await browser.close()
