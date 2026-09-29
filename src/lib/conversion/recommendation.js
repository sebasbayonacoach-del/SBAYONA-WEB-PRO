import { membershipPlanEditorialProjection } from '../../config/conversionContent.js'

/** @typedef {'constancia'|'comprension'|'personalizacion'|'acompanamiento-directo'} Motivation */
/** @typedef {'inicio'|'retomo'|'constante'} Experience */
/** @typedef {'estructura'|'seguimiento-semanal'|'sesiones-privadas'} SupportLevel */
/** @typedef {'uno-dos'|'tres'|'cuatro-mas'} Availability */
/** @typedef {'RAIZ'|'FUERZA'|'RENDIMIENTO'|'ELITE'} CanonicalPlanId */
/** @typedef {'motivation'|'experience'|'supportLevel'|'availability'} RecommendationField */

/**
 * @typedef {Object} RecommendationInput
 * @property {Motivation} motivation
 * @property {Experience} experience
 * @property {SupportLevel=} supportLevel Dimensión de Home/Programas; excluyente con availability.
 * @property {Availability=} availability Dimensión de Inicio Guiado; excluyente con supportLevel.
 */

/**
 * @typedef {Object} RecommendationValidationError
 * @property {string} code Código estable para tests y consumidores.
 * @property {string} path Campo asociado al error.
 * @property {string} message Explicación en español que no reproduce datos sensibles.
 */

/**
 * @typedef {Object} RecommendationReason
 * @property {string} ruleId Regla versionada que procesó la respuesta.
 * @property {string} answer Respuesta cerrada considerada.
 * @property {string} reason Razón visible basada en una característica publicada.
 */

/**
 * @typedef {Object} RecommendationResult
 * @property {CanonicalPlanId} planId
 * @property {ReadonlyArray<RecommendationReason>} reasons Una razón por cada respuesta usada.
 * @property {ReadonlyArray<CanonicalPlanId>} alternatives Exactamente los otros planes canónicos.
 * @property {string} ruleVersion
 * @property {string} disclaimer
 * @property {Readonly<Record<CanonicalPlanId, number>>} scores Puntuación reproducible por plan.
 * @property {{type:'highest-score'|'conservative-tie-break', candidates:ReadonlyArray<CanonicalPlanId>, reason:string}} decision
 */

export const MOTIVATIONS = Object.freeze([
  'constancia',
  'comprension',
  'personalizacion',
  'acompanamiento-directo',
])

export const EXPERIENCES = Object.freeze([
  'inicio',
  'retomo',
  'constante',
])

export const SUPPORT_LEVELS = Object.freeze([
  'estructura',
  'seguimiento-semanal',
  'sesiones-privadas',
])

export const AVAILABILITIES = Object.freeze([
  'uno-dos',
  'tres',
  'cuatro-mas',
])

export const RECOMMENDATION_VOCABULARY = Object.freeze({
  motivation: MOTIVATIONS,
  experience: EXPERIENCES,
  supportLevel: SUPPORT_LEVELS,
  availability: AVAILABILITIES,
})

/**
 * La versión cambia cuando cambia una regla, su puntuación o el orden de desempate.
 * 1.1.0 — catálogo de cuatro planes (RAIZ, FUERZA, RENDIMIENTO, ELITE) y
 * características re-publicadas por el catálogo vigente.
 */
export const RECOMMENDATION_RULE_VERSION = '1.1.0'

/**
 * Orden explícito de menor a mayor alcance comercial. Solo interviene si dos o
 * más planes comparten la puntuación máxima; nunca se usa el precio como señal.
 *
 * @type {ReadonlyArray<CanonicalPlanId>}
 */
export const CONSERVATIVE_PLAN_ORDER = Object.freeze([
  'RAIZ',
  'FUERZA',
  'RENDIMIENTO',
  'ELITE',
])

const SOURCE_PLAN_BY_ID = new Map(
  membershipPlanEditorialProjection.map(({ plan }) => [plan.id, plan]),
)

