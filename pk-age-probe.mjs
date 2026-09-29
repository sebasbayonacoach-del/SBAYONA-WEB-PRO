import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function findBrowser() {
  const cache = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  if (!cache || !existsSync(cache)) return null
  for (const b of readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
    const exe = join(cache, b, 'chrome-win64', 'chrome.exe')
    if (existsSync(exe)) return exe
  }
  return null
}

const BASE = process.argv[2] || 'http://localhost:4193'
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(BASE + '/parkour-academy', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2500)

const data = await page.evaluate(() => {
  const out = []
  const track = document.querySelector('.academy-age-track')
  if (!track) return { error: 'no track' }
  const tc = track.getBoundingClientRect()
  const tcs = getComputedStyle(track)
  out.push({ el: 'TRACK', box: `${Math.round(tc.width)}x${Math.round(tc.height)} @${Math.round(tc.top)}`, bg: tcs.backgroundColor, img: tcs.backgroundImage.slice(0, 60), align: tcs.alignItems, gap: tcs.gap })
  for (const card of track.querySelectorAll('.academy-age')) {
    const b = card.getBoundingClientRect()
    const cs = getComputedStyle(card)
    const sum = card.querySelector('summary')
    const sb = sum.getBoundingClientRect()
    const strong = card.querySelector('summary > strong').getBoundingClientRect()
    const span = card.querySelector('summary > span')
    const pb = span.getBoundingClientRect()
    const p = span.querySelector('p').getBoundingClientRect()
    out.push({
      el: 'CARD ' + card.querySelector('strong').textContent,
      box: `${Math.round(b.width)}x${Math.round(b.height)}`,
      bg: cs.backgroundColor,
      bgImg: cs.backgroundImage.slice(0, 70),
      summary: `${Math.round(sb.width)}x${Math.round(sb.height)}`,
      numero: `${Math.round(strong.width)}x${Math.round(strong.height)}`,
      texto: `${Math.round(pb.width)}x${Math.round(pb.height)}`,
      parrafo: `${Math.round(p.width)}x${Math.round(p.height)}`,
    })
  }
  // elementos con clase que encaje con el patron del probe, en toda la pagina
  const PATRON = /(media|figure|visual|stage|foto|imagen|image|thumb|portada|hero-media)/i
  const hits = []
  for (const el of document.querySelectorAll('[class]')) {
    const cls = String(el.className || '')
    if (!PATRON.test(cls)) continue
    const caja = el.getBoundingClientRect()
    if (caja.width < 120 || caja.height < 90) continue
    const cs = getComputedStyle(el)
    hits.push({
      clase: cls.split(' ').filter(Boolean).slice(0, 3).join('.'),
      caja: `${Math.round(caja.width)}x${Math.round(caja.height)}`,
      fondo: cs.backgroundColor,
      hijo: (el.firstElementChild ? el.firstElementChild.className || el.firstElementChild.tagName : '-'),
      tieneImg: !!el.querySelector('img,canvas,video,picture'),
      bgImg: cs.backgroundImage !== 'none',
    })
  }
  return { out, hits }
})
console.log(JSON.stringify(data, null, 1))
await page.close()
await browser.close()
