import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { editorialServices, serviceCategoryDefinitions } from '../config/offerings.js'
import Programs from './Programs.jsx'

vi.mock('../components/Layout', () => ({
  PageHero: ({ title, kicker, children }) => <section><p>{kicker}</p><h1>{title}</h1>{children}</section>,
  SectionLabel: ({ children }) => <p className="eyebrow">{children}</p>,
}))

vi.mock('../components/conversion/PlanExplorer.jsx', () => ({
  default: ({ projections = [] }) => <div data-testid="plan-explorer" data-count={projections.length} />,
}))

describe('/programs — Servicios BAYONA', () => {
  it('se presenta públicamente como Nuestros Servicios, no Programas', () => {
    const { container } = render(<MemoryRouter><Programs /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'NUESTROS SERVICIOS.' })).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/PROGRAMAS DE ENTRENAMIENTO|COMPARAR PROGRAMAS/i)
  })

  it('organiza la oferta en tres áreas visuales', () => {
    const { container } = render(<MemoryRouter><Programs /></MemoryRouter>)
    expect(container.querySelectorAll('.services-overview-card')).toHaveLength(serviceCategoryDefinitions.length)
    serviceCategoryDefinitions.forEach(({ title }) => {
      expect(screen.getAllByRole('heading', { name: title }).length).toBeGreaterThan(0)
    })
  })

  it('mantiene una única comparación de membresías', () => {
    render(<MemoryRouter><Programs /></MemoryRouter>)
    expect(screen.getByTestId('plan-explorer')).toHaveAttribute('data-count', '4')
    expect(screen.getAllByTestId('plan-explorer')).toHaveLength(1)
  })

  it('publica todos los servicios sueltos con precio y consulta', () => {
    const { container } = render(<MemoryRouter><Programs /></MemoryRouter>)
    const cards = [...container.querySelectorAll('.services-card')]
    expect(cards).toHaveLength(editorialServices.length)

    editorialServices.forEach((service) => {
      const card = cards.find((node) => node.textContent.includes(service.label))
      expect(card).toBeDefined()
      expect(card).toHaveTextContent(service.priceDisplay)
      const link = within(card).getByRole('link', { name: /CONSULTAR DISPONIBILIDAD/i })
      expect(link).toHaveAttribute('href', service.cta)
    })
  })

  it('no repite configurador, comunidad ni calculadora dentro de Servicios', () => {
    const { container } = render(<MemoryRouter><Programs /></MemoryRouter>)
    expect(container.querySelector('.programs-calculator')).toBeNull()
    expect(container.querySelector('.program-comparison')).toBeNull()
    expect(container.querySelector('.programs-services')).toBeNull()
    expect(container.textContent).not.toMatch(/ENTRA GRATIS ANTES DE PAGAR|ELIGE PLAN Y AÑADE SERVICIOS/i)
  })
})
