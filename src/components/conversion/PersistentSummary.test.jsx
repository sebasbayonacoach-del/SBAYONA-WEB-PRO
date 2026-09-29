import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  calculateExperience,
  COMMERCIAL_SCOPE_NOTICE,
} from '../../config/offerings.js'
import PersistentSummary from './PersistentSummary.jsx'

// Validates: Requirements 5.13, 5.14
 describe('PersistentSummary', () => {
  it('expone plan, COP entero y EUR aproximado en una región viva alcanzable', () => {
    const calculation = calculateExperience({ planId: 'RAIZ' })
    render(<PersistentSummary calculation={calculation} />)

    const summary = screen.getByRole('complementary', { name: 'Tu selección actual' })

    expect(summary).toHaveAttribute('aria-live', 'polite')
    expect(summary).toHaveAttribute('aria-atomic', 'true')
    expect(summary).toHaveAttribute('tabindex', '0')
    expect(summary).toHaveAttribute('data-total-cop', '149000')
    expect(within(summary).getByText('RAÍZ')).toBeInTheDocument()
    expect(within(summary).getByText('$149.000 COP')).toBeInTheDocument()
    expect(within(summary).getByText('≈ €35')).toBeInTheDocument()
    expect(within(summary).getByText('Sin sesiones ni extras seleccionados.')).toBeInTheDocument()
    expect(within(summary).getByText('Equivalencia EUR aproximada y no contractual.')).toBeInTheDocument()
  })

  it('enumera la selección calculada y deja el marco legal fuera del resumen', () => {
    const calculation = calculateExperience({
      planId: 'RAIZ',
      serviceQuantities: { 'virtual-1to1': 2 },
      extraIds: ['masaje-deportivo', 'biohacking'],
    })
    render(<PersistentSummary calculation={calculation} />)

    const summary = screen.getByRole('complementary', { name: 'Tu selección actual' })
    const selection = within(summary).getByRole('region', { name: 'Servicios seleccionados' })

    expect(summary).toHaveAttribute('data-total-cop', '349000')
    expect(within(summary).getByText('$349.000 COP')).toBeInTheDocument()
    expect(within(summary).getByText('≈ €81')).toBeInTheDocument()
    expect(within(selection).getAllByRole('listitem')).toHaveLength(3)
    expect(within(selection).getByText('2 × $35.000 COP')).toBeInTheDocument()
    expect(within(selection).getByText('Masaje deportivo')).toBeInTheDocument()
    expect(within(selection).getByText('Biohacking')).toBeInTheDocument()
    // El aviso del marco no médico vive en los textos legales y en las
    // revelaciones desplegables. El resumen persistente acompaña el total
    // mientras se configura, así que su contrato es no pintarlo ahí.
    expect(within(summary).queryByText(COMMERCIAL_SCOPE_NOTICE)).not.toBeInTheDocument()
    expect(within(summary).queryByRole('link')).not.toBeInTheDocument()
  })
})
