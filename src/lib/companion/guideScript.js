/**
 * GUION DEL ACOMPAÑANTE GLOBAL
 * ---------------------------------------------------------------------------
 * El dueño pidió "un bot… una especie de drone que te acompañe en el recorrido
 * y que te vaya guiando", y que visitar la web se sienta como la inauguración
 * de un gimnasio donde el dueño de la casa te enseña el recorrido. Habla
 * Sebastián en primera persona (comentario 15 del 22-09), no «una asesora».
 *
 * Tres reglas de este archivo, y son las que manda el propietario:
 *
 *  1. La voz es SIEMPRE plural inclusivo: "vamos juntos", "sigamos", "te
 *     enseño". Autoridad sí, pero acompañando. Nunca un "usted" solo.
 *  2. Frases cortas. El acompañante COMENTA lo que la persona está viendo; la
 *     explicación vive en la página. Si una línea pasa de ~90 caracteres, sobra.
 *  3. Cero avisos médicos y cero disculpas defensivas ("esto no es una
 *     promesa…"). En la interfaz no aparece nada de eso.
 *
 * Texto plano a propósito: el guion se reescribe aquí sin tocar React, igual
 * que `lib/onboarding/companionScript.js` hace con la recepción.
 */

/**
 * Rutas con guion. Lo que no está aquí va en silencio: el acompañante no habla
 * en `/onboarding` (allí ya habla su propia instancia), ni en `/entrar`, ni en
 * el área de miembros, ni en el 404.
 *
 * `at` es el progreso de scroll (0-1) a partir del cual la frase toma el turno.
 */
const GUION = Object.freeze({
  '/': Object.freeze([
    {
      at: 0,
      text: 'Vamos juntos. Te enseño la casa entera: entra sin prisa y sin papeleo.',
      named: '{nombre}, vamos juntos. Te enseño la casa entera: entra sin prisa.',
    },
    { at: 0.26, text: 'Aquí vive el método. Es lo que sostiene todo lo que vas a ver.' },
    { at: 0.52, text: 'Personas reales, días reales. Cada historia empezó igual que la tuya.' },
    { at: 0.78, text: 'Ya viste lo importante. Cuando quieras, sigamos con tu plan.' },
  ]),

  '/about': Object.freeze([
    { at: 0, text: 'Esta parte la cuento yo. Conóceme antes de entrenar conmigo.' },
    { at: 0.45, text: 'Empecé sin método y lo pagué caro. Por eso aquí el método va primero.' },
    { at: 0.8, text: 'Si algo de esto te suena, sigamos: te enseño cómo entrenamos.' },
  ]),

  '/programs': Object.freeze([
    { at: 0, text: 'Cuatro formas de entrenar. Ninguna exige que empieces fuerte.' },
    { at: 0.45, text: 'Elige la que cabe en tu semana, no la que suena más dura.' },
    { at: 0.8, text: 'Abre uno y te lo cuento por dentro. Sigamos.' },
  ]),

  '/parkour-academy': Object.freeze([
    { at: 0, text: 'La academia. Aquí el cuerpo aprende a moverse antes que a sufrir.' },
    { at: 0.45, text: 'Caer, saltar y volver a intentarlo: eso también es entrenar.' },
    { at: 0.8, text: 'Si estás cerca, la primera clase va por nuestra cuenta.' },
  ]),

  plan: Object.freeze([
    { at: 0, text: 'Plan {plan}. Te lo explico igual que a quien ya entrena conmigo.' },
    { at: 0.3, text: 'Esto es lo que recibes cada semana, sin letra pequeña.' },
    { at: 0.6, text: 'Tu crédito BAYONA se aplica aquí abajo. Lo miramos juntos.' },
    { at: 0.85, text: 'Cuando estés listo, sigamos a la caja. El primer mes va en cero.' },
  ]),

  '/shop': Object.freeze([
    { at: 0, text: 'La tienda. Lo que uso yo y lo que recomiendo sin dudar.' },
    { at: 0.5, text: 'Nada de esto es obligatorio; todo suma.' },
    { at: 0.85, text: 'Sigamos con lo tuyo cuando quieras.' },
  ]),

  '/community': Object.freeze([
    { at: 0, text: 'Aquí es donde el ritmo se sostiene: entre gente que también avanza.' },
    { at: 0.5, text: 'Cada lunes publicamos el calendario de la semana.' },
    { at: 0.85, text: 'Entra, mira cómo entrenamos y decides después.' },
  ]),

  '/resources': Object.freeze([
    { at: 0, text: 'Lo gratuito de verdad: guías para empezar hoy mismo.' },
    { at: 0.5, text: 'El reto de 30 días vive aquí. Empezamos cuando digas.' },
    { at: 0.85, text: 'Descarga lo que te sirva y sigamos.' },
  ]),

  '/faq': Object.freeze([
    { at: 0, text: 'Las dudas de siempre, respondidas sin rodeos.' },
    { at: 0.6, text: 'Si falta la tuya, escríbeme y la resolvemos juntos.' },
  ]),

  '/checkout': Object.freeze([
    { at: 0, text: 'Vamos a cerrarlo juntos. Revisa tu pedido y sigue.' },
    { at: 0.55, text: 'Tu crédito BAYONA ya está restado en el total.' },
    { at: 0.85, text: 'Primer mes en cero. Después, un euro al mes.' },
  ]),
})

/** Sección del guion para una ruta, o `null` si el acompañante va en silencio. */
export function guideSection(pathname) {
  if (typeof pathname !== 'string' || pathname === '') return null
  if (pathname.startsWith('/plan/')) return 'plan'
  return Object.prototype.hasOwnProperty.call(GUION, pathname) ? pathname : null
}

/** Nombre del plan en mayúsculas, tal como lo titula la propia página. */
export function guidePlanLabel(pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/plan/')) return ''
  return pathname.slice('/plan/'.length).toUpperCase()
}

/** Frase que tiene el turno a este punto del scroll, o `null` antes de empezar. */
export function guideBeatAt(section, progress) {
  const beats = GUION[section]
  if (!beats) return null

  const punto = Number.isFinite(progress) ? progress : 0
  let actual = null

  for (const beat of beats) {
    if (beat.at <= punto) actual = beat
  }

  if (!actual) return null
  return Object.freeze({ id: `${section}:${beats.indexOf(actual)}`, ...actual })
}

/** Convierte el turno en lo que se lee: con nombre si lo tenemos, y con el plan. */
export function guideSay(beat, { name = '', plan = '' } = {}) {
  if (!beat) return ''

  const limpio = String(name).trim()
  const base = limpio && beat.named ? beat.named : beat.text
  if (!base) return ''

  return base.replace('{nombre}', limpio).replace('{plan}', String(plan).trim() || 'BAYONA')
}
