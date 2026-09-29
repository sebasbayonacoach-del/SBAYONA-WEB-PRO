// SONDA · qué pesan de verdad las imágenes de cada ruta, PNG frente a WebP.
//
// Por qué existe. Contar imágenes no dice nada cuando el banco propio es PNG
// de ~1,8 MB por escena: `/resources` llegó a pedir **41,2 MB** en un build de
// producción, y esa cifra no salía de ninguna comprobación anterior porque
// ninguna miraba `content-length`. Esta suma bytes reales de red por ruta y
// separa el formato, que es lo que delata si el canal WebP está llegando o no.
//
// Qué busca además, y es el motivo de fondo:
//   · PNG que se descargan aunque exista su gemelo WebP -> un consumidor que no
//     pasa por `SceneBackground` (un `poster=` de vídeo, un `url()` suelto en un
//     CSS). Son los únicos sitios donde la regla del banco no llega.
//   · cualquier 4xx de imagen, que en pantalla es un hueco negro.
//
// Uso:
//   MSYS_NO_PATHCONV=1 node scripts/peso-de-imagenes.mjs [base] [/ruta ...]
//   STRICT=1 ... # sale 1 si alguna ruta pesa más de UMBRAL_MB o hay 4xx

import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { exigirRutas } from './rutas-de-auditoria.mjs'

const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => String(a).startsWith('http')) || process.env.BASE || 'http://localhost:4188'
const RUTAS = exigirRutas(ARGV)
const UMBRAL_MB = Number(process.env.UMBRAL_MB || 8)

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
let totalMB = 0
let peores = []
let fallos = []

for (const ruta of RUTAS) {
  const page = await browser.newPage({
    viewport: { width: Number(process.env.ANCHO || 1440), height: Number(process.env.ALTO || 900) },
  })
  let png = 0
  let webp = 0
  let kb = 0
  const pngNombres = []

  page.on('response', (respuesta) => {
    const url = respuesta.url()
    if (!/\/images\/.*\.(png|webp|jpe?g)/i.test(url)) return
    const nombre = url.split('/images/')[1].split('?')[0]
    if (respuesta.status() >= 400) {
      fallos.push(`${respuesta.status()} ${ruta} -> ${nombre}`)
      return
    }
    const bytes = Number(respuesta.headers()['content-length'] || 0) / 1024
    kb += bytes
    if (/\.png$/i.test(nombre)) {
      png += 1
      pngNombres.push(`${nombre} (${(bytes / 1024).toFixed(1)} MB)`)
    } else if (/\.webp$/i.test(nombre)) {
      webp += 1
    }
  })

  await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1600)
  await page.evaluate(async () => {
    const alto = document.body.scrollHeight
    for (let y = 0; y < alto; y += 700) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 80))
    }
  })
  await page.waitForTimeout(2000)
  await page.close()

  const mb = kb / 1024
  totalMB += mb
  if (mb > UMBRAL_MB) peores.push(`${ruta} ${mb.toFixed(1)} MB`)
  console.log(
    `${ruta.padEnd(20)} PNG ${String(png).padStart(2)} · WebP ${String(webp).padStart(2)}  =  ${mb.toFixed(1).padStart(5)} MB`,
  )
  if (pngNombres.length) console.log('   PNG aún descargados: ' + pngNombres.join(', '))
}

console.log(`\nTOTAL ${RUTAS.length} rutas: ${totalMB.toFixed(1)} MB`)
if (fallos.length) console.log('IMÁGENES CON 4xx:\n  ' + [...new Set(fallos)].join('\n  '))
if (peores.length) console.log(`POR ENCIMA DE ${UMBRAL_MB} MB: ${peores.join(' · ')}`)
if (process.env.STRICT && (fallos.length || peores.length)) process.exit(1)
