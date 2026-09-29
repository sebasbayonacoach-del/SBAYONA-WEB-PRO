// SONDA · imágenes que el navegador REALMENTE carga, ruta por ruta.
//
// Por qué existe. El plan de imágenes se verifica en tres sitios distintos y
// pueden no cuadrar: el hueco declarado en `siteMedia.js`, el archivo en
// `public/images/bayona-generated/` y el nombre en `GENERATED_BAYONA_SCENES`.
// La auditoría estática (`auditar-huecos-imagenes.mjs`) dice si cuadran en el
// papel. Esta dice si, en el build servido, cada `<img>` pinta: un `404`, un
// archivo de tamaño cero o un nombre mal escrito no salen en el build ni en los
// tests, y en pantalla se ven como un bloque vacío.
//
// Qué imprime por ruta:
//   · imágenes roto (naturalWidth 0) con su `src` y su clase
//   · cuántas vienen del banco nuevo y cuántas de la generación anterior
//   · repetidas DENTRO de la misma página (mismo archivo en dos secciones)
//
// Uso:
//   MSYS_NO_PATHCONV=1 node scripts/probe-imagenes-que-cargan.mjs [base] [/ruta ...]
//   BASE=http://localhost:4188 ANCHO=390 ALTO=844 MSYS_NO_PATHCONV=1 node ... /
//
// Nota: recorre la página entera antes de medir, porque el `loading="lazy"` no
// carga lo que no se ha acercado a pantalla; sin ese barrido daría «0 rotas»
// mintiendo por omisión.

import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { exigirRutas } from './rutas-de-auditoria.mjs'

const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => String(a).startsWith('http')) || process.env.BASE || 'http://localhost:4188'
const RUTAS = exigirRutas(ARGV)

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
let rotasTotal = 0
let casos = 0

