import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Resources from './Resources.jsx'

function renderPage() {
  return render(
    <MemoryRouter>
      <Resources />
    </MemoryRouter>,
  )
}

// "Empieza Gratis" se sostiene en tres pilares honestos: reglas por escrito
// antes del reto, una revista viva en lugar de calendarios inventados y una
// consulta por WhatsApp que el usuario revisa antes de enviar.
//
// 22-09 (lane C): §19 y las anotaciones 56-59 piden biblioteca premium y un
// reto reescrito. Cambia el copy literal que estaba fijado, no el contrato:
// siguen teniendo que existir dos salidas internas reales, las reglas visibles
// antes de entrar y cero promesas vacías.
describe('/resources — Empieza Gratis honesto', () => {
  it('presenta el hero con dos salidas internas verificables', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: /RECURSOS QUE\s*PARECEN DE PAGO/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /VER DOSSIER 30 DÍAS/i })).toHaveAttribute('href', '#reto')
    expect(screen.getByRole('link', { name: /ABRIR BIBLIOTECA/i })).toHaveAttribute('href', '#revista')
  })

  it('presenta las tres piezas de entrada como tarjetas visuales navegables', () => {
    const { container } = renderPage()

    const library = container.querySelector('.resources-hero-library')
    expect(library).not.toBeNull()
    expect(library.querySelectorAll('.resources-hero-library-visual')).toHaveLength(3)
    expect(screen.getByRole('link', { name: /presentación del Protocolo BAYONA de 7 días/i })).toHaveAttribute('href', '#revista')
    expect(screen.getByRole('link', { name: /presentación del Workbook BAYONA de 30 días/i })).toHaveAttribute('href', '#reto')
    expect(screen.getByRole('link', { name: /presentación de la consulta experta gratuita/i })).toHaveAttribute('href', '#question-title')
  })

  it('anuncia el Reto 30 días con sus reglas visibles antes de empezar', () => {
    const { container } = renderPage()

    const challenge = container.querySelector('#reto')
    expect(challenge).not.toBeNull()
    expect(within(challenge).getByRole('heading', { name: /30 DÍAS\.\s*UN WORKBOOK, NO UNA PROMESA\./i })).toBeInTheDocument()
    expect(challenge.textContent).toContain('REGLAS CLARAS.')
    expect(challenge.textContent).toContain('CONSULTAR CONDICIONES')

    // §19: lo que puedes mandar durante el reto está nombrado (sesión, foto,
    // comida o duda), no escondido dentro de las condiciones.
    for (const kind of ['SESIÓN', 'FOTO', 'COMIDA', 'DUDA']) {
      expect(within(challenge).getByText(kind)).toBeInTheDocument()
    }

    // La recompensa se nombra —puede ser un programa personalizado— y sigue
    // condicionada a lo que la edición confirme por escrito.
    expect(challenge.textContent).toContain('PLAN PERSONALIZADO')
    expect(challenge.textContent).toMatch(/se comunica por escrito antes de entrar/i)

    // Sin promesas de resultado ni lenguaje médico en la sección del reto.
    expect(challenge.textContent).not.toMatch(/garantizamos|transformación asegurada|cura|diagnóstico/i)
  })

  it('ofrece la revista como guía web viva, sin descargas simuladas ni calendario inventado', () => {
    const { container } = renderPage()

    const magazine = container.querySelector('#revista')
    expect(magazine).not.toBeNull()
    expect(magazine.querySelector('#magazine-title')).not.toBeNull()
    expect(magazine.textContent).toContain('NO UN CALENDARIO RÍGIDO.')

    // El material se presenta antes de la captura y los tres CTA llevan al mismo formulario.
    expect(magazine.querySelector('#downloads-title')).not.toBeNull()
    expect(magazine.querySelectorAll('a[download]')).toHaveLength(0)
    const giftLinks = [...magazine.querySelectorAll('.resources-downloads a[href="#resources-lead"]')]
    expect(giftLinks).toHaveLength(3)
    expect(document.querySelector('#resources-lead')).not.toBeNull()
  })

  it('prepara la consulta con contexto y bloquea datos sensibles antes de WhatsApp', () => {
    renderPage()

    // La página explica el trato de datos antes de pedir nada.
    expect(screen.getAllByText(/Evita incluir información médica sensible\./i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Nada se envía solo\. Tú revisas el mensaje y decides abrir WhatsApp\./i)).toBeInTheDocument()
  })

  it('cierra en captación y servicios sin duplicar un directorio de redes', () => {
    const { container } = renderPage()

    expect(container.querySelector('.resources-channels')).toBeNull()
    expect(container.querySelector('.resources-decision')).toBeNull()
    expect(container.querySelector('#resources-lead')).not.toBeNull()
    expect(container.textContent).not.toMatch(/\d+[.,]\d+\s*(seguidores|followers)/i)
  })
})
