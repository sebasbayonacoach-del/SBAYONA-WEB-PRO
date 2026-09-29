import { describe, expect, it } from 'vitest'
import { evidenceRegistry } from './evidenceRegistry.js'
import { membershipPlans } from './offerings.js'
import { validateContentModel } from '../lib/conversion/contentModel.js'
import { selectPublishableEvidence } from '../lib/conversion/evidence.js'
import {
  CLAIM_TYPES,
  CONTENT_MODEL_VOCABULARY,
  CONTENT_STATES,
  conversionContent,
  createPlanEditorialProjection,
  HOME_EVIDENCE_CONTEXT,
  homeContentModel,
  membershipPlanEditorialProjection,
  NARRATIVE_STAGES,
  PLAN_EDITORIAL_OVERLAY_FIELDS,
  planEditorialOverlays,
  validatePlanEditorialOverlays,
} from './conversionContent.js'

describe('configuración del Content_Model', () => {
  it('expone un vocabulario canónico e inmutable', () => {
    expect(NARRATIVE_STAGES).toEqual([
      'problem',
      'vision',
      'mechanism',
      'proof',
      'offer',
      'action',
    ])
    expect(CLAIM_TYPES).toEqual([
      'editorial',
      'aspiration',
      'commercial',
      'evidence',
      'concept',
    ])
    expect(CONTENT_STATES).toEqual([
      'verified',
      'aspirational',
      'concept',
      'unavailable',
    ])

    expect(Object.isFrozen(NARRATIVE_STAGES)).toBe(true)
    expect(Object.isFrozen(CLAIM_TYPES)).toBe(true)
    expect(Object.isFrozen(CONTENT_STATES)).toBe(true)
    expect(Object.isFrozen(CONTENT_MODEL_VOCABULARY)).toBe(true)
  })

  it('registra Home con la narrativa y acción canónicas vigentes', () => {
    expect(Object.keys(conversionContent)).toEqual(['/'])
    expect(conversionContent['/']).toBe(homeContentModel)
    expect(homeContentModel).toMatchObject({
      route: '/',
      // Titular vigente tras la reescritura de copy que pidió el dueño
      // (2026-09-22, «cambia todo el copy de toda la web, actúa como experto en
      // ventas»). Se sigue pineando a propósito: el objetivo de esta línea no es
      // la frase en sí, que nadie la cambie de rondón sin pasar por los gates de
      // honestidad de `test/conversionRegression.test.jsx`.
      h1: 'ENTRENA CON DIRECCIÓN. HAZTE MÁS FUERTE.',
      evidenceContext: 'home',
      metadataKey: '/',
      primaryAction: {
        // Etiqueta vigente tras la reescritura de copy del 2026-09-22. Lo que
        // este contrato exige es que la acción principal exista, esté en
        // mayúsculas y no prometa un resultado: no que se llame como ayer.
        label: 'QUIERO EMPEZAR CON DIRECCIÓN',
        destination: '/programs',
      },
    })
    expect(homeContentModel.blocks.map(({ stage }) => stage)).toEqual([
      'problem',
      'vision',
      'mechanism',
      'mechanism',
      'proof',
      'proof',
      'offer',
      'action',
    ])
    expect(new Set(homeContentModel.blocks.map(({ id }) => id)).size)
      .toBe(homeContentModel.blocks.length)
    expect(homeContentModel.blocks.every(({ sourceRef }) => (
      typeof sourceRef === 'string' && sourceRef.length > 0
    ))).toBe(true)

    const [problemBlock, visionBlock, mechanismBlock, benefitsBlock] = homeContentModel.blocks
    expect(problemBlock.items).toHaveLength(4)
    /*
      El cuerpo del dolor «cuerpo que habla» se reescribió el 2026-09-22 y quedó
      MEJOR que lo pineado: mantiene la señal corporal y añade el diferencial
      honesto (no dramatizar ni prometer curas). Se actualiza el literal; la
      guarda de claims médicos sigue viva en `conversionRegression.test.jsx`.
    */
    expect(problemBlock.items.find(({ id }) => id === 'discomfort-with-context').body)
      .toBe('No dramatizamos ni prometemos curas. Usamos tus señales como contexto para entrenar con más inteligencia.')

    expect(visionBlock).toMatchObject({
      stage: 'vision',
      claimType: 'aspiration',
      state: 'aspirational',
    })
    // El bloque de visión ya no se defiende ("esto no es una promesa…") ni
    // anuncia un plazo: habla de lo que la persona va a notar y termina en
    // primera persona del plural, que es la voz de la marca.
    expect(visionBlock.body).toMatch(/^El espejo va detrás\./i)
    expect(visionBlock.body).toMatch(/Vamos a verlo juntos\./i)
    expect(visionBlock.body).not.toMatch(/esto no es una promesa/i)
    /*
      Las cinco sensaciones de la escena de visión. Reescritas el 2026-09-22 en
      la pasada comercial del dueño. Se actualiza el literal conservando lo que
      el contrato vigila de verdad: que sean cinco, que ninguna prometa un
      resultado medible ni un plazo, y que hablen en segunda persona de
      sensaciones, no de cifras. Las nuevas cumplen las tres cosas (y «Dejas de
      vivir reiniciando» dice lo mismo que antes con la voz de una persona).
    */
    expect(visionBlock.items.map(({ title }) => title)).toEqual([
      'Abres el día con una acción concreta.',
      'Entiendes mejor lo que tu cuerpo responde.',
      'Entrenas con intención, no por culpa.',
      'Sabes cuál es el siguiente paso.',
      'Dejas de vivir reiniciando.',
    ])

    expect(mechanismBlock.items).toHaveLength(3)
    expect(mechanismBlock.items.map(({ marker }) => marker)).toEqual(['01', '02', '03'])
    expect(benefitsBlock).toMatchObject({
      id: 'home-process-benefits',
      stage: 'mechanism',
      claimType: 'editorial',
      state: 'verified',
    })
    expect(benefitsBlock.items.map(({ marker }) => marker)).toEqual(['01', '02', '03'])
    expect(validateContentModel(homeContentModel)).toEqual({ valid: true, errors: [] })

    expect(Object.isFrozen(conversionContent)).toBe(true)
    expect(Object.isFrozen(homeContentModel)).toBe(true)
    expect(Object.isFrozen(homeContentModel.blocks)).toBe(true)
    expect(Object.isFrozen(homeContentModel.primaryAction)).toBe(true)
    expect(homeContentModel.blocks.every(Object.isFrozen)).toBe(true)
    expect(problemBlock.items.every(Object.isFrozen)).toBe(true)
    expect(mechanismBlock.items.every(Object.isFrozen)).toBe(true)
    expect(benefitsBlock.items.every(Object.isFrozen)).toBe(true)
  })

  it('falla cerrado sin evidencia y referencia los planes fuente sin duplicar precios', () => {
    const evidenceBlock = homeContentModel.blocks.find(
      ({ id }) => id === 'home-evidence-unavailable',
    )
    const processFallback = homeContentModel.blocks.find(
      ({ id }) => id === 'home-process-fallback',
    )
    const offerBlock = homeContentModel.blocks.find(({ stage }) => stage === 'offer')

    expect(HOME_EVIDENCE_CONTEXT).toBe('home')
    expect(evidenceBlock).toMatchObject({
      stage: 'proof',
      claimType: 'evidence',
      state: 'unavailable',
      sourceRef: 'src/config/evidenceRegistry.js#home',
    })
    expect(processFallback).toMatchObject({
      stage: 'proof',
      claimType: 'editorial',
      state: 'verified',
    })
    // El bloque de proceso tiene que SEGUIR declarando que no fabrica pruebas.
    // Redactado vigente desde la reescritura de copy del 2026-09-22: la frase
    // cambió, la guarda (rechazar cifras y antes/después inventados) es la misma.
    expect(processFallback.body).toMatch(
      /No fabricamos cifras ni antes\/después falsos.*depende de tu contexto/is,
    )
    expect(processFallback.items.map(({ marker }) => marker)).toEqual(['01', '02', '03'])
    expect(homeContentModel.blocks.indexOf(processFallback))
      .toBeLessThan(homeContentModel.blocks.indexOf(offerBlock))
    expect(Object.isFrozen(processFallback.items)).toBe(true)
    expect(processFallback.items.every(Object.isFrozen)).toBe(true)
    expect(selectPublishableEvidence(evidenceRegistry, HOME_EVIDENCE_CONTEXT)).toEqual([])

    expect(offerBlock).toMatchObject({
      id: 'home-offer',
      stage: 'offer',
      claimType: 'commercial',
      state: 'verified',
    })
    expect(offerBlock.body).toMatch(/RAÍZ.*FUERZA.*RENDIMIENTO.*ELITE/is)
    expect(offerBlock.sourceRef).toContain('src/config/offerings.js#membershipPlans')

    const visibleModelCopy = [
      homeContentModel.h1,
      ...homeContentModel.blocks.flatMap(({ heading, body }) => [heading, body]),
      homeContentModel.primaryAction.label,
      homeContentModel.primaryAction.consequence,
    ].join(' ')

    for (const plan of membershipPlans) {
      expect(visibleModelCopy).not.toContain(plan.priceDisplay)
      expect(visibleModelCopy).not.toContain(String(plan.priceCop))
    }
  })
})

