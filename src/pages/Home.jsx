import { animate, motion, useInView } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Zap } from 'lucide-react'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GoldButton, SectionLabel } from '../components/Layout'
import BenefitsOrbitStage from '../components/home/BenefitsOrbitStage.jsx'
import CinematicOfferGate from '../components/home/CinematicOfferGate.jsx'
import CommunityImmersiveStage from '../components/home/CommunityImmersiveStage.jsx'
import ExperienceProof from '../components/home/ExperienceProof.jsx'
import ImmersiveMethodStage from '../components/home/ImmersiveMethodStage.jsx'
import PainUnlockStage from '../components/home/PainUnlockStage.jsx'
import ProofProcessStage from '../components/home/ProofProcessStage.jsx'
import FreeValue from '../components/home/FreeValue.jsx'
import HeroShortcut from '../components/home/HeroShortcut.jsx'
import ScrollFilm from '../components/home/ScrollFilm.jsx'
import VisionShiftStage from '../components/home/VisionShiftStage.jsx'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import ExtrasExplorer from '../components/conversion/ExtrasExplorer.jsx'
import PersistentSummary from '../components/conversion/PersistentSummary.jsx'
import PlanExplorer from '../components/conversion/PlanExplorer.jsx'
import RequestPreview from '../components/conversion/RequestPreview.jsx'
import {
  HOME_EVIDENCE_CONTEXT,
  homeContentModel,
  membershipPlanEditorialProjection,
} from '../config/conversionContent.js'
import { evidenceRegistry } from '../config/evidenceRegistry.js'
import { mediaHeroUrls, siteMedia } from '../config/siteMedia.js'
import { calculateExperience, membershipPlans } from '../config/offerings.js'
import { useCapabilities } from '../engine/hooks/useCapabilities.js'
import { pointerEffectsEnabled } from '../engine/providers/capabilities.js'
import { selectPublishableEvidence } from '../lib/conversion/evidence.js'
import { lazy, Suspense } from 'react'
// home.css era global en main.jsx (112 kB en todas las rutas). Ahora viaja
// con la Home: mantiene su posición relativa frente a overrides/v2/v3 (todas
// globales en main.jsx y posteriores en la cascada), igual que about.css y
// el resto de hojas de ruta.
import '../styles/home.css'
import '../styles/home-cinematic-continuity.css'
import '../styles/home-commercial-editorial.css'
import '../styles/home-art-direction-2026.css'
import '../styles/bayona-cinematic-system.css'
import '../styles/bayona-cinematic-motion.css'
import '../styles/bayona-visual-audit.css'

/** Capa WebGL del hero — carga diferida para proteger el LCP (Fase 11.1). */
const Hero3DLayer = lazy(() => import('../components/home/Hero3DLayer.jsx'))

const HOME_EASE = [0.16, 1, 0.3, 1]
const HOME_NUMBER_FORMATTER = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const HOME_HERO_WORDS = Object.freeze(homeContentModel.h1.split(/\s+/))

/*
  Corte del titular en dos colores (comentario 3 de las 70 anotaciones: «mira
  que el título tiene dos colores», señalando el bloque de comunidad como
  referencia). La primera frase es la promesa y va en claro; la segunda es la
  consecuencia y se queda en naranja.

  Se calcula sobre el propio modelo de contenido, no sobre palabras escritas a
  mano aquí: si el dueño vuelve a cambiar el titular, el corte sigue cayendo en
  el final de la primera frase. Y si el titular no tiene dos frases, el índice
  sale -1 → 0, es decir todo en naranja como hasta ahora: no se rompe nada.
*/
const HOME_HERO_ACCENT_FROM = HOME_HERO_WORDS.findIndex((word) => word.endsWith('.')) + 1

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: HOME_EASE } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

const heroTitleStagger = {
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.055 } },
}

const heroWordReveal = {
  hidden: { opacity: 0, y: '0.55em' },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: HOME_EASE } },
}

