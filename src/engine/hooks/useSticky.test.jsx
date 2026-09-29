// Tests de useSticky (infraestructura de scroll del Design System, Fase 3).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { useSticky } from './useSticky.js'

function Probe({ topOffset }) {
  const { ref, stuck } = useSticky({ topOffset })
  return <div ref={ref} data-testid="probe" data-stuck={String(stuck)} />
}

describe('useSticky', () => {
  beforeEach(() => {
    // rAF sincrono: el hook acota las lecturas por requestAnimationFrame y el
    // test necesita observar el estado tras cada scroll sin esperar timers.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback()
      return 0
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('informa fijado cuando el elemento alcanza el limite superior', () => {
    render(<Probe />)
    const probe = screen.getByTestId('probe')

    // jsdom reporta getBoundingClientRect() en ceros: top 0 <= 0 + 1 -> fijado.
    expect(probe.dataset.stuck).toBe('true')
  })

  it('alterna el estado al hacer scroll', () => {
    render(<Probe topOffset={80} />)
    const probe = screen.getByTestId('probe')

    // Lejos del limite: no fijado.
    probe.getBoundingClientRect = () => ({ top: 500 })
    fireEvent.scroll(window)
    expect(probe.dataset.stuck).toBe('false')

    // Cruza el limite (topOffset 80): fijado.
    probe.getBoundingClientRect = () => ({ top: 80 })
    fireEvent.scroll(window)
    expect(probe.dataset.stuck).toBe('true')
  })

  it('limpia las escuchas al desmontar', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Probe />)

    unmount()

    const removed = removeEventListener.mock.calls.map(([event]) => event)
    expect(removed).toContain('scroll')
    expect(removed).toContain('resize')
  })
})
