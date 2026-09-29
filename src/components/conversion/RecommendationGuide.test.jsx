import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { membershipPlanEditorialProjection } from '../../config/conversionContent.js'
import {
  RECOMMENDATION_DISCLAIMER,
  recommendPlan,
} from '../../lib/conversion/recommendation.js'
import guideSource from './RecommendationGuide.jsx?raw'
import RecommendationGuide from './RecommendationGuide.jsx'

afterEach(cleanup)

function openGuide() {
  render(<RecommendationGuide />)
  fireEvent.click(screen.getByRole('button', { name: 'Abrir mini-guía' }))
}

function answerGuide({
  motivation = 'Contar con acompañamiento directo',
  experience = 'Mantengo una práctica constante',
  support = 'Sesiones privadas',
} = {}) {
  fireEvent.click(screen.getByRole('radio', { name: motivation }))
  fireEvent.click(screen.getByRole('radio', { name: experience }))
  fireEvent.click(screen.getByRole('radio', { name: support }))
}

// Validates: Requirements 2.8, 5.6, 15.1, 15.9

describe('RecommendationGuide — flujo opcional y minimización', () => {
  it('permanece cerrada por defecto y solo pregunta motivación, experiencia y acompañamiento', () => {
    const { container } = render(<RecommendationGuide />)
    const toggle = screen.getByRole('button', { name: 'Abrir mini-guía' })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('.recommendation-guide')).toHaveAttribute('data-guide-state', 'closed')
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getByText(/no solicita género, información de salud ni datos biométricos/i)).toBeInTheDocument()
    expect(screen.getByText(/solo en memoria.*no se envían/i)).toBeInTheDocument()

    fireEvent.click(toggle)

    expect(screen.getByRole('radiogroup', { name: '1. ¿Qué te gustaría priorizar?' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: '2. ¿Cómo describes tu experiencia actual?' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: '3. ¿Qué acompañamiento deseas comparar?' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(10)
    // Sin errores todavía: ningún grupo declara estado inválido.
    expect(screen.getAllByRole('radiogroup').every((group) => (
      !group.hasAttribute('aria-invalid')
    ))).toBe(true)
    expect(container.querySelector('input[name="gender"], input[name="health"], input[name="biometrics"]')).toBeNull()
    expect(guideSource).not.toMatch(/localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|analytics|gtag|pixel/i)
  })

  it('no produce una orientación incompleta y asocia un error a cada respuesta ausente', () => {
    openGuide()

    fireEvent.click(screen.getByRole('button', { name: 'Ver orientación explicada' }))

    expect(screen.getAllByRole('alert')).toHaveLength(3)
    expect(screen.queryByText('PLAN SUGERIDO PARA COMPARAR')).not.toBeInTheDocument()
    // El estado inválido vive en el radiogroup (rol que soporta aria-invalid);
    // cada radio conserva la asociación con su mensaje de error.
    expect(screen.getAllByRole('radiogroup').every((group) => (
      group.getAttribute('aria-invalid') === 'true'
    ))).toBe(true)
    expect(screen.getAllByRole('radio').every((radio) => (
      !radio.hasAttribute('aria-invalid')
      && radio.hasAttribute('aria-describedby')
    ))).toBe(true)

    // Al responder un grupo, su estado inválido se limpia.
    fireEvent.click(screen.getByRole('radio', { name: 'Construir constancia' }))
    expect(screen.getByRole('radiogroup', { name: '1. ¿Qué te gustaría priorizar?' }))
      .not.toHaveAttribute('aria-invalid')
    expect(screen.getByRole('radiogroup', { name: '2. ¿Cómo describes tu experiencia actual?' }))
      .toHaveAttribute('aria-invalid', 'true')
  })
})

// Validates: Requirements 5.7, 5.8, 15.1

describe('RecommendationGuide — recomendación explicable', () => {
  it('muestra el plan fuente, respuestas, regla, razones, disclaimer y los tres accesos', () => {
    openGuide()
    answerGuide()

    fireEvent.click(screen.getByRole('button', { name: 'Ver orientación explicada' }))

    const expected = recommendPlan({
      motivation: 'acompanamiento-directo',
      experience: 'constante',
      supportLevel: 'sesiones-privadas',
    })
    const result = screen.getByRole('heading', { level: 4, name: 'ELITE' }).closest('.recommendation-result')
    const reasons = within(result).getByRole('list', { name: 'Razones de la orientación' })
    const alternatives = within(result).getByRole('navigation', { name: 'Compara los tres planes' })

    /*
      Heredado en rojo: este pin esperaba el descriptor viejo de ELITE
      («Acompañamiento privado»). `conversionContent.js:131` publica «Experiencia
      privada» desde antes de la pasada de anotaciones, y la copy nueva no mete
      plazo, urgencia, cifras ni claims. Se mueve el PIN de la palabra, no la
      guarda: la línea de arriba sigue comprobando que la ficha muestra el
      descriptor del plan sugerido junto a las tres respuestas y su regla.
    */
    expect(result).toHaveTextContent('Experiencia privada')
    expect(result).toHaveTextContent('Contar con acompañamiento directo')
    expect(result).toHaveTextContent('Mantengo una práctica constante')
    expect(result).toHaveTextContent('Sesiones privadas')
    expect(result).toHaveTextContent(expected.ruleVersion)
    expect(result).toHaveTextContent(expected.decision.reason)
    expect(result).toHaveTextContent(RECOMMENDATION_DISCLAIMER)
    expect(within(reasons).getAllByRole('listitem')).toHaveLength(3)

    expected.reasons.forEach(({ ruleId, reason }) => {
      const item = reasons.querySelector(`[data-rule-id="${ruleId}"]`)
      expect(item).not.toBeNull()
      expect(item).toHaveTextContent(reason)
      expect(item).toHaveTextContent(`Regla aplicada: ${ruleId}`)
    })

    const links = within(alternatives).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#plan-elite',
      '#plan-raiz',
      '#plan-fuerza',
      '#plan-rendimiento',
    ])
    expect(links[0]).toHaveAttribute('data-recommendation-role', 'suggested')
    expect(links.slice(1).every((link) => (
      link.getAttribute('data-recommendation-role') === 'alternative'
    ))).toBe(true)
    expect(result.querySelector('a[href^="https://"], a[href^="http://"]')).toBeNull()
  })

  it('permite editar sin perder respuestas y las descarta al cerrar o remontar', () => {
    const firstRender = render(<RecommendationGuide />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mini-guía' }))
    answerGuide()
    fireEvent.click(screen.getByRole('button', { name: 'Ver orientación explicada' }))
    fireEvent.click(screen.getByRole('button', { name: 'Editar respuestas' }))

    expect(screen.getByRole('radio', { name: 'Contar con acompañamiento directo' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Mantengo una práctica constante' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Sesiones privadas' })).toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar y descartar respuestas' }))
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mini-guía' }))
    expect(screen.getAllByRole('radio').every((radio) => !radio.checked)).toBe(true)

    firstRender.unmount()
    render(<RecommendationGuide projections={membershipPlanEditorialProjection} />)
    expect(screen.getByRole('button', { name: 'Abrir mini-guía' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })
})


// Validates: Requirements 5.7, 15.1

describe('RecommendationGuide — fallo cerrado', () => {
  it('no inventa una sugerencia si falta una alternativa en la proyección comercial', () => {
    render(<RecommendationGuide projections={membershipPlanEditorialProjection.slice(0, 2)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mini-guía' }))
    answerGuide()
    fireEvent.click(screen.getByRole('button', { name: 'Ver orientación explicada' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No podemos mostrar una orientación con la configuración disponible.',
    )
    expect(screen.queryByText('PLAN SUGERIDO PARA COMPARAR')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Compara los tres planes' })).not.toBeInTheDocument()
  })
})
