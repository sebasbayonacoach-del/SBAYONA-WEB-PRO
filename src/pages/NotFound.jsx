/**
 * BAYONA / 404 — Ruta perdida, movimiento intacto.
 *
 * Inspired by 404s.design's creative, bold and interactive recovery pages.
 * All artwork is original local CSS, no external assets/scripts, original
 * semantic recovery links, analytics and noindex contract preserved.
 */
import { Link, useLocation } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Compass, MessageCircle } from 'lucide-react'
import { trackEvent } from '../lib/analytics/analytics.js'
import { whatsAppLink } from '../config/site.config.js'
import '../styles/not-found.css'
import '../styles/not-found-experience-20261012.css'
import '../styles/bayona-final-visual-v4.css'

const DESTINATIONS = [
  ['Servicios', '/programs', 'Explora entrenamiento personal, online y movimiento.'],
  ['Recursos', '/resources', 'Empieza hoy con herramientas gratuitas.'],
  ['Preguntas', '/faq', 'Resuelve dudas antes de tomar una decisión.'],
  ['Empezar', '/#empieza', 'Tu primer paso, a tu ritmo y sin presión.'],
]

const helpUrl = whatsAppLink(
  'Hola BAYONA, llegué a un enlace roto en la web y no encontré lo que buscaba. ¿Me ayudáis?',
)

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <div className="not-found-page bayona-lost-world">
      <main className="bayona-lost-world__main">
        <div className="bayona-lost-world__topline">
          <span><Compass size={15} aria-hidden="true" /> BAYONA / EXPLORACIÓN</span>
          <span>COORDENADAS NO ENCONTRADAS</span>
          <span>ESTADO / 404</span>
        </div>

        <div className="bayona-lost-world__stage">
          <div className="bayona-lost-world__copy">
            <span className="bayona-lost-world__eyebrow">RUTA DESCONOCIDA — MOVIMIENTO INFINITO</span>
            <p className="bayona-lost-world__number" aria-hidden="true">404<span className="bayona-lost-world__asterisk">✳</span></p>
            <h1>PERDER EL RUMBO<br /><em>NO ES DETENERSE.</em></h1>
            <p className="bayona-lost-world__description">
              Esta página no está en nuestro mapa. Pero tu camino continúa.
              Elige una nueva dirección y sigamos moviéndonos.
            </p>
            <div className="bayona-lost-world__actions">
              <Link to="/" className="bayona-lost-world__home">
                VOLVER AL INICIO <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
              <a className="bayona-lost-world__support" href={helpUrl} target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { source: 'not_found', from: pathname })}>
                <MessageCircle size={16} aria-hidden="true" /> AYUDA CON ESTA RUTA
              </a>
            </div>
            <p className="bayona-lost-world__pathname">UBICACIÓN SOLICITADA <code>{pathname}</code></p>
          </div>

          <div className="bayona-lost-world__art" aria-hidden="true">
            <div className="bayona-lost-world__orbit">
              <span className="bayona-lost-world__orbit-text">EL CAMINO SIGUE / BAYONA / 404</span>
              <span className="bayona-lost-world__center">B<span>↗</span></span>
              <span className="bayona-lost-world__node bayona-lost-world__node--1" />
              <span className="bayona-lost-world__node bayona-lost-world__node--2" />
              <span className="bayona-lost-world__node bayona-lost-world__node--3" />
            </div>
            <div className="bayona-lost-world__axis bayona-lost-world__axis--h" />
            <div className="bayona-lost-world__axis bayona-lost-world__axis--v" />
            <span className="bayona-lost-world__art-footer">NO DESTINATION IS FINAL / 001</span>
          </div>
        </div>

        <nav className="bayona-lost-world__routes" aria-label="Destinos principales de BAYONA">
          <span className="bayona-lost-world__routes-label">ENCUENTRA UN NUEVO CAMINO <ArrowDownRight size={15} aria-hidden="true" /></span>
          <div className="bayona-lost-world__routes-grid">
            {DESTINATIONS.map(([label, href, description], index) => (
              <Link className="bayona-lost-world__route" to={href} key={href}
                onClick={() => trackEvent('not_found_recovery', { destination: href, from: pathname })}>
                <span className="bayona-lost-world__route-index">{String(index + 1).padStart(2, '0')}</span>
                <strong>{label}</strong>
                <small>{description}</small>
                <ArrowUpRight size={21} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </nav>
        <p className="bayona-lost-world__endnote">BAYONA — DONDE LA CIENCIA SE ENCUENTRA CON EL MOVIMIENTO.</p>
      </main>
    </div>
  )
}
