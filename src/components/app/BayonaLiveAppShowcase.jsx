import { ArrowUpRight, MonitorSmartphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BAYONA_APP_ENTRY_URL, BAYONA_APP_ROLE_IMAGE, BAYONA_APP_MOBILE_IMAGE, BAYONA_APP_SPACES } from '../../config/bayonaAppIntegration.js'
import { trackEvent } from '../../lib/analytics/analytics.js'
import '../../styles/bayona-live-app.css'

export default function BayonaLiveAppShowcase({ placement = 'app' }) {
  const isHome = placement === 'home'
  const track = (destination) => trackEvent('bayona_app_bridge_click', { source: placement, destination })
  return (
    <section className={`bayona-live-app bayona-live-app--${placement}`} id={isHome ? 'bayona-app-real-home' : 'bayona-app-real'}
      aria-labelledby={isHome ? 'bayona-live-home-title' : 'bayona-live-app-title'}>
      <div className="bayona-live-app__shell">
        <div className="bayona-live-app__header">
          <div className="bayona-live-app__copy">
            <p className="bayona-live-app__eyebrow"><span className="bayona-live-app__status" aria-hidden="true" /> BAYONA APP / INTEGRADA EN BAYONA</p>
            <h2 id={isHome ? 'bayona-live-home-title' : 'bayona-live-app-title'}>
              {isHome ? <>EL MOVIMIENTO <em>CONTINÚA EN TU APP.</em></> : <>YA NO ES SOLO UNA IDEA. <em>PUEDES ENTRAR.</em></>}
            </h2>
            <p className="bayona-live-app__lead">La aplicación real vive ahora dentro de BAYONA. Mi App para entrenar y Coach Studio para la cuenta autorizada de entrenador.</p>
            <div className="bayona-live-app__actions">
              <a className="bayona-live-app__cta" href={BAYONA_APP_ENTRY_URL}
                onClick={() => track('role_picker')}>
                ABRIR MI APP <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              {isHome ? (
                <Link className="bayona-live-app__secondary" to="/app" onClick={() => track('web_app_page')}>
                  DESCUBRIR BAYONA APP <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              ) : <a className="bayona-live-app__secondary" href="#experiencia-bayona-plus">
                VER LA VISIÓN FUTURA <ArrowUpRight size={17} aria-hidden="true" />
              </a>}
            </div>
          </div>
          <div className="bayona-live-app__visual">
            <div className="bayona-live-app__browser" aria-label="Captura real de la pantalla de acceso de BAYONA App">
              <div className="bayona-live-app__browser-top" aria-hidden="true">
                <span className="bayona-live-app__browser-dots"><i /><i /><i /></span>
                <span>APP / BAYONA</span>
                <MonitorSmartphone size={15} />
              </div>
              <picture>
                <source media="(max-width: 640px)" srcSet={BAYONA_APP_MOBILE_IMAGE} />
                <img src={BAYONA_APP_ROLE_IMAGE} loading="lazy" decoding="async" width="1365" height="900"
                  alt="Captura real de BAYONA App: pantalla para elegir Mi App o Coach Studio" />
              </picture>
            </div>
            <p className="bayona-live-app__image-caption">CAPTURA DE BAYONA APP · PRODUCTO REAL INTEGRADO</p>
          </div>
        </div>
        <div className="bayona-live-app__spaces" aria-label="Dos espacios de acceso a BAYONA App">
          {BAYONA_APP_SPACES.map((space) => (
            <article key={space.id} className="bayona-live-app__space">
              <span className="bayona-live-app__space-number">{space.number} / {space.label}</span>
              <h3>{space.title}</h3>
              <p>{space.description}</p>
              {!isHome && <small>{space.note}</small>}
              <a href={BAYONA_APP_ENTRY_URL}
                onClick={() => track(space.id)} aria-label={`Abrir BAYONA App y elegir ${space.label}`}>
                ELEGIR AL ENTRAR <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
        {!isHome && <p className="bayona-live-app__disclaimer">
          BAYONA App ya se abre dentro de este mismo sitio. El registro público crea usuarios normales; Coach Studio depende de autorización del propietario. Google requiere completar la configuración OAuth de producción antes de considerarlo disponible.
        </p>}
      </div>
    </section>
  )
}
