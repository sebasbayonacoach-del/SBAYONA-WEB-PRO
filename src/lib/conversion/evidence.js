/**
 * @typedef {'testimonial'|'credential'|'statistic'|'case'|'process'} EvidenceKind
 */

/**
 * @typedef {'draft'|'verified'|'rejected'} EvidenceVerificationStatus
 */

/**
 * @typedef {'approved'|'not-required'|'missing'} EvidenceAuthorizationStatus
 */

/**
 * @typedef {Object} EvidenceRecord
 * @property {string} id Identificador editorial estable.
 * @property {EvidenceKind} kind Clase de evidencia declarada, nunca inferida del texto.
 * @property {EvidenceVerificationStatus} verificationStatus Estado de comprobación.
 * @property {string} sourceRef Referencia comprobable a la fuente aprobada.
 * @property {EvidenceAuthorizationStatus} authorizationStatus Estado de autorización de publicación.
 * @property {string} attribution Atribución que debe acompañar a la evidencia publicada.
 * @property {string} scope Alcance y límites con los que puede interpretarse el registro.
 * @property {string=} context Contexto editorial explícito al que pertenece el registro.
 * @property {boolean=} isRepresentativeExample Marca material representativo interno, nunca publicable.
 */

/** @typedef {Readonly<Record<string, ReadonlyArray<EvidenceRecord>>>} EvidenceRegistry */

/** @type {ReadonlyArray<EvidenceKind>} */
export const EVIDENCE_KINDS = Object.freeze([
  'testimonial',
  'credential',
  'statistic',
  'case',
  'process',
])

/** @type {ReadonlyArray<EvidenceVerificationStatus>} */
export const EVIDENCE_VERIFICATION_STATUSES = Object.freeze([
  'draft',
  'verified',
  'rejected',
])

/** @type {ReadonlyArray<EvidenceAuthorizationStatus>} */
export const EVIDENCE_AUTHORIZATION_STATUSES = Object.freeze([
  'approved',
  'not-required',
  'missing',
])

export const EVIDENCE_VOCABULARY = Object.freeze({
  kinds: EVIDENCE_KINDS,
  verificationStatuses: EVIDENCE_VERIFICATION_STATUSES,
  authorizationStatuses: EVIDENCE_AUTHORIZATION_STATUSES,
})

const EVIDENCE_KIND_SET = new Set(EVIDENCE_KINDS)
const EMPTY_PUBLISHED_EVIDENCE = Object.freeze([])

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasPublishableAuthorization(record) {
  if (record.authorizationStatus === 'approved') return true

  return record.authorizationStatus === 'not-required'
    && record.kind !== 'testimonial'
}

function matchesContext(record, context) {
  if (record.context !== undefined && !isNonEmptyString(record.context)) {
    return false
  }

  if (context === undefined || record.context === undefined) return true

  return record.context === context
}

function isPublishableEvidence(record, context) {
  return isRecord(record)
    && isNonEmptyString(record.id)
    && EVIDENCE_KIND_SET.has(record.kind)
    && record.verificationStatus === 'verified'
    && isNonEmptyString(record.sourceRef)
    && hasPublishableAuthorization(record)
    && isNonEmptyString(record.attribution)
    && isNonEmptyString(record.scope)
    && record.isRepresentativeExample !== true
    && matchesContext(record, context)
}

function resolveCandidateRecords(recordsOrRegistry, context) {
  if (Array.isArray(recordsOrRegistry)) return recordsOrRegistry

  if (
    !isRecord(recordsOrRegistry)
    || !isNonEmptyString(context)
    || !Object.hasOwn(recordsOrRegistry, context)
  ) {
    return EMPTY_PUBLISHED_EVIDENCE
  }

  const contextualRecords = recordsOrRegistry[context]
  return Array.isArray(contextualRecords)
    ? contextualRecords
    : EMPTY_PUBLISHED_EVIDENCE
}

/**
 * Aplica Evidence_Gate sin mutar la entrada ni fabricar contenido alternativo.
 *
 * Puede recibir una colección ya acotada o un registro agrupado por contexto. Si
 * se proporciona un contexto explícito inválido, el gate falla de forma cerrada.
 * Los registros publicados conservan identidad, orden, fuente, atribución,
 * alcance, contexto y cualquier contenido aprobado asociado.
 *
 * @param {ReadonlyArray<EvidenceRecord> | EvidenceRegistry | unknown} recordsOrRegistry
 * @param {string=} context
 * @returns {ReadonlyArray<EvidenceRecord>}
 */
export function selectPublishableEvidence(recordsOrRegistry, context) {
  if (context !== undefined && !isNonEmptyString(context)) {
    return EMPTY_PUBLISHED_EVIDENCE
  }

  const candidates = resolveCandidateRecords(recordsOrRegistry, context)
  if (candidates.length === 0) return EMPTY_PUBLISHED_EVIDENCE

  const publishable = candidates.filter((record) => (
    isPublishableEvidence(record, context)
  ))

  return publishable.length > 0
    ? Object.freeze(publishable)
    : EMPTY_PUBLISHED_EVIDENCE
}
