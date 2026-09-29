/*
 * Lista canónica de rutas que pasan por las sondas de auditoría, y el seguro
 * que las convierte en algo en lo que se puede creer.
 *
 * Por qué existe. Dos fallos seguidos de la misma familia:
 *
 * 1. `probe-escenas.mjs` recorría `for (const ruta of LISTA)`, y `LISTA` eran
 *    SOLO los argumentos de línea de órdenes. Lanzada sin rutas visitó cero
 *    páginas y cerró con «TOTAL secciones con 3D: 0 · rutas con sospecha: 0».
 *    Leyendo deprisa, el peor desastre posible; en realidad, un pase vacío.
 *    `probe-revelados.mjs` hacía lo mismo y decía «TODAS LAS RUTAS LIMPIAS».
 * 2. `audit-uniformidad.mjs` llevaba `/parkour` en su lista, pero el enrutador
 *    declara `/parkour-academy` (`App.jsx:212`). La sonda medía la página 404 y
 *    la contaba como una de sus «9 rutas comerciales uniformes».
 *
 * Los dos son el mismo defecto: un instrumento puede devolver «sin fallos» sin
 * haber mirado nada. Aquí se arregla por las dos puntas — hay lista por defecto
 * y cada entrada se verifica contra el enrutador real antes de medir.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, '..', 'src', 'App.jsx')

/*
 * Las comerciales y de funnel: las que ve un cliente. El mando (`/panel`,
 * `/design-system`) y los pasos de pasarela no van aquí porque su geometría es
 * de otra familia; las sondas que los quieran medir los pasan por argumento.
 */
export const COMERCIALES = [
  '/',
  '/programs',
  '/shop',
  '/about',
  '/community',
  '/resources',
  '/faq',
  '/app',
  '/parkour-academy',
  '/plan/raiz',
  '/plan/fuerza',
  '/plan/rendimiento',
  '/plan/elite',
]

/**
 * Muere si alguna ruta de la lista ya no está declarada en el enrutador. Se
 * lanza al principio, no al final: una auditoría que recorre un 404 y lo suma
 * como «ok» es peor que ninguna auditoría, porque da permiso para no mirar.
 */
export function verificarContraElEnrutador(lista) {
  if (!existsSync(APP)) {
    throw new Error(`rutas-de-auditoria: no encuentro ${APP} para verificar las rutas.`)
  }
  const src = readFileSync(APP, 'utf8')
  // `<Route>` puede ir en varias líneas (así lo escribe el formateador), así
  // que el `path` se busca en los primeros 120 caracteres de la etiqueta y no
  // solo en la misma línea: con `<Route path="` a pelo, `/panel` declarado en
  // multilinea era invisible para el propio seguro que debía protegerlo.
  const declaradas = new Set(
    [...src.matchAll(/<Route\b[\s\S]{0,120}?path="([^"]+)"/g)].map(([, p]) => p),
  )
  declaradas.add('/')
  const fantasmas = lista.filter((r) => !declaradas.has(r))
  if (fantasmas.length) {
    throw new Error(
      `rutas-de-auditoria: ${fantasmas.join(', ')} no es una ruta de App.jsx. ` +
        'No se informa "sin fallos" sobre páginas 404.',
    )
  }
}

/**
 * Rutas efectivas de una sonda: las que se le pasen por argumento, o las
 * comerciales si no se le pasó ninguna. Nunca devuelve la lista vacía.
 */
export function exigirRutas(argv = []) {
  const elegidas = argv.filter((a) => !String(a).startsWith('http'))
  const lista = elegidas.length ? elegidas : COMERCIALES
  if (!lista.length) {
    throw new Error('rutas-de-auditoria: lista de rutas vacía. Una sonda no puede aprobar 0 casos.')
  }
  verificarContraElEnrutador(lista)
  return lista
}

/**
 * TODAS las rutas navegables declaradas en el enrutador, leídas de `App.jsx`.
 *
 * Por qué hace falta además de `COMERCIALES`. `probe-tipografia-h1.mjs` recorría
 * `['/']` cuando no se le pasaban rutas, y con eso anunció «todos los titulares
 * dentro del umbral» mientras `/panel` y `/entrar` estaban a **115 px** (el
 * umbral es 76). Dos rutas fuera de la lista bastaron para que el sondeo
 * mintiera por omisión. Para comprobaciones que no son de embudo comercial —
 * escala tipográfica, desbordes, contraste— se quiere el sitio entero, no solo
 * lo que ve un cliente nuevo.
 *
 * Se descartan el wildcard y las rutas con parámetro (`/x/:id`), que no son
 * navegables escribiéndolas tal cual.
 */
export function rutasDelEnrutador() {
  if (!existsSync(APP)) {
    throw new Error(`rutas-de-auditoria: no encuentro ${APP} para listar las rutas.`)
  }
  const src = readFileSync(APP, 'utf8')
  const declaradas = [
    ...new Set([...src.matchAll(/<Route\b[\s\S]{0,120}?path="([^"]+)"/g)].map(([, p]) => p)),
  ]
  const navegables = declaradas.filter((p) => !p.includes('*') && !p.includes(':'))
  if (!navegables.length) {
    throw new Error('rutas-de-auditoria: el enrutador no devolvió ninguna ruta navegable.')
  }
  return navegables
}
