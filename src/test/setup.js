// Vitest global setup (Requirement 22.8 — runner de tests).
// Extiende `expect` con los matchers de jest-dom (toBeInTheDocument, etc.).
// Requiere `test.globals: true` en vite.config.js para engancharse al expect global.
import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// jsdom no implementa APIs del navegador que la app usa en cliente
// (matchMedia para capabilities/motionProfile, IntersectionObserver para
// reveals y lazy loading). Sin estos stubs, ~36 tests fallan por entorno,
// no por contenido.
beforeEach(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }

  if (!window.IntersectionObserver) {
    class MockIntersectionObserver {
      constructor(callback) { this.callback = callback }
      observe(target) {
        // Notifica inmediatamente como visible para que los efectos de
        // reveal se monten y sus aserciones sean evaluables en jsdom.
        this.callback(
          [{ isIntersecting: true, target, intersectionRatio: 1 }],
          this,
        )
      }
      unobserve() {}
      disconnect() {}
      takeRecords() { return [] }
    }
    window.IntersectionObserver = MockIntersectionObserver
  }

  if (!window.ResizeObserver) {
    class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.ResizeObserver = MockResizeObserver
  }

  if (!window.scrollTo) {
    window.scrollTo = vi.fn()
  }
})
