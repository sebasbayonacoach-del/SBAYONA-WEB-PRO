// Tests del presupuesto de movimiento por zona (Fase 5).

import { describe, expect, it } from 'vitest'

import { checkBudget, MOTION_BUDGETS, resolveBudget } from './motionBudget.js'

describe('MOTION_BUDGETS — zonas', () => {
  it('cubre hero/body/supporting/cta/background', () => {
    expect(Object.keys(MOTION_BUDGETS).sort()).toEqual(
      ['background', 'body', 'cta', 'hero', 'supporting'].sort(),
    )
  })

  it('el hero es la unica zona de peso maximo y el fondo la minima', () => {
    expect(MOTION_BUDGETS.hero.weight).toBe(3)
    expect(MOTION_BUDGETS.background.weight).toBe(0)
    for (const budget of Object.values(MOTION_BUDGETS)) {
      expect(budget.weight).toBeGreaterThanOrEqual(0)
      expect(budget.weight).toBeLessThanOrEqual(3)
    }
  })

  it('toda zona declara nota y recetas conocidas', () => {
    for (const budget of Object.values(MOTION_BUDGETS)) {
      expect(budget.note.length).toBeGreaterThan(10)
      expect(Array.isArray(budget.recipes)).toBe(true)
    }
  })
})

describe('resolveBudget', () => {
  it('degrada a supporting ante zonas desconocidas (conservador)', () => {
    expect(resolveBudget('hero').id).toBe('hero')
    expect(resolveBudget('inventada').id).toBe('supporting')
    expect(resolveBudget(undefined).id).toBe('supporting')
  })
})

describe('checkBudget', () => {
  it('una pagina estandar pasa el presupuesto balanced', () => {
    const result = checkBudget(['hero', 'body', 'supporting', 'cta'], 'balanced')
    expect(result.ok).toBe(true)
    expect(result.reasons).toEqual([])
    expect(result.totalWeight).toBe(8)
  })

  it('rechaza mas de una zona de peso maximo', () => {
    const result = checkBudget(['hero', 'hero', 'body'], 'immersive')
    expect(result.ok).toBe(false)
    expect(result.reasons.join(' ')).toMatch(/peso 3/)
  })

  it('el limite depende de la intensidad', () => {
    const zones = ['hero', 'body', 'body', 'cta']
    expect(checkBudget(zones, 'quiet').ok).toBe(false) // 3+2+2+2=9 > 6
    expect(checkBudget(zones, 'immersive').ok).toBe(true) // 9 <= 10
  })

  it('zonas vacias o invalidas no rompen la comprobacion', () => {
    expect(checkBudget([], 'balanced')).toMatchObject({ ok: true, totalWeight: 0 })
    expect(checkBudget(undefined, 'balanced')).toMatchObject({ ok: true, totalWeight: 0 })
  })
})
