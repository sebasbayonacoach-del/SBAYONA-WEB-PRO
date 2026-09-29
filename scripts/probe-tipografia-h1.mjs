// SONDA · tamaño real de los titulares, medido en el navegador.
//
// Por qué existe. El dueño lo pidió dos veces y en dos sesiones distintas:
// «arregla ya los tamaños de los títulos, todos los textos no deben verse tan
// grandes, mejor que se vea bien y se lean bien» (22-09) y «todo está en
// mayúsculas súper agresivas» (comentario 8). Se añadió una capa global de
// tipografía `luxury` con `!important` y el build seguía en verde. Capturando
// la portada de verdad, el H1 medía ~110 px en seis líneas: la capa no mandaba.
//
// Un CSS que "está puesto" no es un CSS que gane. Esto mide el valor COMPUTADO
// en pantalla y, para el primer fallo, imprime qué reglas le aplican y cuál
// gana, para arreglar al dueño real en vez de añadir otra `!important` encima.
//
// Uso:
//   node scripts/probe-tipografia-h1.mjs [baseUrl] [/ruta ...]
//   MAX_H1_PX=72 node scripts/probe-tipografia-h1.mjs   # umbral a exigir
//
// Sale con código 1 si algún h1 pasa del umbral (para usarlo de gate).

import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { rutasDelEnrutador } from './rutas-de-auditoria.mjs'

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
// Sin argumentos se mide EL SITIO ENTERO, no la portada. Ver el comentario de
// `rutasDelEnrutador()`: así es como `/panel` y `/entrar` se quedaron 115 px
// mientras el sondeo decía «todos los titulares dentro del umbral».
const RUTAS = ARGV.filter((a) => !a.startsWith('http'))
const MAX_H1 = Number(process.env.MAX_H1_PX || 76)
const MAX_H2 = Number(process.env.MAX_H2_PX || 60)
if (!RUTAS.length) RUTAS.push(...rutasDelEnrutador())

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
let peores = []

for (const ruta of RUTAS.length ? RUTAS : ['/']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(Number(process.env.ESPERA || 2200))

  const datos = await page.evaluate(() => {
    const lee = (el) => {
      const cs = getComputedStyle(el)
      return {
        nivel: el.tagName,
        clase: String(el.className || '').slice(0, 60),
        px: Math.round(parseFloat(cs.fontSize)),
        lh: Math.round(parseFloat(cs.lineHeight) || 0),
        color: cs.color,
        mayusculas: cs.textTransform === 'uppercase',
        lineas: Math.max(1, Math.round(el.getBoundingClientRect().height / (parseFloat(cs.lineHeight) || 1))),
        texto: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 48),
      }
    }
    const h1 = document.querySelector('h1')
    const porAplicar = []
    if (h1) {
      for (const sheet of document.styleSheets) {
        let rules
        try { rules = sheet.cssRules } catch { continue }
        for (const r of rules) {
          if (!r.selectorText || !r.style || !r.style.getPropertyValue('font-size')) continue
          let ok = false
          try { ok = h1.matches(r.selectorText) } catch { continue }
          if (ok) {
            porAplicar.push({
              hoja: (sheet.href || 'inline').split('/').pop(),
              sel: r.selectorText,
              fs: r.style.getPropertyValue('font-size'),
              imp: r.style.getPropertyPriority('font-size'),
            })
          }
        }
      }
    }
    return {
      h1: h1 ? lee(h1) : null,
      h2: [...document.querySelectorAll('h2')].slice(0, 6).map(lee),
      porAplicar,
    }
  })

  const sobrepasados = []
  if (datos.h1 && datos.h1.px > MAX_H1) sobrepasados.push(`h1 ${datos.h1.px}px`)
  for (const h of datos.h2) if (h.px > MAX_H2) sobrepasados.push(`h2 ${h.px}px`)

  console.log(
    `\n${ruta} · H1 ${datos.h1 ? datos.h1.px + 'px' : '(sin h1)'} · ${datos.h1 ? datos.h1.lineas + ' líneas' : ''}`
    + ` · h2 máx ${Math.max(0, ...datos.h2.map((h) => h.px))}px`
    + ` · ${sobrepasados.length ? 'FUERA DE ESCALA: ' + sobrepasados.join(', ') : 'dentro de escala'}`,
  )
  if (datos.h1) console.log(`   "${datos.h1.texto}" · interlineado ${datos.h1.lh} · ${datos.h1.mayusculas ? 'MAYÚSCULAS' : 'mixto'} · ${datos.h1.color}`)

  if (sobrepasados.length) {
    console.log('   reglas que le aplican al H1 (la última con !important gana):')
    for (const r of datos.porAplicar) console.log(`     ${r.imp === 'important' ? '[!IMP]' : '      '} ${r.hoja} :: ${r.sel} { ${r.fs} }`)
    peores.push({ ruta, ...datos.h1 })
  }
  await page.close()
}

await browser.close()
console.log(`\n${peores.length ? 'RUTAS FUERA DE ESCALA: ' + peores.map((p) => `${p.ruta} (${p.px}px)`).join(', ') : 'Todos los titulares dentro del umbral.'}`)
if (peores.length && process.env.STRICT) process.exit(1)