for (const planId of CONSERVATIVE_PLAN_ORDER) {
  if (!SOURCE_PLAN_BY_ID.has(planId)) {
    throw new Error(`Commercial_Config no publica el plan canónico ${planId}.`)
  }
}

if (SOURCE_PLAN_BY_ID.size !== CONSERVATIVE_PLAN_ORDER.length) {
  throw new Error('Las reglas de recomendación no cubren exactamente los planes canónicos publicados.')
}

function publishedIncludedFeature(id, planId, value) {
  const plan = SOURCE_PLAN_BY_ID.get(planId)
  if (!Array.isArray(plan?.included) || !plan.included.includes(value)) {
    throw new Error(`La característica ${id} ya no está publicada para ${planId}.`)
  }

  return Object.freeze({
    id,
    planId,
    sourcePath: `membershipPlans.${planId}.included`,
    value,
  })
}

/**
 * Referencias verificadas al importar contra el catálogo publicado en
 * Commercial_Config (membershipPlans). Cada cadena debe existir literalmente
 * en el `included` del plan citado. No incluyen precio, CTA, audiencia
 * inferida ni datos de salud.
 */
export const PUBLISHED_RECOMMENDATION_FEATURES = Object.freeze({
  'RAIZ.adjustable-plan': publishedIncludedFeature(
    'RAIZ.adjustable-plan',
    'RAIZ',
    'Plan de entrenamiento mensual personalizado',
  ),
  'RAIZ.biweekly-review': publishedIncludedFeature(
    'RAIZ.biweekly-review',
    'RAIZ',
    'Seguimiento quincenal con ajustes',
  ),
  'FUERZA.live-sessions': publishedIncludedFeature(
    'FUERZA.live-sessions',
    'FUERZA',
    '2 sesiones virtuales 1:1 al mes con tu entrenador',
  ),
  'FUERZA.weekly-review': publishedIncludedFeature(
    'FUERZA.weekly-review',
    'FUERZA',
    'Seguimiento semanal con ajustes',
  ),
  'RENDIMIENTO.live-sessions': publishedIncludedFeature(
    'RENDIMIENTO.live-sessions',
    'RENDIMIENTO',
    '4 sesiones virtuales 1:1 al mes con tu entrenador',
  ),
  'RENDIMIENTO.biomechanical-assessment': publishedIncludedFeature(
    'RENDIMIENTO.biomechanical-assessment',
    'RENDIMIENTO',
    'Evaluación biomecánica inicial completa',
  ),
  'RENDIMIENTO.advanced-plan': publishedIncludedFeature(
    'RENDIMIENTO.advanced-plan',
    'RENDIMIENTO',
    'Plan de alimentación avanzado con ajustes semanales',
  ),
  'ELITE.private-sessions': publishedIncludedFeature(
    'ELITE.private-sessions',
    'ELITE',
    '8 sesiones privadas al mes (virtuales, o presenciales en Bogotá)',
  ),
  'ELITE.direct-contact': publishedIncludedFeature(
    'ELITE.direct-contact',
    'ELITE',
    'WhatsApp DIRECTO con Sebastián (chat privado)',
  ),
})

function createRule(
  ruleId,
  field,
  answer,
  planId,
  publishedFeatureIds,
  reason,
) {
  for (const featureId of publishedFeatureIds) {
    const feature = PUBLISHED_RECOMMENDATION_FEATURES[featureId]
    if (!feature || feature.planId !== planId) {
      throw new Error(`La regla ${ruleId} referencia una característica publicada inválida.`)
    }
  }

  return Object.freeze({
    ruleId,
    field,
    answer,
    planId,
    points: 1,
    publishedFeatureIds: Object.freeze([...publishedFeatureIds]),
    reason,
  })
}

/**
 * Cada respuesta cerrada activa exactamente una regla y un punto. Las razones
 * solo citan características publicadas literalmente por Commercial_Config:
 * estructura ajustable/seguimiento quincenal (RAÍZ), sesiones en vivo y
 * seguimiento semanal (FUERZA), sesiones/evaluación/ajustes semanales
 * (RENDIMIENTO) o sesiones privadas/contacto directo (ELITE).
 */
