import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react'
import BayonaRealArchive from '../components/home/BayonaRealArchive.jsx'
import { bookingLink } from '../config/site.config.js'
import { trackEvent } from '../lib/analytics/analytics.js'
import './home-atelier.css'

const experiences = [
  {
    index: '01',
    label: 'MOVIMIENTO CON DIRECCIÓN',
    title: 'Entrenamiento',
    italic: 'personal.',
    description: 'Fuerza, técnica y acompañamiento adaptados a tu punto de partida.',
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
  const contactUrl = bookingLink('Hola Sebastián. He visto la nueva web de BAYONA y me gustaría conocer las opciones de entrenamiento según mi objetivo.')

  useEffect(() => {
    document.body.classList.add('bayona-luxury-active')
    return () => document.body.classList.remove('bayona-luxury-active')
  }, [])

  return (
    <div className="bayona-atelier" id="contenido-principal">
      <section className="atelier-hero" aria-labelledby="atelier-hero-title">
        <div className="atelier-hero__photo" role="img" aria-label="Escena editorial conceptual de entrenamiento en la costa al atardecer" />
        <div className="atelier-hero__shade" aria-hidden="true" />
        <div className="atelier-frame atelier-hero__content">
          <div className="atelier-hero__prelude">
            <span className="atelier-kicker">BAYONA <i aria-hidden="true" /> HUMAN MOVEMENT STUDIO</span>
            <span className="atelier-edition">EST. 2026 / ESPAÑA</span>
          </div>
          <div className="atelier-hero__statement">
            <p className="atelier-hero__eyebrow">LA CIENCIA SE ENCUENTRA CON EL MOVIMIENTO</p>
            <h1 id="atelier-hero-title">EL ARTE<br />DE <em>MOVERTE.</em></h1>
            <p className="atelier-hero__summary">Entrenamiento personal, parkour y una manera más consciente de desarrollar tu potencial.</p>
            <div className="atelier-hero__actions">
              <a className="atelier-button atelier-button--light" href="#experiencias" onClick={() => trackEvent('luxury_discover_click', { source: 'home_hero' })}>
                DESCUBRE TU CAMINO <ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
              </a>
              <a className="atelier-text-link" href="#metodo">CONOCE EL MÉTODO <ArrowDownRight size={17} strokeWidth={1.5} aria-hidden="true" /></a>
            </div>
          </div>
          <div className="atelier-hero__foot">
            <span>PERSONAL / ONLINE / PARKOUR</span>
            <span className="atelier-hero__hairline" aria-hidden="true" />
            <a href="#manifiesto">DESLIZA PARA DESCUBRIR <ArrowDownRight size={17} strokeWidth={1.4} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section className="atelier-manifesto" id="manifiesto" aria-labelledby="atelier-manifesto-heading">
        <div className="atelier-frame atelier-manifesto__grid">
          <div className="atelier-section-index"><span>01 / FILOSOFÍA</span><span>DONDE COMIENZA EL CAMBIO</span></div>
          <div className="atelier-manifesto__body">
            <h2 id="atelier-manifesto-heading">NO SE TRATA DE SER MÁS.<br /><em>SE TRATA DE SER TÚ,</em><br />EN MOVIMIENTO.</h2>
            <div className="atelier-manifesto__below">
              <p>Cada cuerpo tiene su historia. Cada persona, su propio ritmo. En BAYONA combinamos ciencia del entrenamiento, exploración del movimiento y atención individual para construir un camino con sentido.</p>
              <Link to="/about" className="atelier-link-dark">DESCUBRE NUESTRA FILOSOFÍA <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
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
                <div className="atelier-experience__image">
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

      <section className="atelier-digital" id="bayona-plus" aria-labelledby="atelier-digital-heading">
        <div className="atelier-frame atelier-digital__layout">
          <div className="atelier-digital__copy">
            <span className="atelier-section-index">04 / EL ECOSISTEMA DIGITAL</span>
            <span className="atelier-digital__overline">ENTRENA DONDE ESTÉS</span>
            <h2 id="atelier-digital-heading">TU EVOLUCIÓN.<br /><em>TAMBIÉN EN DIGITAL.</em></h2>
            <p>BAYONA+ reúne herramientas para organizar tus sesiones y acompañar tu progreso. Una experiencia que conecta tu entrenamiento con tu día a día.</p>
            <Link to="/app" className="atelier-button atelier-button--bronze">DESCUBRIR BAYONA+ <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="atelier-digital__media" aria-label="Vista real de la selección de roles de BAYONA+">
            <div className="atelier-digital__orbit" aria-hidden="true" />
            <div className="atelier-digital__device"><img src="/images/bayona-live-app/role-picker-mobile-crop-20261009.png" alt="Interfaz de BAYONA+ con opciones para elegir tu perfil" loading="lazy" decoding="async" /></div>
            <span className="atelier-digital__stamp">BAYONA+ / DIGITAL EXPERIENCE</span>
          </div>
        </div>
      </section>

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

      <section className="atelier-contact" id="empieza" aria-labelledby="atelier-contact-heading">
        <div className="atelier-frame atelier-contact__inner">
          <p className="atelier-kicker">TU SIGUIENTE CAPÍTULO</p>
          <h2 id="atelier-contact-heading">TODO EMPIEZA<br />CON <em>UN MOVIMIENTO.</em></h2>
          <p>Cuéntame qué buscas. Descubriremos si BAYONA es el lugar adecuado para empezar.</p>
          <div className="atelier-contact__actions">
            <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="atelier-button atelier-button--light" onClick={() => trackEvent('luxury_contact_click', { source: 'home_contact' })}>HABLEMOS DE TU OBJETIVO <ArrowUpRight size={17} aria-hidden="true" /></a>
            <Link to="/programs" className="atelier-text-link">EXPLORAR LOS SERVICIOS <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="atelier-contact__foot"><span>GANDÍA · ESPAÑA</span><span>ENTRENAMIENTO PRESENCIAL Y ONLINE</span><span>BY SEBASTIÁN BAYONA</span></div>
        </div>
      </section>
    </div>
  )
}
