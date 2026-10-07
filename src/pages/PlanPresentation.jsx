import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  Crown,
  Download,
  Dumbbell,
  FlaskConical,
  HeartPulse,
  // Se renombra: el icono se llama Infinity y tapaba el global Infinity en
  // todo el módulo. Aquí no se usaba el número, pero es una trampa a futuro.
  Infinity as InfinityIcon,
  MessageCircle,
  MonitorPlay,
  Salad,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import { MethodSequence } from '../components/method/MethodSequence.jsx'
import { buildWhatsAppUrl, formatCop, membershipPlans } from '../config/offerings.js'
import { ZERO_FIRST_MONTH_OFFER } from '../lib/commerce/plans.js'
import { planPresentations } from '../config/planPresentations.js'
import { bayonaScenes, siteMedia } from '../config/siteMedia.js'
import { GUARANTEE } from '../config/commitments.js'
import { TESTIMONIALS } from '../config/testimonials.js'
import '../styles/plan-presentation.css'
// Refinamientos que eran globales en main.jsx: solo aplican a /plan/*.
import '../styles/plan-hero-refinements.css'
import '../styles/plan-value-refinements.css'
import '../styles/plan-summary-refinements.css'
import '../styles/plan-final-refinements.css'

/**
 * Escena de lujo por plan, pedida por el propietario: casa al aire libre,
 * playa, interior con vista al mar y parque privado. Cuatro encuadres
 * distintos para que ningún plan se parezca al anterior; el velo carbón +
 * ámbar es idéntico en los cuatro, así la marca sigue siendo una.
 */
const SCENE_BY_PLAN = Object.freeze({
  RAIZ: 'casa',
  FUERZA: 'playa',
  RENDIMIENTO: 'mansion',
  ELITE: 'parque',
})

const valueIcons = Object.freeze({
  app: Smartphone,
  assessment: ClipboardCheck,
  calendar: CalendarDays,
  coach: UserRound,
  community: Users,
  lifetime: InfinityIcon,
  nutrition: Salad,
  progress: TrendingUp,
  science: FlaskConical,
  session: Dumbbell,
  video: MonitorPlay,
  vip: Crown,
  whatsapp: MessageCircle,
})

const methodPillars = Object.freeze([
  Object.freeze({
    icon: FlaskConical,
    title: 'CIENCIA',
    copy: '+8 años de experiencia y formación europea convertidos en decisiones que entiendes.',
  }),
  Object.freeze({
    icon: UserRound,
    title: 'PERSONAL',
    copy: 'Tu plan es tuyo. No una plantilla copiada para todo el mundo.',
  }),
  Object.freeze({
    icon: Activity,
    title: 'SEGUIMIENTO',
    copy: 'Alguien revisa. Alguien ajusta. Alguien te empuja.',
  }),
])

function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const reduceMotion = useReducedMotion()
  const Component = motion[as] ?? motion.div

  return (
    <Component
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.68, delay, ease: [0.2, 0.72, 0.2, 1] }}
    >
      {children}
    </Component>
  )
}

