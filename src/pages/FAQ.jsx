import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, MessageCircle, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionLabel } from '../components/Layout'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import { questionCategories } from '../config/faqContent.js'
import { buildWhatsAppUrl, membershipPlans } from '../config/offerings.js'
import { siteMedia } from '../config/siteMedia.js'
import { Reveal } from '../engine/motion/Reveal.jsx'
// faq.css era global en main.jsx. Ahora viaja con la ruta /faq.
import '../styles/faq.css'

const pricingPlans = membershipPlans.map((plan) => ({
  id: plan.id,
  name: plan.name,
  cop: plan.priceDisplay,
  eur: plan.eur,
  usd: plan.usdDisplay,
  featured: plan.id === 'FUERZA',
  badge: plan.id === 'FUERZA' ? 'DESTACADO' : '',
}))

const videoCallUrl = buildWhatsAppUrl([
  'Hola BAYONA, quiero coordinar una videollamada informativa de 15 minutos con Sebastián.',
  '¿Qué disponibilidad tenéis?',
].join('\n'))

const quickQuestionUrl = buildWhatsAppUrl([
  'Hola BAYONA, tengo una pregunta concreta sobre sus servicios y membresías.',
  '¿Podéis ayudarme?',
].join('\n'))

/**
 * Salidas por tramo del recorrido (§17: «llevar a comunidad, tienda o cuenta
 * según el punto del recorrido»). Las cuatro rutas existen en el itinerario y
 * ninguna promesa de texto que no sostengamos: la comunidad abierta es gratis,
 * la tienda también vende sesiones y servicios sueltos, y en la cuenta vive lo
 * que ya tienes contratado.
 */
const journeyExits = [
  {
    number: '01',
    title: 'AÚN NO HAS ENTRENADO CON NOSOTROS',
    copy: 'Empieza por lo gratis: protocolo de 7 días, reto y consulta con contexto. Así compruebas cómo piensa BAYONA antes de pagar nada.',
    to: '/resources',
    action: 'EMPEZAR POR LOS RECURSOS',
  },
  {
    number: '02',
    title: 'TE FALTA CONTEXTO, NO INFORMACIÓN',
    copy: 'El grupo abierto no requiere plan. Entras, ves el ritmo semanal y decides con calma.',
    to: '/community',
    action: 'ENTRAR A LA COMUNIDAD',
  },
  {
    number: '03',
    title: 'SOLO QUIERES UNA SESIÓN SUELTA',
    copy: 'Clase 1:1, evaluación o recuperación sin contratar una mensualidad. Se confirma disponibilidad antes de reservar.',
    to: '/programs#servicios',
    action: 'VER SERVICIOS SUELTOS',
  },
  {
    number: '04',
    title: 'YA ESTÁS DENTRO',
    copy: 'Si ya eres cliente, el acceso privado reúne la información disponible de tu servicio y tu cuenta.',
    to: '/entrar',
    action: 'IR A MI CUENTA',
  },
]

function PricingBlock() {
  return (
    <div className="faq-pricing" aria-label="Opciones y precios mensuales BAYONA">
      <header className="faq-pricing-heading">
        <span>TUS OPCIONES · PRECIOS CLAROS</span>
        <h4>ELIGE TU NIVEL</h4>
      </header>

      <div className="faq-pricing-grid">
        {pricingPlans.map((plan) => (
          <article
            className={`faq-price-card${plan.featured ? ' is-featured' : ''}${plan.id === 'ELITE' ? ' is-limited' : ''}`}
            key={plan.id}
          >
            <div className="faq-price-card-header">
              <h5>{plan.name}</h5>
              {plan.badge && <span>{plan.badge}</span>}
            </div>
            <div className="faq-price-main">
              <strong>{plan.cop}</strong>
              <small>COP / MES</small>
            </div>
            <div className="faq-price-equivalents" aria-label={`Equivalencias aproximadas de ${plan.name}`}>
              <span>{plan.eur}</span>
              <span>{plan.usd}</span>
            </div>
          </article>
        ))}
      </div>

      <p className="faq-price-microcopy">Equivalencias aproximadas. Confirma importe, disponibilidad y condiciones vigentes antes de pagar.</p>
    </div>
  )
}

