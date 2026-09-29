// Versión 2: rellena el campo que pida texto y pulsa SIEMPRE el botón de avanzar.
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
const pasos = []
await page.goto(BASE + '/onboarding', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2600)

const AVANZAR = /^(seguir|continuar|siguiente|ver mi plan|finalizar|terminar|quiero el regalo|recibir|empezar|comenzar|entrar|pasa|ver (el|mi)|descubrir)/i

for (let i = 0; i < 22; i += 1) {
  const estado = await page.evaluate(() => {
    const vis = (el) => el && el.getBoundingClientRect().height > 8
    const inputs = [...document.querySelectorAll('input, textarea')].filter((el) => vis(el) && !el.disabled && el.type !== 'checkbox' && el.type !== 'radio')
    const botones = [...document.querySelectorAll('button,[role="button"]')].filter(vis).map((b) => (b.textContent || '').trim())
    const tit = (document.querySelector('h1,h2,h3') || {}).textContent || ''
    return {
      nInputs: inputs.length,
      primerInput: inputs[0] ? { type: inputs[0].type, name: inputs[0].name || inputs[0].id || '', valor: inputs[0].value } : null,
      botones: botones.slice(0, 14),
      titulo: tit.trim().slice(0, 60),
    }
  })
  pasos.push(`${i}: ${estado.titulo} | inputs=${estado.nInputs} ${estado.primerInput ? JSON.stringify(estado.primerInput.name) : ''} | ${estado.botones.slice(0, 6).join(' / ')}`)

  if (/gracias|resumen|tu regalo|listo|ya está|plan preparado|ya es tuyo|empieza por donde quieras/i.test(estado.titulo)) break

  if (estado.nInputs > 0) {
    const campo = page.locator('input:visible, textarea:visible').first()
    await campo.click({ timeout: 2500 }).catch(() => {})
    await campo.fill('Ana').catch(() => {})
    await page.waitForTimeout(400)
  } else {
    const opt = page.locator('button:visible, [role="button"]:visible')
      .filter({ hasText: /^(español|voy con prisa|tengo tiempo|españa|otro país de europa|colombia|otro país|fuerza|perder|parkour|principiante|3 a 5|adultos|online|no tengo|sí|no)/i }).first()
    if (await opt.count()) await opt.click({ timeout: 2500 }).catch(() => {})
  }

  let seguir = page.locator('button:visible, a:visible').filter({ hasText: AVANZAR }).first()
  if (!(await seguir.count())) {
    seguir = page.locator('button:visible, a:visible').filter({ hasText: /^(?!.*(volver|atras|atrás|saltar|solo quiero mirar|carrito|espa|english|portugu|cambiar mi nombre)).{4,60}$/i }).first()
  }
  if (await seguir.count()) {
    await seguir.click({ timeout: 3000 }).catch(() => {})
  } else {
    break
  }
  await page.waitForTimeout(1100)
}

const final = await page.evaluate(() => {
  const enlaces = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => /wa\.me|whatsapp|tel:|mailto:/i.test(h || ''))
  const botones = [...document.querySelectorAll('button,[role="button"]')].map((b) => (b.textContent || '').trim()).filter(Boolean)
  return { url: location.pathname, enlaces: [...new Set(enlaces)], botones: [...new Set(botones)].slice(0, 20), texto: document.body.innerText.replace(/\s+/g, ' ').slice(-1200) }
})

console.log(pasos.join('\n'))
console.log('\nURL FINAL:', final.url)
console.log('ENLACES CONTACTO:', JSON.stringify(final.enlaces))
console.log('BOTONES:', JSON.stringify(final.botones))
console.log('TEXTO FINAL:', final.texto.slice(0, 900))
await page.screenshot({ path: join('artifacts', 'latest', 'viewport', 'onboarding-final-2.png'), fullPage: false })
await browser.close()
