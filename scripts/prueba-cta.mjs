// PRUEBA DE CTAs: pincha cada boton visible que parezca de contacto y apunta a donde
// llevaria a una persona. Cubre lo que un censo de <a href> no ve: los onClick que
// hacen window.open / location.href.
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function findBrowser() {
  const cache = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  for (const b of readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
    const exe = join(cache, b, 'chrome-win64', 'chrome.exe')
    if (existsSync(exe)) return exe
  }
  return null
}

const BASE = process.argv[2] || 'http://localhost:4173'
const RUTAS = (process.argv[3] || '/').split(',')
const CTA = /whatsapp|hablar|escrib|pide|pedir|reserv|empezar|apunta|contacta|quiero|sesion|valoracion|llamar/i
const PELIGRO = /borrar|salir|cerrar sesion|logout|pagar|comprar|eliminar/i

const base = BASE
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const vacios = []
const vistos = new Map()

for (const ruta of RUTAS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.addInitScript(() => {
    window.__opened = []
    window.open = (u) => { window.__opened.push(String(u)); return null }
    const pushNav = (u) => { try { window.__opened.push('NAV:' + new URL(u, location.href).href) } catch (_e) { /* navegación no interceptable en este navegador */ } }
    const origAssign = window.location.assign?.bind(window.location)
    try { window.location.assign = (u) => pushNav(u) } catch (_e) { /* navegación no interceptable en este navegador */ }
    void origAssign
  })
  await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2600)

  const candidatos = await page.evaluate(({ ctaSrc, peligroSrc }) => {
    const re = new RegExp(ctaSrc, 'i')
    const mal = new RegExp(peligroSrc, 'i')
    const out = []
    const els = [...document.querySelectorAll('button, a[href], [role="button"]')]
    for (const el of els) {
      const t = (el.textContent || '').trim()
      const href = el.getAttribute('href') || ''
      if (!t || t.length > 60) continue
      if (mal.test(t)) continue
      const esCTA = re.test(t) || /wa\.me|whatsapp|tel:/i.test(href)
      if (!esCTA) continue
      const r = el.getBoundingClientRect()
      if (r.height < 12) continue
      out.push({ t, href })
    }
    return out.slice(0, 18)
  }, { ctaSrc: CTA.source, peligroSrc: PELIGRO.source })

  const lineas = []
  for (const c of candidatos) {
    await page.evaluate(() => { window.__opened = [] })
    let destino = c.href && /^(https?:|tel:|mailto:|wa\.me)/i.test(c.href) ? c.href : ''
    if (!destino) {
      const popped = page.waitForEvent('popup', { timeout: 1500 }).catch(() => null)
      await page.getByText(c.t, { exact: false }).first().click({ timeout: 2500 }).catch(() => {})
      const p = await popped
      if (p) destino = p.url()
      if (!destino) destino = (await page.evaluate(() => window.__opened))?.[0] || ''
      if (p) await p.close().catch(() => {})
    }
    const normal = destino.replace(/\?.*$/, '')
    lineas.push({ texto: c.t, destino: destino.slice(0, 90) })
    if (normal) {
      const clave = normal.replace(/^https?:\/\//, '')
      vistos.set(clave, (vistos.get(clave) || 0) + 1)
    } else {
      vacios.push(`${base}${ruta} :: «${c.t}»`)
    }
  }
  console.log(`\n### ${ruta} — ${candidatos.length} CTA pinchados`)
  for (const l of lineas) console.log(`   «${l.texto}» → ${l.destino || '(NADA: el boton no abre contacto)'}`)
  await page.close()
}

console.log('\n===== DESTINOS ENCONTRADOS')
for (const [k, n] of [...vistos.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)} × ${k}`)
console.log(vacios.length ? `\n===== CTAS MUERTOS (${vacios.length})\n  ` + vacios.join('\n  ') : '\n===== ningun CTA sin destino')
await browser.close()
