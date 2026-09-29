// Property-Based Tests de la logica pura del Capability_Manager (capabilities.js).
//
// Runner: Vitest + fast-check (jsdom no es necesario aqui: la logica es pura).
// Cada propiedad del design.md se implementa con un unico test PBT (min. 100
// iteraciones) etiquetado `Feature: premium-3d-experience, Property {n}: {texto}`.

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

import { pointerEffectsEnabled, dprLimit } from './capabilities.js'

/**
 * Generador inteligente de `Capabilities` bien formadas: `mode` se restringe a
 * los dos valores validos y `dprLimit` se deriva del modo con la funcion pura,
 * de modo que el objeto generado respeta las invariantes del typedef.
 */
const capabilitiesArb = fc
  .record({
    mode: fc.constantFrom('desktop', 'mobile'),
    reducedMotion: fc.boolean(),
    canHover: fc.boolean(),
    finePointer: fc.boolean(),
  })
  .map((caps) => ({ ...caps, dprLimit: dprLimit(caps.mode) }))

describe('capabilities — Property-Based Tests', () => {
  // Validates: Requirements 23.4, 8.4, 14.3
  it('Feature: premium-3d-experience, Property 4: Cursor y hover solo en Desktop', () => {
    fc.assert(
      fc.property(capabilitiesArb, (caps) => {
        // Custom_Cursor + seguimiento de puntero (tilt/hover 3D) se activan SII
        // el modo es Desktop y NO hay movimiento reducido; cualquier otro caso
        // los mantiene inactivos.
        const expected = caps.mode === 'desktop' && caps.reducedMotion === false
        expect(pointerEffectsEnabled(caps)).toBe(expected)
      }),
      { numRuns: 200 },
    )
  })
})
