import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Home from './Home.jsx'

vi.mock('../components/Layout', () => ({
  SectionLabel: ({ children }) => <p className="eyebrow">{children}</p>,
}))

vi.mock('../components/leads/LeadMagnet.jsx', () => ({
  default: ({ heading }) => (
    <section aria-label="Contacto voluntario">
      <h2 id="lead-magnet-title">{heading}</h2>
      <label>Nombre<input aria-label="Nombre" /></label>
      <label>Correo o WhatsApp<input aria-label="Correo o WhatsApp" /></label>
    </section>
  ),
}))

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

describe('Home — recorrido continuo BAYONA', () => {
  it('mantiene un solo h1 y capítulos lineales en el recorrido', () => {
    const { container } = renderHome()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: /ENTRENA CON DIRECCIÓN/i })).toBeInTheDocument()
    expect(container.querySelectorAll('.gym-home > section')).toHaveLength(10)
    expect(container.querySelector('.community-immersive')).toBeNull()
    expect(container.querySelector('.calculator-section')).toBeNull()
  })

  it('muestra cuatro servicios con detalles incorporados, sin enlaces en las tarjetas', () => {
    renderHome()
    const section = screen.getByRole('heading', { level: 2, name: /TU OBJETIVO.*TU FORMA DE MOVERTE/i }).closest('section')
    expect(section.querySelectorAll('article.gym-service-card')).toHaveLength(4)
    expect(section.querySelectorAll('a.gym-service-card')).toHaveLength(0)
    ;['Entrenamiento personal', 'Entrenamiento online', 'Parkour y rendimiento', 'Movilidad y recuperación']
      .forEach(name => expect(within(section).getByRole('heading', { level: 3, name })).toBeInTheDocument())
    expect(within(section).getAllByText(/DETALLES A LA VISTA/i)).toHaveLength(4)
  })

  it('presenta la guía y el recorrido de inicio sin pasos ocultos', () => {
    const { container } = renderHome()
    expect(container.querySelectorAll('#tu-ruta .bayona-discovery__allstep')).toHaveLength(3)
    const section = screen.getByRole('heading', { level: 2, name: /TRES PASOS PARA EMPEZAR/i }).closest('section')
    expect(within(section).getAllByRole('listitem')).toHaveLength(3)
  })

  it('presenta los cuatro planes al mismo tiempo, con inclusiones y exclusiones', () => {
    const { container } = renderHome()
    expect(screen.getByRole('heading', { level: 2, name: /EL APOYO QUE NECESITAS/i })).toBeInTheDocument()
    expect(container.querySelectorAll('.bayona-plan-open__card')).toHaveLength(4)
    expect(container.querySelectorAll('.bayona-plan-open__details h4')).toHaveLength(8)
    expect(container.querySelectorAll('.bayona-plan-open button')).toHaveLength(0)
  })

  it('muestra 12 familias y 104 ejemplos de movimiento adaptado sin desplegables', () => {
    const { container } = renderHome()
    expect(container.querySelectorAll('#movimiento-adaptado .bayona-home-contexts__group')).toHaveLength(12)
    expect(container.querySelectorAll('#movimiento-adaptado .bayona-home-contexts__group li')).toHaveLength(104)
    expect(container.querySelector('#movimiento-adaptado button')).toBeNull()
  })

  it('ofrece tres PDF gratuitos con descarga directa', () => {
    renderHome()
    const section = screen.getByRole('heading', { level: 2, name: /UN BUEN COMIENZO NO TIENE PRECIO/i }).closest('section')
    const gifts = within(section).getAllByRole('link')
    expect(gifts).toHaveLength(3)
    gifts.forEach(link => {
      expect(link.getAttribute('href')).toMatch(/^\/downloads\/bayona-editorial\/.*\.pdf$/)
      expect(link).toHaveAttribute('download')
    })
  })

  it('solo pide contacto voluntario después de explicar las opciones', () => {
    const { container } = renderHome()
    const lead = container.querySelector('#empieza')
    expect(lead).not.toBeNull()
    expect(within(lead).getByRole('heading', { name: /EMPIEZA A TU RITMO/i })).toBeInTheDocument()
    expect(within(lead).getByLabelText('Contacto voluntario')).toBeInTheDocument()
    expect(within(lead).getByRole('link', { name: /ESCRÍBEME POR WHATSAPP/i }).getAttribute('href')).toContain('https://wa.me/')
  })
})
