// Tests del overlay de debug del movimiento (Fase 5, solo desarrollo).

import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ExperienceProvider } from '../providers/ExperienceProvider.jsx'
import { MotionDebug } from './MotionDebug.jsx'

afterEach(() => {
  vi.unstubAllEnvs()
  window.history.replaceState({}, '', '/')
})

describe('MotionDebug — puertas de activacion', () => {
  it('en produccion renderiza null aunque el flag este presente', () => {
    vi.stubEnv('DEV', false)
    window.history.replaceState({}, '', '/?motionDebug=1')

    const { container } = render(<MotionDebug />)
    expect(container).toBeEmptyDOMElement()
  })

  it('en desarrollo sin el flag no aparece', () => {
    const { container } = render(<MotionDebug />)
    expect(container).toBeEmptyDOMElement()
  })

  it('en desarrollo con ?motionDebug=1 muestra el panel', () => {
    window.history.replaceState({}, '', '/?motionDebug=1')

    render(<MotionDebug />)
    const panel = screen.getByTestId('motion-debug')

    expect(panel).toBeInTheDocument()
    expect(panel).toHaveAttribute('aria-hidden', 'true')
    expect(panel).toHaveTextContent('MOTION DEBUG')
    expect(panel).toHaveTextContent('progress')
    expect(panel).toHaveTextContent('direction')
  })

  it('fuera del provider no rompe y muestra valores a cero', () => {
    window.history.replaceState({}, '', '/?motionDebug=1')

    render(<MotionDebug />)
    expect(screen.getByTestId('motion-debug')).toHaveTextContent('progress 0.00')
  })

  it('dentro del ExperienceProvider lee el estado vivo sin lanzar', () => {
    window.history.replaceState({}, '', '/?motionDebug=1')

    render(
      <ExperienceProvider>
        <MotionDebug />
      </ExperienceProvider>,
    )
    expect(screen.getByTestId('motion-debug')).toBeInTheDocument()
  })
})
