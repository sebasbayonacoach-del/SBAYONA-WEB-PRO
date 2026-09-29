/**
 * Guardia de ruta (Fase 2 SaaS).
 *
 * Si la sesión terminó de cargar y no hay usuario, redirige a
 * `/entrar?next=<ruta>` para volver aquí después de entrar.
 * Se aplica SOLO a `/app` y `/checkout`; el resto sigue público.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext.jsx'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="section-shell" role="status" aria-live="polite" style={{ padding: '4rem 0' }}>
        <p>Cargando tu acceso…</p>
      </div>
    )
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/entrar?next=${next}`} replace />
  }

  return children
}
