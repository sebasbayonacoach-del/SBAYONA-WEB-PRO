import { ArrowRight, ArrowUpRight, Check, Download, Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionLabel } from '../components/Layout'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import LeadMagnet from '../components/leads/LeadMagnet.jsx'
import PlanExplorer from '../components/conversion/PlanExplorer.jsx'
import { membershipPlanEditorialProjection } from '../config/conversionContent.js'
import { siteMedia } from '../config/siteMedia.js'
import { whatsAppLink } from '../config/site.config.js'
import '../styles/home.css'
import '../styles/home-luxury-conversion.css'
import '../styles/home-gym-funnel-v2.css'

const SERVICES = Object.freeze([
  {
    id: 'personal',
    title: 'Entrenamiento personal',
    copy: 'Sesiones 1:1 con una ruta construida alrededor de tu objetivo, tu nivel y tu semana.',
    image: '/images/bayona-generated/home-pillar-build-1600.webp',
    href: '/programs#servicios',
  },
  {
    id: 'online',
    title: 'Entrenamiento online',
    copy: 'Plan claro, vídeos, seguimiento y ajustes para entrenar estés donde estés.',
    image: '/images/bayona-generated/home-method-1600.webp',
    href: '/programs',
  },
  {
    id: 'parkour',
    title: 'Parkour y rendimiento',
    copy: 'Técnica, fuerza, control y progresiones para niños, jóvenes y adultos.',
    image: '/images/bayona-generated/home-pillar-track-1600.webp',
    href: '/parkour-academy',
  },
  {
    id: 'recovery',
    title: 'Movilidad y recuperación',
    copy: 'Trabajo complementario para moverte mejor, recuperar y sostener tu entrenamiento.',
    image: '/images/bayona-generated/home-pillar-read-1600.webp',
    href: '/programs#servicios',
  },
])

const START_STEPS = Object.freeze([
  {
    number: '01',
    title: 'Cuéntanos qué buscas',
    copy: 'Deja tu nombre y tu contacto. No necesitas crear una cuenta.',
  },
  {
    number: '02',
    title: 'Recibe tu punto de partida',
    copy: 'Te llevas tres recursos gratuitos y una orientación inicial para ordenar tu semana.',
  },
  {
    number: '03',
    title: 'Agenda y empieza',
    copy: 'Acordamos una valoración y, si tiene sentido para ti, eliges el servicio adecuado.',
  },
])

const GIFTS = Object.freeze([
  {
    tag: 'GUÍA · 7 DÍAS',
    title: 'Tu primera semana',
    copy: 'Una estructura sencilla para empezar sin improvisar.',
    href: '/downloads/bayona-editorial/primera-semana.pdf',
    image: '/images/bayona-generated/home-pillar-read-1600.webp',
  },
  {
    tag: 'WORKBOOK · 30 DÍAS',
    title: 'Registro de 30 días',
    copy: 'Sesiones, energía y aprendizajes en un único lugar.',
    href: '/downloads/bayona-editorial/registro-30-dias.pdf',
    image: '/images/bayona-generated/resources-challenge-1600.webp',
  },
  {
    tag: 'DOSSIER',
    title: 'Tu punto de partida',
    copy: 'Objetivo, tiempo disponible y recursos ordenados antes de elegir un plan.',
    href: '/downloads/bayona-editorial/dossier-punto-de-partida.pdf',
    image: '/images/bayona-generated/home-free-kit-1600.webp',
  },
])

const TRUST_POINTS = Object.freeze([
  'Entrenamiento adaptado a tu contexto real.',
  'Seguimiento según el nivel de acompañamiento que eliges.',
  'Precios y alcance visibles antes de enviar una solicitud.',
  'Puedes empezar con recursos gratuitos antes de pagar.',
])

