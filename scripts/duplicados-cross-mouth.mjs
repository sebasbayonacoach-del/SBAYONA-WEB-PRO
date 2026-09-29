// SONDA · fotografías repetidas en el sitio, cruzando TODOS los canales.
//
// Por qué existe. `auditar-huecos-imagenes.mjs` compara hashes dentro del banco,
// y `siteMedia.js` cierra con un invariante de URL duplicada. Ninguno ve el
// conjunto: una capa decorativa escrita en un `.css`, o un `<img>` fijo en un
// componente, pueden pintar la MISMA fotografía que ya sirve una sección del
// config, y las dos comprobaciones quedan en verde porque cada una mira un canal
// distinto. Eso pasó el 2026-09-22: `/faq` repetía su propia foto en el hero y
// en una capa, porque `bank-senior-man-balance.png` es copia byte a byte de
// `faq-hero.png` y la URL era distinta.
//
// Resuelve lo que cada sección pide de verdad (config resuelto + literales de
// CSS + `<img>` del código), lo baja a sha256 y agrupa por huella. Marca aparte
// la repetición que cae DENTRO de una misma página, que es la única que el
// visitante ve segura.
//
// Uso:
//   node scripts/duplicados-cross-mouth.mjs [--solo-pagina] [--json]
//   STRICT=1 node scripts/duplicados-cross-mouth.mjs   # sale 1 si hay repetición
//                                                       # en la misma página
//
// `--json` emite [{url, quien, pagina}] por línea pintada, para que el paso
// perceptual (`scripts/duplicados-perceptuales.py`) pueda leerlo sin duplicar
// aquí la lógica de resolución.
//
// Limitación declarada: el sha256 solo encuentra la misma foto con otro nombre
// cuando los BYTES coinciden. Un JPG reconvertido a PNG cambia de huella y esta
// sonda lo declara único aunque el ojo vea la misma imagen. Para eso está
// `duplicados-perceptuales.py`; pasar una y no la otra es medio control.

import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, basename } from 'node:path'
import { siteMedia } from '../src/config/siteMedia.js'

const RAIZ = process.cwd()
const SOLO_PAGINA = process.argv.includes('--solo-pagina')
const MODO_JSON = process.argv.includes('--json')

/** Página a la que pertenece cada clave raíz del inventario. */
const PAGINA_DE_CLAVE = {
  home: '/',
  programs: '/programs',
  plans: '/plan',
  shop: '/shop',
  about: '/about',
  app: '/app',
  community: '/community',
  resources: '/resources',
  parkourAcademy: '/parkour-academy',
  faq: '/faq',
  onboarding: '/onboarding',
}

/** huella -> [{ quien, pagina, url }] */
const porHuella = new Map()
const sinArchivo = []

function huellaDe(urlLocal) {
  // `burst()` añade query virtual (`?v=<slug>&w=<ancho>`) a sus rutas. Sin
  // quitarla, `join(public, url)` busca un fichero imposible y la sonda declara
  // 37 archivos inexistentes: el mismo error de lectura que ya tuvo el primer
  // `auditar-huecos-imagenes.mjs`.
  const rutaLimpia = urlLocal.split('?')[0]
  const disco = join(RAIZ, 'public', rutaLimpia)
  try {
    return createHash('sha256').update(readFileSync(disco)).digest('hex').slice(0, 12)
  } catch {
    sinArchivo.push(rutaLimpia)
    return null
  }
}

function registrar(quien, pagina, urlLocal) {
  const h = huellaDe(urlLocal)
  if (!h) return
  if (!porHuella.has(h)) porHuella.set(h, [])
  porHuella.get(h).push({ quien, pagina, url: urlLocal.split('?')[0] })
}

// Canal 1: el config resuelto.
function caminar(objetivo, ruta, claveRaiz) {
  for (const [clave, valor] of Object.entries(objetivo ?? {})) {
    if (!valor || typeof valor !== 'object') continue
    const raiz = claveRaiz ?? clave
    if (typeof valor.src === 'string') {
      if (/^\/images\//.test(valor.src)) {
        registrar(`config ${ruta}${clave}`, PAGINA_DE_CLAVE[raiz] ?? `?${raiz}`, valor.src)
      }
      continue
    }
    caminar(valor, `${ruta}${clave}.`, raiz)
  }
}
caminar(siteMedia, '', null)

// Canales 2 y 3: literales en hojas de estilo y en código. La página se deduce
// del selector al que sirve la regla, no del nombre del fichero:
// `luxury-typography-final.css` parece una hoja de tipografía y en realidad
// pinta `.home-memberships-section` y `.home-services-configurator`, o sea HOME.
const ARCHIVOS_A_ESCRUTAR = []
for (const dir of [join(RAIZ, 'src', 'styles'), join(RAIZ, 'src', 'components'), join(RAIZ, 'src', 'pages'), join(RAIZ, 'src', 'config')]) {
  if (!readdirSync) break
  for (const f of readdirSync(dir)) {
    if (/\.(css|jsx|js)$/.test(f)) ARCHIVOS_A_ESCRUTAR.push(join(dir, f))
  }
}

