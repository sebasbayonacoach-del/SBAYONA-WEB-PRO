import { describe, expect, it } from 'vitest'
import { evidenceRegistry } from './evidenceRegistry.js'

// Validates: Requirements 2.9, 2.10, 6.9, 6.10
describe('evidenceRegistry', () => {
  it('permanece vacío, inmutable y sin placeholders hasta disponer de evidencia aprobada', () => {
    expect(evidenceRegistry).toEqual({})
    expect(Object.isFrozen(evidenceRegistry)).toBe(true)
    expect(Object.keys(evidenceRegistry)).toHaveLength(0)
    expect(JSON.stringify(evidenceRegistry)).not.toMatch(/placeholder|testimonio|ejemplo|pendiente/i)
  })
})
