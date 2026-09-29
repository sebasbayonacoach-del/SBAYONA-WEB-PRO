import { describe, expect, it } from 'vitest'
import { validateContentModel } from './contentModel.js'

function block(id, stage, claimType = 'editorial', state = 'verified') {
  return {
    id,
    stage,
    claimType,
    state,
    heading: `Encabezado ${id}`,
    body: `Contenido ${id}`,
  }
}

function modelWith(blocks) {
  return {
    route: '/prueba',
    h1: 'Un resultado posible',
    blocks,
    primaryAction: {
      label: 'Conocer el siguiente paso',
      destination: '/programs',
      consequence: 'Abre la comparación de acompañamientos.',
    },
    metadataKey: '/prueba',
  }
}

function errorCodes(result) {
  return result.errors.map(({ code }) => code)
}

// Validates: Requirements 1.2, 1.3, 1.6, 2.4, 2.5
describe('validateContentModel', () => {
  it('acepta modelos completos o parciales cuando sus bloques conservan el orden narrativo', () => {
    const completeModel = modelWith([
      block('situacion', 'problem'),
      block('futuro-posible', 'vision', 'aspiration', 'aspirational'),
      block('puente', 'mechanism'),
      block('proceso', 'proof'),
      block('acompanamiento', 'offer', 'commercial'),
      block('siguiente-paso', 'action'),
    ])
    const beforeAfterBridge = modelWith([
      block('antes', 'problem'),
      block('despues-posible', 'vision', 'aspiration', 'aspirational'),
      block('puente', 'mechanism'),
    ])

    expect(validateContentModel(completeModel)).toEqual({ valid: true, errors: [] })
    expect(validateContentModel(beforeAfterBridge)).toEqual({ valid: true, errors: [] })
  })

  it('rechaza un bloque sin etapa', () => {
    const stageMissing = block('sin-etapa', 'problem')
    delete stageMissing.stage

    const result = validateContentModel(modelWith([stageMissing]))

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(expect.objectContaining({
      code: 'block.stage.required',
      path: 'blocks[0].stage',
    }))
  })

  it('rechaza cualquier descenso en el orden canónico de Narrative_Flow', () => {
    const result = validateContentModel(modelWith([
      block('vision', 'vision', 'aspiration', 'aspirational'),
      block('problema-tardio', 'problem'),
    ]))

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(expect.objectContaining({
      code: 'flow.order.invalid',
      path: 'blocks[1].stage',
    }))
  })

  it('rechaza offer si todavía no ha aparecido mechanism', () => {
    const result = validateContentModel(modelWith([
      block('problema', 'problem'),
      block('oferta-prematura', 'offer', 'commercial'),
      block('mecanismo-tardio', 'mechanism'),
    ]))

    expect(result.valid).toBe(false)
    expect(errorCodes(result)).toContain('flow.offer-before-mechanism')
  })

  it('exige correspondencia explícita para estados aspiracionales y conceptuales', () => {
    const validStates = validateContentModel(modelWith([
      block('aspiracion', 'vision', 'aspiration', 'aspirational'),
      block('concepto', 'mechanism', 'concept', 'concept'),
    ]))
    const aspirationWithoutState = validateContentModel(modelWith([
      block('aspiracion', 'vision', 'aspiration', 'verified'),
    ]))
    const conceptWithoutState = validateContentModel(modelWith([
      block('concepto', 'vision', 'concept', 'verified'),
    ]))
    const aspirationalStateOnEditorial = validateContentModel(modelWith([
      block('editorial', 'vision', 'editorial', 'aspirational'),
    ]))
    const conceptStateOnEditorial = validateContentModel(modelWith([
      block('editorial', 'vision', 'editorial', 'concept'),
    ]))

    expect(validStates).toEqual({ valid: true, errors: [] })
    expect(errorCodes(aspirationWithoutState)).toContain('block.aspiration-state.invalid')
    expect(errorCodes(conceptWithoutState)).toContain('block.concept-state.invalid')
    expect(errorCodes(aspirationalStateOnEditorial)).toContain('block.aspirational-claim.invalid')
    expect(errorCodes(conceptStateOnEditorial)).toContain('block.concept-claim.invalid')
  })
})
