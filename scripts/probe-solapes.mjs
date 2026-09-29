// Elementos de DOM pintados ENCIMA de texto que no es suyo.
// El caso real que motivó esto: en /programs los tres botones «AÑADIR AL
// CARRITO» tapaban la mitad de los precios ($35.000 / $60.000 / $25.000) porque
// el pie de la ficha era de dos columnas y el precio, a 67 px, desbordaba la
// suya. Eso NO lo ve ni el ratchet de jerarquía ni el de móvil: las letras están
// en su sitio, lo que falla es la superposición.
// Método: para cada hoja con texto visible, mirar con elementFromPoint quién
// recibe el puntero en su centro. Si el que recibe no es el propio texto ni un
// ancestro suyo, hay algo pintado encima. Se ignoran los elementos fijos (esos
// ya los vigila probe-overlays / el barrido del HUD) y lo que está recortado por
// el borde del viewport.
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-solapes.mjs [baseUrl] [/ruta ...]
//
// QUÉ NO PUEDE DISTINGUIR (triado el 20-sep sobre las 9 rutas; las tres clases
// que quedaban tras los filtros fueron comprobadas una por una y NINGUNA es un
// defecto — no volver a abrirlas):
//   · Etiquetas flotantes de formulario: `NOMBRE`/`EMAIL` «tapados» por su propio
//     `input` son el patrón diseñado.
//   · Enlaces extendidos de tarjeta: `.app-anatomy-trigger` (/app) y
//     `.resources-publication-open` (/resources) son botones TRANSPARENTES que
//     cubren la ficha entera para que sea clicable. Medido en captura: el texto
//     («ANATOMÍA VISUAL», los títulos de artículo) se lee entero.
//   · `details` cerrados del acordeón de la Academia: la respuesta conserva su
//     caja de 25 px pero no se pinta; el `summary` del siguiente ítem cae encima.
//   · Un `overflow: hidden` que recorta texto propio NO es superposición; eso lo
//     mide audit-uniformidad.mjs.
// Lo que SÍ cazó y era de verdad: los precios de /programs bajo los botones
// «AÑADIR AL CARRITO» (pie de ficha de dos columnas con el precio a 67 px
// desbordando su pista). Ese es su uso: detector de regresiones de ese tipo, no
// lista de trabajo automática.
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
let total = 0

for (const ruta of LISTA) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2400)
  await p.getByText('RECLAMAR', { exact: false }).first().click({ timeout: 2200 }).catch(() => {})
  const alto = await p.evaluate(() => document.documentElement.scrollHeight)
  const vistos = new Map()
  for (let y = 0; y < alto - 400; y += 700) {
    await p.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), y)
    await p.waitForTimeout(260)
    const r = await p.evaluate(() => {
      const hojas = []
      for (const el of document.querySelectorAll('main *')) {
        if (el.childElementCount > 0) continue
        const t = (el.textContent || '').trim()
        if (t.length < 3) continue
        const r = el.getBoundingClientRect()
        if (r.width < 24 || r.height < 12) continue
        if (r.top < 90 || r.bottom > innerHeight - 8) continue
        // Opacidad EFECTIVA del texto que se protege: en los escenarios fijados
        // hay tarjetas completas a `opacity: 0`; su texto sigue midiendo 1 en el
        // propio nodo, y filtrar solo por eso hacía la sonda inutilizable (85
        // denuncias, todas de pasos ocultos del escenario).
        let ef = 1
        for (let q = el; q && q.tagName !== 'MAIN'; q = q.parentElement) {
          ef *= Number(getComputedStyle(q).opacity)
          if (ef < 0.5) break
        }
        if (ef < 0.5) continue
        // Y falta lo contrario: que el TEXTO esté recortado por un ancestro con
        // `overflow: hidden`. Es el caso de las respuestas cerradas del acordeón
        // de la Academia —un `details` con la fila a 0 fr deja al `<p>` su caja
        // natural (25 px) pero no lo pinta—, y la sonda lo denunciaba como
        // «tapado por el summary siguiente» cuando simplemente no está ahí.
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        let recortado = false
        for (let q = el.parentElement; q && q.tagName !== 'MAIN'; q = q.parentElement) {
          const c = getComputedStyle(q)
          if (c.overflowX === 'visible' && c.overflowY === 'visible') continue
          const b = q.getBoundingClientRect()
          if (cx < b.left || cx > b.right || cy < b.top || cy > b.bottom) { recortado = true; break }
        }
        if (recortado) continue
        hojas.push([el, r])
      }
      const out = []
      for (const [el, r] of hojas) {
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        if (!top || top === el || el.contains(top) || top.contains(el)) continue
        const tc = getComputedStyle(top)
        // Fijos y pegajosos no cuentan: el contenido pasa por debajo al scrollear
        // y eso es diseño (la navbar y la barra de filtros de /shop viven ahí).
        if (tc.position === 'fixed' || tc.position === 'sticky') continue
        if (top.closest('.navbar, .site-header')) continue
        // Un icono SVG dentro del botón NO tapa el texto del botón: son hermanos
        // bajo el mismo control. Solo importa cuando el que cubre viene de fuera.
        const dueño = top.closest('button, a, summary, label')
        if (dueño && dueño.contains(el)) continue
        // Un elemento con opacidad 0 SIGUE recibiendo el puntero: en los
        // escenarios fijados (`StickyStage`) las tarjetas inactivas se apilan en
        // la misma celda con `opacity: 0`, y sin este filtro la sonda denunciaba
        // 86 «superposiciones» que eran pasos ocultos del propio escenario.
        // Se multiplica la opacidad de toda la cadena hasta `main`.
        let efectiva = 1
        for (let q = top; q && q.tagName !== 'MAIN'; q = q.parentElement) {
          efectiva *= Number(getComputedStyle(q).opacity)
          if (efectiva < 0.05) break
        }
        if (efectiva < 0.05) continue
        // Una etiqueta con `pointer-events: none` no puede aparecer en el
        // hit-test ni siquiera estando POR DELANTE: `elementFromPoint` la
        // atraviesa y devuelve lo de detrás. Medido el 22-09-2026: «Explora el
        // mapa» de /about (z-index 4 y `pointer-events: none` en su propia
        // regla) figuraba como «tapado por el mapa» cuando se pinta delante.
        // No se descarta en silencio: se marca, porque la única prueba de esos
        // casos es la captura.
        let atravesable = false
        for (let q = el; q && q.tagName !== 'MAIN'; q = q.parentElement) {
          if (getComputedStyle(q).pointerEvents === 'none') { atravesable = true; break }
        }
        out.push(
          `"${(el.textContent || '').trim().slice(0, 26)}" lo cubre .${(typeof top.className === 'string' && top.className ? top.className : top.tagName).toString().split(' ')[0]}` +
            (atravesable ? '  [etiqueta pointer-transparente: el hit-test no vale aquí, hay que mirar la captura]' : ''),
        )
      }
      return out
    })
    for (const x of r) if (!vistos.has(x)) vistos.set(x, y)
  }
  total += vistos.size
  if (vistos.size) {
    console.log(`\n${ruta}: ${vistos.size} textos tapados por otro elemento`)
    for (const [k, y] of vistos) console.log(`  ${k}  (scroll ${y})`)
  } else {
    console.log(`${ruta}: sin superposiciones`)
  }
  await p.close()
}
console.log(`\nTOTAL: ${total}`)
await browser.close()
