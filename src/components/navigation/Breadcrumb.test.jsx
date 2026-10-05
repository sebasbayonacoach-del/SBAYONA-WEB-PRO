import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Breadcrumb from './Breadcrumb.jsx'

/**
 * Fase 4: contrato del sistema de POSICIÓN (miga de pan visible).
 * El dato viene de routeMeta.js (el mismo que alimenta el JSON-LD), así que
 * estos tests fijan la decisión de visibilidad por ruta, no el contenido del
 * trail, que ya está cubierto por los tests de routeMeta.
 */
function renderAt(pathname) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Breadcrumb />
    </MemoryRouter>,
  )
}

function getBreadcrumb() {
  return screen.queryByRole('navigation', { name: 'Miga de pan' })
}

describe('Breadcrumb (Fase 4)', () => {
  it.each(['/parkour-academy', '/resources', '/community'])('identifica %s sin esperar al montaje de la página', (pathname) => {
    renderAt(pathname)
    expect(getBreadcrumb()).toHaveAttribute('data-route', pathname)
  })

  it.each(['/about', '/programs', '/shop'])('no monta la miga en %s porque su hero ya resuelve posición', (pathname) => {
    renderAt(pathname)
    expect(getBreadcrumb()).not.toBeInTheDocument()
  })

  it('construye trails de varios niveles en las fichas de plan', () => {
    renderAt('/plan/fuerza')

    expect(getBreadcrumb()).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Programas' })).toHaveAttribute('href', '/programs')
    expect(screen.getByText(/plan fuerza/i)).toHaveAttribute('aria-current', 'page')
  })

  it('mantiene la miga dentro del embudo: /checkout y /order-confirmation orientan, no esconden', () => {
    renderAt('/checkout')
    expect(getBreadcrumb()).toBeInTheDocument()
    expect(screen.getByText('Configurar')).toHaveAttribute('aria-current', 'page')
  })

  it('no pinta nada en la home: la raíz ya es la posición', () => {
    renderAt('/')
    expect(getBreadcrumb()).not.toBeInTheDocument()
  })

  it('no pinta nada en recepción (/onboarding y su alias /entrar) ni en la interna /design-system', () => {
    const { unmount: first } = renderAt('/onboarding')
    expect(getBreadcrumb()).not.toBeInTheDocument()
    first()

    const { unmount: second } = renderAt('/entrar')
    expect(getBreadcrumb()).not.toBeInTheDocument()
    second()

    renderAt('/design-system')
    expect(getBreadcrumb()).not.toBeInTheDocument()
  })

  it('no pinta nada en rutas desconocidas: el 404 tiene su propia recuperación', () => {
    renderAt('/esto-no-existe')
    expect(getBreadcrumb()).not.toBeInTheDocument()
  })
})