export default function Home() {
  const evaluationUrl = whatsAppLink('Hola BAYONA, quiero agendar una valoración inicial y saber qué servicio encaja conmigo.')

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
        <div className="gym-home-shell gym-home-hero__content">
          <p className="gym-home-kicker">BAYONA · ENTRENAMIENTO PERSONAL Y ONLINE</p>
          <h1 id="home-hero-title">ENTRENA CON DIRECCIÓN.</h1>
          <p className="gym-home-hero__lead">
            Fuerza, movimiento y acompañamiento para dejar de improvisar y empezar con un plan que sí cabe en tu vida.
          </p>
          <div className="gym-home-hero__actions">
            <a className="gym-primary-button" href="#empieza">
              EMPIEZA GRATIS <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <Link className="gym-secondary-button" to="/programs">
              VER SERVICIOS <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <a className="gym-home-reward" href="#regalos">
            <Gift size={18} aria-hidden="true" />
            <span><strong>Tu visita tiene recompensa.</strong> Llévate 3 recursos de inicio gratis.</span>
          </a>
        </div>
      </section>

      <section className="gym-home-services" id="servicios" aria-labelledby="gym-services-title">
        <div className="gym-home-shell">
          <div className="gym-section-heading">
            <SectionLabel>NUESTROS SERVICIOS</SectionLabel>
            <h2 id="gym-services-title">ELIGE CÓMO QUIERES ENTRENAR.</h2>
            <p>Cuatro puertas. Sin conceptos raros, sin tener que aprenderte la web.</p>
          </div>
          <div className="gym-service-grid">
            {SERVICES.map((service) => (
              <Link className="gym-service-card" to={service.href} key={service.id}>
                <img src={service.image} alt="" width="1600" height="900" loading="lazy" decoding="async" />
                <span className="gym-service-card__veil" aria-hidden="true" />
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>
                  <span className="gym-service-card__action">VER SERVICIO <ArrowUpRight size={17} aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </div>
          <Link className="gym-inline-link" to="/programs">
            VER TODOS LOS SERVICIOS <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="gym-home-process" aria-labelledby="gym-process-title">
        <div className="gym-home-shell">
          <div className="gym-section-heading">
            <SectionLabel>ASÍ DE SIMPLE</SectionLabel>
            <h2 id="gym-process-title">TRES PASOS PARA EMPEZAR.</h2>
          </div>
          <ol className="gym-process-grid">
            {START_STEPS.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </li>
            ))}
          </ol>
          <a className="gym-primary-button" href="#empieza">QUIERO EMPEZAR</a>
        </div>
      </section>

      <section className="home-memberships-section gym-home-plans" aria-labelledby="home-offer-heading">
        <div className="gym-home-shell">
          <div className="gym-section-heading">
            <SectionLabel>MEMBRESÍAS</SectionLabel>
            <h2 id="home-offer-heading">MÁS APOYO CUANDO LO NECESITAS.</h2>
            <p>Compara el nivel de seguimiento y el precio. Los detalles aparecen solo cuando los pides.</p>
          </div>
          <PlanExplorer projections={membershipPlanEditorialProjection} cinematic />
          <Link className="gym-inline-link" to="/programs">
            COMPARAR SERVICIOS Y SESIONES <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="gym-home-trust" aria-labelledby="gym-trust-title">
        <div className="gym-home-shell gym-trust-layout">
          <div>
            <SectionLabel>ENTRENAR CON CLARIDAD</SectionLabel>
            <h2 id="gym-trust-title">SABES QUÉ HACES Y POR QUÉ.</h2>
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
            <h2 id="gym-gifts-title">PRIMERO RECIBES VALOR.</h2>
            <p>Explora la web y, cuando quieras empezar, estos tres recursos ya son tuyos.</p>
          </div>
          <div className="gym-gift-grid">
            {GIFTS.map((gift) => (
              <a className="gym-gift-card" href={gift.href} download key={gift.href}>
                <img src={gift.image} alt="" width="1600" height="900" loading="lazy" decoding="async" />
                <div>
                  <span>{gift.tag}</span>
                  <h3>{gift.title}</h3>
                  <p>{gift.copy}</p>
                  <strong>DESCARGAR <Download size={17} aria-hidden="true" /></strong>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="gym-home-lead" id="empieza" aria-labelledby="lead-magnet-title">
        <div className="gym-home-shell gym-home-lead__intro">
          <SectionLabel>TU SIGUIENTE PASO</SectionLabel>
          <h2>DEJA TUS DATOS. RECIBE TODO. AGENDA CUANDO QUIERAS.</h2>
          <p>
            Sin registro, sin contraseña y sin obligarte a comprar. Te enviamos el punto de partida y dejamos abierta la valoración.
          </p>
        </div>
        <LeadMagnet
          heading="Empieza gratis."
          copy="Nombre y un contacto. Al enviarlo tendrás acceso directo a tus recursos y podrás pedir tu valoración."
        />
        <div className="gym-home-lead__fallback gym-home-shell">
          <span>¿Prefieres hablar primero?</span>
          <a href={evaluationUrl} target="_blank" rel="noreferrer">
            AGENDAR POR WHATSAPP <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  )
}
