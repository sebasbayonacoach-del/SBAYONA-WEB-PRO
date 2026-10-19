import { useEffect } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Download, Gift } from 'lucide-react'
import { SectionLabel } from '../components/Layout'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import LeadMagnet from '../components/leads/LeadMagnet.jsx'
import HomeVisiblePlans from '../components/home/HomeVisiblePlans.jsx'
import HomeMovementContexts from '../components/home/HomeMovementContexts.jsx'
import { useJourneyExperience } from '../components/experience/JourneyExperienceContext.jsx'
import BayonaLiveAppShowcase from '../components/app/BayonaLiveAppShowcase.jsx'
import GuidedStartJourney from '../components/home/GuidedStartJourney.jsx'
import AdaptiveDiscovery from '../components/home/AdaptiveDiscovery.jsx'
import { membershipPlanEditorialProjection } from '../config/conversionContent.js'
import { siteMedia } from '../config/siteMedia.js'
import { bookingLink, isBookingEnabled } from '../config/site.config.js'
import { trackEvent } from '../lib/analytics/analytics.js'
import '../styles/home.css'
import '../styles/home-luxury-conversion.css'
import '../styles/home-gym-funnel-v2.css'
import '../styles/home-visual-rescue.css'
import '../styles/home-services-premium.css'
import '../styles/home-cinematic-hero-release.css'
import '../styles/home-copy-caring.css'
import '../styles/home-everything-visible.css'
import '../styles/home-conversion-focus.css'

const SERVICES = Object.freeze([
  {
    id: 'personal',
    number: '01',
    type: 'GUÍA PERSONAL',
    promise: 'UN ENTRENADOR CONTIGO',
    title: 'Entrenamiento personal',
    copy: 'Sesiones 1:1 pensadas para tu cuerpo y tus objetivos.',
    image: '/images/bayona-generated/home-pillar-build-1600.webp',
    details: 'TÉCNICA · FUERZA · SEGUIMIENTO',
  },
  {
    id: 'online',
    number: '02',
    type: 'A TU RITMO',
    promise: 'TU PLAN, TU HORARIO',
    title: 'Entrenamiento online',
    copy: 'Entrena donde estés, con una ruta clara y seguimiento.',
    image: '/images/bayona-generated/home-method-1600.webp',
    details: 'PLAN · VÍDEOS · AJUSTES',
  },
  {
    id: 'parkour',
    number: '03',
    type: 'MOVIMIENTO Y TÉCNICA',
    promise: 'MOVERTE ES APRENDER',
    title: 'Parkour y rendimiento',
    copy: 'Aprende parkour desde la base, paso a paso.',
    image: '/images/bayona-generated/parkour-hero-1600.webp',
    details: 'TÉCNICA · CONTROL · CONFIANZA',
  },
  {
    id: 'recovery',
    number: '04',
    type: 'MOVERTE MEJOR',
    promise: 'EL MOVIMIENTO SE ADAPTA',
    title: 'Movilidad y recuperación',
    copy: 'Recupera confianza al moverte, respetando tus límites.',
    image: '/images/bayona-generated/home-pillar-read-1600.webp',
    details: 'MOVILIDAD · FUERZA · PROGRESIÓN',
  },
])

const START_STEPS = Object.freeze([
  {
    number: '01',
    title: 'Cuéntame qué necesitas',
    copy: 'Me cuentas tu objetivo y qué necesitas.',
  },
  {
    number: '02',
    title: 'Trazamos una ruta',
    copy: 'Te explico las opciones que encajan contigo.',
  },
  {
    number: '03',
    title: 'Empezamos contigo',
    copy: 'Elegimos cómo empezar y avanzamos a tu ritmo.',
  },
])

const GIFTS = Object.freeze([
  {
    tag: 'GUÍA · 7 DÍAS',
    title: 'Tu primera semana',
    copy: 'Siete días para empezar con claridad.',
    href: '/downloads/bayona-editorial/primera-semana.pdf',
    image: '/images/bayona-generated/home-pillar-read-1600.webp',
  },
  {
    tag: 'WORKBOOK · 30 DÍAS',
    title: 'Registro de 30 días',
    copy: 'Registra y observa tus avances.',
    href: '/downloads/bayona-editorial/registro-30-dias.pdf',
    image: '/images/bayona-generated/resources-challenge-1600.webp',
  },
  {
    tag: 'DOSSIER',
    title: 'Tu punto de partida',
    copy: 'Define tu objetivo y tu próximo paso.',
    href: '/downloads/bayona-editorial/dossier-punto-de-partida.pdf',
    image: '/images/bayona-generated/home-free-kit-1600.webp',
  },
])