describe('adapter editorial de Commercial_Config', () => {
  it('mantiene cobertura completa y únicamente los campos editoriales aprobados', () => {
    expect(Object.keys(planEditorialOverlays)).toEqual(
      membershipPlans.map(({ id }) => id),
    )
    expect(PLAN_EDITORIAL_OVERLAY_FIELDS).toEqual([
      'descriptor',
      'jtbdSummary',
      'valueSummary',
    ])
    expect(Object.isFrozen(planEditorialOverlays)).toBe(true)

    for (const overlay of Object.values(planEditorialOverlays)) {
      expect(Object.keys(overlay)).toEqual(PLAN_EDITORIAL_OVERLAY_FIELDS)
      expect(Object.values(overlay).every((value) => (
        typeof value === 'string' && value.trim().length > 0
      ))).toBe(true)
      expect(Object.isFrozen(overlay)).toBe(true)
    }
  })

  it('conserva cada plan fuente por referencia y mantiene separado el overlay', () => {
    expect(validatePlanEditorialOverlays()).toBe(true)
    expect(Object.isFrozen(membershipPlanEditorialProjection)).toBe(true)
    expect(membershipPlanEditorialProjection).toHaveLength(membershipPlans.length)

    membershipPlanEditorialProjection.forEach(({ plan, overlay }, index) => {
      expect(plan).toBe(membershipPlans[index])
      expect(overlay).toBe(planEditorialOverlays[plan.id])
      expect(Object.isFrozen(membershipPlanEditorialProjection[index])).toBe(true)
    })

    const regeneratedProjection = createPlanEditorialProjection(
      membershipPlans,
      planEditorialOverlays,
    )
    expect(regeneratedProjection.map(({ plan }) => plan)).toEqual(membershipPlans)
  })

  it('rechaza planes sin overlay, overlays huérfanos y campos comerciales', () => {
    const missingPlanId = membershipPlans.at(-1).id
    const overlaysWithoutLastPlan = Object.fromEntries(
      Object.entries(planEditorialOverlays).filter(([planId]) => planId !== missingPlanId),
    )
    expect(() => validatePlanEditorialOverlays(membershipPlans, overlaysWithoutLastPlan))
      .toThrow(new RegExp(`Planes fuente sin overlay: ${missingPlanId}`))

    const overlaysWithOrphan = {
      ...planEditorialOverlays,
      LEGACY: {
        descriptor: 'Legacy',
        jtbdSummary: 'Texto editorial de prueba.',
        valueSummary: 'Valor editorial de prueba.',
      },
    }
    expect(() => validatePlanEditorialOverlays(membershipPlans, overlaysWithOrphan))
      .toThrow(/Overlays huérfanos: LEGACY/)

    const firstPlanId = membershipPlans[0].id
    const overlayWithCommercialField = {
      ...planEditorialOverlays,
      [firstPlanId]: {
        ...planEditorialOverlays[firstPlanId],
        priceCop: membershipPlans[0].priceCop,
      },
    }
    expect(() => validatePlanEditorialOverlays(membershipPlans, overlayWithCommercialField))
      .toThrow(new RegExp(`Campos editoriales no permitidos en ${firstPlanId}: priceCop`))
  })
})
