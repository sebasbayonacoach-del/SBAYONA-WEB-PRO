// Tests del store de progreso de carga del engine — Fase 7B.
//
// Cubre el módulo que sustituyó a `useProgress()` de drei en el Loader del
// shell (hallazgo 7A-01). Contrato mínimo que el Loader consume:
// { progress, active, loaded, total } + suscripción + reset.
// Es lógica PURA sin React: testeable sin mocks de WebGL.

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getLoadingProgress,
  subscribeLoadingProgress,
  updateLoadingProgress,
  resetLoadingProgress,
} from '../engine/effects/loadingProgress.js'

describe('loadingProgress — store del shell (Fase 7B)', () => {
  beforeEach(() => {
    resetLoadingProgress()
  })

  it('estado inicial: sin cargas declaradas (total 0, inactive, progreso 0)', () => {
    expect(getLoadingProgress()).toEqual({
      active: false,
      progress: 0,
      loaded: 0,
      total: 0,
    })
  })

  it('el Loader resuelve su estado "listo" por su propio fallback mientras total === 0', () => {
    // Contrato R20.6: sin assets declarados, el store no bloquea al Loader.
    const s = getLoadingProgress()
    expect(s.total).toBe(0)
    expect(s.active).toBe(false)
  })

  it('update calcula progreso desde loaded/total cuando no se da explícito', () => {
    updateLoadingProgress({ total: 4, loaded: 1, active: true })
    const s = getLoadingProgress()
    expect(s.total).toBe(4)
    expect(s.loaded).toBe(1)
    expect(s.active).toBe(true)
    expect(s.progress).toBe(25)
  })

  it('el progreso se acota a [0, 100] ante valores imposibles', () => {
    updateLoadingProgress({ total: 2, loaded: 99, active: true })
    expect(getLoadingProgress().progress).toBe(100)
    resetLoadingProgress()
    updateLoadingProgress({ progress: -40 })
    expect(getLoadingProgress().progress).toBe(0)
  })

  it('los suscriptores reciben cada actualización y pueden dessuscribirse', () => {
    const seen = []
    const unsubscribe = subscribeLoadingProgress((s) => seen.push(s.progress))

    updateLoadingProgress({ total: 2, loaded: 1, active: true })
    updateLoadingProgress({ loaded: 2, active: false, progress: 100 })

    expect(seen).toEqual([50, 100])

    unsubscribe()
    updateLoadingProgress({ total: 1, loaded: 1 })
    // Tras dessuscribirse, el listener no vuelve a recibir notificaciones.
    expect(seen).toEqual([50, 100])
  })

  it('reset devuelve el store a su estado inicial y notifica', () => {
    updateLoadingProgress({ total: 9, loaded: 9, active: false, progress: 100 })
    resetLoadingProgress()
    expect(getLoadingProgress()).toEqual({
      active: false,
      progress: 0,
      loaded: 0,
      total: 0,
    })
  })

  it('no acepta NaN/Infinity sin romper el estado (fail-safe)', () => {
    updateLoadingProgress({ total: Number.NaN, loaded: Number.POSITIVE_INFINITY, active: true })
    const s = getLoadingProgress()
    // NaN/Infinity se ignoran: el estado previo se conserva (fail-safe).
    expect(Number.isFinite(s.total)).toBe(true)
    expect(Number.isFinite(s.loaded)).toBe(true)
  })

  // --- Fase 8B · H-02: los dos defectos documentados en la auditoría suprema ---

  it('H-02a: un listener que lanza NO interrumpe la notificación del resto ni propaga el error', () => {
    const consoleErrors = []
    const originalError = console.error
    console.error = (...args) => consoleErrors.push(args)
    try {
      let secondReceived = null
      const un1 = subscribeLoadingProgress(() => {
        throw new Error('boom del observador')
      })
      const un2 = subscribeLoadingProgress((s) => {
        secondReceived = s
      })

      expect(() => updateLoadingProgress({ total: 2, loaded: 1, active: true })).not.toThrow()

      // El segundo listener SÍ recibió el estado pese al fallo del primero.
      expect(secondReceived).toEqual(getLoadingProgress())
      // El error del observador quedó registrado, no silenciado.
      expect(consoleErrors.length).toBe(1)
      expect(String(consoleErrors[0][0])).toContain('loadingProgress')

      un1()
      un2()
    } finally {
      console.error = originalError
    }
  })

  it('H-02b: loaded nunca excede total (contrato de "assets restantes" coherente)', () => {
    updateLoadingProgress({ total: 2, loaded: 99, active: true })
    expect(getLoadingProgress().loaded).toBe(2)
    expect(getLoadingProgress().progress).toBe(100)

    // Caso límite: loaded llega ANTES que total (notificaciones fuera de orden).
    // Con total=0 (sin cargas declaradas), un loaded suelto se acota a 0:
    // no puede haber más cargas completadas que assets declarados.
    resetLoadingProgress()
    updateLoadingProgress({ loaded: 5, active: true })
    expect(getLoadingProgress().loaded).toBe(0)
    // Al llegar el total, loaded queda acotado por él.
    updateLoadingProgress({ total: 3 })
    const s = getLoadingProgress()
    expect(s.loaded).toBe(0) // el 5 anterior ya fue descartado por el clamp
    expect(s.total).toBe(3)
    expect(s.progress).toBe(0)
  })
})
