// Escáner de AFIRMACIONES en el texto RENDERIZADO de cada ruta, por host.
// Diferencia entre "está en el bundle" y "lo ve alguien que entra": esto mide lo segundo.
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

const sin = (s) => {
  const n = s.normalize('NFD').toLowerCase()
  return n.replace(/[̀-ͯ]/g, '')
}

const PATRONES = [
  ['entrenador personal', 'denominación protegida (art. 9.3.b)'],
  ['preparador fisico', 'denominación protegida (art. 15)'],
  ['homologado', 'afirmación falsa: art. 21.2 exige homologación'],
  ['colegiado', 'no hay colegio profesional'],
  ['fisioterapeuta', 'profesión sanitaria'],
  ['nutricionista', 'profesión sanitaria'],
  ['primeros auxilios', 'sin papel (C11)'],
  ['titulacion europea', 'ISAF no es título europeo'],
  ['presencial en espana', 'actividad reservada'],
  ['clase de parkour presencial', 'actividad reservada (onboarding)'],
  ['presencial segun la ciudad', 'promesa incumplible'],
  ['a domicilio', 'sin coche/carné confirmado (C13)'],
  ['20 km', 'radio sin medio de transporte'],
  ['187 sesiones', 'cifra inventada'],
  ['+20', 'reclamación sin papel'],
  ['614988006', 'teléfono muerto'],
  ['614 988 006', 'teléfono muerto'],
  ['614 98 80 06', 'teléfono muerto (forma publicada con separacion de 2 en 2)'],
]

const BASES = (process.argv[2] || '').split(',')
const RUTAS = (process.argv[3] || '/').split(',')

const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
const resumen = new Map()

for (const base of BASES) {
  console.log(`\n================ ${base}`)
  for (const ruta of RUTAS) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    let txt = ''
    try {
      await page.goto(base + ruta, { waitUntil: 'domcontentloaded', timeout: 25000 })
      await page.waitForTimeout(2600)
      txt = await page.evaluate(() => document.body.innerText)
    } catch (e) {
      console.log(`${ruta.padEnd(20)} ERROR ${String(e.message).slice(0, 60)}`)
      await page.close()
      continue
    }
    const t = sin(txt)
    const hits = PATRONES.filter(([p]) => t.includes(sin(p)))
    for (const [p, motivo] of hits) {
      const clave = `${p} :: ${motivo}`
      if (!resumen.has(clave)) resumen.set(clave, new Set())
      resumen.get(clave).add(`${base.replace(/^https?:\/\//, '').split('.')[0]}${ruta}`)
    }
    console.log(`${ruta.padEnd(20)} ${String(hits.length).padStart(2)} avisos ${hits.map(([p]) => p).join(' | ').slice(0, 110)}`)
    await page.close()
  }
}

console.log('\n================ RESUMEN por afirmación')
for (const [clave, donde] of [...resumen.entries()].sort()) {
  console.log(`  ${clave}\n      → ${[...donde].join(', ')}`)
}
if (!resumen.size) console.log('  ninguna afirmación de la lista en lo recorrido')
await browser.close()
