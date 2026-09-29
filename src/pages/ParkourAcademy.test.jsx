import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ParkourAcademy from './ParkourAcademy.jsx'

vi.mock('../components/Layout.jsx', () => ({
  SectionLabel: ({ children }) => <p>{children}</p>,
}))

vi.mock('../components/SceneBackground.jsx', () => ({
  sceneBackgroundProps: (_, props) => props,
}))

// La Academy está en pre-apertura: la página publica interés, método y
// seguridad, y se niega a inventar precios, sede u horarios. Este contrato
// protege esa honestidad comercial.
describe('Parkour Academy — pre-apertura honesta', () => {
  it('presenta el hero del método y el registro de interés como acción principal', () => {
    render(<MemoryRouter><ParkourAcademy /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: /LA CIUDAD/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /EMPEZAMOS JUNTOS/i })[0]).toHaveAttribute('href', expect.stringContaining('https://wa.me/'))
    expect(screen.getByText(/Interés abierto · Sin pago · Sede y horarios por confirmar/i)).toBeInTheDocument()
  })

  it('expone rutas, niveles y principios sin prometer resultados ni plazas', () => {
    const { container } = render(<MemoryRouter><ParkourAcademy /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: /NO HAY UN CUERPO IDEAL/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /TRES NIVELES/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /VALENTÍA NO ES/i })).toBeInTheDocument()
    expect(screen.queryByText(/\$\d{2,3}\.000 COP\/(mes|sesión)/i)).not.toBeInTheDocument()

    // REVISIÓN 2026-09-19 · el dueño vetó el descargo sanitario visible:
    // «nada de si tienes dolores persistentes… no quiero que pongas todo eso».
    // La seguridad se cuenta como práctica, no como aviso legal.
    expect(container.textContent).not.toMatch(/diagnóstic|diagnostic|tratamiento sanitario|atención sanitaria|dolor|médic/i)
  })

  it('declara formato, horarios y ubicación por confirmar antes de cualquier pago', () => {
    render(<MemoryRouter><ParkourAcademy /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: /DEJA TU INTERÉS/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Por confirmar/i).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/La sede exacta se comunica antes de cualquier reserva o pago\./i)).toBeInTheDocument()
  })
})
