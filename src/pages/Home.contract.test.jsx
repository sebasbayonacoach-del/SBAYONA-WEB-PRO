import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { membershipPlans } from '../config/offerings.js'
import Home from './Home.jsx'
import homeSource from './Home.jsx?raw'

vi.mock('../components/Layout', () => ({
  SectionLabel: ({ children }) => <p className="eyebrow">{children}</p>,
}))

vi.mock('../components/conversion/PlanExplorer.jsx', () => ({
  default: ({ projections = [] }) => (
    <div className="plan-explorer" data-testid="canonical-plans">
      {projections.map(({ plan }) => <span key={plan.id}>{plan.name}</span>)}
    </div>
  ),
}))

vi.mock('../components/leads/LeadMagnet.jsx', () => ({
  default: ({ heading }) => <section aria-label="Captura de lead"><h2 id="lead-magnet-title">{heading}</h2></section>,
}))

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

describe('Home — contrato Gym Funnel V2', () => {
  it('mantiene un único camino de captación y elimina el onboarding gamificado', () => {
    const { container } = renderHome()

    expect(container.querySelector('#empieza')).not.toBeNull()
    expect(container.querySelectorAll('#empieza')).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: /EMPIEZA GRATIS/i }).length).toBeGreaterThan(0)
    expect(homeSource).not.toMatch(/\/onboarding|JourneyRibbon|ArrivalBonusCard|UniverseScale|GuideCompanion/i)
    expect(container.textContent).not.toMatch(/bienvenido|misión|universo|desbloquea/i)
  })

  it('expone cuatro servicios, un único bloque de planes y tres regalos', () => {
    const { container } = renderHome()

    expect(container.querySelectorAll('.gym-service-card')).toHaveLength(4)
    expect(screen.getAllByTestId('canonical-plans')).toHaveLength(1)
    membershipPlans.forEach(({ name }) => {
      expect(within(screen.getByTestId('canonical-plans')).getByText(name)).toBeInTheDocument()
    })
    expect(container.querySelectorAll('.gym-gift-card')).toHaveLength(3)
  })

  it('los regalos de Home son previews y la descarga queda detrás de captación', () => {
    const { container } = renderHome()
    const links = [...container.querySelectorAll('.gym-gift-card')]

    expect(links).toHaveLength(3)
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '#empieza')
      expect(link).not.toHaveAttribute('download')
    })
  })

  it('no reintroduce componentes narrativos y configuradores retirados', () => {
    expect(homeSource).not.toMatch(
      /ScrollFilm|VisionShiftStage|PainUnlockStage|CommunityImmersiveStage|ImmersiveMethodStage|BenefitsOrbitStage|ExtrasExplorer|PersistentSummary|RequestPreview/,
    )
  })

  it('la portada enlaza Servicios, Parkour y captación sin rutas muertas heredadas', () => {
    const { container } = renderHome()
    const hrefs = [...container.querySelectorAll('a[href]')].map((node) => node.getAttribute('href'))

    expect(hrefs).toContain('/programs')
    expect(hrefs).toContain('/parkour-academy')
    expect(hrefs).toContain('#empieza')
    expect(hrefs).not.toContain('/onboarding')
    expect(hrefs).not.toContain('/entrar')
  })
})
