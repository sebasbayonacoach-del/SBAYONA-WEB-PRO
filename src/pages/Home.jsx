import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Download, Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionLabel } from '../components/Layout'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import LeadMagnet from '../components/leads/LeadMagnet.jsx'
import PlanExplorer from '../components/conversion/PlanExplorer.jsx'
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

const SERVICES = Object.freeze([
  {
    id: 'personal',
    number: '01',
    type: 'GUÍA PERSONAL',
    promise: 'UNA SESIÓN HECHA PARA TI',
    title: 'Entrenamiento personal',
    copy: 'Escuchamos tu objetivo, observamos cómo te mueves y adaptamos el trabajo a tu momento.',
    image: '/images/bayona-generated/home-pillar-build-1600.webp',
    href: '/programs#servicios-clases',
  },
  {
    id: 'online',
    number: '02',
    type: 'A TU RITMO',
    promise: 'ENTRENA ESTÉS DONDE ESTÉS',
    title: 'Entrenamiento online',
    copy: 'Tu espacio, tus horarios y un plan claro: vídeos, estructura semanal y seguimiento según el servicio que elijas.',
    image: '/images/bayona-generated/home-method-1600.webp',
    href: '/programs#membresias',
  },
  {
    id: 'parkour',
    number: '03',
    type: 'MOVIMIENTO Y TÉCNICA',
    promise: 'CONFIANZA EN MOVIMIENTO',
    title: 'Parkour y rendimiento',
    copy: 'Parkour para niños, jóvenes y adultos: aprendemos desde la base, con progresión, atención y criterio.',
    image: '/images/bayona-generated/parkour-hero-1600.webp',
    href: '/parkour-academy',
  },
  {
    id: 'recovery',
    number: '04',
    type: 'MOVERTE MEJOR',
    promise: 'MOVERTE MEJOR TAMBIÉN ES AVANZAR',
    title: 'Movilidad y recuperación',
    copy: 'Un espacio para cuidar tu movilidad, escuchar tu cuerpo y acompañar tu entrenamiento.',
    image: '/images/bayona-generated/home-pillar-read-1600.webp',
    href: '/programs#servicios-recuperación',
  },
])

const START_STEPS = Object.freeze([
  {
    number: '01',
    title: 'Cuéntame qué necesitas',
    copy: 'Nos conocemos por tu nombre. Me cuentas tu objetivo cuando hablemos; no necesitas crear una cuenta.',
  },
  {
    number: '02',
    title: 'Llévate algo útil desde hoy',
    copy: 'Tendrás tres recursos gratuitos para observar tus hábitos y dar tus primeros pasos con claridad.',
  },
  {
    number: '03',
    title: 'Hablemos cuando quieras',
    copy: 'Si buscas acompañamiento, podemos coordinar una valoración y encontrar juntos el servicio apropiado. Tú decides.',
  },
])

const GIFTS = Object.freeze([
  {
    tag: 'GUÍA · 7 DÍAS',
    title: 'Tu primera semana',
    copy: 'Una guía amable y práctica para que la primera semana tenga sentido para ti.',
    href: '/downloads/bayona-editorial/primera-semana.pdf',
    image: '/images/bayona-generated/home-pillar-read-1600.webp',
  },
  {
    tag: 'WORKBOOK · 30 DÍAS',
    title: 'Registro de 30 días',
    copy: 'Un espacio para registrar cómo te sientes, reconocer avances y aprender de cada semana.',
    href: '/downloads/bayona-editorial/registro-30-dias.pdf',
    image: '/images/bayona-generated/resources-challenge-1600.webp',
  },
  {
    tag: 'DOSSIER',
    title: 'Tu punto de partida',
    copy: 'Aclara qué quieres conseguir, cuánto tiempo tienes y por dónde empezar sin exigirte de más.',
    href: '/downloads/bayona-editorial/dossier-punto-de-partida.pdf',
    image: '/images/bayona-generated/home-free-kit-1600.webp',
  },
])

const TRUST_POINTS = Object.freeze([
  'Primero escuchamos tu contexto, capacidades y límites; después diseñamos cómo entrenar.',
  'Te acompañamos con la cercanía y el seguimiento de tu plan.',
  'Sabes qué incluye cada servicio y cuánto cuesta antes de decidir.',
  'Puedes empezar con recursos gratuitos, sin obligación de comprar.',
])

