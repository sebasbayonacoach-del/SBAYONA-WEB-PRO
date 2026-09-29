/**
 * BAYONA · 404
 * ---------------------------------------------------------------------------
 * Antes, `<Route path="*" element={<Home />} />` devolvía la home con estado
 * 200 en cualquier URL inexistente. Eso es un "soft 404": Google indexa
 * basura y el visitante no entiende dónde está.
 *
 * Esta página reconoce el error, no se indexa (RouteSeo la marca noindex) y
 * recupera la visita ofreciendo las rutas que de verdad importan.
 */

import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { SectionLabel } from '../components/Layout'
import { trackEvent } from '../lib/analytics/analytics.js'
import { whatsAppLink } from '../config/site.config.js'
import '../styles/not-found.css'

const DESTINATIONS = [
  ['Programas y planes', '/programs', 'Compara los cuatro niveles de acompañamiento.'],
  ['Recursos gratuitos', '/resources', 'Empieza sin pagar nada.'],
  ['Preguntas frecuentes', '/faq', 'Precios, lesiones, presencialidad y BAYONA+.'],
  ['Entrar a BAYONA', '/onboarding', 'Un recorrido corto para orientarte.'],
]

const helpUrl = whatsAppLink(
  'Hola BAYONA, llegué a un enlace roto en la web y no encontré lo que buscaba. ¿Me ayudáis?',
)

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <div className="not-found-page">
      <section className="not-found-shell section-shell">
        <SectionLabel>ERROR 404 / RUTA NO ENCONTRADA</SectionLabel>
        <h1>
          ESE CAMINO
          <br />
          <span>NO EXISTE.</span>
        </h1>
        <p className="not-found-lead">
          La página que buscabas cambió de sitio o nunca estuvo aquí. No pasa nada: te dejamos
          los accesos que sí llevan a algún lado.
        </p>
        <p className="not-found-path">
          Intentaste abrir <code>{pathname}</code>
        </p>

        <nav className="not-found-grid" aria-label="Destinos principales de BAYONA">
          {DESTINATIONS.map(([label, href, copy], index) => (
            <Link
              className="not-found-card"
              key={href}
              to={href}
              onClick={() => trackEvent('not_found_recovery', { destination: href, from: pathname })}
            >
              <span className="not-found-card-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <strong>{label}</strong>
              <small>{copy}</small>
              <ArrowUpRight size={16} strokeWidth={1} aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <div className="not-found-actions">
          <Link className="not-found-home" to="/">
            VOLVER AL INICIO <ArrowUpRight size={16} strokeWidth={1} aria-hidden="true" />
          </Link>
          <a
            className="not-found-help"
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { source: 'not_found', from: pathname })}
          >
            <MessageCircle size={16} strokeWidth={1} aria-hidden="true" /> AVISAR DEL ENLACE ROTO
          </a>
        </div>
      </section>
    </div>
  )
}
