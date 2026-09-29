import { describe, expect, it } from 'vitest'
import {
  EVIDENCE_AUTHORIZATION_STATUSES,
  EVIDENCE_KINDS,
  EVIDENCE_VERIFICATION_STATUSES,
  EVIDENCE_VOCABULARY,
  selectPublishableEvidence,
} from './evidence.js'
import {
  draftEvidenceFixture,
  EVIDENCE_TEST_CONTEXT,
  evidenceStatusFixtures,
  rejectedEvidenceFixture,
  verifiedEvidenceFixture,
} from './evidence.testFixtures.js'

function verifiedRecord(overrides = {}) {
  return {
    ...verifiedEvidenceFixture,
    id: 'test-only-record',
    ...overrides,
  }
}

// Validates: Requirements 2.1, 2.2, 2.3, 2.9, 2.10, 2.11, 6.4, 6.9, 6.10
describe('selectPublishableEvidence', () => {
  it('expone el vocabulario cerrado de clase, verificación y autorización', () => {
    expect(EVIDENCE_KINDS).toEqual([
      'testimonial',
      'credential',
      'statistic',
      'case',
      'process',
    ])
    expect(EVIDENCE_VERIFICATION_STATUSES).toEqual([
      'draft',
      'verified',
      'rejected',
    ])
    expect(EVIDENCE_AUTHORIZATION_STATUSES).toEqual([
      'approved',
      'not-required',
      'missing',
    ])
    expect(Object.isFrozen(EVIDENCE_VOCABULARY)).toBe(true)
  })

  it('omite draft y rejected, y conserva sin extrapolar todo el contexto verificado', () => {
    const result = selectPublishableEvidence(
      evidenceStatusFixtures,
      EVIDENCE_TEST_CONTEXT,
    )

    expect(result).toEqual([verifiedEvidenceFixture])
    expect(result[0]).toBe(verifiedEvidenceFixture)
    expect(result[0]).toMatchObject({
      kind: 'testimonial',
      sourceRef: verifiedEvidenceFixture.sourceRef,
      authorizationStatus: 'approved',
      attribution: verifiedEvidenceFixture.attribution,
      scope: verifiedEvidenceFixture.scope,
      context: EVIDENCE_TEST_CONTEXT,
      content: verifiedEvidenceFixture.content,
    })
    expect(result).not.toContain(draftEvidenceFixture)
    expect(result).not.toContain(rejectedEvidenceFixture)
    expect(Object.isFrozen(result)).toBe(true)
  })

  it('rechaza registros verificados incompletos y ejemplos representativos internos', () => {
    const invalidRecords = [
      verifiedRecord({ id: '' }),
      verifiedRecord({ id: 'source-missing', sourceRef: '' }),
      verifiedRecord({ id: 'authorization-missing', authorizationStatus: 'missing' }),
      verifiedRecord({ id: 'attribution-missing', attribution: '' }),
      verifiedRecord({ id: 'scope-missing', scope: '' }),
      verifiedRecord({ id: 'kind-unknown', kind: 'unknown' }),
      verifiedRecord({ id: 'representative', isRepresentativeExample: true }),
    ]

    expect(selectPublishableEvidence(invalidRecords, EVIDENCE_TEST_CONTEXT)).toEqual([])
  })

  it('impide not-required en testimonios aunque los demás campos estén completos', () => {
    const testimonial = verifiedRecord({
      id: 'testimonial-without-authorization',
      authorizationStatus: 'not-required',
    })
    const documentedProcess = verifiedRecord({
      id: 'documented-process',
      kind: 'process',
      authorizationStatus: 'not-required',
      attribution: 'Proceso BAYONA documentado',
      scope: 'Descripción del proceso, no un resultado individual.',
    })

    expect(selectPublishableEvidence(
      [testimonial, documentedProcess],
      EVIDENCE_TEST_CONTEXT,
    )).toEqual([documentedProcess])
  })

  it('acota registros por contexto y falla cerrado ante ausencia o entrada inválida', () => {
    const otherContext = verifiedRecord({
      id: 'other-context',
      context: 'test-only.home.proof',
    })
    const registry = Object.freeze({
      [EVIDENCE_TEST_CONTEXT]: Object.freeze([
        verifiedEvidenceFixture,
        otherContext,
      ]),
    })

    expect(selectPublishableEvidence(registry, EVIDENCE_TEST_CONTEXT)).toEqual([
      verifiedEvidenceFixture,
    ])
    expect(selectPublishableEvidence(registry, 'test-only.missing')).toEqual([])
    expect(selectPublishableEvidence([], EVIDENCE_TEST_CONTEXT)).toEqual([])
    expect(selectPublishableEvidence(undefined, EVIDENCE_TEST_CONTEXT)).toEqual([])
    expect(selectPublishableEvidence([verifiedEvidenceFixture], '')).toEqual([])
  })
})
