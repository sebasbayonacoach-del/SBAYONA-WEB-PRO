// medir-escena.mjs — cuantifica si un objeto 3D realmente SE VE.
//
// Por qué existe: «la escena está montada» (probe-escenas) y «hay píxeles
// distintos al fondo» no es lo mismo que «el usuario distingue el objeto».
// Una barra con álbedo #0c0c0d sobre un fondo #050505 monta el lienzo, pasa
// todas las sondas estructurales y en pantalla es un borrón. Esta sonda mide
// el lienzo recortado y devuelve el histograma de luminancia.
//
// Uso:
//   MSYS_NO_PATHCONV=1 node scripts/medir-escena.mjs /community "tres niveles"
//   RUTA=/community TEXTO="lee. guarda" node scripts/medir-escena.mjs
//
// Devuelve por sección: id montado, tamaño del lienzo, luminancia media,
// percentiles 50/90/99 y el porcentaje de píxeles por encima de 40/255
// (umbral pragmático: por debajo de eso el ojo no separa figura de fondo).

import { chromium } from '@playwright/test'
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function findBrowser() {
  const cache = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  for (const b of readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
    const exe = join(cache, b, 'chrome-win64', 'chrome.exe')
    if (existsSync(exe)) return exe
  }
  return null
}

const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => a.startsWith('http')) || 'http://localhost:4179'
const RUTA = ARGV.find((a) => a.startsWith('/') && !a.startsWith('http')) || process.env.RUTA
const TEXTO = ARGV.find((a) => !a.startsWith('/') && !a.startsWith('http')) || process.env.TEXTO

if (!RUTA || !TEXTO) {
  throw new Error('Faltan argumentos: node scripts/medir-escena.mjs <ruta> "<texto de la sección>"')
}

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(BASE + RUTA, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2500)

// La sección buscada: el lienzo del cycler solo existe dentro de la sección
// ACTIVA, así que hay que llegar a ella antes de preguntar por el canvas.
const localizar = (texto) => {
  const rx = new RegExp(texto, 'i')
  const secciones = [...document.querySelectorAll('section[id]')]
  const sec = secciones.find((s) => rx.test(s.textContent || ''))
  if (!sec) return { error: 'sección no encontrada', ids: secciones.map((s) => s.id).slice(0, 40) }
  const r = sec.getBoundingClientRect()
  const canvas = sec.querySelector('canvas')
  const c = canvas ? canvas.getBoundingClientRect() : null
  return {
    id: sec.id,
    falta: { top: window.scrollY + r.top, alto: r.height },
    caja: c ? { x: c.x, y: c.y, width: c.width, height: c.height } : null,
    escena: canvas
      ? canvas.closest('[data-scene-id]')?.dataset.sceneId || canvas.getAttribute('data-scene-id') || null
      : null,
  }
}

let objetivo = await page.evaluate(localizar, TEXTO)
if (objetivo.error) {
  console.log(`ERROR ${RUTA}: ${objetivo.error}`)
  if (objetivo.ids) console.log('secciones:', objetivo.ids.join(' · '))
  await browser.close()
  process.exit(1)
}

// Dos pasadas: la primera activa la sección (el cycler monta al entrar en
// pantalla) y la segunda mide con el portal ya dentro y el encuadre asentado.
for (const espera of [1800, 1400]) {
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: 'instant' }),
    Math.max(0, objetivo.falta.top - 200),
  )
  await page.waitForTimeout(espera)
  objetivo = await page.evaluate(localizar, TEXTO)
  if (objetivo.caja) break
}

if (!objetivo.caja) {
  console.log(`ERROR ${RUTA}: la sección ${objetivo.id} no llegó a montar lienzo`)
  await browser.close()
  process.exit(1)
}

const caja = objetivo.caja
if (caja.width < 2 || caja.height < 2) {
  console.log(`ERROR ${RUTA}: lienzo sin tamaño medible`, JSON.stringify(caja))
  await browser.close()
  process.exit(1)
}

