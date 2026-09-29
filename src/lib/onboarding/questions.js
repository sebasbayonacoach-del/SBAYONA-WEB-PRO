/**
 * BANCO DE PREGUNTAS DE LA RECEPCIÓN + REGALO DE BIENVENIDA
 * ---------------------------------------------------------------------------
 * Sustituye a las tres preguntas fijas de `Onboarding.jsx`.
 *
 * Lo que pidió el dueño, punto por punto:
 *
 *  1. "No tienes tiempo → cinco preguntas. Tienes tiempo → un formulario más
 *     largo, te pregunta más cosas de ti, pero vas a poder obtener tu regalo."
 *     → DOS PROFUNDIDADES: `express` (5) y `completo` (9). La persona elige.
 *
 *  2. "No me gusta lo de constancia, fuerza general, nada de eso."
 *     → Las ETIQUETAS se reescriben en lenguaje de persona ("Que esto dure",
 *     "Más fuerza"). Los `value` NO cambian: son las claves de
 *     `ROUTE_MATRIX` en `routeMap.js`, que siguen siendo la única fuente de la
 *     recomendación. Cambiar el texto sin tocar el motor.
 *
 *  3. "La persona selecciona el país y según el país le cambia la moneda."
 *     → `REGIONS` decide moneda y, además, si la clase de parkour del regalo es
 *     presencial (Europa) o en vídeo (resto del mundo).
 *
 *  4. "El regalo debe ser grande: plan de entrenamiento, plan de nutrición,
 *     guía de estiramientos, clase de parkour, acceso a un grupo semanal con
 *     calendario cada lunes y el reto de 30 días."
 *     → `GIFT_ITEMS`, con su valor en euros. El recorrido express recibe el
 *     paquete esencial; el completo recibe TODO. El total a pagar sigue siendo
 *     cero en los dos casos: lo que cambia es el tamaño del valor recibido.
 *
 *  Las preguntas extra del recorrido completo (`moment`, `equipment`,
 *  `nutrition`, `challenge`) NO participan en la matriz de rutas: enriquecen el
 *  regalo y la forma de hablarle a la persona. `mapAnswersToRoute` solo lee
 *  `goal`, `experience` y `availability`, así que ignora el resto sin romperse.
 */

export const REGION_ZONES = Object.freeze({
  europa: Object.freeze({
    id: 'europa',
    label: 'EUROPA',
    note: 'Aquí BAYONA también se da en persona, según la ciudad.',
  }),
  latam: Object.freeze({
    id: 'latam',
    label: 'LATINOAMÉRICA',
    note: 'Todo en línea, en tu franja horaria y en tu moneda.',
  }),
  resto: Object.freeze({
    id: 'resto',
    label: 'RESTO DEL MUNDO',
    note: 'En línea y en dólares, sin horario europeo.',
  }),
})

export const REGIONS = Object.freeze([
  Object.freeze({
    id: 'espana',
    label: 'España',
    detail: 'Clase de parkour presencial',
    currency: 'EUR',
    zone: 'europa',
  }),
  Object.freeze({
    id: 'europa',
    label: 'Otro país de Europa',
    detail: 'Presencial según la ciudad',
    currency: 'EUR',
    zone: 'europa',
  }),
  Object.freeze({
    id: 'colombia',
    label: 'Colombia',
    detail: 'Todo en línea, en tu horario',
    currency: 'COP',
    zone: 'latam',
  }),
  Object.freeze({
    id: 'otro-pais',
    label: 'Otro país',
    detail: 'Todo en línea, en tu horario',
    currency: 'USD',
    zone: 'resto',
  }),
])

export function regionById(id) {
  return REGIONS.find((region) => region.id === id) ?? null
}

export function zoneById(id) {
  return REGION_ZONES[id] ?? null
}

/**
 * Pregunta de región: decide moneda y, además, si la clase de parkour del regalo es
 * presencial (Europa) o en vídeo (resto del mundo).
 *
 * Rediseño del 22-09 (§20 y comentario 66): se agrupa por continente y se
 * explica PARA QUÉ sirve el dato. Sin el motivo, un selector de país parece un
 * formulario; con él, es la persona ajustando cómo se le habla. No se añaden
 * más países de los cuatro reales: `CURRENCIES` solo sostiene EUR, COP y USD, y
 * inventar un tipo de cambio sería peor que quedarse corto.
 */
