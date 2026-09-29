const PLAN_DETAILS = Object.freeze({
  raiz: Object.freeze({
    id: 'raiz',
    plan: 'RAÍZ',
    planHref: '/plan/raiz',
    note: 'Una entrada progresiva para construir base, claridad y constancia sin depender de la improvisación.',
    nextStep: 'Conoce RAÍZ y decide si este nivel de guía encaja con tu momento.',
  }),
  fuerza: Object.freeze({
    id: 'fuerza',
    plan: 'FUERZA',
    planHref: '/plan/fuerza',
    note: 'Una ruta para convertir intención en práctica sostenida con más guía y trabajo de fuerza general.',
    nextStep: 'Explora FUERZA y revisa cómo se integra el acompañamiento en tu semana.',
  }),
  rendimiento: Object.freeze({
    id: 'rendimiento',
    plan: 'RENDIMIENTO',
    planHref: '/plan/rendimiento',
    note: 'Una ruta para una práctica constante que busca estructura, seguimiento y un nivel mayor de exigencia.',
    nextStep: 'Descubre RENDIMIENTO y contrasta su estructura con tu disponibilidad real.',
  }),
  elite: Object.freeze({
    id: 'elite',
    plan: 'ELITE',
    planHref: '/plan/elite',
    note: 'Una ruta para explorar el nivel de acompañamiento más cercano y personalizado de BAYONA.',
    nextStep: 'Conoce ELITE y conversa con una persona antes de tomar cualquier decisión.',
  }),
})

// Matriz explícita: 8 objetivos × 3 niveles de experiencia × 3 ritmos.
// Ocho filas porque la recepción pregunta por problemas concretos y no por
// «construcciones» abstractas (dirección de producto §20). Cada objetivo nuevo
// trae sus nueve combinaciones resueltas: `src/test/commercialSync.test.jsx`
// recorre esta matriz y cae si algún slug de plan no existiera.
export const ROUTE_MATRIX = Object.freeze({
  constancia: Object.freeze({
    inicio: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'raiz' }),
    retomo: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'fuerza' }),
    constante: Object.freeze({ 'uno-dos': 'raiz', tres: 'fuerza', 'cuatro-mas': 'rendimiento' }),
  }),
  'fuerza-general': Object.freeze({
    inicio: Object.freeze({ 'uno-dos': 'raiz', tres: 'fuerza', 'cuatro-mas': 'fuerza' }),
    retomo: Object.freeze({ 'uno-dos': 'fuerza', tres: 'fuerza', 'cuatro-mas': 'rendimiento' }),
    constante: Object.freeze({ 'uno-dos': 'fuerza', tres: 'rendimiento', 'cuatro-mas': 'rendimiento' }),
  }),
  'movilidad-general': Object.freeze({
    inicio: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'raiz' }),
    retomo: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'fuerza' }),
    constante: Object.freeze({ 'uno-dos': 'raiz', tres: 'fuerza', 'cuatro-mas': 'rendimiento' }),
  }),
  // Dolor y rigidez: base primero. Nadie sube carga sobre una zona que molesta.
  'dolor-rigidez': Object.freeze({
    inicio: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'raiz' }),
    retomo: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'raiz' }),
    constante: Object.freeze({ 'uno-dos': 'raiz', tres: 'fuerza', 'cuatro-mas': 'fuerza' }),
  }),
  // Volver después de un parón largo: el mismo criterio que la constancia, con
  // la exigencia un punto más abajo cuando el tiempo manda.
  'volver-a-entrenar': Object.freeze({
    inicio: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'fuerza' }),
    retomo: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'fuerza' }),
    constante: Object.freeze({ 'uno-dos': 'raiz', tres: 'fuerza', 'cuatro-mas': 'rendimiento' }),
  }),
  // Parkour: la base atlética manda; con volumen y constancia reales se puede
  // exigir más. La academia se ofrece aparte como recurso, no como plan.
  parkour: Object.freeze({
    inicio: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'raiz' }),
    retomo: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'fuerza' }),
    constante: Object.freeze({ 'uno-dos': 'fuerza', tres: 'fuerza', 'cuatro-mas': 'rendimiento' }),
  }),
  'comer-mejor': Object.freeze({
    inicio: Object.freeze({ 'uno-dos': 'raiz', tres: 'raiz', 'cuatro-mas': 'fuerza' }),
    retomo: Object.freeze({ 'uno-dos': 'raiz', tres: 'fuerza', 'cuatro-mas': 'fuerza' }),
    constante: Object.freeze({ 'uno-dos': 'fuerza', tres: 'fuerza', 'cuatro-mas': 'rendimiento' }),
  }),
  'comparar-planes': Object.freeze({
    inicio: Object.freeze({ 'uno-dos': 'raiz', tres: 'fuerza', 'cuatro-mas': 'elite' }),
    retomo: Object.freeze({ 'uno-dos': 'raiz', tres: 'fuerza', 'cuatro-mas': 'elite' }),
    constante: Object.freeze({ 'uno-dos': 'fuerza', tres: 'elite', 'cuatro-mas': 'elite' }),
  }),
})

