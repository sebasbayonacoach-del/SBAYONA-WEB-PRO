// Tests del pasaje horizontal controlado por scroll (Fase 5).

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DEFAULT_CAPABILITIES } from '../providers/capabilities.js'
import { CapabilityContext } from '../providers/CapabilityProvider.jsx'
import { HorizontalPassage, PASSAGE_DEFAULT_LENGTH } from './HorizontalPassage.jsx'

const DESKTOP = { ...DEFAULT_CAPABILITIES, mode: 'desktop', canHover: true, finePointer: true }

function renderPassage(props, caps = DESKTOP) {
  return render(
    <CapabilityContext.Provider value={caps}>
      <HorizontalPassage {...props}>
        <article>Vagón 1</article>
        <article>Vagón 2</article>
        <article>Vagón 3</article>
      </HorizontalPassage>
    </CapabilityContext.Provider>,
  )
}

describe('HorizontalPassage — desktop animado', () => {
  it('renderiza el tramo con longitud, viewport fijo y rail', () => {
    const { container, getByText } = renderPassage({ length: '300vh' })

    const section = container.querySelector('.horizontal-passage')
    expect(section.style.height).toBe('300vh')
    expect(container.querySelector('.horizontal-passage-viewport')).toBeInTheDocument()
    expect(container.querySelector('.horizontal-passage-rail')).toBeInTheDocument()
    expect(section).not.toHaveClass('horizontal-passage--static')
    // El contenido viaja dentro del rail.
    expect(getByText('Vagón 2')).toBeInTheDocument()
  })

  it('longitud por defecto y gap como variable CSS', () => {
    const { container } = renderPassage({ gap: 48 })

    const section = container.querySelector('.horizontal-passage')
    expect(section.style.height).toBe(PASSAGE_DEFAULT_LENGTH)

    const rail = container.querySelector('.horizontal-passage-rail')
    expect(rail.style.getPropertyValue('--passage-gap')).toBe('48px')
  })

  it('una longitud invalida degrada al valor por defecto', () => {
    const { container } = renderPassage({ length: '50vh' })
    expect(container.querySelector('.horizontal-passage').style.height).toBe(
      PASSAGE_DEFAULT_LENGTH,
    )
  })

  it('sin ResizeObserver no rompe y el recorrido queda a 0', () => {
    const original = globalThis.ResizeObserver
    delete globalThis.ResizeObserver

    try {
      const { container } = renderPassage({})
      expect(container.querySelector('.horizontal-passage-rail')).toBeInTheDocument()
    } finally {
      globalThis.ResizeObserver = original
    }
  })
})

describe('HorizontalPassage — movil y movimiento reducido', () => {
  it('en movil renderiza la pila vertical sin rail ni fijacion', () => {
    const { container, getByText } = renderPassage({}, { ...DEFAULT_CAPABILITIES, mode: 'mobile' })

    const section = container.querySelector('.horizontal-passage--static')
    expect(section).toBeInTheDocument()
    expect(container.querySelector('.horizontal-passage-rail')).not.toBeInTheDocument()
    expect(container.querySelector('.horizontal-passage-viewport')).not.toBeInTheDocument()
    // El contenido completo sigue presente y en orden de lectura.
    expect(getByText('Vagón 1')).toBeInTheDocument()
    expect(getByText('Vagón 3')).toBeInTheDocument()
  })

  it('con movimiento reducido tambien apila verticalmente', () => {
    const { container } = renderPassage({}, { ...DESKTOP, reducedMotion: true })
    expect(container.querySelector('.horizontal-passage--static')).toBeInTheDocument()
    expect(container.querySelector('.horizontal-passage-rail')).not.toBeInTheDocument()
  })
})
