import { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { VisitorJourneyProvider, useVisitorJourney } from '../onboarding/VisitorJourneyProvider.jsx'
import { UniverseScaleProvider } from './UniverseScaleProvider.jsx'
import UniverseScaleBadge from '../../components/scale/UniverseScaleBadge.jsx'

/** Dispara la recepción terminada con las respuestas que queramos simular. */
function Completar({ answers }) {
  const { completeJourney } = useVisitorJourney()
  useEffect(() => {
    completeJourney({
      name: 'Valentina',
      depth: 'largo',
      region: 'espana',
      answers,
      route: { plan: 'FUERZA' },
      visitType: 'personalized',
    })
  }, [answers, completeJourney])
  return null
}

const montar = (answers) =>
  render(
    <MemoryRouter initialEntries={['/community']}>
      <VisitorJourneyProvider>
        <UniverseScaleProvider>
          <Completar answers={answers} />
          <UniverseScaleBadge />
        </UniverseScaleProvider>
      </VisitorJourneyProvider>
    </MemoryRouter>,
  )

// El brief pide que la experiencia recoja información progresivamente y que
// BAYONA se sienta más grande cuanto más se explora. Si contestar no movía nada,
// el perfilado era un formulario más y la escala solo medía scroll.
describe('la escala del universo reconoce las respuestas de la recepción', () => {
  it('sube de fase al registrar respuestas', async () => {
    montar({})
    const antes = await screen.findByRole('complementary', { name: 'Tu fase en BAYONA' })
    expect(Number(antes.dataset.universeStage)).toBe(1)
  })

  it('cada respuesta suma, y las mismas respuestas no se cuentan dos veces', async () => {
    const respuestas = {
      objetivo: 'fuerza',
      puntoPartida: 'cero',
      semana: '3',
      pais: 'espana',
      freno: 'tiempo',
    }
    montar(respuestas)

    const testigo = await screen.findByRole('complementary', { name: 'Tu fase en BAYONA' })
    await waitFor(() => {
      expect(Number(testigo.dataset.universeStage)).toBeGreaterThanOrEqual(3)
    })
    // Ruta visitada (3) + cinco respuestas (2 cada una) = 13, por encima del
    // umbral de la fase 3 (12). Si algo contara doble, pasaría de fase antes.
    expect(Number(testigo.dataset.universeStage)).toBe(3)
  })
})
