import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AuthContext from '../../lib/auth/AuthContext.jsx'
import RequireAuth from './RequireAuth.jsx'

function renderGuarded(authValue, initialEntry = '/app') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthContext.Provider value={authValue}>
        <Routes>
          <Route path="/app" element={<RequireAuth><p>Contenido privado</p></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><p>Caja privada</p></RequireAuth>} />
          <Route path="/entrar" element={<p>Pantalla de acceso</p>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

const LOGGED_OUT = {
  user: null,
  tier: 'free',
  loading: false,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => ({}),
}

describe('RequireAuth — guardia de /app y /checkout', () => {
  it('muestra espera mientras la sesión carga', () => {
    renderGuarded({ ...LOGGED_OUT, loading: true })

    expect(screen.getByRole('status')).toHaveTextContent(/cargando tu acceso/i)
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })

  it('redirige a /entrar?next=/app cuando no hay usuario', () => {
    renderGuarded(LOGGED_OUT, '/app')

    expect(screen.getByText('Pantalla de acceso')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })

  it('conserva la ruta de caja en el next de la redirección', () => {
    renderGuarded(LOGGED_OUT, '/checkout')

    expect(screen.getByText('Pantalla de acceso')).toBeInTheDocument()
    expect(screen.queryByText('Caja privada')).not.toBeInTheDocument()
  })

  it('deja pasar al contenido cuando hay sesión', () => {
    renderGuarded({
      ...LOGGED_OUT,
      user: { id: 'local-1', email: 'test@example.com' },
    })

    expect(screen.getByText('Contenido privado')).toBeInTheDocument()
    expect(screen.queryByText('Pantalla de acceso')).not.toBeInTheDocument()
  })
})
