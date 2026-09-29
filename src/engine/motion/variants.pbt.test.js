// Property-Based Test del Motion_System: las variantes de Framer Motion solo
// usan tiempos declarados en Motion_Tokens (R10.4).
//
// Runner: Vitest + fast-check (min. 100 iteraciones). La logica es pura, por lo
// que no se necesita jsdom.

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

import { motionTokens } from '../config/motionTokens.js'
import { revealUp, stagger, hoverScale, tap, collectTimings } from './variants.js'

// Conjuntos validos: unica fuente de verdad = Motion_Tokens.
const DURATIONS = Object.values(motionTokens.duration)
const EASES = Object.values(motionTokens.ease)

describe('variants — Property-Based Tests', () => {
  // Validates: Requirements 10.4
  it('Feature: premium-3d-experience, Property 7: Variantes derivadas de Motion_Tokens', () => {
    fc.assert(
      fc.property(fc.constantFrom(...DURATIONS), (staggerDelay) => {
        // Conjunto de variantes bajo prueba; el delay del stagger se elige de
        // entre las duraciones validas de Motion_Tokens.
        const variants = [revealUp, hoverScale, tap, stagger(staggerDelay)]

        for (const variant of variants) {
          const { durations, eases } = collectTimings(variant)

          // Toda duracion (incluido staggerChildren) pertenece a Motion_Tokens.
          for (const duration of durations) {
            expect(DURATIONS).toContain(duration)
          }

          // Todo easing es (deep-equal) miembro de Motion_Tokens.
          for (const ease of eases) {
            expect(EASES).toContainEqual(ease)
          }
        }
      }),
      { numRuns: 200 },
    )
  })
})
