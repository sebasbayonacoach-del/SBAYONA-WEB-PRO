// Tests de la marquesina declarativa (Fase 5).

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DEFAULT_CAPABILITIES } from '../providers/capabilities.js'
import { CapabilityContext } from '../providers/CapabilityProvider.jsx'
import { MARQUEE_BASE_DURATION, Marquee } from './Marquee.jsx'

function renderMarquee(props, caps = {}) {
  return render(
    <CapabilityContext.Provider value={{ ...DEFAULT_CAPABILITIES, ...caps }}>
      <Marquee ariaLabel="Lineas editoriales" {...props}>
        <span>BAYONA</span>
        <span>MÉTODO</span>
      </Marquee>
    </CapabilityContext.Provider>,
  )
}

describe('Marquee — modo animado', () => {
  it('renderiza una region accesible con la pista duplicada', () => {
    const { container } = renderMarquee({})

    expect(screen.getByRole('region', { name: 'Lineas editoriales' })).toBeInTheDocument()

    const groups = container.querySelectorAll('.marquee-group')
    expect(groups).toHaveLength(2)
    // La copia del bucle es invisible para lectores de pantalla.
    expect(groups[0]).not.toHaveAttribute('aria-hidden')
    expect(groups[1]).toHaveAttribute('aria-hidden', 'true')
    // El contenido real se ve una vez (la copia es aria-hidden).
    expect(screen.getAllByText('BAYONA')).toHaveLength(2)
  })

  it('la direccion por defecto es izquierda y `right` se declara con clase', () => {
    const { container, rerender } = renderMarquee({})
    expect(container.querySelector('.marquee--left')).toBeInTheDocument()
    expect(container.querySelector('.marquee--right')).not.toBeInTheDocument()

    rerender(
      <CapabilityContext.Provider value={DEFAULT_CAPABILITIES}>
        <Marquee ariaLabel="Lineas editoriales" direction="right">
          <span>BAYONA</span>
        </Marquee>
      </CapabilityContext.Provider>,
    )
    expect(container.querySelector('.marquee--right')).toBeInTheDocument()
  })

  it('expone duracion y gap como variables CSS con valores seguros', () => {
    const { container } = renderMarquee({ duration: 25, gap: 48 })
    const region = container.querySelector('.marquee')

    expect(region.style.getPropertyValue('--marquee-duration')).toBe('25s')
    expect(region.style.getPropertyValue('--marquee-gap')).toBe('48px')
  })

  it('degrada duracion y gap invalidos a los valores base', () => {
    const { container } = renderMarquee({ duration: -5, gap: Number.NaN })
    const region = container.querySelector('.marquee')

    expect(region.style.getPropertyValue('--marquee-duration')).toBe(`${MARQUEE_BASE_DURATION}s`)
    expect(region.style.getPropertyValue('--marquee-gap')).toBe('32px')
  })
})

describe('Marquee — pausa en hover', () => {
  it('solo se activa con puntero que soporta hover (desktop)', () => {
    const { container } = renderMarquee({ pauseOnHover: true }, { canHover: true, mode: 'desktop' })
    expect(container.querySelector('.marquee--pause-hover')).toBeInTheDocument()
  })

  it('se ignora en tactil aunque se pida', () => {
    const { container } = renderMarquee({ pauseOnHover: true }, { canHover: false })
    expect(container.querySelector('.marquee--pause-hover')).not.toBeInTheDocument()
  })
})

describe('Marquee — movimiento reducido', () => {
  it('renderiza el rail estatico sin duplicado ni bucle', () => {
    const { container } = renderMarquee({}, { reducedMotion: true })
    const region = container.querySelector('.marquee')

    expect(region).toHaveClass('marquee--static')
    // Sin copia aria-hidden: el contenido queda a la vista, desplazable.
    expect(container.querySelectorAll('.marquee-group')).toHaveLength(1)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
    expect(screen.getByText('BAYONA')).toBeInTheDocument()
    expect(screen.getByText('MÉTODO')).toBeInTheDocument()
  })
})
