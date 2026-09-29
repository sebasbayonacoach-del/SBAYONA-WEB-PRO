import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthContext from '../lib/auth/AuthContext.jsx'
import AppExperience from './AppExperience.jsx'

function renderAsMember() {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          user: { id: 'local-1', email: 'test@example.com' },
          tier: 'free',
          loading: false,
          signUp: async () => ({}),
          signIn: async () => ({}),
          signOut: vi.fn(async () => ({ error: null })),
        }}
      >
        <AppExperience />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('/app — opt-in de avisos (sin Firebase)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('muestra el botón ACTIVAR AVISOS junto a recursos', () => {
    renderAsMember()
    expect(screen.getByRole('heading', { name: /recursos gratis/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /activar avisos/i })).toBeInTheDocument()
  })

  it('el clic sin claves no rompe y avisa de no disponible', async () => {
    renderAsMember()
    fireEvent.click(screen.getByRole('button', { name: /activar avisos/i }))
    expect(
      await screen.findByText(/no están disponibles en este dispositivo/i),
    ).toBeInTheDocument()
  })
})
