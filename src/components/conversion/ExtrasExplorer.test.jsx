import { useMemo, useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  calculateExperience,
  extraServices,
  membershipPlans,
  sessionServices,
} from '../../config/offerings.js'
import { groupServicesByCategory } from '../../lib/conversion/extras.js'
import ExtrasExplorer from './ExtrasExplorer.jsx'
import PersistentSummary from './PersistentSummary.jsx'

function ConfiguratorHarness() {
  const [selection, setSelection] = useState(() => ({
    planId: membershipPlans[0].id,
    serviceQuantities: {},
    extraIds: [],
  }))
  const calculation = useMemo(() => calculateExperience(selection), [selection])

  return (
    <div>
      <ExtrasExplorer selection={selection} onSelectionChange={setSelection} />
      <PersistentSummary calculation={calculation} />
    </div>
  )
}

// Validates: Requirements 5.10, 5.11, 5.12, 5.15
 describe('ExtrasExplorer', () => {
  it('muestra primero las categorías y conserva cada servicio fuente una sola vez', () => {
    const { container } = render(<ConfiguratorHarness />)
    const groups = groupServicesByCategory(sessionServices, extraServices)
    const categoryNavigation = screen.getByRole('navigation', { name: 'Categorías de servicios' })
    const categoryButtons = within(categoryNavigation).getAllByRole('button')
    const revealedServiceIds = []

    expect(categoryButtons.map((button) => button.textContent)).toEqual(
      groups.map(({ category }) => category),
    )
    expect(categoryButtons.every((button) => button.getAttribute('aria-expanded') === 'false')).toBe(true)
    expect(screen.queryByRole('heading', { name: sessionServices[0].label })).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()

    groups.forEach((group) => {
      fireEvent.click(within(categoryNavigation).getByRole('button', {
        name: `Explorar categoría ${group.category}`,
      }))
      const panel = screen.getByRole('region', { name: group.category })
      const serviceItems = [...panel.querySelectorAll('[data-service-id]')]

      expect(serviceItems.map(({ dataset }) => dataset.serviceId)).toEqual(
        group.services.map(({ id }) => id),
      )
      revealedServiceIds.push(...serviceItems.map(({ dataset }) => dataset.serviceId))
      expect(within(panel).queryByRole('checkbox')).not.toBeInTheDocument()
    })

    expect(revealedServiceIds).toEqual(
      groups.flatMap(({ services }) => services.map(({ id }) => id)),
    )
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(0)
  })

  it('revela detalle, precio, condición y exactamente las cantidades fuente bajo demanda', () => {
    render(<ConfiguratorHarness />)
    const categoryNavigation = screen.getByRole('navigation', { name: 'Categorías de servicios' })

    const visitedCategories = new Set()
    for (const service of sessionServices) {
      // Varias sesiones comparten categoría: solo se explora la primera vez.
      if (!visitedCategories.has(service.category)) {
        fireEvent.click(within(categoryNavigation).getByRole('button', {
          name: `Explorar categoría ${service.category}`,
        }))
        visitedCategories.add(service.category)
      }
      const panel = screen.getByRole('region', { name: service.category })

      expect(within(panel).queryByText(`${service.priceDisplay} COP`)).not.toBeInTheDocument()
      fireEvent.click(within(panel).getByRole('button', {
        name: `Ver detalle y opciones de ${service.label}`,
      }))

      expect(within(panel).getByText(service.description)).toBeInTheDocument()
      expect(within(panel).getByText(`${service.priceDisplay} COP`)).toBeInTheDocument()
      expect(within(panel).getAllByRole('option').map((option) => Number(option.value))).toEqual(
        service.quantities,
      )
      expect(within(panel).getByRole('combobox', {
        name: `Cantidad de ${service.label}`,
      })).toHaveValue('0')
    }

    const inPersonService = sessionServices.find(({ presencial }) => presencial)
    const inPersonPanel = screen.getByRole('region', { name: inPersonService.category })
    // El acordeón mantiene un solo detalle abierto: tras el bucle queda
    // expandido el último servicio; se vuelve a abrir el presencial.
    fireEvent.click(within(inPersonPanel).getByRole('button', {
      name: `Ver detalle y opciones de ${inPersonService.label}`,
    }))
    expect(within(inPersonPanel).getByText(
      'presencial sujeto a ubicación y disponibilidad',
    )).toBeInTheDocument()
  })

  // Validates: Requirements 5.13, 5.14, 5.16, 5.17
  it('actualiza plan, acciones individuales y resumen sin abrir un canal externo', () => {
    render(<ConfiguratorHarness />)
    const categoryNavigation = screen.getByRole('navigation', { name: 'Categorías de servicios' })
    const summary = screen.getByRole('complementary', { name: 'Tu selección actual' })

    expect(within(summary).getByText('$149.000 COP')).toBeInTheDocument()

    fireEvent.click(within(categoryNavigation).getByRole('button', {
      name: 'Explorar categoría CLASES',
    }))
    fireEvent.click(screen.getByRole('button', {
      name: `Ver detalle y opciones de ${sessionServices[0].label}`,
    }))
    fireEvent.change(screen.getByRole('combobox', {
      name: `Cantidad de ${sessionServices[0].label}`,
    }), { target: { value: '2' } })

    const extra = extraServices.find(({ id }) => id === 'masaje-deportivo')
    fireEvent.click(within(categoryNavigation).getByRole('button', {
      name: `Explorar categoría ${extra.category}`,
    }))
    fireEvent.click(screen.getByRole('button', {
      name: `Ver detalle y opciones de ${extra.label}`,
    }))
    const addExtra = screen.getByRole('button', {
      name: `Añadir ${extra.label} a la selección`,
    })
    fireEvent.click(addExtra)

    expect(screen.getByRole('button', {
      name: `Quitar ${extra.label} de la selección`,
    })).toHaveAttribute('aria-pressed', 'true')
    expect(within(summary).getByText('$299.000 COP')).toBeInTheDocument()
    expect(within(summary).getByText(sessionServices[0].label)).toBeInTheDocument()
    expect(within(summary).getByText(extra.label)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', {
      name: new RegExp(`${membershipPlans[1].name}.*\\$299\\.000`, 'i'),
    }))
    expect(within(summary).getByText('$449.000 COP')).toBeInTheDocument()
    expect(within(summary).getByText(membershipPlans[1].name)).toBeInTheDocument()
    expect(within(summary).queryByRole('link')).not.toBeInTheDocument()
  })
})
