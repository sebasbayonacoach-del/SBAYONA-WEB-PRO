import { describe, expect, it } from 'vitest'
import { membershipPlanEditorialProjection } from '../../config/conversionContent.js'
import {
  AVAILABILITIES,
  CONSERVATIVE_PLAN_ORDER,
  EXPERIENCES,
  MOTIVATIONS,
  PUBLISHED_RECOMMENDATION_FEATURES,
  RecommendationInputError,
  RECOMMENDATION_DISCLAIMER,
  RECOMMENDATION_RULE_VERSION,
  RECOMMENDATION_RULES,
  RECOMMENDATION_VOCABULARY,
  SUPPORT_LEVELS,
  recommendPlan,
  validateRecommendationInput,
} from './recommendation.js'

const validSupportInput = Object.freeze({
  motivation: 'constancia',
  experience: 'inicio',
  supportLevel: 'estructura',
})

function inputForRule(rule) {
  const input = rule.field === 'availability'
    ? {
        motivation: 'constancia',
        experience: 'inicio',
        availability: 'uno-dos',
      }
    : {
        motivation: 'constancia',
        experience: 'inicio',
        supportLevel: 'estructura',
      }

  input[rule.field] = rule.answer
  return input
}

function errorCodes(result) {
  return result.errors.map(({ code }) => code)
}

