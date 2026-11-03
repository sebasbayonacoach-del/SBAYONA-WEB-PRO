import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Monitor, Smartphone } from 'lucide-react'
import { trackEvent } from '../../lib/analytics/analytics.js'
import './SBFlagship.css'

const previews = {
  desktop: {
    label: 'Vista escritorio',
    caption: 'ACCESO / VISTA ESCRITORIO',
    image: '/images/bayona-live-app/role-selection-20261009.png',
    alt: 'Captura real de la pantalla de acceso de SB+ con perfiles de atleta y Coach Studio, vista escritorio.',
    width: 1365,
    height: 900,
    heading: 'Elige tu espacio.',
    summary: 'Accede al perfil de atleta o al estudio de entrenador desde una misma puerta de entrada.',
  },
  mobile: {
    label: 'Vista móvil',
    caption: 'ACCESO / VISTA MÓVIL',
    image: '/images/bayona-live-app/role-picker-mobile-crop-20261009.png',
    alt: 'Captura real del selector de perfil de SB+ en formato móvil.',
    width: 390,
    height: 480,
    heading: 'Tu espacio, también en móvil.',
    summary: 'El acceso a tu espacio se adapta a una pantalla compacta.',
  },
}

export default function SBFlagship() {
  const [active, setActive] = useState(() => (typeof window !== 'undefined' && window.innerWidth <= 600 ? 'mobile' : 'desktop'))
  const preview = previews[active]

  const selectPreview = (name) => {
    if (name === active) return
    setActive(name)
    trackEvent('sb_flagship_preview_switch', { preview: name })
  }

  return (
    <section className="sb-flagship" id="bayona-plus" aria-labelledby="sb-flagship-heading">
      <div className="sb-flagship__ambient" aria-hidden="true">
        <span className="sb-flagship__ambient-ring sb-flagship__ambient-ring--one" />
        <span className="sb-flagship__ambient-ring sb-flagship__ambient-ring--two" />
      </div>
      <div className="sb-flagship__topline">
        <div className="sb-flagship__topline-inner">
          <span>04 / SEBASTIAN BAYONA DIGITAL STUDIO</span>
          <span className="sb-flagship__topline-right"><i aria-hidden="true" /> EXPERIENCIA CONECTADA</span>
        </div>
      </div>

      <div className="sb-flagship__main">
        <div className="sb-flagship__editorial">
          <div className="sb-flagship__identity">
            <span className="sb-flagship__identity-symbol" aria-hidden="true">SB<span>+</span></span>
            <span>EL ESTUDIO DIGITAL<br />DE TU MOVIMIENTO</span>
          </div>

          <h2 id="sb-flagship-heading">UN ESTUDIO<br />QUE VA <em>CONTIGO.</em></h2>
          <p className="sb-flagship__lead">Tu entrenamiento no termina cuando sales de la sesión. Conoce el espacio digital de SEBASTIAN BAYONA para atletas y entrenadores.</p>

          <div className="sb-flagship__actions">
            <Link to="/app" className="sb-flagship__primary" onClick={() => trackEvent('sb_flagship_enter', { source: 'home' })}>
              DESCUBRIR SB+ <ArrowUpRight size={19} strokeWidth={1.6} aria-hidden="true" />
            </Link>
            <button type="button" className="sb-flagship__secondary" onClick={() => selectPreview(active === 'desktop' ? 'mobile' : 'desktop')}>
              CAMBIAR VISTA <ArrowRight size={17} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>

          <div className="sb-flagship__features" aria-label="Elementos del acceso digital">
            <div><b>01</b><span>ATLETA</span></div>
            <div><b>02</b><span>COACH STUDIO</span></div>
            <div><b>03</b><span>ACCESO WEB</span></div>
          </div>
        </div>

        <div className="sb-flagship__showcase">
          <div className="sb-flagship__showcase-head">
            <span className="sb-flagship__cross" aria-hidden="true">+</span>
            <span>PRESENTACIÓN DE PRODUCTO</span>
            <span>SB+ / 001</span>
          </div>
          <div className={'sb-flagship__device sb-flagship__device--' + active}>
            <div className="sb-flagship__device-top">
              <span className="sb-flagship__traffic" aria-hidden="true"><i/><i/><i/></span>
              <span>SEBASTIAN BAYONA / SB+</span>
              <span className="sb-flagship__screen-status">ACCESO REAL</span>
            </div>
            <div className="sb-flagship__device-screen">
              <img key={preview.image} src={preview.image} alt={preview.alt} width={preview.width} height={preview.height} loading="eager" decoding="async" />
            </div>
          </div>
          <div className="sb-flagship__device-foot">
            <span>CAPTURA DE LA INTERFAZ EXISTENTE</span>
            <span>{preview.caption}</span>
          </div>
        </div>
      </div>

      <div className="sb-flagship__viewbar">
        <div className="sb-flagship__viewbar-label">EXPLORA LA INTERFAZ <span>↘</span></div>
        <div className="sb-flagship__view-controls" role="group" aria-label="Vista de la aplicación">
          <button type="button" className={active === 'desktop' ? 'is-active' : ''} aria-pressed={active === 'desktop'} onClick={() => selectPreview('desktop')}>
            <Monitor size={18} aria-hidden="true" /> ESCRITORIO
          </button>
          <button type="button" className={active === 'mobile' ? 'is-active' : ''} aria-pressed={active === 'mobile'} onClick={() => selectPreview('mobile')}>
            <Smartphone size={18} aria-hidden="true" /> MÓVIL
          </button>
        </div>
        <div className="sb-flagship__viewbar-copy" aria-live="polite">
          <strong>{preview.heading}</strong>
          <span>{preview.summary}</span>
        </div>
      </div>
    </section>
  )
}
