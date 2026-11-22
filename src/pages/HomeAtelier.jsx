import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react'
import BayonaRealArchive from '../components/home/BayonaRealArchive.jsx'
import SBFlagship from '../components/home/SBFlagship.jsx'
import { LandingQuickNav, LandingFreeLibrary, LandingMonthBuilder, LandingMicroLessons } from '../components/home/HomeValueLead.jsx'
import { LandingWorldSections, LandingFAQAndBooking } from '../components/home/HomeWorldSections.jsx'
import { trackEvent } from '../lib/analytics/analytics.js'
import { whatsAppLink } from '../config/site.config.js'
import './home-atelier.css'
import './atelier-visual-revision.css'

const experiences = [
  {
    index: '01',
    label: 'MOVIMIENTO CON DIRECCIÓN',
    title: 'Entrenamiento',
    italic: 'online.',
    description: 'Fuerza, técnica y planificación a distancia adaptadas a tu punto de partida.',
    image: '/images/bayona-generated/home-pillar-build-1600.webp',
    href: '/programs',
    imageAlt: 'Escena editorial de entrenamiento funcional guiado junto al mar',
  },
  {
    index: '02',
    label: 'LA LIBERTAD DE MOVERSE',
    title: 'Parkour &',
    italic: 'rendimiento.',
    description: 'Aprende a leer el espacio, desarrollar control y evolucionar con criterio.',
    image: '/images/bayona-generated/parkour-hero-1600.webp',
    href: '/parkour-academy',
    imageAlt: 'Escena ilustrativa de una progresión de salto en un entorno urbano',
  },
  {
    index: '03',
    label: 'PROGRESAR A TU RITMO',
    title: 'Movimiento',
    italic: 'consciente.',
    description: 'Movilidad, hábitos y entrenamiento online para seguir avanzando.',
    image: '/images/bayona-generated/home-method-1600.webp',
    href: '/programs',
    imageAlt: 'Escena editorial de movilidad corporal al atardecer',
  },
]

const method = [
  { index: '01', title: 'Escuchamos', body: 'Tu historia, tu tiempo, tus objetivos y la forma en que te mueves.' },
  { index: '02', title: 'Diseñamos', body: 'Un proceso comprensible, progresivo y hecho para tu realidad.' },
  { index: '03', title: 'Evolucionamos', body: 'Observamos lo que funciona y ajustamos el camino contigo.' },
]

const resources = [
  { index: 'I', type: 'GUÍA · 7 DÍAS', name: 'Tu primera semana', href: '/downloads/bayona-editorial/primera-semana.pdf' },
  { index: 'II', type: 'CUADERNO · 30 DÍAS', name: 'Registro de progreso', href: '/downloads/bayona-editorial/registro-30-dias.pdf' },
  { index: 'III', type: 'DOSSIER PERSONAL', name: 'Tu punto de partida', href: '/downloads/bayona-editorial/dossier-punto-de-partida.pdf' },
]

