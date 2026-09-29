import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowUpRight,
  Check,
  Dumbbell,
  Download,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { GoldButton, PageHero, SectionLabel } from '../components/Layout'
import Bridge from '../components/Bridge'
import { sceneBackgroundProps, StockImage } from '../components/SceneBackground.jsx'
import TestimonialMarquee from '../components/TestimonialMarquee'
import VideoSection from '../components/VideoSection.jsx'
import ProgramsAudienceStage from '../components/programs/ProgramsAudienceStage.jsx'
import ProgramsPlansStage from '../components/programs/ProgramsPlansStage.jsx'
import PlanCalculator from '../components/PlanCalculator.jsx'
import { useCapabilities } from '../engine/hooks/useCapabilities.js'
import RecommendedMark from '../components/onboarding/RecommendedMark.jsx'
import { GUARANTEE } from '../config/commitments.js'
import { planConversionMessages } from '../config/conversionContent.js'
import { bayonaScenes, mediaHeroUrls, siteMedia } from '../config/siteMedia.js'
import { useCartStore } from '../store/cartStore.js'
import '../styles/programs.css'
import '../styles/programs-robust-editorial.css'
import '../styles/programs-art-direction-2026.css'
import {
  buildWhatsAppUrl,
  editorialServices,
  membershipComparisonRows,
  membershipPlans as plans,
  programAudiences,
  serviceCategoryDefinitions,
  sessionServices,
} from '../config/offerings.js'

/**
 * Escena propia por plan (dirección §12). Son los cuatro encuadres BAYONA,
 * uno por peldaño de la escalera: la misma foto no resuelve dos planes.
 * PlanPresentation.jsx monta su hero con este mismo mapa, así que la ficha de
 * /programs y su página de plan comparten mundo visual.
 */
const SCENE_BY_PLAN = Object.freeze({
  RAIZ: 'casa',
  FUERZA: 'playa',
  RENDIMIENTO: 'mansion',
  ELITE: 'parque',
})

const pillars = [
  {
    step: '01',
    title: 'Entrenas con criterio',
    copy: 'Cada sesión llega escrita: qué toca, cuántas repeticiones y qué se mide al terminar.',
    figure: 'Lo que lees antes de entrenar',
  },
  {
    step: '02',
    title: 'Progreso que se puede leer',
    copy: 'Carga, técnica, volumen y sensación se anotan en la misma hoja cada semana. Si algo sube o baja, se ve.',
    figure: 'La hoja de revisión semanal',
  },
  {
    step: '03',
    title: 'Acompañamiento a tu medida',
    copy: 'El plan define cuántas sesiones en vivo, cada cuánto te revisan y por dónde contestamos tus dudas.',
    figure: 'Tu contacto con el entrenador',
  },
]

const visualizationPoints = [
  'Antes de empezar: una conversación para ver historial, agenda y qué puedes hacer hoy.',
  'Primer día: recibes el bloque escrito, con cada ejercicio en video.',
  'Entre sesiones: anotas carga y sensación. Solo lo justo para poder revisar.',
  'Día de revisión: corregimos el bloque siguiente con lo que han dicho tus notas.',
  'Fin de mes: decides si subes de nivel, mantienes o cambias de objetivo.',
]

const SESSION_SERVICE_IDS = new Set(sessionServices.map(({ id }) => id))
const SERVICE_CATEGORY_ICONS = Object.freeze({
  CLASES: Dumbbell,
  RECUPERACIÓN: ShieldCheck,
  RENDIMIENTO: Trophy,
})
const ADDON_SERVICE_GROUPS = serviceCategoryDefinitions.map((category) => ({
  ...category,
  Icon: SERVICE_CATEGORY_ICONS[category.id],
  services: editorialServices.filter((service) => service.category === category.id),
}))
const COMPARISON_PLAN_NAMES = Object.freeze({
  RAIZ: 'RAÍZ',
  FUERZA: 'FUERZA',
  RENDIMIENTO: 'RENDIM.',
  ELITE: 'ELITE',
})
const PLAN_DECISION_PATHS = Object.freeze([
  Object.freeze({ planId: 'RAIZ', situation: 'Si necesitas volver con estructura', plan: 'RAÍZ' }),
  Object.freeze({ planId: 'FUERZA', situation: 'Si quieres corrección y revisión semanal', plan: 'FUERZA' }),
  Object.freeze({ planId: 'RENDIMIENTO', situation: 'Si buscas seguimiento más fino', plan: 'RENDIMIENTO' }),
  Object.freeze({ planId: 'ELITE', situation: 'Si quieres una experiencia privada', plan: 'ELITE' }),
])
const PROGRAM_DECISION_RAIL = Object.freeze([
  Object.freeze({ label: 'Diagnóstico', title: 'Llegas con tu contexto', copy: 'Edad, objetivo, historial y disponibilidad cambian la ruta.' }),
  Object.freeze({ label: 'Membresía', title: 'Eliges cercanía', copy: 'Base, revisión, rendimiento o privado: no es más caro, es más cerca.' }),
  Object.freeze({ label: 'Servicios', title: 'Añades solo lo útil', copy: 'Clases, recuperación y evaluación se suman cuando aceleran el proceso.' }),
  Object.freeze({ label: 'Cuenta', title: 'Todo queda guardado', copy: 'Plan, carrito, crédito y recursos terminan en tu centro de mando.' }),
])
const PULSING_BADGE_COPY = /(?:MÁS ELEGIDO|10 CUPOS)/i
const PLAN_TILT_LIMIT = 3.5

