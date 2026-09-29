// Tests de liberacion de recursos y teardown de hooks del engine.
//
// Runner: Vitest + fast-check (jsdom). Cubre:
//   1) Property test PURO de `createDisposableRegistry` (Property 3): dispose
//      EXACTAMENTE una vez por recurso, idempotente, tolerante a valores sin
//      `dispose`/falsy (R22.5).
//   2) Teardown de `useDisposable` en un componente real: libera al desmontar (R22.5).
//   3) Teardown de `useLenis`: `destroy()` + `cancelAnimationFrame` al desmontar y
//      NO instanciar Lenis con `reducedMotion` (R19.4 / R19.3).
//
// No se usa JSX (fichero .js): los componentes de prueba se montan con
// `React.createElement` para no depender de la transformacion JSX en `.js`.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import React from 'react'
import { render } from '@testing-library/react'

import { createDisposableRegistry, useDisposable } from './useDisposable.js'
import { useLenis } from './useLenis.js'

// Mock de `lenis`: el constructor por defecto devuelve un fake con `raf` y
// `destroy` espiables. `vi.hoisted` expone las referencias a la factory de
// `vi.mock` (que Vitest eleva por encima de los imports).
const { LenisMock, lenisInstances } = vi.hoisted(() => {
  const lenisInstances = []
  const LenisMock = vi.fn(() => {
    const instance = { raf: vi.fn(), destroy: vi.fn() }
    lenisInstances.push(instance)
    return instance
  })
  return { LenisMock, lenisInstances }
})

vi.mock('lenis', () => ({ default: LenisMock }))

/** Componente sonda: registra un recurso en el registro del hook. */
function DisposableProbe({ resource }) {
  const register = useDisposable()
  register(resource)
  return null
}

/** Componente sonda: monta `useLenis` con la preferencia de movimiento dada. */
function LenisProbe({ reducedMotion }) {
  useLenis({ reducedMotion })
  return null
}

describe('useDisposable — Property-Based Tests', () => {
  // Validates: Requirements 22.5, 19.4
  it('Feature: premium-3d-experience, Property 3: Liberación de recursos sin fugas', () => {
    fc.assert(
      fc.property(
        // Secuencia arbitraria de recursos: liberables, sin `dispose`, y falsy.
        fc.array(fc.constantFrom('disposable', 'plain', 'null', 'undefined'), { maxLength: 40 }),
        (kinds) => {
          const registry = createDisposableRegistry()
          const disposables = []

          for (const kind of kinds) {
            if (kind === 'disposable') {
              const resource = { dispose: vi.fn() }
              disposables.push(resource)
              registry.register(resource)
            } else if (kind === 'plain') {
              registry.register({}) // sin `dispose`: debe ignorarse sin lanzar
            } else if (kind === 'null') {
              registry.register(null) // falsy: debe ignorarse sin lanzar
            } else {
              registry.register(undefined) // falsy: debe ignorarse sin lanzar
            }
          }

          // Liberar no lanza pese a recursos sin `dispose` o falsy.
          expect(() => registry.disposeAll()).not.toThrow()

          // Cada recurso liberable se destruye EXACTAMENTE una vez.
          for (const resource of disposables) {
            expect(resource.dispose).toHaveBeenCalledTimes(1)
          }

          // Idempotente: un segundo `disposeAll` no vuelve a liberar
          // (sin doble-dispose ni fugas).
          expect(() => registry.disposeAll()).not.toThrow()
          for (const resource of disposables) {
            expect(resource.dispose).toHaveBeenCalledTimes(1)
          }
        },
      ),
      { numRuns: 200 },
    )
  })
})

describe('useDisposable — teardown (jsdom/RTL, R22.5)', () => {
  it('libera el recurso registrado exactamente una vez al desmontar', () => {
    const resource = { dispose: vi.fn() }
    const { unmount } = render(React.createElement(DisposableProbe, { resource }))

    // Mientras el componente vive, el recurso no se ha liberado.
    expect(resource.dispose).not.toHaveBeenCalled()

    unmount()

    expect(resource.dispose).toHaveBeenCalledTimes(1)
  })
})

describe('useLenis — teardown (jsdom/RTL, R19.4)', () => {
  beforeEach(() => {
    LenisMock.mockClear()
    lenisInstances.length = 0
    // rAF/cancelAF controlados: el callback nunca se re-agenda (sin bucle real).
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('destruye la instancia y cancela el bucle rAF al desmontar', async () => {
    const { unmount } = render(React.createElement(LenisProbe, { reducedMotion: false }))

    // La carga es diferida (import dinámico): se espera a que se instancie.
    await vi.waitFor(() => expect(LenisMock).toHaveBeenCalledTimes(1))
    await vi.waitFor(() => expect(requestAnimationFrame).toHaveBeenCalledTimes(1))

    const lenis = lenisInstances[0]
    expect(lenis.destroy).not.toHaveBeenCalled()

    unmount()

    // Cleanup: destroy() una vez y cancelAnimationFrame una vez (R19.4).
    expect(lenis.destroy).toHaveBeenCalledTimes(1)
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1)
  })

  it('no instancia Lenis con reducedMotion: usa scroll nativo (R19.3)', async () => {
    const { unmount } = render(React.createElement(LenisProbe, { reducedMotion: true }))

    // Con movimiento reducido no se construye Lenis ni se arranca rAF.
    // Se espera un tick para dar margen a una posible carga diferida.
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(LenisMock).not.toHaveBeenCalled()
    expect(requestAnimationFrame).not.toHaveBeenCalled()

    // Sin puntero fino tampoco hay suavizado: fallback nativo.
    unmount()
    LenisMock.mockClear()
    lenisInstances.length = 0
    const { unmount: unmountCoarse } = render(
      React.createElement(function CoarseProbe() {
        useLenis({ reducedMotion: false, finePointer: false })
        return null
      }),
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(LenisMock).not.toHaveBeenCalled()
    expect(requestAnimationFrame).not.toHaveBeenCalled()

    // Desmontar es seguro (no hay instancia que destruir).
    expect(() => {
      unmountCoarse()
    }).not.toThrow()
  })
})