const homeProblemBlock = homeContentModel.blocks.find(({ id }) => id === 'home-problem')
const homeVisionBlock = homeContentModel.blocks.find(({ id }) => id === 'home-vision')
const homeMechanismBlock = homeContentModel.blocks.find(({ id }) => id === 'home-mechanism')
const homeProcessBenefitsBlock = homeContentModel.blocks.find(({ id }) => id === 'home-process-benefits')
const homeEvidenceBlock = homeContentModel.blocks.find(({ id }) => id === 'home-evidence-unavailable')
const homeProcessFallbackBlock = homeContentModel.blocks.find(({ id }) => id === 'home-process-fallback')
const homeOfferBlock = homeContentModel.blocks.find(({ id }) => id === 'home-offer')
const homeActionBlock = homeContentModel.blocks.find(({ id }) => id === 'home-action')

const EVIDENCE_KIND_LABELS = Object.freeze({
  testimonial: 'TESTIMONIO',
  credential: 'CREDENCIAL',
  statistic: 'DATO',
  case: 'CASO',
  process: 'PROCESO',
})

function HomeCountUp({ className = '', duration = 0.9, finalText, value }) {
  const { reducedMotion } = useCapabilities()
  const numberRef = useRef(null)
  const isInView = useInView(numberRef, { once: true, amount: 0.35 })
  const targetValue = Number.isFinite(value) ? value : 0
  const currentValueRef = useRef(reducedMotion ? targetValue : 0)
  const [displayValue, setDisplayValue] = useState(() => (
    reducedMotion ? finalText : HOME_NUMBER_FORMATTER.format(0)
  ))

  useEffect(() => {
    if (reducedMotion) {
      currentValueRef.current = targetValue
      setDisplayValue(finalText)
      return undefined
    }

    if (!isInView) return undefined

    const fromValue = currentValueRef.current

    if (fromValue === targetValue) {
      setDisplayValue(finalText)
      return undefined
    }

    const controls = animate(fromValue, targetValue, {
      duration,
      ease: HOME_EASE,
      onUpdate: (latest) => {
        currentValueRef.current = latest
        setDisplayValue(HOME_NUMBER_FORMATTER.format(Math.round(latest)))
      },
      onComplete: () => {
        currentValueRef.current = targetValue
        setDisplayValue(finalText)
      },
    })

    return () => controls.stop()
  }, [duration, finalText, isInView, reducedMotion, targetValue])

  return (
    <span
      ref={numberRef}
      className={`home-count-up ${className}`.trim()}
      aria-label={finalText}
    >
      {displayValue}
    </span>
  )
}

function HomePlanExplorer() {
  const capabilities = useCapabilities()
  const pointerEffects = pointerEffectsEnabled(capabilities)
  const interactionRef = useRef(null)

  // Estabilizar la referencia de projections para evitar re-renders innecesarios
  const stableProjections = useMemo(() => membershipPlanEditorialProjection, [])

  const resetPlanPreview = useCallback(() => {
    interactionRef.current?.querySelectorAll('.plan-showroom-preview').forEach((preview) => {
      preview.style.setProperty('--plan-tilt-x', '0deg')
      preview.style.setProperty('--plan-tilt-y', '0deg')
    })
  }, [])

  const handlePlanPointerMove = useCallback((event) => {
    if (!pointerEffects || !(event.target instanceof Element)) return

    const preview = event.target.closest('.plan-showroom-preview')
    if (!preview || !event.currentTarget.contains(preview)) return

    const bounds = preview.getBoundingClientRect()
    const localX = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width)
    const localY = Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height)
    const normalizedX = bounds.width > 0 ? localX / bounds.width : 0.5
    const normalizedY = bounds.height > 0 ? localY / bounds.height : 0.5

    preview.style.setProperty('--plan-spotlight-x', `${localX.toFixed(1)}px`)
    preview.style.setProperty('--plan-spotlight-y', `${localY.toFixed(1)}px`)
    preview.style.setProperty('--plan-tilt-x', `${((0.5 - normalizedY) * 2).toFixed(2)}deg`)
    preview.style.setProperty('--plan-tilt-y', `${((normalizedX - 0.5) * 2).toFixed(2)}deg`)
  }, [pointerEffects])

  useEffect(() => {
    if (!pointerEffects) resetPlanPreview()
  }, [pointerEffects, resetPlanPreview])

  return (
    <div
      ref={interactionRef}
      className="home-plan-interactions"
      data-pointer-effects={pointerEffects ? 'true' : 'false'}
      onPointerMove={handlePlanPointerMove}
      onPointerLeave={resetPlanPreview}
    >
      <PlanExplorer projections={stableProjections} />
    </div>
  )
}

