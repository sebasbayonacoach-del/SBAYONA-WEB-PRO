// Sondeo de revelados: recorre una ruta haciendo scroll y exige que cada bloque
// animado llegue a su estado diseñado. Dos fallos que caza, y que ningún ratchet
// ve (jerarquía y móvil no miran oclusión ni opacidad):
//   1. un bloque con clase de revelado que se queda atrapado con opacidad baja;
//   2. texto visible en pantalla con opacidad < 0,05 (página verde con agujero).
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-revelados.mjs [baseUrl] [/ruta ...]
//
// FALSOS POSITIVOS CONOCIDOS, comprobados uno a uno el 20-sep — NO salir a
// arreglarlos sin verificar antes con clic o con asentamiento:
//   · Titulares cuya entrada está atada a la POSICIÓN (`animation-timeline:
//     view()`): estando la caja entera dentro del viewport, el progreso todavía
//     no llegó al final y la opacidad es 0,3-0,8. Medido «CUATRO PLANES» de la
//     home: 0,998 a los 600 ms, 1,000 y `clip: inset(0 0 0)` al asentarlo.
//   · Respuestas cerradas del acordeón: el `<p>` conserva caja pero el componente
//     lo oculta. OJO: forzar `details.open = true` por JS NO vale, porque quien
//     controla la opacidad es el estado de React; hay que hacer `click()` en el
//     `summary`. Verificado así en /parkour-academy: las tres respuestas suben a
//     opacidad efectiva 1.
//   · Pasos inactivos del `StickyStage` (opacidad 0 por diseño, con la huella a
//     0,14 en el anterior).
// La sonda sigue siendo útil para lo que fue escrita: detectar revelados que se
// quedan atrapados a media tinta EN CUALQUIER posición, que es la trampa de
// cascada real.
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
const SEL = '.ds-reveal, .community-reveal, .resources-reveal, .app-reveal, [class*="reveal"]'
// 1,2 s de asiento: las reveladas por transición (community 0,8 s, resources
// 0,72 s) daban `op≈0,887` falsos si se leía a los 300 ms.
const ASIENTO = Number(process.env.ASIENTO || 1200)

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
let problemas = 0

