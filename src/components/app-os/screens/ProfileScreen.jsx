/**
 * BAYONA OS · pantalla PROFILE.
 *
 * Identidad, membresía, estado real del producto y cuenta. Nada de página
 * administrativa: solo lo que la persona necesita entender de su situación.
 *
 * Honestidad: la matriz de beneficios de los cuatro planes sigue PENDIENTE
 * de decisión del propietario, así que aquí no se enumeran ventajas por
 * plan. Se enlaza a los precios publicados y se dice la verdad.
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Mail, ShieldCheck } from 'lucide-react'
import { DataBadge } from '../StateBlock.jsx'

export function ProfileScreen({ data }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const { user, tierLabel, name, paid, sources, localSessions, logs } = data

  async function handleSignOut() {
    if (busy) return
    setBusy(true)
    await data.signOutClean()
    setBusy(false)
    navigate('/', { replace: true })
  }

  return (
    <div className="os-screen">
      <header className="os-screen__head">
        <p className="os-label">PERFIL</p>
        <h1 className="os-screen__title">IDENTIDAD BAYONA</h1>
      </header>

      <section className="os-panel" aria-labelledby="os-identity-title">
        <div className="os-panel__head">
          <h2 id="os-identity-title">IDENTIDAD</h2>
          <DataBadge tone={sources.identity === 'cloud' ? 'real' : 'empty'}>
            {sources.identity === 'cloud' ? 'Cuenta conectada' : 'Sesión local'}
          </DataBadge>
        </div>
        <dl className="os-defs">
          <div>
            <dt>Nombre</dt>
            <dd>{name || 'No indicado en tu cuenta'}</dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd className="os-defs__mail">
              <Mail size={14} strokeWidth={1.6} aria-hidden="true" />
              {user?.email || 'Sin correo en este dispositivo'}
            </dd>
          </div>
        </dl>
        {sources.identity !== 'cloud' ? (
          <p className="os-panel__foot">
            Estás en modo local: tu marca de sesiones vive en este dispositivo y
            no viaja a ningún servidor. <Link className="os-link" to="/entrar">Entrar con una cuenta</Link>
          </p>
        ) : null}
      </section>

      <section className="os-panel" aria-labelledby="os-membership-title">
        <div className="os-panel__head">
          <h2 id="os-membership-title">MEMBRESÍA</h2>
          <DataBadge tone={sources.tier === 'cloud' ? 'real' : 'empty'} />
        </div>
        <p className="os-membership">
          <span className="os-membership__label">PLAN</span>
          <strong className="os-membership__value">{tierLabel}</strong>
        </p>
        <p className="os-panel__foot">
          {paid
            ? 'Tu plan consta como activo en tu cuenta.'
            : 'Con el plan gratuito accedes a recursos abiertos y comunidad. Los acompañamientos de pago se consultan y confirman por WhatsApp, no por esta pantalla.'}
        </p>
        <p className="os-panel__foot">
          El detalle operativo de cada plan se consulta en la página de programas.
          Aquí solo aparece el estado real de tu cuenta.
        </p>
        <ul className="os-plain-list">
          <li><Link className="os-link" to="/programs">Ver acompañamientos publicados</Link></li>
          <li><Link className="os-link" to="/faq">Preguntas frecuentes</Link></li>
        </ul>
      </section>

      <section className="os-panel" aria-labelledby="os-product-title">
        <div className="os-panel__head">
          <h2 id="os-product-title">ESTADO DEL PRODUCTO</h2>
          <DataBadge tone="concept" />
        </div>
        <p className="os-panel__intro">
          Lo que este panel hace hoy:
        </p>
        <ul className="os-plain-list">
          <li>Identifica tu sesión y tu plan reales (cuenta o modo local).</li>
          <li>Registra sesiones con su fecha: {localSessions} en este dispositivo{logs.length > 0 ? `, ${logs.length} en tu cuenta` : ''}.</li>
          <li>Deriva de ese registro la lectura semanal y la racha.</li>
        </ul>
        <p className="os-panel__intro">
          Roadmap que no se simula:
        </p>
        <ul className="os-plain-list os-plain-list--muted">
          <li>Programas y ejercicios asignados por tu entrenador.</li>
          <li>Registro de series, repeticiones, peso o movilidad.</li>
          <li>Mensajería directa con tu entrenador dentro del panel.</li>
          <li>Calendario de planificación y avisos de sesión.</li>
        </ul>
      </section>

      <section className="os-panel os-panel--account" aria-labelledby="os-account-title">
        <div className="os-panel__head">
          <h2 id="os-account-title">CUENTA</h2>
          <ShieldCheck size={15} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <button type="button" className="os-cta os-cta--ghost" onClick={handleSignOut} disabled={busy}>
          <LogOut size={15} strokeWidth={1.6} aria-hidden="true" />
          {busy ? 'CERRANDO…' : 'CERRAR SESIÓN'}
        </button>
        <p className="os-panel__foot">
          Al cerrar sesión se borra el contador guardado en este dispositivo
          (es actividad personal). El historial de tu cuenta no se elimina.
        </p>
      </section>
    </div>
  )
}

export default ProfileScreen
