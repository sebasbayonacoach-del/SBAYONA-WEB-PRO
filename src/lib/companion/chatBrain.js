import { faqEntries } from '../../config/faqContent.js'
import { membershipPlans } from '../../config/offerings.js'

/**
 * CEREBRO DEL CHAT
 * ---------------------------------------------------------------------------
 * El acompañante ya hablaba solo según el scroll. Esto es lo que faltaba: que
 * se le pueda contestar.
 *
 * QUIÉN HABLA (comentario 15 del 22-09): «no me gusta ese botón; quiero que sea
 * él, Sebastián, como asistente personal». Aquí responde SEBASTIÁN en primera
 * persona. Y una advertencia honesta para quien mantenga este fichero: NO hay
 * modelo de lenguaje detrás —no hay backend ni clave contractada—, así que la
 * inteligencia de esto es la de sus fuentes. Prometer una IA que no está
 * conectada sería exactamente la mentira que el resto del sitio evita. Lo que sí
 * está cumplido es la otra mitad del pedido: responde cualquier pregunta con lo
 * publicado y, cuando no la tiene, deriva a WhatsApp con una persona.
 *
 * Regla de oro, y no es estética: **aquí no se inventa ni una frase.** Cada
 * respuesta sale de las dos fuentes reales del sitio —`faqContent.js` (preguntas
 * que ya están publicadas) y `offerings.js` (planes, precios y lo que incluye
 * cada uno)— o de una intención de navegación que enlaza a una página que existe.
 * Cuando nada de eso cubre lo que pregunta, lo honesto es decirlo y ofrecer el
 * paso a una persona, no improvisar. Un entrenador que se inventa un precio o
 * una promesa de resultados hace daño a quien confía en él.
 *
 * Voz: «juntos» y «vamos», nunca un «usted» suelto. Sin promesas médicas.
 */

/** Minúsculas, sin acentos, solo palabras con sustancia. */
function tokens(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length > 3)
}

const STOP = new Set(['como', 'este', 'esta', 'pero', 'tiene', 'puedo', 'para', 'porque', 'sobre', 'todo', 'nada', 'algo', 'muy', 'mas', 'con', 'que', 'del', 'las', 'los', 'una', 'uno', 'por', 'que', 'esta'])

function utiles(texto) {
  return tokens(texto).filter((p) => !STOP.has(p))
}

/**
 * Puntúa una entrada del FAQ contra el mensaje: coincidencia exacta de forma
 * primero (una pregunta que repite palabras exactas es ESA pregunta) y luego
 * solapamiento de vocabulario.
 */
function mejorPregunta(mensaje) {
  const mio = new Set(utiles(mensaje))
  if (!mio.size) return null

  let mejor = null
  for (const entrada of faqEntries) {
    const suyas = new Set([...utiles(entrada.question), ...utiles(entrada.answer)])
    let aciertos = 0
    for (const palabra of mio) if (suyas.has(palabra)) aciertos += 1
    if (!aciertos) continue
    // se premia acertar en la pregunta, que es donde está el tema
    const enPregunta = new Set(utiles(entrada.question))
    let golpeados = 0
    for (const palabra of mio) if (enPregunta.has(palabra)) golpeados += 1
    const puntos = aciertos + golpeados * 2
    if (!mejor || puntos > mejor.puntos) mejor = { entrada, puntos }
  }

  return mejor && mejor.puntos >= 2 ? mejor.entrada : null
}

/** Precio en la moneda del sitio, como lo ve cualquier página. */
function precioDe(plan) {
  return `${plan.name} · $${plan.priceCop.toLocaleString('es-CO')} COP/mes (${plan.eurDisplay})`
}

function listaDePlanes() {
  const lineas = membershipPlans.map((plan) => `· ${precioDe(plan)} — ${plan.shortDescription}`)
  return [
    'Estos son los cuatro caminos, tal y como están publicados:',
    ...lineas,
    '¿Cuál encaja con lo que buscas? Los comparo contigo sin compromiso.',
  ].join('\n')
}

