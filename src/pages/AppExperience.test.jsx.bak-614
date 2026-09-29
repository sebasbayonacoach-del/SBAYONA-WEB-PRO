import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AppExperience from './AppExperience.jsx'

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => React.forwardRef(({ children, ...props }, ref) => (
      React.createElement(tag, { ...props, ref }, children)
    )),
  }),
  AnimatePresence: ({ children }) => children,
  useReducedMotion: () => false,
}))

vi.mock('../components/Layout', () => ({
  SectionLabel: ({ children }) => <p>{children}</p>,
}))

function renderPage() {
  return render(<MemoryRouter><AppExperience /></MemoryRouter>)
}

// BAYONA+ es un concepto en desarrollo. El contrato protege la honestidad
// del estado (nada de disponibilidad, plazas ni acceso confirmado) y el
// catálogo conceptual cerrado de nueve módulos.
describe('/app — BAYONA+ conceptual y honesta', () => {
  it('presenta la identidad BAYONA+ con su estado de desarrollo explícito', () => {
    renderPage()

    expect(screen.getAllByText(/PRODUCTO EN DESARROLLO/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { level: 1, name: /ENTRENAMIENTO\.\s*SEGUIMIENTO\.\s*UN MISMO LUGAR\./i })).toBeInTheDocument()
    expect(screen.getAllByText(/Todavía no está disponible\./i).length).toBeGreaterThan(0)
  })

  it('ofrece dos salidas honestas: novedades por WhatsApp o conocer el concepto', () => {
    renderPage()

    const novedades = screen.getAllByRole('link', { name: /RECIBIR NOVEDADES/i })[0]
    expect(novedades).toHaveAttribute('href', expect.stringContaining('https://wa.me/34614988006'))
    const message = decodeURIComponent(novedades.getAttribute('href'))
    expect(message).toContain('novedades')
    expect(message).toContain('en desarrollo')
    // Aviso explícito: pedir información no es reservar nada.
    expect(message).not.toMatch(/acceso confirmado|reserva|plaza/i)

    expect(screen.getAllByRole('link', { name: /CONOCER EL CONCEPTO|Ir al concepto de BAYONA\+/i }).length)
      .toBeGreaterThanOrEqual(1)
  })

  it('expone exactamente los nueve módulos conceptuales sin precios ni promesas', () => {
    const { container } = renderPage()

    const featureList = screen.getByRole('list', {
      name: 'Funciones conceptuales en evaluación para BAYONA+',
    })
    const items = within(featureList).getAllByRole('listitem')
    expect(items).toHaveLength(9)

    // Sin precios ni lenguaje de disponibilidad en el catálogo conceptual.
    const sectionText = container.textContent
    expect(sectionText).not.toMatch(/\$\d{2,3}\.000|COP\/mes|ya disponible|disponible ahora/i)
  })

  it('declara la futura integración con los cuatro planes como no confirmada', () => {
    renderPage()

    const integrationCopy = screen.getByText(/conectar los planes RAÍZ, FUERZA, RENDIMIENTO y ELITE/i)
    expect(integrationCopy).toHaveTextContent(/aún no está confirmada/i)
  })

  it('cierra con seguimiento de desarrollo sin reservar plaza ni garantizar acceso', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: /SIGUE\s*EL DESARROLLO\./i })).toBeInTheDocument()
    expect(screen.getByText(/Apuntarte no reserva plaza, no activa una compra y no garantiza acceso a una prueba\./i)).toBeInTheDocument()

    const links = screen.getAllByRole('link', { name: /RECIBIR NOVEDADES/i })
    expect(links.length).toBeGreaterThanOrEqual(2)
    for (const link of links) {
      expect(link.getAttribute('href')).toContain('wa.me/34614988006')
    }
  })

  it('no monta escena 3D ni reproductores: todo es DOM y CSS', () => {
    const { container } = renderPage()

    expect(container.querySelector('canvas')).toBeNull()
    expect(container.querySelector('audio, video, iframe')).toBeNull()
  })
})
