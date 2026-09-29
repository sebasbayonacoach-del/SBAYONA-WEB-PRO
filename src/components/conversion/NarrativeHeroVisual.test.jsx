import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import NarrativeHeroVisual, { NARRATIVE_HERO_STEPS } from './NarrativeHeroVisual.jsx'

afterEach(cleanup)

describe('NarrativeHeroVisual', () => {
  // Validates: Requirements 4.4, 4.5, 4.8, 14.11, 14.12, 14.13
  it('expone punto de partida, camino adaptable y resultado posible como fallback DOM semántico', () => {
    const { container } = render(<NarrativeHeroVisual />)
    const figure = screen.getByRole('figure', {
      name: 'Del punto de partida a un resultado posible',
    })
    const steps = within(figure).getAllByRole('listitem')

    expect(figure).toHaveAttribute('data-static-fallback', 'dom')
    expect(steps).toHaveLength(3)
    expect(NARRATIVE_HERO_STEPS.map(({ title }) => title)).toEqual([
      'Punto de partida',
      'Camino adaptable',
      'Resultado posible',
    ])
    expect(within(figure).getByText(/sin convertir la observación en un diagnóstico/i)).toBeInTheDocument()
    expect(within(figure).getByText(/puede ajustarse contigo/i)).toBeInTheDocument()
    expect(within(figure).getByText(/podrías empezar a construir según tu punto de partida y contexto/i)).toBeInTheDocument()
    expect(container.querySelector('canvas')).toBeNull()
  })
})
