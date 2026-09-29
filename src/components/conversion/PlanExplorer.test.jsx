import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { membershipPlanEditorialProjection } from '../../config/conversionContent.js'
import {
  COMMERCIAL_SCOPE_NOTICE,
  membershipComparisonRows,
  membershipPlans,
} from '../../config/offerings.js'
import PlanExplorer from './PlanExplorer.jsx'

afterEach(cleanup)

function renderExplorer() {
  return render(
    <MemoryRouter>
      <PlanExplorer />
    </MemoryRouter>,
  )
}

function getActiveArticle() {
  return screen.getByRole('article')
}

// Validates: Requirements 1.5, 1.9, 5.1, 5.2, 5.3, 5.4

describe('PlanExplorer — showroom comercial fiel', () => {
  it('presenta cuatro rutas y concentra el resumen comercial en el plan destacado', () => {
    const { container } = renderExplorer()
    const comparison = screen.getByRole('list', { name: 'Comparación de planes por plan' })
    const featuredProjection = membershipPlanEditorialProjection.find(({ plan }) => plan.featured)

    expect(comparison).toHaveAttribute('data-comparison-layout', 'showroom')
    expect(within(comparison).getAllByRole('listitem')).toHaveLength(membershipPlans.length)
    expect(container.querySelector('table')).toBeNull()
    expect(screen.getAllByRole('article')).toHaveLength(1)

    membershipPlanEditorialProjection.forEach(({ plan, overlay }) => {
      const anchor = container.querySelector(`#plan-${plan.id.toLowerCase()}`)
      const selector = within(anchor).getByRole('button', { name: `Ver plan ${plan.name}` })

      expect(anchor).toHaveAttribute('data-plan-id', plan.id)
      expect(anchor).toHaveAttribute('tabindex', '-1')
      expect(selector).toHaveAttribute('aria-controls')
      expect(selector).toHaveAttribute('aria-pressed', String(Boolean(plan.featured)))
      expect(within(anchor).getByText(plan.name)).toBeInTheDocument()
      expect(within(anchor).getByText(overlay.descriptor)).toBeInTheDocument()
      expect(within(anchor).getByText(plan.price)).toBeInTheDocument()
    })

    const { plan, overlay } = featuredProjection
    const article = getActiveArticle()
    const summaryElements = [...article.querySelectorAll([
      '.plan-canonical-name',
      '.plan-descriptor',
      '.plan-summary-jtbd',
      '.plan-summary-scope',
      '.plan-summary-value',
      '.plan-summary-price',
      '.plan-disclosure-button',
    ].join(', '))]

    expect(article).toHaveAttribute('data-plan-id', plan.id)
    expect(summaryElements.map((element) => element.classList[0])).toEqual([
      'plan-canonical-name',
      'plan-descriptor',
      'plan-summary-jtbd',
      'plan-summary-scope',
      'plan-summary-value',
      'plan-summary-price',
      'plan-disclosure-button',
    ])
    expect(within(article).getByRole('heading', { level: 3, name: plan.name })).toBeInTheDocument()
    expect(within(article).getByText(overlay.descriptor)).toBeInTheDocument()
    expect(within(article).getByText(overlay.jtbdSummary)).toBeInTheDocument()
    expect(within(article).getByText(overlay.valueSummary)).toBeInTheDocument()
    expect(within(article).getByText(plan.shortDescription)).toBeInTheDocument()
    expect(within(article).getByText(plan.priceDisplay)).toBeInTheDocument()
    expect(within(article).getByText(plan.currency)).toBeInTheDocument()
    expect(within(article).getByText(plan.eur)).toBeInTheDocument()
    expect(within(article).getByRole('link', {
      name: `Consultar ${plan.name} por WhatsApp`,
    })).toHaveAttribute('href', plan.cta)
    expect(within(article).getByRole('link', {
      name: `Ver presentación de ${plan.name}`,
    })).toHaveAttribute('href', `/plan/${plan.id.toLowerCase()}`)
  })
})

// Validates: Requirements 5.1, 5.5, 5.9, 14.3, 14.4

