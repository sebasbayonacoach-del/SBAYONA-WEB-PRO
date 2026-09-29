const freezeOptions = (options) => Object.freeze(options.map((option) => Object.freeze(option)))

export const ONBOARDING_OPTIONS = Object.freeze({
  goal: freezeOptions([
    { value: 'constancia', label: 'Construir constancia' },
    { value: 'fuerza-general', label: 'Explorar fuerza general' },
    { value: 'movilidad-general', label: 'Explorar movilidad general' },
    { value: 'comparar-planes', label: 'Comparar acompañamientos' },
  ]),
  experience: freezeOptions([
    { value: 'inicio', label: 'Estoy empezando' },
    { value: 'retomo', label: 'Estoy retomando' },
    { value: 'constante', label: 'Ya tengo una práctica constante' },
  ]),
  availability: freezeOptions([
    { value: 'uno-dos', label: '1 o 2 momentos por semana' },
    { value: 'tres', label: '3 momentos por semana' },
    { value: 'cuatro-mas', label: '4 o más momentos por semana' },
  ]),
})

export const RESOURCE_QUESTION_TOPICS = freezeOptions([
  { value: 'reto', label: 'Reto 30 días' },
  { value: 'protocolo', label: 'Protocolo 7 días' },
  { value: 'calendario', label: 'Calendario orientativo' },
  { value: 'recursos', label: 'Recursos y categorías' },
])

export const QUESTION_LIMITS = Object.freeze({ min: 10, max: 280 })

const HEALTH_DATA_PATTERN = /\b(?:diagnostico(?:s)?|radiografia(?:s)?|analitica(?:s)?|analisis (?:clinico|medico|de sangre)|imagen(?:es)? corporal(?:es)?|fotografia(?:s)? corporal(?:es)?|historia(?:s)? clinica(?:s)?|informe(?:s)? medico(?:s)?|resultado(?:s)? medico(?:s)?|receta(?:s)?|medicacion(?:es)?|tratamiento(?:s)?|enfermedad(?:es)?|lesion(?:es)?|dolor(?:es)?|embarazo(?:s)?|discapacidad(?:es)?|biometr(?:ia|ias|ico|icos|ica|icas)|dato(?:s)? de salud|salud mental)\b/i
const IDENTITY_DATA_PATTERN = /\b(?:dni|nie|pasaporte|documento de identidad|numero de identidad|historia clinica)\b/i
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const PHONE_PATTERN = /(?:\+?\d[\s().-]*){7,}/

export function normalizeFormText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function normalizeForPrivacyScan(value) {
  return normalizeFormText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function detectSensitiveData(value) {
  const original = normalizeFormText(value)
  const normalized = normalizeForPrivacyScan(value)

  if (IDENTITY_DATA_PATTERN.test(normalized)) return 'datos de identificación'
  if (HEALTH_DATA_PATTERN.test(normalized)) return 'datos de salud'
  if (EMAIL_PATTERN.test(original) || PHONE_PATTERN.test(original)) return 'datos de contacto'

  return null
}

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? null
}

export function validateOnboarding(values = {}) {
  const errors = {}

  if (!optionLabel(ONBOARDING_OPTIONS.goal, values.goal)) {
    errors.goal = 'Selecciona un objetivo general.'
  }

  if (!optionLabel(ONBOARDING_OPTIONS.experience, values.experience)) {
    errors.experience = 'Selecciona tu experiencia general.'
  }

  if (!optionLabel(ONBOARDING_OPTIONS.availability, values.availability)) {
    errors.availability = 'Selecciona una disponibilidad orientativa.'
  }

  if (values.consent !== true) {
    errors.consent = 'Necesitamos tu consentimiento explícito antes de preparar el mensaje.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function createOnboardingMessage(values = {}) {
  const validation = validateOnboarding(values)
  if (!validation.valid) throw new Error('El onboarding contiene campos inválidos o no tiene consentimiento.')

  return [
    'Hola BAYONA, quiero orientación general para elegir un punto de partida.',
    `Objetivo general: ${optionLabel(ONBOARDING_OPTIONS.goal, values.goal)}.`,
    `Experiencia general: ${optionLabel(ONBOARDING_OPTIONS.experience, values.experience)}.`,
    `Disponibilidad orientativa: ${optionLabel(ONBOARDING_OPTIONS.availability, values.availability)}.`,
    'He revisado el propósito, el tratamiento local y el canal antes de compartir este resumen por WhatsApp.',
    'Este resumen no incluye nombre, email, teléfono, archivos ni datos de salud.',
    'Solicito orientación informativa; no un diagnóstico, tratamiento ni respuesta médica.',
  ].join('\n')
}

export function validateResourceQuestion(values = {}) {
  const errors = {}
  const normalizedQuestion = normalizeFormText(values.question)

  if (!optionLabel(RESOURCE_QUESTION_TOPICS, values.topic)) {
    errors.topic = 'Selecciona un tema general.'
  }

  if (normalizedQuestion.length < QUESTION_LIMITS.min) {
    errors.question = `Escribe una pregunta general de al menos ${QUESTION_LIMITS.min} caracteres.`
  } else if (normalizedQuestion.length > QUESTION_LIMITS.max) {
    errors.question = `Resume tu pregunta general en un máximo de ${QUESTION_LIMITS.max} caracteres.`
  } else {
    const sensitiveCategory = detectSensitiveData(normalizedQuestion)
    if (sensitiveCategory) {
      errors.question = `No podemos preparar una consulta que parezca incluir ${sensitiveCategory}. Reformúlala sin información personal o sensible.`
    }
  }

  if (values.consent !== true) {
    errors.consent = 'Confirma que has leído el propósito, el tratamiento y el canal antes de continuar.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalizedQuestion,
  }
}

export function createResourceQuestionMessage(values = {}) {
  const validation = validateResourceQuestion(values)
  if (!validation.valid) throw new Error('La pregunta contiene campos inválidos o no tiene consentimiento.')

  return [
    'Hola BAYONA, tengo una pregunta general sobre los recursos gratuitos.',
    `Tema: ${optionLabel(RESOURCE_QUESTION_TOPICS, values.topic)}.`,
    `Mi pregunta: ${validation.normalizedQuestion}`,
    'He revisado el propósito, el tratamiento local y el canal antes de abrir WhatsApp.',
    'No adjunto archivos. No solicito diagnóstico, tratamiento o respuesta médica.',
  ].join('\n')
}
