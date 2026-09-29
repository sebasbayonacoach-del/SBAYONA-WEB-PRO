import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import CompanionDron from '../components/companion/CompanionDron.jsx'
import WhatsAppMark from '../components/companion/WhatsAppMark.jsx'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import { bayonaScenes, siteMedia } from '../config/siteMedia.js'
import { whatsAppLink } from '../config/site.config.js'
import { translatedUrl } from '../lib/i18n/visitorLocale.js'
import { DEFAULT_CURRENCY, formatMoney } from '../lib/commerce/money.js'
import { companionLine } from '../lib/onboarding/companionScript.js'
import {
  DEPTHS,
  HOUSE_STOPS,
  VISITOR_LANGUAGES,
  buildGift,
  createEmptyAnswers,
  depthById,
  languageByCode,
  questionsFor,
  regionById,
  zoneById,
} from '../lib/onboarding/questions.js'
import { mapAnswersToRoute } from '../lib/onboarding/routeMap.js'
import { useVisitorJourney } from '../lib/onboarding/VisitorJourneyProvider.jsx'
import '../styles/onboarding.css'

/**
 * LA RECEPCIÓN
 * ---------------------------------------------------------------------------
 * Seis pantallas, una detrás de otra, sin numerar y sin avisos legales:
 *
 *   umbral → nombre → ritmo → preguntas → regalo → ruta
 *
 * Lo que cambió respecto a la versión anterior y por qué:
 *
 *  - Se abre con unas puertas que se separan en 3D y "BIENVENIDO A BAYONA".
 *  - Pide el NOMBRE y a partir de ahí el acompañante habla con él.
 *  - La persona ELIGE su ritmo: cinco preguntas si va con prisa, nueve si tiene
 *    tiempo. A más tiempo, regalo más grande. Es el intercambio, no un favor.
 *  - Las opciones llegan escalonadas, una detrás de otra, en vez de aparecer
 *    todas en un bloque cuadrado.
 *  - Desaparecen el PASE BAYONA, su código visual y el muro de texto legal: no
 *    ayudaban a decidir.
 *  - Desaparecen los bloques de "orientación, no atención sanitaria". El método
 *    sigue teniendo en cuenta la salud en el programa; no se anuncia en la UI.
 *  - El cierre son TRES puertas EN HORIZONTAL (ruta, recurso gratis, comunidad)
 *    y el botón principal lleva a la ficha del plan recomendado, no a WhatsApp.
 */

const EASE = [0.16, 1, 0.3, 1]
/*
  Dos líneas, no tres. Estaba en tres palabras y `.rx-title span { display:
  block }` pone cada palabra en su línea, así que la portada de la recepción
  leía «BIENVENIDO / A / BAYONA.» con una «A» sola en el medio: se veía como un
  error de maquetación. El `aria-label` del h1 sigue diciendo la frase completa,
  y el escalonado de entrada se conserva (ahora en dos tiempos).
*/
const HERO_WORDS = Object.freeze(['BIENVENIDO', 'A BAYONA.'])

/*
  Lo que las hojas dejan ver al abrirse (comentario 64).

  Se pide PRIMERO el hueco `onboarding.threshold` de `siteMedia`, que es el que
  decide qué imagen de la generación nueva va ahí; la terraza de la casa queda
  como respaldo explícito. Sin este orden, la recepción mostraba la escena vieja
  por muy registrada que estuviera la nueva: este `<img>` va por encima del
  fondo que monta `sceneBackgroundProps` en el paso de bienvenida, así que
  tapaba la imagen del hueco. Medido con `probe-imagenes-que-cargan.mjs`:
  «/onboarding: 1 img, 0 del banco nuevo».

  Lectura defensiva con `?.` porque `Onboarding.test.jsx` monta la recepción con
  un mock de `siteMedia` que no trae el registro de escenas; sin él la página
  entera reventaba en los tests.
*/
const escenaUmbral = siteMedia?.onboarding?.threshold?.src ?? bayonaScenes?.casa?.src ?? null

/** Paso en el que empieza la batería de preguntas. */
const FIRST_QUESTION = 3

const DEPTH_OPTIONS = Object.freeze([
  Object.freeze({ id: DEPTHS.express.id, mark: 'A' }),
  Object.freeze({ id: DEPTHS.completo.id, mark: 'B' }),
])