/**
 * Objetivo → recurso gratis. El parkour pide su propia puerta (la academia); el
 * resto se decide por punto de partida y disponibilidad, como siempre.
 */
const PARKOUR_RESOURCE = Object.freeze({
  resource: 'ACADEMIA PARKOUR',
  resourceHref: '/parkour-academy',
  resourceNote: 'Progresiones técnicas por edad y nivel: del primer apoyo controlado al salto con aterrizaje limpio.',
})

const PROTOCOL_RESOURCE = Object.freeze({
  resource: 'PROTOCOLO 7 DÍAS',
  resourceHref: '/resources',
  resourceNote: 'Una forma breve de probar el método y convertir una intención general en una primera acción.',
})

const CHALLENGE_RESOURCE = Object.freeze({
  resource: 'RETO 30 DÍAS',
  resourceHref: '/resources',
  resourceNote: 'Un recorrido gratuito para poner a prueba tu constancia y observar cómo respondes a una estructura.',
})

const COMMUNITY_BY_EXPERIENCE = Object.freeze({
  inicio: 'Un espacio para preguntar, observar y empezar acompañado.',
  retomo: 'Un espacio para recuperar ritmo junto a personas que también están avanzando.',
  constante: 'Un espacio para sostener el progreso, compartir aprendizajes y seguir elevando la práctica.',
})

export const VISITOR_ROUTE = Object.freeze({
  kind: 'visitor',
  id: 'ecosistema',
  plan: 'ECOSISTEMA BAYONA',
  planHref: '/programs',
  note: 'Recorre el método, los programas, los recursos y la comunidad sin crear una cuenta ni compartir datos.',
  resource: 'RECURSOS GRATUITOS',
  resourceHref: '/resources',
  resourceNote: 'Explora herramientas abiertas antes de decidir si quieres una orientación personal.',
  community: 'COMUNIDAD BAYONA',
  communityHref: '/community',
  communityNote: 'Conoce el espacio humano que acompaña el recorrido.',
  nextStep: 'Explora una zona del ecosistema o personaliza tu camino en menos de 60 segundos.',
})

export function hasCompleteAnswers(answers = {}) {
  return Boolean(
    ROUTE_MATRIX[answers.goal]?.[answers.experience]?.[answers.availability],
  )
}

export function mapAnswersToRoute(answers = {}) {
  const planId = ROUTE_MATRIX[answers.goal]?.[answers.experience]?.[answers.availability]
  if (!planId) return null

  const plan = PLAN_DETAILS[planId]
  const resource = answers.goal === 'parkour'
    ? PARKOUR_RESOURCE
    : (answers.experience === 'inicio' || answers.availability === 'uno-dos'
      ? PROTOCOL_RESOURCE
      : CHALLENGE_RESOURCE)

  return {
    kind: 'personalized',
    ...plan,
    ...resource,
    community: 'COMUNIDAD BAYONA',
    communityHref: '/community',
    communityNote: COMMUNITY_BY_EXPERIENCE[answers.experience],
  }
}
