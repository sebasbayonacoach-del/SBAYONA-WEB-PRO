import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import BayonaLiveAppShowcase from './BayonaLiveAppShowcase.jsx'
import { BAYONA_APP_ENTRY_URL, BAYONA_APP_PUBLIC_URL } from '../../config/bayonaAppIntegration.js'

const renderShowcase = (placement) => render(<MemoryRouter><BayonaLiveAppShowcase placement={placement} /></MemoryRouter>)

describe('Puente BAYONA WEB → la aplicación REAL', () => {
  it('abre el selector real de perfiles y nunca intenta embeber una app que prohíbe iframe', () => {
    const {container} = renderShowcase('app')
    const section = container.querySelector('#bayona-app-real')
    expect(section).not.toBeNull()
    expect(container.querySelector('iframe')).toBeNull()
    expect(BAYONA_APP_ENTRY_URL).toBe(`${BAYONA_APP_PUBLIC_URL}?source=pwa`)
    expect(within(section).getByRole('heading', { level: 2, name: /YA NO ES SOLO UNA IDEA/i })).toBeInTheDocument()
    expect(section.querySelectorAll('a[href^="https://"]')).toHaveLength(3)
    for (const link of section.querySelectorAll('a[href^="https://"]')) {
      expect(link).toHaveAttribute('href', BAYONA_APP_ENTRY_URL)
      expect(link).toHaveAttribute('target','_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    }
  })

  it('mantiene Mi App para personas que entrenan y Coach Studio como perfiles distintos', () => {
    renderShowcase('app')
    expect(screen.getByRole('heading', {name:'Tu espacio personal'})).toBeInTheDocument()
    expect(screen.getByRole('heading', {name:'Tu espacio de entrenador'})).toBeInTheDocument()
    expect(screen.getByText(/no hace falta ser atleta/i)).toBeInTheDocument()
    expect(screen.getByText(/La integración con las membresías/i)).toBeInTheDocument()
  })

  it('en Home enlaza tanto al producto actual como a la página de BAYONA+', () => {
    const {container} = renderShowcase('home')
    expect(container.querySelector('#bayona-app-real-home')).not.toBeNull()
    expect(screen.getByRole('link', {name:/DESCUBRIR BAYONA APP/i})).toHaveAttribute('href','/app')
    expect(screen.getByRole('link', {name:/ABRIR LA APP REAL/i})).toHaveAttribute('href',BAYONA_APP_ENTRY_URL)
    expect(screen.getByAltText(/Captura real de BAYONA App/i)).toHaveAttribute('src',expect.stringContaining('bayona-live-app'))
  })
})