const REGION_QUESTION = Object.freeze({
  key: 'region',
  eyebrow: 'TU PAÍS',
  title: '¿DESDE DÓNDE EMPEZAMOS?',
  lead: 'Te lo pregunto por tres cosas concretas: la moneda en la que te enseño los números, si puedo darte una clase en persona o en vídeo, y en qué horario cae tu semana. Puedes cambiarlo cuando quieras.',
  groupedBy: 'zone',
  options: Object.freeze(REGIONS.map((region) => Object.freeze({
    value: region.id,
    label: region.label,
    detail: region.detail,
    zone: region.zone,
  }))),
})

/**
 * Pregunta de objetivo (§20, comentarios 67-68).
 *
 * El dueño cambió el marco: no «qué viniste a construir» (abstracto, de marketing)
 * sino «qué quieres resolver primero» (el problema que trae la persona). Ocho
 * salidas, todas accionables y en lenguaje humano, incluida la de quien todavía
 * solo está mirando. Los `value` son claves de `ROUTE_MATRIX`: añadir cuatro
 * implicó añadir cuatro filas al motor, no maquillar el texto.
 */
const GOAL_QUESTION = Object.freeze({
  key: 'goal',
  eyebrow: 'LO QUE QUIERES RESOLVER',
  title: '¿QUÉ QUIERES RESOLVER PRIMERO?',
  lead: 'Elige lo que más te pesa ahora mismo. Con eso elijo yo qué enseñarte primero; siempre lo podemos corregir después.',
  options: Object.freeze([
    Object.freeze({ value: 'constancia', label: 'Que esto dure', detail: 'Sin volver a empezar cada lunes' }),
    Object.freeze({ value: 'fuerza-general', label: 'Más fuerza', detail: 'Notarla en el cuerpo y en el día' }),
    Object.freeze({ value: 'movilidad-general', label: 'Moverme libre', detail: 'Sin rigidez, sin límites de rango' }),
    Object.freeze({ value: 'dolor-rigidez', label: 'Dolor o rigidez', detail: 'Coser puntos que molestan al moverte' }),
    Object.freeze({ value: 'volver-a-entrenar', label: 'Volver a entrenar', detail: 'Retomar después de un parón largo' }),
    Object.freeze({ value: 'parkour', label: 'Aprender parkour', detail: 'Salto, apoyo, control del entorno' }),
    Object.freeze({ value: 'comer-mejor', label: 'Comer mejor', detail: 'Comida real que puedas sostener' }),
    Object.freeze({ value: 'comparar-planes', label: 'Solo estoy explorando', detail: 'Quiero ver qué hay antes de decidir' }),
  ]),
})

const EXPERIENCE_QUESTION = Object.freeze({
  key: 'experience',
  eyebrow: 'TU PUNTO DE PARTIDA',
  title: '¿DÓNDE ESTÁS HOY?',
  options: Object.freeze([
    Object.freeze({ value: 'inicio', label: 'Arranco de cero', detail: 'Nunca, o hace mucho' }),
    Object.freeze({ value: 'retomo', label: 'Vuelvo', detail: 'Después de una pausa' }),
    Object.freeze({ value: 'constante', label: 'Ya entreno', detail: 'Busco otro nivel' }),
  ]),
})

const AVAILABILITY_QUESTION = Object.freeze({
  key: 'availability',
  eyebrow: 'TU SEMANA',
  title: '¿CUÁNTOS DÍAS SON TUYOS?',
  options: Object.freeze([
    Object.freeze({ value: 'uno-dos', label: '1 o 2 días', detail: 'Poco tiempo, bien usado' }),
    Object.freeze({ value: 'tres', label: '3 días', detail: 'Un ritmo sólido' }),
    Object.freeze({ value: 'cuatro-mas', label: '4 o más', detail: 'Voy en serio' }),
  ]),
})

const BLOCKER_QUESTION = Object.freeze({
  key: 'blocker',
  eyebrow: 'LO QUE SE INTERPONE',
  title: '¿QUÉ TE FRENA HOY?',
  options: Object.freeze([
    Object.freeze({ value: 'tiempo', label: 'El tiempo', detail: 'Mi semana manda' }),
    Object.freeze({ value: 'energia', label: 'La energía', detail: 'Llego sin ganas' }),
    Object.freeze({ value: 'direccion', label: 'La dirección', detail: 'No sé qué hacer exactamente' }),
    Object.freeze({ value: 'constancia', label: 'La constancia', detail: 'Empiezo y lo dejo' }),
  ]),
})