// Validates: Requirements 2.8, 5.6, 5.7, 5.8, 7.4, 12.2, 12.3, 12.6, 12.7, 12.8
describe('reglas de recomendación explicable', () => {
  it('expone opciones cerradas, versión y orden conservador inmutables', () => {
    expect(MOTIVATIONS).toEqual([
      'constancia',
      'comprension',
      'personalizacion',
      'acompanamiento-directo',
    ])
    expect(EXPERIENCES).toEqual(['inicio', 'retomo', 'constante'])
    expect(SUPPORT_LEVELS).toEqual([
      'estructura',
      'seguimiento-semanal',
      'sesiones-privadas',
    ])
    expect(AVAILABILITIES).toEqual(['uno-dos', 'tres', 'cuatro-mas'])
    expect(CONSERVATIVE_PLAN_ORDER).toEqual(['RAIZ', 'FUERZA', 'RENDIMIENTO', 'ELITE'])
    expect(RECOMMENDATION_RULE_VERSION).toBe('1.1.0')

    expect(Object.isFrozen(MOTIVATIONS)).toBe(true)
    expect(Object.isFrozen(EXPERIENCES)).toBe(true)
    expect(Object.isFrozen(SUPPORT_LEVELS)).toBe(true)
    expect(Object.isFrozen(AVAILABILITIES)).toBe(true)
    expect(Object.isFrozen(RECOMMENDATION_VOCABULARY)).toBe(true)
    expect(Object.isFrozen(CONSERVATIVE_PLAN_ORDER)).toBe(true)
    expect(Object.isFrozen(RECOMMENDATION_RULES)).toBe(true)
  })

  it('traza cada característica de puntuación a una prestación publicada por Commercial_Config', () => {
    const sourcePlanById = new Map(
      membershipPlanEditorialProjection.map(({ plan }) => [plan.id, plan]),
    )

    for (const feature of Object.values(PUBLISHED_RECOMMENDATION_FEATURES)) {
      expect(sourcePlanById.get(feature.planId).included).toContain(feature.value)
      expect(feature.sourcePath).toBe(`membershipPlans.${feature.planId}.included`)
      expect(Object.isFrozen(feature)).toBe(true)
    }

    for (const rule of RECOMMENDATION_RULES) {
      expect(rule.points).toBe(1)
      expect(rule.publishedFeatureIds.length).toBeGreaterThan(0)
      for (const featureId of rule.publishedFeatureIds) {
        expect(PUBLISHED_RECOMMENDATION_FEATURES[featureId].planId).toBe(rule.planId)
      }
    }
  })

  it.each(RECOMMENDATION_RULES.map((rule) => [rule.ruleId, rule]))(
    'aplica y explica la regla %s',
    (_ruleId, rule) => {
      const result = recommendPlan(inputForRule(rule))

      expect(result.reasons).toContainEqual({
        ruleId: rule.ruleId,
        answer: rule.answer,
        reason: rule.reason,
      })
      expect(result.scores[rule.planId]).toBeGreaterThanOrEqual(rule.points)
    },
  )

  it('resuelve un empate hacia el menor alcance comercial y lo explica', () => {
    const result = recommendPlan({
      motivation: 'personalizacion',
      experience: 'inicio',
      supportLevel: 'sesiones-privadas',
    })

    expect(result.scores).toEqual({ RAIZ: 1, FUERZA: 1, RENDIMIENTO: 0, ELITE: 1 })
    expect(result.planId).toBe('RAIZ')
    expect(result.decision).toMatchObject({
      type: 'conservative-tie-break',
      candidates: ['RAIZ', 'FUERZA', 'ELITE'],
    })
    expect(result.decision.reason).toMatch(/regla conservadora.*menor alcance comercial/i)
  })

  it('es determinista aunque cambie el orden de las claves de entrada', () => {
    const firstInput = {
      motivation: 'acompanamiento-directo',
      experience: 'constante',
      supportLevel: 'sesiones-privadas',
    }
    const reorderedInput = {
      supportLevel: 'sesiones-privadas',
      experience: 'constante',
      motivation: 'acompanamiento-directo',
    }

    const first = recommendPlan(firstInput)
    const second = recommendPlan(firstInput)
    const reordered = recommendPlan(reorderedInput)

    expect(second).toEqual(first)
    expect(reordered).toEqual(first)
    expect(first.planId).toBe('ELITE')
    expect(Object.isFrozen(first)).toBe(true)
    expect(Object.isFrozen(first.reasons)).toBe(true)
    expect(Object.isFrozen(first.alternatives)).toBe(true)
  })

  it.each([
    [
      { motivation: 'constancia', experience: 'inicio', supportLevel: 'estructura' },
      'RAIZ',
      ['FUERZA', 'RENDIMIENTO', 'ELITE'],
    ],
    [
      { motivation: 'personalizacion', experience: 'constante', supportLevel: 'seguimiento-semanal' },
      'FUERZA',
      ['RAIZ', 'RENDIMIENTO', 'ELITE'],
    ],
    [
      { motivation: 'acompanamiento-directo', experience: 'constante', supportLevel: 'sesiones-privadas' },
      'ELITE',
      ['RAIZ', 'FUERZA', 'RENDIMIENTO'],
    ],
  ])('devuelve %s con exactamente los otros tres planes como alternativas', (input, expectedPlan, alternatives) => {
    const result = recommendPlan(input)

    expect(result.planId).toBe(expectedPlan)
    expect(result.alternatives).toEqual(alternatives)
    expect(new Set([result.planId, ...result.alternatives])).toEqual(
      new Set(CONSERVATIVE_PLAN_ORDER),
    )
  })

  it('mantiene razones y aviso informativos, no clínicos y sin certeza de resultado', () => {
    const representativeResults = [
      recommendPlan(validSupportInput),
      recommendPlan({
        motivation: 'personalizacion',
        experience: 'constante',
        availability: 'tres',
      }),
      recommendPlan({
        motivation: 'acompanamiento-directo',
        experience: 'constante',
        supportLevel: 'sesiones-privadas',
      }),
    ]
    const language = [
      RECOMMENDATION_DISCLAIMER,
      ...RECOMMENDATION_RULES.map(({ reason }) => reason),
      ...representativeResults.map(({ decision }) => decision.reason),
    ].join(' ')

    expect(language).not.toMatch(
      /diagn[oó]stic|prescri|tratamiento|cura|paciente|s[ií]ntoma|lesi[oó]n|biometr|historia cl[ií]nica/iu,
    )
    expect(language).not.toMatch(/garantiza|asegura|resultado cierto|encaja perfectamente/iu)
    expect(RECOMMENDATION_DISCLAIMER).toMatch(/informativa.*características publicadas/iu)
    expect(RECOMMENDATION_DISCLAIMER).toMatch(/dependen del contexto/iu)
  })

  it('no crea URL, canal externo ni efectos de envío en el resultado', () => {
    const result = recommendPlan(validSupportInput)
    const serialized = JSON.stringify(result)

    expect(serialized).not.toMatch(/https?:|wa\.me|whatsapp|externalUrl|\burl\b/iu)
    expect(result).not.toHaveProperty('url')
    expect(result).not.toHaveProperty('externalUrl')
  })
})

