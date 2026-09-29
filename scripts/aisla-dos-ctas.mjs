// Aisla dos botones del inicio y dice QUE hace cada uno al pincharlo.
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
const RUTA = process.env.ROUTA || '/'
const OBJETIVOS = (process.env.TEXTOS || 'Abrir WhatsApp,QUIERO MI PRIMERA RUTINA').split('||')

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })

for (const texto of OBJETIVOS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errores = []
  const peticiones = []
  page.on('pageerror', (e) => errores.push(e.message.slice(0, 120)))
  page.on('request', (r) => { if (/wa\.me|whatsapp/i.test(r.url())) peticiones.push(r.url().slice(0, 90)) })
  await page.addInitScript(() => {
    window.__opened = []
    window.open = (u) => { window.__opened.push(String(u)); return null }
  })
  await page.goto(BASE + RUTA, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2600)

  const antes = await page.evaluate(() => ({ url: location.href, y: Math.round(scrollY), modales: document.querySelectorAll('[role="dialog"],.modal,[aria-modal="true"]').length }))
  const el = page.getByText(texto, { exact: false }).first()
  const existe = await el.count()
  const tag = existe ? await el.evaluate((n) => ({ tag: n.tagName, href: n.getAttribute('href'), closest: (n.closest('a,button') || {}).tagName || null, visible: n.getBoundingClientRect().height > 0 })) : null
  const popupPromise = page.waitForEvent('popup', { timeout: 2500 }).catch(() => null)
  let clickOk = 'no hay elemento'
  if (existe) clickOk = await el.click({ timeout: 4000, force: true }).then(() => 'ok').catch((e) => 'FALLO: ' + String(e.message).slice(0, 70))
  const popped = await popupPromise
  await page.waitForTimeout(1500)
  const despues = await page.evaluate(() => ({ url: location.href, y: Math.round(scrollY), modales: document.querySelectorAll('[role="dialog"],.modal,[aria-modal="true"]').length, abiertos: window.__opened, textoVisible: document.body.innerText.includes('WhatsApp') }))

  console.log(`\n### «${texto}»`)
  console.log('   existe:', !!existe, 'info:', JSON.stringify(tag))
  console.log('   click:', clickOk)
  console.log('   popup:', popped ? popped.url().slice(0, 90) : 'ninguno')
  console.log('   window.open:', JSON.stringify(despues.abiertos))
  console.log('   peticiones a wa.me:', peticiones.length ? peticiones.join(' , ') : 'ninguna')
  console.log('   antes:', JSON.stringify(antes))
  console.log('   despues:', JSON.stringify(despues))
  console.log('   errores JS:', errores.length ? errores.join(' | ') : 'ninguno')
  if (popped) await popped.close().catch(() => {})
  await page.close()
}
await browser.close()
