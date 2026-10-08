/**
 * Pantalla de acceso `/entrar` (Fase 2 SaaS).
 *
 * Formulario de correo + contraseña con pestañas Entrar / Crear cuenta.
 * Usa `useAuth()` (modo local de invitado o nube Supabase) y muestra los
 * errores ya traducidos al castellano. La recuperación es solo visual:
 * sin backend de email, se deriva al canal manual.
 */
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth/AuthContext.jsx'
import { isCloudEnabled } from '../lib/supabase.js'
import { useRewards, ARRIVAL_BONUS_EUR } from '../lib/rewards/RewardsProvider.jsx'
import HiddenSealGift from '../components/rewards/HiddenSealGift.jsx'
import { whatsAppLink } from '../config/site.config.js'
import WhatsAppMark from '../components/companion/WhatsAppMark.jsx'
import '../styles/auth-members.css'

const RECOVER_URL = whatsAppLink('Hola BAYONA, necesito recuperar el acceso a mi cuenta.')

/** Cuántas piezas del recorrido hay que descubrir antes de cerrar la puerta. */
const TOTAL_PIECES = 3

function safeNext(raw) {
  if (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) return raw
  return '/app'
}

export default function Entrar() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth()
  const { bonusClaimed, sealCount, pendingSealCount, claimedSealCount, totalEur, shareClaimed, format } =
    useRewards()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const next = safeNext(searchParams.get('next'))

  /*
    La puerta final se mira lo que la persona YA reclamó (§6 y §7 de la
    dirección de producto). No se canta una victoria que no ocurrió: si el pase
    sigue pendiente, se dice que faltan piezas y se invita a volver al recorrido
    antes de crear la cuenta.
  */
  const sellosReclamados = sealCount > 0 && pendingSealCount === 0
  const claimedPieces = [bonusClaimed, sellosReclamados, shareClaimed].filter(Boolean).length
  const missingPieces = Math.max(0, TOTAL_PIECES - claimedPieces)
  const cloud = isCloudEnabled()

  const [mode, setMode] = useState('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showRecover, setShowRecover] = useState(false)
  const [googleNote, setGoogleNote] = useState('')

  if (loading) {
    return (
      <div className="entrar-page">
        <div className="entrar-loading section-shell" role="status" aria-live="polite">
          <p className="eyebrow"><span />BAYONA OS</p>
          <h1>Preparando tu acceso.</h1>
          <p>Estamos verificando tu sesión para abrir tu panel sin ruido.</p>
        </div>
      </div>
    )
  }

  if (user) return <Navigate to={next} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const action = mode === 'in' ? signIn : signUp
      const { user: nextUser, error: authError } = await action(email, password)
      if (authError) {
        setError(authError)
        return
      }
      if (nextUser) {
        navigate(next, { replace: true })
        return
      }
      setError('No se pudo abrir tu acceso. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setGoogleNote('')
    setShowRecover(false)
  }

  async function handleGoogle() {
    setError('')
    setGoogleNote('')
    setBusy(true)
    try {
      const result = await signInWithGoogle()
      if (result?.pendingSetup) {
        setGoogleNote(
          'El acceso con Google se activa al conectar la nube. De momento crea tu cuenta con correo y entra igual.',
        )
        return
      }
      if (result?.error) {
        setError(result.error)
        return
      }
      if (result?.redirected) {
        setGoogleNote('Abriendo Google para confirmar tu acceso…')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="entrar-page">
      <div className="section-shell entrar-shell">
        <section className="entrar-command" aria-labelledby="entrar-command-title">
          <p className="eyebrow"><span />DEJA DE EMPEZAR DE CERO</p>
          <h1 id="entrar-command-title">Todo tu proceso, por fin en un solo lugar.</h1>
          <p>
            El problema no es que te falten ganas: es tener rutinas, notas y decisiones
            repartidas por todas partes. Tu cuenta BAYONA reúne lo que haces, lo que
            has aprendido y el siguiente paso que sí puedes sostener.
          </p>

          <div className="entrar-vault" aria-label="Resumen de piezas del recorrido">
            <article>
              <span>Crédito BAYONA</span>
              <strong>{bonusClaimed ? format(totalEur) : 'Pendiente'}</strong>
              <small>
                {bonusClaimed
                  ? 'Listo para aplicar al primer paso.'
                  : `Reclama el pase de ${format(ARRIVAL_BONUS_EUR)} antes de cerrar.`}
              </small>
            </article>
            <article>
              <span>Sellos del recorrido</span>
              <strong>
                {claimedSealCount}/{sealCount}
              </strong>
              <small>
                {sealCount === 0
                  ? 'Aún puedes descubrir más piezas escondidas.'
                  : pendingSealCount > 0
                    ? `${pendingSealCount} ${pendingSealCount === 1 ? 'sello pendiente' : 'sellos pendientes'}: hay que reclamarlos, no se suman solos.`
                    : 'Encontrados y reclamados: ya están dentro del crédito.'}
              </small>
            </article>
            <article>
              <span>Invitación compartida</span>
              <strong>{shareClaimed ? 'Sumada' : 'Disponible'}</strong>
              <small>{shareClaimed ? 'El extra por compartir ya quedó registrado.' : 'Comparte BAYONA para sumar crédito.'}</small>
            </article>
          </div>

          <p className={`entrar-verdict${claimedPieces > 0 ? ' is-open' : ''}`}>
            {claimedPieces > 0 ? (
              <>
                <strong>Ya tienes material guardado en esta visita.</strong>{' '}
                Crea tu cuenta para conservarlo y continuar desde tu centro de mando.
              </>
            ) : (
              <>
                <strong>Aún quedan piezas por descubrir.</strong> Puedes crear cuenta ahora, pero si
                completas el recorrido llegarás con más recursos desbloqueados.
              </>
            )}
          </p>
          <p className="entrar-count">
            {missingPieces > 0
              ? `Te faltan ${missingPieces} ${missingPieces === 1 ? 'pieza' : 'piezas'} por reclamar: el pase de llegada, los sellos de las estaciones y la invitación por compartir.`
              : 'Tienes las tres piezas del recorrido. Solo falta que las guarde una cuenta.'}
          </p>
          <div className="entrar-progress" role="img" aria-label={`${claimedPieces} de ${TOTAL_PIECES} piezas del recorrido reclamadas`}>
            {Array.from({ length: TOTAL_PIECES }, (unused, index) => (
              <span key={index} className={index < claimedPieces ? 'is-filled' : ''} aria-hidden="true" />
            ))}
          </div>

          {/*
            Demo / real (§7 y comentario 63): la visita es un dato auténtico de
            ESTE dispositivo, no una maqueta; lo que todavía no está conectado
            se dice, no se simula.
          */}
          <p className="entrar-scope" data-tone={cloud ? 'cloud' : 'local'}>
            <span>{cloud ? 'CUENTA CONECTADA' : 'MODO LOCAL EN ESTE DISPOSITIVO'}</span>
            {cloud
              ? 'Tus recursos, créditos y compras quedan en tu cuenta. Los pagos y la mensajería con tu entrenador se cierran igualmente con una persona.'
              : 'Lo que ves aquí es tu visita real: vive en este navegador y desaparece al borrar los datos del sitio. Todavía no hay pedidos pagos simulados ni historial en la nube.'}
          </p>

          <ul className="entrar-locker" aria-label="Qué se guarda en tu cuenta">
            <li><span />Recursos y dossiers que reclames</li>
            <li><span />Créditos, cupones y consultas pendientes</li>
            <li><span />Compras, sesiones y planes activos</li>
            <li><span />Acceso a BAYONA+ cuando esté disponible</li>
          </ul>

          <div className="entrar-exit">
            <Link className="entrar-exit-link" to="/app">
              Ver BAYONA+ (acceso prioritario)
            </Link>
            <Link className="entrar-exit-link" to="/shop">
              Ir a la tienda
            </Link>
            <Link className="entrar-exit-link" to="/resources">
              Seguir descubriendo piezas
            </Link>
          </div>

          {/*
            Comentario 13: el regalo escondido. Un disco sin rótulo, al pie de la
            puerta final; solo existe para quien lo ve y lo pulsa. Aquí no se
            suma nada por leer la página (§6), y el sello va a parar al mismo
            pase del recorrido.
          */}
          <HiddenSealGift
            id="secreto-cierre"
            label="Pieza escondida en la puerta final"
            eur={4}
            className="seal-gift-wrap--flow"
          />
        </section>

        <div className="entrar-card">
          <p className="eyebrow"><span />BAYONA OS · ACCESO</p>
          <h2>{mode === 'in' ? 'Retoma justo donde lo dejaste.' : 'Activa tu espacio. Deja de entrenar sin dirección.'}</h2>
          <p className="entrar-lead">
            Entra para ver una sola ruta: qué toca hoy, qué has avanzado y qué debe ajustarse después.
          </p>

          <div className="entrar-tabs" role="tablist" aria-label="Entrar o crear cuenta">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'in'}
              onClick={() => switchMode('in')}
            >
              ENTRAR
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'up'}
              onClick={() => switchMode('up')}
            >
              CREAR CUENTA
            </button>
          </div>

          <form className="entrar-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="entrar-email">CORREO</label>
            <input
              id="entrar-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
            />
            <label htmlFor="entrar-password">CONTRASEÑA</label>
            <input
              id="entrar-password"
              name="password"
              type="password"
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
            />
            {error !== '' && (
              <p className="entrar-errors" role="alert">{error}</p>
            )}
            <button type="submit" className="gold-button" disabled={busy}>
              {busy ? 'ABRIENDO…' : mode === 'in' ? 'ENTRAR' : 'CREAR MI CUENTA'}
            </button>
          </form>

          <div className="entrar-divider" aria-hidden="true"><span>o continúa con</span></div>
          <button
            type="button"
            className="entrar-google"
            onClick={handleGoogle}
            disabled={busy}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1z" />
              <path fill="#EA4335" d="M12 4.76c1.76 0 3.3.6 4.53 1.79l3.4-3.4C17.96 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.1c.95-2.85 3.6-4.96 6.73-4.96z" />
            </svg>
            Seguir con Google
          </button>
          {googleNote !== '' && (
            <p className="entrar-note" role="status">{googleNote}</p>
          )}

          <p className="entrar-recover">
            <button type="button" onClick={() => setShowRecover((current) => !current)} aria-expanded={showRecover}>
              ¿Olvidaste tu contraseña?
            </button>
            {showRecover && (
              <span className="entrar-recover-note" role="status">
                Recuperación manual y segura:{' '}
                <a className="entrar-wa-inline" href={RECOVER_URL} target="_blank" rel="noopener noreferrer">
                  <WhatsAppMark size={15} />
                  HABLAR POR WHATSAPP
                </a>{' '}
                y verificamos tu acceso contigo.
              </span>
            )}
          </p>

          {/*
            §8: WhatsApp es el cierre humano y tiene que parecer WhatsApp (logo
            real + texto explícito), no otro globo de chat. Diferente del
            asistente de la web, que responde con lo publicado.
          */}
          <a
            className="entrar-wa"
            href={whatsAppLink('Hola BAYONA, quiero abrir mi cuenta y tengo una duda antes de registrarme.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppMark size={17} />
            <span>
              <strong>HABLAR POR WHATSAPP</strong>
              <small>Con una persona, antes o después de crear la cuenta.</small>
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