// Validates: Requirements 2.8, 12.2, 12.3, 12.6
describe('validación estricta de respuestas de recomendación', () => {
  it('rechaza respuestas incompletas sin producir resultado ni URL', () => {
    const validation = validateRecommendationInput({ motivation: 'constancia' })

    expect(validation.valid).toBe(false)
    expect(errorCodes(validation)).toEqual(expect.arrayContaining([
      'input.experience.required',
      'input.additional-dimension.required',
    ]))
    expect(validation).not.toHaveProperty('result')
    expect(validation).not.toHaveProperty('url')
    expect(() => recommendPlan({ motivation: 'constancia' })).toThrow(RecommendationInputError)
  })

  it('rechaza valores ajenos a los enums y dimensiones adicionales simultáneas', () => {
    const unknownValue = validateRecommendationInput({
      motivation: 'fuerza',
      experience: 'inicio',
      supportLevel: 'estructura',
    })
    const conflictingDimensions = validateRecommendationInput({
      ...validSupportInput,
      availability: 'uno-dos',
    })

    expect(errorCodes(unknownValue)).toContain('input.motivation.invalid')
    expect(errorCodes(conflictingDimensions)).toContain('input.additional-dimension.conflict')
    expect(() => recommendPlan({
      motivation: 'fuerza',
      experience: 'inicio',
      supportLevel: 'estructura',
    })).toThrow(RecommendationInputError)
  })

  it('rechaza claves ajenas aunque las tres respuestas permitidas sean válidas', () => {
    const validation = validateRecommendationInput({
      ...validSupportInput,
      campaign: 'test-only',
    })

    expect(validation.valid).toBe(false)
    expect(validation.errors).toContainEqual(expect.objectContaining({
      code: 'input.key.unknown',
      path: 'campaign',
    }))
  })

  it.each([
    'gender',
    'género',
    'diagnostico',
    'lesión',
    'biometria',
    'historiaClinica',
    'salud',
    'imagenCorporal',
  ])('rechaza la dimensión sensible %s sin reproducir su valor', (sensitiveKey) => {
    const validation = validateRecommendationInput({
      ...validSupportInput,
      [sensitiveKey]: 'valor-que-no-debe-procesarse',
    })

    expect(validation.valid).toBe(false)
    expect(validation.errors).toContainEqual({
      code: 'input.dimension.sensitive',
      path: sensitiveKey,
      message: 'La recomendación no admite dimensiones sensibles.',
    })
    expect(JSON.stringify(validation.errors)).not.toContain('valor-que-no-debe-procesarse')
  })

  it('rechaza entradas que no sean objetos y conserva errores estructurados', () => {
    const validation = validateRecommendationInput(null)

    expect(validation).toEqual({
      valid: false,
      errors: [{
        code: 'input.invalid',
        path: 'input',
        message: 'Las respuestas deben proporcionarse como un objeto.',
      }],
    })
    expect(Object.isFrozen(validation)).toBe(true)
    expect(Object.isFrozen(validation.errors)).toBe(true)
  })
})
