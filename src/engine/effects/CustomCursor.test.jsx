// Tests del cursor unificado del Design System (Fase 3).
//
// La puerta de capacidades decide si el cursor se monta: solo Desktop sin
// movimiento reducido (Property 4 del diseño). En touch/móvil o con
// prefers-reduced-motion no debe existir cursor artificial.

import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { CapabilityContext } from '../providers/CapabilityProvider.jsx'
import { CustomCursor } from './CustomCursor.jsx'

function renderWithCaps(caps) {
  return render(
    <CapabilityContext.Provider value={caps}>
      <CustomCursor />
    </CapabilityContext.Provider>,
  )
}

const DESKTOP_CAPS = {
  mode: 'desktop',
  reducedMotion: false,
  canHover: true,
  finePointer: true,
  dprLimit: 2,
}

describe('CustomCursor — puerta de capacidades', () => {
  it('se monta en Desktop sin movimiento reducido y oculta el cursor nativo', () => {
    const { unmount } = renderWithCaps(DESKTOP_CAPS)

    expect(document.querySelector('.bayona-cursor')).not.toBeNull()
    expect(document.querySelector('.bayona-cursor__ring')).not.toBeNull()
    expect(document.documentElement.classList.contains('has-custom-cursor')).toBe(true)

    unmount()
    expect(document.documentElement.classList.contains('has-custom-cursor')).toBe(false)
  })

  it('no se monta en móvil (sin cursor artificial en touch)', () => {
    renderWithCaps({ ...DESKTOP_CAPS, mode: 'mobile', canHover: false, finePointer: false })

    expect(document.querySelector('.bayona-cursor')).toBeNull()
    expect(document.documentElement.classList.contains('has-custom-cursor')).toBe(false)
  })

  it('no se monta con prefers-reduced-motion', () => {
    renderWithCaps({ ...DESKTOP_CAPS, reducedMotion: true })

    expect(document.querySelector('.bayona-cursor')).toBeNull()
  })

  it('no se monta ante capacidades desconocidas (default mobile-safe)', () => {
    renderWithCaps(undefined)

    expect(document.querySelector('.bayona-cursor')).toBeNull()
  })
})
