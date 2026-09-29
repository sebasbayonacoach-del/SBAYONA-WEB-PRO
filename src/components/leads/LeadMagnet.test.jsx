import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import LeadMagnet, { LEADS_KEY } from './LeadMagnet.jsx'

function renderMagnet() {
  return render(
    <MemoryRouter>
      <LeadMagnet />
    </MemoryRouter>,
  )
}

describe('LeadMagnet — embudo freemium', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('pide nombre + contacto y ofrece la rutina gratis', () => {
    renderMagnet()

    expect(screen.getByRole('heading', { level: 2, name: /tu primera acción clara, gratis/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo o whatsapp/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /quiero mi primera rutina/i })).toBeInTheDocument()
  })

  it('explica en castellano qué falta cuando los datos no valen', () => {
    renderMagnet()

    fireEvent.click(screen.getByRole('button', { name: /quiero mi primera rutina/i }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/escribe tu nombre/i)
    expect(alert).toHaveTextContent(/correo válido o un whatsapp válido/i)
    expect(window.localStorage.getItem(LEADS_KEY)).toBeNull()
  })

  it('guarda el lead en la cola local y confirma sin recargar', () => {
    renderMagnet()

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/correo o whatsapp/i), { target: { value: 'ana@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /quiero mi primera rutina/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/listo, ana/i)
    const queue = JSON.parse(window.localStorage.getItem(LEADS_KEY))
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ name: 'Ana', contact: 'ana@example.com', source: 'lead-magnet' })
  })
})
