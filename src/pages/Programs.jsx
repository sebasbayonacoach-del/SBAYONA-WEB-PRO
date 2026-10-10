import { useEffect } from 'react'
import { ArrowRight, ArrowUpRight, Dumbbell, HeartPulse, Trophy } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { PageHero, SectionLabel } from '../components/Layout'
import PlanExplorer from '../components/conversion/PlanExplorer.jsx'
import { membershipPlanEditorialProjection } from '../config/conversionContent.js'
import { siteMedia } from '../config/siteMedia.js'
import {
  COMMERCIAL_SCOPE_NOTICE,
  buildWhatsAppUrl,
  membershipComparisonRows,
  editorialServices,
  serviceCategoryDefinitions,
} from '../config/offerings.js'
import '../styles/home.css'
import '../styles/home-luxury-conversion.css'
import '../styles/services-gym-v2.css'
import '../styles/services-premium-2026.css'
import '../styles/bayona-chapter-finishing-2026.css'

const SERVICE_PATHS = Object.freeze([
  {
    id: 'personal',
    number: '01',
    eyebrow: 'ATENCIÓN INDIVIDUAL',
    title: 'Entrenamiento personal',
    description: 'Un espacio contigo: escuchamos tus objetivos y adaptamos cada sesión a tu punto de partida.',
    image: '/images/bayona-generated/home-pillar-build-1600.webp',
    href: '#servicios-clases',
    cta: 'CONOCER SESIONES',
  },
  {
    id: 'online',
    number: '02',
    eyebrow: 'ACOMPAÑAMIENTO CONTINUO',
    title: 'Entrenamiento online',
    description: 'Tu ritmo y tu espacio, con una planificación clara, vídeos y el seguimiento incluido en tu plan.',
    image: '/images/bayona-generated/home-method-1600.webp',
    href: '#membresias',
    cta: 'COMPARAR PLANES',
  },
  {
    id: 'parkour',
    number: '03',
    eyebrow: 'TÉCNICA Y MOVIMIENTO',
    title: 'Parkour y rendimiento',
    description: 'Aprende a moverte con más control, fuerza y confianza, sin saltarte los fundamentos.',
    image: '/images/bayona-generated/parkour-hero-1600.webp',
    href: '/parkour-academy',
    cta: 'EXPLORAR PARKOUR',
  },
  {
    id: 'recovery',
    number: '04',
    eyebrow: 'MOVILIDAD Y HÁBITOS',
    title: 'Movilidad y recuperación',
    description: 'Dale espacio a la movilidad y al cuidado de tu cuerpo para seguir entrenando con bienestar.',
    image: '/images/bayona-generated/home-pillar-read-1600.webp',
    href: '#servicios-recuperación',
    cta: 'VER OPCIONES',
  },
])

const CATEGORY_DETAILS = Object.freeze({
  CLASES: {
    icon: Dumbbell,
    label: 'Sesiones guiadas',
    short: 'Entrena acompañado',
    description: 'Sesiones individuales o grupales, virtuales y presenciales cuando corresponda.',
  },
  RECUPERACIÓN: {
    icon: HeartPulse,
    label: 'Movilidad y recuperación',
    short: 'Recupera continuidad',
    description: 'Opciones complementarias para moverte con más control y sostener tu entrenamiento.',
  },
  RENDIMIENTO: {
    icon: Trophy,
    label: 'Parkour y preparación',
    short: 'Desarrolla tus capacidades',
    description: 'Parkour, calistenia, preparación física y análisis del movimiento.',
  },
})

