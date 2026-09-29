/**
 * BAYONA · OFERTA DE TRADUCCIÓN
 * ---------------------------------------------------------------------------
 * Aparece solo si el navegador del visitante no entiende español, y ofrece la
 * página traducida a su idioma con un clic.
 *
 * Decisiones:
 * · Nombre del idioma, nunca una bandera. Una bandera es un país, no una
 *   lengua; con 20 países hispanohablantes eso es fuente de fricción.
 * · Se puede cerrar, y se recuerda cerrada durante la sesión. Nadie quiere
 *   discutir dos veces con el mismo aviso.
 * · No carga ningún script de terceros: es un enlace. Por eso puede mostrarse
 *   sin consentimiento previo, a diferencia de un widget de traducción.
 * · Cede el sitio al banner de consentimiento y a la cinta de recorrido, que
 *   tienen prioridad.
 */

import { useEffect, useState } from 'react'
import { Languages, X } from 'lucide-react'
import { resolveTranslationOffer, translatedUrl } from '../lib/i18n/visitorLocale.js'
import { trackEvent } from '../lib/analytics/analytics.js'
import '../styles/translate-offer.css'

export default function TranslateOffer() {
  const [offer, setOffer] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  /**
   * Se resuelve tras el montaje: `navigator.languages` no existe durante el
   * render del servidor ni en el primer paso de hidratación.
   */
  useEffect(() => {
    setOffer(resolveTranslationOffer())
  }, [])

  if (!offer || dismissed) return null

  return (
    <aside className="translate-offer" aria-label="Language">
      <Languages size={16} strokeWidth={1.4} aria-hidden="true" />

      <p className="translate-offer-copy">
        <span lang="es">Esta página está en español.</span>
      </p>

      <a
        className="translate-offer-action"
        href={translatedUrl(offer.code)}
        target="_blank"
        rel="noopener noreferrer"
        lang={offer.code}
        onClick={() => trackEvent('translate_open', { language: offer.code })}
      >
        {offer.label}
      </a>

      <button
        type="button"
        className="translate-offer-close"
        onClick={() => {
          setDismissed(true)
          trackEvent('translate_dismiss', { language: offer.code })
        }}
        aria-label="Dismiss"
      >
        <X size={14} strokeWidth={1.7} aria-hidden="true" />
      </button>
    </aside>
  )
}
