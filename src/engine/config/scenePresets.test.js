// Tests de los presets del sistema 3D (Design System, Fase 3).

import { describe, expect, it } from 'vitest'

import { theme } from './theme.js'
import {
  cameraPresets,
  depthLayers,
  materialPresets,
  resolveCameraPreset,
  resolveMaterialPreset,
  sceneMotion,
} from './scenePresets.js'

const PALETTE = new Set(Object.values(theme.color))

function isFiniteTriple(value) {
  return Array.isArray(value) && value.length === 3 && value.every(Number.isFinite)
}

describe('scenePresets — camara', () => {
  it('todos los presets tienen posicion/mira finitos y fov razonable', () => {
    for (const [name, preset] of Object.entries(cameraPresets)) {
      expect(isFiniteTriple(preset.position), `${name}.position`).toBe(true)
      expect(isFiniteTriple(preset.lookAt), `${name}.lookAt`).toBe(true)
      expect(preset.fov, `${name}.fov`).toBeGreaterThanOrEqual(20)
      expect(preset.fov, `${name}.fov`).toBeLessThanOrEqual(90)
    }
  })

  it('resolveCameraPreset degrada a hero ante nombre desconocido', () => {
    expect(resolveCameraPreset('no-existe')).toEqual(cameraPresets.hero)
    expect(resolveCameraPreset(undefined)).toEqual(cameraPresets.hero)
    expect(resolveCameraPreset('portrait')).toEqual(cameraPresets.portrait)
  })
})

describe('scenePresets — materiales', () => {
  it('todos los colores salen de la paleta de marca (sin colores inventados)', () => {
    for (const [name, preset] of Object.entries(materialPresets)) {
      expect(PALETTE.has(preset.color), `${name}.color`).toBe(true)
      if (preset.emissive) {
        expect(PALETTE.has(preset.emissive), `${name}.emissive`).toBe(true)
      }
      expect(preset.roughness, `${name}.roughness`).toBeGreaterThanOrEqual(0)
      expect(preset.roughness, `${name}.roughness`).toBeLessThanOrEqual(1)
      expect(preset.metalness, `${name}.metalness`).toBeGreaterThanOrEqual(0)
      expect(preset.metalness, `${name}.metalness`).toBeLessThanOrEqual(1)
    }
  })

  it('resolveMaterialPreset degrada a matte ante nombre desconocido', () => {
    expect(resolveMaterialPreset('no-existe')).toEqual(materialPresets.matte)
    expect(resolveMaterialPreset('accent')).toEqual(materialPresets.accent)
  })
})

describe('scenePresets — profundidad y movimiento', () => {
  it('las capas de profundidad estan ordenadas fondo → frente', () => {
    expect(depthLayers.background).toBeLessThan(depthLayers.midground)
    expect(depthLayers.midground).toBeLessThan(depthLayers.foreground)
  })

  it('el movimiento contenido: activo siempre mayor que reposo, sin excesos', () => {
    expect(sceneMotion.driftSpeed.active).toBeGreaterThan(sceneMotion.driftSpeed.idle)
    expect(sceneMotion.floatAmplitude.active).toBeGreaterThan(
      sceneMotion.floatAmplitude.idle,
    )
    expect(sceneMotion.driftSpeed.active).toBeLessThanOrEqual(0.2)
    expect(sceneMotion.floatAmplitude.active).toBeLessThanOrEqual(0.5)
    expect(sceneMotion.parallaxFactor.background).toBeLessThan(
      sceneMotion.parallaxFactor.foreground,
    )
  })

  it('los presets son objetos congelados', () => {
    expect(Object.isFrozen(cameraPresets)).toBe(true)
    expect(Object.isFrozen(materialPresets)).toBe(true)
    expect(Object.isFrozen(depthLayers)).toBe(true)
    expect(Object.isFrozen(sceneMotion)).toBe(true)
  })
})