// AISLAR=1: esconde el contenido DOM y el velo de la sección para que el PNG
// muestre SOLO lo que pinta el lienzo. Sin esto no se puede saber si un cambio
// de material llegó a pantalla o se lo comió el velo.
if (process.env.AISLAR) {
  await page.evaluate((opts) => {
    const rx = new RegExp(opts.texto, 'i')
    const sec = [...document.querySelectorAll('section[id]')].find((s) => rx.test(s.textContent || ''))
    document.documentElement.style.background = '#000'
    for (const el of document.querySelectorAll('[class*="veil" i]')) el.style.display = 'none'
    // El velo y las marcas de agua de las secciones son PSEUDO-elementos:
    // `display:none` sobre nodos no los toca y salían en el PNG como si fueran
    // geometría. Se retiran con una hoja inyectada, y se pone el lienzo por
    // encima de todo para que no lo tape ningún fondo.
    const hoja = document.createElement('style')
    hoja.textContent = `
      section, section *, section *::before, section *::after, section::before, section::after {
        background-image: none !important;
      }
      [data-scene-cycler]::before, [data-scene-cycler]::after { display: none !important; }
    `
    // SOLTAR=1 añade el truco de sacar el lienzo de su contenedor. Solo para
    // mirar materiales: `clip-path` recorta también a los descendientes fixed,
    // así que mover el canvas falsea exactamente el recorte que se quiere ver.
    if (opts.soltar) {
      hoja.textContent += `
        canvas { position: fixed !important; inset: 0 !important; z-index: 2147483000 !important; }
      `
    }
    document.head.appendChild(hoja)
    if (!sec) return
    const canvas = sec.querySelector('canvas')
    for (const el of sec.querySelectorAll('*')) {
      if (el === canvas || canvas.contains(el) || el.contains(canvas)) continue
      el.style.visibility = 'hidden'
    }
  }, { texto: TEXTO, soltar: Boolean(process.env.SOLTAR) })
  await page.waitForTimeout(900)
}

const clip = {
  x: Math.max(0, Math.round(caja.x)),
  y: Math.max(0, Math.round(caja.y)),
  width: Math.min(1440 - Math.max(0, Math.round(caja.x)), Math.round(caja.width)),
  height: Math.min(900 - Math.max(0, Math.round(caja.y)), Math.round(caja.height)),
}
if (clip.width < 2 || clip.height < 2) {
  console.log(`ERROR ${RUTA}: el lienzo cae fuera de la ventana`, JSON.stringify({ clip, caja }))
  await browser.close()
  process.exit(1)
}

const png = await page.screenshot({ clip })
if (process.env.AISLAR) {
  const archivo = `artifacts/latest/aislar-${objetivo.id}.png`
  writeFileSync(archivo, png)
  console.log('png aislado:', archivo)
}

// El PNG se decodifica en el propio navegador: sin dependencias nuevas y con el
// mismo descodificador que usa el diseño.
const medida = await page.evaluate(async (b64) => {
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  const bitmap = await createImageBitmap(new Blob([bin], { type: 'image/png' }))
  const c = document.createElement('canvas')
  c.width = bitmap.width
  c.height = bitmap.height
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bitmap, 0, 0)
  const { data } = ctx.getImageData(0, 0, c.width, c.height)
  const lum = new Float64Array(256)
  let total = 0
  let suma = 0
  for (let i = 0; i < data.length; i += 4) {
    const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    lum[Math.min(255, Math.round(l))]++
    suma += l
    total++
  }
  const pct = (p) => {
    let acc = 0
    const objetivo2 = total * p
    for (let v = 0; v < 256; v++) {
      acc += lum[v]
      if (acc >= objetivo2) return v
    }
    return 255
  }
  return {
    px: total,
    media: Number((suma / total).toFixed(1)),
    p50: pct(0.5),
    p90: pct(0.9),
    p99: pct(0.99),
    sobre40: Number(((lum.slice(40).reduce((a, b) => a + b, 0) / total) * 100).toFixed(1)),
  }
}, png.toString('base64'))

console.log(
  `${RUTA} · ${objetivo.id} · escena=${objetivo.escena ?? '?'} · ` +
    `lienzo=${Math.round(caja.width)}x${Math.round(caja.height)} · ` +
    `media=${medida.media} p50=${medida.p50} p90=${medida.p90} p99=${medida.p99} ` +
    `>40/255=${medida.sobre40}%`,
)
await browser.close()
