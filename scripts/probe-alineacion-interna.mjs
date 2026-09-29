// Alineación INTERNA de cada sección: si el titular arranca en una X y su
// párrafo o su botón en otra, la sección se ve torcida aunque el raíl del sitio
// esté correcto. Es la mitad que no había medido: `probe-marco-de-titular.mjs`
// solo mira el titular.
//
// Para cada sección de cada ruta toma la X del titular, del primer párrafo y del
// primer enlace/botón, y marca las secciones donde no coinciden.
//
// Uso: MSYS_NO_PATHCONV=1 ANCHO=1920 node scripts/probe-alineacion-interna.mjs http://127.0.0.1:4188
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
const ANCHO = Number(process.env.ANCHO || 1920)
const TOL = Number(process.env.TOLERANCIA || 4)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const p = await browser.newPage({ viewport: { width: ANCHO, height: 900 } })

let total = 0
let flojas = 0
for (const ruta of ['/', '/about', '/programs', '/faq', '/resources', '/community', '/shop', '/app', '/onboarding', '/parkour-academy', '/plan/fuerza']) {
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(1800)
  const filas = await p.evaluate((tol) => {
    const secciones = [...document.querySelectorAll('main > section')]
    const out = []
    for (const s of secciones) {
      const h = s.querySelector('h1, h2')
      if (!h) continue
      const hb = h.getBoundingClientRect()
      if (hb.width === 0) continue
      const enca = (n) => Math.round(n.getBoundingClientRect().left)
      // El eyebrow NO es el cuerpo de texto: suele llevar `translateX(-14px)`
      // deliberado para que su texto cuadre con el titular salvando la rayita
      // que lo precede. Contarlo como párrafo daba 16 secciones «desalineadas»
      // que eran alineación óptica correcta. Se excluye por clase y por
      // transformación horizontal.
      const esCuerpo = (n) => {
        const s = getComputedStyle(n)
        if (/eyebrow|kicker|label|meta/i.test(String(n.className))) return false
        const t = s.transform
        if (t && t !== 'none') {
          const m = t.match(/matrix\(([^)]+)\)/)
          if (m && Math.abs(parseFloat(m[1].split(',')[4]) || 0) > 1) return false
        }
        return n.getBoundingClientRect().width > 0
      }
      const par = [...s.querySelectorAll('p')].find(esCuerpo)
      const acc = [...s.querySelectorAll('a,button')].find((n) => {
        const b = n.getBoundingClientRect()
        return b.width > 40 && b.height > 20 && (n.textContent || '').trim().length > 2
      })
      const hx = enca(h)
      const px = par ? enca(par) : null
      const ax = acc ? enca(acc) : null
      // Solo el cuerpo de texto manda el veredicto. El botón se informa pero no
      // acusa: en muchas secciones la acción vive a la derecha por diseño (una
      // ficha con su precio, un enlace de salida), y llamarlo desalineación era
      // el segundo falso positivo de esta sonda.
      const mal = px !== null && Math.abs(px - hx) > tol
      out.push({
        seccion: (s.className || s.id || '?').toString().split(' ')[0].slice(0, 26),
        h: (h.textContent || '').trim().slice(0, 16),
        hx,
        px,
        ax,
        mal,
      })
    }
    return out
  }, TOL)
  const malas = filas.filter((f) => f.mal)
  total += filas.length
  flojas += malas.length
  console.log(`### ${ruta} — ${filas.length} secciones, ${malas.length} con piezas desalineadas`)
  for (const f of malas)
    console.log(
      `    .${f.seccion.padEnd(26)} «${f.h}»  titular=${f.hx}  párrafo=${f.px ?? '—'}  botón=${f.ax ?? '—'}`,
    )
}
console.log(`\nTOTAL: ${total} secciones medidas, ${flojas} con el titular, el texto y la acción en verticales distintas.`)
await browser.close()
