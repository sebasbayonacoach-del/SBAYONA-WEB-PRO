// Tests unitarios de la plataforma de iluminacion (Requirements 3.1, 3.2, 3.4, 1.2).
//
// Runner: Vitest (jsdom). Se verifica la funcion PURA `lightingPlan(caps)` por
// modo (numero/tipos de luz y sombras) y una guarda de regresion sobre
// `SignatureGeometry.jsx`: la geometria insignia debe ser un icosaedro
// subdividido y NO un nudo toroidal procedural (R1.2).

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { lightingPlan } from './LightingRig.jsx'

describe('lightingPlan — Desktop (Requirements 3.1, 3.2, 3.3)', () => {
  const plan = lightingPlan({ mode: 'desktop' })

  it('monta al menos 3 luces', () => {
    expect(plan.lights.length).toBeGreaterThanOrEqual(3)
  })

  it('diferencia al menos 3 tipos de luz (ambient, spot, point)', () => {
    const types = new Set(plan.lights.map((light) => light.type))
    expect(types.has('ambient')).toBe(true)
    expect(types.has('spot')).toBe(true)
    expect(types.has('point')).toBe(true)
    expect(types.size).toBeGreaterThanOrEqual(3)
  })

  it('activa las sombras dinamicas (R3.2)', () => {
    expect(plan.shadows).toBe(true)
  })

  it('la luz focal (spot) proyecta sombras', () => {
    const spot = plan.lights.find((light) => light.type === 'spot')
    expect(spot).toBeDefined()
    expect(spot.castShadow).toBe(true)
  })
})

describe('lightingPlan — Mobile (Requirement 3.4)', () => {
  const mobile = lightingPlan({ mode: 'mobile' })
  const desktop = lightingPlan({ mode: 'desktop' })

  it('desactiva las sombras', () => {
    expect(mobile.shadows).toBe(false)
  })

  it('ninguna luz proyecta sombras', () => {
    expect(mobile.lights.some((light) => light.castShadow === true)).toBe(false)
  })

  it('usa menos luces que Desktop', () => {
    expect(mobile.lights.length).toBeLessThan(desktop.lights.length)
  })
})

describe('SignatureGeometry — geometria organica, no nudo toroidal (Requirement 1.2)', () => {
  // Se lee el fuente en crudo (no se importa) para inspeccionar que primitiva
  // usa la geometria insignia sin ejecutar React/Three. Se resuelve desde la
  // raiz del proyecto (cwd del runner de tests) por portabilidad.
  const source = readFileSync(
    resolve(process.cwd(), 'src/engine/scene/SignatureGeometry.jsx'),
    'utf8',
  )

  it('no contiene "torusKnot" (case-insensitive)', () => {
    expect(source.toLowerCase()).not.toContain('torusknot')
  })

  it('contiene "icosahedronGeometry"', () => {
    expect(source).toContain('icosahedronGeometry')
  })
})