export default function HomeAtelier() {

  useEffect(() => {
    document.body.classList.add('bayona-luxury-active')
    return () => document.body.classList.remove('bayona-luxury-active')
  }, [])

  return (
    <div className="bayona-atelier" id="contenido-principal">
      <section className="atelier-hero" aria-labelledby="atelier-hero-title">
        <div className="atelier-hero__photo" role="img" aria-label="Escena editorial conceptual de entrenamiento de velocidad junto al mar" />
        <div className="atelier-hero__shade" aria-hidden="true" />
        <span className="atelier-hero__visual-note">VISUAL EDITORIAL CONCEPTUAL</span>
        <div className="atelier-hero__signature" aria-hidden="true">
          <span>01 / HUMAN MOTION</span>
          <strong>ADAPTACIÓN.<br />CONTROL.<br />LIBERTAD.</strong>
          <span>SCIENCE × MOVEMENT</span>
        </div>
        <div className="atelier-frame atelier-hero__content">
          <div className="atelier-hero__prelude">
            <span className="atelier-kicker">SEBASTIÁN BAYONA <i aria-hidden="true" /> HUMAN MOVEMENT STUDIO</span>
            <span className="atelier-edition">COLOMBIA × ESPAÑA</span>
          </div>
          <div className="atelier-hero__statement">
            <p className="atelier-hero__eyebrow">DONDE LA CIENCIA SE ENCUENTRA CON EL MOVIMIENTO</p>
            <h1 id="atelier-hero-title"><span className="atelier-hero__person">SEBASTIÁN</span><em>BAYONA.</em></h1>
            <p className="atelier-hero__subhead">EL ARTE DE MOVERTE</p>
            <p className="atelier-hero__summary">De Colombia a España: entrenamiento online, parkour y recursos para avanzar con criterio. Una forma de moverte que empieza contigo.</p>
            <div className="atelier-hero__actions">
              <a className="atelier-button atelier-button--light" href="#ediciones" onClick={() => trackEvent('studio_home_market_hero', { source: 'home_hero' })}>
                EXPLORA TU EXPERIENCIA <ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
              </a>
              <a className="atelier-text-link" href="#regalos-gratis" onClick={() => trackEvent('studio_home_free_hero', { source: 'home_hero' })}>RECURSOS GRATIS <ArrowDownRight size={17} strokeWidth={1.5} aria-hidden="true" /></a>
            </div>
            <p className="atelier-hero__value-proof">GUÍAS GRATUITAS <span>·</span> PLAN INICIAL DE 4 SEMANAS <span>·</span> SIN REGISTRO</p>
          </div>
          <div className="atelier-hero__foot">
            <span>COLOMBIA / ESPAÑA / ONLINE / PARKOUR</span>
            <span className="atelier-hero__hairline" aria-hidden="true" />
            <a href="#manifiesto">DESLIZA PARA DESCUBRIR <ArrowDownRight size={17} strokeWidth={1.4} aria-hidden="true" /></a>
          </div>
        </div>
      </section>


      <section className="bayona-markets" id="ediciones" aria-labelledby="bayona-markets-title">
        <div className="atelier-frame">
          <div className="bayona-markets__intro">
            <span className="bayona-markets__eyebrow">02 / COLOMBIA × ESPAÑA</span>
            <div className="bayona-markets__heading">
              <h2 id="bayona-markets-title">DOS PAÍSES.<br /><em>UN SOLO MOVIMIENTO.</em></h2>
              <p>Mis raíces están en Colombia y construyo mi camino profesional desde España. Puedes consultar las opciones de acompañamiento online y descubrir por dónde empezar, estés donde estés.</p>
            </div>
          </div>
          <div className="bayona-markets__grid">
            <article className="bayona-markets__card">
              <span className="bayona-markets__code">ES / 01</span>
              <h3>España.</h3>
              <p>Entrenamiento online, planificación y recursos para avanzar con un método claro. Las modalidades presenciales se confirman por separado según disponibilidad y requisitos aplicables.</p>
              <a href={whatsAppLink('Hola, Sebastián. Te escribo desde España. Quiero conocer las opciones de acompañamiento online BAYONA y sus condiciones.')} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('studio_home_market_contact', { market: 'ES' })}>CONSULTAR DESDE ESPAÑA <ArrowUpRight size={18} aria-hidden="true" /></a>
            </article>
            <article className="bayona-markets__card bayona-markets__card--co">
              <span className="bayona-markets__code">CO / 02</span>
              <h3>Colombia.</h3>
              <p>Una conexión con mis raíces: entrenamiento online, seguimiento y materiales digitales que puedes explorar desde cualquier ciudad de Colombia.</p>
              <a href={whatsAppLink('Hola, Sebastián. Te escribo desde Colombia. Quiero conocer las opciones de acompañamiento online BAYONA y sus condiciones.')} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('studio_home_market_contact', { market: 'CO' })}>CONSULTAR DESDE COLOMBIA <ArrowUpRight size={18} aria-hidden="true" /></a>
            </article>
          </div>
          <p className="bayona-markets__note">Consultar no supone una reserva confirmada. Cobertura, disponibilidad, requisitos y precios se informan antes de contratar.</p>
        </div>
      </section>

      <LandingQuickNav />
      <LandingFreeLibrary />
      <LandingMonthBuilder />
      <LandingMicroLessons />

      <section className="atelier-manifesto" id="manifiesto" aria-labelledby="atelier-manifesto-heading">
        <div className="atelier-frame atelier-manifesto__grid">
          <div className="atelier-section-index"><span>01 / FILOSOFÍA</span><span>DONDE COMIENZA EL CAMBIO</span></div>
          <div className="atelier-manifesto__body">
            <h2 id="atelier-manifesto-heading">NINGÚN CAMINO<br />ES IGUAL.<br /><em>EL TUYO, TAMPOCO.</em></h2>
            <div className="atelier-manifesto__below">
              <p>Cada cuerpo tiene su historia. Cada persona, su propio ritmo. En este estudio combinamos ciencia del entrenamiento, exploración del movimiento y atención individual para construir un camino con sentido.</p>
              <Link to="/about" className="atelier-link-dark">DESCUBRE NUESTRA FILOSOFÍA <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
          <figure className="atelier-manifesto__figure">
            <img src="/images/bayona-generated/about-story-1600.webp" alt="Escena conceptual de una conversación durante una sesión de entrenamiento" width="1600" height="1000" loading="lazy" decoding="async" />
            <figcaption><span>ENFOQUE PERSONAL</span><span>FÍSICO · MENTAL · HUMANO</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="atelier-experiences" id="experiencias" aria-labelledby="atelier-experiences-heading">
        <div className="atelier-frame">
          <div className="atelier-section-top atelier-section-top--dark">
            <span className="atelier-section-index">02 / EXPERIENCIAS</span>
            <p>NO HAY DOS CAMINOS IGUALES.</p>
          </div>
          <div className="atelier-experiences__head">
            <h2 id="atelier-experiences-heading">ELIGE CÓMO<br /><em>QUIERES EVOLUCIONAR.</em></h2>
            <p>Tres formas de empezar. Un mismo principio: un movimiento que se adapta a ti.</p>
          </div>
          <div className="atelier-experiences__grid">
            {experiences.map((item) => (
              <Link to={item.href} className="atelier-experience" key={item.index} onClick={() => trackEvent('luxury_experience_click', { experience: item.index })}>
                <div
                  className="atelier-experience__image"
                  style={{ backgroundImage: `url(${item.image})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
                >
                  <img src={item.image} alt={item.imageAlt} loading="lazy" decoding="async" width="1600" height="1000" />
                  <span className="atelier-experience__number">{item.index} / 03</span>
                  <span className="atelier-experience__action" aria-hidden="true"><MoveUpRight size={22} strokeWidth={1.5} /></span>
                </div>
                <div className="atelier-experience__detail">
                  <span className="atelier-experience__eyebrow">{item.label}</span>
                  <h3>{item.title}<br /><em>{item.italic}</em></h3>
                  <p>{item.description}</p>
                  <span className="atelier-experience__explore">EXPLORAR EXPERIENCIA <ArrowRight size={16} aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="atelier-method" id="metodo" aria-labelledby="atelier-method-heading">
        <div className="atelier-method__photo" role="img" aria-label="Escena editorial de acompañamiento durante una sesión de entrenamiento" />
        <div className="atelier-frame atelier-method__layout">
          <div className="atelier-method__intro">
            <span className="atelier-section-index">03 / EL MÉTODO</span>
            <h2 id="atelier-method-heading">LA PRECISIÓN<br />DE UN PLAN.<br /><em>LA LIBERTAD DE SER.</em></h2>
            <p>No vendemos fórmulas universales. Elegimos lo que necesitas y construimos desde ahí.</p>
            <Link to="/programs" className="atelier-link-dark">CONOCER LOS PROGRAMAS <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
          <div className="atelier-method__steps">
            {method.map((item) => (
              <div className="atelier-method__step" key={item.index}>
                <span>{item.index}</span>
                <div><h3>{item.title}</h3><p>{item.body}</p></div>
                <ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <BayonaRealArchive />

      <SBFlagship />

      <LandingWorldSections />

      <section className="atelier-resources" id="recursos" aria-labelledby="atelier-resources-heading">
        <div className="atelier-frame">
          <div className="atelier-section-top">
            <span className="atelier-section-index">05 / PARA EMPEZAR</span>
            <span>UN PRIMER PASO, SIN COSTE.</span>
          </div>
          <div className="atelier-resources__head">
            <h2 id="atelier-resources-heading">EL CONOCIMIENTO<br /><em>TAMBIÉN SE COMPARTE.</em></h2>
            <p>Tres recursos preparados para ayudarte a entender tu punto de partida. Descárgalos sin registro.</p>
          </div>
          <div className="atelier-resources__list">
            {resources.map((item) => (
              <a className="atelier-resource" href={item.href} download key={item.index} onClick={() => trackEvent('luxury_resource_click', { resource: item.index })}>
                <span className="atelier-resource__number">{item.index}</span>
                <span className="atelier-resource__name">{item.name}<small>{item.type}</small></span>
                <span className="atelier-resource__download">DESCARGAR <ArrowUpRight size={19} strokeWidth={1.4} aria-hidden="true" /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <LandingFAQAndBooking />
    </div>
  )
}
