import {
  CLAIM_TYPES,
  CONTENT_STATES,
  NARRATIVE_STAGES,
} from '../../config/conversionContent.js'

/** @typedef {import('../../config/conversionContent.js').ContentBlock} ContentBlock */
/** @typedef {import('../../config/conversionContent.js').PageContentModel} PageContentModel */

/**
 * @typedef {Object} ContentModelValidationError
 * @property {string} code Código estable para tests y consumidores.
 * @property {string} path Ruta del campo inválido dentro del modelo.
 * @property {string} message Diagnóstico legible para desarrollo.
 */

/**
 * @typedef {Object} ContentModelValidationResult
 * @property {boolean} valid
 * @property {ReadonlyArray<ContentModelValidationError>} errors
 */

const STAGE_INDEX = new Map(
  NARRATIVE_STAGES.map((stage, index) => [stage, index]),
)
const CLAIM_TYPE_SET = new Set(CLAIM_TYPES)
const CONTENT_STATE_SET = new Set(CONTENT_STATES)

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function addError(errors, code, path, message) {
  errors.push(Object.freeze({ code, path, message }))
}

function validateRequiredBlockFields(block, index, errors) {
  const path = `blocks[${index}]`

  if (!isNonEmptyString(block.id)) {
    addError(errors, 'block.id.required', `${path}.id`, 'El bloque necesita un id no vacío.')
  }

  if (!isNonEmptyString(block.stage)) {
    addError(errors, 'block.stage.required', `${path}.stage`, 'El bloque necesita una etapa narrativa.')
  } else if (!STAGE_INDEX.has(block.stage)) {
    addError(errors, 'block.stage.invalid', `${path}.stage`, `La etapa "${block.stage}" no pertenece a Narrative_Flow.`)
  }

  if (!isNonEmptyString(block.claimType)) {
    addError(errors, 'block.claimType.required', `${path}.claimType`, 'El bloque necesita un tipo de claim.')
  } else if (!CLAIM_TYPE_SET.has(block.claimType)) {
    addError(errors, 'block.claimType.invalid', `${path}.claimType`, `El tipo de claim "${block.claimType}" no está permitido.`)
  }

  if (!isNonEmptyString(block.state)) {
    addError(errors, 'block.state.required', `${path}.state`, 'El bloque necesita un estado de contenido.')
  } else if (!CONTENT_STATE_SET.has(block.state)) {
    addError(errors, 'block.state.invalid', `${path}.state`, `El estado "${block.state}" no está permitido.`)
  }

  if (!isNonEmptyString(block.heading)) {
    addError(errors, 'block.heading.required', `${path}.heading`, 'El bloque necesita un encabezado no vacío.')
  }

  if (!isNonEmptyString(block.body)) {
    addError(errors, 'block.body.required', `${path}.body`, 'El bloque necesita un cuerpo no vacío.')
  }

  if (block.sourceRef !== undefined && !isNonEmptyString(block.sourceRef)) {
    addError(errors, 'block.sourceRef.invalid', `${path}.sourceRef`, 'La referencia de fuente debe ser un texto no vacío cuando se declara.')
  }
}

function validateClaimState(block, index, errors) {
  const path = `blocks[${index}]`
  const claimTypeIsValid = CLAIM_TYPE_SET.has(block.claimType)
  const stateIsValid = CONTENT_STATE_SET.has(block.state)

  if (!claimTypeIsValid || !stateIsValid) return

  if (block.claimType === 'aspiration' && block.state !== 'aspirational') {
    addError(errors, 'block.aspiration-state.invalid', `${path}.state`, 'Un claim aspiracional debe declarar el estado aspirational.')
  }

  if (block.state === 'aspirational' && block.claimType !== 'aspiration') {
    addError(errors, 'block.aspirational-claim.invalid', `${path}.claimType`, 'El estado aspirational solo puede identificar un claim de tipo aspiration.')
  }

  if (block.claimType === 'concept' && block.state !== 'concept') {
    addError(errors, 'block.concept-state.invalid', `${path}.state`, 'Un claim conceptual debe declarar el estado concept.')
  }

  if (block.state === 'concept' && block.claimType !== 'concept') {
    addError(errors, 'block.concept-claim.invalid', `${path}.claimType`, 'El estado concept solo puede identificar un claim de tipo concept.')
  }
}

function validateUniqueIds(blocks, errors) {
  const firstIndexById = new Map()

  blocks.forEach((block, index) => {
    if (!isRecord(block) || !isNonEmptyString(block.id)) return

    if (firstIndexById.has(block.id)) {
      addError(
        errors,
        'block.id.duplicate',
        `blocks[${index}].id`,
        `El id "${block.id}" ya se usa en blocks[${firstIndexById.get(block.id)}].`,
      )
      return
    }

    firstIndexById.set(block.id, index)
  })
}

function validateNarrativeOrder(blocks, errors) {
  let previousStage = null
  let previousIndex = -1
  let mechanismSeen = false

  blocks.forEach((block, index) => {
    if (!isRecord(block) || !STAGE_INDEX.has(block.stage)) return

    if (block.stage === 'offer' && !mechanismSeen) {
      addError(
        errors,
        'flow.offer-before-mechanism',
        `blocks[${index}].stage`,
        'La oferta no puede aparecer antes del primer bloque de mecanismo.',
      )
    }

    const currentStageIndex = STAGE_INDEX.get(block.stage)
    if (
      previousStage !== null
      && currentStageIndex < STAGE_INDEX.get(previousStage)
    ) {
      addError(
        errors,
        'flow.order.invalid',
        `blocks[${index}].stage`,
        `La etapa "${block.stage}" no puede aparecer después de "${previousStage}" en blocks[${previousIndex}].`,
      )
    }

    previousStage = block.stage
    previousIndex = index
    if (block.stage === 'mechanism') mechanismSeen = true
  })
}

/**
 * Valida un PageContentModel sin mutarlo ni acceder a React, DOM, red,
 * almacenamiento o tiempo.
 *
 * Reglas principales:
 * - cada bloque declara exactamente una etapa, un tipo de claim y un estado válidos;
 * - los ids son únicos y el copy estructural requerido no está vacío;
 * - aspiration/aspirational y concept/concept se corresponden de forma explícita;
 * - Narrative_Flow es no decreciente;
 * - offer nunca precede al primer mechanism.
 *
 * @param {PageContentModel | unknown} model
 * @returns {ContentModelValidationResult}
 */
export function validateContentModel(model) {
  const errors = []

  if (!isRecord(model)) {
    addError(errors, 'model.invalid', 'model', 'El Content_Model debe ser un objeto.')
    return Object.freeze({ valid: false, errors: Object.freeze(errors) })
  }

  if (!Array.isArray(model.blocks) || model.blocks.length === 0) {
    addError(errors, 'model.blocks.required', 'blocks', 'El Content_Model necesita al menos un bloque.')
    return Object.freeze({ valid: false, errors: Object.freeze(errors) })
  }

  model.blocks.forEach((block, index) => {
    if (!isRecord(block)) {
      addError(errors, 'block.invalid', `blocks[${index}]`, 'Cada bloque debe ser un objeto.')
      return
    }

    validateRequiredBlockFields(block, index, errors)
    validateClaimState(block, index, errors)
  })

  validateUniqueIds(model.blocks, errors)
  validateNarrativeOrder(model.blocks, errors)

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  })
}
