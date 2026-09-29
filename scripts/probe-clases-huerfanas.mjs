// SONDA · clases que el JSX usa y NINGUNA hoja de estilo define.
//
// Por qué existe. El 22-09-2022 un agente reescribió `Community.jsx` mete y
// mete nodos nuevos y se quedó sin vueltas antes de darles estilo: quedaron 15
// clases vivas en el DOM sin una sola regla en `src/styles/`. Ese fallo no lo
// ve un test (no hay CSS que lo declare), no lo ve `vite build` (compila igual) y no
// lo ve un chequeo de contrastes: se ve como un bloque sin maquetar, en
// producción, y es el defecto típico de editar por capas cuando manda la
// cascada. Es, dicho de una vez, el modo de rotura de una web hecha a palos.
//
// Qué mide. Para cada página de `src/pages/*.jsx`: las clases que aparecen en
// `className="..."` (incluidas plantillas con `${}` y literales sueltos), y si
// existe al menos una regla `.clase` en cualquier `.css` de `src/styles/`, en
// `src/overrides.css`, o en un `style={{}}` del propio árbol.
//
// Qué NO pretende. No dice si el estilo que hay es suficiente: una clase puede
// tener regla y seguir viéndose mal. Solo cierra el caso grave y silencioso de
// "el DOM pide un nombre que nadie escucha".
//
// Corrección al instrumento, medida el 22-09-2026: la sonda leía solo ficheros
// `.css`, así que declaraba huérfanas dos clases de About que sí tienen regla,
// escrita en un `<style>` dentro de `GlobeTestimonials.jsx`. Un componente puede
// maquetarse con una hoja en línea, y eso cuenta. Ahora se barren también los
// bloques `<style>` de todo `.jsx`/`.js` bajo `src/`.
//
// Uso:
//   node scripts/probe-clases-huerfanas.mjs                -> todas las páginas
//   node scripts/probe-clases-huerfanas.mjs Community FAQ  -> solo esas
//   STRICT=1 node scripts/probe-clases-huerfanas.mjs        -> exit 1 si queda
//                                                              alguna (para CI)
//
// Salidas esperadas y por qué: las clases de utilidades del sistema (`ds-*`) y
// los estados que ponen JS por `classList` se listan igual; la lectura correcta
// es "¿tiene sentido que esta clase exista en el marcado sin regla?".

import { readFileSync, readdirSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const PAGES = join(RAIZ, 'src', 'pages')
const STYLES = join(RAIZ, 'src', 'styles')

/** Prefijos que nunca son defecto: los inyecta el motor o los gestiona el sistema. */
const IGNORAR = [
  /^vite-/,
  /^route-fallback/,
  /^premium-/,        // los añade PremiumRouteChrome por classList en runtime
  /^is-/,             // estados
  /^has-/,
  /^ds-/,             // marco del design system
  /^lab-/,
]

function cssDeTodo() {
  // Barre TODOS los .css bajo src/, incluidos los que viven en la raíz del
  // carpeta (no solo `src/styles/`). Motivo, medido el 22-09-2026: la versión
  // inicial de esta sonda leía `src/styles/`, `overrides.css` y las hojas de
  // componente, y se dejaba fuera `src/styles.css` — la hoja base que importa
  // `main.jsx`. Con ese hueco, de las 28 clases que declaraba huérfanas en
  // Programs, 21 tenían regla y 3 eran ganchos de ancestro: informaba de un
  // defecto que no existía. Una sonda que pita de más es peor que no tenerla,
  // porque enseña a ignorarla.
  const trozos = []
  ;(function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.name.endsWith('.css')) trozos.push(readFileSync(p, 'utf8'))
      else if (/\.(jsx|js)$/.test(e.name)) {
        // Hojas en línea de componente: `<style>{`...`}</style>`.
        const src = readFileSync(p, 'utf8')
        for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) trozos.push(m[1])
      }
    }
  })(join(RAIZ, 'src'))
  return trozos.join('\n')
}

/** Clases declaradas en el marcado: `className="a b"`, y plantillas.
 *
 * Devuelve, por cada atributo `className`, el par `{clase, tag, hermanas}`. El
 * `tag` hace falta para no denunciar ruido: hay dos situaciones en las que una
 * clase sin regla propia NO es el defecto que busca esta sonda.
 *   - Va en un `className` de un COMPONENTE (`<CheckoutPanel className="…">`):
 *     el componente lo reenvía y decide; puede acabar en el nodo que quiera.
 *   - El nodo ya está maquetado por otra clase de su misma lista
 *     (`<div className="programs-stage-media">` + un `<img>` hijo con su regla
 *     por descendiente): el nombre extra es un gancho semántico, no un bloque
 *     sin estilo.
 * Medido el 22-09-2026: de las 4 clases que quedaban, las tres primeras son
 * exactamente eso, y la cuarta (`final-seal`) se comprobó a mano en el DOM.
 */