/** El prefijo del selector decide la página; se comprueba con la lista real. */
const PREFIJO_DE_PAGINA = [
  ['community', '/community'],
  ['faq', '/faq'],
  ['onboarding', '/onboarding'],
  ['entrar', '/entrar'],
  ['home', '/'],
  ['resources', '/resources'],
  ['shop', '/shop'],
  ['about', '/about'],
  ['programs', '/programs'],
  ['parkour', '/parkour-academy'],
  ['app', '/app'],
]
function paginaDeArchivo(archivo, selector) {
  for (const [prefijo, pagina] of PREFIJO_DE_PAGINA) {
    if (selector.includes(prefijo)) return pagina
  }
  return basename(archivo)
}

for (const archivo of ARCHIVOS_A_ESCRUTAR) {
  const cuerpo = readFileSync(archivo, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')
  for (const m of cuerpo.matchAll(/url\(['"]?(\/images\/[^'")\s]+)/g)) {
    const sel = cuerpo.slice(Math.max(0, m.index - 260), m.index)
    const selector = (sel.match(/([.#][\w-]+(?:\s+[.#][\w-]+)*)\s*(?:::before|::after)?\s*[^{}]*$/) || [null, basename(archivo)])[1]
    registrar(`css ${basename(archivo)}:${basename(m[1])}`, paginaDeArchivo(archivo, selector), m[1])
  }
  for (const m of cuerpo.matchAll(/['"](\/images\/[^'"\s]+)['"]/g)) {
    if (/\.css$/.test(archivo)) continue // ya capturado arriba
    // Y en `siteMedia.js` HAY que saltar las definiciones de escena: cada
    // `bayonaScenes.X` declara su `src` curated, pero `cinematicScene` lo
    // reemplaza por el PNG cuando el hueco está registrado. Contarlas aquí
    // convertía una definición inofensiva en un «pintor» fantasma y el control
    // acusaba de duplicada una foto que en realidad no se ve en dos sitios.
    if (/siteMedia\.js$/.test(archivo)) continue
    registrar(`código ${basename(archivo)}:${basename(m[1])}`, paginaDeArchivo(archivo, basename(archivo)), m[1])
  }
}

if (MODO_JSON) {
  const vistos = new Set()
  for (const [, quien] of porHuella) {
    for (const q of quien) {
      const k = `${q.url}|${q.quien}`
      if (vistos.has(k)) continue
      vistos.add(k)
      console.log(JSON.stringify(q))
    }
  }
  process.exit(0)
}

const repetidas = [...porHuella.entries()].filter(([, quien]) => quien.length > 1)
let dentroDePagina = 0

console.log(`canales explorados: config resuelto + ${ARCHIVOS_A_ESCRUTAR.length} ficheros de src/`)
console.log(`fotografías distintas pintadas: ${porHuella.size}`)
// El número de abajo es una COTA INFERIOR, no un veredicto. Desde que las escenas
// del banco se sirven como `-1600/-1672.webp`, un PNG y su WebP gemelo tienen
// distinta huella aunque sea la misma fotografía: el sha256 se quedó ciego ante
// el reenvasado y un «0» aquí ya no significa «no hay repetidas». Quién decide
// eso es `scripts/duplicados-perceptuales.py` (phash + dhash), que consume
// `--json` de este mismo script.
console.log(`huellas con más de una sección: ${repetidas.length}  (cota inferior por bytes; para apariencia usar duplicados-perceptuales.py)`)
if (sinArchivo.length) console.log(`RUTAS SIN ARCHIVO (${sinArchivo.length}): ${[...new Set(sinArchivo)].join(' | ')}`)
console.log('')

for (const [h, quien] of repetidas.sort((a, b) => b[1].length - a[1].length)) {
  const paginas = new Set(quien.map((q) => q.pagina))
  const mismaPagina = paginas.size < quien.length
  if (mismaPagina) dentroDePagina += 1
  if (SOLO_PAGINA && !mismaPagina) continue
  console.log(`${mismaPagina ? '★ MISMA PÁGINA ' : '            '}#${h}`)
  for (const q of quien) console.log(`               ${String(q.pagina).padEnd(16)} ${q.quien}`)
}

console.log(`\nRepetidas dentro de una misma página: ${dentroDePagina}`)

const rutasPintadas = new Set()
for (const [, quien] of porHuella) for (const q of quien) rutasPintadas.add(q.url)
const sinUsar = []
for (const carpeta of ['images/bayona-generated', 'images/scenes']) {
  const dir = join(RAIZ, 'public', carpeta)
  for (const archivo of readdirSync(dir)) {
    if (!/\.(png|jpe?g)$/i.test(archivo)) continue
    const url = `/${carpeta}/${archivo}`
    if (!rutasPintadas.has(url)) sinUsar.push(url)
  }
}
console.log(`\noriginales SIN pintar en ningún canal: ${sinUsar.length}`)
for (const u of sinUsar) console.log('   ' + u)

if (process.env.STRICT && dentroDePagina > 0) process.exit(1)
