// Unit test (RTL + jsdom) de TextReveal.
//
// Verifica el contrato accesible (R21.2): el contenedor expone el texto original
// via `aria-label` y los fragmentos animados van `aria-hidden`. Comprueba tambien
// que el split conserva el texto completo (R21.1) y el camino reduced-motion (R21.3).

import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

import { TextReveal } from './TextReveal.jsx'
import { useCapabilities } from '../hooks/useCapabilities.js'

// Aislamos el componente del provider real controlando `reducedMotion`.
vi.mock('../hooks/useCapabilities.js', () => ({ useCapabilities: vi.fn() }))

// `whileInView` usa IntersectionObserver, ausente en jsdom: stub inocuo.
beforeAll(() => {
  if (!globalThis.IntersectionObserver) {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const TEXT = 'Hola mundo cruel'

describe('TextReveal', () => {
  it('anima por palabras exponiendo el texto original y ocultando fragmentos (R21.1, R21.2)', () => {
    useCapabilities.mockReturnValue({ reducedMotion: false, mode: 'desktop' })

    render(<TextReveal text={TEXT} />)

    // El lector de pantalla encuentra la frase completa por su aria-label.
    const container = screen.getByLabelText(TEXT)
    // El texto renderizado concatenado coincide con el original (split sin perdidas).
    expect(container).toHaveTextContent(TEXT)

    // Todos los fragmentos visibles quedan ocultos a la tecnologia asistiva.
    const hidden = container.querySelectorAll('[aria-hidden="true"]')
    expect(hidden.length).toBeGreaterThan(0)
    // Las tres palabras estan presentes como segmentos animados.
    const words = Array.from(hidden)
      .map((n) => n.textContent)
      .filter((t) => t.trim().length > 0)
    expect(words).toEqual(['Hola', 'mundo', 'cruel'])
  })

  it('con reducedMotion muestra el texto plano sin fragmentar (R21.3)', () => {
    useCapabilities.mockReturnValue({ reducedMotion: true, mode: 'mobile' })

    render(<TextReveal text={TEXT} />)

    const container = screen.getByLabelText(TEXT)
    expect(container).toHaveTextContent(TEXT)
    // No hay segmentos animados/ocultos: es texto plano.
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(0)
  })
})
