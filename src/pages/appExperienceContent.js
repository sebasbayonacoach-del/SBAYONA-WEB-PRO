import {
  WHATSAPP_NUMBER,
  buildWhatsAppUrl,
  membershipPlans,
} from '../config/offerings'

export const BAYONA_PLUS_CONTENT_CONTRACT = Object.freeze({
  stateLabel: 'Acceso prioritario conceptual',
  mockupLabel: 'Maqueta conceptual no operativa',
  numberLabel: 'Número conceptual; no corresponde a una medición real',
  allowedCtaPurposes: Object.freeze(['novedades', 'confirmar-condiciones']),
})

export const BAYONA_PLUS_CLAIM_RULES = Object.freeze([
  Object.freeze({
    id: 'inteligencia-artificial-operativa',
    pattern: /(?:ofrece|incluye|usa|incorpora)\s+(?:ia|inteligencia artificial)\s+(?:activa|funcional|operativa)/i,
  }),
  Object.freeze({
    id: 'backend-operativo',
    pattern: /(?:backend|servidor)\s+(?:activo|conectado|funcional|operativo)/i,
  }),
  Object.freeze({
    id: 'sincronizacion-operativa',
    pattern: /sincroniz(?:a|ación)\s+(?:automática|activa|en tiempo real|tus datos)/i,
  }),
  Object.freeze({
    id: 'usuarios-reales',
    pattern: /(?:\d[\d.,]*\s+usuarios|usuarios activos|comunidad de \d)/i,
  }),
  Object.freeze({
    id: 'datos-reales',
    pattern: /(?:muestra|procesa|analiza|conecta)\s+(?:tus\s+)?datos\s+(?:reales|personales|en tiempo real)/i,
  }),
  Object.freeze({
    id: 'tiendas',
    pattern: /disponible\s+(?:en|para)\s+(?:app store|google play)/i,
  }),
  Object.freeze({
    id: 'fecha-confirmada',
    pattern: /(?:lanzamiento|fecha)\s+(?:confirmad[ao]|el\s+\d)|disponible\s+desde\s+el/i,
  }),
  Object.freeze({
    id: 'disponibilidad-confirmada',
    pattern: /(?:ya disponible|disponibilidad confirmada|disponible ahora)/i,
  }),
  Object.freeze({
    id: 'acceso-garantizado',
    pattern: /(?:plaza|acceso)\s+(?:confirmad[ao]|garantizad[ao]|inmediat[ao]|automátic[ao])/i,
  }),
])

const GUARANTEE_PATTERN = /(?:plaza|fecha|acceso|disponibilidad)\s+(?:confirmad[ao]|garantizad[ao]|reservad[ao]|inmediat[ao]|automátic[ao])/i

export function auditBayonaPlusCopy(copy) {
  const value = String(copy ?? '')
  return BAYONA_PLUS_CLAIM_RULES
    .filter((rule) => rule.pattern.test(value))
    .map((rule) => rule.id)
}

export function auditBayonaPlusCta({ href, message, purpose } = {}) {
  const issues = []

  if (!BAYONA_PLUS_CONTENT_CONTRACT.allowedCtaPurposes.includes(purpose)) {
    issues.push('proposito-no-permitido')
  }

  try {
    const url = new URL(String(href ?? ''))
    if (url.protocol !== 'https:' || url.hostname !== 'wa.me' || url.pathname !== `/${WHATSAPP_NUMBER}`) {
      issues.push('canal-no-oficial')
    }
  } catch {
    issues.push('canal-no-oficial')
  }

  if (GUARANTEE_PATTERN.test(String(message ?? ''))) {
    issues.push('garantia-no-permitida')
  }

  return issues
}

/**
 * Qué planes publican hoy algo relacionado con BAYONA+.
 *
 * La matriz de comparación no tiene fila `BAYONA+` (lo comprobó la auditoría de
 * 22-09), así que antes esta constante devolvía siempre `[]` y la página no
 * podía enseñar el modelo free / suscriptor que pide la dirección de producto.
 * Se resuelve con el dato que sí existe: la lista `included` de cada plan, y la
 * herencia declarada en `includedLead` («Todo RENDIMIENTO más:» ⇒ ELITE arrastra
 * su acceso anticipado). Sin inventar una fila que nadie mantiene.
 */
const PLUS_BENEFIT_PATTERN = /BAYONA\+/
const INHERITS_LEAD_PATTERN = /todo\s+([a-záéíóúñ]+)\s+m\u00e1s/i

function planWithPlus(plan, seen = new Set()) {
  if (!plan || seen.has(plan.id)) return false
  seen.add(plan.id)
  if (plan.included?.some((item) => PLUS_BENEFIT_PATTERN.test(item))) return true

  const inherited = INHERITS_LEAD_PATTERN.exec(plan.includedLead ?? '')?.[1]
    ?.toLocaleUpperCase('es')
  if (!inherited) return false

  return planWithPlus(membershipPlans.find((item) => item.id === inherited || item.name === inherited), seen)
}

/** Etiqueta honesta de la condición: publicada, no concedida. */
function plusConditionOf(plan) {
  const direct = plan.included?.some((item) => PLUS_BENEFIT_PATTERN.test(item))
  return direct ? 'Beneficio publicado: acceso anticipado' : 'Heredado de RENDIMIENTO'
}

export const BAYONA_PLUS_PLAN_OPTIONS = Object.freeze(
  membershipPlans
    .filter((plan) => planWithPlus(plan))
    .map((plan) => Object.freeze({
      id: plan.id,
      name: plan.name,
      feature: 'BAYONA+',
      condition: plusConditionOf(plan),
    })),
)

