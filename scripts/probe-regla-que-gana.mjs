// SONDA · qué regla gana sobre un elemento, con su hoja y su valor.
// Sustituye a buscar a mano en `src/styles.css` (minificado, 4.000 líneas):
// el navegador ya hizo la cascada por nosotros.
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-regla-que-gana.mjs <base> <selector> [propiedad]
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
const fb = () => { const c = join(process.env.LOCALAPPDATA || '', 'ms-playwright'); for (const b of readdirSync(c).filter(d => d.startsWith('chromium-')).sort().reverse()) { const e = join(c, b, 'chrome-win64', 'chrome.exe'); if (existsSync(e)) return e } return null }
const [BASE = 'http://localhost:4188/', SEL = '.hero-title-word', PROP = 'color'] = process.argv.slice(2)
const browser = await chromium.launch({ executablePath: fb(), headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2400)
const r = await page.evaluate(({ sel, prop }) => {
  const el = document.querySelector(sel)
  if (!el) return { err: 'no existe ' + sel }
  const hits = []
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules } catch { continue }
    const scan = (list) => { for (const rr of list) {
      if (rr.cssRules) { scan(rr.cssRules); continue }
      if (!rr.selectorText || !rr.style) continue
      const v = rr.style.getPropertyValue(prop)
      if (!v) continue
      let ok = false; try { ok = el.matches(rr.selectorText) } catch { continue }
      if (ok) hits.push({ hoja: (sheet.href || 'inline').split('/').pop(), sel: rr.selectorText, v, imp: rr.style.getPropertyPriority(prop) })
    } }
    scan(rules)
  }
  return { computed: getComputedStyle(el)[prop], cls: String(el.className), hits }
}, { sel: SEL, prop: PROP })
if (r.err) console.log(r.err)
else {
  console.log(`elemento: .${r.cls}\n${PROP} computado: ${r.computed}\nreglas que aplican (la última gana, salvo !important):`)
  for (const h of r.hits) console.log(`  ${h.imp === 'important' ? '[!IMP]' : '     '} ${h.hoja} :: ${h.sel} { ${propVal(h)} }`.replace('propVal(h)', h.v))
}
function propVal() { return '' }
await browser.close()
