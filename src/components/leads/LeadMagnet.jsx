/**
 * LeadMagnet — embudo freemium (Fase 2 SaaS).
 *
 * Nombre + email o WhatsApp + "Quiero mi rutina gratis". Guarda en la cola
 * local `bayona_leads` y, si hay nube, inserta en la tabla `leads` con
 * `source='lead-magnet'`. Éxito en pantalla sin recargar.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingLink, isBookingEnabled } from '../../config/site.config.js'
import { isCloudEnabled, supabase } from '../../lib/supabase.js'
import { trackEvent, trackLead } from '../../lib/analytics/analytics.js'
import '../../styles/auth-members.css'

export const LEADS_KEY = 'bayona_leads'
export const LEAD_SOURCE = 'lead-magnet'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidContact(value) {
  const clean = String(value ?? '').trim()
  if (EMAIL_RE.test(clean)) return true
  const digits = clean.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

function readQueue() {
  try {
    const raw = window?.localStorage?.getItem(LEADS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function leadKey(lead) {
  return lead?.id || `${lead?.created_at ?? ''}:${lead?.contact ?? ''}`
}

function writeQueue(queue) {
  try {
    window?.localStorage?.setItem(LEADS_KEY, JSON.stringify(queue))
    return true
  } catch {
    return false
  }
}

function appendToQueue(lead) {
  const queue = readQueue()
  if (!queue.some((item) => leadKey(item) === leadKey(lead))) queue.push(lead)
  return writeQueue(queue)
}

function removeFromQueue(lead) {
  const key = leadKey(lead)
  return writeQueue(readQueue().filter((item) => leadKey(item) !== key))
}

async function insertCloudLead(lead) {
  if (!isCloudEnabled() || !supabase) return false
  try {
    const { error } = await supabase.from('leads').insert({
      id: lead.id,
      name: lead.name,
      contact: lead.contact,
      source: LEAD_SOURCE,
      created_at: lead.created_at,
    })
    // 23505 = el mismo UUID ya fue guardado en un intento anterior. Para la
    // cola de reintento cuenta como éxito: no creamos un segundo lead.
    return !error || error.code === '23505'
  } catch {
    return false
  }
}

async function flushPendingLeads() {
  if (!isCloudEnabled() || !supabase) return
  const queue = readQueue()
  for (const lead of queue) {
    const saved = await insertCloudLead(lead)
    if (saved) removeFromQueue(lead)
  }
}

export default function LeadMagnet({
  heading = 'Empieza gratis.',
  copy = 'Déjanos tu nombre y un contacto. Tus recursos quedan disponibles al instante y puedes pedir una valoración sin compromiso.',
}) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [errors, setErrors] = useState([])
  const [done, setDone] = useState(false)
  const [captureState, setCaptureState] = useState('idle')

  useEffect(() => {
    flushPendingLeads()
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = []
    if (String(name).trim().length < 2) nextErrors.push('Escribe tu nombre.')
    if (!isValidContact(contact)) nextErrors.push('Escribe un correo válido o un WhatsApp válido.')
    setErrors(nextErrors)
    if (nextErrors.length > 0) return

    const lead = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: String(name).trim(),
      contact: String(contact).trim(),
      source: LEAD_SOURCE,
      created_at: new Date().toISOString(),
    }
    appendToQueue(lead)
    setDone(true)
    trackLead({ source: LEAD_SOURCE })

    if (isCloudEnabled()) {
      setCaptureState('sending')
      insertCloudLead(lead).then((saved) => {
        if (saved) removeFromQueue(lead)
        setCaptureState(saved ? 'cloud' : 'local')
        trackEvent('lead_capture_status', {
          source: LEAD_SOURCE,
          status: saved ? 'cloud' : 'local_fallback',
        })
      })
    } else {
      setCaptureState('local')
      trackEvent('lead_capture_status', {
        source: LEAD_SOURCE,
        status: 'local_fallback',
      })
    }
  }

  const evaluationUrl = bookingLink(
    `Hola BAYONA, soy ${String(name).trim() || 'un nuevo contacto'}. Ya abrí mis recursos y quiero agendar una valoración inicial. Mi contacto es: ${String(contact).trim() || 'por confirmar'}.`,
  )

  return (
    <section className="lead-magnet" aria-labelledby="lead-magnet-title">
      <div className="section-shell lead-magnet-inner">
        {/*
          Lo que se entrega aquí es un objeto: una hoja de rutina. Se enseña la
          hoja antes de pedir el nombre, en vez de explicar en un párrafo lo que
          cabía en un dibujo. Las líneas van decreciendo a propósito: es una
          sesión escrita, no un formulario vacío.
        */}
        <svg
          className="lead-magnet-figure ds-reveal ds-reveal--scale"
          viewBox="0 0 300 190"
          role="img"
          aria-label="Una hoja de rutina con el sello de BAYONA, apoyada sobre otra igual."
        >
          <rect className="lead-magnet-hoja is-atras" x="66" y="26" width="164" height="128" rx="3" transform="rotate(-6 148 90)" />
          <rect className="lead-magnet-hoja" x="80" y="32" width="164" height="128" rx="3" />
          <line className="lead-magnet-linea is-titulo" x1="98" y1="56" x2="164" y2="56" />
          <line className="lead-magnet-linea" x1="98" y1="78" x2="218" y2="78" />
          <line className="lead-magnet-linea" x1="98" y1="94" x2="196" y2="94" />
          <line className="lead-magnet-linea" x1="98" y1="110" x2="208" y2="110" />
          <line className="lead-magnet-linea" x1="98" y1="126" x2="170" y2="126" />
          <polygon className="lead-magnet-sello" points="224,128 233,133 233,144 224,149 215,144 215,133" />
        </svg>
        <p className="eyebrow"><span />EMPIEZA GRATIS</p>
        <h2 id="lead-magnet-title">{heading}</h2>
        {done ? (
          <div className="lead-magnet-success" role="status">
            <strong>Listo, {String(name).trim()}. Ya puedes llevarte tus recursos.</strong>
            {captureState === 'cloud' ? (
              <p>Tu contacto quedó registrado en BAYONA. No necesitas crear una cuenta ni esperar para empezar.</p>
            ) : captureState === 'sending' ? (
              <p>Tus recursos ya están listos. Estamos registrando tu contacto.</p>
            ) : (
              <p>
                Tus recursos ya están listos. El registro automático no está disponible ahora;
                confirma por WhatsApp para que podamos responderte.
              </p>
            )}
            <div className="lead-magnet-rewards">
              <a href="/downloads/bayona-editorial/primera-semana.pdf" download>DESCARGAR · PRIMERA SEMANA</a>
              <a href="/downloads/bayona-editorial/registro-30-dias.pdf" download>DESCARGAR · REGISTRO 30 DÍAS</a>
              <a href="/downloads/bayona-editorial/dossier-punto-de-partida.pdf" download>DESCARGAR · PUNTO DE PARTIDA</a>
            </div>
            <div className="lead-magnet-next-actions">
              <a
                href={evaluationUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('valuation_request_click', {
                  source: LEAD_SOURCE,
                  channel: isBookingEnabled() ? 'booking' : 'whatsapp',
                })}
              >
                AGENDAR VALORACIÓN
              </a>
              <Link to="/programs">VER SERVICIOS</Link>
            </div>
            <small>
              {isBookingEnabled()
                ? 'La disponibilidad y la confirmación se gestionan en el calendario.'
                : 'La cita se coordina por WhatsApp según disponibilidad.'}
            </small>
          </div>
        ) : (
          <>
            <p>{copy}</p>
            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="lead-magnet-name">NOMBRE</label>
              <input
                id="lead-magnet-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre"
              />
              <label htmlFor="lead-magnet-contact">CORREO O WHATSAPP</label>
              <input
                id="lead-magnet-contact"
                name="contact"
                type="text"
                autoComplete="email"
                required
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="tu@correo.com o +34 600 000 000"
              />
              {errors.length > 0 && (
                <div className="lead-magnet-errors" role="alert">
                  <strong>Revisa tus datos</strong>
                  <ul>
                    {errors.map((message) => <li key={message}>{message}</li>)}
                  </ul>
                </div>
              )}
              <button type="submit" className="gold-button">
                RECIBIR MIS RECURSOS
              </button>
            </form>
            <p className="lead-magnet-note">
              Usamos estos datos para responder a tu solicitud. Si el registro automático no está disponible, podrás confirmarla por WhatsApp.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