export const RECOMMENDATION_RULES = Object.freeze([
  createRule(
    'motivation.constancia.raiz-structure',
    'motivation',
    'constancia',
    'RAIZ',
    ['RAIZ.adjustable-plan', 'RAIZ.biweekly-review'],
    'La motivación de construir constancia se orienta a RAÍZ por su plan ajustable y su seguimiento quincenal con ajustes.',
  ),
  createRule(
    'motivation.comprension.rendimiento-assessment',
    'motivation',
    'comprension',
    'RENDIMIENTO',
    ['RENDIMIENTO.biomechanical-assessment'],
    'La motivación de comprender mejor el proceso se orienta a RENDIMIENTO por su evaluación biomecánica inicial completa.',
  ),
  createRule(
    'motivation.personalizacion.fuerza-plan',
    'motivation',
    'personalizacion',
    'FUERZA',
    ['FUERZA.weekly-review'],
    'La motivación de personalizar el camino se orienta a FUERZA por su seguimiento semanal con ajustes.',
  ),
  createRule(
    'motivation.acompanamiento-directo.elite-contact',
    'motivation',
    'acompanamiento-directo',
    'ELITE',
    ['ELITE.direct-contact', 'ELITE.private-sessions'],
    'La preferencia por acompañamiento directo se orienta a ELITE por su WhatsApp directo con Sebastián y sus sesiones privadas publicadas.',
  ),
  createRule(
    'experience.inicio.raiz-adjustable',
    'experience',
    'inicio',
    'RAIZ',
    ['RAIZ.adjustable-plan'],
    'Una experiencia de inicio se orienta a RAÍZ por su estructura ajustable.',
  ),
  createRule(
    'experience.retomo.raiz-reviews',
    'experience',
    'retomo',
    'RAIZ',
    ['RAIZ.adjustable-plan', 'RAIZ.biweekly-review'],
    'Retomar una práctica se orienta a RAÍZ por su plan ajustable y su seguimiento quincenal con ajustes.',
  ),
  createRule(
    'experience.constante.fuerza-follow-up',
    'experience',
    'constante',
    'FUERZA',
    ['FUERZA.live-sessions', 'FUERZA.weekly-review'],
    'Una práctica constante se orienta a FUERZA por sus sesiones en vivo y su seguimiento semanal con ajustes.',
  ),
  createRule(
    'supportLevel.estructura.raiz-plan',
    'supportLevel',
    'estructura',
    'RAIZ',
    ['RAIZ.adjustable-plan'],
    'Preferir una estructura se orienta a RAÍZ por su plan mensual ajustable.',
  ),
  createRule(
    'supportLevel.seguimiento-semanal.fuerza-review',
    'supportLevel',
    'seguimiento-semanal',
    'FUERZA',
    ['FUERZA.weekly-review'],
    'Preferir seguimiento semanal se orienta a FUERZA porque publica seguimiento semanal con ajustes.',
  ),
  createRule(
    'supportLevel.sesiones-privadas.elite-sessions',
    'supportLevel',
    'sesiones-privadas',
    'ELITE',
    ['ELITE.private-sessions'],
    'Preferir sesiones privadas se orienta a ELITE porque publica sesiones privadas sujetas a coordinación y disponibilidad.',
  ),
  createRule(
    'availability.uno-dos.raiz-adjustable',
    'availability',
    'uno-dos',
    'RAIZ',
    ['RAIZ.adjustable-plan'],
    'Una disponibilidad de uno o dos momentos prioriza la estructura ajustable publicada por RAÍZ.',
  ),
  createRule(
    'availability.tres.rendimiento-weekly',
    'availability',
    'tres',
    'RENDIMIENTO',
    ['RENDIMIENTO.live-sessions', 'RENDIMIENTO.advanced-plan'],
    'Una disponibilidad de tres momentos orienta la comparación hacia las cuatro sesiones mensuales y los ajustes semanales publicados por RENDIMIENTO.',
  ),
  createRule(
    'availability.cuatro-mas.elite-sessions',
    'availability',
    'cuatro-mas',
    'ELITE',
    ['ELITE.private-sessions'],
    'Una disponibilidad de cuatro o más momentos permite considerar las sesiones privadas publicadas por ELITE, siempre sujetas a coordinación y disponibilidad.',
  ),
])

