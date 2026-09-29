import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanCalculator from './PlanCalculator.jsx'

describe('PlanCalculator', () => {
  it('consume los planes compartidos y actualiza el total y WhatsApp', () => {
    render(<PlanCalculator />)

    expect(screen.getByRole('group', { name: /elige tu plan base/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /añade clases extra/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /completa tu arsenal/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /RAÍZ.*\$149\.000/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /FUERZA.*\$299\.000/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /RENDIMIENTO.*\$499\.000/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /ELITE.*\$899\.000/i })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: /clase virtual 1:1/i }), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /masaje deportivo/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /^biohacking/i }))

    // RAÍZ 149.000 + 2×35.000 + masaje 80.000 + biohacking 50.000
    expect(screen.getByText('$349.000 COP/mes')).toBeInTheDocument()
    const whatsapp = screen.getByRole('link', { name: /dar el primer paso/i })
    const decodedUrl = decodeURIComponent(whatsapp.getAttribute('href'))
    expect(decodedUrl).toContain('Mi camino: $349.000 COP')
    expect(decodedUrl).toContain('- Masaje deportivo: $80.000')
    expect(decodedUrl).toContain('- Biohacking: $50.000')
  })

  it('explica la disponibilidad presencial sin descargos sanitarios en pantalla', () => {
    render(<PlanCalculator />)

    expect(screen.getAllByText(/sujeto a ubicación y disponibilidad/i).length).toBeGreaterThan(0)
    // REVISIÓN 2026-09-19 · el dueño vetó el descargo sanitario visible. La nota
    // sigue en el documento legal (COMMERCIAL_SCOPE_NOTICE); aquí ya no se pinta.
    expect(document.body.textContent).not.toMatch(
      /sin diagnóstico, cura ni promesas médicas|atención sanitaria|no sustituye|médic|marco no médico/i,
    )
    expect(document.body.textContent).not.toMatch(/devolución|30 días|cura garantizada|resultado garantizado/i)
  })
})
