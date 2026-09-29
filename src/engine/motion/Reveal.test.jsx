// Unit test (RTL + jsdom) de Reveal.
//
// Verifica que revela su contenido y, con reducedMotion, lo renderiza YA visible
// sin estilos de estado inicial oculto (R23.2).

import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

import { Reveal } from './Reveal.jsx'
import { useCapabilities } from '../hooks/useCapabilities.js'

vi.mock('../hooks/useCapabilities.js', () => ({ useCapabilities: vi.fn() }))

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

describe('Reveal', () => {
  it('renderiza su contenido dentro de la etiqueta indicada (R11.1)', () => {
    useCapabilities.mockReturnValue({ reducedMotion: false, mode: 'desktop' })

    render(
      <Reveal as="section" data-testid="wrap">
        <p>contenido</p>
      </Reveal>,
    )

    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(screen.getByTestId('wrap').tagName).toBe('SECTION')
  })

  it('con reducedMotion muestra el contenido sin estado inicial oculto (R23.2)', () => {
    useCapabilities.mockReturnValue({ reducedMotion: true, mode: 'mobile' })

    render(
      <Reveal as="section" data-testid="wrap">
        <p>contenido</p>
      </Reveal>,
    )

    const wrap = screen.getByTestId('wrap')
    expect(wrap).toBeInTheDocument()
    // Sin animacion: no se aplica el opacity:0 del estado "hidden".
    expect(wrap.style.opacity).toBe('')
  })
})
