/**
 * LeadMagnet — embudo freemium (Fase 2 SaaS).
 *
 * Nombre + email o WhatsApp + "Quiero mi rutina gratis". Guarda en la cola
 * local `bayona_leads` y, si hay nube, inserta en la tabla `leads` con
 * `source='lead-magnet'`. Éxito en pantalla sin recargar.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isCloudEnabled, supabase } from '../../lib/supabase.js'
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

function appendToQueue(lead) {
  try {
    const queue = readQueue()
    queue.push(lead)
    window?.localStorage?.setItem(LEADS_KEY, JSON.stringify(queue))
  } catch {
    // localStorage lleno o bloqueado: el éxito en pantalla se mantiene.
  }
}

async function insertCloudLead(lead) {
  if (!isCloudEnabled() || !supabase) return
  try {
    await supabase.from('leads').insert({
      name: lead.name,
      contact: lead.contact,
      source: LEAD_SOURCE,
    })
  } catch {
    // La cola local ya guardó el lead; la nube reintentará otro día.
  }
}

export default function LeadMagnet({
  heading = 'Tu primera acción clara, gratis.',
  copy = 'Déjanos tu nombre y tu contacto. Te escribimos con una rutina simple para empezar esta semana con dirección, no con otra promesa vacía.',
}) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [errors, setErrors] = useState([])
  const [done, setDone] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = []
    if (String(name).trim().length < 2) nextErrors.push('Escribe tu nombre.')
    if (!isValidContact(contact)) nextErrors.push('Escribe un correo válido o un WhatsApp válido.')
    setErrors(nextErrors)
    if (nextErrors.length > 0) return

    const lead = {
      name: String(name).trim(),
      contact: String(contact).trim(),
      source: LEAD_SOURCE,
      created_at: new Date().toISOString(),
    }
    appendToQueue(lead)
    insertCloudLead(lead)
    setDone(true)
  }

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
          <p className="lead-magnet-success" role="status">
            Listo, {String(name).trim()}. Guardamos tu contacto y te escribimos con tu primera rutina clara.{' '}
            Mientras tanto puedes <Link to="/resources">explorar los recursos gratis</Link>.
          </p>
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
                QUIERO MI PRIMERA RUTINA
              </button>
            </form>
            <p className="lead-magnet-note">
              Solo la usamos para enviarte tu rutina. Nada de spam, nada de presión.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