function detalleDe(plan) {
  const [primera, segunda, tercera] = plan.included
  const resto = plan.included.length - 3
  return [
    `${plan.name} es para: ${plan.audience}`,
    `Cuesta $${plan.priceCop.toLocaleString('es-CO')} COP al mes (${plan.eurDisplay}).`,
    `Incluye ${primera.toLowerCase()}, ${segunda.toLowerCase()} y ${tercera.toLowerCase()}`,
    resto > 0 ? `…y ${resto} cosas más que te enseño en la página del plan.` : 'Nada más: eso es todo lo que trae.',
    'Lo vemos juntos si quieres.',
  ].join('\n')
}

/** Saludos, gracias y «qué eres»: conversación, no formulario. */
const APERTURAS = [
  ['hola', 'buenas', 'hey', 'buenos dias', 'que tal'],
  ['gracias', 'genial', 'perfecto', 'vale'],
]

function intencionesDeConversacion(mensaje) {
  const t = ` ${utiles(mensaje).join(' ')} `
  if (/ hola | buenas | hey | tal /.test(t)) {
    return 'Hola, soy Sebastián, el asistente de BAYONA. Pregúntame por precios, por lo que incluye cada plan, por la comunidad o por cómo empezamos, y te respondo con lo que tengo publicado —si no lo sé, te lo digo y seguimos por WhatsApp.'
  }
  if (/ gracias | genial | perfecto | vale /.test(t)) {
    return 'Vamos a ello. Si te queda cualquier duda, aquí estoy.'
  }
  return null
}

/** Comparar y recomendar: se responde con los datos de dos planes, no con humo. */
function comparativa(mensaje) {
  const t = utiles(mensaje).join(' ')
  if (!/(diferencia|compara|cual|mejor|recomien|elig)/.test(t)) return null
  if (membershipPlans.length < 2) return null
  const [raiz, elite] = [membershipPlans[0], membershipPlans[membershipPlans.length - 1]]
  return [
    'La diferencia real está en cuánto acompañamiento quieres:',
    `· ${precioDe(raiz)} — ${raiz.shortDescription}`,
    `· ${precioDe(elite)} — ${elite.shortDescription}`,
    'Entre los dos hay FUERZA y RENDIMIENTO. Si me dices tu punto de partida y cuántos días puedes entrenar, te digo por cuál empezaríamos.',
  ].join('\n')
}

function planMencionado(mensaje) {
  const t = (mensaje || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return membershipPlans.find((plan) => t.includes(plan.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))) || null
}

/**
 * Las sugerencias rápidas: siempre rutas que existen en el sitio, para que un
 * clic no lleve a ninguna parte.
 */
const SUGERENCIAS = Object.freeze([
  { label: 'VER PRECIOS', clave: 'cuanto cuesta' },
  { label: 'QUÉ INCLUYE CADA PLAN', clave: 'incluye' },
  { label: 'LA COMUNIDAD', clave: 'comunidad' },
  { label: 'TIENEN PRESENCIAL?', clave: 'presencial' },
])

export const sugerenciasIniciales = Object.freeze(SUGERENCIAS.map((s) => s.label))

export const SALUDO =
  'Soy Sebastián, el asistente de BAYONA. Cuéntame cómo andas de entrenamiento y de tiempo, y te respondo con lo publicado: precios, qué incluye cada plan, comunidad o cómo empezamos.'

/**
 * Invitación a reclamar (§6 de la dirección de producto). El valor no se regala
 * por leer la página: se abre y se reclama. Cuando la persona pregunta por
 * créditos, regalos o sellos, esto es lo que puede decirse sin inventar:
 * el pase de llegada existe, es una cortesía canjeable y NO es dinero.
 */