/** Lo que SÍ puede hacer hoy quien no contrata nada (dato real de la web). */
export const BAYONA_PLUS_FREE_TIER = Object.freeze([
  Object.freeze({ title: 'RECURSOS ABIERTOS', copy: 'Guías, revista y protocolo de 7 días sin cuenta y sin tarjeta.' }),
  Object.freeze({ title: 'COMUNIDAD', copy: 'Entrada libre al grupo: conversación, recursos y práctica semanal.' }),
  Object.freeze({ title: 'SEGUIMIENTO SIMPLE', copy: 'Registrar sesiones y ver tu progreso en este dispositivo desde tu cuenta.' }),
  Object.freeze({ title: 'LISTA PRIORITARIA', copy: 'Tu nombre en la lista de interés de BAYONA+, sin fecha ni plaza asignada.' }),
])

/** Lo que está en preparación para quien contrate un plan con acceso anticipado. */
export const BAYONA_PLUS_SUBSCRIBER_TIER = Object.freeze([
  Object.freeze({ title: 'FUNCIONES AVANZADAS', copy: 'Lectura de carga, recuperación y contexto de la semana. En definición.' }),
  Object.freeze({ title: 'ANÁLISIS DEL PROCESO', copy: 'Tendencias conversables con tu entrenador, no diagnósticos automáticos.' }),
  Object.freeze({ title: 'PERSONALIZACIÓN', copy: 'Pantallas ordenadas por tu plan, tu equipo y tu horario.' }),
  Object.freeze({ title: 'INTEGRACIÓN CON PROGRAMAS', copy: 'Sesión asignada, revisión y resultado en un mismo hilo. Sin confirmar.' }),
])

export const BAYONA_PLUS_POSSIBLE_BENEFITS = Object.freeze([
  Object.freeze({
    id: 'claridad',
    number: '01',
    title: 'CLARIDAD POSIBLE',
    copy: 'Podría reunir contexto en una lectura más clara, sin presentar cifras aisladas como resultados.',
  }),
  Object.freeze({
    id: 'continuidad',
    number: '02',
    title: 'CONTINUIDAD POSIBLE',
    copy: 'Podría mantener un hilo visual coherente entre distintas superficies, si el producto llega a desarrollarse.',
  }),
  Object.freeze({
    id: 'comprension',
    number: '03',
    title: 'COMPRENSIÓN POSIBLE',
    copy: 'Podría ayudar a comprender el proceso sin prometer resultados, automatizaciones ni decisiones personales.',
  }),
])

export const BAYONA_PLUS_CONCEPT_MODULES = Object.freeze([
  Object.freeze({ id: 'claridad', title: 'CLARIDAD', value: '78 / 100', spokenValue: 'Número conceptual: 78 de 100' }),
  Object.freeze({ id: 'lecturas', title: 'LECTURAS', value: '04 VISTAS', spokenValue: 'Número conceptual: cuatro vistas' }),
  Object.freeze({ id: 'secuencia', title: 'SECUENCIA', value: 'BLOQUE A', spokenValue: 'Ejemplo conceptual: bloque A' }),
  Object.freeze({ id: 'proceso', title: 'PROCESO', value: '62 %', spokenValue: 'Número conceptual: 62 por ciento' }),
  Object.freeze({ id: 'notas', title: 'NOTAS', value: '12 IDEAS', spokenValue: 'Número conceptual: doce ideas' }),
  Object.freeze({ id: 'marcos', title: 'MARCOS', value: '06 VISTAS', spokenValue: 'Número conceptual: seis vistas' }),
])

export const BAYONA_PLUS_DISCLOSURE = [
  'Maquetas conceptuales no operativas.',
  'No hay funciones de inteligencia artificial, conexión a backend, sincronización, usuarios, datos reales, tiendas, fecha de lanzamiento ni disponibilidad.',
].join(' ')

/**
 * Mensaje único de la lista de acceso prioritario.
 *
 * Lleva literalmente «en desarrollo» y «novedades» porque es el canal por donde
 * el visitante pide seguimiento: quien escribe ya sabe en qué estado está el
 * producto. El resto de la página solo necesita decirlo UNA vez (ver el bloque
 * 08 / ESTADO), que es lo que pide la dirección de producto: tono de preventa,
 * no disculpa repetida.
 */
export const BAYONA_PLUS_UPDATES_MESSAGE = [
  'Hola BAYONA, quiero recibir novedades de BAYONA+, que está en desarrollo, y entrar en la lista de acceso prioritario.',
  'Entiendo que es una lista informativa: no implica compra ni compromiso.',
].join(' ')

const plansForConditionRequest = BAYONA_PLUS_PLAN_OPTIONS.map((plan) => plan.name).join(' y ')

export const BAYONA_PLUS_CONDITIONS_MESSAGE = [
  `Hola BAYONA, quiero confirmar las condiciones vigentes publicadas para BAYONA+${plansForConditionRequest ? ` en ${plansForConditionRequest}` : ''}.`,
  'Entiendo que esta consulta no reserva plaza ni garantiza fecha, disponibilidad o acceso.',
].join(' ')

export const BAYONA_PLUS_UPDATES_URL = buildWhatsAppUrl(BAYONA_PLUS_UPDATES_MESSAGE)
export const BAYONA_PLUS_CONDITIONS_URL = buildWhatsAppUrl(BAYONA_PLUS_CONDITIONS_MESSAGE)