export default function Home() {
  const evaluationUrl = bookingLink('Hola, soy una persona interesada en BAYONA. Me gustaría contarte mi objetivo y ver si podemos coordinar una valoración inicial.')

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
              No hay dos cuerpos iguales. Construimos fuerza, confianza y movimiento a partir de tu historia, a tu ritmo.
            </p>
            <div className="gym-home-hero__actions">
              <a
                className="gym-primary-button"
                href="#empieza"
                onClick={() => trackEvent('funnel_start_click', { source: 'home_hero' })}
              >
                EMPIEZA A TU RITMO <ArrowUpRight size={20} strokeWidth={1.7} aria-hidden="true" />
              </a>
              <Link className="gym-secondary-button" to="/programs">
                EXPLORA LOS SERVICIOS <ArrowRight size={19} strokeWidth={1.7} aria-hidden="true" />
              </Link>
            </div>
            <a
              className="gym-home-reward"
              href="#regalos"
              onClick={() => trackEvent('reward_preview_click', { source: 'home_hero' })}
            >
              <span className="bayona-hero-prime__gift-symbol"><Gift size={20} strokeWidth={1.5} aria-hidden="true" /></span>
              <span><strong>Un comienzo sin coste.</strong> Tres recursos para descubrir tu punto de partida.</span>
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
              <p>Entrenamiento personal, online, parkour o movilidad. Cuatro caminos para avanzar desde donde estás, con atención y dirección.</p>
              <span className="gym-services-intro__rule" aria-hidden="true" />
            </div>
          </div>
          <div className="gym-service-grid" aria-label="Cuatro formas de entrenar con BAYONA">
            {SERVICES.map((service) => (
              <Link
                className={`gym-service-card bayona-services-prime__card gym-service-card--${service.id}`}
                to={service.href}
                key={service.id}
                onClick={() => trackEvent('service_card_click', { service: service.id, source: 'home_services' })}
              >
                <img src={service.image} alt="" width="1600" height="900" loading="eager" fetchpriority="low" decoding="async" />
                <span className="gym-service-card__veil" aria-hidden="true" />
                <div className="gym-service-card__top" aria-hidden="true">
                  <span><strong>{service.number}</strong><small> / 04</small></span>
                  <span>{service.type}</span>
                </div>
                <div className="gym-service-card__body">
                  <span className="gym-service-card__promise">{service.promise}</span>
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>
                  <span className="gym-service-card__bottom">
                    <span>DESCUBRIR EL SERVICIO</span>
                    <span className="gym-service-card__action" aria-hidden="true">
                      <ArrowUpRight size={23} strokeWidth={1.65} />
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="gym-services-outro">
            <p>¿Todavía no sabes por dónde empezar? Está bien. Explora cada opción con calma y elige cuando lo tengas claro.</p>
            <Link className="gym-services-outro__link" to="/programs">
              EXPLORAR TODOS LOS SERVICIOS <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link className="gym-services-outro__link" to="/movimiento-adaptado">
              ENTRENAMIENTO Y CONDICIONES DE SALUD <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <AdaptiveDiscovery />

      <GuidedStartJourney steps={START_STEPS} />

      <section className="home-memberships-section gym-home-plans" aria-labelledby="home-offer-heading">
        <div className="gym-home-shell">
          <div className="gym-section-heading">
            <SectionLabel>MEMBRESÍAS</SectionLabel>
            <h2 id="home-offer-heading">EL APOYO QUE NECESITAS. A TU RITMO.</h2>
            <p>Hay momentos para entrenar por tu cuenta y otros para sentirte más acompañado. Compara lo que incluye cada plan y elige con tranquilidad.</p>
          </div>
          <PlanExplorer projections={membershipPlanEditorialProjection} cinematic />
          <Link className="gym-inline-link" to="/programs">
            COMPARAR SERVICIOS Y SESIONES <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <BayonaLiveAppShowcase placement="home" />

      <section className="gym-home-trust" aria-labelledby="gym-trust-title">
        <div className="gym-home-shell gym-trust-layout">
          <div>
            <SectionLabel>ENTRENAR CON CLARIDAD</SectionLabel>
            <h2 id="gym-trust-title">ENTRENAR CON CUIDADO TAMBIÉN ES PROGRESAR.</h2>
          </div>
          <ul>
            {TRUST_POINTS.map((point) => (
              <li key={point}><Check size={18} aria-hidden="true" />{point}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="gym-home-gifts" id="regalos" aria-labelledby="gym-gifts-title">
        <div className="gym-home-shell">
          <div className="gym-section-heading">
            <SectionLabel>RECURSOS DE INICIO</SectionLabel>
            <h2 id="gym-gifts-title">UN BUEN COMIENZO NO TIENE PRECIO.</h2>
            <p>He preparado tres recursos prácticos para ayudarte a empezar. Conócelos con calma y, si te sirven, recíbelos gratis al dejar tu nombre y un contacto.</p>
          </div>
          <div className="gym-gift-grid">
            {GIFTS.map((gift) => (
              <a
                className="gym-gift-card"
                href="#empieza"
                key={gift.href}
                onClick={() => trackEvent('gift_claim_click', { gift: gift.title })}
              >
                <img src={gift.image} alt="" width="1600" height="900" loading="lazy" decoding="async" />
                <div>
                  <span>{gift.tag}</span>
                  <h3>{gift.title}</h3>
                  <p>{gift.copy}</p>
                  <strong>RECIBIR GRATIS <Download size={17} aria-hidden="true" /></strong>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="gym-home-lead" id="empieza" aria-labelledby="lead-magnet-title">
        <div className="gym-home-shell gym-home-lead__intro">
          <SectionLabel>TU SIGUIENTE PASO</SectionLabel>
          <h2>EMPIEZA A TU RITMO. YO TE ACOMPAÑO.</h2>
          <p>
            No necesitas tenerlo todo resuelto para dar el primer paso. Deja tu nombre y una forma de contacto: tendrás acceso a tres recursos gratuitos. Si después quieres hablar de tus objetivos, podemos coordinar una valoración. Sin prisas ni compromiso de compra.
          </p>
        </div>
        <LeadMagnet
          heading="Tu primer paso ya cuenta."
          copy="Me gustaría saber cómo te llamas. Deja tu nombre y un correo o WhatsApp: al enviar el formulario podrás abrir tus tres recursos de inicio. Si quieres, después hablamos de tu entrenamiento."
        />
        <div className="gym-home-lead__fallback gym-home-shell">
          <span>¿Te sentirías más cómodo hablando primero?</span>
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
