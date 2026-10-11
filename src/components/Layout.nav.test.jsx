import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Footer, Navbar } from './Layout.jsx'

const DESKTOP_LABELS = ['Nosotros', 'Servicios', 'Parkour', 'Comunidad', 'BAYONA+', 'Tienda', 'Recursos']

describe('Navbar — Gym Funnel V2', () => {
  it('presenta siete destinos en el orden real del recorrido', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((link) => link.textContent.trim())).toEqual(DESKTOP_LABELS)
    expect(nav.textContent).not.toMatch(/RECORRIDO|ECOSISTEMA|DECIDIR|PROGRAMAS/i)
  })

  it('usa Empieza gratis como CTA y no muestra Mi cuenta', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Empieza gratis con BAYONA/i })).toHaveAttribute('href', '/#empieza')
    expect(screen.queryByRole('link', { name: /Mi cuenta/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /Entrar a BAYONA/i })).toBeNull()
  })

  it('solo muestra el carrito en contexto de tienda', () => {
    const { unmount } = render(<MemoryRouter initialEntries={['/']}><Navbar /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: /Abrir carrito/i })).toBeNull()
    unmount()

    render(<MemoryRouter initialEntries={['/shop']}><Navbar /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /Abrir carrito/i })).toBeInTheDocument()
  })

  it('abre un menú móvil con Inicio, siete destinos, Preguntas y CTA', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    const mobile = screen.getByRole('navigation', { name: 'Navegación móvil' })
    const navList = mobile.querySelector('.gym-mobile-nav-list')
    expect(within(navList).getAllByRole('link')).toHaveLength(9)
    expect(within(navList).getByRole('link', { name: /Inicio/i })).toHaveAttribute('href', '/')
    expect(within(navList).getByRole('link', { name: /Preguntas/i })).toHaveAttribute('href', '/faq')
    expect(within(navList).getAllByRole('link').map((link) => link.textContent.trim().replace(/^\d+/, ''))).toEqual(['Inicio', ...DESKTOP_LABELS, 'Preguntas'])
    expect(mobile.textContent).not.toMatch(/RECORRIDO|ECOSISTEMA|DECIDIR|MI CUENTA/i)
    expect(within(mobile).getByRole('link', { name: /EMPIEZA GRATIS/i })).toHaveAttribute('href', '/#empieza')
    expect(within(mobile).getByRole('link', { name: /HABLAR POR WHATSAPP/i }).getAttribute('href')).toContain('https://wa.me/')
  })
})

describe('Footer — Gym Funnel V2', () => {
  it('repite una arquitectura simple sin registro ni onboarding', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    const explore = screen.getByRole('navigation', { name: 'Explorar BAYONA' })
    DESKTOP_LABELS.forEach((label) => {
      expect(within(explore).getByRole('link', { name: label })).toBeInTheDocument()
    })
    expect(screen.queryByRole('link', { name: /MI CUENTA|ENTRAR A BAYONA/i })).toBeNull()
    expect(screen.getByRole('link', { name: 'RECIBIR MIS RECURSOS' })).toHaveAttribute('href', '/#empieza')
  })
})