function clasesDelMarcado(src) {
  const salida = []
  const patrones = [
    /className\s*=\s*\{?\s*"([^"]+)"/g,
    /className\s*=\s*\{?\s*'([^']+)'/g,
    /className\s*=\s*\{?\s*`([^`]+)`/g,
  ]
  for (const re of patrones) {
    for (const m of src.matchAll(re)) {
      const lista = m[1]
        .split(/[\s,]+/)
        .map((parte) => parte.replace(/\$\{[^}]*\}/g, ' ').trim())
        .filter(Boolean)
      const clases = lista.filter((c) => /^[a-z][\w-]{2,}$/.test(c))
      // Etiqueta a la que pertenece el atributo: el último `<nombre` anterior.
      const anterior = src.slice(0, m.index)
      const tag = anterior.slice(anterior.lastIndexOf('<')).match(/^<\s*([A-Za-z][\w.]*)/)?.[1] ?? ''
      for (const c of clases) salida.push({ clase: c, tag, hermanas: clases })
    }
  }
  return salida
}

/**
 * Nombres sin regla cuyo motivo se midió y se dejó por escrito. No es una
 * forma de apagar la sonda: es la lista de lo que una persona ya miró, con la
 * prueba al lado en `docs/PENDIENTES-INTEGRACION-2026-09-22.md`.
 */
const EXCEPCIONES_MEDIDAS = {
  // Home.jsx:1017 — `<div className="final-seal">` envuelve `.final-mark` y
  // `.final-tagline`, que sí tienen regla. Medido con
  // `probe-desborde-horizontal.mjs` sobre el build: a 360px ocupa 324/324 y a
  // 1440px 1280/1280, sin desbordar. El bloque se ve bien y la palabra gigante
  // no empuja el lema, así que el contenedor no necesita propiedad propia.
  'final-seal': 'contenedor cuyo estilo llevan los hijos; sin desborde medido a 360 y 1440',
}

const filtro = process.argv.slice(2).filter((a) => !a.includes('='))
const cssTodo = cssDeTodo()
const tieneRegla = (c) => cssTodo.includes(`.${c}`)
let total = 0
let ganchos = 0

for (const f of readdirSync(PAGES).filter((x) => x.endsWith('.jsx'))) {
  const nombre = basename(f, '.jsx')
  if (filtro.length && !filtro.some((q) => nombre.toLowerCase().includes(q.toLowerCase()))) continue

  const src = readFileSync(join(PAGES, f), 'utf8')
  const vistas = new Set()
  const huerfanas = []
  const deGancho = []
  for (const { clase, tag, hermanas } of clasesDelMarcado(src)) {
    if (vistas.has(clase)) continue
    vistas.add(clase)
    if (IGNORAR.some((re) => re.test(clase)) || tieneRegla(clase)) continue
    if (EXCEPCIONES_MEDIDAS[clase]) continue
    const reenviada = /^[A-Z]/.test(tag)
    const nodosConRegla = hermanas.some((h) => h !== clase && !IGNORAR.some((re) => re.test(h)) && tieneRegla(h))
    if (reenviada || nodosConRegla) deGancho.push(`${clase} (${reenviada ? `<${tag}> reenviada` : 'nodo ya maquetado'})`)
    else huerfanas.push(clase)
  }

  if (huerfanas.length || deGancho.length) {
    total += huerfanas.length
    ganchos += deGancho.length
    console.log(`\n${nombre}.jsx -> ${huerfanas.length} sin regla · ${deGancho.length} ganchos`)
    if (huerfanas.length) console.log('  DEFECTO: ' + huerfanas.join('\n  DEFECTO: '))
    if (deGancho.length) console.log('  ' + deGancho.join('\n  '))
  }
}

console.log(
  total === 0
    ? `\nOK: ningún nodo del marcado pide un nombre que nadie escucha (${ganchos} ganchos sin regla propia, todos con motivo).`
    : `\nTOTAL: ${total} clases sin regla en ${filtro.length ? 'las páginas pedidas' : 'todo el sitio'} (${ganchos} ganchos aparte).`,
)

if (process.env.STRICT && total > 0) process.exit(1)
