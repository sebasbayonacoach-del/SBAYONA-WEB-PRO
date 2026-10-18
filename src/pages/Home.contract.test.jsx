import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { membershipPlans } from '../config/offerings.js'
import Home from './Home.jsx'
import homeSource from './Home.jsx?raw'

vi.mock('../components/Layout', () => ({
  SectionLabel: ({ children }) => <p className="eyebrow">{children}</p>,
}))

vi.mock('../components/leads/LeadMagnet.jsx', () => ({
  default: ({ heading }) => <section aria-label="Contacto voluntario"><h2 id="lead-magnet-title">{heading}</h2></section>,
}))

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

describe('Home — contrato de una sola lectura', () => {
  it('mantiene el contacto voluntario sin onboarding obligatorio', () => {
    const { container } = renderHome()
    expect(container.querySelectorAll('#empieza')).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: /HABLAR CON SEBASTIÁN/i }).length).toBeGreaterThan(0)
    expect(homeSource).not.toMatch(/\/onboarding|JourneyRibbon|ArrivalBonusCard|UniverseScale|GuideCompanion/i)
  })

  it('expone cuatro servicios, cuatro planes y tres recursos', () => {
    const { container } = renderHome()
    expect(container.querySelectorAll('article.gym-service-card')).toHaveLength(4)
    const plans = container.querySelector('.bayona-plan-open')
    expect(plans).not.toBeNull()
    membershipPlans.forEach(({ name }) => {
      expect(within(plans).getByRole('heading', { name, exact: true })).toBeInTheDocument()
    })
    expect(container.querySelectorAll('.gym-gift-card')).toHaveLength(3)
  })

  it('deja los recursos gratis accesibles sin captación', () => {
    const { container } = renderHome()
    const links = [...container.querySelectorAll('.gym-gift-card')]
    expect(links).toHaveLength(3)
    links.forEach(link => {
      expect(link.getAttribute('href')).toMatch(/^\/downloads\/bayona-editorial\/.*\.pdf$/)
      expect(link).toHaveAttribute('download')
    })
  })

  it('no reintroduce configuradores o capas narrativas que requieren clics', () => {
    expect(homeSource).not.toMatch(
      /ScrollFilm|VisionShiftStage|PainUnlockStage|CommunityImmersiveStage|ImmersiveMethodStage|BenefitsOrbitStage|ExtrasExplorer|PersistentSummary|RequestPreview|PlanExplorer/,
    )
  })

  it('las tarjetas informativas no obligan a abrir otras rutas', () => {
    const { container } = renderHome()
    const hrefs = [...container.querySelectorAll('a[href]')].map(node => node.getAttribute('href'))
    expect(container.querySelectorAll('#servicios a.gym-service-card')).toHaveLength(0)
    expect(hrefs).toContain('#servicios')
    expect(hrefs).toContain('#empieza')
    expect(hrefs).not.toContain('/onboarding')
    expect(hrefs).not.toContain('/entrar')
  })
})