export default function Home() {
  const { goal, preferences, autoStartCoach } = useJourneyExperience()
  useEffect(() => {
    const timer = window.setTimeout(autoStartCoach, 450)
    return () => window.clearTimeout(timer)
  }, [autoStartCoach])
  const relevantServiceId = goal?.serviceId || (preferences.servicio === 'Entrenamiento online' || preferences.formato === 'A mi propio ritmo' ? 'online' : preferences.servicio === 'Entrenamiento individual' || preferences.formato === 'Con acompañamiento cercano' ? 'personal' : null)
  const evaluationUrl = bookingLink(goal ? `Hola BAYONA. Me interesa conocer opciones para mi objetivo general: ${goal.label}. ¿Podemos hablar de una valoración inicial?` : 'Hola, soy una persona interesada en BAYONA. Me gustaría contarte mi objetivo y ver si podemos coordinar una valoración inicial.')

  return (
    <div className="gym-home">
      <section
        {...sceneBackgroundProps(siteMedia.home.hero, {
          className: 'hero-module gym-home-hero',
          variant: 'hero',
          pseudo: 'after',
          position: 'center 38%',
          overlay: 'linear-gradient(90deg, rgba(5,5,5,.94) 0%, rgba(5,5,5,.72) 48%, rgba(5,5,5,.30) 100%), linear-gradient(180deg, rgba(5,5,5,.16), rgba(5,5,5,.72))',
        })}
        aria-labelledby="home-hero-title"
        id="inicio"
      >
        <div className="gym-home-shell gym-home-hero__content bayona-hero-prime">
          <div className="bayona-hero-prime__masthead" aria-label="Presentación de BAYONA">
            <span className="bayona-hero-prime__serial"><span aria-hidden="true" className="bayona-hero-prime__mark" /> B / 001</span>
            <span className="bayona-hero-prime__mastline" aria-hidden="true" />
            <span className="bayona-hero-prime__eyebrow">EL MOVIMIENTO EMPIEZA CONTIGO</span>
            <span className="bayona-hero-prime__chapter">PERSONAL · ONLINE · PARKOUR</span>
          </div>

          <div className="bayona-hero-prime__story">
            <p className="gym-home-kicker">ENTRENAMIENTO CON PROPÓSITO <span aria-hidden="true">/</span> MÉTODO BAYONA</p>
            <h1 id="home-hero-title" aria-label="Entrena con dirección">
              <span className="bayona-hero-prime__line">ENTRENA</span>
              <span className="bayona-hero-prime__line bayona-hero-prime__line--direction">CON <em>DIRECCIÓN.</em></span>
            </h1>
            <p className="gym-home-hero__lead">
              Entrenamiento pensado para tu cuerpo, tus objetivos y tu vida. Contigo desde el primer paso.
            </p>
            <div className="gym-home-hero__actions">
              <span className="gym-primary-button bayona-automatic-intro" role="status">
                SEBASTIÁN TE RECIBE AUTOMÁTICAMENTE <ArrowRight size={18} aria-hidden="true" />
              </span>
              <a className="gym-secondary-button" href="#servicios">
                VER CÓMO TE AYUDO <ArrowRight size={19} strokeWidth={1.7} aria-hidden="true" />
              </a>
            </div>
            <a
              className="gym-home-reward"
              href="#regalos"
              onClick={() => trackEvent('reward_preview_click', { source: 'home_hero' })}
            >
              <span className="bayona-hero-prime__gift-symbol"><Gift size={20} strokeWidth={1.5} aria-hidden="true" /></span>
              <span><strong>Empieza gratis.</strong> Tres recursos para ti.</span>
              <ArrowUpRight className="bayona-hero-prime__gift-arrow" size={17} aria-hidden="true" />
            </a>
          </div>

          <div className="bayona-hero-prime__footer">
            <span className="bayona-hero-prime__edition">BAYONA / CUERPO · MENTE · MOVIMIENTO</span>
            <span className="bayona-hero-prime__footline" aria-hidden="true" />
            <a href="#servicios" className="bayona-hero-prime__discover" onClick={() => trackEvent('hero_discover_services', { source: 'home_hero' })}>
              DESCUBRE TU CAMINO <ArrowDownRight size={20} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <AdaptiveDiscovery />

      <BayonaLiveAppShowcase placement="home" />

      <section className="gym-home-services bayona-services-prime" id="servicios" aria-labelledby="gym-services-title">
        <div className="gym-home-shell">
          <div className="gym-services-intro">
            <div className="gym-section-heading">
              <p className="bayona-services-prime__eyebrow"><span aria-hidden="true">02 / BAYONA</span> ELIGE TU CAMINO</p>
              <h2 id="gym-services-title">
                <span className="bayona-services-prime__ink">TU OBJETIVO.</span>
                <span className="bayona-services-prime__accent">TU FORMA <span>DE MOVERTE.</span></span>
              </h2>
            </div>
            <div className="gym-services-intro__aside">
              <span className="gym-services-intro__index">CUATRO FORMAS. UN MISMO COMPROMISO.</span>
              <p>Encuentra la forma de entrenar que encaja contigo.</p>
              <span className="gym-services-intro__rule" aria-hidden="true" />
            </div>
          </div>
          <div className="gym-service-grid" aria-label="Cuatro formas de entrenar con BAYONA">
            {SERVICES.map((service) => (
              <article
                className={`gym-service-card bayona-services-prime__card gym-service-card--${service.id} bayona-service-static${relevantServiceId === service.id ? " bayona-service-static--relevant" : ""}`}
                key={service.id}
              >
                <img src={service.image} alt="" width="1600" height="900" loading="lazy" decoding="async" />
                <span className="gym-service-card__veil" aria-hidden="true" />
                <div className="gym-service-card__top" aria-hidden="true">
                  <span><strong>{service.number}</strong><small> / 04</small></span>
                  <span>{service.type}</span>
                </div>
                <div className="gym-service-card__body">
                  <span className="gym-service-card__promise">{relevantServiceId === service.id ? "PUEDE ENCAJAR CONTIGO" : service.promise}</span>
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>
                  <span className="bayona-service-static__detail">{service.details}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="gym-services-outro">
            <p>¿No sabes cuál es para ti? Empezamos hablando. Sin compromiso.</p>
            <a className="gym-services-outro__link" href={evaluationUrl} target="_blank" rel="noopener noreferrer">
              CUÉNTAME TU OBJETIVO <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="home-memberships-section gym-home-plans" id="planes" aria-labelledby="home-offer-heading">
        <div className="gym-home-shell">
          <div className="gym-section-heading">
            <SectionLabel>MEMBRESÍAS</SectionLabel>
            <h2 id="home-offer-heading">ELIGE CÓMO <span>TE ACOMPAÑO.</span></h2>
            <p>{goal ? `Has elegido ${goal.label.toLowerCase()}. Compara los niveles de acompañamiento; ninguna elección se hace por ti.` : "Todo empieza con un objetivo. Elige cuánto seguimiento necesitas."}</p>
          </div>
          <HomeVisiblePlans projections={membershipPlanEditorialProjection} />
        </div>
      </section>

      <HomeMovementContexts />

      <GuidedStartJourney steps={START_STEPS} />



      <section className="gym-home-gifts" id="regalos" aria-labelledby="gym-gifts-title">
        <div className="gym-home-shell">
          <div className="gym-section-heading">
            <SectionLabel>RECURSOS DE INICIO</SectionLabel>
            <h2 id="gym-gifts-title">EMPIEZA HOY. <span>GRATIS.</span></h2>
            <p>Tres recursos para dar tu primer paso. Sin registro.</p>
          </div>
          <div className="gym-gift-grid">
            {GIFTS.map((gift) => (
              <a
                className="gym-gift-card"
                href={gift.href}
                download
                key={gift.href}
                onClick={() => trackEvent('gift_claim_click', { gift: gift.title })}
              >
                <img src={gift.image} alt="" width="1600" height="900" loading="lazy" decoding="async" />
                <div>
                  <span>{gift.tag}</span>
                  <h3>{gift.title}</h3>
                  <p>{gift.copy}</p>
                  <strong>DESCARGAR GRATIS <Download size={17} aria-hidden="true" /></strong>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="gym-home-lead" id="empieza" aria-labelledby="lead-magnet-title">
        <div className="gym-home-shell gym-home-lead__intro">
          <SectionLabel>TU SIGUIENTE PASO</SectionLabel>
          <h2>¿EMPEZAMOS A <span>HABLAR?</span></h2>
          <p>Cuéntame tu objetivo. Vemos si puedo ayudarte, sin compromiso.</p>
        </div>
        <LeadMagnet
          heading="Te escucho."
          copy="Descarga tus tres recursos sin registro. Si quieres acompañamiento, hablamos por WhatsApp."
        />
        <div className="gym-home-lead__fallback gym-home-shell">
          <span>También puedes hablar directamente conmigo.</span>
          <a
            href={evaluationUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('valuation_request_click', { source: 'home_fallback', channel: isBookingEnabled() ? 'booking' : 'whatsapp' })}
          >
            {isBookingEnabled() ? 'HABLEMOS DE TU OBJETIVO' : 'ESCRÍBEME POR WHATSAPP'} <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  )
}
