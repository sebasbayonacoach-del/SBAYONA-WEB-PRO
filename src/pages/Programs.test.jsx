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

  it('presenta cuatro servicios principales y categorías secundarias entendibles', () => {
    const { container } = render(<MemoryRouter><Programs /></MemoryRouter>)
    expect(container.querySelectorAll('.services-path-card')).toHaveLength(4)
    for (const name of ['Entrenamiento personal', 'Entrenamiento online', 'Parkour y rendimiento', 'Movilidad y recuperación']) {
      expect(screen.getByRole('heading', { level: 3, name })).toBeInTheDocument()
    }
    expect(container.querySelectorAll('.services-overview-card')).toHaveLength(serviceCategoryDefinitions.length)
    for (const name of ['Sesiones guiadas', 'Movilidad y recuperación', 'Parkour y preparación']) {
      expect(screen.getAllByText(name, { exact: true }).length).toBeGreaterThan(0)
    }
  })

  it('mantiene una única comparación de membresías', () => {
    render(<MemoryRouter><Programs /></MemoryRouter>)
    expect(screen.getByTestId('plan-explorer')).toHaveAttribute('data-count', '4')
    expect(screen.getAllByTestId('plan-explorer')).toHaveLength(1)
  })

  it('publica todos los servicios adicionales sin alterar sus precios ni destinos de consulta', () => {
    const { container } = render(<MemoryRouter><Programs /></MemoryRouter>)
    const cards = [...container.querySelectorAll('.services-card')]
    expect(cards).toHaveLength(editorialServices.length)

    editorialServices.forEach((service) => {
      const card = container.querySelector(`[data-service-id="${service.id}"]`)
      expect(card).not.toBeNull()
      expect(card).toHaveTextContent(service.priceDisplay)
      const link = within(card).getByRole('link', { name: /CONSULTAR ESTE SERVICIO/i })
      expect(link.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//)
      expect(decodeURIComponent(link.getAttribute('href'))).toContain(service.priceDisplay)
    })
    expect(within(container).queryByRole('heading', { name: 'Biohacking' })).toBeNull()
    expect(within(container).getByRole('heading', { name: 'Hábitos para el rendimiento' })).toBeInTheDocument()
  })

  it('no repite configurador, comunidad ni calculadora dentro de Servicios', () => {
    const { container } = render(<MemoryRouter><Programs /></MemoryRouter>)
    expect(container.querySelector('.programs-calculator')).toBeNull()
    expect(container.querySelector('.program-comparison')).toBeNull()
    expect(container.querySelector('.programs-services')).toBeNull()
    expect(container.textContent).not.toMatch(/ENTRA GRATIS ANTES DE PAGAR|ELIGE PLAN Y AÑADE SERVICIOS/i)
  })
})
