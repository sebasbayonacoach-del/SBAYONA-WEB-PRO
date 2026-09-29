// Tests del handoff scroll -> 3D (Fase 5; prepara la Fase 7 sin escenas).

import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createHandoffSnapshot, readViewport, useScrollHandoff } from './scrollHandoff.js'

describe('createHandoffSnapshot — contrato puro para escenas', () => {
  it('normaliza todos los campos del contrato', () => {
    const snapshot = createHandoffSnapshot({
      progress: 0.42,
      velocity: 12.5,
      direction: 1,
      viewport: { width: 1440, height: 900 },
      reducedMotion: false,
      mode: 'desktop',
      dprLimit: 2,
    })

    expect(snapshot).toEqual({
      progress: 0.42,
      velocity: 12.5,
      direction: 1,
      viewport: { width: 1440, height: 900 },
      reducedMotion: false,
      mode: 'desktop',
      dprLimit: 2,
    })
  })

  it('acota el progreso a [0, 1] y normaliza la direccion a -1|0|1', () => {
    expect(createHandoffSnapshot({ progress: 1.7 }).progress).toBe(1)
    expect(createHandoffSnapshot({ progress: -3 }).progress).toBe(0)
    expect(createHandoffSnapshot({ progress: Number.NaN }).progress).toBe(0)
    expect(createHandoffSnapshot({ direction: 37 }).direction).toBe(1)
    expect(createHandoffSnapshot({ direction: -8 }).direction).toBe(-1)
    expect(createHandoffSnapshot({ direction: Number.NaN }).direction).toBe(0)
  })

  it('degrada a estado seguro con entrada ausente o corrupta', () => {
    const snapshot = createHandoffSnapshot()

    expect(snapshot.progress).toBe(0)
    expect(snapshot.velocity).toBe(0)
    expect(snapshot.direction).toBe(0)
    expect(snapshot.viewport).toEqual({ width: 0, height: 0 })
    // Accesibilidad primero: sin datos, se asume movimiento reducido.
    expect(snapshot.reducedMotion).toBe(true)
    expect(snapshot.mode).toBe('mobile')
    expect(snapshot.dprLimit).toBe(1.5)
  })

  it('sanea viewport y velocidad no finitos sin lanzar', () => {
    const snapshot = createHandoffSnapshot({
      velocity: Number.POSITIVE_INFINITY,
      viewport: { width: -50, height: Number.NaN },
      dprLimit: 'no',
    })

    expect(snapshot.velocity).toBe(0)
    expect(snapshot.viewport).toEqual({ width: 0, height: 0 })
    expect(snapshot.dprLimit).toBe(1.5)
  })

  it('el snapshot es inmutable', () => {
    const snapshot = createHandoffSnapshot({ progress: 0.5 })
    expect(() => {
      snapshot.progress = 0.9
    }).toThrow()
  })
})

describe('readViewport', () => {
  it('devuelve el tamano de la ventana (jsdom provee dimensiones)', () => {
    const viewport = readViewport()
    expect(viewport.width).toBeGreaterThanOrEqual(0)
    expect(viewport.height).toBeGreaterThanOrEqual(0)
  })
})

describe('useScrollHandoff', () => {
  it('fuera del provider degrada a snapshot seguro sin romper', () => {
    const { result } = renderHook(() => useScrollHandoff())

    expect(result.current.progress).toBeNull()
    expect(result.current.velocity).toBeNull()
    expect(result.current.direction).toBeNull()

    const snapshot = result.current.snapshot()
    expect(snapshot.progress).toBe(0)
    expect(snapshot.velocity).toBe(0)
    expect(snapshot.direction).toBe(0)
    expect(snapshot.mode).toBe('mobile')
  })

  it('expone las capacidades vivas y el lector de viewport', () => {
    const { result } = renderHook(() => useScrollHandoff())

    expect(result.current.capabilities).toMatchObject({
      mode: expect.any(String),
      reducedMotion: expect.any(Boolean),
      dprLimit: expect.any(Number),
    })
    expect(typeof result.current.readViewport).toBe('function')
    expect(typeof result.current.snapshot).toBe('function')
  })
})
