// Recorre el onboarding del paquete local hasta el final y dice QUE se le ofrece
// a la persona cuando termina: enlaces de contacto reales, no intenciones.
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
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(BASE + '/onboarding', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3000)

const SALTAR = /atrás|atras|volver|salir|borrar|empezar de nuevo|no, gracias/i
const visitados = new Set()
let pasos = 0

for (let i = 0; i < 14; i += 1) {
  const info = await page.evaluate((saltarSrc) => {
    const skip = new RegExp(saltarSrc, 'i')
    const cand = [...document.querySelectorAll('button, [role="button"], label')]
      .map((el) => ({ el, t: (el.textContent || '').trim() }))
      .filter(({ el, t }) => t && t.length < 90 && !skip.test(t) && el.getBoundingClientRect().height > 20 && !el.disabled)
    return cand.slice(0, 6).map((c) => c.t)
  }, SALTAR.source)

  const elegir = info.find((t) => !visitados.has(t)) || info[0]
  if (!elegir) break
  visitados.add(elegir)
  const ok = await page.getByText(elegir, { exact: false }).first().click({ timeout: 3000 }).then(() => true).catch(() => false)
  if (!ok) break
  pasos += 1
  await page.waitForTimeout(1200)
  const fin = await page.evaluate(() => ({ url: location.pathname, hayInput: !!document.querySelector('input[type="email"],input[name="email"]') }))
  if (pasos > 2 && /gracias|resumen|listo|tu plan|regalo/i.test(await page.evaluate(() => document.body.innerText.slice(0, 400)))) break
}

const final = await page.evaluate(() => {
  const enlaces = [...document.querySelectorAll('a[href]')]
    .map((a) => a.getAttribute('href'))
    .filter((h) => /wa\.me|whatsapp|tel:|mailto:/i.test(h || ''))
  const botones = [...document.querySelectorAll('button')].map((b) => (b.textContent || '').trim()).filter(Boolean)
  return { url: location.pathname + location.search, enlaces: [...new Set(enlaces)], botones: botones.slice(0, 25), texto: document.body.innerText.replace(/\s+/g, ' ').slice(0, 700) }
})

console.log('pasos hechos:', pasos)
console.log('url final:', final.url)
console.log('enlaces de contacto:', JSON.stringify(final.enlaces))
console.log('botones visibles:', JSON.stringify(final.botones))
console.log('texto (700):', final.texto)
await page.screenshot({ path: join('artifacts', 'latest', 'viewport', 'onboarding-final.png') })
await browser.close()