function reclamoPublicado(mensaje) {
  const t = utiles(mensaje).join(' ')
  if (!/(credito|creditos|regalo|regalos|bono|sello|sellos|reclamar|descuento|copon|cupon)/.test(t)) return null
  return [
    'Durante el recorrido hay piezas que se descubren y se reclaman: el bono de llegada, los sellos de las estaciones y el extra por compartir.',
    'Se abren desde el pase que flota abajo a la izquierda: hay que pedirlo, no cae solo. Al crear tu cuenta queda guardado y se aplica como descuento en el checkout.',
    'Es CRÉDITO BAYONA: una cortesía para tu primer plan, no dinero retirable.',
    'Si quieres, lo abrimos aquí mismo.',
  ].join('\n')
}

/**
 * Responde a `mensaje`. Devuelve `{ texto, chips }`, con `chips` vacío cuando la
 * respuesta ya se basta sola.
 */
export function responder(mensaje, contexto = {}) {
  const limpio = (mensaje || '').trim()
  if (!limpio) return { texto: SALUDO, chips: [...sugerenciasIniciales] }

  const charla = intencionesDeConversacion(limpio)
  if (charla) return { texto: charla, chips: [...sugerenciasIniciales] }

  const plan = planMencionado(limpio)
  if (plan) return { texto: detalleDe(plan), chips: ['VER PRECIOS', 'QUÉ INCLUYE CADA PLAN'] }

  const compara = comparativa(limpio)
  if (compara) return { texto: compara, chips: ['VER PRECIOS'] }

  if (/precio|cuesta|vale|coste|cuant/.test(utiles(limpio).join(' '))) {
    return { texto: listaDePlanes(), chips: ['QUÉ INCLUYE CADA PLAN', 'LA COMUNIDAD'] }
  }

  const pregunta = mejorPregunta(limpio)
  if (pregunta) {
    return {
      texto: `${pregunta.answer}\n\n(Esto es lo que publicamos en las preguntas frecuentes de ${pregunta.category}. Si quieres, lo confirmamos juntos por WhatsApp.)`,
      chips: ['VER PRECIOS', 'HABLAR CON SEBASTIÁN'],
    }
  }

  /*
    Detrás del FAQ, no delante: si una pregunta publicada ya cubre el tema,
    responde el FAQ y punto. Esto solo entra cuando el visitante pregunta por
    algo del recorrido que sí existe (crédito, sellos, bono).
  */
  const reclamo = reclamoPublicado(limpio)
  if (reclamo) return { texto: reclamo, chips: ['RECLAMAR MI CRÉDITO', 'HABLAR CON SEBASTIÁN'] }

  /*
   * No hay respuesta publicada. Es el momento de ser honesto, no de rellenar:
   * se dice que no lo sabe y se ofrece la salida real (persona o planes).
   */
  return {
    texto: 'Eso no lo tengo publicado, y no voy a inventarlo. Escríbeme por WhatsApp y lo cerramos con una persona: ahí sí puedo confirmarte lo que todavía no está en la web.',
    chips: ['HABLAR CON SEBASTIÁN', 'VER PRECIOS', 'LA COMUNIDAD'],
  }
}

/** Enlaces reales del sitio para los chips que los tengan. */
export function destinoDel(chip) {
  switch (chip) {
    case 'VER PRECIOS':
      return { to: '/faq' }
    case 'QUÉ INCLUYE CADA PLAN':
      return { to: '/programs' }
    case 'LA COMUNIDAD':
      return { to: '/community' }
    case 'TIENEN PRESENCIAL?':
      return { to: '/parkour-academy' }
    /*
      'RECLAMAR MI CRÉDITO' no es una ruta: es una acción sobre el pase de la
      visita, así que la resuelve el propio chat llamando a `openCard()`.
      Devolver `null` aquí mantiene la regla de «ningún chip lleva a la nada».
    */
    default:
      return null
  }
}
