import { ArrowUpRight, Dumbbell, HeartPulse, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero, SectionLabel } from '../components/Layout'
import PlanExplorer from '../components/conversion/PlanExplorer.jsx'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import { membershipPlanEditorialProjection } from '../config/conversionContent.js'
import { siteMedia } from '../config/siteMedia.js'
import {
  COMMERCIAL_SCOPE_NOTICE,
  editorialServices,
  serviceCategoryDefinitions,
} from '../config/offerings.js'
import '../styles/home.css'
import '../styles/home-luxury-conversion.css'
import '../styles/services-gym-v2.css'

const CATEGORY_ICONS = Object.freeze({
  CLASES: Dumbbell,
  RECUPERACIÓN: HeartPulse,
  RENDIMIENTO: Trophy,
})

const CATEGORY_COPY = Object.freeze({
  CLASES: 'Entrenamiento personal y sesiones guiadas para avanzar con técnica y correcciones.',
  RECUPERACIÓN: 'Movilidad y recuperación para complementar el entrenamiento y mantener continuidad.',
  RENDIMIENTO: 'Parkour, calistenia, preparación física y evaluaciones para objetivos específicos.',
})

const CATEGORY_IMAGES = Object.freeze({
  CLASES: '/images/bayona-generated/home-pillar-build-1600.webp',
  RECUPERACIÓN: '/images/bayona-generated/home-pillar-read-1600.webp',
  RENDIMIENTO: '/images/bayona-generated/home-pillar-track-1600.webp',
})

const SERVICE_GROUPS = serviceCategoryDefinitions.map((category) => ({
  ...category,
  services: editorialServices.filter((service) => service.category === category.id),
}))

export default function Programs() {
  return (
    <div className="services-page">
      <PageHero
        title="NUESTROS SERVICIOS."
        kicker="BAYONA · ENTRENAMIENTO Y ACOMPAÑAMIENTO"
        media={siteMedia.programs.hero}
      >
        <p>
          Entrenamiento personal, online, recuperación y rendimiento. Elige seguimiento continuo o una sesión puntual. Precios y alcance visibles antes de consultar.
        </p>
        <div className="services-hero-actions">
          <a className="services-primary-cta" href="#membresias">
            VER MEMBRESÍAS <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a className="services-secondary-cta" href="#servicios">
            VER SERVICIOS SUELTOS
          </a>
        </div>
      </PageHero>

      <section className="services-overview" aria-labelledby="services-overview-title">
        <div className="services-shell">
          <div className="services-heading">
            <SectionLabel>ELIGE TU NECESIDAD</SectionLabel>
            <h2 id="services-overview-title">ENTRENAMIENTO. RECUPERACIÓN. RENDIMIENTO.</h2>
            <p>Entra por el objetivo que tienes hoy. Los detalles vienen después.</p>
          </div>
          <div className="services-overview-grid">
            {SERVICE_GROUPS.map((group) => {
              const Icon = CATEGORY_ICONS[group.id] ?? Dumbbell
              return (
                <a className="services-overview-card" href={`#servicios-${group.id.toLowerCase()}`} key={group.id}>
                  <img src={CATEGORY_IMAGES[group.id]} alt="" width="1600" height="900" loading="lazy" decoding="async" />
                  <span className="services-overview-card__shade" aria-hidden="true" />
                  <div>
                    <Icon size={24} aria-hidden="true" />
                    <span>{String(group.services.length).padStart(2, '0')} SERVICIOS</span>
                    <h3>{group.title}</h3>
                    <p>{CATEGORY_COPY[group.id]}</p>
                    <strong>EXPLORAR <ArrowUpRight size={16} aria-hidden="true" /></strong>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <section className="home-memberships-section services-memberships" id="membresias" aria-labelledby="services-memberships-title">
        <div className="services-shell">
          <div className="services-heading">
            <SectionLabel>ACOMPAÑAMIENTO CONTINUO</SectionLabel>
            <h2 id="services-memberships-title">ELIGE TU NIVEL DE ACOMPAÑAMIENTO.</h2>
            <p>Compara frecuencia de seguimiento, sesiones incluidas y precio.</p>
          </div>
          <PlanExplorer projections={membershipPlanEditorialProjection} cinematic />
        </div>
      </section>

      <section className="services-catalog" id="servicios" aria-labelledby="services-catalog-title">
        <div className="services-shell">
          <div className="services-heading">
            <SectionLabel>SERVICIOS SUELTOS</SectionLabel>
            <h2 id="services-catalog-title">UNA SESIÓN CUANDO LA NECESITAS.</h2>
            <p>Entrenamiento, evaluación o recuperación sin contratar más de lo que necesitas.</p>
          </div>

          <div className="services-catalog-groups">
            {SERVICE_GROUPS.map((group, groupIndex) => (
              <section
                id={`servicios-${group.id.toLowerCase()}`}
                className="services-catalog-group"
                key={group.id}
                {...sceneBackgroundProps(siteMedia.programs.services[groupIndex], {
                  className: 'services-catalog-group',
                  variant: 'subtle',
                  position: 'center 42%',
                  overlay: '82%',
                })}
              >
                <header>
                  <span>{String(groupIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{group.title}</h3>
                    <p>{CATEGORY_COPY[group.id]}</p>
                  </div>
                </header>
                <div className="services-card-grid">
                  {group.services.map((service) => (
                    <article className="services-card" key={service.id}>
                      <div className="services-card__top">
                        <span>{service.presencial ? 'PRESENCIAL · SEGÚN UBICACIÓN' : 'DISPONIBILIDAD A CONFIRMAR'}</span>
                        <strong>{service.priceDisplay} COP</strong>
                      </div>
                      <h4>{service.label}</h4>
                      <p>{service.description}</p>
                      <a href={service.cta} target="_blank" rel="noreferrer">
                        CONSULTAR DISPONIBILIDAD <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="services-scope-note">{COMMERCIAL_SCOPE_NOTICE}</p>
        </div>
      </section>

      <section className="services-final">
        <div className="services-shell">
          <SectionLabel>EMPIEZA SIN COMPRAR</SectionLabel>
          <h2>EMPIEZA GRATIS. DESPUÉS DECIDE.</h2>
          <p>Recibe tres recursos de inicio y pide una valoración cuando quieras.</p>
          <div>
            <a className="services-primary-cta" href="/#empieza">
              EMPIEZA GRATIS <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <Link className="services-secondary-cta" to="/faq">VER PREGUNTAS FRECUENTES</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