function restartSelectionFeedback(target, root, reducedMotion) {
  if (reducedMotion || !(target instanceof Element)) return

  const feedbackTarget = target.closest(
    '.extras-plan-options label, .extras-quantity-control select, .extras-selection-action',
  )

  if (!feedbackTarget || !root.contains(feedbackTarget)) return

  feedbackTarget.removeAttribute('data-selection-feedback')
  void feedbackTarget.offsetWidth
  feedbackTarget.setAttribute('data-selection-feedback', 'active')
}

export function HomeProofSection({
  recordsOrRegistry = evidenceRegistry,
  context = HOME_EVIDENCE_CONTEXT,
}) {
  const publishedEvidence = selectPublishableEvidence(recordsOrRegistry, context)
  const hasPublishedEvidence = publishedEvidence.length > 0
  const visibleBlock = hasPublishedEvidence ? homeEvidenceBlock : homeProcessFallbackBlock

  // Sin testimonios verificados mostramos el proceso editorial real,
  // no una sección invisible. La evidencia sigue cerrada hasta su aprobación.
  return (
    <section
      {...sceneBackgroundProps(siteMedia.home.proof, {
        className: 'proof-section',
        variant: 'subtle',
      })}
      aria-labelledby="home-proof-heading"
      data-content-stage="proof"
      data-content-block={visibleBlock.id}
      data-evidence-gate={hasPublishedEvidence ? 'published' : 'empty'}
    >
      <div className="proof-bg-number" aria-hidden="true">04</div>
      <div className="section-shell">
        {hasPublishedEvidence ? (
          <>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
            >
              <SectionLabel>04 / EXPERIENCIA</SectionLabel>
              <motion.h2 id="home-proof-heading" variants={fadeUp}>{visibleBlock.heading}</motion.h2>
              <motion.p variants={fadeUp} className="proof-intro">{visibleBlock.body}</motion.p>
            </motion.div>

            <motion.ol
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
              className="evidence-list"
              aria-label="Experiencia verificada de BAYONA"
            >
              {publishedEvidence.map((record) => {
                const statement = typeof record.content?.statement === 'string'
                  ? record.content.statement.trim()
                  : ''

                return (
                  <motion.li
                    key={record.id}
                    variants={fadeUp}
                    className="evidence-record"
                    data-evidence-kind={record.kind}
                  >
                    <p className="evidence-kind">{EVIDENCE_KIND_LABELS[record.kind] ?? 'EXPERIENCIA'}</p>
                    <h3>{record.attribution}</h3>
                    {statement && <blockquote>{statement}</blockquote>}
                    <dl className="evidence-meta">
                      <div>
                        <dt>Alcance</dt>
                        <dd>{record.scope}</dd>
                      </div>
                      <div>
                        <dt>Fuente</dt>
                        <dd>{record.sourceRef}</dd>
                      </div>
                    </dl>
                  </motion.li>
                )
              })}
            </motion.ol>
          </>
        ) : (
          <ProofProcessStage block={homeProcessFallbackBlock} />
        )}
      </div>
    </section>
  )
}

