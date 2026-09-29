// Qué tapa una capa FIJA cuando la página está EN REPOSO, y si eso que tapa se
// puede usar.
//
// Por qué existe este sondeo y no bastaba `probe-solapes.mjs`: su propia cabecera
// dice que los elementos `position: fixed` «ya los vigila probe-overlays». Ese
// sondeo no existía. Es decir: durante semanas el gate del repo ha mirado para
// otro lado justo en la familia de defectos que más páginas toca, porque la
///navbar, el chip de crédito, el orbe del acompañante, el botón de WhatsApp, la
// barra de unirse a la comunidad y el HUD de escala son TODOS fijos. Medido por
// barrido visual el 21-09: a 390 px el cromo fijo ocupa el 27-34 % del viewport
// y hay controles cuyo punto central cae debajo de otra capa — el CTA «VER LA
// COMUNIDAD» de /community en scroll 0, «QUIERO MI RUTINA GRATIS» de /resources,
// sumarios del acordeón de /faq, dos de los tres enlaces sociales del pie en
// TODAS las rutas. Eso no es estética: es un botón que no se pulsa.
//
// REGLA DE TRIAJE (la que discrimina, aprendida a golpes):
//   · elemento accionable (botón, enlace, input, summary) → solo cuenta si su
//     CENTRO cae debajo de la capa fija. Es el único caso en que no hay forma de
//     usarlo.
//   · texto → cuenta si el centro está tocado O si el área solapada es >= 30 %.
//     Menos de eso es rozar, y rozar lo hace cualquier flotante del web.
//   · se mide en REPOSO: si `html.is-scrolling` está activo las capas se han
//     replegado a propósito (ver useRecedeWhileScrolling) y no cuentan.
// Uso: MSYS_NO_PATHCONV=1 ANCHO=390 ALTO=844 node scripts/probe-overlays.mjs [baseUrl] [/ruta ...]
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { exigirRutas } from './rutas-de-auditoria.mjs'

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
const RUTAS = exigirRutas(ARGV)
const ANCHO = Number(process.env.ANCHO || 1440)
const ALTO = Number(process.env.ALTO || 900)
const PASOS = Number(process.env.PASOS || 9)
const ESPERA = Number(process.env.ESPERA || 900)

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
let total = 0

