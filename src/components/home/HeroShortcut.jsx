/**
 * BAYONA · ATAJILLO DE QUIEN YA VIO LA CASA
 * ---------------------------------------------------------------------------
 * La portada recibe a quien llega por primera vez y le ofrece un recorrido.
 * Pero hay otra persona: la que ya recorrió la página, ya vino a preguntar y
 * solo quiere decidir. A esa no se le vuelve a explicar nada.
 *
 * Este control es para ella. Es pequeño, secundario y vive debajo de la acción
 * principal para que nunca se confunda con el camino nuevo: salta el recorrido
 * y deja a la persona en la decisión. Si ya pasó por recepción, en vez de
 * abrir los planes genéricos la devuelve a SU plan.
 */

import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useVisitorJourney } from '../../lib/onboarding/VisitorJourneyProvider.jsx'
import { trackEvent } from '../../lib/analytics/analytics.js'

export default function HeroShortcut() {
  const { route, hasRoute } = useVisitorJourney()

  if (hasRoute) {
    return (
      <Link
        className="hero-shortcut is-resuming"
        to={route.planHref ?? '/programs'}
        onClick={() => trackEvent('home_shortcut_resume', { plan: route.plan })}
      >
        <span className="hero-shortcut-text">
          YA VI LA PÁGINA WEB
          <em>Volver a {route.plan}</em>
        </span>
        <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
      </Link>
    )
  }

  return (
    <a
      className="hero-shortcut"
      href="#home-offer-heading"
      onClick={() => trackEvent('home_shortcut_decision', { source: 'home_hero' })}
    >
      <span className="hero-shortcut-text">
        YA VI LA PÁGINA WEB
        <em>Ir a la decisión</em>
      </span>
      <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
    </a>
  )
}