function stageOf(step, giftStep) {
  if (step === 0) return 'umbral'
  if (step === 1) return 'nombre'
  if (step === 2) return 'ritmo'
  if (step < giftStep) return 'preguntas'
  if (step === giftStep) return 'regalo'
  return 'ruta'
}

function ThresholdStage({ doorsOpen, onEnter, reducedMotion }) {
  return (
    <>
      {/*
        La casa detrás de las puertas.

        El dueño pidió para esta primera escena «una imagen cinematográfica de
        entrada/club/gimnasio/casa» y «que se sienta como entrar en un club, una
        casa, un gimnasio exclusivo» (comentario 64, y §20 del brief). La
        mecánica de las hojas que se separaba ya estaba, pero detrás no había
        nada: al abrir se veía negro sobre negro y la escena entera parecía
        vacía, que es justo la queja de «queda demasiado vacío y oscuro».

        Se pone la terraza de la casa (`bayonaScenes.casa`) debajo de las hojas
        (`.rx-doors` está a z-index 6), con un velo para que el titular siga
        teniendo contraste. No es una foto de adorno: es lo que las puertas
        revelan cuando se abren.
      */}
      <div className="rx-scene" aria-hidden="true">
        {escenaUmbral ? (
          <img
            src={escenaUmbral}
            alt=""
            loading="eager"
            decoding="async"
          />
        ) : null}
        <span className="rx-scene__veil" />
      </div>

      <div className="rx-doors" aria-hidden="true">
        <motion.div
          className="rx-doors__leaf rx-doors__leaf--left"
          initial={false}
          animate={reducedMotion
            ? { opacity: 0 }
            : { rotateY: doorsOpen ? -74 : 0, x: doorsOpen ? '-16%' : '0%', opacity: doorsOpen ? 0 : 1 }}
          transition={{ duration: reducedMotion ? 0 : 1.5, ease: EASE }}
        />
        <motion.div
          className="rx-doors__leaf rx-doors__leaf--right"
          initial={false}
          animate={reducedMotion
            ? { opacity: 0 }
            : { rotateY: doorsOpen ? 74 : 0, x: doorsOpen ? '16%' : '0%', opacity: doorsOpen ? 0 : 1 }}
          transition={{ duration: reducedMotion ? 0 : 1.5, ease: EASE }}
        />
        <motion.div
          className="rx-doors__light"
          initial={false}
          animate={{ scaleY: doorsOpen ? 1.4 : 1, opacity: doorsOpen ? 0.15 : 0.85 }}
          transition={{ duration: reducedMotion ? 0 : 1.1, ease: EASE }}
        />
      </div>

      <div className="rx-threshold">
        <p className="rx-eyebrow">BAYONA · INAUGURACIÓN</p>
        <h1 className="rx-title rx-title--hero" id="rx-threshold-title" aria-label="BIENVENIDO A BAYONA.">
          {HERO_WORDS.map((word, index) => (
            <Fragment key={word}>
              {index > 0 ? ' ' : null}
              <motion.span
                aria-hidden="true"
                initial={reducedMotion ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.72,
                  delay: reducedMotion ? 0 : 0.9 + index * 0.13,
                  ease: EASE,
                }}
              >
                {word}
              </motion.span>
            </Fragment>
          ))}
        </h1>
        <hr className="rx-rule" />
        <p className="rx-lead">
          Acabas de llegar y te estoy enseñando la casa. Vamos juntos, a tu ritmo.
        </p>
        <p className="rx-threshold__signature">Soy Sebastián. Yo te acompaño.</p>

        {/*
          §20 y comentario 64: la primera escena es buena pero estaba vacía. Una
          fachada no cuenta qué hay dentro. Este rail dice qué vas a ver si
          cruzas, sin numerar nada y sin pedir un dato.
        */}
        <ul className="rx-house" aria-label="Lo que vas a encontrar dentro de BAYONA">
          {HOUSE_STOPS.map((stop) => (
            <li key={stop.label}>
              <Link to={stop.to}>
                <strong>{stop.label}</strong>
                <small>{stop.detail}</small>
              </Link>
            </li>
          ))}
        </ul>

        <div className="rx-actions">
          <motion.button
            className="rx-button rx-button--primary"
            type="button"
            onClick={onEnter}
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 1.4, ease: EASE }}
          >
            EMPEZAR EL RECORRIDO
            <ArrowRight size={18} strokeWidth={1.25} aria-hidden="true" />
          </motion.button>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 1.6 }}
          >
            <Link className="rx-button rx-button--ghost" to="/programs">
              SOLO QUIERO MIRAR
              <ArrowUpRight size={17} strokeWidth={1.25} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  )
}

