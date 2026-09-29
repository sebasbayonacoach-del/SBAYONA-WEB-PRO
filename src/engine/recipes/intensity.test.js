// Tests de intensidad de movimiento (Fase 5).

import { describe, expect, it } from 'vitest'

import {
  DEFAULT_INTENSITY,
  MOTION_INTENSITIES,
  resolveIntensity,
  scaleDistance,
  scaleDuration,
} from './intensity.js'

describe('MOTION_INTENSITIES — solo tres intensidades', () => {
  it('cubre exactamente quiet/balanced/immersive', () => {
    expect(Object.keys(MOTION_INTENSITIES)).toEqual(['quiet', 'balanced', 'immersive'])
  })

  it('la amplitud, velocidad y simultaneidad crecen con la intensidad', () => {
    const { quiet, balanced, immersive } = MOTION_INTENSITIES
    expect(quiet.amplitude).toBeLessThan(balanced.amplitude)
    expect(balanced.amplitude).toBeLessThan(immersive.amplitude)
    expect(quiet.speed).toBeLessThan(balanced.speed)
    expect(balanced.speed).toBeLessThan(immersive.speed)
    expect(quiet.simultaneity).toBeLessThan(balanced.simultaneity)
    expect(balanced.simultaneity).toBeLessThan(immersive.simultaneity)
  })

  it('la simultaneidad maxima queda acotada (nada de todo a la vez)', () => {
    for (const preset of Object.values(MOTION_INTENSITIES)) {
      expect(preset.simultaneity).toBeLessThanOrEqual(3)
      expect(preset.simultaneity).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('resolveIntensity', () => {
  it('resuelve el preset pedido y degrada a balanced', () => {
    expect(resolveIntensity('quiet').id).toBe('quiet')
    expect(resolveIntensity('immersive').id).toBe('immersive')
    expect(resolveIntensity('salvaje').id).toBe(DEFAULT_INTENSITY)
    expect(resolveIntensity(undefined).id).toBe(DEFAULT_INTENSITY)
  })
})

describe('scaleDistance / scaleDuration', () => {
  it('escala distancias segun la amplitud', () => {
    expect(scaleDistance(48, 'quiet')).toBe(24)
    expect(scaleDistance(48, 'balanced')).toBe(48)
    expect(scaleDistance(48, 'immersive')).toBeCloseTo(67.2)
    expect(scaleDistance(Number.NaN, 'quiet')).toBe(0)
  })

  it('escala duraciones segun la velocidad y acota a un rango humano', () => {
    expect(scaleDuration(0.4, 'balanced')).toBe(0.4)
    expect(scaleDuration(0.4, 'quiet')).toBeCloseTo(0.5)
    expect(scaleDuration(0.4, 'immersive')).toBeCloseTo(0.4 / 1.15)
    // Cotas: ni parpadeo ni eternidad.
    expect(scaleDuration(0.001, 'immersive')).toBeGreaterThanOrEqual(0.1)
    expect(scaleDuration(100, 'quiet')).toBeLessThanOrEqual(3)
    expect(scaleDuration(-5, 'quiet')).toBe(0.4)
    expect(scaleDuration(Number.NaN, 'quiet')).toBe(0.4)
  })
})