const SERVICE_NAMES = Object.freeze({
  'virtual-1to1': 'Entrenamiento individual online · 1:1',
  'presencial-bogota-1to1': 'Entrenamiento personal presencial · Bogotá',
  'grupal-virtual': 'Entrenamiento grupal online',
  'masaje-deportivo': 'Masaje deportivo presencial',
  'protocolo-recuperacion': 'Rutina guiada de recuperación',
  'movilidad-asistida': 'Sesión de movilidad asistida',
  'pilates-1to1': 'Pilates individual · 1:1',
  'yoga-terapeutico': 'Yoga y movilidad guiada',
  'parkour-tecnico': 'Parkour · técnica y progresiones',
  'boxeo-funcional': 'Entrenamiento funcional de boxeo',
  'calistenia-avanzada': 'Calistenia y fuerza corporal',
  'preparacion-fisica': 'Preparación física deportiva',
  biohacking: 'Hábitos para el rendimiento',
  'evaluacion-biomecanica': 'Análisis del movimiento',
  'composicion-corporal': 'Análisis de composición corporal',
  'alimentacion-avanzada': 'Orientación alimentaria avanzada',
})

const PROGRAM_COMPARISON_ROWS = membershipComparisonRows.map((row) => ({
  ...row,
  feature: row.feature === 'Biohacking'
    ? 'Hábitos y seguimiento del rendimiento'
    : row.feature === 'Evaluación biomecánica'
      ? 'Análisis del movimiento'
      : row.feature,
}))

const SERVICE_GROUPS = serviceCategoryDefinitions.map((category) => ({
  ...category,
  ...CATEGORY_DETAILS[category.id],
  services: editorialServices.filter((service) => service.category === category.id),
}))

function serviceConsultationLink(service) {
  const label = SERVICE_NAMES[service.id] || service.label
  return buildWhatsAppUrl([
    `Hola BAYONA, quiero consultar por ${label}.`,
    `Precio de referencia publicado: ${service.priceDisplay} COP.`,
    '¿Está disponible para mi ubicación y qué incluye exactamente?',
  ].join('\n'))
}

