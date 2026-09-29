// Cruza las AFIRMACIONES PUBLICADAS del sitio con el registro de evidencia.
// No es un gate: es un informe. Si algun dia se quiere como test, ver el comentario del final.
import { evidenceRegistry } from '../src/config/evidenceRegistry.js'
import { GUARANTEE } from '../src/config/commitments.js'
import { TESTIMONIALS, HOME_TESTIMONIAL_IDS } from '../src/config/testimonials.js'
import { faqEntries } from '../src/config/faqContent.js'
import { planPresentations } from '../src/config/planPresentations.js'

const ctxRegistrados = Object.keys(evidenceRegistry)
const planas = Object.values(planPresentations || {}).map((p) => JSON.stringify(p)).join(' ')
const faqTxt = JSON.stringify(faqEntries)

/**
 * Afirmaciones que, por su naturaleza, necesitan una prueba guardada:
 * promesa economica, prueba social, franja de edad con menores, o disponibilidad.
 */
const AFIRMACIONES = [
  {
    id: 'testimonios',
    donde: 'src/config/testimonials.js (renderidos en / y el globo 3D)',
    qu: `${TESTIMONIALS.length} fichas con nombre, edad, ciudad y foto (en la home se montan ${HOME_TESTIMONIAL_IDS.length})`,
    tipo: 'prueba social',
    necesita: 'consentimiento firmado + foto real o licencia de uso por ficha',
    presente: TESTIMONIALS.length > 0,
  },
  {
    id: 'garantia-30-dias',
    donde: 'src/config/commitments.js (Programs, 4 planes, FAQ, carrito)',
    qu: GUARANTEE.promise,
    tipo: 'promesa economica',
    necesita: 'caja y procedimiento de devolucion publicados; medio de cobro activo',
    presente: true,
  },
  {
    id: 'franjas-con-menores',
    donde: 'src/config/faqContent.js',
    qu: (faqTxt.match(/ni[nñ]os de [^"]{0,40}/i) || ['(no encontrada)'])[0],
    tipo: 'actividad con menores',
    necesita: 'titulacion habilitante para grupo. (El certificado de delitos sexuales SI esta obtenido: ' +
      'expedido 06-05-2026, Ref. 3628529/2026, papel en su carpeta de identidad.)',
    presente: /ni[nñ]os de/i.test(faqTxt),
  },
  {
    id: 'whatsapp-24-7',
    donde: 'src/config/planPresentations.js',
    qu: (planas.match(/WhatsApp con Sebasti[aá]n[^"]{0,20}/) || ['(no encontrada)'])[0],
    tipo: 'compromiso de disponibilidad',
    necesita: 'que el titular pueda sostenerlo (horas reales de respuesta)',
    presente: /24\/7/.test(planas),
  },
]

console.log('=== contexto de evidencia declarado en el registro:', ctxRegistrados.length ? ctxRegistrados.join(', ') : '(vacio a proposito)')
console.log('')
let sinPrueba = 0
for (const a of AFIRMACIONES) {
  const tiene = ctxRegistrados.includes(a.id)
  if (!tiene) sinPrueba += 1
  console.log(`${tiene ? 'OK  ' : 'SIN PRUEBA'}  ${a.id}`)
  console.log(`        donde:   ${a.donde}`)
  console.log(`        qu:      ${a.qu}`)
  console.log(`        tipo:    ${a.tipo}`)
  console.log(`        haria falta: ${a.necesita}`)
  console.log('')
}
console.log(`TOTAL afirmaciones publicadas sin evidencia en el registro: ${sinPrueba} de ${AFIRMACIONES.length}`)
console.log('NOTA: este fichero es un INFORME, no rompe la suite. Para convertirlo en gate,')
console.log('      anadir un test que exija evidenceRegistry[id] por cada afirmacion publicada.')