/** Solo recorrido completo: afinan el regalo y el tono, no la ruta. */
const MOMENT_QUESTION = Object.freeze({
  key: 'moment',
  eyebrow: 'TU MOMENTO',
  title: '¿CUÁNDO TE VA MEJOR?',
  options: Object.freeze([
    Object.freeze({ value: 'manana', label: 'Primera hora', detail: 'Antes de que el día mande' }),
    Object.freeze({ value: 'mediodia', label: 'Al mediodía', detail: 'Un corte en la jornada' }),
    Object.freeze({ value: 'tarde', label: 'Por la tarde', detail: 'Al terminar de trabajar' }),
  ]),
})

const EQUIPMENT_QUESTION = Object.freeze({
  key: 'equipment',
  eyebrow: 'TU ESPACIO',
  title: '¿CON QUÉ CUENTAS?',
  options: Object.freeze([
    Object.freeze({ value: 'gimnasio', label: 'Gimnasio', detail: 'Material completo' }),
    Object.freeze({ value: 'casa', label: 'En casa', detail: 'Con lo básico' }),
    Object.freeze({ value: 'exterior', label: 'Al aire libre', detail: 'Parque, calle, playa' }),
  ]),
})

const NUTRITION_QUESTION = Object.freeze({
  key: 'nutrition',
  eyebrow: 'TU MESA',
  title: '¿CÓMO ESTÁS COMIENDO?',
  options: Object.freeze([
    Object.freeze({ value: 'desorden', label: 'Sin orden', detail: 'Como lo que aparece' }),
    Object.freeze({ value: 'regular', label: 'Más o menos', detail: 'Sé qué mejorar' }),
    Object.freeze({ value: 'controlado', label: 'Ya lo cuido', detail: 'Quiero afinar' }),
  ]),
})

const CHALLENGE_QUESTION = Object.freeze({
  key: 'challenge',
  eyebrow: 'EL RETO',
  title: '¿ENTRAS AL RETO DE 30 DÍAS?',
  lead: 'Doce sesiones, registro completo y la ruleta al final.',
  options: Object.freeze([
    Object.freeze({ value: 'entro', label: 'Entro', detail: 'Cuenta conmigo' }),
    Object.freeze({ value: 'todavia-no', label: 'Todavía no', detail: 'Prefiero mirar primero' }),
  ]),
})

/**
 * IDIOMA DE LA RECEPCIÓN (§20: nombre → idioma → país → objetivo → ritmo).
 *
 * No es un selector de i18n: la web está escrita en español y no existe un
 * modo bilingüe. Lo que sí existe, y ya usa `TranslateOffer`, es el enlace de
 * traducción de la página actual. Pedir el idioma aquí tiene esa consecuencia
 * real y nada más: cambiar la lengua en la que se te enseña la recepción.
 */
export const VISITOR_LANGUAGES = Object.freeze([
  Object.freeze({ code: 'es', label: 'Español', note: 'El idioma en el que está escrita la casa.', translate: false }),
  Object.freeze({ code: 'en', label: 'English', note: 'Abre esta pantalla traducida al inglés.', translate: true }),
  Object.freeze({ code: 'pt', label: 'Português', note: 'Abre esta pantalla traducida al portugués.', translate: true }),
])

export function languageByCode(code) {
  return VISITOR_LANGUAGES.find((language) => language.code === code) ?? null
}

/** Cinco paradas de la casa: lo que la persona va a ver si cruza las puertas. */
export const HOUSE_STOPS = Object.freeze([
  Object.freeze({ label: 'EL MÉTODO', detail: 'Por qué la dirección cambia el resultado', to: '/about' }),
  Object.freeze({ label: 'PROGRAMAS', detail: 'Cuatro niveles de acompañamiento', to: '/programs' }),
  Object.freeze({ label: 'COMUNIDAD', detail: 'Entrada libre, sin comprar nada', to: '/community' }),
  Object.freeze({ label: 'BAYONA+', detail: 'El centro de mando, en preparación', to: '/app' }),
  Object.freeze({ label: 'TIENDA', detail: 'Sesión, servicio o equipo suelto', to: '/shop' }),
])

/** Cinco preguntas: las mismas en los dos recorridos, hasta aquí. */
const BASE_QUESTIONS = Object.freeze([
  REGION_QUESTION,
  GOAL_QUESTION,
  EXPERIENCE_QUESTION,
  AVAILABILITY_QUESTION,
  BLOCKER_QUESTION,
])

const EXTRA_QUESTIONS = Object.freeze([
  MOMENT_QUESTION,
  EQUIPMENT_QUESTION,
  NUTRITION_QUESTION,
  CHALLENGE_QUESTION,
])

