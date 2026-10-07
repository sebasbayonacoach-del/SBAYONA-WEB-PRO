import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import LeadMagnet, { LEADS_KEY } from './LeadMagnet.jsx'

function renderMagnet() {
  return render(<MemoryRouter><LeadMagnet /></MemoryRouter>)
}

describe('LeadMagnet — captura, recursos y valoración', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('pide solo nombre y contacto', () => {
    renderMagnet()
    expect(screen.getByRole('heading', { level: 2, name: /empieza gratis/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo o whatsapp/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /recibir mis recursos/i })).toBeInTheDocument()
  })

  it('explica qué falta sin guardar datos inválidos', () => {
    renderMagnet()
    fireEvent.click(screen.getByRole('button', { name: /recibir mis recursos/i }))
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/escribe tu nombre/i)
    expect(alert).toHaveTextContent(/correo válido o un whatsapp válido/i)
    expect(window.localStorage.getItem(LEADS_KEY)).toBeNull()
  })

  it('guarda el lead y entrega tres descargas más la solicitud de valoración', () => {
    renderMagnet()
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/correo o whatsapp/i), { target: { value: 'ana@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /recibir mis recursos/i }))

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/Listo, Ana/i)
    const downloads = within(status).getAllByRole('link', { name: /DESCARGAR/i })
    expect(downloads).toHaveLength(3)
    downloads.forEach((link) => expect(link).toHaveAttribute('download'))
    expect(within(status).getByRole('link', { name: /AGENDAR VALORACIÓN/i })).toHaveAttribute('href', expect.stringContaining('https://wa.me/'))
    expect(within(status).getByRole('link', { name: /VER SERVICIOS/i })).toHaveAttribute('href', '/programs')

    const queue = JSON.parse(window.localStorage.getItem(LEADS_KEY))
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ name: 'Ana', contact: 'ana@example.com', source: 'lead-magnet' })
  })
})
