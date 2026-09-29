import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PaseBayona from './PaseBayona.jsx'

vi.mock('framer-motion', () => {
  const component = (tag) => ({ children, ...props }) => React.createElement(tag, props, children)
  return {
    AnimatePresence: ({ children }) => children,
    motion: new Proxy({}, { get: (_, tag) => component(tag) }),
  }
})

describe('PaseBayona', () => {
  it('deja únicamente los datos útiles y una nota breve de privacidad', () => {
    render(
      <PaseBayona
        answers={{ goal: '', experience: '', availability: '' }}
        route={null}
        visitType="personalized"
      />,
    )

    const pass = screen.getByRole('article', { name: /pase bayona temporal y anónimo/i })
    expect(pass).toHaveTextContent(/PASE BAYONA/i)
    expect(pass).toHaveTextContent(/VISITANTE · ACCESO TEMPORAL/i)
    expect(pass).toHaveTextContent(/OBJETIVO|EXPERIENCIA|RITMO SEMANAL|RUTA SUGERIDA/i)
    expect(pass).toHaveTextContent('Pase temporal. No guardamos tus datos.')
    expect(pass).not.toHaveTextContent(/CÓDIGO VISUAL|BYN-V|identificador permanente/i)
  })
})
