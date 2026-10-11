import { ArrowUpRight, ExternalLink, MonitorSmartphone } from 'lucide-react'
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
            <p className="bayona-live-app__eyebrow"><span className="bayona-live-app__status" aria-hidden="true" /> BAYONA APP / VERSIÓN WEB PUBLICADA</p>
            <h2 id={isHome ? 'bayona-live-home-title' : 'bayona-live-app-title'}>
              {isHome ? <>EL MOVIMIENTO <em>CONTINÚA EN TU APP.</em></> : <>YA NO ES SOLO UNA IDEA. <em>PUEDES ENTRAR.</em></>}
            </h2>
            <p className="bayona-live-app__lead">Una aplicación creada para personas que entrenan y para quienes las acompañan. Dos espacios, una sola puerta de entrada.</p>
            <div className="bayona-live-app__actions">
              <a className="bayona-live-app__cta" href={BAYONA_APP_ENTRY_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => track('role_picker')}>
                ABRIR LA APP REAL <ExternalLink size={17} aria-hidden="true" />
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
            <p className="bayona-live-app__image-caption">CAPTURA DE LA VERSIÓN WEB PUBLICADA · NO ES UNA MAQUETA</p>
          </div>
        </div>
        <div className="bayona-live-app__spaces" aria-label="Dos espacios de acceso a BAYONA App">
          {BAYONA_APP_SPACES.map((space) => (
            <article key={space.id} className="bayona-live-app__space">
              <span className="bayona-live-app__space-number">{space.number} / {space.label}</span>
              <h3>{space.title}</h3>
              <p>{space.description}</p>
              {!isHome && <small>{space.note}</small>}
              <a href={BAYONA_APP_ENTRY_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => track(space.id)} aria-label={`Abrir BAYONA App y elegir ${space.label}`}>
                ELEGIR AL ENTRAR <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
        {!isHome && <p className="bayona-live-app__disclaimer">
          La aplicación web y la selección de perfiles ya pueden abrirse. La integración con las membresías de esta web, la sincronización definitiva, los pagos y los permisos de producción siguen sujetos a validación. El acceso no implica disponer de todas las funciones.
        </p>}
      </div>
    </section>
  )
}
