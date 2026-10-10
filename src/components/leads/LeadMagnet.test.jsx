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
    expect(screen.getByRole('heading', { level: 2, name: /tu primer paso ya cuenta/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo o whatsapp/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /quiero mis tres recursos/i })).toBeInTheDocument()
  })

  it('explica qué falta sin guardar datos inválidos', () => {
    renderMagnet()
    fireEvent.click(screen.getByRole('button', { name: /quiero mis tres recursos/i }))
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/cuéntame cómo te llamas/i)
    expect(alert).toHaveTextContent(/revisa tu correo o número de whatsapp/i)
    expect(window.localStorage.getItem(LEADS_KEY)).toBeNull()
  })

  it('guarda el lead y entrega tres descargas más la solicitud de valoración', () => {
    renderMagnet()
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/correo o whatsapp/i), { target: { value: 'ana@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /quiero mis tres recursos/i }))

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/Gracias por confiar, Ana/i)
    const downloads = within(status).getAllByRole('link', { name: /DESCARGAR/i })
    expect(downloads).toHaveLength(3)
    downloads.forEach((link) => expect(link).toHaveAttribute('download'))
    expect(within(status).getByRole('link', { name: /SOLICITAR UNA VALORACIÓN/i }).getAttribute('href')).toContain('https://wa.me/')
    expect(within(status).getByRole('link', { name: /CONOCER MIS OPCIONES/i })).toHaveAttribute('href', '/programs')

    const queue = JSON.parse(window.localStorage.getItem(LEADS_KEY))
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ name: 'Ana', contact: 'ana@example.com', source: 'lead-magnet' })
  })
})
