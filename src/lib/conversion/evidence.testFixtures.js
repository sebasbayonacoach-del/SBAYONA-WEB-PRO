const TEST_CONTEXT = 'test-only.about.testimonials'

export const verifiedEvidenceFixture = Object.freeze({
  id: 'test-only-testimonial-verified',
  kind: 'testimonial',
  verificationStatus: 'verified',
  sourceRef: 'test-only://sources/testimonial-verified',
  authorizationStatus: 'approved',
  attribution: 'Atribución sintética de prueba',
  scope: 'Experiencia individual sintética; no representa un resultado general.',
  context: TEST_CONTEXT,
  content: Object.freeze({
    statement: 'Contenido sintético usado exclusivamente por el test.',
  }),
})

export const draftEvidenceFixture = Object.freeze({
  id: 'test-only-case-draft',
  kind: 'case',
  verificationStatus: 'draft',
  sourceRef: 'test-only://sources/case-draft',
  authorizationStatus: 'missing',
  attribution: 'Caso representativo sintético',
  scope: 'Material interno de prueba, no publicable.',
  context: TEST_CONTEXT,
  isRepresentativeExample: true,
})

export const rejectedEvidenceFixture = Object.freeze({
  id: 'test-only-statistic-rejected',
  kind: 'statistic',
  verificationStatus: 'rejected',
  sourceRef: 'test-only://sources/statistic-rejected',
  authorizationStatus: 'approved',
  attribution: 'Dato sintético rechazado',
  scope: 'Material rechazado usado exclusivamente por el test.',
  context: TEST_CONTEXT,
})

export const EVIDENCE_TEST_CONTEXT = TEST_CONTEXT

export const evidenceStatusFixtures = Object.freeze([
  verifiedEvidenceFixture,
  draftEvidenceFixture,
  rejectedEvidenceFixture,
])