describe('PlanExplorer — selección y progressive disclosure', () => {
  it('mantiene una única selección accesible y un único panel de detalle', () => {
    renderExplorer()
    const fuerzaSelector = screen.getByRole('button', { name: 'Ver plan FUERZA' })
    const raizSelector = screen.getByRole('button', { name: 'Ver plan RAÍZ' })

    expect(fuerzaSelector).toHaveAttribute('aria-pressed', 'true')
    expect(raizSelector).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(raizSelector)

    expect(screen.getByRole('button', { name: 'Ver plan FUERZA' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Ver plan RAÍZ' })).toHaveAttribute('aria-pressed', 'true')
    expect(getActiveArticle()).toHaveAttribute('data-plan-id', 'RAIZ')

    const disclosure = screen.getByRole('button', { name: 'Ver alcance y condiciones de RAÍZ' })
    const panel = document.getElementById(disclosure.getAttribute('aria-controls'))

    expect(disclosure.tagName).toBe('BUTTON')
    expect(disclosure).toHaveAttribute('type', 'button')
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    expect(panel).toHaveAttribute('role', 'region')
    expect(panel).toHaveAttribute('aria-labelledby', disclosure.id)
    expect(panel).toHaveAttribute('hidden')

    fireEvent.click(disclosure)

    expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    expect(panel).not.toHaveAttribute('hidden')
    expect(screen.getByRole('button', {
      name: 'Ocultar alcance y condiciones de RAÍZ',
    })).toBe(disclosure)

    fireEvent.keyDown(raizSelector, { key: 'ArrowRight' })

    expect(screen.getByRole('button', { name: 'Ver plan FUERZA' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', {
      name: 'Ver alcance y condiciones de FUERZA',
    })).toHaveAttribute('aria-expanded', 'false')
  })

  it('revela inclusiones, exclusiones, condiciones y atributos sin alterar la fuente comercial', () => {
    renderExplorer()

    membershipPlans.forEach((plan, planIndex) => {
      fireEvent.click(screen.getByRole('button', { name: `Ver plan ${plan.name}` }))

      const article = getActiveArticle()
      const disclosure = within(article).getByRole('button', {
        name: `Ver alcance y condiciones de ${plan.name}`,
      })

      expect(article).toHaveAttribute('data-plan-id', plan.id)
      expect(within(article).getByRole('link', {
        name: `Consultar ${plan.name} por WhatsApp`,
      })).toHaveAttribute('href', plan.cta)
      expect(within(article).getByRole('link', {
        name: `Ver presentación de ${plan.name}`,
      })).toHaveAttribute('href', `/plan/${plan.id.toLowerCase()}`)

      fireEvent.click(disclosure)
      const panel = document.getElementById(disclosure.getAttribute('aria-controls'))

      expect(within(panel).getByRole('heading', { level: 4, name: 'Inclusiones publicadas' })).toBeInTheDocument()
      plan.included.forEach((item) => expect(panel).toHaveTextContent(item))
      if (plan.includedLead) expect(panel).toHaveTextContent(plan.includedLead)

      expect(within(panel).getByRole('heading', { level: 4, name: 'Exclusiones publicadas' })).toBeInTheDocument()
      if (plan.excluded?.length) {
        plan.excluded.forEach((item) => expect(panel).toHaveTextContent(item))
      } else {
        expect(panel).toHaveTextContent('La configuración comercial no publica exclusiones específicas para este plan.')
      }

      expect(within(panel).getByRole('heading', { level: 4, name: 'Condiciones aplicables' })).toBeInTheDocument()
      expect(panel).toHaveTextContent(COMMERCIAL_SCOPE_NOTICE)
      expect(within(panel).getByRole('heading', {
        level: 4,
        name: `Comparación de ${plan.name} por atributos`,
      })).toBeInTheDocument()

      membershipComparisonRows.forEach((row) => {
        expect(panel).toHaveTextContent(row.feature)
        expect(panel).toHaveTextContent(row.values[planIndex])
      })
    })
  })
})