export default function Programs() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash.startsWith('#servicios-')) return
    const targetId = decodeURIComponent(location.hash.slice(1))
    const section = document.getElementById(targetId)
    if (section?.classList.contains('services-catalog-group')) {
      const details = section.querySelector('details')
      if (details) details.open = true
    }
  }, [location.hash])

  return (
    <div className="services-page">
      <PageHero
        title="NUESTROS SERVICIOS."
        kicker="BAYONA · ENTRENAMIENTO Y ACOMPAÑAMIENTO"
        media={siteMedia.programs.hero}
      >
        <p>
          Cada persona llega con una historia, un objetivo y un momento distinto. Encuentra la forma de entrenamiento que encaje contigo y descubre con claridad qué incluye antes de elegir.
        </p>
        <div className="services-hero-actions">
          <a className="services-primary-cta" href="#membresias">
            VER MEMBRESÍAS <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a className="services-secondary-cta" href="#servicios">
            EXPLORAR SESIONES
          </a>
        </div>
      </PageHero>

      <section className="services-overview" id="elige-servicio" aria-labelledby="services-overview-title">
        <div className="services-shell">
          <div className="services-heading services-paths-heading">
            <SectionLabel>ELIGE TU CAMINO</SectionLabel>
            <h2 id="services-overview-title">UN CAMINO QUE <span>SE ADAPTE A TI.</span></h2>
            <p>Explora sin prisa: te explicamos cada opción para que puedas elegir la que más sentido tenga para ti.</p>
          </div>
          <div className="services-path-grid">
            {SERVICE_PATHS.map((service) => (
              <a className={`services-path-card services-path-card--${service.id}`} href={service.href} key={service.id}>
                <img src={service.image} alt="" width="1600" height="900" loading="eager" decoding="async" />
                <span className="services-path-card__shade" aria-hidden="true" />
                <div className="services-path-card__meta" aria-hidden="true">
                  <span>{service.number} / 04</span>
                  <span>{service.eyebrow}</span>
                </div>
                <div className="services-path-card__body">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <span className="services-path-card__action">
                    {service.cta} <ArrowUpRight size={22} aria-hidden="true" />
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="services-path-footnote">
            <span>¿PREFIERES UNA SESIÓN PUNTUAL?</span>
            <a href="#servicios">REVISA EL CATÁLOGO Y LOS PRECIOS <ArrowRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section className="home-memberships-section services-memberships" id="membresias" aria-labelledby="services-memberships-title">
        <div className="services-shell">
          <div className="services-heading">
            <SectionLabel>ACOMPAÑAMIENTO CONTINUO</SectionLabel>
            <h2 id="services-memberships-title">ELIGE CUÁNTO ACOMPAÑAMIENTO NECESITAS.</h2>
            <p>Compara frecuencia de seguimiento, sesiones incluidas y precio.</p>
          </div>
          <PlanExplorer projections={membershipPlanEditorialProjection} comparisonRows={PROGRAM_COMPARISON_ROWS} cinematic />
        </div>
      </section>

      <section className="services-catalog" id="servicios" aria-labelledby="services-catalog-title">
        <div className="services-shell">
          <div className="services-heading">
            <SectionLabel>SESIONES Y SERVICIOS ADICIONALES</SectionLabel>
            <h2 id="services-catalog-title">ENCUENTRA LA SESIÓN QUE NECESITAS.</h2>
            <p>Explora las sesiones disponibles por disciplina. Los importes son referencias en COP; confirma modalidad y ubicación antes de contratar.</p>
          </div>

          <nav className="services-catalog-index" aria-label="Categorías del catálogo">
            {SERVICE_GROUPS.map((group, index) => {
              const Icon = group.icon
              return (
                <a className="services-overview-card" key={group.id} href={`#servicios-${group.id.toLowerCase()}`}>
                  <Icon size={22} aria-hidden="true" />
                  <span className="services-overview-card__number">0{index + 1} / 03</span>
                  <strong>{group.label}</strong>
                  <span>{group.short}</span>
                  <ArrowUpRight size={19} aria-hidden="true" />
                </a>
              )
            })}
          </nav>

          <div className="services-catalog-groups">
            {SERVICE_GROUPS.map((group, groupIndex) => (
              <section
                id={`servicios-${group.id.toLowerCase()}`}
                className="services-catalog-group"
                key={group.id}
              >
                <details className="services-catalog-details" open={groupIndex === 0}>
                  <summary className="services-catalog-summary">
                    <span className="services-catalog-summary__number">0{groupIndex + 1}</span>
                    <span className="services-catalog-summary__name">
                      <strong>{group.label}</strong>
                      <small>{group.description}</small>
                    </span>
                    <span className="services-catalog-summary__count">{group.services.length} OPCIONES</span>
                    <span className="services-catalog-summary__toggle" aria-hidden="true">+</span>
                  </summary>
                  <div className="services-card-grid">
                    {group.services.map((service) => (
                      <article className="services-card" data-service-id={service.id} key={service.id}>
                        <div className="services-card__top">
                          <span>{service.presencial ? 'PRESENCIAL · CONSULTAR UBICACIÓN' : 'MODALIDAD Y DISPONIBILIDAD A CONFIRMAR'}</span>
                          <strong>{service.priceDisplay} COP</strong>
                        </div>
                        <h4>{SERVICE_NAMES[service.id] || service.label}</h4>
                        <p>{service.description}</p>
                        <a href={serviceConsultationLink(service)} target="_blank" rel="noreferrer">
                          CONSULTAR ESTE SERVICIO <ArrowUpRight size={15} aria-hidden="true" />
                        </a>
                      </article>
                    ))}
                  </div>
                </details>
              </section>
            ))}
          </div>

          <p className="services-scope-note">{COMMERCIAL_SCOPE_NOTICE}</p>
        </div>
      </section>

      <section className="services-final">
        <div className="services-shell">
          <SectionLabel>PRIMERO TU BIENESTAR</SectionLabel>
          <h2>CONÓCENOS. DESCUBRE. Y TÚ DECIDES.</h2>
          <p>Tres recursos gratuitos para comenzar con calma. Si después quieres acompañamiento, hablamos de tu objetivo y valoramos juntos las opciones.</p>
          <div>
            <a className="services-primary-cta" href="/#empieza">
              EMPEZAR A MI RITMO <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <Link className="services-secondary-cta" to="/faq">VER PREGUNTAS FRECUENTES</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