function HomeExperienceConfigurator() {
  const { reducedMotion } = useCapabilities()
  const [selection, setSelection] = useState(() => ({
    planId: membershipPlans[0].id,
    serviceQuantities: {},
    extraIds: [],
  }))
  const calculation = useMemo(() => calculateExperience(selection), [selection])
  const animatedCalculation = useMemo(() => ({
    ...calculation,
    totalDisplay: (
      <HomeCountUp
        className="persistent-summary-count"
        duration={0.72}
        finalText={calculation.totalDisplay}
        value={calculation.totalCop}
      />
    ),
  }), [calculation])

  const handleChangeCapture = useCallback((event) => {
    restartSelectionFeedback(event.target, event.currentTarget, reducedMotion)
  }, [reducedMotion])

  const handleClickCapture = useCallback((event) => {
    if (!(event.target instanceof Element) || !event.target.closest('.extras-selection-action')) return
    restartSelectionFeedback(event.target, event.currentTarget, reducedMotion)
  }, [reducedMotion])

  const handleAnimationEndCapture = useCallback((event) => {
    if (event.animationName === 'home-selection-feedback' && event.target instanceof Element) {
      event.target.removeAttribute('data-selection-feedback')
    }
  }, [])

  return (
    <div
      className="home-configurator-interaction"
      onChangeCapture={handleChangeCapture}
      onClickCapture={handleClickCapture}
      onAnimationEndCapture={handleAnimationEndCapture}
    >
      <div className="extras-configurator">
        <ExtrasExplorer selection={selection} onSelectionChange={setSelection} />
        <PersistentSummary calculation={animatedCalculation} />
      </div>
      <RequestPreview selection={selection} />
    </div>
  )
}

