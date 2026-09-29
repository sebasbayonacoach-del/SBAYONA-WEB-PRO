import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthContext from '../lib/auth/AuthContext.jsx'
import AppExperience from './AppExperience.jsx'

function renderAsMember(user, tier) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          user,
          tier,
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

describe('/app — área de miembros con sesión', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saluda, muestra el plan gratis e invita a ver planes', () => {
    renderAsMember({ id: 'local-1', email: 'test@example.com' }, 'free')

    expect(screen.getByRole('heading', { level: 1, name: /hola, test@example\.com/i })).toBeInTheDocument()
    expect(screen.getByText(/tu plan:/i)).toHaveTextContent('GRATIS')
    expect(screen.getByRole('heading', { name: /mi rutina de hoy/i })).toBeInTheDocument()
    const planLinks = screen.getAllByRole('link', { name: /ver planes/i })
    expect(planLinks.length).toBeGreaterThanOrEqual(1)
    for (const link of planLinks) expect(link).toHaveAttribute('href', '/programs')
    expect(screen.getByRole('heading', { name: /mi progreso/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /recursos gratis/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salir/i })).toBeInTheDocument()
  })

  it('cuenta sesiones y las guarda en este dispositivo', () => {
    renderAsMember({ id: 'local-1', email: 'test@example.com' }, 'free')

    const countText = (value) => (_, element) => (
      element?.classList?.contains('members-progress-count')
      && element.textContent === `${value} ${value === 1 ? 'sesión' : 'sesiones'}`
    )
    expect(screen.getByText(countText(0))).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /marcar sesión de hoy/i }))
    expect(screen.getByText(countText(1))).toBeInTheDocument()
    expect(window.localStorage.getItem('bayona_progress_count')).toBe('1')
  })

  it('con plan de pago muestra la rutina de ejemplo con casillas', () => {
    renderAsMember({ id: 'local-2', email: 'fuerza@example.com' }, 'RAIZ')

    expect(screen.getByText(/tu plan:/i)).toHaveTextContent('RAIZ')
    expect(screen.getByText(/semana 1 · día a/i)).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(5)
  })
})
