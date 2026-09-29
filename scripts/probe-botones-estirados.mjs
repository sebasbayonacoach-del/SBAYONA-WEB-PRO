// SONDA · botones de icono estirados por la regla global de diana táctil.
//
// Por qué existe. `src/overrides.css` fija `min-height: 48px` a TODOS los
// `<button>` del sitio. La intención es buena (WCAG 2.5.5 / 48 px de diana) y en
// el dedo es obligatoria. El problema es que se aplica también en escritorio,
// donde un control de 23 px diseñado cuadrado pasa a medir 23 × 48: la `×` del
// globo del acompañante, los pasos de cantidad del carrito, las flechas del
// carrusel. Se ve como un botonecito deformado y nadie lo escribió a propósito.
//
// Señal medida: un botón cuyo ANCHO declarado es menor que 48 px y cuya altura
// computada es exactamente la de la diana. Es decir, el botón no es cuadrado por
// diseño sino porque se lo impuso la regla. Se imprime también el `min-height`
// que gana, para no discutir con conjeturas.
//
// Uso:
//   MSYS_NO_PATHCONV=1 node scripts/probe-botones-estirados.mjs [baseUrl] [/ruta ...]
//
// Toca medir con `TACTIL=1` para el caso de dedo (emula pantalla táctil, donde
// los 48 px SÍ deben seguir ahí). Sin ese flag se mide el puntero fino, que es
// donde la regla sobra.

import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function findBrowser() {
  const cache = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  if (!cache || !existsSync(cache)) return null
  for (const b of readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
    const exe = join(cache, b, 'chrome-win64', 'chrome.exe')
    if (existsSync(exe)) return exe
  }
  return null
}

const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => a.startsWith('http')) || 'http://localhost:4188'
const RUTAS = ARGV.filter((a) => !a.startsWith('http'))
if (!RUTAS.length) RUTAS.push('/')
const TACTIL = process.env.TACTIL === '1'

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
let total = 0
let vistos = 0

for (const ruta of RUTAS) {
  const page = await browser.newPage({
    viewport: { width: Number(process.env.ANCHO || 1440), height: Number(process.env.ALTO || 900) },
    hasTouch: TACTIL,
    isMobile: TACTIL,
  })
  await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.evaluate(async () => {
    const alto = document.body.scrollHeight
    for (let y = 0; y < alto; y += 700) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 90))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  const datos = await page.evaluate(() => {
    const culpables = []
    for (const el of document.querySelectorAll('button, [role="button"]')) {
      const caja = el.getBoundingClientRect()
      if (caja.width < 4 || caja.height < 4) continue
      const co = getComputedStyle(el)
      if (co.visibility === 'hidden' || co.display === 'none') continue
      // Solo nos interesan los que por diseño eran compactos: el ancho manda.
      if (caja.width >= 48) continue
      if (caja.height < 46) continue
      culpables.push({
        clase: String(el.className || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.'),
        etiqueta: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 26),
        w: Math.round(caja.width),
        h: Math.round(caja.height),
        minHeight: co.minHeight,
      })
    }
    return { culpables, puntero: matchMedia('(pointer: fine)').matches ? 'fino' : 'grueso' }
  })
  vistos += 1
  total += datos.culpables.length
  console.log(
    `\n${ruta} · puntero ${datos.puntero} · ${datos.culpables.length} botones compactos estirados a la diana`,
  )
  for (const c of datos.culpables.slice(0, 12)) {
    console.log(`  ${c.w}×${c.h}  .${c.clase || '(sin clase)'}  «${c.etiqueta}»  min-height ${c.minHeight}`)
  }
  if (datos.culpables.length > 12) console.log(`  … y ${datos.culpables.length - 12} más`)
  await page.close()
}

await browser.close()
console.log(
  `\n${total === 0 ? 'OK' : 'ALERTA'}: ${total} botones compactos deformados en ${vistos} rutas medidas (modo ${TACTIL ? 'táctil' : 'puntero fino'}).`,
)
if (process.env.STRICT && (TACTIL ? false : total > 0)) process.exit(1)