export default function Home() {
  const capabilities = useCapabilities()
  const heroPointerEffects = pointerEffectsEnabled(capabilities)
  const heroRef = useRef(null)

  // Intersection Observer para animaciones de scroll
  useEffect(() => {
    if (capabilities.reducedMotion) return undefined

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1,
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Seleccionar elementos a animar
    const elementsToAnimate = document.querySelectorAll(`
      .hero-module h1,
      .vision-section h2,
      .pain-section h2,
      .mechanism-section h2,
      .solution-section h2,
      .proof-section h2,
      .offer-section h2,
      .calculator-section h2,
      .cta-stack-section h2,
      .pain-item,
      .proof-process-item,
      .mechanism-step,
      .pillar-item,
      .evidence-record,
      .home-configurator-guide li
    `)

    elementsToAnimate.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [capabilities.reducedMotion])

  const resetHeroParallax = useCallback(() => {
    const hero = heroRef.current
    if (!hero) return

    hero.style.setProperty('--hero-content-x', '0px')
    hero.style.setProperty('--hero-content-y', '0px')
    hero.style.setProperty('--hero-aurora-x', '0px')
    hero.style.setProperty('--hero-aurora-y', '0px')
    hero.style.setProperty('--hero-particles-x', '0px')
    hero.style.setProperty('--hero-particles-y', '0px')
  }, [])

  const handleHeroPointerMove = useCallback((event) => {
    if (!heroPointerEffects) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const normalizedX = bounds.width > 0
      ? ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      : 0
    const normalizedY = bounds.height > 0
      ? ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      : 0

    event.currentTarget.style.setProperty('--hero-content-x', `${(normalizedX * 4).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--hero-content-y', `${(normalizedY * 3).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--hero-aurora-x', `${(normalizedX * -8).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--hero-aurora-y', `${(normalizedY * -6).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--hero-particles-x', `${(normalizedX * 6).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--hero-particles-y', `${(normalizedY * 4).toFixed(2)}px`)
  }, [heroPointerEffects])

  useEffect(() => {
    if (!heroPointerEffects) resetHeroParallax()
  }, [heroPointerEffects, resetHeroParallax])

  return (
    <>
      <section
        ref={heroRef}
        {...sceneBackgroundProps(siteMedia.home.hero, {
          className: 'hero-module',
          variant: 'hero',
          pseudo: 'after',
          motion: true,
        })}
        aria-labelledby="home-hero-title"
        /*
          FASE 4 (4.3) · DECLARACIÓN DE CAPAS. La portada se compone con las
          cuatro capas del sistema y ninguna sustituye a otra: A editorial (el
          DOM ya lo cuenta todo), B motion (stagger del titular) y C
          profundidad en CSS puro (velo + filete de asiento). Cero WebGL aquí:
          si el laboratorio cae, la pieza maestra ni se entera.
        */
        data-experience-layer="editorial motion spatial"
        data-pointer-effects={heroPointerEffects ? 'true' : 'false'}
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={resetHeroParallax}
      >
        <div className="hero-aurora" aria-hidden="true" />

        {/* Fallback CSS atmosférico — SIEMPRE presente (contrato del
            SceneErrorBoundary: si WebGL falla, el hero no se queda vacío).
            IMMERSIVE LUXURY §5: se reduce a textura subordinada (véase CSS);
            el movimiento vivo lo aporta la órbita WebGL cuando está disponible. */}
        <div className="hero-particles" aria-hidden="true">
          <span style={{ '--particle-x': '8%', '--particle-y': '18%', '--particle-size': '3px', '--particle-opacity': '0.74' }} />
          <span style={{ '--particle-x': '22%', '--particle-y': '72%', '--particle-size': '2px', '--particle-opacity': '0.58' }} />
          <span style={{ '--particle-x': '39%', '--particle-y': '34%', '--particle-size': '4px', '--particle-opacity': '0.84' }} />
          <span style={{ '--particle-x': '58%', '--particle-y': '79%', '--particle-size': '3px', '--particle-opacity': '0.7' }} />
          <span style={{ '--particle-x': '76%', '--particle-y': '21%', '--particle-size': '2px', '--particle-opacity': '0.82' }} />
          <span style={{ '--particle-x': '91%', '--particle-y': '61%', '--particle-size': '3px', '--particle-opacity': '0.66' }} />
        </div>

        {/* Capa WebGL 3D — carga diferida para no bloquear LCP (Fase 11.1).
            IMMERSIVE LUXURY §5: la órbita es la capa atmosférica MÓVIL del
            hero; reacciona al cursor. Las partículas CSS de arriba quedan
            como fallback subordinado y se atenúan cuando esta capa está viva
            (selector [data-webgl-active] que aplica SceneMount). */}
        <Suspense fallback={null}>
          <Hero3DLayer />
        </Suspense>

        {/* Capa de acoplamiento hero → TU FUTURO (IMMERSIVE LUXURY §9).
            No es un corte: es velo que se espesa con el scroll. Va en
            z-index por debajo del contenido y reacciona al progreso de
            scroll del hero (CSS scroll-driven, fallback estático). */}
        <div className="hero-curtain" aria-hidden="true" />

        <div className="hero-layout">
          <div className="hero-content">
            {/*
              RECEPCIÓN. Quien acaba de llegar todavía no sabe qué tiene que
              decidir, así que la portada no le pide ninguna decisión: le da la
              bienvenida y le ofrece el recorrido, igual que un asesor en la
              puerta de un gimnasio nuevo. Una sola acción principal (la
              recepción de /onboarding) y, debajo, el atajo pequeño de quien ya
              conoce la casa.
            */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="hero-kicker"
            >
              BAYONA <span>·</span> ENTRENAMIENTO CON MÉTODO
            </motion.p>

            <motion.h1
              id="home-hero-title"
              aria-label={homeContentModel.h1}
              initial={capabilities.reducedMotion ? false : 'hidden'}
              animate="visible"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900 }}
            >
              <motion.span
                className="hero-title-words"
                aria-hidden="true"
                variants={heroTitleStagger}
              >
                {HOME_HERO_WORDS.map((word, index) => (
                  <Fragment key={`${word}-${index}`}>
                    <motion.span
                      className={`hero-title-word${index < HOME_HERO_ACCENT_FROM ? ' hero-title-word--base' : ''}`}
                      variants={heroWordReveal}
                    >
                      {word}
                    </motion.span>
                    {index < HOME_HERO_WORDS.length - 1 ? ' ' : null}
                  </Fragment>
                ))}
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="hero-subheadline"
            >
              Soy Sebastián. Leemos tu punto de partida, construimos una ruta y la ajustamos contigo.
              Sin humo. Sin rutinas copiadas. Con criterio.
            </motion.p>

            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24 }}
              className="hero-actions"
              aria-label="Empezar el recorrido por BAYONA"
            >
              <GoldButton to="/onboarding" className="hero-tour-cta">
                EMPIEZA CON DIRECCIÓN
              </GoldButton>
            </motion.nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.34 }}
              className="hero-reception"
            >
              <p className="hero-reception-note">Primero entiendes el método. Después decides.</p>
              <HeroShortcut />
            </motion.div>
          </div>
        </div>

        {/* Puerta discreta para mirar por su cuenta: no pide nada, solo avisa
            de que el recorrido sigue abajo. */}
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="scroll-cue"
          href="#problemas"
        >
          VER EL MÉTODO <ArrowDown size={13} aria-hidden="true" />
        </motion.a>
      </section>

      <ScrollFilm />

      <section
        {...sceneBackgroundProps(siteMedia.home.ninetyDays, {
          className: 'vision-section home-passage',
          variant: 'hero',
          pseudo: 'after',
          position: 'center 38%',
          motion: true,
        })}
        aria-labelledby="home-vision-heading"
        data-experience-layer="editorial motion spatial"
        data-content-stage={homeVisionBlock.stage}
        data-content-block={homeVisionBlock.id}
        data-content-placement="prelude"
      >
        <div className="section-shell vision-layout vision-layout--immersive">
          <VisionShiftStage block={homeVisionBlock} />
        </div>
      </section>

      <section
        id="problemas"
        className="pain-section home-editorial-light chapter-handoff-light"
        aria-labelledby="transformation-heading"
        data-content-stage={homeProblemBlock.stage}
        data-content-block={homeProblemBlock.id}
      >
        <div className="section-shell">
          <PainUnlockStage block={homeProblemBlock} />
        </div>
      </section>

      <CommunityImmersiveStage media={siteMedia.home.community} />

      <section
        {...sceneBackgroundProps(siteMedia.home.method, {
          className: 'mechanism-section home-scene home-scene--method',
          variant: 'hero',
          pseudo: 'after',
          position: '68% 48%',
          overlay: 'linear-gradient(90deg, rgba(5, 5, 5, 0.97) 0%, rgba(5, 5, 5, 0.80) 44%, rgba(5, 5, 5, 0.24) 100%), linear-gradient(180deg, rgba(5, 5, 5, 0.12), rgba(5, 5, 5, 0.52))',
          blur: 0,
        })}
        aria-labelledby="home-mechanism-heading"
        data-experience-layer="editorial spatial motion"
        data-content-stage={homeMechanismBlock.stage}
        data-content-block={homeMechanismBlock.id}
      >
        <div className="section-shell home-scene-content home-scene-content--immersive">
          <ImmersiveMethodStage
            items={homeMechanismBlock.items}
            heading={homeMechanismBlock.heading}
            body={homeMechanismBlock.body}
          />
        </div>
      </section>



      <section
        {...sceneBackgroundProps(siteMedia.home.pillars[1], {
          className: 'solution-section home-scene home-scene--benefits',
          variant: 'hero',
          pseudo: 'after',
          position: 'center 44%',
          overlay: 'linear-gradient(180deg, rgba(5, 5, 5, 0.52), rgba(5, 5, 5, 0.9) 78%)',
          blur: 1,
        })}
        aria-labelledby="home-benefits-heading"
        data-content-stage={homeProcessBenefitsBlock.stage}
        data-content-block={homeProcessBenefitsBlock.id}
      >
        <div className="section-shell home-scene-content home-scene-content--immersive">
          <BenefitsOrbitStage block={homeProcessBenefitsBlock} />
        </div>
      </section>

      {/*
        Personas reales, justo antes de los precios.
        Va en su propia sección y NO dentro de HomeProofSection a propósito: esa
        sección es la puerta de evidencia y su contrato es publicar únicamente
        evidencia verificada (o el proceso, si no hay). Estas son experiencias
        publicadas con autorización, que es otro tipo de claim, así que no deben
        mezclarse ahí dentro. Cierra el momento de prueba sin número propio.
      */}
      <HomeProofSection />
      <ExperienceProof />

      {/*
        Antes de los precios, a propósito. La persona recorría toda la
        argumentación y lo primero que se le ofrecía era pagar, mientras el
        valor gratuito real vivía en la parada 6 y 7 del itinerario.
        Primero se da, después se pregunta.
      */}
      <FreeValue />

      <section
        data-experience-layer="commercial"
        className="offer-section home-memberships-section chapter-handoff-light"
        aria-labelledby="home-offer-heading"
        data-content-stage={homeOfferBlock.stage}
        data-content-block={homeOfferBlock.id}
      >
        <div className="offer-bg-number" aria-hidden="true">05</div>
        <CinematicOfferGate />
        <div className="section-shell home-offer-shell">
          <div className="home-section-heading-grid home-offer-heading-layout" data-immersive="clip">
            <span className="home-vertical-word" aria-hidden="true">MEMBRESÍAS</span>
            <div>
              <SectionLabel>05 / ELIGE EL ACOMPAÑAMIENTO</SectionLabel>
              <h2 id="home-offer-heading">{homeOfferBlock.heading}</h2>
              <p className="offer-intro">{homeOfferBlock.body}</p>
              <p className="home-offer-clarifier">
                Los servicios opcionales se suman después y nunca sustituyen la base.
              </p>
            </div>
          </div>
          <HomePlanExplorer />
        </div>
      </section>

      <section className="calculator-section home-services-configurator">
        <div className="section-shell">
          <SectionLabel>06 / PERSONALIZA SIN CONFUNDIR</SectionLabel>
          <h2>PRIMERO ELIGE LA BASE.<br /><span>DESPUÉS AÑADES PRECISIÓN.</span></h2>
          <ol className="home-configurator-guide" aria-label="Cómo configurar tu experiencia BAYONA">
            <li><span>01</span><strong>MEMBRESÍA BASE</strong><p>El nivel de acompañamiento que sostiene el proceso.</p></li>
            <li><span>02</span><strong>EXTRAS OPCIONALES</strong><p>Sesiones y servicios solo si aceleran tu objetivo.</p></li>
            <li><span>03</span><strong>REVISIÓN FINAL</strong><p>Total y mensaje exacto visibles antes de abrir WhatsApp.</p></li>
          </ol>
          <HomeExperienceConfigurator />
        </div>
      </section>

      <section
        {...sceneBackgroundProps(siteMedia.about.story, {
          className: 'cta-stack-section home-about-bridge',
          variant: 'hero',
          pseudo: 'after',
          position: 'center 38%',
          overlay: 'linear-gradient(90deg, rgba(5, 5, 5, 0.94), rgba(5, 5, 5, 0.64) 62%, rgba(5, 5, 5, 0.34))',
          blur: 1,
        })}
        aria-labelledby="home-about-bridge-title"
        data-content-stage={homeActionBlock.stage}
        data-content-block={homeActionBlock.id}
      >
        <div className="bayona-final-visual" aria-hidden="true">
          <img src="/images/burst/sunset-hike-to-the-summit-960.webp" alt="" width="960" height="640" loading="lazy" decoding="async" />
          <span className="bayona-final-visual__caption">BAYONA / SIGUIENTE HORIZONTE</span>
        </div>
        <div className="section-shell final-curtain" data-immersive="clip">
          {/*
            IMMERSIVE LUXURY §52-53 · CIERRE CINEMATOGRÁFICO.
            No es "compra ahora": es la última página de un libro. Declaración
            final, sello de marca y las dos puertas, tipográficas, sin cajas.
          */}
          <div className="bayona-final-narrative">
            <SectionLabel>07 / CONTINÚA LA HISTORIA</SectionLabel>
            <h2 id="home-about-bridge-title">
              {homeActionBlock.heading.split(', ')[0]}, <br />
              <span>{homeActionBlock.heading.split(', ').slice(1).join(', ')}</span>
            </h2>
            <p className="offer-intro">
              {homeActionBlock.body}
            </p>
          </div>

          <div className="cta-stack final-doors">
            <div>
              <Link to="/about" className="cta-primary">CONOCER LA HISTORIA <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
            <div>
              <Link to="/programs" className="cta-secondary">COMPARAR PROGRAMAS <Zap size={18} aria-hidden="true" /></Link>
            </div>
          </div>

          <div className="final-seal" aria-hidden="true">
            <p className="final-mark">BAYONA</p>
            <p className="final-tagline">WHERE SCIENCE MEETS MOVEMENT.</p>
          </div>
        </div>
      </section>



      <footer className="home-disclaimer" style={{ padding: '1.5rem 0', opacity: 0.62 }}>
        <div className="section-shell">
          <small className="home-disclaimer-note">
            BAYONA es acompañamiento de entrenamiento. Los resultados dependen de tu contexto y de tu constancia, y de las decisiones que sostengamos en el tiempo.
          </small>
        </div>
      </footer>
    </>
  )
}
