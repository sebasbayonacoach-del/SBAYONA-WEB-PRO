// AUDITORIA · huecos de imagen cinematicScene vs banco generado.
//
// Para qué existe. El plan de imágenes dice: cada hueco declarado como segundo
// argumento de `cinematicScene(...)` en `src/config/siteMedia.js` debe tener su
// PNG en `public/images/bayona-generated/` Y su nombre en el conjunto
// `GENERATED_BAYONA_SCENES`. Son tres condiciones y se pueden cumplir de a una:
// existe el archivo pero no está registrado (la web sigue mostrando la imagen
// vieja y nadie lo nota), está registrado pero no existe (404 en producción), o
// existe y está registrado pero es una copia de la misma foto de banco repetida
// en cinco secciones (lo que el brief prohíbe salvo que no haya alternativa).
//
// Qué imprime, en este orden:
//   1. huecos totales, con PNG, registrados, y las dos listas de pendientes
//   2. PNG huérfanos (en disco, sin hueco que los pida)
//   3. archivos de tamaño cero o que no son PNG decodable por cabecera
//   4. grupos de archivos byte-idénticos → eso es reutilización, y hay que
//      declararla, no descubrirla tarde
//   5. proporción de cada archivo (el brief pide horizontal ~16:9)
//
// Uso:
//   MSYS_NO_PATHCONV=1 node scripts/auditar-huecos-imagenes.mjs
//   STRICT=1 node scripts/auditar-huecos-imagenes.mjs   -> exit 1 si algo cojea

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const MEDIA = join(RAIZ, 'src', 'config', 'siteMedia.js')
const BANCO = join(RAIZ, 'public', 'images', 'bayona-generated')

const fuenteBruta = readFileSync(MEDIA, 'utf8')

/**
 * Quita comentarios antes de leer literales.
 *
 * Fallo propio, detectado el 22-09-2026: al documentar en `siteMedia.js` de
 * dónde sale cada imagen copiada, los nombres fueron escritos entre acentos
 * graves dentro de un bloque `/* *\/`. La extracción leía el bloque tal cual y
 * convertía cada `bank-…` o `docs/IMAGENES-REPARADAS.md` del comentario en un
 * miembro del conjunto: daba «95 registrados» cuando eran 93, y dos nombres
 * «registrados sin archivo» que no existen. Un fichero que no se puede leer sin
 * comentarios no es un manifiesto; aquí se podan primero.
 */
function sinComentarios(texto) {
  return texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}
const fuente = sinComentarios(fuenteBruta)

