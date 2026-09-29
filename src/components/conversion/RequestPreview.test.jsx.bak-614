import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buildExperienceWhatsAppUrl,
  calculateExperience,
  membershipPlans,
} from '../../config/offerings.js'
import RequestPreview from './RequestPreview.jsx'

afterEach(cleanup)

const baseSelection = Object.freeze({
  planId: 'RAIZ',
  serviceQuantities: {},
  extraIds: [],
})

// Validates: Requirements 5.17, 5.18, 13.5, 13.13, 15.5

describe('RequestPreview — revisión explícita de Official_WhatsApp', () => {
  it('bloquea el tercero hasta mostrar mensaje exacto, datos, condiciones y aviso', () => {
    const selectedPlan = membershipPlans[1]
    const selection = {
      planId: selectedPlan.id,
      serviceQuantities: {
        'virtual-1to1': 2,
        'presencial-espana-1to1': 1,
      },
      extraIds: ['masaje-deportivo'],
      contact: {
        nombre: '  Ada\nLovelace  ',
        email: 'ada@example.com',
      },
    }
    const calculation = calculateExperience(selection)
    const { container } = render(<RequestPreview selection={selection} />)
    const preview = container.querySelector('.request-preview')

    expect(preview).toHaveAttribute('data-preview-state', 'pending')
    expect(within(preview).getByRole('button', {
      name: 'Abrir WhatsApp de BAYONA; revisa primero el mensaje',
    })).toBeDisabled()
    expect(within(preview).queryByRole('link')).not.toBeInTheDocument()
    expect(within(preview).getByRole('status')).toHaveTextContent(/permanece bloqueado/i)

    fireEvent.click(within(preview).getByRole('button', { name: 'Revisar mensaje exacto' }))

    const exactPreview = within(preview).getByRole('region', {
      name: 'Vista previa exacta de la solicitud a WhatsApp',
    })
    const message = exactPreview.querySelector('.request-preview-message').textContent
    const link = within(exactPreview).getByRole('link', {
      name: 'Abrir WhatsApp de BAYONA en una pestaña nueva',
    })
    const expectedUrl = buildExperienceWhatsAppUrl(selection)
    const parsedUrl = new URL(link.getAttribute('href'))
    const geographicCondition = message
      .split('\n')
      .find((line) => line.includes('ubicación cuando aplique'))
    const nonContractualNotice = message
      .split('\n')
      .find((line) => line.includes('no constituye'))

    expect(preview).toHaveAttribute('data-preview-state', 'reviewed')
    expect(link).toHaveAttribute('href', expectedUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(parsedUrl.origin).toBe('https://wa.me')
    expect(parsedUrl.pathname).toBe('/34614988006')
    expect(parsedUrl.searchParams.get('text')).toBe(message)
    expect(message).toContain('Nombre: Ada Lovelace')
    expect(message).toContain(`Plan base: ${selectedPlan.name} — ${selectedPlan.priceDisplay} ${selectedPlan.currency}`)
    expect(geographicCondition).toBeTruthy()
    expect(nonContractualNotice).toBeTruthy()

    const includedFields = within(exactPreview).getByRole('region', {
      name: 'Datos que se incluirán',
    })
    expect(includedFields).toHaveTextContent('Ada Lovelace')
    expect(includedFields).toHaveTextContent(selectedPlan.name)
    expect(includedFields).toHaveTextContent(`${calculation.sessions[0].label}: 2`)
    expect(includedFields).toHaveTextContent('Masaje deportivo')
    expect(includedFields).toHaveTextContent(`${calculation.totalDisplay} COP`)

    const geographicRegion = within(exactPreview).getByRole('region', {
      name: 'Condiciones geográficas',
    })
    const noticeRegion = within(exactPreview).getByRole('region', {
      name: 'Aviso no contractual',
    })
    expect(within(geographicRegion).getByText(geographicCondition)).toBeInTheDocument()
    expect(within(noticeRegion).getByText(nonContractualNotice)).toBeInTheDocument()
  })

  it('invalida cada revisión cuando cambia la selección, incluso al recuperar valores previos', () => {
    const { container, rerender } = render(<RequestPreview selection={baseSelection} />)
    const preview = container.querySelector('.request-preview')

    fireEvent.click(within(preview).getByRole('button', { name: 'Revisar mensaje exacto' }))
    expect(within(preview).getByRole('link', {
      name: 'Abrir WhatsApp de BAYONA en una pestaña nueva',
    })).toBeInTheDocument()

    const updatedSelection = {
      ...baseSelection,
      planId: membershipPlans[2].id,
    }
    rerender(<RequestPreview selection={updatedSelection} />)

    expect(preview).toHaveAttribute('data-preview-state', 'pending')
    expect(within(preview).queryByRole('link')).not.toBeInTheDocument()
    expect(within(preview).getByRole('button', {
      name: 'Revisar mensaje actualizado',
    })).toBeInTheDocument()

    fireEvent.click(within(preview).getByRole('button', { name: 'Revisar mensaje actualizado' }))
    expect(within(preview).getByRole('link')).toHaveAttribute(
      'href',
      buildExperienceWhatsAppUrl(updatedSelection),
    )

    rerender(<RequestPreview selection={{ ...baseSelection }} />)

    expect(preview).toHaveAttribute('data-preview-state', 'pending')
    expect(within(preview).queryByRole('link')).not.toBeInTheDocument()
    expect(within(preview).getByRole('button', {
      name: 'Revisar mensaje actualizado',
    })).toBeInTheDocument()
  })
})
