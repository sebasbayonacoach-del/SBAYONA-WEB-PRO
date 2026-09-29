// SONDA · qué bocas de imagen tiene cada página del config ya resuelto.
//
// Por qué existe. `auditar-huecos-imagenes.mjs` cuenta las carpetas de todo el
// sitio junto; para decidir hay que saber DÓNDE. Este imprime, por página,
// cuántas escenas salen de cada carpeta y los nombres concretos de las que no
// salen del banco propio de BAYONA.
//
// Uso: node scripts/inventario-de-escenas-por-pagina.mjs [carpeta a detallar]

import { siteMedia } from '../src/config/siteMedia.js'

const DETALLE = process.argv[2] || 'burst'
const porPagina = new Map()
const detallados = []

function caminar(objetivo, ruta) {
  for (const [clave, valor] of Object.entries(objetivo ?? {})) {
    if (!valor || typeof valor !== 'object') continue
    if (typeof valor.src === 'string') {
      const carpeta = valor.src.split('/')[2] || '(raíz)'
      if (!porPagina.has(ruta)) porPagina.set(ruta, new Map())
      const contadores = porPagina.get(ruta)
      contadores.set(carpeta, (contadores.get(carpeta) || 0) + 1)
      if (carpeta === DETALLE) {
        detallados.push(`${ruta}.${clave}  ${valor.src.split('/').pop().split('?')[0]}`)
      }
      continue
    }
    caminar(valor, ruta ? `${ruta}.${clave}` : clave)
  }
}

caminar(siteMedia, '')

console.log(`carpeta detallada: ${DETALLE}\n`)
for (const [pagina, contadores] of porPagina) {
  const resumen = [...contadores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `${c} ${n}`)
    .join(' · ')
  console.log(`${pagina || '(raíz)'.padEnd(28)}  ${resumen}`)
}
console.log(`\n-- ${detallados.length} escenas en ${DETALLE}:`)
for (const d of detallados) console.log('   ' + d)
