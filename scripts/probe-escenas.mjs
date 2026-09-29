// Qué secciones han cobrado objeto 3D, y con cuánto peso visual.
//
// Por qué existe: el guion de `src/config/routeSceneRules.js` empareja regex con
// el titular de cada sección, y un regex que no casa NO da error — la sección se
// queda sin decorado en silencio. Pasó de verdad: un lote de reemplazos con script
// se comió los backslashes y dejó `/cuatros*caminos/i`, que busca «cuatroscaminos».
// Resultado: /shop sin un solo objeto y /about con 1 de 3, y ni los tests ni el
// auditor de uniformidad se enteraban.
//
// La señal es `--scene-veil`: `RouteSceneCycler` solo se lo pone a las secciones
// que han pasado el filtro y tienen paso asignado. Lo que no aparece en esta lista
// es lo que NO tiene 3D. Contar esto y compararlo con lo declarado en el guion es
// la comprobación; fiarse del «N de M aplicados» que devuelve el propio parche no.
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-escenas.mjs [baseUrl] [/ruta ...]
import { chromium } from '@playwright/test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { routeSceneRules } from '../src/config/routeSceneRules.js'

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

const ARGV = process.argv.slice(2)
const BASE = ARGV.find((a) => a.startsWith('http')) || 'http://localhost:4179'

/*
 * Trampa de esta sonda, y cara: `LISTA` eran SOLO los argumentos. Lanzada sin
 * ruta alguna recorría cero páginas y cerraba con
 * «TOTAL secciones con 3D: 0 · rutas con sospecha: 0», que leído con prisa
 * parecía el peor desastre posible cuando no había desastre: un pase vacío.
 * Ahora la lista se deriva del propio guion (los prefijos `^/...` de
 * `routeSceneRules.js`), de modo que una ruta nueva con decorado entra sola, y
 * si aun así queda vacía la sonda MUERE en vez de informar. Una sonda que
 * puede aprobar sin mirar nada no es una sonda.
 */
const CONFIG = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'config', 'routeSceneRules.js')
const DERIVADAS = [...readFileSync(CONFIG, 'utf8').matchAll(/'\^(\/[a-z0-9/-]*)\$?'/gi)].map(([, r]) => r)
const LISTA = ARGV.filter((a) => !a.startsWith('http'))
/*
 * El guion empareja por PREFIJO (`^/parkour` casa con `/parkour-academy` en
 * runtime), pero al navegador no se le puede llevar un prefijo: `/parkour` no
 * es una URL y devuelve el 404, que tiene cero `<section>` y se reportaba como
 * «alguna regex no casa». Falsa alarma durante tres auditorías seguidas. Las
 * rutas reales del enrutador van aquí.
 */
const URL_REAL = { '/parkour': '/parkour-academy' }
const RUTAS = (LISTA.length ? LISTA : [...new Set(DERIVADAS)]).map((r) => URL_REAL[r] || r)
// Ni vacía ni inventada: si una de estas deja de estar en el enrutador, fuera.
import { verificarContraElEnrutador } from './rutas-de-auditoria.mjs'
verificarContraElEnrutador(RUTAS)
if (!RUTAS.length) {
  throw new Error(
    'probe-escenas: ni argumentos ni prefijos derivados del guion. Negarse a informar de 0 secciones.',
  )
}
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
let totalPintados = 0
let avisos = 0

for (const ruta of RUTAS) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2600)
  await p.getByText('RECLAMAR', { exact: false }).first().click({ timeout: 2200 }).catch(() => {})
  // El cycler confirma cuando la lista de secciones se estabiliza (o al llegar a
  // su tope de fotogramas). En /app, con las maquetas de dispositivo y el vídeo,
  // eso tarda más que los 2,6 s de espera fija: la primera versión de este sondeo
  // decía «0 secciones con objeto» en una ruta donde el rack se veía en la
  // captura. Se espera a que aparezca la propiedad, con tope.
  await p.waitForFunction(
    () => document.querySelectorAll('section[style*="--scene-veil"]').length > 0
      || window.__probeSinEscenas === true,
    null,
    { timeout: 9000 },
  ).catch(() => {})
  await p.waitForTimeout(400)
  const pinta = await p.evaluate(() => [...document.querySelectorAll('section')]
    .filter((s) => s.style.getPropertyValue('--scene-veil'))
    .map((s) => ({
      titulo: (s.querySelector('h1, h2, h3')?.textContent || '(sin titular)').trim().replace(/\s+/g, ' ').slice(0, 34),
      velo: s.style.getPropertyValue('--scene-veil'),
    })))
  totalPintados += pinta.length
  // Cuántos tramos DEBERÍAN tener objeto según el guion: las reglas declaradas,
  // más los del ciclo que no sean `null`. Se compara contra lo que se ha pintado.
  const cfg = routeSceneRules(ruta)
  const espera = cfg.rules.length + (cfg.cycle.filter((v) => v !== null).length ? 99 : 0)
  const minimo = cfg.rules.length
  if (pinta.length < minimo) {
    avisos += 1
    console.log(`\n${ruta}: SOLO ${pinta.length} secciones con objeto, el guion declara ${minimo} reglas → alguna regex no casa`)
  } else {
    console.log(`\n${ruta}: ${pinta.length} secciones con objeto (reglas declaradas: ${minimo})`)
  }
  for (const s of pinta) console.log(`  velo=${s.velo}  "${s.titulo}"`)
  await p.close()
}
console.log(`\nTOTAL secciones con 3D: ${totalPintados} · rutas con sospecha de regex roto: ${avisos}`)
await browser.close()