const shouldPulseBadge = (value = '') => PULSING_BADGE_COPY.test(value)
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum)

function GuaranteeStamp({ className = '', reducedMotion = false }) {
  return (
    <motion.div
      className={`proof-badge guarantee-badge ${reducedMotion ? '' : 'program-guarantee-glow'} ${className}`.trim()}
      initial={reducedMotion ? false : { scale: 0.96 }}
      whileInView={reducedMotion ? undefined : { scale: 1 }}
      viewport={{ once: true }}
      transition={reducedMotion ? undefined : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="badge-icon"><ShieldCheck size={42} /></div>
      <div className="badge-content">
        {/*
          Decía "Consulta requisitos, procedimiento y exclusiones", remitiendo a
          una letra pequeña que no existe, mientras las páginas de plan prometen
          devolución sin condiciones. Ahora las dos leen de commitments.js.
        */}
        <span className="guarantee-microband">{GUARANTEE.badge}</span>
        <h3>{GUARANTEE.days} DÍAS PARA EVALUARLO.</h3>
        <p>{GUARANTEE.promise}</p>
      </div>
    </motion.div>
  )
}

function PlanJourneyCard({ plan, index, conversionMessage, pointerEffectsEnabled, reducedMotion, compactMobile }) {
  const scene = bayonaScenes[SCENE_BY_PLAN[plan.id]]
  const [detailsOpen, setDetailsOpen] = useState(() => Boolean(plan.featured) && !compactMobile)
  const detailsId = `plan-details-${plan.id.toLowerCase()}`

  useEffect(() => {
    if (compactMobile) setDetailsOpen(false)
  }, [compactMobile])

  const updatePointerPosition = (event) => {
    if (!pointerEffectsEnabled) return

    const shell = event.currentTarget
    const bounds = shell.getBoundingClientRect()
    const pointerX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1)
    const pointerY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1)
    const tiltX = (0.5 - pointerY) * PLAN_TILT_LIMIT * 2
    const tiltY = (pointerX - 0.5) * PLAN_TILT_LIMIT * 2

    shell.style.setProperty('--program-spot-x', `${pointerX * 100}%`)
    shell.style.setProperty('--program-spot-y', `${pointerY * 100}%`)
    shell.style.setProperty('--program-tilt-x', `${tiltX}deg`)
    shell.style.setProperty('--program-tilt-y', `${tiltY}deg`)
  }

  const resetPointerPosition = (event) => {
    const shell = event.currentTarget
    shell.style.setProperty('--program-spot-x', '50%')
    shell.style.setProperty('--program-spot-y', '24%')
    shell.style.setProperty('--program-tilt-x', '0deg')
    shell.style.setProperty('--program-tilt-y', '0deg')
  }

  return (
    <div
      className={`program-plan-tilt-shell ${pointerEffectsEnabled ? 'is-pointer-interactive' : ''}`.trim()}
      onPointerMove={pointerEffectsEnabled ? updatePointerPosition : undefined}
      onPointerLeave={pointerEffectsEnabled ? resetPointerPosition : undefined}
    >
      <motion.article
        id={`plan-${plan.id.toLowerCase()}`}
        className={`plan-accordion-item ${plan.featured ? 'featured' : ''}`}
        initial={reducedMotion ? false : { y: 28 }}
        whileInView={reducedMotion ? undefined : { y: 0 }}
        viewport={{ once: true }}
        transition={reducedMotion ? undefined : { delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        data-plan-id={plan.id}
      >
        <span className="program-plan-spotlight" aria-hidden="true" />
        {/* Escena propia por plan (dirección §12): la ficha deja de ser texto con
            precio y cada peldaño de la escalera tiene su mundo. El mismo mapa
            usa el hero de /plan/*, así que ficha y ficha-completa no se contradicen. */}
        {scene && (
          <div
            {...sceneBackgroundProps(scene, {
              className: 'program-plan-scene',
              variant: 'accent',
              position: 'center 44%',
            })}
            aria-hidden="true"
          >
            <span className="program-plan-scene-name">{plan.name} · {plan.journey}</span>
          </div>
        )}
        <div className="program-plan-header">
          <div>
            {/* Solo se pinta si la recepción sugirió este plan a quien mira. */}
            <RecommendedMark planId={plan.id} />
            <div className="plan-tag">
              {plan.featured ? (
                <span className={`featured-badge ${shouldPulseBadge(plan.tag) ? 'program-pulse-badge' : ''}`.trim()}>{plan.tag}</span>
              ) : (
                <span className={shouldPulseBadge(plan.tag) ? 'program-pulse-badge' : undefined}>{plan.tag}</span>
              )}
            </div>
            <h3 className="program-plan-name">
              {plan.name}{plan.journey && <span className="program-plan-journey"> — {plan.journey}</span>}
            </h3>
            <p className="program-plan-benefit">{plan.shortDescription}</p>
          </div>
          <div className="program-plan-price">
            <span className="program-plan-price-label">Al mes</span>
            <strong>{plan.price}</strong>
            <small>{plan.currency}</small>
            <span>
              <span aria-hidden="true">· </span>
              <span>{plan.eur}</span>
              <span aria-hidden="true"> · </span>
              <span>{plan.usdDisplay}</span>
            </span>
          </div>
        </div>

        {compactMobile && (
          <button
            type="button"
            className="program-plan-mobile-toggle"
            aria-expanded={detailsOpen}
            aria-controls={detailsId}
            onClick={() => setDetailsOpen((open) => !open)}
          >
            <span>{detailsOpen ? 'OCULTAR DETALLES' : 'VER DETALLES'}</span>
            <span aria-hidden="true">{detailsOpen ? '−' : '+'}</span>
          </button>
        )}

        <div
          id={detailsId}
          className="program-plan-body"
          hidden={compactMobile && !detailsOpen}
        >
          <div className="program-plan-copy">
            <div className="program-plan-section"><h4>PARA QUIÉN</h4><p>{plan.audience}</p></div>
            <div className="program-plan-section"><h4>LO QUE CAMBIA</h4><p>{plan.problem}</p></div>
            <div className="program-plan-section"><h4>CÓMO SE NOTA</h4><p>{plan.feeling}</p></div>
            {plan.scarcity && (
              <p className={`program-plan-scarcity ${shouldPulseBadge(plan.scarcity) ? 'program-pulse-badge' : ''}`.trim()}>
                {plan.scarcity}
              </p>
            )}
          </div>

          <blockquote className="program-plan-proof-anchor">
            “{conversionMessage.proofAnchor}”
          </blockquote>

          <div className="program-plan-details">
            <div className="program-plan-section">
              <h4>INCLUYE</h4>
              {plan.includedLead && <p className="included-lead">{plan.includedLead}</p>}
              <ul className="program-plan-list">{plan.included.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            {plan.excluded && (
              <div className="program-plan-section program-plan-excluded">
                <h4>NO INCLUYE</h4>
                <ul className="program-plan-list">{plan.excluded.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            )}
          </div>

          {/* Condiciones dichas sin apretar: precio publicado, ciclo mensual y
              cancelación por escrito. Es lo mismo que contesta la FAQ de
              /faq («¿Hay permanencia?»), aquí en la ficha donde se mira el precio. */}
          <p className="program-plan-terms">
            Renovación cada mes. Antes de pagar te confirmamos por escrito la fecha de corte y cómo se cancela.
            Lo que no aparece en esta lista no está incluido en el plan: se añade como servicio suelto.
          </p>

          <div className="program-plan-actions">
            <Link className="plan-web-cta" to={`/plan/${plan.id.toLowerCase()}`}>
              <Sparkles size={16} aria-hidden="true" /> VER EN WEB
            </Link>
            <a href={plan.presentationUrl} download className="plan-dossier-cta">
              <Download size={16} aria-hidden="true" /> DESCARGAR DOSSIER PDF
            </a>
            <a href={plan.cta} target="_blank" rel="noreferrer" className={`plan-cta ${plan.featured ? 'featured-cta' : ''}`}>
              HABLAR POR WHATSAPP <MessageCircle size={16} aria-hidden="true" />
            </a>
          </div>

          <p className="program-plan-configurator-hint">
            ¿Necesitas clases o recuperación sueltas encima del plan? Se suman abajo, en el configurador.
          </p>
        </div>
        {plan.featured && <div className="featured-glow" />}
      </motion.article>
    </div>
  )
}

export default function Programs() {
  const capabilities = useCapabilities()
  const addItem = useCartStore((state) => state.addItem)
  const { reducedMotion } = capabilities
  const [narrowViewport, setNarrowViewport] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 760px)').matches : false
  ))

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const media = window.matchMedia('(max-width: 760px)')
    const sync = () => setNarrowViewport(media.matches)
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  const compactMobile = capabilities.mode === 'mobile' || narrowViewport
  const pointerEffectsEnabled = capabilities.mode === 'desktop' && !narrowViewport && !reducedMotion
  const visualizationRef = useRef(null)
  const plansRef = useRef(null)
  const comparisonRef = useRef(null)
  const [comparisonVisible, setComparisonVisible] = useState(reducedMotion)
  const [hoveredComparisonColumn, setHoveredComparisonColumn] = useState(null)
  const [activeServiceCategory, setActiveServiceCategory] = useState(ADDON_SERVICE_GROUPS[0]?.id)
  const [lastAddedServiceId, setLastAddedServiceId] = useState(null)
  const activeComparisonColumn = pointerEffectsEnabled ? hoveredComparisonColumn : null
  const activeServiceGroupIndex = Math.max(
    0,
    ADDON_SERVICE_GROUPS.findIndex(({ id }) => id === activeServiceCategory),
  )
  const activeServiceGroup = ADDON_SERVICE_GROUPS[activeServiceGroupIndex]

  useEffect(() => {
    if (reducedMotion) {
      setComparisonVisible(true)
      return undefined
    }

    const comparisonNode = comparisonRef.current
    if (!comparisonNode || typeof IntersectionObserver === 'undefined') {
      setComparisonVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setComparisonVisible(true)
      observer.disconnect()
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 })

    observer.observe(comparisonNode)
    return () => observer.disconnect()
  }, [reducedMotion])

  const getScrollBehavior = () => (reducedMotion ? 'auto' : 'smooth')
  const scrollToVisualization = () => visualizationRef.current?.scrollIntoView({ behavior: getScrollBehavior() })
  const scrollToPlans = () => plansRef.current?.scrollIntoView({ behavior: getScrollBehavior() })
  const handleComparisonPointerOver = (event) => {
    if (!pointerEffectsEnabled) return
    const columnCell = event.target.closest?.('[data-comparison-column]')
    setHoveredComparisonColumn(columnCell ? Number(columnCell.dataset.comparisonColumn) : null)
  }
  const generalWhatsAppUrl = buildWhatsAppUrl('Hola BAYONA, quiero empezar. ¿Vemos juntos el mejor camino?')
  const addServiceToCart = (service) => {
    addItem({
      type: 'servicio',
      name: service.label,
      priceCOP: service.priceCop,
      qty: 1,
      img: null,
    })
    setLastAddedServiceId(service.id)
    toast.success('Añadido', { description: `${service.label} está en tu carrito.` })
  }

  return (
    <>
      <PageHero
        title="ENTRENAMIENTO CON DIRECCIÓN CLARA."
        kicker="BAYONA • PROGRAMAS DE ENTRENAMIENTO"
        media={siteMedia.programs.hero}
        scene={{ variant: 'showroom', particles: true, postProcessing: true }}
      >
        <p>Todos empiezan igual: evaluamos tu punto de partida, planificamos y revisamos. Lo que cambia es cuánto acompañamiento en vivo necesitas y con qué frecuencia quieres feedback.</p>
        <button className="text-button hero-cta" onClick={scrollToVisualization}>
          VER CÓMO SE ENTIENDE UN PLAN
          <ArrowUpRight size={15} />
        </button>
      </PageHero>

      <section className="programs-choice-rail section-shell ds-reveal ds-reveal--shift" aria-labelledby="programs-choice-rail-title">
        <div className="programs-choice-rail-heading">
          <SectionLabel>ANTES DEL PRECIO</SectionLabel>
          <h2 id="programs-choice-rail-title">EL MÉTODO ES EL MISMO.<br /><span>TÚ ELIGES CUÁNTO ACOMPAÑAMIENTO NECESITAS.</span></h2>
        </div>
        <ol>
          {PROGRAM_DECISION_RAIL.map((step, index) => (
            <li key={step.label}>
              <span>{String(index + 1).padStart(2, '0')} · {step.label}</span>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      {/*
        Etapas, no un diagrama. Cada bloque lleva la foto de su mundo a un lado
        y el texto al otro, y el lado alterna: la página se lee como un editorial
        y no como una lista de tarjetas iguales. La figura anterior (carriles que
        convergían en «MISMO ESTÁNDAR») se fue porque no decía nada: lo que de
        verdad cambia entre etapas son las prácticas concretas, y ahora se nombran.
      */}
      <section className="programs-pain programs-stages section-shell">
        <ProgramsAudienceStage
          items={programAudiences}
          media={siteMedia.programs.audiences}
        />
      </section>

      <section className="programs-method section-shell ds-reveal ds-reveal--shift">
        <SectionLabel>CÓMO TRABAJAMOS</SectionLabel>
        <h2>VALORAR. PLANIFICAR.<br /><span>REVISAR.</span></h2>
        <p className="pain-subtitle">
          Tres cosas que se hacen siempre, en este orden, y que puedes comprobar sesión a sesión.
        </p>
        {/*
          FASE 4B (7): el trío de método no es una retícula de tarjetas. Con el
          dispositivo compartido del sistema se convierte en secuencia leída de
          arriba abajo: filete, figura numerada en el margen y ritmo de 4px. El
          número lo dibuja CSS (`counter()`).
          Ahora cada paso además se ve: la imagen NO acompaña al texto, lo
          explica — lleva el pie con lo que se mira — y el icono decorativo de
          lucide sale del bloque.
        */}
        <div className="method-pillars ds-sequence">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              {...sceneBackgroundProps(siteMedia.programs.pillars[index], {
                className: 'pillar programs-method-step',
                variant: 'accent',
                /*
                  Sin velo, la frase de apoyo —gris— caía directamente sobre la
                  foto. Con variant 'accent' el contrato de `overlay` es un alfa,
                  NO un degradado: `media-scenes.css` lo interpola como
                  `rgb(5 5 5 / var(--scene-overlay))`, y meterle un
                  linear-gradient invalida la declaración completa de
                  background-image. El accent trae 24%; subido a 58% para que el
                  texto descanse sobre negro y no sobre gimnasio.
                */
                overlay: '58%',
                position: 'center 45%',
              })}
              initial={reducedMotion ? false : { y: 20 }}
              whileInView={reducedMotion ? undefined : { y: 0 }}
              viewport={{ once: true }}
              transition={reducedMotion ? undefined : { delay: index * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="programs-method-figure">{pillar.figure}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.copy}</p>
            </motion.div>
          ))}
        </div>
        <p className="method-value-statement">
          Tú dices cuántas veces por semana puedes entrenar de verdad. Sobre eso se escribe el bloque, no al revés.
        </p>
      </section>

      <section className="programs-proof section-shell ds-reveal" aria-label="Garantía de 30 días">
        <GuaranteeStamp reducedMotion={reducedMotion} className="guarantee-after-method" />
      </section>

      <section
        {...sceneBackgroundProps(siteMedia.programs.ninetyDays, {
          className: 'programs-visualization section-shell ds-reveal ds-reveal--mask',
          variant: 'subtle',
          pseudo: 'after',
          motion: true,
        })}
        ref={visualizationRef}
      >
        <SectionLabel>ANTES DE ELEGIR</SectionLabel>
        <h2>ASÍ SE VE<br /><span>UNA SEMANA CON PLAN</span></h2>
        <p className="pain-subtitle">Cinco momentos. Ninguno depende de la motivación de ese día.</p>
        {/* Erases las tarjetas con check: decían cinco verdades generales sin
            sitio en el calendario. Ahora es una secuencia de días, con hora
            aproximada y qué hace cada uno. */}
        <ol className="programs-week">
          {visualizationPoints.map((point, index) => (
            <motion.li
              key={point}
              className="programs-week-item"
              initial={reducedMotion ? false : { y: 20 }}
              whileInView={reducedMotion ? undefined : { y: 0 }}
              viewport={{ once: true }}
              transition={reducedMotion ? undefined : { delay: index * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="programs-week-marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <p>{point}</p>
            </motion.li>
          ))}
        </ol>
        <p className="method-value-statement">
          Un mes son cuatro de estas semanas. Los planes se diferencian por cuántas de ellas te ven entrenar en vivo.
        </p>
        <button className="text-button" onClick={scrollToPlans}>
          COMPARAR LOS PLANES<ArrowUpRight size={15} />
        </button>
      </section>

      {/* Sin `ds-reveal` aquí, a diferencia de las otras tres secciones de esta
          página: `.programs-offer` mide 5287 px, más de cinco pantallas. Una
          animación con `animation-timeline: view()` sobre un elemento así de
          alto recorre toda su entrada, así que el revelado no termina hasta
          bajar 2000-3000 px y las fichas de plan se leen a media opacidad por
          el camino (medido: op 0,62 → 0,77 → 0,92 en tres pantallas seguidas).
          El movimiento de esta sección lo llevan el vídeo y el estado activo de
          cada ficha. */}
      <section className="programs-offer" ref={plansRef}>
        <div className="section-shell" data-immersive="clip">
          {/*
            El vídeo de Sebastián eligiendo camino es la prueba de la sección —es
            literalmente «cómo elegir»—, así que abre. Antes iba tercero, después
            del rótulo, del titular y del párrafo que promete ayudar.
          */}
          <VideoSection
            title="CÓMO ELEGIR SIN DAR VUELTAS"
            subtitle="Sebastián te ayuda a elegir entre RAÍZ, FUERZA, RENDIMIENTO y ELITE según tu momento real."
            poster={mediaHeroUrls(siteMedia.programs.services[0]).retina}
            duration="2 MIN"
            placement="contained"
          />

          <SectionLabel>MEMBRESÍAS MENSUALES</SectionLabel>
          <h2>CUATRO NIVELES.<br /><span>UNA DECISIÓN CLARA.</span></h2>
          <p className="pain-subtitle">Sesiones, seguimiento, contacto y precio. Compara lo que cambia de verdad.</p>

          <ProgramsPlansStage plans={plans} />
        </div>
      </section>

      <section className="programs-comparison-section section-shell ds-reveal ds-reveal--shift" aria-labelledby="comparison-title">
        <SectionLabel>DECIDE SIN DUDAS</SectionLabel>
        <aside className="program-decision-helper" aria-labelledby="decision-helper-title">
          <div className="program-decision-helper-heading">
            <span>UN CAMINO PARA CADA MOMENTO</span>
            <h2 id="decision-helper-title">SI DUDAS, EMPIEZA POR AQUÍ.</h2>
          </div>
          <ul>
            {PLAN_DECISION_PATHS.map((path) => (
              <li key={path.planId}>
                <span>{path.situation}</span>
                <a href={`#plan-${path.planId.toLowerCase()}`}>{path.plan}<ArrowUpRight size={15} aria-hidden="true" /></a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="program-comparison">
          <div className="program-comparison-intro">
            <div>
              <h3 id="comparison-title">8 DIFERENCIAS QUE CAMBIAN<br /><span>TU DECISIÓN.</span></h3>
            </div>
            <p>Lo esencial para elegir sin perderte en letra pequeña.</p>
          </div>
          <p className="comparison-swipe-hint" id="comparison-scroll-hint">Desliza para comparar los cuatro caminos →</p>
          <div
            ref={comparisonRef}
            className="program-comparison-scroll"
            role="region"
            aria-label="Comparación de membresías BAYONA"
            aria-describedby="comparison-scroll-hint"
            tabIndex="0"
          >
            <table
              className={`program-comparison-table ${reducedMotion ? '' : 'program-comparison-stagger'} ${comparisonVisible ? 'is-comparison-visible' : ''}`.trim()}
              onPointerOver={pointerEffectsEnabled ? handleComparisonPointerOver : undefined}
              onPointerLeave={pointerEffectsEnabled ? () => setHoveredComparisonColumn(null) : undefined}
            >
              <caption>Ocho diferencias que importan entre RAÍZ, FUERZA, RENDIMIENTO y ELITE.</caption>
              <thead>
                <tr>
                  <th scope="col" className="comparison-feature-heading">LO QUE RECIBES</th>
                  {plans.map((plan, index) => (
                    <th
                      key={plan.id}
                      scope="col"
                      data-comparison-column={index}
                      className={[
                        plan.featured ? 'comparison-featured-column' : '',
                        activeComparisonColumn === index ? 'is-column-hovered' : '',
                      ].filter(Boolean).join(' ') || undefined}
                    >
                      <strong>{COMPARISON_PLAN_NAMES[plan.id]}</strong>
                      <span className="comparison-plan-price">${plan.priceCop / 1000}k</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {membershipComparisonRows.map((row, rowIndex) => (
                  <tr key={row.feature} style={{ '--program-row-index': rowIndex }}>
                    <th scope="row">{row.feature}</th>
                    {row.values.map((value, index) => (
                      <td
                        key={`${row.feature}-${plans[index].id}`}
                        data-comparison-column={index}
                        className={[
                          plans[index].featured ? 'comparison-featured-column' : '',
                          activeComparisonColumn === index ? 'is-column-hovered' : '',
                        ].filter(Boolean).join(' ') || undefined}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Bridge
        media={siteMedia.programs.community}
        eyebrow="COMUNIDAD · ACCESO ABIERTO"
        title="ENTRA GRATIS"
        titleAccent="ANTES DE PAGAR."
        hook="Conoce la cultura BAYONA en la comunidad. Si te aporta claridad, después eliges acompañamiento."
        free
        freeLabel="ACCESO ABIERTO · SIN NECESIDAD DE PLAN"
        ctaLabel="VER LA COMUNIDAD"
        ctaHref="/community"
        ctaSecondary
        layout="stacked"
      >
        <TestimonialMarquee
          testimonials={[
            {
              author: 'ESTADO EDITORIAL',
              quote: 'Aún no hay testimonios publicados.',
            },
            {
              author: 'CRITERIO DE PUBLICACIÓN',
              quote: 'Cuando los haya, serán historias reales y con permiso.',
            },
          ]}
        />
      </Bridge>

      <section className="programs-services section-shell ds-reveal ds-reveal--scale" aria-labelledby="services-title">
        <SectionLabel>CATÁLOGO · SE PIDE, NO SE CONTRATA</SectionLabel>
        <div className="programs-services-heading">
          <h2 id="services-title">Servicios sueltos<br /><span>cuando algo del plan se queda corto.</span></h2>
          <p>
            Aquí no se toca el plan: esto es la tienda. Lo añades al carrito y lo ves en el resumen, con el precio
            publicado. El total de tu mes —membresía más servicios— se calcula más abajo, en el configurador.
          </p>
        </div>

        <div className="program-service-showroom-shell">
          <nav className="program-service-categories" aria-label="Explorar servicios por categoría">
            <ol>
              {ADDON_SERVICE_GROUPS.map((group, index) => {
                const isActive = group.id === activeServiceGroup.id

                return (
                  <li key={group.id}>
                    <button
                      type="button"
                      aria-pressed={isActive}
                      aria-controls="program-services-active-panel"
                      onClick={() => setActiveServiceCategory(group.id)}
                    >
                      <span className="program-service-category-index" aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="program-service-category-copy">
                        <strong>{group.title}</strong>
                        <small>{group.promise}</small>
                      </span>
                      <span className="program-service-category-count" aria-label={`${group.services.length} servicios`}>
                        {String(group.services.length).padStart(2, '0')}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>

          <motion.section
            key={activeServiceGroup.id}
            id="program-services-active-panel"
            {...sceneBackgroundProps(siteMedia.programs.services[activeServiceGroupIndex], {
              className: 'program-service-showroom',
              variant: 'subtle',
              position: 'center 42%',
              motion: true,
              overlay: 'linear-gradient(115deg, rgba(5, 5, 5, 0.7), rgba(5, 5, 5, 0.92) 72%)',
              blur: 2,
            })}
            aria-labelledby={`program-service-category-${activeServiceGroup.id.toLowerCase()}`}
            aria-live="polite"
            initial={reducedMotion ? false : { y: 18 }}
            animate={reducedMotion ? undefined : { y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="program-service-showroom-heading">
              <span className="program-service-showroom-icon" aria-hidden="true">
                {(() => {
                  const ActiveCategoryIcon = activeServiceGroup.Icon
                  return <ActiveCategoryIcon size={28} />
                })()}
              </span>
              <div>
                <p>{activeServiceGroup.services.length} SERVICIOS · SELECCIÓN ABIERTA</p>
                <h3 id={`program-service-category-${activeServiceGroup.id.toLowerCase()}`}>
                  {activeServiceGroup.title}
                </h3>
                <span>{activeServiceGroup.promise}. Revisa una opción y añádela cuando encaje contigo.</span>
              </div>
            </header>

            <ol className="program-service-grid">
              {activeServiceGroup.services.map((service, index) => {
                const isSessionService = SESSION_SERVICE_IDS.has(service.id)
                const wasAdded = lastAddedServiceId === service.id

                return (
                  <li
                    key={service.id}
                    className={`program-service-card${wasAdded ? ' is-added' : ''}`}
                    data-service-id={service.id}
                  >
                    <div className="program-service-card-meta">
                      <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      <em>{isSessionService ? 'SESIÓN ADICIONAL' : 'SERVICIO ESPECIALIZADO'}</em>
                    </div>
                    <div className="program-service-card-copy">
                      <h4>{service.label}</h4>
                      <p>{service.description}</p>
                    </div>
                    <div className="program-service-card-scope">
                      <span>{service.presencial ? 'PRESENCIAL · CONFIRMA DISPONIBILIDAD' : 'AÑADIBLE A TU PLAN'}</span>
                    </div>
                    <div className="program-service-card-footer">
                      <div className="program-service-card-price">
                        <span>INVERSIÓN ADICIONAL</span>
                        <strong>{service.priceDisplay}</strong>
                        <small>COP</small>
                      </div>
                      <button
                        className="program-service-cart"
                        type="button"
                        aria-label={`Añadir ${service.label} al carrito por ${service.priceDisplay} COP`}
                        onClick={() => addServiceToCart(service)}
                      >
                        {wasAdded ? <Check size={15} aria-hidden="true" /> : <ShoppingCart size={15} aria-hidden="true" />}
                        {wasAdded ? 'AÑADIR OTRO' : 'AÑADIR AL CARRITO'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ol>

            <footer className="program-service-showroom-note">
              <span>PRECIOS PUBLICADOS EN COP</span>
              <p>Los servicios presenciales dependen de ubicación y disponibilidad. El total lo ves antes de enviar nada.</p>
            </footer>
          </motion.section>
        </div>
      </section>

      <section className="programs-calculator programs-configurator">
        <div className="section-shell" data-immersive="clip">
          <SectionLabel>CONFIGURADOR · CONSTRUYE TU PLAN EXACTO</SectionLabel>
          <h2>ELIGE PLAN Y<br /><span>AÑADE SERVICIOS.</span></h2>
          <p className="programs-calculator-intro">
            Una sola cuenta, tres salidas: lo dejas escrito por WhatsApp, lo mandas al carrito desde el catálogo
            de arriba, o pasas por la caja. Ninguna es un pago automático: el precio que ves es el publicado en esta web.
          </p>
          <PlanCalculator />
          {/*
            Fase 4 (DP-3): /checkout no tenía ninguna entrada en el sitio.
            La calculadora de esta página es el paso natural hacia el
            configurador completo, donde se prepara la solicitud de WhatsApp.
          */}
          <GoldButton to="/checkout" className="programs-calculator-open">
            IR A LA CAJA CON ESTE PLAN
          </GoldButton>
          <p className="programs-calculator-open-note">
            En la caja eliges periodo y moneda; si prefieres hablar antes, el botón de WhatsApp del resumen ya lleva tu selección escrita.
          </p>
        </div>
      </section>

      <section className="programs-cta-stack section-shell">
        {/*
          La garantía ya se decía aquí con el mismo sello que dos párrafos más
          arriba —tres veces la misma promesa en una ruta—, y el sello es un
          icono de 42px, así que la sección no tenía soporte visual ninguno. Se
          cambió el tercero por la cosa que la garantía afirma: una hoja de
          calendario con los días que son. El número sale de GUARANTEE.days; si
          mañana la ventana cambia, el dibujo cambia solo.
        */}
        <svg
          className="program-figure program-figure--hoja-dias ds-reveal ds-reveal--spatial"
          viewBox="0 0 240 184"
          role="img"
          aria-label={`Calendario con ${GUARANTEE.days} días por delante: la ventana para evaluar el acompañamiento.`}
        >
          <path className="program-hoja-anillo" d="M84 8 v18 M156 8 v18" />
          <rect className="program-hoja-pagina" x="36" y="22" width="168" height="132" rx="3" />
          <path className="program-hoja-cabecera" d="M36 50 H204" />
          <text className="program-hoja-numero" x="120" y="122" textAnchor="middle">{GUARANTEE.days}</text>
          <text className="program-figure-label" x="120" y="178" textAnchor="middle">DÍAS PARA EVALUARLO</text>
        </svg>
        <div className="programs-closing-copy">
          <SectionLabel>SIGUIENTE PASO</SectionLabel>
          <h2>Compara, confirma<br /><span>y empieza con dirección.</span></h2>
          <p>Prestaciones, disponibilidad y condiciones. Lo revisamos antes de que pagues.</p>
        </div>
        <p className="programs-closing-urgency">Si no sabes cuál elegir, lo resolvemos juntos por WhatsApp.</p>
        <div className="cta-stack">
          <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" className="gold-button primary-cta">
            HABLAMOS POR WHATSAPP<ArrowUpRight size={18} />
          </a>
          <GoldButton to="/faq" className="secondary-cta">VER PREGUNTAS</GoldButton>
        </div>
      </section>

    </>
  )
}