function MagneticAnchor({ children, className = '', to, ...props }) {
  const reduceMotion = useReducedMotion()

  const handlePointerMove = (event) => {
    if (reduceMotion || event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12
    const y = (event.clientY - bounds.top - bounds.height / 2) * 0.16
    event.currentTarget.style.setProperty('--magnetic-x', `${x}px`)
    event.currentTarget.style.setProperty('--magnetic-y', `${y}px`)
  }

  const resetPosition = (event) => {
    event.currentTarget.style.setProperty('--magnetic-x', '0px')
    event.currentTarget.style.setProperty('--magnetic-y', '0px')
  }

  /**
   * `to` manda al CTA a una ruta interna con <Link>: un <a href="/checkout">
   * recargaría el documento y perdería el crédito BAYONA ganado en el recorrido.
   */
  const Component = to ? Link : 'a'

  return (
    <Component
      className={`plan-presentation-button ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      {...(to ? { to } : {})}
      {...props}
    >
      {children}
    </Component>
  )
}

function SectionHeading({ eyebrow, title, description, id }) {
  return (
    <header className="plan-presentation-section-heading">
      <p className="plan-presentation-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {description && <p className="plan-presentation-section-lead">{description}</p>}
    </header>
  )
}

function AnimatedValue({ value }) {
  const reduceMotion = useReducedMotion()
  const valueRef = useRef(null)
  const inView = useInView(valueRef, { once: true, amount: 0.6 })
  const count = useMotionValue(reduceMotion ? value : 0)
  const formatted = useTransform(count, (latest) => formatCop(Math.round(latest / 1000) * 1000))

  useEffect(() => {
    if (!inView) return undefined
    if (reduceMotion) {
      count.set(value)
      return undefined
    }

    const controls = animate(count, value, {
      duration: 1.35,
      ease: [0.2, 0.75, 0.2, 1],
    })

    return controls.stop
  }, [count, inView, reduceMotion, value])

  return <motion.strong ref={valueRef}>{formatted}</motion.strong>
}

function InvalidPlan() {
  return (
    <section className="plan-presentation-invalid" aria-labelledby="invalid-plan-title">
      <span>404 / PLAN NO ENCONTRADO</span>
      <h1 id="invalid-plan-title">ESE CAMINO NO EXISTE.<br /><em>PERO EL TUYO SÍ.</em></h1>
      <p>Vuelve a Servicios y elige el acompañamiento que encaja contigo.</p>
      <Link to="/programs" className="plan-presentation-button">
        VER LOS PLANES <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </section>
  )
}

export default function PlanPresentation({ planId }) {
  const normalizedPlanId = String(planId ?? '').toUpperCase()
  const plan = membershipPlans.find(({ id }) => id === normalizedPlanId)
  const presentation = planPresentations[normalizedPlanId]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [normalizedPlanId])

  const questionsUrl = useMemo(() => {
    if (!plan) return '#'
    return buildWhatsAppUrl(
      `Hola Sebastián, tengo una duda sobre el plan ${plan.name}. ¿Podemos hablar?`,
    )
  }, [plan])

  if (!plan || !presentation) return <InvalidPlan />

  const planMedia = siteMedia.plans[plan.id]
  const heroScene = bayonaScenes[SCENE_BY_PLAN[plan.id]] ?? planMedia.hero
  const savingsCop = presentation.totalValueCop - plan.priceCop
  const savingsPercentage = Math.round((savingsCop / presentation.totalValueCop) * 100)
  const usdPrice = plan.usdDisplay
  const availability = plan.id === 'ELITE' ? 'Máximo 10' : 'Disponibles'

  /**
   * Planes vecinos en la escalera, para no dejar la página sin salida.
   *
   * Antes esta página terminaba con un único botón de compra: quien no estaba
   * listo solo podía usar el botón atrás del navegador. Ofrecer el nivel de
   * abajo y el de arriba deja que la persona se recoloque sin salirse, y de
   * paso da referencia de precio en las dos direcciones.
   */
  /** Países distintos con experiencia publicada. Comprobable en /about. */
  const publishedCountries = new Set(TESTIMONIALS.map(({ countryCode }) => countryCode)).size

  const planIndex = membershipPlans.findIndex(({ id }) => id === plan.id)
  const lowerPlan = planIndex > 0 ? membershipPlans[planIndex - 1] : null
  const higherPlan = planIndex < membershipPlans.length - 1 ? membershipPlans[planIndex + 1] : null
  const planSlug = (id) => String(id).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const testimonialLabel = `${presentation.testimonial.name}, ${presentation.testimonial.age}, ${presentation.testimonial.countryCode}`

  return (
    <article className="plan-presentation" data-plan={plan.id}>
      <section className="plan-presentation-hero" aria-labelledby="plan-presentation-title">
        <div className="plan-presentation-orbit plan-presentation-orbit-one" aria-hidden="true" />
        <div className="plan-presentation-orbit plan-presentation-orbit-two" aria-hidden="true" />
        <div
          {...sceneBackgroundProps(heroScene, {
            className: 'plan-presentation-hero-shell',
            variant: 'hero',
            motion: true,
          })}
        >
          <Link to="/programs" className="plan-presentation-back">
            <ArrowLeft size={15} aria-hidden="true" /> COMPARAR PLANES
          </Link>

          <div className="plan-presentation-hero-grid">
            <motion.div
              className="plan-presentation-hero-copy"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.2, 0.72, 0.2, 1] }}
            >
              <p className="plan-presentation-eyebrow">BAYONA <span aria-hidden="true">•</span> {plan.name}</p>
              <h1 id="plan-presentation-title">{presentation.heroTitle}</h1>
              <p className="plan-presentation-hero-lead">{presentation.heroSubtitle}</p>

              <div className="plan-presentation-hero-offer">
                <div className="plan-presentation-price">
                  <span>INVERSIÓN MENSUAL</span>
                  <strong>{plan.priceDisplay}</strong>
                  <small className="plan-presentation-currency-line">
                    <span>{plan.currency}</span>
                    <i aria-hidden="true">·</i>
                    <span>{plan.eur}</span>
                    <i aria-hidden="true">·</i>
                    <span>{usdPrice}</span>
                  </small>
                </div>
                <MagneticAnchor to={`/checkout?plan=${plan.id}`}>
                  VER EN WEB <ArrowUpRight size={19} aria-hidden="true" />
                </MagneticAnchor>
              </div>

              {/*
                El CTA principal ya entra en la pasarela, así que el segundo
                camino no puede repetir destino: aquí quedan la oferta y el PDF.

                La oferta de introducción se lee desde `lib/commerce/plans.js`,
                que es de donde sale el importe real de la pasarela. Decir solo
                «primer mes 0 €» dejaba la sensación de truco; la condición va
                en la misma línea.
              */}
              <div className="plan-presentation-hero-secondary">
                <span className="plan-presentation-secondary-link">
                  {ZERO_FIRST_MONTH_OFFER.label}
                  <i aria-hidden="true"> · </i>
                  {/*
                    El importe recurrente se lee del propio plan, nunca de la
                    oferta. Era lo que hacía falta para que la frase no pudiera
                    contradecir al número grande de arriba: «después, el precio
                    publicado» dicho con el precio publicado.
                  */}
                  <em>después {plan.priceDisplay}</em>
                </span>
                <a
                  className="plan-presentation-secondary-link"
                  href={plan.presentationUrl}
                  download
                >
                  DESCARGAR DOSSIER PDF <Download size={16} aria-hidden="true" />
                </a>
              </div>
            </motion.div>

            {/*
              «Preview / experiencia en grande» estaba duplicado: un marco de
              vídeo vacío que prometía una grabación inexistente y, debajo, el
              mismo plan explicado otra vez. El marco se cambia por el dossier
              real del plan —ficha, precio, prestaciones y PDF—, que es la
              pieza que sí existe hoy y que ya pide el sistema de artefactos.
            */}
            <motion.div
              className="plan-presentation-dossier"
              initial={{ opacity: 0, x: 26 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.16, ease: [0.2, 0.72, 0.2, 1] }}
            >
              <article className="plan-presentation-dossier-card">
                <header>
                  <span>DOSSIER / {plan.name}</span>
                  <strong>{plan.journey}</strong>
                </header>
                <p>{plan.shortDescription}</p>
                <dl>
                  <div><dt>Precio publicado</dt><dd>{plan.priceDisplay} COP/mes</dd></div>
                  <div><dt>Prestaciones</dt><dd>{plan.included.length} incluidas{plan.excluded ? ` · ${plan.excluded.length} fuera` : ''}</dd></div>
                  {plan.scarcity && <div><dt>Disponibilidad</dt><dd>{plan.scarcity}</dd></div>}
                </dl>
                <a href={plan.presentationUrl} download>
                  ABRIR EL DOSSIER <Download size={15} aria-hidden="true" />
                </a>
                <small>Documento PDF · el mismo contenido que esta página</small>
              </article>
            </motion.div>

          </div>

          <a href="#transformacion" className="plan-presentation-scroll-cue">
            DESCUBRE TU CAMBIO <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section
        id="transformacion"
        className="plan-presentation-section plan-presentation-transformations"
        aria-labelledby="transformations-title"
      >
        <div className="plan-presentation-shell" data-immersive="clip">
          <SectionHeading
            eyebrow="01 / TU TRANSFORMACIÓN"
            title="ESTO ES LO QUE VA A CAMBIAR"
            id="transformations-title"
          />
          <ol className="plan-presentation-transformation-list">
            {presentation.transformations.map((transformation, index) => {
              const [before, after] = transformation.split('→').map((part) => part.trim())

              return (
                <Reveal key={transformation} as="li" delay={index * 0.1}>
                  <span className="plan-presentation-card-index">0{index + 1}</span>
                  <p>
                    <span>{before}</span>
                    <ArrowRight size={24} aria-hidden="true" />
                    <strong>{after}</strong>
                  </p>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </section>

      <section
        className="plan-presentation-section plan-presentation-day"
        aria-labelledby="day-title"
      >
        <div className="plan-presentation-shell" data-immersive="clip">
          <SectionHeading
            eyebrow="02 / ASÍ ES CONTIGO"
            title="UN DÍA EN BAYONA"
            description="No tienes que imaginar cómo encajará. Este es el ritmo que empieza a ordenar tu proceso."
            id="day-title"
          />
          <ol className="plan-presentation-timeline">
            {presentation.timeline.map((item, index) => (
              <Reveal key={item.moment} as="li" delay={index * 0.08}>
                <span className="plan-presentation-timeline-node" aria-hidden="true">{index + 1}</span>
                <div>
                  <h3>{item.moment}</h3>
                  <p>{item.detail}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="plan-presentation-section plan-presentation-value"
        aria-labelledby="value-title"
      >
        <div className="plan-presentation-shell" data-immersive="clip">
          <SectionHeading
            eyebrow="03 / TU ARSENAL COMPLETO"
            title="TODO LO QUE INCLUYE TU PLAN"
            description="No compras una lista. Construyes un sistema que elimina dudas, corrige el rumbo y sostiene tu avance."
            id="value-title"
          />

          <div className="plan-presentation-value-layout">
            <ol className="plan-presentation-value-list">
              {presentation.valueStack.map((item, index) => {
                const Icon = valueIcons[item.icon] ?? Check
                const proportion = Math.max(10, (item.valueCop / presentation.totalValueCop) * 100)

                return (
                  <Reveal key={item.name} as="li" delay={(index % 4) * 0.06}>
                    <div className="plan-presentation-value-icon"><Icon size={22} aria-hidden="true" /></div>
                    <div className="plan-presentation-value-copy">
                      <span>0{index + 1}</span>
                      <h3>{item.name}</h3>
                      <p>{item.benefit}</p>
                      <i style={{ '--value-width': `${proportion}%` }} aria-hidden="true" />
                    </div>
                    <div className="plan-presentation-value-price">
                      <span>VALOR REAL</span>
                      <strong>{formatCop(item.valueCop)} COP</strong>
                    </div>
                  </Reveal>
                )
              })}
            </ol>

            <Reveal className="plan-presentation-value-summary">
              <p>TOTAL DE VALOR REAL</p>
              <AnimatedValue value={presentation.totalValueCop} />
              <span>COP</span>
              <div className="plan-presentation-value-summary-row">
                <small>TU PRECIO</small>
                <b>{plan.priceDisplay} <em>COP/mes</em></b>
              </div>
              <div className="plan-presentation-value-summary-row is-saving">
                <small>TÚ AHORRAS</small>
                <b>{formatCop(savingsCop)} <em>({savingsPercentage}%)</em></b>
              </div>
              <MagneticAnchor href={plan.cta} target="_blank" rel="noreferrer">
                ACTIVAR {plan.name} <ArrowUpRight size={18} aria-hidden="true" />
              </MagneticAnchor>
            </Reveal>
          </div>

          {/*
            «Qué no incluye» (dirección §12). Sale del catálogo publicado en
            `config/offerings.js`, mismo dato que lee la ficha de /programs, así
            que las dos páginas no pueden contradecirse.
          */}
          {plan.excluded?.length > 0 && (
            <Reveal className="plan-presentation-not-included">
              <div className="plan-presentation-not-included-head">
                <p className="plan-presentation-eyebrow">FUERA DE {plan.name}</p>
                <h3>Lo que este plan no te da.</h3>
              </div>
              <ul>
                {plan.excluded.map((item) => (
                  <li key={item}><X size={14} aria-hidden="true" />{item}</li>
                ))}
              </ul>
              <p>
                Se puede añadir como servicio suelto desde el catálogo de servicios, o subir de nivel cuando
                lo que falta sea de verdad lo que te frena.
              </p>
            </Reveal>
          )}
        </div>
      </section>

      <section
        className="plan-presentation-section plan-presentation-method"
        aria-labelledby="method-title"
      >
        <div className="plan-presentation-shell" data-immersive="clip">
          <SectionHeading
            eyebrow="04 / POR QUÉ FUNCIONA"
            title="NO ES SUERTE. ES MÉTODO."
            id="method-title"
          />
          <div className="plan-presentation-method-layout">
            {/*
              FASE 4 (4.4): el método se lee como secuencia (01 → 02 → 03 sobre
              un mismo filete), no como tres tarjetas con icono. Es el mismo
              patrón que /about y que el recorrido del héroe, así que el
              visitante reconoce la forma en las tres rutas.
            */}
            <MethodSequence
              items={methodPillars}
              variant="compact"
              label="Los tres pilares del método BAYONA"
            />
            {/*
              Aquí decía "+2.000 PERSONAS ENTRENADAS". Esa cifra no es
              comprobable y contradecía la posición de la propia marca: /about
              afirma "No usamos una cifra total como prueba". Un número redondo
              que el visitante no puede verificar resta credibilidad en lugar de
              sumarla.

              Se sustituye por un dato que se comprueba en esta misma web: las
              experiencias publicadas y los países desde los que se escriben.
              Se derivan de config/testimonials.js, así que si mañana hay doce
              historias, aquí dirá doce.
            */}
            <Reveal className="plan-presentation-authority">
              <Sparkles size={28} aria-hidden="true" />
              <strong>{TESTIMONIALS.length}</strong>
              <span>EXPERIENCIAS PUBLICADAS EN {publishedCountries} PAÍSES</span>
              <p>Un método construido en el terreno: observando, ajustando y acompañando cuerpos reales.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="plan-presentation-section plan-presentation-guarantee" aria-labelledby="guarantee-title">
        <div className="plan-presentation-shell" data-immersive="clip">
          <Reveal className="plan-presentation-guarantee-box">
            <div className="plan-presentation-guarantee-mark" aria-hidden="true">
              <ShieldCheck size={70} strokeWidth={1.2} />
              <span>{GUARANTEE.days}</span>
              <small>DÍAS</small>
            </div>
            {/* Texto desde config/commitments.js: una sola redacción en toda la web. */}
            <div>
              <p className="plan-presentation-eyebrow">{GUARANTEE.eyebrow}</p>
              <h2 id="guarantee-title">
                {GUARANTEE.title}
                <br />
                <span>{GUARANTEE.titleAccent}</span>
              </h2>
              <p>{GUARANTEE.promise}</p>
              <p>{GUARANTEE.howTo}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="plan-presentation-section plan-presentation-testimonial"
        aria-labelledby="testimonial-title"
      >
        <div className="plan-presentation-shell" data-immersive="clip">
          <SectionHeading
            eyebrow="05 / PERSONAS COMO TÚ"
            title="ALGUIEN YA ESTABA DONDE TÚ ESTÁS"
            id="testimonial-title"
          />
          <Reveal className="plan-presentation-testimonial-card">
            {/*
              El hueco decía «FOTO / PRÓXIMAMENTE» sobre un hueco gris: una
              promesa de imagen que no existe. Pasa a llevar la escena del plan
              —que sí existe— con una etiqueta que no confunde: la fotografía no
              es la de esta persona, es el contexto de su historia.
            */}
            <div
              {...sceneBackgroundProps(planMedia.poster, {
                className: 'plan-presentation-testimonial-photo',
                variant: 'accent',
                position: 'center 42%',
              })}
            >
              <span aria-hidden="true">{presentation.testimonial.initial}</span>
              <small>Historia publicada · {presentation.testimonial.countryCode}</small>
            </div>
            <blockquote>
              <span aria-hidden="true">“</span>
              <p>{presentation.testimonial.quote}</p>
              <footer>
                <strong>{testimonialLabel}</strong>
                <small>{presentation.testimonial.result}</small>
              </footer>
            </blockquote>
          </Reveal>
          <p className="plan-presentation-testimonial-notice">
            Historias compartidas por alumnos. Algunos nombres o detalles pueden simplificarse para
            proteger la privacidad. No representan resultados garantizados.
          </p>
        </div>
      </section>

      <section
        className="plan-presentation-section plan-presentation-final"
        aria-labelledby="final-title"
      >
        <div className="plan-presentation-shell" data-immersive="clip">
          <SectionHeading eyebrow="06 / TU DECISIÓN" title="¿ESTÁS LISTO?" id="final-title" />
          <div className="plan-presentation-final-layout">
            <Reveal className="plan-presentation-final-summary">
              <p>{presentation.urgency}</p>
              <dl>
                <div><dt>PLAN</dt><dd>{plan.name}</dd></div>
                <div>
                  <dt>INVERSIÓN</dt>
                  <dd>
                    {plan.priceDisplay} COP/mes
                    <small className="plan-presentation-currency-line">
                      <span>{plan.eur}</span>
                      <i aria-hidden="true">·</i>
                      <span>{usdPrice}</span>
                    </small>
                  </dd>
                </div>
                <div><dt>GARANTÍA</dt><dd>{GUARANTEE.summaryValue}</dd></div>
                <div><dt>CUPOS</dt><dd>{availability}</dd></div>
              </dl>
            </Reveal>

            <Reveal className="plan-presentation-final-cta" delay={0.1}>
              <HeartPulse size={32} aria-hidden="true" />
              <p>Tu cuerpo no necesita otra promesa.<br /><strong>Necesita una decisión.</strong></p>
              <MagneticAnchor to={`/checkout?plan=${plan.id}`}>
                VER EN WEB <ArrowUpRight size={20} aria-hidden="true" />
              </MagneticAnchor>
              {/* Salida doble: el mismo plan en papel, para quien decide fuera
                  de la pantalla. */}
              <a href={plan.presentationUrl} download className="plan-presentation-dossier-link">
                DESCARGAR DOSSIER PDF <Download size={15} aria-hidden="true" />
              </a>
              <a href={questionsUrl} target="_blank" rel="noreferrer" className="plan-presentation-question-link">
                ¿Tienes dudas? Habla con Sebastián <MessageCircle size={16} aria-hidden="true" />
              </a>
              <small><ShieldCheck size={14} aria-hidden="true" /> {GUARANTEE.short}</small>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="plan-presentation-section plan-presentation-faq" aria-labelledby="faq-title">
        <div className="plan-presentation-shell plan-presentation-faq-shell" data-immersive="clip">
          <SectionHeading eyebrow="07 / SIN LETRA PEQUEÑA" title="TUS ÚLTIMAS DUDAS" id="faq-title" />
          <div className="plan-presentation-faq-list">
            {presentation.faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 0.08}>
                <details>
                  <summary>
                    <span>0{index + 1}</span>
                    <strong>{faq.question}</strong>
                    <ChevronDown size={22} aria-hidden="true" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
          <div className="plan-presentation-faq-close">
            <p>Ya conoces el camino.<br /><strong>Ahora toca caminarlo.</strong></p>
            <MagneticAnchor href={plan.cta} target="_blank" rel="noreferrer">
              EMPEZAR CON {plan.name} <ArrowUpRight size={18} aria-hidden="true" />
            </MagneticAnchor>
          </div>
        </div>
      </section>

      {/*
        Salida sin presión. La página terminaba en el botón de compra y nada
        más: si la persona no estaba lista, la única opción era irse. Aquí se le
        ofrece recolocarse en la escalera o empezar por lo gratuito.
      */}
      <section
        className="plan-presentation-section plan-presentation-bridge"
        aria-labelledby="plan-bridge-title"
      >
        <div className="plan-presentation-shell" data-immersive="clip">
          <SectionHeading
            eyebrow="08 / SIN PRISA"
            title="¿TODAVÍA NO?"
            id="plan-bridge-title"
          />
          <p className="plan-presentation-bridge-lead">
            No hace falta decidir hoy. Puedes mirar otro nivel de acompañamiento o empezar por lo
            que no cuesta nada.
          </p>

          <div className="plan-presentation-bridge-grid">
            {lowerPlan && (
              <Link className="plan-presentation-bridge-card" to={`/plan/${planSlug(lowerPlan.id)}`}>
                <span>UN PASO ANTES</span>
                <strong>{lowerPlan.name}</strong>
                <small>{lowerPlan.shortDescription}</small>
                <em>{lowerPlan.priceDisplay} COP/mes</em>
              </Link>
            )}

            {higherPlan && (
              <Link className="plan-presentation-bridge-card" to={`/plan/${planSlug(higherPlan.id)}`}>
                <span>UN PASO MÁS</span>
                <strong>{higherPlan.name}</strong>
                <small>{higherPlan.shortDescription}</small>
                <em>{higherPlan.priceDisplay} COP/mes</em>
              </Link>
            )}

            <Link className="plan-presentation-bridge-card is-free" to="/resources">
              <span>GRATIS · SIN PLAN</span>
              <strong>RECURSOS</strong>
              <small>Guías y material para empezar a moverte hoy mismo, sin contratar nada.</small>
              <em>Empezar por aquí</em>
            </Link>

            <Link className="plan-presentation-bridge-card is-free" to="/community">
              <span>GRATIS · ACCESO ABIERTO</span>
              <strong>COMUNIDAD</strong>
              <small>Entra al grupo y ve cómo entrena la gente antes de decidir nada.</small>
              <em>Solicitar acceso</em>
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}
