// AUDIT LAYOUT (throwaway, read-only). Mide anchos reales por seccion, bordes
// izquierdos, ritmo vertical y colisiones de elementos fijos con texto.
import { chromium } from '@playwright/test'
import { existsSync, readdirSync, mkdirSync } from 'node:fs'
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

const BASE = process.argv[2] || 'http://127.0.0.1:4188'
const ANCHOS = (process.env.ANCHOS || '1920,1440,1280,390').split(',').map(Number)
const RUTA = process.env.RUTA || '/'
const OUT = join('artifacts', 'tmp', 'layout-audit')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })

const MEDE = () => {
  const r = (el) => {
    if (!el || typeof el.getBoundingClientRect !== 'function') return { l: 0, r: 0, w: 0, t: 0, h: 0, bad: true }
    const b = el.getBoundingClientRect()
    return { l: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width), t: Math.round(b.top), h: Math.round(b.height) }
  }
  const label = (el) => (el.className && typeof el.className === 'string' ? el.className : '').trim().split(/\s+/)[0] || el.tagName.toLowerCase()

  // 1) secciones + su shell de contenido
  const secciones = [...document.querySelectorAll('main section, main > div > section')].map((s) => {
    const shell = s.querySelector('.section-shell, .hero-layout, [class*="-shell"], [class*="-content"], [class*="-grid"]')
    const heading = s.querySelector('h1,h2,h3')
    // contenido real: union de hijos con texto propio
    let cl = Infinity, cr = -Infinity, ct = Infinity, cb = -Infinity
    for (const n of s.querySelectorAll('h1,h2,h3,h4,p,li,a,button,figure,img')) {
      const t = (n.textContent || '').trim()
      if (!t && !n.matches('img')) continue
      const b = n.getBoundingClientRect()
      if (b.width === 0 || b.height === 0) continue
      if (getComputedStyle(n).position === 'fixed') continue
      cl = Math.min(cl, b.left); cr = Math.max(cr, b.right)
      ct = Math.min(ct, b.top); cb = Math.max(cb, b.bottom)
    }
    return {
      id: label(s),
      sec: r(s),
      shell: shell ? { cls: label(shell), ...r(shell) } : null,
      head: heading ? { txt: (heading.textContent || '').trim().slice(0, 34), ...r(heading) } : null,
      contentL: cl === Infinity ? null : Math.round(cl),
      contentR: cr === -Infinity ? null : Math.round(cr),
      contentW: cl === Infinity ? null : Math.round(cr - cl),
      cTop: ct === Infinity ? null : Math.round(ct),
      cBot: cb === Infinity ? null : Math.round(cb),
      nested: !!(s.parentElement && s.parentElement.closest('section')),
    }
  })

  // 2) anclas puntuales del hero / nav
  const PUNTOS = [
    ['nav', 'header nav, .site-nav, header'],
    ['hero-eyebrow', '.hero-eyebrow, .hero-kicker, [class*="eyebrow"]'],
    ['hero-h1', '.hero-layout h1, h1'],
    ['hero-body', '.hero-layout p, h1 ~ p, section p'],
    ['cta-row', '.hero-layout a, section a'],
  ]
  const anclas = {}
  for (const [k, sel] of PUNTOS) {
    const el = document.querySelector(sel)
    anclas[k] = el ? { sel, cls: label(el), ...r(el) } : null
  }

  // 3) elementos fijos visibles
  const fijos = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.position !== 'fixed') continue
    const b = el.getBoundingClientRect()
    if (b.width >= innerWidth - 4 && b.height >= innerHeight - 4) continue
    if (b.width < 8 || b.height < 8) continue
    if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) continue
    if (el.parentElement && el.parentElement !== document.body && getComputedStyle(el.parentElement).position === 'fixed') continue
    const txt = (el.textContent || '').trim().slice(0, 40)
    fijos.push({ cls: label(el), tag: el.tagName.toLowerCase(), txt, ...r(el), z: cs.zIndex })
  }

  // 4) borde real del nav (primer/ultimo nodo con texto propio)
  const header = document.querySelector('header')
  let navL = Infinity, navR = -Infinity
  if (header) for (const t of header.querySelectorAll('a,button,span,div,p')) {
    const propio = [...t.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    if (!propio) continue
    const b = t.getBoundingClientRect()
    if (!b.width) continue
    navL = Math.min(navL, b.left); navR = Math.max(navR, b.right)
  }

  // 5) ritmo vertical entre secciones hermanas
  const visibles = secciones.filter((s) => s.sec.h > 40 && s.cTop != null && !s.nested)
  const huecos = []
  for (let i = 1; i < visibles.length; i += 1) {
    const prev = visibles[i - 1], cur = visibles[i]
    huecos.push({
      entre: `${prev.id} -> ${cur.id}`,
      gapCajas: Math.round(cur.sec.t - (prev.sec.t + prev.sec.h)),
      gapVisual: Math.round(cur.cTop - prev.cBot),
      padTop: Math.round(cur.cTop - cur.sec.t),
      padBot: Math.round(prev.sec.t + prev.sec.h - prev.cBot),
    })
  }

  return { vw: window.innerWidth, scrollY: Math.round(window.scrollY), docH: document.body.scrollHeight, nav: { l: Math.round(navL), r: Math.round(navR) }, huecos, secciones, anclas, fijos }
}

