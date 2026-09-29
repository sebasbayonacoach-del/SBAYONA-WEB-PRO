/**
 * BAYONA · CINTA DE RECORRIDO
 * ---------------------------------------------------------------------------
 * La pieza que convierte la web en un recorrido acompañado en lugar de un
 * conjunto de páginas.
 *
 * Aparece solo cuando la persona ha pasado por recepción y tiene una ruta, y
 * la acompaña durante toda la visita: recuerda su plan, su recurso gratuito y
 * la puerta de la comunidad, con un acceso directo a cada uno.
 *
 * Decisiones deliberadas:
 * · No aparece nunca sin ruta. Nadie ve una cinta vacía.
 * · No aparece en /onboarding: ahí la persona ya está en recepción.
 * · Se puede cerrar. Una guía que no se puede cerrar es un estorbo.
 * · Está anclada abajo y no tapa contenido: es una barra de altura fija.
 * · Cede el sitio al banner de consentimiento, que tiene prioridad legal.
 */

import { useState } from 'react'
import { ArrowUpRight, Compass, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useVisitorJourney } from '../../lib/onboarding/VisitorJourneyProvider.jsx'
import { trackEvent } from '../../lib/analytics/analytics.js'
import '../../styles/journey-ribbon.css'

/** Rutas donde la cinta estorba en lugar de ayudar. */
const HIDDEN_ON = new Set(['/onboarding', '/entrar', '/checkout', '/order-confirmation'])

export default function JourneyRibbon() {
  const { pathname } = useLocation()
  const { route, hasRoute, resetJourney } = useVisitorJourney()
  const [dismissed, setDismissed] = useState(false)

  if (!hasRoute || dismissed || HIDDEN_ON.has(pathname)) return null

  /** Los tres destinos que la recepción entregó, en orden de compromiso. */
  const stops = [
    route.resourceHref && { label: route.resource, href: route.resourceHref, tag: 'GRATIS' },
    route.planHref && { label: route.plan, href: route.planHref, tag: 'TU PLAN' },
    route.communityHref && { label: 'COMUNIDAD', href: route.communityHref, tag: 'ABIERTA' },
  ].filter(Boolean)

  return (
    <aside className="journey-ribbon" aria-label="Tu recorrido en BAYONA">
      <div className="journey-ribbon-inner">
        <p className="journey-ribbon-mark">
          <Compass size={15} strokeWidth={1.4} aria-hidden="true" />
          <span>TU RECORRIDO</span>
        </p>

        <ul className="journey-ribbon-stops">
          {stops.map((stop) => {
            const isCurrent = pathname === stop.href

            return (
              <li key={stop.href}>
                <Link
                  to={stop.href}
                  className={`journey-ribbon-stop${isCurrent ? ' is-current' : ''}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => trackEvent('journey_stop', { destination: stop.href, plan: route.plan })}
                >
                  <em>{stop.tag}</em>
                  <strong>{stop.label}</strong>
                  {!isCurrent && <ArrowUpRight size={13} strokeWidth={1.4} aria-hidden="true" />}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="journey-ribbon-actions">
          <Link
            className="journey-ribbon-redo"
            to="/onboarding"
            onClick={() => {
              resetJourney()
              trackEvent('journey_reset', { source: 'ribbon' })
            }}
          >
            CAMBIAR
          </Link>
          <button
            type="button"
            className="journey-ribbon-close"
            onClick={() => setDismissed(true)}
            aria-label="Ocultar mi recorrido"
          >
            <X size={15} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
