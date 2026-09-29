// Se puede pintar el CTA del héroe POR ENCIMA de la burbuja del acompañante sin
// tocar comportamiento? Depende de si algún ancestro del botón crea contexto de
// apilamiento (isolation, transform, filter, z-index con posición): si lo crea,
// su tope queda sellado ahí dentro y ningún z-index lo saca por encima de un
// `position: fixed` hermano.
//
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-puede-subir-cta.mjs http://127.0.0.1:4188
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

const BASE = process.argv.slice(2).find((a) => a.startsWith('http')) || 'http://127.0.0.1:4188'
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: 1280, height: 820 } })
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
// La burbuja NO existe al cargar: aparece a los ~260px de scroll (medido con
// `probe-cuano-aparece-burbuja.mjs`), así que sin desplazarse esta sonda no
// encuentra nada que comparar.
await p.waitForTimeout(2000)
await p.evaluate(() => window.scrollTo(0, 260))
await p.waitForTimeout(1800)

const r = await p.evaluate(() => {
  const cta = [...document.querySelectorAll('a,button')].find((n) => /EMPEZAMOS EL RECORRIDO/i.test(n.textContent || ''))
  const burbuja = document.querySelector('.companion')
  if (!cta || !burbuja) return { error: 'falta CTA o burbuja', cta: !!cta, burbuja: !!burbuja }

  const bs = getComputedStyle(burbuja)
  const cadena = []
  for (let n = cta; n && n !== document.documentElement; n = n.parentElement) {
    const s = getComputedStyle(n)
    const crea =
      (s.isolation && s.isolation !== 'auto') ||
      (s.position !== 'static' && s.zIndex !== 'auto') ||
      (s.transform && s.transform !== 'none') ||
      (s.filter && s.filter !== 'none') ||
      (s.backdropFilter && s.backdropFilter !== 'none') ||
      (s.opacity && parseFloat(s.opacity) < 1) ||
      (s.willChange && s.willChange !== 'auto') ||
      (s.contain && /\b(paint|layout|stack|strict|content)\b/.test(s.contain))
    cadena.push({
      q: (n.tagName.toLowerCase() + '.' + String(n.className).split(' ')[0]).slice(0, 28),
      z: s.zIndex,
      pos: s.position,
      iso: s.isolation,
      creaContexto: !!crea,
    })
    if (cadena.length > 8) break
  }
  const cb = cta.getBoundingClientRect()
  const bb = burbuja.getBoundingClientRect()
  const dx = Math.min(cb.right, bb.right) - Math.max(cb.left, bb.left)
  const dy = Math.min(cb.bottom, bb.bottom) - Math.max(cb.top, bb.top)
  return {
    burbuja: { z: bs.zIndex, pos: bs.position, w: Math.round(bb.width), right: Math.round(bb.right) },
    cadena,
    solapePx2: dx > 0 && dy > 0 ? Math.round(dx * dy) : 0,
    // ¿Quién recibe el puntero en el centro del botón? Si no es el botón, está tapado.
    quienRecibe: (() => {
      const el = document.elementFromPoint(cb.left + cb.width / 2, cb.top + cb.height / 2)
      return el ? el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0].slice(0, 24) : 'nada'
    })(),
  }
})

if (r.error) console.log(r.error, r)
else {
  console.log(`burbuja: z=${r.burbuja.z} ${r.burbuja.pos} ancho=${r.burbuja.w} llega a x=${r.burbuja.right}`)
  console.log(`a 260px de scroll — solape con el CTA: ${r.solapePx2} px²  ·  en el centro del botón recibe el puntero: .${r.quienRecibe}`)
  console.log('cadena del CTA hacia arriba (¿algún ancestro sella el apilamiento?):')
  for (const f of r.cadena) console.log(`    ${f.q.padEnd(28)} z=${f.z.padEnd(6)} pos=${f.pos.padEnd(9)} isolation=${f.iso.padEnd(6)} ${f.creaContexto ? '⟵ CIERRA contexto' : ''}`)
}

// Barrido: la burbuja es `fixed` (su y no cambia) y el CTA sube al scrollear, así
// que el solape, si existe, ocurre en un punto concreto del recorrido. Medir una
// sola posición es lo que hizo que la captura pareciera un defecto permanente.
//
// Ojo con el instrumento: el elemento `.companion` puede estar en el DOM con un
// rect perfectamente medible mientras todavía no se pinta (opacity 0 en su
// entrada). Contar geométría sin mirar si existe de verdad da un solape fantasma
// en scroll 0. Se exige visible (opacity > 0.05 y no `hidden`) Y se confirma con
// el golpe de puntero real en el centro del botón, que es lo único que al usuario
// le fastidia.
let peor = null
const tramo = []
for (let y = 0; y <= 2600; y += 130) {
  await p.evaluate((v) => window.scrollTo(0, v), y)
  await p.waitForTimeout(220)
  const m = await p.evaluate(() => {
    const cta = [...document.querySelectorAll('a,button')].find((n) => /EMPEZAMOS EL RECORRIDO/i.test(n.textContent || ''))
    const bub = document.querySelector('.companion')
    if (!cta || !bub) return null
    const cs = getComputedStyle(bub)
    const visible = cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity || '1') > 0.05
    const a = cta.getBoundingClientRect(), b = bub.getBoundingClientRect()
    const dx = Math.min(a.right, b.right) - Math.max(a.left, b.left)
    const dy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
    const px2 = dx > 1 && dy > 1 ? Math.round(dx * dy) : 0
    const toca = (() => {
      const el = document.elementFromPoint(a.left + a.width / 2, a.top + a.height / 2)
      return el ? bub.contains(el) || el === bub : false
    })()
    return { scroll: Math.round(window.scrollY), opacity: cs.opacity, visible, px2, tapa: visible && toca }
  })
  if (!m) continue
  tramo.push(m)
  if (m.tapa && (!peor || m.px2 > peor.px2)) peor = m
}
const conBurbuja = tramo.filter((t) => t.visible)
console.log(`burbuja visible en ${conBurbuja.length}/${tramo.length} pasos del barrido (aparece a partir de ${conBurbuja[0]?.scroll ?? '—'}px)`)
console.log(`solape geométrico con la burbuja visible: ${Math.max(0, ...conBurbuja.map((t) => t.px2))} px²`)
console.log(peor ? `PEOR solape REAL (tapa el botón): ${peor.px2} px² a ${peor.scroll}px de scroll` : 'PEOR solape REAL: ninguno — la burbuja nunca intercepta el puntero sobre el CTA')
await browser.close()
