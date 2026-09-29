// Unit test (RTL + jsdom) del CapabilityProvider.
//
// Verifica que un cambio EN SESION de `prefers-reduced-motion: reduce` se
// propaga a los consumidores de `useCapabilities` sin recargar la pagina (R23.5).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'

import { CapabilityProvider } from './CapabilityProvider.jsx'
import { useCapabilities } from '../hooks/useCapabilities.js'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Fabrica un `matchMedia` controlable. Cada query comparte un `store` con su
 * estado `matches` y sus listeners, de modo que al invocar `fireChange` se
 * actualiza el valor y se notifica a los suscriptores (evento `change`).
 */
function createMatchMedia(initial = {}) {
  const stores = new Map()

  const getStore = (query) => {
    if (!stores.has(query)) {
      stores.set(query, { matches: Boolean(initial[query]), listeners: new Set() })
    }
    return stores.get(query)
  }

  const matchMedia = vi.fn((query) => {
    const store = getStore(query)
    return {
      media: query,
      get matches() {
        return store.matches
      },
      addEventListener: (type, cb) => {
        if (type === 'change') store.listeners.add(cb)
      },
      removeEventListener: (type, cb) => {
        if (type === 'change') store.listeners.delete(cb)
      },
      // Fallback legacy (Safari <14), tambien soportado por el provider.
      addListener: (cb) => store.listeners.add(cb),
      removeListener: (cb) => store.listeners.delete(cb),
      dispatchEvent: () => true,
    }
  })

  const fireChange = (query, matches) => {
    const store = getStore(query)
    store.matches = matches
    store.listeners.forEach((cb) => cb({ matches, media: query }))
  }

  return { matchMedia, fireChange }
}

/** Sonda que expone el `reducedMotion` vivo del contexto. */
function ReducedMotionProbe() {
  const { reducedMotion } = useCapabilities()
  return <span data-testid="reduced-motion">{String(reducedMotion)}</span>
}

let originalMatchMedia

beforeEach(() => {
  originalMatchMedia = window.matchMedia
})

afterEach(() => {
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
})

describe('CapabilityProvider', () => {
  it('actualiza reducedMotion cuando prefers-reduced-motion cambia en sesion (R23.5)', () => {
    const { matchMedia, fireChange } = createMatchMedia({ [REDUCED_MOTION]: false })
    window.matchMedia = matchMedia

    render(
      <CapabilityProvider>
        <ReducedMotionProbe />
      </CapabilityProvider>,
    )

    // Estado inicial: sin movimiento reducido.
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false')

    // El usuario activa "reducir movimiento" durante la sesion.
    act(() => {
      fireChange(REDUCED_MOTION, true)
    })

    // El consumidor refleja el nuevo estado sin recargar.
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true')

    // Y vuelve a desactivarse si el usuario revierte la preferencia.
    act(() => {
      fireChange(REDUCED_MOTION, false)
    })
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false')
  })
})
