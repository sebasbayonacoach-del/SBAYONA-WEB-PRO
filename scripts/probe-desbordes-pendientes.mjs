// Dos defectos de espacio que quedan, medidos juntos para arreglarlos en un
// solo lote:
//  1) `.pain-item.premium-card` recorta 96px de texto por su `overflow: hidden`
//     (que está ahí para recortar el foco, no el contenido). Se busca qué
//     descendiente desborda y por qué.
//  2) A 1280px la píldora «CARRITO» se monta sobre el enlace «RECURSOS» del nav.
//     Se listan las parejas que se solapan con sus rect.
//
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-desbordes-pendientes.mjs http://127.0.0.1:4188
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

for (const w of (process.env.ANCHOS || '1280,1440,1920').split(',').map(Number)) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } })
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2400)
  const r = await p.evaluate(() => {
    // 1 · qué hijo de la tarjeta desborda
    const tarjetas = []
    for (const card of document.querySelectorAll('.pain-item.premium-card')) {
      const cb = card.getBoundingClientRect()
      const culpables = []
      for (const n of card.querySelectorAll('*')) {
        const s = getComputedStyle(n)
        if (s.display === 'none') continue
        const b = n.getBoundingClientRect()
        if (b.right > cb.right + 1 && b.width > 0) {
          culpables.push({
            q: (n.tagName.toLowerCase() + '.' + String(n.className).split(' ')[0]).slice(0, 26),
            sobra: Math.round(b.right - cb.right),
            ws: s.whiteSpace,
            txt: (n.textContent || '').trim().slice(0, 24),
          })
        }
      }
      if (culpables.length)
        tarjetas.push({
          desborde: Math.round(card.scrollWidth - card.clientWidth),
          culpables: culpables.slice(0, 3),
        })
    }
    // 2 · solapes reales del nav (solo hojas, sin contar ancestros)
    const nav = document.querySelector('.navbar')
    const nb = nav.getBoundingClientRect()
    const hojas = [...nav.querySelectorAll('a,button,span,strong')].filter((n) => {
      const s = getComputedStyle(n)
      const b = n.getBoundingClientRect()
      return s.display !== 'none' && b.width > 2 && b.height > 2 && (n.textContent || '').trim().length > 1
    })
    const pares = []
    for (let i = 0; i < hojas.length; i++)
      for (let j = i + 1; j < hojas.length; j++) {
        const A = hojas[i], B = hojas[j]
        if (A.contains(B) || B.contains(A)) continue
        const a = A.getBoundingClientRect(), b = B.getBoundingClientRect()
        const dx = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        const dy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        if (dx > 1 && dy > 1)
          pares.push({
            a: ((A.textContent || '').trim().slice(0, 12) || A.className),
            b: ((B.textContent || '').trim().slice(0, 12) || B.className),
            px: Math.round(dx),
          })
      }
    return { tarjetas: tarjetas.slice(0, 2), pares }
  })
  console.log(`### ${w} px`)
  for (const t of r.tarjetas) {
    console.log(`  tarjeta recortada ${t.desborde}px:`)
    for (const c of t.culpables) console.log(`    ${c.q} sobra ${c.sobra}px white-space=${c.ws} «${c.txt}»`)
  }
  if (!r.pares.length) console.log('  nav: sin solapes entre hojas')
  for (const q of r.pares) console.log(`  nav SOLAPE ${q.px}px: «${q.a}» × «${q.b}»`)
  await p.close()
}
await browser.close()