export const DEPTHS = Object.freeze({
  express: Object.freeze({
    id: 'express',
    label: 'Voy con prisa',
    detail: 'Cinco preguntas y seguimos',
    questions: BASE_QUESTIONS,
    giftTier: 'esencial',
  }),
  completo: Object.freeze({
    id: 'completo',
    label: 'Tengo tiempo',
    detail: 'Nueve preguntas y el regalo completo',
    questions: Object.freeze([...BASE_QUESTIONS, ...EXTRA_QUESTIONS]),
    giftTier: 'completo',
  }),
})

export const DEFAULT_DEPTH = 'express'

export function depthById(id) {
  return DEPTHS[id] ?? DEPTHS[DEFAULT_DEPTH]
}

export function questionsFor(depthId) {
  return depthById(depthId).questions
}

/** Respuestas vacías para todas las preguntas de los dos recorridos. */
export function createEmptyAnswers() {
  return Object.fromEntries(
    [...BASE_QUESTIONS, ...EXTRA_QUESTIONS].map((question) => [question.key, '']),
  )
}

export function optionLabel(questions, key, value) {
  if (!value) return null
  const question = questions.find((item) => item.key === key)
  return question?.options.find((option) => option.value === value)?.label ?? null
}

/* ------------------------------------------------------------------------- */
/* REGALO DE BIENVENIDA                                                      */
/* ------------------------------------------------------------------------- */

const PARKOUR_PRESENCIAL = 'Presencial en España · una clase con Sebastián'
const PARKOUR_ONLINE = 'En vídeo, paso a paso, desde donde estés'

/**
 * Los seis bloques del regalo. `valueEur` es el valor de mercado de cada pieza
 * por separado: sirve para que la persona vea qué está recibiendo antes de que
 * el total a pagar sea cero.
 *
 * `tier: 'esencial'` entra en los dos recorridos; `tier: 'completo'` solo en el
 * recorrido largo, que es exactamente el intercambio que propone el dueño:
 * más tiempo tuyo, más valor recibido.
 */
const GIFT_ITEMS = Object.freeze([
  Object.freeze({
    id: 'plan-entrenamiento',
    name: 'PLAN DE ENTRENAMIENTO 30 DÍAS',
    detail: 'Tus días, tus sesiones, tu ritmo. Nada que improvisar.',
    valueEur: 47,
    tier: 'esencial',
  }),
  Object.freeze({
    id: 'plan-nutricion',
    name: 'PLAN DE NUTRICIÓN',
    detail: 'Comidas reales, con la lista de mercado hecha.',
    valueEur: 39,
    tier: 'esencial',
  }),
  Object.freeze({
    id: 'guia-estiramientos',
    name: 'GUÍA DE ESTIRAMIENTOS',
    detail: 'Doce minutos al día para moverte sin límites.',
    valueEur: 19,
    tier: 'esencial',
  }),
  Object.freeze({
    id: 'grupo-semanal',
    name: 'GRUPO SEMANAL BAYONA',
    detail: 'Cada lunes, el calendario de la semana y tus preguntas resueltas.',
    valueEur: 29,
    tier: 'esencial',
  }),
  Object.freeze({
    id: 'clase-parkour',
    name: 'CLASE DE PARKOUR',
    detail: PARKOUR_ONLINE,
    detailEuropa: PARKOUR_PRESENCIAL,
    valueEur: 60,
    tier: 'completo',
  }),
  Object.freeze({
    id: 'reto-30-dias',
    name: 'RETO 30 DÍAS',
    detail: 'Entrena, registra cada sesión y entra a la ruleta de premios.',
    valueEur: 45,
    tier: 'completo',
  }),
])

/**
 * Construye el regalo según la profundidad elegida y el país.
 * Devuelve piezas ya con su `detail` resuelto, el total en euros y el total
 * formateado en la moneda de la persona.
 */
export function buildGift({ depth, region, format }) {
  const tier = depthById(depth).giftTier
  const zone = regionById(region)?.zone ?? 'resto'

  const items = GIFT_ITEMS
    .filter((item) => tier === 'completo' || item.tier === 'esencial')
    .map((item) => {
      if (item.id !== 'clase-parkour') return { ...item }
      return { ...item, detail: zone === 'europa' ? PARKOUR_PRESENCIAL : PARKOUR_ONLINE }
    })

  const totalEur = items.reduce((total, item) => total + item.valueEur, 0)

  return {
    items,
    totalEur,
    /** Valor real del paquete; lo que se paga al final es siempre cero. */
    totalDisplay: format ? format(totalEur) : String(totalEur),
    tier,
  }
}

/** Valor total del paquete completo, para comparar "recibiste X de Y". */
export const FULL_GIFT_EUR = GIFT_ITEMS.reduce((total, item) => total + item.valueEur, 0)
