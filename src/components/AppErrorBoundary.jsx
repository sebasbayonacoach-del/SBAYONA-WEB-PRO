/**
 * BAYONA · LÍMITE DE ERROR DE APLICACIÓN
 * ---------------------------------------------------------------------------
 * Solo existía un ErrorBoundary y estaba acotado al globo 3D (Globe3D.jsx).
 * Fuera de ahí, cualquier excepción dejaba la pantalla en blanco: y el código
 * lanza excepciones a propósito en varios sitios (cartStore.js valida precios
 * con `throw new TypeError`, offerings.js valida selecciones igual).
 *
 * Un fallo de render ya no cuesta la visita: se explica, se ofrece recargar y
 * se mantiene abierto el canal de WhatsApp, que es por donde entra el negocio.
 */

import { Component } from 'react'
import { trackEvent } from '../lib/analytics/analytics.js'
import { reportError } from '../lib/errorReport.js'
import { whatsAppLink } from '../config/site.config.js'
import '../styles/error-boundary.css'

const helpUrl = whatsAppLink(
  'Hola BAYONA, la web me ha dado un error y no he podido continuar. Quería consultaros esto:',
)

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? '' }
  }

  componentDidCatch(error, info) {
    // Punto único de reporte (consola + log local; Crashlytics se enchufa ahí).
    reportError(error, { source: 'AppErrorBoundary', info: String(info?.componentStack ?? '').slice(0, 500) })

    trackEvent('app_error', {
      message: String(error?.message ?? '').slice(0, 120),
      path: typeof window !== 'undefined' ? window.location.pathname : '',
    })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="app-error" role="alert">
        <div className="app-error-inner">
          <p className="app-error-kicker">BAYONA / ALGO SE HA ROTO</p>
          <h1>
            NO ES TU CULPA.
            <br />
            <span>ES NUESTRA.</span>
          </h1>
          <p className="app-error-copy">
            Algo ha fallado al cargar esta parte de la web. Recarga la página; si vuelve a pasar,
            escríbenos y lo revisamos.
          </p>

          <div className="app-error-actions">
            <button type="button" className="app-error-reload" onClick={this.handleReload}>
              RECARGAR LA PÁGINA
            </button>
            <a className="app-error-help" href={helpUrl} target="_blank" rel="noopener noreferrer">
              AVISAR POR WHATSAPP
            </a>
          </div>

          {this.state.message && (
            <p className="app-error-detail">
              Detalle técnico: <code>{this.state.message}</code>
            </p>
          )}
        </div>
      </div>
    )
  }
}
