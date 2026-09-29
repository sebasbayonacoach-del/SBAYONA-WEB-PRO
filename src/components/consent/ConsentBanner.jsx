/**
 * BAYONA · BANNER DE CONSENTIMIENTO
 * ---------------------------------------------------------------------------
 * BAYONA opera desde España: el RGPD exige consentimiento previo, informado y
 * con rechazo igual de fácil que la aceptación. Este banner es la puerta que
 * `lib/analytics` respeta antes de cargar cualquier proveedor.
 *
 * Detalles deliberados:
 * · No aparece si no hay ninguna analítica configurada: sin cookies, sin banner.
 * · "Rechazar" tiene el mismo peso visual que "Aceptar" (lo pide la AEPD).
 * · No es modal y no roba el foco: no bloquea la lectura de la página.
 * · No hay muro de cookies: el contenido es accesible en cualquier caso.
 */

import { useEffect, useState } from 'react'
import { CONSENT_DENIED, CONSENT_GRANTED, isConsentPending, setConsent } from '../../lib/analytics/consent.js'
import { isAnalyticsConfigured } from '../../lib/analytics/analytics.js'
import '../../styles/consent.css'

export default function ConsentBanner() {
  /**
   * Arranca oculto y se decide tras el montaje: leer localStorage durante el
   * primer render provocaría un parpadeo del banner en cada carga.
   */
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isAnalyticsConfigured()) return
    if (isConsentPending()) setVisible(true)
  }, [])

  if (!visible) return null

  const decide = (state) => {
    setConsent(state)
    setVisible(false)
  }

  return (
    <div
      className="consent-banner"
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-body"
    >
      <div className="consent-inner">
        <div className="consent-copy">
          <p className="consent-kicker" id="consent-title">
            MEDICIÓN · TÚ DECIDES
          </p>
          <p id="consent-body">
            Usamos medición anónima para saber qué páginas ayudan de verdad y dejar de invertir en
            las que no. Si prefieres que no, la web funciona exactamente igual.
          </p>
        </div>

        <div className="consent-actions">
          <button type="button" className="consent-button" onClick={() => decide(CONSENT_DENIED)}>
            RECHAZAR
          </button>
          <button type="button" className="consent-button" onClick={() => decide(CONSENT_GRANTED)}>
            ACEPTAR
          </button>
        </div>
      </div>
    </div>
  )
}
