// Property-Based Tests de la logica pura de resolucion de escena (sceneConfig.js).
//
// Runner: Vitest + fast-check (min. 100 iteraciones; aqui 200). Cada propiedad
// del design.md se implementa con un unico test PBT etiquetado
// `Feature: premium-3d-experience, Property {n}: {texto}`.

import { describe, it, expect, vi } from 'vitest'
import fc from 'fast-check'

import { clampDpr, resolveSceneConfig } from './sceneConfig.js'
import { sceneRegistry } from './sceneRegistry.js'

/**
 * DPR arbitrario: cubre floats de todo el rango (incl. NaN y +/-Infinity de
 * `fc.double()`), un rango finito positivo tipico y una bateria explicita de
 * casos limite (<=0, valores alrededor de los DPR_Limit 1.5 y 2).
 */
const dprArb = fc.oneof(
  fc.double(),
  fc.double({ min: 0, max: 8, noNaN: true }),
  fc.constantFrom(
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    0,
    -0,
    -1,
    -0.5,
    0.0001,
    0.5,
    1,
    1.5,
    1.9999,
    2,
    2.0001,
    3,
    100,
  ),
)

/**
 * Scene_Config con variante valida ('signature') y `params` cuyos contadores son
 * enteros >= 0 arbitrarios; tanto `params` como cada contador pueden omitirse
 * (para ejercitar la aplicacion de defaults del registro).
 */
const configArb = fc.record(
  {
    variant: fc.constant('signature'),
    params: fc.record(
      {
        particleCount: fc.nat(),
        instanceCount: fc.nat(),
      },
      { requiredKeys: [] },
    ),
  },
  { requiredKeys: ['variant'] },
)

/**
 * Scene_Config para verificar la aplicacion de defaults (Property 9): variante
 * valida y `params` como record PARCIAL (`requiredKeys: []`) donde cada clave
 * puede omitirse, forzando que el resolver rellene con el default del registro.
 * `bloomIntensity`/`glowIntensity` son doubles finitos (sin NaN) y `dissolve`
 * queda normalizado en 0..1.
 */
const partialParamsConfigArb = fc.record({
  variant: fc.constant('signature'),
  params: fc.record(
    {
      particleCount: fc.nat(),
      instanceCount: fc.nat(),
      bloomIntensity: fc.double({ noNaN: true }),
      glowIntensity: fc.double({ noNaN: true }),
      dissolve: fc.double({ min: 0, max: 1, noNaN: true }),
    },
    { requiredKeys: [] },
  ),
})

/**
 * Toggle por ruta (Property 10): `true`, `false` o ausente (`undefined`), para
 * comprobar que la omision equivale a `true`.
 */
const toggleArb = fc.option(fc.boolean(), { nil: undefined })

/**
 * Scene_Config con los tres toggles (`particles`/`postProcessing`/`parallax`)
 * generados de forma INDEPENDIENTE.
 */
const toggleConfigArb = fc.record({
  variant: fc.constant('signature'),
  particles: toggleArb,
  postProcessing: toggleArb,
  parallax: toggleArb,
})

describe('sceneConfig — Property-Based Tests', () => {
  // Validates: Requirements 22.3
  it('Feature: premium-3d-experience, Property 2: DPR acotado por DPR_Limit', () => {
    fc.assert(
      fc.property(dprArb, fc.constantFrom(1.5, 2), (dpr, limit) => {
        const result = clampDpr(dpr, limit)
        // El DPR efectivo nunca supera el DPR_Limit, sea cual sea la entrada.
        expect(result).toBeLessThanOrEqual(limit)
        // Para un DPR finito y positivo el resultado es exactamente min(dpr, limit).
        if (Number.isFinite(dpr) && dpr > 0) {
          expect(result).toBe(Math.min(dpr, limit))
        }
      }),
      { numRuns: 200 },
    )
  })

  // Validates: Requirements 4.5, 5.3, 6.6, 22.4
  it('Feature: premium-3d-experience, Property 6: Carga móvil menor o igual que desktop', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        const desktop = resolveSceneConfig(config, { mode: 'desktop' })
        const mobile = resolveSceneConfig(config, { mode: 'mobile' })

        expect(desktop).not.toBeNull()
        expect(mobile).not.toBeNull()

        // Carga geometrica: Mobile <= Desktop en particulas e instancias.
        expect(mobile.params.particleCount).toBeLessThanOrEqual(desktop.params.particleCount)
        expect(mobile.params.instanceCount).toBeLessThanOrEqual(desktop.params.instanceCount)

        // Carga de post-proceso: Mobile <= Desktop (DoF y aberracion cromatica).
        expect(Number(mobile.params.dof)).toBeLessThanOrEqual(Number(desktop.params.dof))
        expect(Number(mobile.params.chromaticAberration)).toBeLessThanOrEqual(
          Number(desktop.params.chromaticAberration),
        )
      }),
      { numRuns: 200 },
    )
  })

  // Validates: Requirements 25.5
  it('Feature: premium-3d-experience, Property 8: Variante inexistente falla de forma segura', () => {
    fc.assert(
      fc.property(fc.string(), (variant) => {
        // Solo variantes desconocidas: se filtran 'signature' (propiedad propia)
        // y las claves heredadas de Object.prototype como 'toString'.
        fc.pre(!(variant in sceneRegistry))

        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        try {
          // No debe lanzar: degrada seguro devolviendo null y registrando el error.
          const result = resolveSceneConfig({ variant })
          expect(result).toBeNull()
          expect(spy).toHaveBeenCalled()
        } finally {
          spy.mockRestore()
        }
      }),
      { numRuns: 200 },
    )
  })

  // Validates: Requirements 25.3
  it('Feature: premium-3d-experience, Property 9: Defaults al omitir parámetros', () => {
    const defaults = sceneRegistry.signature.defaults
    fc.assert(
      fc.property(partialParamsConfigArb, (config) => {
        // Desktop evita la degradacion movil, aislando la aplicacion de defaults.
        const resolved = resolveSceneConfig(config, { mode: 'desktop' })
        expect(resolved).not.toBeNull()

        const overrides = config.params ?? {}
        for (const key of Object.keys(defaults)) {
          if (Object.prototype.hasOwnProperty.call(overrides, key)) {
            // Parametro presente: el valor resuelto refleja el override.
            expect(resolved.params[key]).toEqual(overrides[key])
          } else {
            // Parametro omitido: se rellena con el default del registro
            // (igualdad profunda para `cameraPosition`, que es un array).
            expect(resolved.params[key]).toEqual(defaults[key])
          }
        }
      }),
      { numRuns: 200 },
    )
  })

  // Validates: Requirements 25.4
  it('Feature: premium-3d-experience, Property 10: Toggles independientes por ruta', () => {
    fc.assert(
      fc.property(toggleConfigArb, (config) => {
        const resolved = resolveSceneConfig(config, { mode: 'desktop' })
        expect(resolved).not.toBeNull()

        // Cada bandera se refleja exacta e independientemente; `undefined` ⇒ true.
        expect(resolved.particles).toBe(config.particles !== false)
        expect(resolved.postProcessing).toBe(config.postProcessing !== false)
        expect(resolved.parallax).toBe(config.parallax !== false)
      }),
      { numRuns: 200 },
    )
  })
})
