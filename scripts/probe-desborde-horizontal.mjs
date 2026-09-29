// SONDA · desborde horizontal real, medido en el DOM renderizado.
//
// Por qué existe. Un titular a `clamp(56px, 13vw, 190px)` con `-0.075em` de
// tracking puede salirse del carril en móvil sin que nadie lo vea en el editor:
// `vite build` compila igual y ningún test declara anchos. Aquí se mide el hecho
// —qué elemento ocupa más de lo que hay, a qué ancho— en vez de suponerlo.
//
// Qué mide, por ruta y en 360 / 768 / 1440:
//   1. La página entera: `documentElement.scrollWidth` contra el ancho de
//      ventana. Scroll horizontal en una página comercial es un defecto.
//   2. Los nodos que desbordan a su propia caja, con clase y medida. Es la lista
//      de sospechosos, no una sentencia: un carrusel desborda a propósito, y por
//      eso se excluye lo que tenga un ancestro con `overflow-x` util.
//
// Uso:
//   MSYS_NO_PATHCONV=1 node scripts/probe-desborde-horizontal.mjs [ruta...]
//   BASE=http://localhost:4188 MSYS_NO_PATHCONV=1 node scripts/probe-desborde-horizontal.mjs
//
// Necesita un `vite preview` del build (ojo: escucha solo en IPv6; con
// `127.0.0.1` responde 000 y la sonda informaría de nada sin error).
// Medir en `dev` vale poco: la cascada y las hojas por ruta se montan distinto.
//
// Falsos positivos conocidos: un bloque decorativo pensado para sangrar (un
// `-bleed`, una palabra gigante que sale del carril a propósito). Por eso se
// imprime la clase y la medida, no un veredicto. Y el contrario: antes de parar
// el recorrido en `body`, el `overflow-x: clip` global hacía de amnistía para
// los 29 nodos que desbordaban en Home — la sonda decía limpio sin mirar.

import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { exigirRutas } from './rutas-de-auditoria.mjs'

const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => String(a).startsWith('http')) || process.env.BASE || 'http://localhost:4188'
const RUTAS = exigirRutas(ARGV)
const ANCHOS = [360, 768, 1440]

function findBrowser() {
  const cache = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  if (!cache || !existsSync(cache)) return null
  for (const b of readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
    const exe = join(cache, b, 'chrome-win64', 'chrome.exe')
    if (existsSync(exe)) return exe
  }
  return null
}

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
let fallos = 0
let casos = 0

for (const ruta of RUTAS) {
  const lineas = []
  for (const ancho of ANCHOS) {
    casos += 1
    const page = await browser.newPage({ viewport: { width: ancho, height: 900 } })
    try {
      await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2500)
      // Baja la página para que los revelados y el perezoso terminen de montar.
      await page.evaluate(async () => {
        const alto = document.body.scrollHeight
        for (let y = 0; y < alto; y += 700) {
          window.scrollTo({ top: y, behavior: 'instant' })
          await new Promise((r) => setTimeout(r, 110))
        }
        window.scrollTo({ top: 0, behavior: 'instant' })
      })
      const datos = await page.evaluate(() => {
        const doc = document.documentElement
        const sospechosos = []
        // Dos señales distintas, y la segunda es la que importa aquí: con
        // `body { overflow-x: clip }` la página no puede tener scroll horizontal,
        // así que el ancho del documento SIEMPRE cuadra y medirlo daría un OK
        // vacío. Lo que de verdad se ve roto es el nodo que se sale del borde
        // derecho de la ventana: si además hay un ancestro que recorta, el
        // contenido no se desplaza, simplemente no se ve.
        const anchoVentana = window.innerWidth
        for (const el of document.querySelectorAll('body *')) {
          if (el.closest('svg')) continue
          const caja = el.getBoundingClientRect()
          if (caja.width < 24 || caja.height < 8) continue
          const fuera = Math.round(caja.right - anchoVentana)
          if (fuera <= 2) continue
          const co = getComputedStyle(el)
          if (co.position === 'fixed') continue
          let ancestro = el.parentElement
          let recorte = null
          while (ancestro && ancestro !== document.body) {
            const c = getComputedStyle(ancestro).overflowX
            if (c === 'auto' || c === 'scroll' || c === 'hidden' || c === 'clip') {
              recorte = `${ancestro.tagName.toLowerCase()}.${String(ancestro.className || '').split(/\s+/)[0]}:${c}`
              break
            }
            ancestro = ancestro.parentElement
          }
          const clases = String(el.className || '')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 3)
            .join('.')
          sospechosos.push({
            etiqueta: `${el.tagName.toLowerCase()}${clases ? '.' + clases : ''}`,
            fuera,
            ancho: Math.round(caja.width),
            estado: recorte ? `cortado por ${recorte}` : 'desborda',
          })
        }
        sospechosos.sort((a, b) => b.fuera - a.fuera)
        return {
          pagina: Math.round(doc.scrollWidth),
          ventana: anchoVentana,
          sospechosos: sospechosos.slice(0, 4),
        }
      })
      const globalMal = datos.pagina > datos.ventana + 1
      if (globalMal) fallos += 1
      fallos += datos.sospechosos.filter((s) => s.estado === 'desborda' && s.fuera > 8).length
      lineas.push({ ancho, ...datos, globalMal })
    } catch (e) {
      fallos += 1
      lineas.push({ ancho, error: String(e.message).split('\n')[0].slice(0, 70) })
    } finally {
      await page.close()
    }
  }
  console.log(`\n${ruta}`)
  for (const l of lineas) {
    if (l.error) {
      console.log(`  ${l.ancho}px: ERROR ${l.error}`)
      continue
    }
    console.log(
      `  ${l.ancho}px: ${l.globalMal ? 'SCROLL-HORIZONTAL' : 'sin scroll h'}  ${l.pagina}/${l.ventana}` +
        (l.sospechosos.length
          ? `\n      fuera del borde derecho: ${l.sospechosos.map((s) => `${s.etiqueta} +${s.fuera}px (${s.estado}, caja ${s.ancho}px)`).join('\n      · ')}`
          : ''),
    )
  }
}

await browser.close()
console.log(
  `\n${fallos === 0 && casos > 0 ? 'OK' : 'ALERTA'}: ${casos} combinaciones ruta/ancho medidas, ${fallos} con scroll horizontal en la página.`,
)
if (process.env.STRICT && (fallos > 0 || casos === 0)) process.exit(1)
