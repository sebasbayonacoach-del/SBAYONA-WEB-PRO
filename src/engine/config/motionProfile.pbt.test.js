// Property-Based Tests del contrato de movimiento reducido (motionProfile.js).
//
// Runner: Vitest + fast-check. La logica es PURA (sin DOM), asi que no requiere
// jsdom. Property 1 del design.md verifica que el modo de movimiento reducido
// desactiva TODO el movimiento en la representacion central del contrato.

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

import { resolveMotionProfile } from './motionProfile.js'
import { dprLimit } from '../providers/capabilities.js'

// Todas las banderas de movimiento del perfil.
const MOTION_FLAGS = [
  'sceneAnimated',
  'particlesAnimated',
  'postProcessingAnimated',
  'parallax',
  'scrollInertia',
  'pageTransitionAnimated',
  'textRevealAnimated',
  'customCursor',
  'magnetic',
  'tilt',
]

/**
 * Generador inteligente de `Capabilities` bien formadas: `mode` restringido a
 * los dos valores validos, flags booleanas y `dprLimit` derivado del modo con
 * la funcion pura, de modo que el objeto respeta las invariantes del typedef.
 */
const capabilitiesArb = fc
  .record({
    mode: fc.constantFrom('desktop', 'mobile'),
    reducedMotion: fc.boolean(),
    canHover: fc.boolean(),
    finePointer: fc.boolean(),
  })
  .map((caps) => ({ ...caps, dprLimit: dprLimit(caps.mode) }))

// Incluye `undefined` en el espacio de entrada para cubrir el fallback seguro.
const capsArb = fc.oneof(fc.constant(undefined), capabilitiesArb)

describe('motionProfile — Property-Based Tests', () => {
  // Validates: Requirements 23.2, 6.7, 14.4, 15.4, 18.3, 19.3
  it('Feature: premium-3d-experience, Property 1: Reduced_Motion desactiva movimiento', () => {
    fc.assert(
      fc.property(capsArb, (caps) => {
        const p = resolveMotionProfile(caps)

        // Nunca lanza y siempre devuelve un objeto con banderas booleanas.
        expect(p).not.toBeNull()
        expect(typeof p).toBe('object')
        for (const flag of MOTION_FLAGS) {
          expect(typeof p[flag]).toBe('boolean')
        }

        // Reduced_Motion => alternativa estatica: TODO el movimiento desactivado.
        if (caps?.reducedMotion === true) {
          for (const flag of MOTION_FLAGS) {
            expect(p[flag]).toBe(false)
          }
        }
      }),
      { numRuns: 200 },
    )
  })
})
