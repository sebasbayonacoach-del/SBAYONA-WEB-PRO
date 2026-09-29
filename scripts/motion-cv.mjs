// Pincha «Envía tu CV» en la pagina real y dice a donde lleva.
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function fb() {
  const c = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  for (const b of readdirSync(c).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
    const e = join(c, b, 'chrome-win64', 'chrome.exe')
    if (existsSync(e)) return e
  }
  return null
}

const br = await chromium.launch({ executablePath: fb(), headless: true })
const pg = await br.newPage({ viewport: { width: 1280, height: 900 } })
const pops = []
pg.on('popup', (p) => pops.push(p.url()))
const reqs = []
pg.on('request', (r) => { if (/mailto|form|typeform|notion|asana|workable|lever|greenhouse|jotform|drive|docs\./.test(r.url())) reqs.push(r.url().slice(0, 110)) })
await pg.goto('https://motionacademy.es/trabaja-con-nosotros/', { waitUntil: 'domcontentloaded', timeout: 40000 })
await pg.waitForTimeout(4000)

const botones = await pg.evaluate(() => [...document.querySelectorAll('a,button')].map((e) => ({
  t: (e.textContent || '').trim().slice(0, 50),
  href: e.getAttribute('href'),
  target: e.getAttribute('target'),
})).filter((x) => x.t))
console.log('elementos clicables:', botones.length)
for (const b of botones.filter((x) => /cv|env|aplic|inscri|trabaja|unete|form/i.test(x.t)).slice(0, 10)) {
  console.log(`   «${b.t}» href=${b.href} target=${b.target}`)
}
const objetivo = botones.find((b) => /cv/i.test(b.t))
if (objetivo) {
  await pg.getByText(objetivo.t, { exact: false }).first().click({ timeout: 5000 }).catch((e) => console.log('  click fallo:', e.message.slice(0, 60)))
  await pg.waitForTimeout(4000)
}
console.log('url tras el click:', pg.url())
console.log('popups:', pops.length ? pops.join(' , ') : 'ninguno')
console.log('peticiones sospechosas:', reqs.length ? [...new Set(reqs)].slice(0, 6).join('\n   ') : 'ninguna')
await pg.screenshot({ path: 'motion-cv.png' }).catch(() => {})
await br.close()
