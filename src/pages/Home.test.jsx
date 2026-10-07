import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Home from './Home.jsx'

vi.mock('../components/Layout', () => ({
  SectionLabel: ({ children }) => <p className="eyebrow">{children}</p>,
}))

vi.mock('../components/conversion/PlanExplorer.jsx', () => ({
  default: ({ projections = [] }) => <div data-testid="plan-explorer" data-count={projections.length} />,
}))

vi.mock('../components/leads/LeadMagnet.jsx', () => ({
  default: ({ heading }) => (
    <section aria-label="Formulario de inicio">
      <h2 id="lead-magnet-title">{heading}</h2>
      <label>Nombre<input aria-label="Nombre" /></label>
      <label>Correo o WhatsApp<input aria-label="Correo o WhatsApp" /></label>
    </section>
  ),
}))

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

describe('Home — Gym Funnel V2', () => {
  it('reduce la portada a siete decisiones comerciales y un solo h1', () => {
    const { container } = renderHome()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: /ENTRENA CON DIRECCIÓN/i })).toBeInTheDocument()
    expect(container.querySelectorAll('.gym-home > section')).toHaveLength(7)
    expect(container.querySelector('.community-immersive')).toBeNull()
    expect(container.querySelector('.calculator-section')).toBeNull()
    expect(container.querySelector('.free-value')).toBeNull()
    expect(container.textContent).not.toMatch(/BIENVENIDO A BAYONA|UNIVERSO|ECOSISTEMA/i)
  })

  it('presenta cuatro servicios claros sin repetir Programas', () => {
    renderHome()
    const section = screen.getByRole('heading', { level: 2, name: /ELIGE CÓMO QUIERES ENTRENAR/i }).closest('section')
    const cards = section.querySelectorAll('.gym-service-card')
    expect(cards).toHaveLength(4)
    ;['Entrenamiento personal', 'Entrenamiento online', 'Parkour y rendimiento', 'Movilidad y recuperación']
      .forEach((name) => expect(within(section).getByRole('heading', { level: 3, name })).toBeInTheDocument())
    expect(within(section).queryByText(/^Programas$/i)).toBeNull()
  })

  it('explica el inicio en tres pasos y dirige al formulario', () => {
    renderHome()
    const section = screen.getByRole('heading', { level: 2, name: /TRES PASOS PARA EMPEZAR/i }).closest('section')
    expect(within(section).getAllByRole('listitem')).toHaveLength(3)
    expect(within(section).getByRole('link', { name: /QUIERO EMPEZAR/i })).toHaveAttribute('href', '#empieza')
  })

  it('conserva los planes canónicos en un único bloque', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 2, name: /MÁS APOYO CUANDO LO NECESITAS/i })).toBeInTheDocument()
    expect(screen.getByTestId('plan-explorer')).toHaveAttribute('data-count', '4')
    expect(screen.getAllByTestId('plan-explorer')).toHaveLength(1)
  })

  it('presenta tres regalos y lleva a captación antes de habilitar las descargas', () => {
    renderHome()
    const section = screen.getByRole('heading', { level: 2, name: /PRIMERO RECIBES VALOR/i }).closest('section')
    const giftLinks = within(section).getAllByRole('link')
    expect(giftLinks).toHaveLength(3)
    giftLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '#empieza')
      expect(link).not.toHaveAttribute('download')
    })
  })

  it('cierra con captura de datos y valoración, no con registro o bienvenida', () => {
    const { container } = renderHome()
    const lead = container.querySelector('#empieza')
    expect(lead).not.toBeNull()
    expect(within(lead).getByRole('heading', { name: /DEJA TUS DATOS/i })).toBeInTheDocument()
    expect(within(lead).getByLabelText('Formulario de inicio')).toBeInTheDocument()
    expect(within(lead).getByRole('link', { name: /AGENDAR POR WHATSAPP/i }).getAttribute('href')).toContain('https://wa.me/')
    expect(container.textContent).not.toMatch(/crear cuenta|registrarte|bienvenido/i)
  })
})
