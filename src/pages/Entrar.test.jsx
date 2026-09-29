import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../lib/auth/AuthContext.jsx'
import Entrar from './Entrar.jsx'

function renderEntrar(initialEntry = '/entrar') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Entrar />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('/entrar — pantalla de acceso', () => {
  beforeEach(() => {
    // `writeGuest` guarda el invitado en LOS DOS almacenes (lee `localStorage`
    // y, si está vacío, `sessionStorage`: AuthContext.jsx:23 y :37). Limpiar
    // solo uno dejaba el invitado que crea el test de "acceso local" dentro del
    // test de Google: `Entrar.jsx:46` lo veía, devolvía un `<Navigate>` y el
    // tablero de pestañas desaparecía del DOM.
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('presenta pestañas Entrar/Crear cuenta y formulario de correo + contraseña', async () => {
    renderEntrar()

    expect(await screen.findByRole('tab', { name: /entrar/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /crear cuenta/i })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByLabelText(/correo/i)).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument()
  })

  it('cambia a crear cuenta y ofrece recuperar acceso solo como aviso', async () => {
    renderEntrar()
    await screen.findByRole('tab', { name: /entrar/i })

    fireEvent.click(screen.getByRole('tab', { name: /crear cuenta/i }))
    /*
     * Titular y aviso actualizados a la copy que entró el 21-09 en `Entrar.jsx`
     * («Activa tu espacio BAYONA.» en modo alta, `Entrar.jsx:107`, y
     * «Recuperación manual y segura:», `:187`). Se sigue comprobando lo mismo:
     * que el cambio de pestaña monta el formulario de alta y que la
     * recuperación sigue siendo un aviso, no un flujo. Ninguna aserción se ha
     * aflojado: si la copy vuelve a moverse, esto se rompe otra vez a propósito.
     */
    expect(screen.getByRole('heading', { name: /activa tu espacio/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear mi cuenta/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /¿olvidaste tu contraseña\?/i }))
    expect(screen.getByText(/recuperación manual y segura/i)).toBeInTheDocument()
  })

  it('crea el acceso local y lo guarda sin recargar', async () => {
    renderEntrar()
    await screen.findByRole('tab', { name: /entrar/i })

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'secreta123' } })
    fireEvent.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => {
      const raw = window.localStorage.getItem('bayona_guest_user')
      expect(raw).toContain('test@example.com')
    })
  })

  it('ofrece seguir con Google y avisa en modo local sin romper', async () => {
    renderEntrar()
    await screen.findByRole('tab', { name: /entrar/i })

    const google = screen.getByRole('button', { name: /seguir con google/i })
    expect(google).toBeInTheDocument()
    fireEvent.click(google)

    expect(
      await screen.findByText(/el acceso con google se activa al conectar la nube/i),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })
})