const COLISION = () => {
  const pinta = (el) => {
    const cs = getComputedStyle(el)
    const bg = cs.backgroundColor
    const pintado = (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') || cs.backgroundImage !== 'none' || parseFloat(cs.borderTopWidth) > 0 || cs.textShadow !== 'none'
    if (pintado) return true
    return [...el.querySelectorAll('*')].some((d) => pinta(d))
  }
  const fx = [...document.querySelectorAll('body *')].filter((el) => {
    const cs = getComputedStyle(el)
    if (cs.position !== 'fixed') return false
    if (el.parentElement && getComputedStyle(el.parentElement).position === 'fixed') return false
    const b = el.getBoundingClientRect()
    if (b.width >= innerWidth - 4 && b.height >= innerHeight - 4) return false // capa decorativa a pantalla completa
    if (b.width < 8 || b.height < 8) return false
    if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false
    return pinta(el)
  })
  const txt = [...document.querySelectorAll('main h1,main h2,main h3,main h4,main p,main a,main button,main li,main span,footer a,footer p,header a')]
    .filter((n) => {
      if (n.closest('[style*="fixed"]')) return false
      const t = (n.textContent || '').trim()
      if (!t) return false
      if (n.querySelector('h1,h2,h3,h4,p,a,button,li')) return false // solo el nodo hoja
      const b = n.getBoundingClientRect()
      return b.width > 4 && b.height > 4
    })
  const hits = []
  for (const f of fx) {
    const fb = f.getBoundingClientRect()
    const fcs = getComputedStyle(f)
    for (const n of txt) {
      if (f.contains(n) || n.contains(f)) continue
      const nb = n.getBoundingClientRect()
      const ox = Math.min(fb.right, nb.right) - Math.max(fb.left, nb.left)
      const oy = Math.min(fb.bottom, nb.bottom) - Math.max(fb.top, nb.top)
      if (ox <= 2 || oy <= 2) continue
      const zF = parseInt(fcs.zIndex || '0', 10) || 0
      const zN = parseInt(getComputedStyle(n).zIndex || '0', 10) || 0
      if (zN > zF) continue // el texto va por encima: no tapa
      hits.push({
        fijo: (f.className || f.tagName).toString().trim().split(/\s+/)[0],
        fijoTxt: (f.textContent || '').trim().slice(0, 26),
        fijoBox: [Math.round(fb.left), Math.round(fb.top), Math.round(fb.right), Math.round(fb.bottom)].join(','),
        texto: (n.textContent || '').trim().slice(0, 40),
        tag: n.tagName.toLowerCase() + '.' + (n.className || '').toString().trim().split(/\s+/)[0],
        solape: `${Math.round(ox)}x${Math.round(oy)}`,
        px: Math.round(ox * oy),
      })
    }
  }
  return hits
}

const report = {}
for (const ancho of ANCHOS) {
  const page = await browser.newPage({ viewport: { width: ancho, height: 900 } })
  await page.goto(BASE + RUTA, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)
  await page.evaluate(async () => {
    const alto = document.body.scrollHeight
    for (let y = 0; y < alto; y += 500) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(1200)
  const top = await page.evaluate(MEDE)
  // barrido de colisiones
  const peor = new Map()
  const pasos = []
  for (let y = 0; y <= top.docH; y += Math.round(900 * 0.6)) {
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
    await page.waitForTimeout(320)
    const hits = await page.evaluate(COLISION)
    pasos.push({ y, n: hits.length })
    for (const h of hits) {
      const k = h.fijo + '||' + h.tag + '||' + h.texto.slice(0, 18)
      const cur = peor.get(k)
      if (!cur || h.px > cur.px) peor.set(k, { ...h, en: y })
    }
  }
  report[ancho] = { top, colisiones: [...peor.values()].sort((a, b) => b.px - a.px).slice(0, 120), pasos }
  await page.close()
}

await browser.close()
console.log(JSON.stringify(report, null, 1))
