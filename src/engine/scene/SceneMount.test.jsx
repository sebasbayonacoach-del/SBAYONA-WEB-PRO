import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SceneMount } from './SceneMount.jsx'

vi.mock('./Scene3D.jsx', () => ({
  Scene3D: ({ eventSource, inView }) => (
    <div
      data-testid="r3f-host"
      data-event-source={eventSource?.dataset.testid ?? ''}
      data-in-view={inView ? 'true' : 'false'}
    />
  ),
}))

vi.mock('../hooks/useCapabilities.js', () => ({
  useCapabilities: () => ({
    mode: 'desktop',
    reducedMotion: false,
    canHover: true,
    finePointer: true,
    dprLimit: 2,
  }),
}))

afterEach(cleanup)

describe('SceneMount pointer layering', () => {
  it('conecta R3F al hero padre y habilita puntero detrás de la UI', async () => {
    const { container } = render(
      <section data-testid="hero">
        <SceneMount config={{ variant: 'signature' }} className="test-scene" />
        <a href="/programs">CTA</a>
      </section>,
    )

    const r3fHost = await screen.findByTestId('r3f-host')
    const sceneLayer = container.querySelector('.test-scene')

    expect(r3fHost).toHaveAttribute('data-event-source', 'hero')
    expect(sceneLayer).toHaveStyle({ pointerEvents: 'auto', zIndex: '0' })
    expect(screen.getByRole('link', { name: 'CTA' })).toBeInTheDocument()
  })
})

describe('SceneMount render-loop pausing (§33 performance)', () => {
  // El observer global del setup siempre notifica "visible"; este test necesita
  // uno controlable para simular salir/entrar del viewport.
  it('congela el frameloop cuando el lienzo sale del viewport y lo reanuda al volver', async () => {
    let ioCallback = null
    const observerInstance = { disconnect: vi.fn() }
    class ControllableIntersectionObserver {
      constructor(callback) {
        ioCallback = callback
      }
      observe() {}
      unobserve() {}
      disconnect() {
        observerInstance.disconnect()
      }
      takeRecords() {
        return []
      }
    }
    const originalIO = window.IntersectionObserver
    window.IntersectionObserver = ControllableIntersectionObserver

    try {
      render(
        <section data-testid="hero">
          <SceneMount config={{ variant: 'signature' }} className="test-scene" />
        </section>,
      )

      const host = await screen.findByTestId('r3f-host')
      // Defensa: nunca congela una escena visible antes del primer disparo.
      expect(host).toHaveAttribute('data-in-view', 'true')

      // El usuario hace scroll y el hero sale del viewport.
      act(() => {
        ioCallback([{ isIntersecting: false, intersectionRatio: 0 }], observerInstance)
      })
      expect(screen.getByTestId('r3f-host')).toHaveAttribute('data-in-view', 'false')

      // Vuelve a entrar: el bucle de render se reanuda.
      act(() => {
        ioCallback([{ isIntersecting: true, intersectionRatio: 1 }], observerInstance)
      })
      expect(screen.getByTestId('r3f-host')).toHaveAttribute('data-in-view', 'true')
    } finally {
      window.IntersectionObserver = originalIO
    }
  })

  it('no instala observer si IntersectionObserver no existe (SSR-safe)', async () => {
    const originalIO = window.IntersectionObserver
    window.IntersectionObserver = undefined
    try {
      render(
        <section data-testid="hero">
          <SceneMount config={{ variant: 'signature' }} className="test-scene" />
        </section>,
      )
      const host = await screen.findByTestId('r3f-host')
      expect(host).toHaveAttribute('data-in-view', 'true')
    } finally {
      window.IntersectionObserver = originalIO
    }
  })
})