export default function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(0)
  const reducedMotion = useReducedMotion()

  return (
    <div className="faq-page">
      {/*
        El hero llevaba DOS capas de imagen una sobre otra: el cuadrado girado
        con borde y halo de `.faq-hero::before` (z-index -1) y la foto de escena
        sobre `::after` al 62 % de opacidad. Resultado: se veía el canto del
        cuadrado atravesando la foto, que es el «corte extraño» de la anotación
        47. Ahora hay UNA sola capa de foto, baja y sujeta con un velo, y el
        adorno geométrico sale del hero: la identidad de /faq es la calma.
      */}
      <header
        {...sceneBackgroundProps(siteMedia.faq.hero, {
          className: 'faq-hero section-shell',
          variant: 'subtle',
          pseudo: 'after',
          opacity: 0.34,
          overlay: '62%',
          motion: true,
        })}
      >
        <SectionLabel>BAYONA / FAQ · PREGUNTAS FRECUENTES</SectionLabel>
        {/*
          El `Reveal` envuelve el h1 sin tocar lo que hay dentro: este titular
          mezcla `<span>`, `<br>` y un nodo de texto suelto, y se llama por
          `aria-label`, así que sustituirlo por un string (TextMask/TextReveal)
          habría roto su composición. Envuelto se anima entero y conserva el
          nombre accesible. El párrafo entra 0,18 s después para que la cabecera
          se monte en dos tiempos en vez de aparecer de golpe.
        */}
        <Reveal as="h1" aria-label="FAQ / Decide sin dudas"><span>FAQ /</span>{' '}<br />DECIDE SIN DUDAS</Reveal>
        <Reveal as="p" delay={0.18}>
          No necesitas tenerlo todo claro. Aquí tienes servicios, precios, condiciones y respuestas directas antes de empezar.
        </Reveal>
        <Reveal as="ul" className="faq-hero-anchors" delay={0.28}>
          <li>SERVICIOS Y PRECIOS</li>
          <li>CONDICIONES Y PAGO</li>
          <li>SEGURIDAD DE TUS DATOS</li>
        </Reveal>
      </header>

      <section className="faq-section section-shell ds-reveal" data-immersive="clip" aria-labelledby="faq-questions-title">
        <SectionLabel>01 / RESPUESTAS CLARAS</SectionLabel>
        <h2 id="faq-questions-title">LO QUE NECESITAS SABER<br />{' '}<span>ANTES DE PAGAR.</span></h2>

        <div className="faq-categories">
          {questionCategories.map((category, categoryIndex) => {
            const startIndex = questionCategories
              .slice(0, categoryIndex)
              .reduce((total, entry) => total + entry.questions.length, 0)
            const categoryNumber = String(categoryIndex + 1).padStart(2, '0')

            return (
              <section
                className="faq-category"
                data-category-number={categoryNumber}
                key={category.title}
                aria-labelledby={`faq-category-${categoryIndex}`}
              >
                <h3 className="faq-category-title ds-reveal ds-reveal--mask" id={`faq-category-${categoryIndex}`}>
                  <span>{categoryNumber} /</span> {category.title}
                </h3>
                <div className="faq-list">
                  {category.questions.map((item, questionIndex) => {
                    const globalIndex = startIndex + questionIndex
                    const isOpen = openQuestion === globalIndex
                    const questionId = `faq-question-${globalIndex}`
                    const answerId = `faq-answer-${globalIndex}`

                    return (
                      <article className={`faq-accordion${isOpen ? ' open' : ''}`} key={item.q}>
                        <button
                          type="button"
                          id={questionId}
                          aria-expanded={isOpen}
                          aria-controls={answerId}
                          onClick={() => setOpenQuestion(isOpen ? -1 : globalIndex)}
                        >
                          <span className="faq-question-number" aria-hidden="true">
                            {String(globalIndex + 1).padStart(2, '0')}
                          </span>
                          <span className="faq-question-text">{item.q}</span>
                          <ChevronDown className="faq-question-icon" aria-hidden="true" focusable="false" />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              className="faq-answer"
                              id={answerId}
                              role="region"
                              aria-labelledby={questionId}
                              initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                              animate={reducedMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                              exit={reducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                              transition={{ duration: reducedMotion ? 0 : 0.46, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <div className="faq-answer-inner">
                                <p>{item.a}</p>
                                {item.pricing && <PricingBlock />}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </section>

      {/*
        Anotación 47 y §17: la FAQ no puede devolverte al inicio. Aquí la página
        se comporta como lo que es, el cierre de confianza, y cada persona sale
        hacia el punto del recorrido que le toca: probar gratis, entrar al grupo,
        comprar una sesión suelta o volver a su cuenta.
      */}
      <section className="faq-exits section-shell ds-reveal" data-immersive="clip" aria-labelledby="faq-journey-title">
        <SectionLabel>02 / POR DÓNDE ANDAS</SectionLabel>
        <h2 id="faq-journey-title">YA SABES LO BÁSICO.<br />{' '}<span>SIGUE POR TU TRAMO.</span></h2>

        <ul className="faq-exits-grid">
          {journeyExits.map((exit) => (
            <li key={exit.to}>
              <span className="faq-exits-number" aria-hidden="true">{exit.number}</span>
              <h3>{exit.title}</h3>
              <p>{exit.copy}</p>
              <Link to={exit.to}>{exit.action} <ArrowUpRight aria-hidden="true" /></Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="faq-contact section-shell ds-reveal--scale ds-reveal" data-immersive="clip" aria-labelledby="faq-contact-title">
        <SectionLabel>03 / RESUELVE LO QUE FALTA</SectionLabel>
        <div className="faq-contact-heading">
          <h2 id="faq-contact-title">ELIGE TU<br />{' '}<span>SIGUIENTE PASO.</span></h2>
          <p>Compara los servicios, plantea una duda concreta o empieza gratis antes de decidir.</p>
        </div>

        <div className="faq-contact-grid">
          <article className="faq-contact-card faq-contact-card--primary">
            <Video aria-hidden="true" />
            <span className="faq-contact-meta">15 MIN · SOLICITUD POR WHATSAPP</span>
            <h3>VIDEOLLAMADA PARA DECIDIR</h3>
            <p>Revisamos tu objetivo, tu contexto y las diferencias entre planes. La disponibilidad se confirma antes de agendar.</p>
            <a href={videoCallUrl} target="_blank" rel="noopener noreferrer">
              SOLICITAR VIDEOLLAMADA <ArrowUpRight aria-hidden="true" />
            </a>
          </article>

          <article className="faq-contact-card">
            <MessageCircle aria-hidden="true" />
            <span className="faq-contact-meta">CONSULTA POR WHATSAPP</span>
            <h3>UNA PREGUNTA CONCRETA</h3>
            <p>Escribe qué necesitas confirmar sobre alcance, precio, disponibilidad o condiciones antes de avanzar.</p>
            <a href={quickQuestionUrl} target="_blank" rel="noopener noreferrer">
              CONSULTAR POR WHATSAPP <ArrowUpRight aria-hidden="true" />
            </a>
          </article>

          <article className="faq-contact-card faq-contact-card--free">
            <span className="faq-free-mark" aria-hidden="true">00</span>
            <span className="faq-contact-meta">RETO + GUÍAS GRATUITAS</span>
            <h3>EMPIEZA POR LOS RECURSOS</h3>
            <p>Lee las condiciones del reto o abre las guías si primero quieres comprobar cómo piensa BAYONA.</p>
            <Link to="/resources">
              VER RECURSOS <ArrowUpRight aria-hidden="true" />
            </Link>
          </article>
        </div>

        <blockquote className="faq-founder-close">
          <p>NO NECESITAS TENERLO TODO CLARO. NECESITAS DAR EL SIGUIENTE PASO CORRECTO.</p>
          <cite>— SEBASTIÁN</cite>
        </blockquote>
      </section>

    </div>
  )
}