const RULE_BY_FIELD_AND_ANSWER = new Map()
for (const rule of RECOMMENDATION_RULES) {
  const key = `${rule.field}:${rule.answer}`
  if (RULE_BY_FIELD_AND_ANSWER.has(key)) {
    throw new Error(`Regla de recomendación duplicada para ${key}.`)
  }
  RULE_BY_FIELD_AND_ANSWER.set(key, rule)
}

const ALLOWED_INPUT_FIELDS = new Set(Object.keys(RECOMMENDATION_VOCABULARY))
const OPTION_SET_BY_FIELD = Object.freeze({
  motivation: new Set(MOTIVATIONS),
  experience: new Set(EXPERIENCES),
  supportLevel: new Set(SUPPORT_LEVELS),
  availability: new Set(AVAILABILITIES),
})

const SENSITIVE_NORMALIZED_KEYS = new Set([
  'gender',
  'genero',
  'sex',
  'sexo',
  'diagnosis',
  'diagnostico',
  'injury',
  'lesion',
  'biometric',
  'biometrics',
  'biometria',
  'datosbiometricos',
  'medicalhistory',
  'historiaclinica',
  'health',
  'salud',
  'bodyimage',
  'imagencorporal',
  'bodymeasurements',
  'medidascorporales',
  'radiography',
  'radiografia',
  'analytics',
  'analiticas',
  'identitydocument',
  'documentoidentidad',
])

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeKey(key) {
  return key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
}

function addError(errors, code, path, message) {
  errors.push(Object.freeze({ code, path, message }))
}

function isMissingAnswer(value) {
  return value === undefined
    || value === null
    || (typeof value === 'string' && value.trim() === '')
}

function validateAnswer(input, field, errors, required) {
  const present = Object.hasOwn(input, field)
  const value = input[field]

  if (!present || isMissingAnswer(value)) {
    if (required || present) {
      addError(
        errors,
        `input.${field}.required`,
        field,
        `Falta una respuesta válida para ${field}.`,
      )
    }
    return
  }

  if (!OPTION_SET_BY_FIELD[field].has(value)) {
    addError(
      errors,
      `input.${field}.invalid`,
      field,
      `La respuesta de ${field} no pertenece a sus opciones cerradas.`,
    )
  }
}

/**
 * Valida el esquema estricto sin normalizar, inferir ni conservar valores. Se
 * requieren motivación, experiencia y exactamente una dimensión adicional:
 * supportLevel para Home/Programas o availability para Inicio Guiado.
 *
 * @param {RecommendationInput | unknown} input
 * @returns {{valid:boolean, errors:ReadonlyArray<RecommendationValidationError>}}
 */
export function validateRecommendationInput(input) {
  const errors = []

  if (!isRecord(input)) {
    addError(errors, 'input.invalid', 'input', 'Las respuestas deben proporcionarse como un objeto.')
    return Object.freeze({ valid: false, errors: Object.freeze(errors) })
  }

  for (const rawKey of Reflect.ownKeys(input)) {
    if (typeof rawKey !== 'string') {
      addError(errors, 'input.key.unknown', String(rawKey), 'La entrada contiene una clave no permitida.')
      continue
    }

    if (ALLOWED_INPUT_FIELDS.has(rawKey)) continue

    const isSensitive = SENSITIVE_NORMALIZED_KEYS.has(normalizeKey(rawKey))
    addError(
      errors,
      isSensitive ? 'input.dimension.sensitive' : 'input.key.unknown',
      rawKey,
      isSensitive
        ? 'La recomendación no admite dimensiones sensibles.'
        : `La clave ${rawKey} no pertenece al esquema de recomendación.`,
    )
  }

  validateAnswer(input, 'motivation', errors, true)
  validateAnswer(input, 'experience', errors, true)

  const hasSupportLevel = Object.hasOwn(input, 'supportLevel')
  const hasAvailability = Object.hasOwn(input, 'availability')

  if (!hasSupportLevel && !hasAvailability) {
    addError(
      errors,
      'input.additional-dimension.required',
      'supportLevel|availability',
      'Falta la tercera respuesta: acompañamiento deseado o disponibilidad, según el flujo.',
    )
  } else if (hasSupportLevel && hasAvailability) {
    addError(
      errors,
      'input.additional-dimension.conflict',
      'supportLevel|availability',
      'Cada flujo debe usar una sola dimensión adicional.',
    )
  }

  validateAnswer(input, 'supportLevel', errors, false)
  validateAnswer(input, 'availability', errors, false)

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  })
}

