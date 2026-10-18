import { describe, expect, it } from 'vitest'
import { COACH_VISIT_STEPS, coachAnswerLabel, suggestCoachPlan } from './coachVisit.js'
import { membershipPlans } from '../config/offerings.js'

describe('Visita guiada BAYONA', () => {
  it('orienta cada nivel al plan oficial correspondiente, sin inventar precios', () => {
    const expected = [['base','RAIZ'],['semanal','FUERZA'],['integral','RENDIMIENTO'],['privado','ELITE']]
    for (const [apoyo,id] of expected) {
      const result = suggestCoachPlan({ apoyo, tiempo:'3-4' })
      const official = membershipPlans.find(plan => plan.id === id)
      expect(result.plan).toBe(official)
      expect(result.plan.priceDisplay).toBe(official.priceDisplay)
      expect(result.reasons.length).toBeGreaterThan(0)
    }
  })
  it('no convierte información sanitaria en decisiones comerciales', () => {
    const direct = suggestCoachPlan({apoyo:'semanal',criterio:'informacion'})
    const conversation = suggestCoachPlan({apoyo:'semanal',criterio:'orientacion'})
    expect(direct.plan.id).toBe('FUERZA')
    expect(conversation.plan.id).toBe('FUERZA')
    expect(conversation.requiresConversation).toBe(true)
    expect(direct.requiresConversation).toBe(false)
  })
  it('declara siete etapas repartidas en rutas reales con controles reversibles', () => {
    expect(COACH_VISIT_STEPS).toHaveLength(8)
    expect(new Set(COACH_VISIT_STEPS.map(s=>s.path)).size).toBeGreaterThanOrEqual(6)
    expect(COACH_VISIT_STEPS.slice(0,-1).every(s=>s.options.length>=2)).toBe(true)
    expect(coachAnswerLabel('apoyo','semanal')).toMatch(/cada semana/)
    expect(COACH_VISIT_STEPS.map(s=>s.id)).not.toContain('diagnostico')
  })
})
