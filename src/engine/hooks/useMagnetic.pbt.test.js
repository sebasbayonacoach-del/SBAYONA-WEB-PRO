// Property-Based Test del Motion_System: retorno magnetico a reposo (R15.2).
//
// Verifica la funcion PURA `magneticOffset` (sin React ni DOM), correspondiente
// a la Property 5 del diseno:
//   - Fuera del radio (d >= radius) o exactamente en el centro (d === 0) =>
//     reposo exacto {x:0, y:0} (R15.2).
//   - Dentro del radio (0 < d < radius) => offset con magnitud ACOTADA por
//     strength*radius/4 y COLINEAL, en el mismo sentido, con el vector
//     puntero->centro (producto punto >= 0).
//
// Runner: Vitest + fast-check (200 iteraciones). Al ser logica pura no se
// necesita jsdom.

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

import { magneticOffset } from './useMagnetic.js'

describe('useMagnetic/magneticOffset — Property-Based Tests', () => {
  // Validates: Requirements 15.2
  it('Feature: premium-3d-experience, Property 5: Retorno magnético a reposo', () => {
    fc.assert(
      fc.property(
        // dx, dy finitos con rango amplio (incluye valores > radio) para
        // ejercitar tanto el reposo como la atraccion interna.
        fc.double({ min: -5000, max: 5000, noNaN: true }),
        fc.double({ min: -5000, max: 5000, noNaN: true }),
        // Radio de influencia positivo.
        fc.double({ min: 1, max: 600, noNaN: true }),
        // Intensidad tipica 0..1.
        fc.double({ min: 0, max: 1, noNaN: true }),
        (dx, dy, radius, strength) => {
          const o = magneticOffset(dx, dy, radius, strength)
          const d = Math.hypot(dx, dy)

          if (d >= radius || d === 0) {
            // Reposo exacto fuera del radio o justo en el centro (R15.2).
            expect(o).toEqual({ x: 0, y: 0 })
            return
          }

          // Dentro del radio (0 < d < radius):
          // 1) Magnitud acotada por strength*radius/4 (maximo teorico a d=radius/2).
          const magnitude = Math.hypot(o.x, o.y)
          expect(magnitude).toBeLessThanOrEqual((strength * radius) / 4 + 1e-6)

          // 2) Colineal y en el MISMO sentido que (dx, dy): producto punto >= 0.
          const dot = o.x * dx + o.y * dy
          expect(dot).toBeGreaterThanOrEqual(0)
        },
      ),
      { numRuns: 200 },
    )
  })
})