export class RecommendationInputError extends TypeError {
  /** @param {ReadonlyArray<RecommendationValidationError>} errors */
  constructor(errors) {
    super('No se puede generar una recomendación con respuestas inválidas o incompletas.')
    this.name = 'RecommendationInputError'
    this.errors = errors
  }
}

export const RECOMMENDATION_DISCLAIMER = 'Orientación informativa basada únicamente en características publicadas. El ajuste y los resultados dependen del contexto de cada persona; puedes revisar todas las alternativas.'

/**
 * Produce una recomendación local, determinista y explicable. No accede a DOM,
 * red, almacenamiento, tiempo ni builders de canales externos.
 *
 * @param {RecommendationInput | unknown} input
 * @returns {RecommendationResult}
 * @throws {RecommendationInputError} Si el esquema estricto no es válido.
 */
export function recommendPlan(input) {
  const validation = validateRecommendationInput(input)
  if (!validation.valid) {
    throw new RecommendationInputError(validation.errors)
  }

  const thirdField = Object.hasOwn(input, 'supportLevel')
    ? 'supportLevel'
    : 'availability'
  const fields = /** @type {ReadonlyArray<RecommendationField>} */ ([
    'motivation',
    'experience',
    thirdField,
  ])
  const scores = Object.fromEntries(
    CONSERVATIVE_PLAN_ORDER.map((planId) => [planId, 0]),
  )

  const reasons = fields.map((field) => {
    const answer = input[field]
    const rule = RULE_BY_FIELD_AND_ANSWER.get(`${field}:${answer}`)

    if (!rule) {
      throw new Error(`No existe una regla versionada para ${field}:${String(answer)}.`)
    }

    scores[rule.planId] += rule.points
    return Object.freeze({
      ruleId: rule.ruleId,
      answer,
      reason: rule.reason,
    })
  })

  const maximumScore = Math.max(...Object.values(scores))
  const tiedPlanIds = CONSERVATIVE_PLAN_ORDER.filter(
    (planId) => scores[planId] === maximumScore,
  )
  const planId = tiedPlanIds[0]
  const alternatives = CONSERVATIVE_PLAN_ORDER.filter(
    (candidatePlanId) => candidatePlanId !== planId,
  )
  const tied = tiedPlanIds.length > 1
  const planName = SOURCE_PLAN_BY_ID.get(planId).name
  const candidateNames = tiedPlanIds
    .map((candidatePlanId) => SOURCE_PLAN_BY_ID.get(candidatePlanId).name)
    .join(', ')

  return Object.freeze({
    planId,
    reasons: Object.freeze(reasons),
    alternatives: Object.freeze(alternatives),
    ruleVersion: RECOMMENDATION_RULE_VERSION,
    disclaimer: RECOMMENDATION_DISCLAIMER,
    scores: Object.freeze(scores),
    decision: Object.freeze({
      type: tied ? 'conservative-tie-break' : 'highest-score',
      candidates: Object.freeze(tiedPlanIds),
      reason: tied
        ? `Empate de puntuación entre ${candidateNames}; la regla conservadora sugiere ${planName}, la opción de menor alcance comercial entre las empatadas.`
        : `${planName} reúne la puntuación más alta según las tres respuestas consideradas.`,
    }),
  })
}
