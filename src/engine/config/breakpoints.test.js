// Tests de los breakpoints del Design System (Fase 3).

import { describe, expect, it } from 'vitest'

import { BREAKPOINTS, maxWidth, minWidth } from './breakpoints.js'

describe('breakpoints', () => {
  it('la escalera es estrictamente creciente', () => {
    const values = Object.values(BREAKPOINTS)
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('conserva los puntos de corte medidos en la cascada', () => {
    expect(BREAKPOINTS).toMatchObject({
      xs: 520,
      sm: 600,
      md: 800,
      lg: 900,
      nav: 950,
      xl: 1180,
      xxl: 1440,
    })
  })

  it('genera media queries validas', () => {
    expect(minWidth(BREAKPOINTS.lg)).toBe('(min-width: 900px)')
    expect(maxWidth(BREAKPOINTS.sm)).toBe('(max-width: 600px)')
  })

  it('es un objeto congelado', () => {
    expect(Object.isFrozen(BREAKPOINTS)).toBe(true)
  })
})
