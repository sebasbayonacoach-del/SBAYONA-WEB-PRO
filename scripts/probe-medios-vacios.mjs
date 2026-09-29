// SONDA · huecos de medio que se pintan vacíos.
//
// Por qué existe. Revisando capturas una a una (22-09) apareció el mismo defecto
// en páginas distintas: un contenedor con clase `-media`, `-figure`, `-visual`
// o `-stage` que ocupa su sitio en la retícula pero no lleva dentro ni imagen,
// ni canvas, ni vídeo, ni `background-image`. En `/programs` se veía como un
// rectángulo negro por el que asomaban las esferas grises del 3D; en
// `/parkour-academy`, como dos bloques grises bajo las tarjetas de edad. El
// `vite build` compila igual con el hueco lleno que vacío, ningún test lo mira,
// y el dueño lo resume en una línea del brief: «las imágenes deben justificar su
// presencia» (§2.3) y «premium no significa vacío» (§2.2).
//
// Qué hace. Abre cada ruta en un navegador real, recorre los contenedores de
// medio y reporta los que no pintan nada. No intenta adivinar por qué: solo
// dónde mirar.
//
// Uso:
//   MSYS_NO_PATHCONV=1 node scripts/probe-medios-vacios.mjs http://localhost:4188 / /programs /parkour-academy
//
// Necesita un `vite preview` levantado (ojo: escucha solo en IPv6, con
// `127.0.0.1` responde 000 y la sonda informaría de nada sin error).
//
// Falsos positivos conocidos: un contenedor que se rellena por JS más tarde, o
// uno decorativo que a propósito solo oscurece el fondo. Por eso imprime también
// el `background-color` y el hijo más cercano: la lectura correcta es «¿esto
// debería tener una foto y no la tiene?».

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

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
let total = 0

for (const ruta of RUTAS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(Number(process.env.ESPERA_INICIAL || 3000))

  // Baja la página entera para que el perezoso cargue antes de medir.
  await page.evaluate(async () => {
    const alto = document.body.scrollHeight
    for (let y = 0; y < alto; y += 700) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(700)

  const vacios = await page.evaluate(() => {
    const PATRON = /(media|figure|visual|stage|foto|imagen|image|thumb|portada|hero-media)/i
    const sale = []
    for (const el of document.querySelectorAll('[class]')) {
      /*
        Un <img>, un <canvas> o un <video> NO son un hueco: son el contenido.
        La primera versión los marcaba porque la comprobación de «¿tiene medio
        dentro?» solo miraba descendientes, y un elemento de medio no se contiene
        a sí mismo. Marcaba `.programs-stage-img` —que ES la foto— como hueco
        vacío, justo encima de la corrección que lo había llenado.
      */
      if (/^(IMG|CANVAS|VIDEO|PICTURE|IFRAME|SOURCE)$/.test(el.tagName)) continue
      const cls = String(el.className || '')
      if (!PATRON.test(cls)) continue
      const caja = el.getBoundingClientRect()
      if (caja.width < 120 || caja.height < 90) continue // decorativos pequeños
      if (el.querySelector('img, canvas, video, picture, iframe')) continue
      const cs = getComputedStyle(el)
      const tieneFondo = cs.backgroundImage && cs.backgroundImage !== 'none'
      const tieneHijoConFondo = [...el.querySelectorAll('*')].some((h) => {
        const s = getComputedStyle(h)
        return s.backgroundImage && s.backgroundImage !== 'none'
      })
      if (tieneFondo || tieneHijoConFondo) continue
      /*
        Un contenedor con un glifo y una etiqueta dentro NO está vacío. Primera
        pasada de esta sonda (22-09) marcó `.community-social-thumb.is-square`
        como hueco, y es un respaldo deliberado: cuando un post de Instagram no
        trae miniatura se muestra el icono de la plataforma y el @usuario, en
        lugar de inventar una captura. Contar eso como defecto empujaría a
        poner una foto falsa encima, que es justo lo que el brief prohíbe.
      */
      if (el.querySelector('svg')) continue
      if ((el.textContent || '').trim().length > 1) continue
      sale.push({
        clase: cls.split(' ').filter(Boolean).slice(0, 3).join('.'),
        caja: `${Math.round(caja.width)}x${Math.round(caja.height)}`,
        fondo: cs.backgroundColor,
        cerca: (el.closest('section')?.id || el.closest('section')?.className?.split(' ')[0] || '?'),
      })
    }
    // sin duplicar por clase repetida
    const vistos = new Set()
    return sale.filter((s) => !vistos.has(s.clase + s.caja) && vistos.add(s.clase + s.caja))
  })

  total += vacios.length
  console.log(`\n${ruta} · ${vacios.length} contenedor(es) de medio sin nada dentro`)
  for (const v of vacios) console.log(`   .${v.clase}  ${v.caja}  fondo=${v.fondo}  en ${v.cerca}`)
  await page.close()
}

console.log(`\n${total ? `TOTAL: ${total} huecos de medio que se pintan vacíos.` : 'OK: todo contenedor de medio pinta algo.'}`)
if (process.env.STRICT && total) process.exit(1)