for (const ruta of RUTAS) {
  const page = await browser.newPage({ viewport: { width: ANCHO, height: ALTO } })
  await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)

  const informe = await page.evaluate(
    async ({ pasos, espera }) => {
      const alto = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const dormidos = []
      const accionables = new Set(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY', 'LABEL'])

      // `clip-path` sí recorta lo que se pinta y lo que recibe el puntero, pero
      // `getBoundingClientRect()` lo ignora por completo. La cortina de
      // `PageTransition` se queda montada tras el barrido con
      // `clip-path: inset(100% 0 0 0)`: mide 1440×900 fijos sobre todo el
      // contenido y NO tapa nada. Sin este filtro la sonda cantaba un
      // «BLOQUEO FIJO PERMANENTE» falso en `/entrar`.
      const lado = (tok, base) => {
        const n = parseFloat(tok) || 0
        return String(tok).endsWith('%') ? (n / 100) * base : n
      }
      const areaVisible = (clip, r) => {
        const total = r.width * r.height
        if (!clip || clip === 'none') return total
        const m = clip.match(/^inset\(([^)]+)\)$/i)
        if (!m) return total
        const t = m[1].trim().split(/\s+/).filter((x) => x.toLowerCase() !== 'round')
        if (!t.length) return total
        const [top, right, bottom, left] =
          t.length === 1
            ? [t[0], t[0], t[0], t[0]]
            : t.length === 2
              ? [t[0], t[1], t[0], t[1]]
              : t.length === 3
                ? [t[0], t[1], t[2], t[1]]
                : [t[0], t[1], t[2], t[3]]
        const w = r.width - lado(left, r.width) - lado(right, r.width)
        const h = r.height - lado(top, r.height) - lado(bottom, r.height)
        return w > 0 && h > 0 ? w * h : 0
      }

      // Las capas fijas que importan: con tamaño real y visible.
      const capasFijas = () =>
        [...document.querySelectorAll('body *')]
          .filter((el) => {
            const cs = getComputedStyle(el)
            if (cs.position !== 'fixed') return false
            if (cs.visibility === 'hidden' || cs.display === 'none') return false
            if (Number(cs.opacity) < 0.15) return false
            const r = el.getBoundingClientRect()
            if (!(r.width > 24 && r.height > 24 && r.bottom > 0 && r.top < window.innerHeight)) return false
            return areaVisible(cs.clipPath, r) >= 0.25 * r.width * r.height
          })
          .map((el) => ({ el, r: el.getBoundingClientRect() }))

      const nombre = (el) => {
        const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : ''
        return cls ? `.${cls}` : el.tagName.toLowerCase()
      }

      for (let i = 0; i <= pasos; i++) {
        window.scrollTo(0, Math.round((alto * i) / pasos))
        await new Promise((r) => setTimeout(r, espera))

        // En reposo: si el receso está activo, la capa ya se ha apartado sola.
        const enMovimiento = document.documentElement.classList.contains('is-scrolling')
        const capas = enMovimiento ? [] : capasFijas()
        if (!capas.length) continue

        const vistos = new Set()
        for (const { el, r } of capas) {
          // El contenido que podría estar sufriendo: hojas de texto y controles.
          for (const t of document.querySelectorAll('h1,h2,h3,h4,p,li,dd,dt,span,a,button,summary,input,textarea')) {
            if (el.contains(t) || t.contains(el)) continue
            if (vistos.has(t)) continue
            const es = t.getBoundingClientRect()
            if (es.width < 8 || es.height < 8) continue
            if (es.bottom < 0 || es.top > window.innerHeight) continue
            const texto = (t.textContent || '').trim().slice(0, 34)
            if (!texto) continue
            if (getComputedStyle(t).position === 'fixed') continue

            const areaComun =
              Math.max(0, Math.min(es.right, r.right) - Math.max(es.left, r.left)) *
              Math.max(0, Math.min(es.bottom, r.bottom) - Math.max(es.top, r.top))
            const proporcion = areaComun / (es.width * es.height)
            const centroTocado =
              (es.left + es.width / 2) >= r.left &&
              (es.left + es.width / 2) <= r.right &&
              (es.top + es.height / 2) >= r.top &&
              (es.top + es.height / 2) <= r.bottom

            const esControl = accionables.has(t.tagName) && t !== el
            const cuenta = esControl ? centroTocado : centroTocado || proporcion >= 0.3
            if (!cuenta) continue

            // ¿De verdad no se puede llegar? elementFromPoint en el centro tiene
            // que devolver la capa (o un descendiente suyo), no un hueco libre.
            const tocado = document.elementFromPoint(es.left + es.width / 2, es.top + es.height / 2)
            if (!tocado) continue
            if (!(el === tocado || el.contains(tocado) || tocado.contains(el))) continue

            // Y para un CONTROL, además: ¿existe ALGÚN scroll donde quede libre?
            // Una barra fija tapa por diseño lo que pasa por su banda; el
            // defecto es el control al que no se llega de ninguna manera (el
            // caso del acordeón de /faq bajo el botón de WhatsApp). Se prueba
            // centrándolo en el viewport y volviendo después al punto de antes.
            if (esControl) {
              const origen = window.scrollY
              const destino = Math.min(
                Math.max(es.top + window.scrollY - window.innerHeight / 2, 0),
                alto,
              )
              window.scrollTo(0, destino)
              await new Promise((r) => setTimeout(r, 400))
              const r2 = t.getBoundingClientRect()
              const c2 = document.elementFromPoint(r2.left + r2.width / 2, r2.top + r2.height / 2)
              const sigueTapado = c2 && (el === c2 || el.contains(c2) || c2.contains(el))
              window.scrollTo(0, origen)
              await new Promise((r) => setTimeout(r, 400))
              if (!sigueTapado) continue
            }

            vistos.add(t)
            dormidos.push({
              capa: nombre(el),
              etiqueta: esControl ? 'CONTROL' : 'texto',
              cosa: texto,
              proporcion: Math.round(proporcion * 100),
              scroll: Math.round(window.scrollY),
            })
            if (dormidos.length > 40) return dormidos
          }
        }
      }
      return dormidos
    },
    { pasos: PASOS, espera: ESPERA },
  )

  const controles = informe.filter((i) => i.etiqueta === 'CONTROL')
  total += informe.length
  const marca = informe.length ? (controles.length ? ' ' : ' ·') : ' ✓'
  console.log(`${ruta}${marca} ${informe.length} elementos tapados en reposo (${controles.length} son controles)`)
  for (const d of [...controles, ...informe.filter((i) => i.etiqueta !== 'CONTROL')].slice(0, 8)) {
    console.log(`   [${d.etiqueta}] ${d.cosa}  lo cubre ${d.capa}  ${d.proporcion}%  scroll ${d.scroll}`)
  }
  await page.close()
}

await browser.close()
console.log(`\nTOTAL: ${total}`)