for (const ruta of RUTAS) {
  const page = await browser.newPage({
    viewport: { width: Number(process.env.ANCHO || 1440), height: Number(process.env.ALTO || 900) },
  })
  const fallosRed = []
  const hostsExternos = new Set()
  let bytesImagen = 0
  let pesoMayor = { url: '', bytes: 0 }
  page.on('response', (respuesta) => {
    const url = respuesta.url()
    const esImagen = /\.(png|jpe?g|webp|avif|gif)(\?|$)/i.test(url)
    // Cualquier imagen servida desde otro dominio es un enlace caliente: si el
    // host ajeno cae o retira el archivo, la sección se queda vacía y aquí no
    // aparece porque no pasa por `/images/`. Se apunta aparte para poder contarlo.
    if (esImagen && !url.startsWith(BASE)) hostsExternos.add(url.replace(/^https?:\/\//, '').slice(0, 60))
    if (esImagen) {
      // Peso REAL transferido. Con el banco en PNG de ~1,8 MB por escena, la
      // cuenta de «cuántas imágenes» ya no dice nada: lo que duele en un móvil
      // son los bytes, y solo salen de la respuesta de red.
      const len = Number(respuesta.headers()['content-length'] || 0)
      bytesImagen += len
      if (len > pesoMayor.bytes) pesoMayor = { url: url.split('/images/').pop() || url, bytes: len }
    }
    if (/\/images\/.*\.(png|jpe?g|webp)$/i.test(url) && respuesta.status() >= 400) {
      fallosRed.push(`${respuesta.status()} ${url.split('/images/')[1]}`)
    }
  })
  await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2200)
  await page.evaluate(async () => {
    const alto = document.body.scrollHeight
    for (let y = 0; y < alto; y += 700) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 110))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(900)
  const datos = await page.evaluate(() => {
    // Dos maneras de pedir una imagen en este sitio: `<img>` (las escenas de
    // ficha) y `background-image` por CSS/`style` (los fondos inmersivos de
    // `sceneBackgroundProps`). Medir solo `<img>` daba «/faq: 0 img, sin rotas»
    // mientras el hero de FAQ se pinta por fondo: un instrumento que aprueba lo
    // que no mira es peor que no tenerlo.
    const urls = new Set()
    const img = [...document.querySelectorAll('img')].filter((el) => /\/images\//.test(el.currentSrc || el.src))
    for (const el of img) urls.add((el.currentSrc || el.src).split('/images/')[1])
    const fondos = []
    const apuntar = (valor, origen) => {
      if (!valor || valor === 'none') return
      for (const m of valor.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        if (/\/images\//.test(m[1])) {
          fondos.push(`${m[1].split('/images/')[1]} (${origen})`)
          urls.add(m[1].split('/images/')[1])
        }
      }
    }
    for (const el of document.querySelectorAll('body *')) {
      // Los fondos de este sitio también viven en pseudo-elementos: la capa
      // inmersiva de `sceneBackgroundProps` y varios `::before` decorativos.
      // Medir solo el elemento dejaba «/about: 0 imágenes, sin rotas» cuando la
      // página tiene nueve escenas pintadas.
      apuntar(getComputedStyle(el).backgroundImage, 'fondo')
      apuntar(getComputedStyle(el, '::before').backgroundImage, '::before')
      apuntar(getComputedStyle(el, '::after').backgroundImage, '::after')
    }
    const rotas = img
      .filter((el) => el.complete && el.naturalWidth === 0)
      .map((el) => `${(el.currentSrc || el.src).split('/images/')[1]}  .${String(el.className || '').split(/\s+/)[0]}`)
    const nombres = [...urls]
    // «nuevas vs viejas» escondía cuál de las carpetas antiguas seguía viva:
    // un `burst/` de stock y un `bayona-visuals/` defectuoso sumaban igual.
    // Ahora se cuenta por carpeta destino, que es lo que decide la auditoría.
    const porCarpeta = {}
    for (const n of nombres) {
      const carpeta = n.includes('/') ? n.split('/')[0] : '(raíz)'
      porCarpeta[carpeta] = (porCarpeta[carpeta] || 0) + 1
    }
    const nuevas = (porCarpeta['bayona-generated'] || 0)
    const viejas = nombres.length - nuevas
    const repetidas = {}
    for (const n of nombres) repetidas[n] = (repetidas[n] || 0) + 1
    return {
      total: nombres.length,
      img: img.length,
      fondos: [...new Set(fondos)].length,
      nuevas,
      viejas,
      porCarpeta,
      rotas: [...new Set(rotas)],
      coincidentes: nombres,
      repetidas: Object.entries(repetidas).filter(([, c]) => c > 1).map(([n, c]) => `${n} ×${c}`),
    }
  })
  casos += 1
  rotasTotal += datos.rotas.length + fallosRed.length
  const detalle = Object.entries(datos.porCarpeta)
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `${c} ${n}`)
    .join(' · ')
  console.log(
    `\n${ruta}: ${datos.total} imágenes distintos (${datos.img} <img> + ${datos.fondos} por fondo) · ${datos.nuevas} del banco nuevo, ${datos.viejas} de la generación anterior`,
  )
  console.log('  por carpeta: ' + detalle)
  if (bytesImagen > 0) {
    console.log(
      `  peso de las imágenes pedidas: ${(bytesImagen / 1024 / 1024).toFixed(1)} MB · mayor: ${pesoMayor.url} (${(pesoMayor.bytes / 1024).toFixed(0)} KB)`,
    )
  }
  if (datos.rotas.length) console.log('  ROTAS: ' + datos.rotas.join(' | '))
  // DETALLE=<substring> imprime las URLs concretas que coinciden, para poder
  // contestar «¿de verdad se está pidiendo ESTE archivo?» sin adivinar por la
  // cuenta de carpetas.
  if (process.env.DETALLE) {
    const b = String(process.env.DETALLE).toLowerCase()
    const hits = (datos.coincidentes || []).filter((n) => n.toLowerCase().includes(b))
    console.log(`  DETALLE «${process.env.DETALLE}»: ${hits.length ? hits.join(' | ') : 'NO SE CARGA'}`)
  }
  if (hostsExternos.size) console.log('  ' + [...hostsExternos].map((h) => 'ENLACE CALIENTE ' + h).join(' | '))
  if (fallosRed.length) console.log('  404 EN RED: ' + [...new Set(fallosRed)].join(' | '))
  if (datos.repetidas.length) console.log('  REPETIDA EN LA MISMA PAGINA: ' + datos.repetidas.join(' | '))
  if (!datos.rotas.length && !fallosRed.length) console.log('  sin imágenes rotas')
  await page.close()
}

await browser.close()
console.log(
  `\n${rotasTotal === 0 && casos > 0 ? 'OK' : 'ALERTA'}: ${casos} rutas medidas, ${rotasTotal} imágenes rotas.`,
)
if (process.env.STRICT && (rotasTotal > 0 || casos === 0)) process.exit(1)
