import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Checkout from './Checkout.jsx'
import OrderConfirmation from './OrderConfirmation.jsx'

vi.mock('../components/Layout', () => ({
  SectionLabel: ({ children }) => <p>{children}</p>,
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('flujo de solicitud por WhatsApp', () => {
  it('Checkout solicita únicamente los datos de contacto y el plan, sin campos de tarjeta', () => {
    // Fase 4: Checkout usa useSearchParams (?plan=) y necesita contexto de router.
    render(<MemoryRouter><Checkout /></MemoryRouter>)

    expect(screen.getByRole('textbox', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'WhatsApp' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(4)
    expect(screen.queryByText(/número de tarjeta|caducidad|cvc|pago seguro/i)).not.toBeInTheDocument()
  })

  it('Checkout finaliza abriendo WhatsApp con los datos introducidos y sin efectuar cobros', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<MemoryRouter><Checkout /></MemoryRouter>)

    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'Ana Pérez' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'WhatsApp' }), { target: { value: '+34 600 123 456' } })
    fireEvent.click(screen.getByRole('radio', { name: /ELITE/i }))
    fireEvent.click(screen.getByRole('button', { name: /solicitar detalles por whatsapp/i }))

    expect(open).toHaveBeenCalledTimes(1)
    const [url, target, features] = open.mock.calls[0]
    const decodedUrl = decodeURIComponent(url)
    expect(decodedUrl).toContain('https://wa.me/34641698332?text=')
    expect(decodedUrl).toContain('Nombre: Ana Pérez')
    expect(decodedUrl).toContain('Email: ana@example.com')
    expect(decodedUrl).toContain('WhatsApp: +34 600 123 456')
    expect(decodedUrl).toContain('Plan base: ELITE — $899.000 COP/mes')
    expect(target).toBe('_blank')
    expect(features).toBe('noopener,noreferrer')
    expect(screen.getByText(/No hay cobro aquí/i)).toBeInTheDocument()
    expect(document.querySelector('.cx-panel')).not.toBeInTheDocument()
  })

  it('OrderConfirmation confirma solo la recepción y deriva la conversación a WhatsApp', () => {
    render(<MemoryRouter><OrderConfirmation /></MemoryRouter>)

    /*
     * Copy de confirmación reescrita el 21-09: el titular es «TU SIGUIENTE PASO
     * ESTÁ CLARO.» (`OrderConfirmation.jsx:36`) y la frase que manda la
     * conversación a WhatsApp vive ahora en `:57`. Lo que este contrato
     * comprueba NO cambia: la página confirma recepción, deriva a WhatsApp y no
     * afirma compra. La aserción negativa de abajo (nada de «pago confirmado»,
     * «pedido confirmado» ni email enviado) sigue intacta, que es la que de
     * verdad protege la promesa de negocio.
     */
    expect(screen.getByRole('heading', { name: /tu siguiente paso está claro/i })).toBeInTheDocument()
    expect(screen.getByText(/continúan por WhatsApp/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /revisar en whatsapp/i })).toHaveAttribute('href', expect.stringContaining('https://wa.me/34641698332'))
    expect(screen.queryByText(/pedido confirmado|pago confirmado|enviado.*email/i)).not.toBeInTheDocument()
  })
})