function OptionList({ children, reducedMotion }) {
  return (
    <motion.div
      variants={{
        show: { transition: { staggerChildren: reducedMotion ? 0 : 0.085, delayChildren: reducedMotion ? 0 : 0.14 } },
      }}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

function optionMotion(reducedMotion) {
  return reducedMotion
    ? { variants: { hidden: { opacity: 0 }, show: { opacity: 1 } } }
    : {
      variants: {
        hidden: { opacity: 0, y: 26 },
        show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: EASE } },
      },
    }
}

function QuestionStage({ question, index, total, selected, onAnswer, onBack, reducedMotion, headingRef }) {
  const item = optionMotion(reducedMotion)
  const grouped = question.groupedBy === 'zone'

  /*
    Agrupar por continente (comentario 66) sin romper el radiogroup: la zona es
    un rótulo dentro del mismo grupo, no un grupo nuevo de controles. Quien usa
    lector de pantalla sigue oyendo «pregunta + opciones», y quien mira ve por
    qué se le pregunta y qué cambia su respuesta.
  */
  let lastZone = null

  return (
    <div className="rx-question">
      <div className="rx-question__top">
        <button className="rx-back" type="button" onClick={onBack}>
          <ArrowLeft size={15} strokeWidth={1.25} aria-hidden="true" />
          ATRÁS
        </button>
        <span className="rx-question__count">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      <p className="rx-eyebrow">{question.eyebrow}</p>
      <h1 className="rx-title" id="rx-question-title" ref={headingRef} tabIndex="-1">
        {question.title}
      </h1>
      {question.lead ? <p className="rx-lead">{question.lead}</p> : null}

      <OptionList reducedMotion={reducedMotion}>
        <div className="rx-options" role="radiogroup" aria-label={question.title}>
          {question.options.map((option, optionIndex) => {
            const zone = grouped ? zoneById(option.zone) : null
            const showZone = Boolean(zone) && zone.id !== lastZone
            if (zone) lastZone = zone.id

            return (
              <Fragment key={option.value}>
                {showZone ? (
                  <motion.p {...item} className="rx-options__zone">
                    <span>{zone.label}</span>
                    <small>{zone.note}</small>
                  </motion.p>
                ) : null}
                <motion.button
                  {...item}
                  className="rx-option"
                  type="button"
                  role="radio"
                  aria-checked={selected === option.value}
                  onClick={() => onAnswer(question.key, option.value)}
                >
                  <span className="rx-option__index" aria-hidden="true">
                    {String(optionIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="rx-option__copy">
                    <strong>{option.label}</strong>
                    <small>{option.detail}</small>
                  </span>
                  <ArrowRight className="rx-option__go" size={18} strokeWidth={1.25} aria-hidden="true" />
                </motion.button>
              </Fragment>
            )
          })}
        </div>
      </OptionList>
    </div>
  )
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [depthId, setDepthId] = useState(DEPTHS.express.id)
  const [answers, setAnswers] = useState(createEmptyAnswers)
  const [language, setLanguage] = useState('es')
  const headingRef = useRef(null)
  const nameRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const { completeJourney, resetJourney } = useVisitorJourney()

  const questions = useMemo(() => questionsFor(depthId), [depthId])
  const giftStep = FIRST_QUESTION + questions.length
  const routeStep = giftStep + 1
  const stage = stageOf(step, giftStep)

  const region = answers.region || null
  const currencyCode = useMemo(
    () => regionById(region)?.currency ?? DEFAULT_CURRENCY,
    [region],
  )
  const format = useMemo(() => (valueEur) => formatMoney(valueEur, currencyCode), [currencyCode])
  const gift = useMemo(
    () => buildGift({ depth: depthId, region, format }),
    [depthId, region, format],
  )
  const route = useMemo(() => mapAnswersToRoute(answers), [answers])
  const cleanName = name.trim()

  /** Idioma elegido y su única consecuencia real: el enlace de traducción. */
  const activeLanguage = useMemo(
    () => languageByCode(language) ?? VISITOR_LANGUAGES[0],
    [language],
  )
  const translationHref = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return translatedUrl(activeLanguage.code, window.location.href)
  }, [activeLanguage.code])

  /** Progreso visible solo desde que empieza la conversación. */
  const progressTotal = routeStep - 1
  const progressNow = Math.max(0, Math.min(step, routeStep) - 1)

  const companion = useMemo(
    () => companionLine(stage, { name, route, gift }),
    [stage, name, route, gift],
  )

  /** El recorrido queda registrado en cuanto hay regalo delante. */
  useEffect(() => {
    if (step < giftStep || !route) return
    completeJourney({
      name,
      depth: depthId,
      region,
      answers,
      route,
      visitType: 'personalized',
    })
  }, [step, giftStep, route, name, depthId, region, answers, completeJourney])

  useLayoutEffect(() => {
    document.body.classList.add('onboarding-route', 'onboarding-immersive')

    return () => {
      document.body.classList.remove('onboarding-route', 'onboarding-immersive')
    }
  }, [])

  /** Las puertas se abren solas al llegar: nadie tiene que pulsar nada. */
  useEffect(() => {
    if (step !== 0 || reducedMotion) return undefined
    const timer = window.setTimeout(() => setDoorsOpen(true), 420)
    return () => window.clearTimeout(timer)
  }, [step, reducedMotion])

  useEffect(() => {
    if (step === 0) return undefined

    const frame = window.requestAnimationFrame(() => {
      if (step === 1) {
        nameRef.current?.focus({ preventScroll: true })
        return
      }
      headingRef.current?.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [step])

  const sceneMotion = reducedMotion
    ? {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.14 },
    }
    : {
      initial: { opacity: 0, y: 34, filter: 'blur(10px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      exit: { opacity: 0, y: direction * -22, filter: 'blur(6px)' },
      transition: { duration: 0.52, ease: EASE },
    }

  function goTo(nextStep) {
    setDirection(nextStep >= step ? 1 : -1)
    setNameError('')
    setStep(nextStep)
  }

  function enter() {
    setDoorsOpen(true)
    goTo(1)
  }

  function submitName(event) {
    event.preventDefault()
    const clean = name.trim()

    if (clean.length < 2) {
      setNameError('Escribe tu nombre y seguimos. Con dos letras me vale.')
      return
    }

    setName(clean)
    setNameError('')
    goTo(2)
  }

  function chooseDepth(id) {
    setDepthId(id)
    setAnswers(createEmptyAnswers())
    goTo(FIRST_QUESTION)
  }

  function answer(key, value) {
    setAnswers((current) => ({ ...current, [key]: value }))
    goTo(Math.min(step + 1, routeStep))
  }

  function back() {
    goTo(Math.max(step - 1, 0))
  }

  function eraseJourney() {
    resetJourney()
    setName('')
    setAnswers(createEmptyAnswers())
    setDepthId(DEPTHS.express.id)
    setDoorsOpen(false)
    goTo(0)
  }

  const currentQuestion = step >= FIRST_QUESTION && step < giftStep
    ? questions[step - FIRST_QUESTION]
    : null

  return (
    <div className="onboarding-page" data-stage={stage} data-depth={depthId}>
      <div
        className="rx-scene"
        aria-hidden="true"
        {...sceneBackgroundProps(siteMedia.onboarding.threshold, {
          className: 'rx-scene',
          pseudo: 'before',
        })}
      />
      <div className="rx-veil" aria-hidden="true" />

      {step > 0 && (
        <div
          className="rx-progress"
          role="progressbar"
          aria-label="Tu recorrido"
          aria-valuemin={1}
          aria-valuemax={progressTotal}
          aria-valuenow={Math.max(progressNow, 1)}
        >
          <span
            className="rx-progress__bar"
            style={{ width: `${(Math.max(progressNow, 1) / progressTotal) * 100}%` }}
          />
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {step === 0 && (
          <motion.section
            className="rx-stage"
            aria-labelledby="rx-threshold-title"
            key="umbral"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.4 }}
          >
            <ThresholdStage doorsOpen={doorsOpen} onEnter={enter} reducedMotion={reducedMotion} />
          </motion.section>
        )}

        {step === 1 && (
          <motion.section className="rx-stage" aria-labelledby="rx-name-title" key="nombre" {...sceneMotion}>
            <div className="rx-shell rx-shell--narrow">
              <p className="rx-eyebrow">ANTES DE EMPEZAR</p>
              <h1 className="rx-title" id="rx-name-title" ref={headingRef} tabIndex="-1">
                ¿CÓMO TE LLAMAS?
              </h1>
              <p className="rx-lead">
                Para hablarte por tu nombre durante todo el recorrido. Vamos juntos.
              </p>

              <form className="rx-name" id="rx-name-form" onSubmit={submitName} noValidate>
                <label htmlFor="rx-name-input">TU NOMBRE</label>
                <input
                  id="rx-name-input"
                  ref={nameRef}
                  type="text"
                  value={name}
                  autoComplete="given-name"
                  maxLength={40}
                  placeholder="Escríbelo aquí"
                  onChange={(event) => {
                    setName(event.target.value)
                    setNameError('')
                  }}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? 'rx-name-error' : undefined}
                />
                {nameError ? (
                  <p className="rx-error" id="rx-name-error" role="alert">
                    {nameError}
                  </p>
                ) : null}
              </form>

              {/*
                §20 pide nombre → idioma. No es un i18n inexistente: la casa
                está escrita en español y lo único real que puede ofrecer esta
                pantalla es el enlace de traducción de la página actual, la misma
                vía que ya usa `TranslateOffer`. Se dice, no se simula.
              */}
              <div className="rx-language" role="group" aria-label="Idioma en el que quieres leer la recepción">
                <p className="rx-language__label">¿EN QUÉ IDIOMA LA LEES MEJOR?</p>
                <div className="rx-language__options">
                  {VISITOR_LANGUAGES.map((entry) => (
                    <button
                      key={entry.code}
                      type="button"
                      className="rx-language__option"
                      aria-pressed={language === entry.code}
                      onClick={() => setLanguage(entry.code)}
                    >
                      {entry.label}
                    </button>
                  ))}
                </div>
                <p className="rx-language__note">
                  {activeLanguage.note}
                </p>
                {activeLanguage.translate ? (
                  <a
                    className="rx-language__go"
                    href={translationHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ABRIR LA RECEPCIÓN EN {activeLanguage.label.toUpperCase('es')}
                    <ArrowUpRight size={15} strokeWidth={1.25} aria-hidden="true" />
                  </a>
                ) : null}
              </div>

              <p className="rx-note">
                Solo vive en esta visita: al recargar o al cerrar, desaparece. Nada de cuentas ni de
                correos.
              </p>

              <div className="rx-actions">
                <button className="rx-button rx-button--primary" type="submit" form="rx-name-form">
                  SEGUIR
                  <ArrowRight size={18} strokeWidth={1.25} aria-hidden="true" />
                </button>
                <button className="rx-button rx-button--quiet" type="button" onClick={back}>
                  VOLVER
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {step === 2 && (
          <motion.section className="rx-stage" aria-labelledby="rx-depth-title" key="ritmo" {...sceneMotion}>
            <div className="rx-shell">
              <p className="rx-eyebrow">TU RITMO{name ? ` · ${name.toUpperCase()}` : ''}</p>
              <h1 className="rx-title" id="rx-depth-title" ref={headingRef} tabIndex="-1">
                ¿VAMOS RÁPIDO<br /><em>O NOS DAMOS TIEMPO?</em>
              </h1>
              <p className="rx-lead">
                Las dos opciones valen. Cuanto más me cuentas, más grande es lo que te llevas hoy.
              </p>

              <OptionList reducedMotion={reducedMotion}>
                <div className="rx-depth">
                  {DEPTH_OPTIONS.map(({ id, mark }) => {
                    const depth = depthById(id)

                    return (
                      <motion.button
                        {...optionMotion(reducedMotion)}
                        className="rx-depth__option"
                        type="button"
                        key={id}
                        onClick={() => chooseDepth(id)}
                      >
                        <span className="rx-depth__mark" aria-hidden="true">{mark}</span>
                        <span className="rx-depth__copy">
                          <strong>{depth.label}</strong>
                          <small>{depth.detail}</small>
                        </span>
                        <span className="rx-depth__value">
                          {depth.giftTier === 'completo' ? 'REGALO COMPLETO' : 'REGALO ESENCIAL'}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </OptionList>

              <button className="rx-back" type="button" onClick={back}>
                <ArrowLeft size={15} strokeWidth={1.25} aria-hidden="true" />
                CAMBIAR MI NOMBRE
              </button>
            </div>
          </motion.section>
        )}

        {currentQuestion && (
          <motion.section
            className="rx-stage"
            aria-labelledby="rx-question-title"
            key={`q-${currentQuestion.key}`}
            {...sceneMotion}
          >
            <div className="rx-shell">
              <QuestionStage
                question={currentQuestion}
                index={step - FIRST_QUESTION}
                total={questions.length}
                selected={answers[currentQuestion.key]}
                onAnswer={answer}
                onBack={back}
                reducedMotion={reducedMotion}
                headingRef={headingRef}
              />
            </div>
          </motion.section>
        )}

        {step === giftStep && (
          <motion.section className="rx-stage" aria-labelledby="rx-gift-title" key="regalo" {...sceneMotion}>
            <div className="rx-shell">
              <p className="rx-eyebrow">LO QUE TE LLEVAS HOY</p>
              <h1 className="rx-title" id="rx-gift-title" ref={headingRef} tabIndex="-1">
                ESTO YA ES TUYO{name ? `, ${name.toUpperCase()}` : ''}.
              </h1>
              <p className="rx-lead">
                {gift.items.length} piezas listas para empezar. Valor real{' '}
                <strong>{gift.totalDisplay}</strong>. Lo que pagas hoy: nada.
              </p>

              <div className="rx-gift">
                <ul className="rx-gift__list">
                  {gift.items.map((item) => (
                    <li className="rx-gift__item" key={item.id}>
                      <span className="rx-gift__body">
                        <strong>{item.name}</strong>
                        <small>{item.detail}</small>
                      </span>
                      <span className="rx-gift__value">{format(item.valueEur)}</span>
                    </li>
                  ))}
                </ul>

                <p className="rx-gift__total">
                  <span>TOTAL A PAGAR</span>
                  <output>{format(0)}</output>
                </p>

                {gift.tier === 'esencial' ? (
                  <p className="rx-gift__worth">
                    Este es el paquete esencial. El completo —con clase de parkour y reto de 30 días—
                    vale <s>{format(239)}</s> y se desbloquea eligiendo “tengo tiempo”.
                  </p>
                ) : null}
              </div>

              <div className="rx-actions">
                <button className="rx-button rx-button--primary" type="button" onClick={() => goTo(routeStep)}>
                  VER MI RUTA
                  <ArrowRight size={18} strokeWidth={1.25} aria-hidden="true" />
                </button>
                <button className="rx-button rx-button--quiet" type="button" onClick={back}>
                  AJUSTAR MIS RESPUESTAS
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {step === routeStep && (
          <motion.section className="rx-stage" aria-labelledby="rx-route-title" key="ruta" {...sceneMotion}>
            <div className="rx-shell rx-shell--wide">
              <p className="rx-eyebrow">YA DENTRO · ELIGES POR DÓNDE SEGUIR</p>
              <h1 className="rx-title" id="rx-route-title" ref={headingRef} tabIndex="-1">
                {name ? `${name.toUpperCase()}, EMPIEZA` : 'EMPIEZA'}<br />
                <em>POR DONDE QUIERAS.</em>
              </h1>
              <p className="rx-lead">
                Has llegado al final de la recepción, no al final de la casa. Con lo que me contaste,
                esta es la ruta más coherente; al lado, lo que no cuesta nada. No decides nada hoy:
                decides cuándo.
              </p>

              <div className="rx-offers">
                <motion.section
                  className="rx-offer rx-offer--lead"
                  aria-label="Tu ruta BAYONA"
                  initial={reducedMotion ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.1, ease: EASE }}
                >
                  <span className="rx-offer__tag">TU RUTA</span>
                  <h2 className="rx-offer__title">{route?.plan ?? 'POR DEFINIR'}</h2>
                  <p className="rx-offer__copy">{route?.note}</p>
                  <Link className="rx-offer__cta" to={route?.planHref ?? '/programs'}>
                    EMPEZAR CON {route?.plan ?? 'BAYONA'}
                    <ArrowUpRight size={16} strokeWidth={1.25} aria-hidden="true" />
                  </Link>
                </motion.section>

                <motion.section
                  className="rx-offer"
                  aria-label="Gratis desde hoy"
                  initial={reducedMotion ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.22, ease: EASE }}
                >
                  <span className="rx-offer__tag">GRATIS DESDE HOY</span>
                  <h2 className="rx-offer__title">{route?.resource}</h2>
                  <p className="rx-offer__copy">{route?.resourceNote}</p>
                  <Link className="rx-offer__cta" to={route?.resourceHref ?? '/resources'}>
                    VER RECURSOS
                    <ArrowUpRight size={16} strokeWidth={1.25} aria-hidden="true" />
                  </Link>
                </motion.section>

                <motion.section
                  className="rx-offer"
                  aria-label="Gratis siempre"
                  initial={reducedMotion ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.34, ease: EASE }}
                >
                  <span className="rx-offer__tag">GRATIS SIEMPRE</span>
                  <h2 className="rx-offer__title">{route?.community}</h2>
                  <p className="rx-offer__copy">{route?.communityNote}</p>
                  <Link className="rx-offer__cta" to={route?.communityHref ?? '/community'}>
                    ENTRAR AL GRUPO
                    <ArrowUpRight size={16} strokeWidth={1.25} aria-hidden="true" />
                  </Link>
                </motion.section>
              </div>

              {/*
                La bifurcación no se queda en tres puertas: §20 y comentario 70
                piden que el final conecte con ruta, protocolo, comunidad,
                PROGRAMAS y TIENDA. Van fuera de `.rx-offers` para que las tres
                tarjetas principales sigan siendo el protagonista.
              */}
              <div className="rx-more">
                <p className="rx-more__label">Y CUANDO QUIERAS, ESTO TAMBIÉN ESTÁ ABIERTO</p>
                <div className="rx-more__links">
                  <Link to="/programs">
                    COMPARAR LOS CUATRO PLANES
                    <ArrowUpRight size={15} strokeWidth={1.25} aria-hidden="true" />
                  </Link>
                  <Link to="/shop">
                    SESIÓN O SERVICIO SUELTO
                    <ArrowUpRight size={15} strokeWidth={1.25} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/*
                Presentación del asistente, paso 6 del orden de §20. Va al final
                del todo: en la primera pantalla todavía no hay nada que
                acompañar. Aquí ya sabe cómo se llama y qué eligió.
              */}
              <section className="rx-assistant" aria-labelledby="rx-assistant-title">
                <p className="rx-assistant__kicker">TU COMPAÑÍA EN ESTE RECORRIDO</p>
                <h2 id="rx-assistant-title">
                  {name ? `${name.toUpperCase()}, NO TE QUEDAS SOLA` : 'NO TE QUEDAS SOLA'}<br />
                  <em>EL ASISTENTE SE QUEDA CONTIGO.</em>
                </h2>
                <ul className="rx-assistant__list">
                  <li>Te recuerda dónde estabas y qué toca después.</li>
                  <li>Habla Sebastián, en primera persona, y responde con lo que él ha publicado.</li>
                  <li>Si algo no lo sabe, lo dice en vez de inventarlo: eso se cierra por WhatsApp.</li>
                  <li>Puede avisarte de lo que llevas encontrado y aún no has reclamado.</li>
                </ul>
                <div className="rx-assistant__actions">
                  <a
                    className="rx-assistant__wa"
                    href={whatsAppLink(`Hola BAYONA${cleanName ? `, soy ${cleanName}` : ''}. Vengo de la recepción y quiero confirmar mi ruta.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppMark size={16} />
                    HABLAR POR WHATSAPP
                  </a>
                  <Link className="rx-assistant__site" to="/resources">
                    ABRIR MIS RECURSOS GRATIS
                    <ArrowUpRight size={15} strokeWidth={1.25} aria-hidden="true" />
                  </Link>
                </div>
                <p className="rx-assistant__note">
                  El asistente de la web responde con lo publicado y no guarda nada entre visitas.
                  WhatsApp es otra cosa: una persona.
                </p>
              </section>

              <div className="rx-foot">
                <Link className="rx-save-route" to="/entrar">
                  <span>CIERRA EL RECORRIDO</span>
                  <strong>GUARDAR MI RUTA EN BAYONA OS</strong>
                  <ArrowUpRight size={17} strokeWidth={1.25} aria-hidden="true" />
                </Link>
                <Link className="rx-button rx-button--ghost" to="/programs">
                  COMPARAR TODOS LOS PLANES
                  <ArrowUpRight size={17} strokeWidth={1.25} aria-hidden="true" />
                </Link>
                <button className="rx-button rx-button--quiet" type="button" onClick={eraseJourney}>
                  BORRAR MI RECORRIDO
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <CompanionDron text={companion} name={name} label="Asistente BAYONA" />
    </div>
  )
}