/** Huecos: segundo argumento de cinematicScene(...) — `cinematicScene(algo, 'nombre')`. */
const huecos = [
  ...new Set(
    [...fuente.matchAll(/cinematicScene\s*\(\s*[^,()]+,\s*['"`]([^'"`]+)['"`]/g)].map(([, nombre]) => nombre),
  ),
].sort()

/** Conjunto GENERATED_BAYONA_SCENES: se lee literal por literal del bloque. */
const bloque = fuente.match(/GENERATED_BAYONA_SCENES\s*=\s*new\s+Set\(\s*\[([\s\S]*?)\]\s*\)/)
const registrados = bloque
  ? [...new Set([...bloque[1].matchAll(/['"`]([^'"`]+)['"`]/g)].map(([, n]) => n))].sort()
  : []

const archivos = existsSync(BANCO)
  ? readdirSync(BANCO).filter((f) => f.toLowerCase().endsWith('.png'))
  : []

const hashes = new Map()
const problemas = []
const proporciones = []
for (const archivo of archivos) {
  const ruta = join(BANCO, archivo)
  const stat = statSync(ruta)
  if (stat.size === 0) problemas.push(`${archivo}: tamaño cero`)
  const buffer = readFileSync(ruta)
  const cabecera = buffer.subarray(0, 8).toString('hex')
  if (cabecera !== '89504e470d0a1a0a') problemas.push(`${archivo}: no es PNG (cabecera ${cabecera})`)
  // IHDR: ancho y alto en los bytes 16-23 del archivo.
  if (cabecera === '89504e470d0a1a0a') {
    const w = buffer.readUInt32BE(16)
    const h = buffer.readUInt32BE(20)
    const r = w / h
    proporciones.push({ archivo, w, h, r })
    if (r < 1.2) problemas.push(`${archivo}: ${w}x${h} no es horizontal (ratio ${r.toFixed(2)})`)
    /*
     * El tamaño delata el lote, y esto ha evitado un error caro. El banco limpio
     * es 1672×941 (1,777) en sus 94 archivos. El lote viejo de
     * `public/images/bayona-visuals/` —1792×1024— salió de la generación con
     * una segunda imagen superpuesta en una franja horizontal: se ve una
     * costura de tono cruzando el encuadre, y hay fotogramas con tres o cuatro
     * personas y gimnasio cerrado, que el brief no admite. Los catorce huecos
     * que faltan de `/resources` existen JUSTO con ese nombre en ese lote
     * (`resources-topic-*.jpg`, 1792×1024), y copiarlos habría metido el
     * defecto en la web. Comprobado a ojo sobre hojas de contacto a 620 px.
     */
    if (w === 1792 && h === 1024) {
      problemas.push(`${archivo}: 1792x1024, es del lote viejo con costura horizontal`)
    }
  }
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 12)
  if (!hashes.has(hash)) hashes.set(hash, [])
  hashes.get(hash).push(archivo)
}

const sinArchivo = huecos.filter((h) => !archivos.includes(`${h}.png`))
const sinRegistrar = huecos.filter((h) => archivos.includes(`${h}.png`) && !registrados.includes(h))
// El caso inverso, y es el que rompe la web: registrado sin archivo. El codigo
// pide `/images/bayona-generated/<nombre>.png`, no existe, y la seccion se queda
// sin fondo en produccion aunque el build salga verde.
const registradosSinArchivo = registrados.filter((r) => !archivos.includes(`${r}.png`))

const huerfanos = archivos
  .map((a) => a.replace(/\.png$/i, ''))
  .filter((n) => !n.startsWith('bank-') && !huecos.includes(n))
const duplicados = [...hashes.entries()].filter(([, lista]) => lista.length > 1)

console.log(`Huecos declarados .............. ${huecos.length}`)
console.log(`  con PNG en el banco .......... ${huecos.length - sinArchivo.length}`)
console.log(`  en GENERATED_BAYONA_SCENES ... ${registrados.filter((r) => huecos.includes(r)).length}`)
// Peso REAL: se suman los bytes de cada archivo. Contar ficheros y dividirlos
// entre 1024 daba «0 MB» con 108 PNG de casi 2 MB cada uno, y el peso es justo
// lo que hay que vigiar al convertir una escena a PNG con el nombre del hueco.
const pesoMB = archivos.reduce((a, f) => a + statSync(join(BANCO, f)).size, 0) / 1024 / 1024
console.log(`PNG en el banco ................ ${archivos.length} (${pesoMB.toFixed(1)} MB)`)
console.log('')

if (sinArchivo.length) {
  console.log(`FALTAN IMAGENES (${sinArchivo.length}):`)
  for (const h of sinArchivo) console.log(`  ${h}`)
  console.log('')
}
if (sinRegistrar.length) {
  console.log(`EXISTEN PERO NO ESTAN REGISTRADOS (${sinRegistrar.length}) — la web sigue mostrando la imagen anterior:`)
  for (const h of sinRegistrar) console.log(`  ${h}`)
  console.log('')
}
if (registradosSinArchivo.length) {
  console.log(`REGISTRADOS SIN ARCHIVO (${registradosSinArchivo.length}) — piden un PNG que no existe:`)
  for (const r of registradosSinArchivo) console.log(`  ${r}`)
  console.log('')
}
if (huerfanos.length) {
  console.log(`PNG HUERFANOS (${huerfanos.length}) — en disco sin hueco que los pida:`)
  for (const h of huerfanos) console.log(`  ${h}`)
  console.log('')
}
if (duplicados.length) {
  console.log(`IMAGENES REPETIDAS (${duplicados.length} grupos) — el brief solo lo admite sin alternativa, hay que declararlo:`)
  for (const [, lista] of duplicados) console.log(`  ${lista.join(' = ')}`)
  console.log('')
}
if (problemas.length) {
  console.log(`ARCHIVOS CON PROBLEMA (${problemas.length}):`)
  for (const p of problemas) console.log(`  ${p}`)
  console.log('')
}
if (!sinArchivo.length && !sinRegistrar.length && !problemas.length) {
  console.log('OK: cada hueco tiene su PNG, todos registrados, ninguno roto ni en vertical.')
}

const ro = proporciones.map((p) => p.r)
if (ro.length) {
  ro.sort((a, b) => a - b)
  console.log(
    `\nProporcion: min ${ro[0].toFixed(2)} · mediana ${ro[Math.floor(ro.length / 2)].toFixed(2)} · max ${ro[ro.length - 1].toFixed(2)} (16:9 = 1,78)`,
  )
}

const flojo =
  sinArchivo.length + sinRegistrar.length + problemas.length
if (process.env.STRICT && flojo > 0) process.exit(1)

/*
 * SEGUNDA MITAD · el objeto YA RESUELTO, no el texto del fichero.
 *
 * Añadida el 22-09-2026 después de descubrir que el conteo por expresión regular
 * se quedaba en 101 huecos cuando el objeto resuelto tiene 147 escenas: los
 * nombres construidos con plantilla (`faq-${clave}`, `community-${clave}`) son
 * invisibles para un regex sobre el fuente. Y el hueco no era cosmético: por eso
 * seis escenas de `/resources` seguían sirviendo el lote con costura sin que
 * ninguna de las dos listas las nombrara.
 *
 * Aquí no se adivina el nombre: se importa el módulo y se recorre. Es el mismo
 * objeto que consume la web, así que lo que se ve es lo que se sirve.
 */
const { siteMedia } = await import('../src/config/siteMedia.js')
const resueltas = new Map()
;(function recorrer(nodo) {
  if (!nodo || typeof nodo !== 'object') return
  if (typeof nodo.src === 'string' && typeof nodo.key === 'string') resueltas.set(nodo.key, nodo.src)
  for (const valor of Object.values(nodo)) if (valor && typeof valor === 'object') recorrer(valor)
})(siteMedia)

const porDestino = new Map()
const remotas = []
const rutasSinArchivo = []
for (const [clave, src] of resueltas) {
  const limpio = src.split('?')[0]
  const destino = /^https?:/.test(src) ? 'REMOTO' : limpio.split('/').slice(2, 3)[0] || 'otras'
  porDestino.set(destino, (porDestino.get(destino) || 0) + 1)
  if (/^https?:/.test(src)) {
    remotas.push(`${clave.replace('scene:', '')} -> ${limpio.split('/').slice(3).join('/')}`)
    continue
  }
  if (!existsSync(join(RAIZ, 'public', limpio))) rutasSinArchivo.push(`${clave.replace('scene:', '')} -> ${limpio}`)
}

console.log('\n--- objeto resuelto (lo que de verdad se sirve) ---')
console.log(`escenas en siteMedia: ${resueltas.size}`)
for (const [destino, n] of [...porDestino.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${destino.padEnd(22)} ${n}`)
}
if (remotas.length) {
  console.log(`\nIMÁGENES SERVIDAS DESDE UN HOST EXTERNO (${remotas.length}) — el brief prohíbe bancos externos y además esto se cae si el host cambia:`)
  for (const r of remotas) console.log(`  ${r}`)
}
if (rutasSinArchivo.length) {
  console.log(`\nRUTAS SIN ARCHIVO EN DISCO (${rutasSinArchivo.length}):`)
  for (const r of rutasSinArchivo) console.log(`  ${r}`)
}
if (remotas.length || rutasSinArchivo.length) process.exitCode = 1