for (const ruta of LISTA) {
  const pagina = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errores = []
  pagina.on('pageerror', (e) => errores.push(e.message))
  await pagina.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await pagina.waitForTimeout(2400)
  const alto = await pagina.evaluate(() => document.documentElement.scrollHeight)
  const atrapados = new Map()
  const invisibles = new Set()

  for (let y = 0; y < alto - 300; y += 700) {
    await pagina.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
    await pagina.waitForTimeout(ASIENTO)
    const r = await pagina.evaluate((sel) => {
      const atrap = []
      for (const el of document.querySelectorAll(sel)) {
        const caja = el.getBoundingClientRect()
        // Solo se juzga un bloque cuando ya está BIEN dentro de la pantalla.
        // Un `view()` con `animation-range: entry 0% entry 64%` tiene que dar
        // opacidad baja en un bloque que asoma por el borde inferior: eso es su
        // estado diseñado, no un atrapado. Leído así, /shop daba 26 falsos.
        if (caja.top > innerHeight * 0.45 || caja.bottom < innerHeight * 0.2) continue
        const op = Number(getComputedStyle(el).opacity)
        if (op < 0.95) atrap.push(`${(el.className || '').toString().split(' ')[0]} op=${op.toFixed(2)}`)
      }
      const inv = []
      for (const el of document.querySelectorAll('main h1, main h2, main h3, main p, main a, main button, main li')) {
        const caja = el.getBoundingClientRect()
        if (caja.bottom < 0 || caja.top > innerHeight || caja.width < 2) continue
        if (!el.textContent.trim()) continue
        if (Number(getComputedStyle(el).opacity) >= 0.05) continue
        // Y antes de nada, descartar texto dentro de un contenedor RECORTADO:
        // las respuestas cerradas del acordeón de la Academia y los pasos
        // inactivos del `StickyStage` conservan su caja de 25 px con opacidad 0
        // y no se pintan. Denunciarlos como «agujero» fue el último falso
        // positivo de esta sonda (cuatro párrafos en /parkour-academy, uno en /app).
        const cx = caja.left + caja.width / 2
        const cy = caja.top + caja.height / 2
        let recortado = false
        for (let q = el.parentElement; q && q.tagName !== 'MAIN'; q = q.parentElement) {
          const c = getComputedStyle(q)
          if (c.overflowX === 'visible' && c.overflowY === 'visible') continue
          const b = q.getBoundingClientRect()
          if (cx < b.left || cx > b.right || cy < b.top || cy > b.bottom) { recortado = true; break }
        }
        if (recortado) continue
        // Contenido que está oculto POR ESTADO, no por revelado: las respuestas
        // del acordeón cerradas (los cuatro `<p>` de /parkour-academy) y lo que
        // viva dentro de un panel oculto no son agujeros, son el diseño.
        if (el.closest('details:not([open]), [hidden], [aria-hidden="true"], .is-collapsed')) continue
        // Antes de llamarlo agujero hay que descartar afordancia de puntero:
        // `AMPLIAR` de /shop vive con `opacity: 0` y asoma con
        // `:hover, :focus-within`. Se marca el candidato y se lee DESPUÉS de
        // esperar: la transición de opacidad está en curso justo al enfocar, y
        // una lectura síncrona devuelve el valor viejo (dio 0 falsos positivos).
        el.dataset.probeIdx = String(inv.length)
        inv.push(`${el.tagName} "${el.textContent.trim().slice(0, 26)}"`)
      }
      return { atrap, inv, marcas: inv.length }
    }, SEL)
    for (const a of r.atrap) if (!atrapados.has(a)) atrapados.set(a, y)
    // Segunda pasada con más asiento antes de denunciar: las entradas con
    // `animation-timeline: view()` y los borrados por `clip-path` tardan en
    // cerrarse y una lectura a los 1,2 s pillaba aún el titular a media
    // animación (así salió el falso «INVISIBLE H2 CUATRO PLANES» en la home,
    // que medido con calma llega a opacidad 1,000 y `clip: inset(0 0 0)`).
    for (let i = 0; i < r.marcas; i += 1) {
      let op = await pagina.evaluate((idx) => {
        const el = document.querySelector(`[data-probe-idx="${idx}"]`)
        if (!el) return 1
        el.focus({ preventScroll: true })
        return new Promise((res) => {
          setTimeout(() => res(Number(getComputedStyle(el).opacity)), 400)
        })
      }, i)
      if (op < 0.5) {
        /*
         * Y aquí estaba el fallo de concepto de esta sonda. Con
         * `animation-timeline: view()` la opacidad NO es función del tiempo, es
         * función de la posición de scroll: si el muestreo cae en el tramo de
         * entrada, el elemento está a 0 POR DISEÑO y esperar 1,6 s no cambia un
         * solo valor. Por eso el «INVISIBLE H2 CUATRO PLANES» de la home se
         * denunciaba igual después de la segunda pasada, y por eso los `<li>` de
         * /shop con su capa AMPLIAR tampoco se resolvían. Lo que hay que
         * preguntar no es «¿sigue a 0 tras esperar?» sino «¿hay ALGÚN scroll
         * donde se vea?». Se centra en el viewport, se lee, y se devuelve al
         * sitio. Si ni centrado llega a 0,5, ese sí es un agujero.
         */
        op = await pagina.evaluate(async (idx) => {
          const el = document.querySelector(`[data-probe-idx="${idx}"]`)
          if (!el) return 1
          const origen = window.scrollY
          const caja = el.getBoundingClientRect()
          window.scrollTo(0, origen + caja.top - window.innerHeight / 2)
          await new Promise((r) => setTimeout(r, 700))
          const centrado = Number(getComputedStyle(el).opacity)
          window.scrollTo(0, origen)
          await new Promise((r) => setTimeout(r, 250))
          return centrado
        }, i)
      }
      if (op < 0.5) invisibles.add(r.inv[i])
    }
  }

  const cuenta = await pagina.evaluate((sel) => document.querySelectorAll(sel).length, SEL)
  problemas += atrapados.size + invisibles.size
  const estado = atrapados.size || invisibles.size ? 'PROBLEMAS' : 'ok'
  console.log(`\n${ruta}: ${cuenta} bloques de revelado · ${estado}`)
  for (const [a, y] of atrapados) console.log(`  ATRAPADO ${a} (scroll ${y})`)
  for (const i of invisibles) console.log(`  INVISIBLE ${i}`)
  if (errores.length) {
    problemas += errores.length
    console.log('  ERRORES JS: ' + [...new Set(errores)].join(' | '))
  }
  await pagina.close()
}

console.log(problemas ? `\nTOTAL PROBLEMAS: ${problemas}` : '\nTODAS LAS RUTAS LIMPIAS')
await browser.close()
