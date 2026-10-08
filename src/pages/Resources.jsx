import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  FileCheck2,
  FileText,
  KeyRound,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Trophy,
  UploadCloud,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildWhatsAppUrl } from '../config/offerings.js'
import { RESOURCE_QUESTION_TOPICS } from '../lib/forms/privacy.js'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import LeadMagnet from '../components/leads/LeadMagnet.jsx'
import ProtocoloCheckIn from '../components/checkin/ProtocoloCheckIn.jsx'
import VideoSection from '../components/VideoSection.jsx'
import { siteMedia } from '../config/siteMedia.js'
import '../styles/resources.css'

const BRAND_TAGLINE = 'BAYONA · ENTRENA CON DIRECCIÓN · MUÉVETE CON PROPÓSITO'
const RESOURCES_EASE = [0.16, 1, 0.3, 1]

const HERO_CONTAINER_VARIANTS = Object.freeze({
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.08,
    },
  },
})

const HERO_ITEM_VARIANTS = Object.freeze({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: RESOURCES_EASE },
  },
})

const CHALLENGE_MANUAL = Object.freeze([
  Object.freeze({
    title: 'RECIBES EL CUADERNO DE RUTA',
    copy: 'Antes de empezar tienes rutina, guía general, privacidad de evidencias y condiciones de la edición.',
  }),
  Object.freeze({
    title: 'ENTRENAS SOLO, PERO NO A CIEGAS',
    copy: 'Cada día tiene una acción concreta: entrenar, recuperar, comer mejor o revisar cómo respondió tu cuerpo.',
  }),
  Object.freeze({
    title: 'MANDAS EVIDENCIA CON CONTROL',
    copy: 'Puedes enviar vídeo, foto o check-in según reglas. No se publica nada sin consentimiento expreso.',
  }),
  Object.freeze({
    title: 'SUBES POR BLOQUES',
    copy: 'Cada tramo completado desbloquea el siguiente. El reto se siente como progreso, no como caos.',
  }),
  Object.freeze({
    title: 'LLEGAS CON MATERIAL REAL',
    copy: 'Si completas condiciones, accedes al premio vigente y a una lectura más clara de tu punto de partida.',
  }),
])

const CHALLENGE_CONDITIONS = Object.freeze([
  'Completar cada día la sesión o actividad de recuperación indicada para el bloque activo.',
  'Al finalizar, enviar un video corto indicando cómo te sentiste y qué día del reto completas. Se usa para verificar tu participación y no se publica ni comparte sin tu consentimiento expreso, específico y revocable.',
  'Compartir al menos 1 foto de una comida preparada con la guía nutricional del reto. Tampoco se publica sin consentimiento expreso.',
  'Si no completas un día, reinicias el bloque según las reglas comunicadas antes de entrar.',
])

const CHALLENGE_RECEIVES = Object.freeze([
  'Workbook de 30 días con rutina o actividad diaria y alternativas por nivel.',
  'Guía nutricional general para acompañar el reto, distinta de los planes de pago.',
  'Reglas, tratamiento de evidencias, check-ins y premio vigente por escrito antes de empezar.',
])

/**
 * Lo que la persona puede enviar durante el reto, dicho con las cuatro cosas
 * concretas que pidió el dueño: sesiones, fotos, comidas o dudas. Antes solo
 * aparecían el vídeo y la comida dentro de las condiciones, en texto corrido, y
 * nadie sabía que una duda también era material válido del taller.
 */
const CHALLENGE_EVIDENCE = Object.freeze([
  Object.freeze({ kind: 'SESIÓN', detail: 'Un vídeo corto o un parte de la sesión del día.' }),
  Object.freeze({ kind: 'FOTO', detail: 'El entrenamiento, el material o el lugar donde lo hiciste.' }),
  Object.freeze({ kind: 'COMIDA', detail: 'Un plato preparado con la guía nutricional del reto.' }),
  Object.freeze({ kind: 'DUDA', detail: 'Lo que no entiendes de tu cuerpo, tu técnica o tu semana.' }),
])

/**
 * La recompensa sin promesa vacía: se nombra lo que puede ser (un programa
 * personalizado construido con tus datos del reto) y se deja claro que solo
 * aplica el premio que BAYONA confirme por escrito antes de entrar.
 */
const CHALLENGE_PRIZE = Object.freeze({
  heading: 'EL PREMIO PUEDE SER UN PLAN PERSONALIZADO.',
  copy: 'Si completas las condiciones de tu edición, el premio vigente puede ser un plan BAYONA construido con lo que el propio reto reveló de ti: tu fuerza real, tu recuperación y tus hábitos. No se entrega una plantilla genérica ni se improvisa al final.',
  guard: 'El premio se comunica por escrito antes de entrar. Si tu edición tiene otro premio vigente, aplica ese y solo ese.',
})

const CHALLENGE_LEVELS = Object.freeze([
  Object.freeze({ label: 'NIVEL 1', days: 'DÍAS 01—07', state: 'ARRANQUE' }),
  Object.freeze({ label: 'NIVEL 2', days: 'DÍAS 08—14', state: 'RITMO' }),
  Object.freeze({ label: 'NIVEL 3', days: 'DÍAS 15—21', state: 'CONSTANCIA' }),
  Object.freeze({ label: 'NIVEL 4', days: 'DÍAS 22—28', state: 'CONTINUIDAD' }),
  Object.freeze({ label: 'META', days: 'DÍAS 29—30', state: 'PREMIO VIGENTE', prize: true }),
])

const challengeWhatsAppUrl = buildWhatsAppUrl(
  'Hola BAYONA, quiero conocer las reglas, el uso de las evidencias y el premio vigente del Reto 30 Días antes de decidir si entro.',
)

const MAGAZINE_PUBLICATIONS = Object.freeze([
  Object.freeze({
    id: 'protocolo-bayona-7-dias',
    number: '01',
    topic: 'ENTRENAMIENTO',
    kicker: 'REGALO DESTACADO',
    title: 'El Protocolo BAYONA de 7 días',
    type: 'GUÍA / PDF',
    kind: 'pdf',
    readTime: '7 DÍAS',
    summary: 'Una semana para dejar de improvisar y comprobar que todavía puedes construir dirección.',
    body: Object.freeze([
      'Siete días para observar tu punto de partida, recuperar ritmo y descubrir qué puedes sostener en tu vida real.',
      'La guía une movimiento, nutrición esencial y recuperación en pasos simples: no busca impresionarte, busca hacerte actuar.',
    ]),
    takeaways: Object.freeze([
      'Una acción concreta para cada día.',
      'Una forma simple de observar energía, técnica y recuperación.',
      'Una revisión final para decidir si quieres más acompañamiento.',
    ]),
  }),
  Object.freeze({
    id: 'estructurar-tu-semana',
    number: '02',
    topic: 'ENTRENAMIENTO',
    kicker: 'ARTÍCULO',
    title: 'Cómo estructurar tu semana para no abandonarla',
    type: 'ARTÍCULO',
    kind: 'article',
    readTime: '5 MIN',
    summary: 'Una semana que cumples vale más que un plan perfecto que abandonas.',
    body: Object.freeze([
      'Una semana sostenible no empieza llenando todos los huecos. Empieza eligiendo las sesiones que caben de verdad y protegiendo también la recuperación.',
      'Define tres anclas: cuándo entrenas, qué objetivo tiene cada sesión y qué harás si el día se complica. Tener una versión mínima evita que un cambio de horario destruya todo el plan.',
      'Al final de la semana revisa qué cumpliste, cómo respondió tu cuerpo y qué debes ajustar. Progresar no siempre significa añadir más; muchas veces significa repetir mejor.',
    ]),
    takeaways: Object.freeze([
      'Elige pocas sesiones que sí puedas sostener.',
      'Alterna estímulo y recuperación.',
      'Revisa antes de añadir volumen.',
    ]),
  }),
  Object.freeze({
    id: 'nutricion-sin-extremos',
    number: '03',
    topic: 'NUTRICIÓN',
    kicker: 'ARTÍCULO',
    title: 'Nutrición que sí se puede vivir',
    type: 'ARTÍCULO',
    kind: 'article',
    readTime: '4 MIN',
    summary: 'Comer para tu objetivo sin convertir cada plato en una batalla mental.',
    body: Object.freeze([
      'No necesitas una dieta perfecta para comer con más dirección. Necesitas decisiones simples que puedas repetir incluso cuando tienes poco tiempo.',
      'Construye tus comidas alrededor de alimentos que reconoces, una fuente de proteína, vegetales o fruta, una fuente de energía y agua. Después ajusta cantidades según tu contexto y objetivo.',
      'La nutrición útil no te aísla ni te castiga. Si tienes una condición de salud o necesidades específicas, busca orientación profesional individualizada.',
    ]),
    takeaways: Object.freeze([
      'Prioriza una estructura simple y repetible.',
      'Evita clasificar cada comida como premio o castigo.',
      'Ajusta desde tu realidad, no desde una tendencia.',
    ]),
  }),
  Object.freeze({
    id: 'cuidarte-sin-castigo',
    number: '04',
    topic: 'MENTALIDAD',
    kicker: 'ARTÍCULO',
    title: 'Dejar de castigarte y empezar a cuidarte',
    type: 'ARTÍCULO',
    kind: 'article',
    readTime: '5 MIN',
    summary: 'La constancia cambia cuando dejas de entrenar desde la culpa.',
    body: Object.freeze([
      'Castigarte puede producir una semana intensa, pero rara vez construye una relación sostenible con tu cuerpo. Cuidarte es elegir acciones que puedas repetir sin necesitar odiarte primero.',
      'Cambia la pregunta “¿cómo compenso lo que hice?” por “¿qué necesita mi cuerpo hoy para seguir avanzando?”. Esa diferencia convierte el movimiento en una práctica, no en una deuda.',
      'La constancia no exige hacerlo todo. Exige volver con honestidad, aprender del día que no salió y reducir el siguiente paso hasta que vuelva a ser posible.',
    ]),
    takeaways: Object.freeze([
      'Entrena para construir, no para pagar una culpa.',
      'Reduce el paso antes de abandonar el camino.',
      'Mide continuidad, no perfección.',
    ]),
  }),
])

const MAGAZINE_SECTIONS = Object.freeze(
  ['ENTRENAMIENTO', 'NUTRICIÓN', 'MENTALIDAD'].map((topic) => Object.freeze({
    topic,
    publications: Object.freeze(MAGAZINE_PUBLICATIONS.filter((publication) => publication.topic === topic)),
  })),
)

const FRESH_PUBLICATION_MEDIA = Object.freeze({
  'estructurar-tu-semana': siteMedia.resources.fresh[0],
  'nutricion-sin-extremos': siteMedia.resources.fresh[2],
  'cuidarte-sin-castigo': siteMedia.resources.fresh[1],
})

const PUBLICATION_PRESENTATIONS = Object.freeze({
  'protocolo-bayona-7-dias': Object.freeze({ tone: 'protocol', cue: 'START / 07' }),
  'estructurar-tu-semana': Object.freeze({ tone: 'cadence', cue: 'RITMO / 7D' }),
  'nutricion-sin-extremos': Object.freeze({ tone: 'balance', cue: 'BASE / REAL' }),
  'cuidarte-sin-castigo': Object.freeze({ tone: 'reset', cue: 'RESET / MENTE' }),
})

const RESOURCE_TOPIC_MEDIA = siteMedia.resources.topics

// The current editorial design has three topic shelves rather than the conceptual 12-card map.
// Keep every registered topic on a real authored panel below; no synthetic copy or duplicate cards.
const EDITORIAL_TOPIC_MEDIA = Object.freeze({
  rest: RESOURCE_TOPIC_MEDIA[3],
  rules: RESOURCE_TOPIC_MEDIA[4],
  prize: RESOURCE_TOPIC_MEDIA[5],
  conversation: RESOURCE_TOPIC_MEDIA[6],
  reflection: RESOURCE_TOPIC_MEDIA[7],
  health: RESOURCE_TOPIC_MEDIA[8],
  magazine: RESOURCE_TOPIC_MEDIA[11],
})

function validateQuestionForm(values) {
  const errors = {}
  const whatsappDigits = values.whatsapp.replace(/\D/g, '')

  if (values.name.trim().length < 2) errors.name = 'Escribe tu nombre.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Escribe un email válido.'
  if (whatsappDigits.length < 7 || whatsappDigits.length > 15) errors.whatsapp = 'Escribe un número de WhatsApp válido.'
  if (!values.category) errors.category = 'Selecciona una categoría.'
  if (values.message.trim().length < 10 || values.message.trim().length > 500) {
    errors.message = 'El mensaje debe tener entre 10 y 500 caracteres.'
  }
  if (!values.consent) errors.consent = 'Confirma que quieres preparar la consulta para WhatsApp.'

  return errors
}

function useFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setHasFinePointer(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  return hasFinePointer
}

function useResourcesReveal() {
  useEffect(() => {
    const elements = [...document.querySelectorAll('.resources-page .resources-reveal')]
    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' })

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}

/** Misma convención que Layout.jsx: un Link del router animable por Motion. */
const MotionLink = motion.create(Link)

function MagneticLink({ children, className = '', enabled = false, style, ...props }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  function resetPosition() {
    animate(x, 0, { duration: 0.45, ease: RESOURCES_EASE })
    animate(y, 0, { duration: 0.45, ease: RESOURCES_EASE })
  }

  function handlePointerMove(event) {
    if (!enabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 12
    const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 10
    x.set(Math.max(-7, Math.min(7, offsetX)))
    y.set(Math.max(-6, Math.min(6, offsetY)))
  }

  /**
   * Con `to` navega por el router; con `href` sale fuera o a un ancla.
   *
   * Los dos botones de decisión de esta página apuntaban a /programs y a
   * /community con `href`, es decir con un <a> plano: cada clic recargaba la
   * web entera (fondo en blanco, assets otra vez, scroll perdido). Y ocurría en
   * el peor sitio posible, el final de la página de recursos gratuitos, que es
   * justo donde alguien decide dar el siguiente paso.
   */
  const Component = props.to ? MotionLink : motion.a

  return (
    <Component
      className={className}
      data-magnetic="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      style={{ ...style, x, y }}
      {...props}
    >
      {children}
    </Component>
  )
}

function ExternalWhatsAppLink({ href, children, className = '', magnetic = false }) {
  return (
    <MagneticLink
      className={className}
      enabled={magnetic}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </MagneticLink>
  )
}

function PublicationReader({ closeRef, interactiveEffects, onClose, publication, reducedMotion }) {
  if (!publication) return null

  return (
    <motion.div
      className="resources-reader-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.28, ease: RESOURCES_EASE }}
    >
      <motion.article
        className="resources-reader"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`reader-title-${publication.id}`}
        initial={reducedMotion ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.48, ease: RESOURCES_EASE }}
      >
        <header className="resources-reader-header" data-immersive="clip">
          <div className="resources-reader-meta">
            <span>{publication.topic}</span>
            <span>{publication.type}</span>
            <span>{publication.readTime}</span>
          </div>
          <button
            ref={closeRef}
            className="resources-reader-close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar publicación y volver a la revista"
          >
            <X aria-hidden="true" size={20} strokeWidth={1.2} />
          </button>
          <p className="resources-eyebrow">BAYONA · REVISTA GRATIS</p>
          <h2 id={`reader-title-${publication.id}`}>{publication.title}</h2>
          <p>{publication.summary}</p>
        </header>

        {publication.kind === 'video' && publication.embedUrl ? (
          <div className="resources-reader-video">
            <iframe
              src={publication.embedUrl}
              title={publication.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="resources-reader-body">
            <div className="resources-reader-copy">
              {publication.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <aside aria-label="Ideas principales">
              <span>PARA LLEVARTE</span>
              <ul>
                {publication.takeaways.map((takeaway) => (
                  <li key={takeaway}>
                    <ArrowRight aria-hidden="true" size={16} strokeWidth={1.2} />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}

        <footer className="resources-reader-footer">
          {publication.kind === 'pdf' ? (
            <>
              <p>La guía gratuita se desbloquea al dejar tu nombre y un contacto. Sin cuenta y sin compra.</p>
              <button
                type="button"
                className="resources-action resources-action--primary"
                onClick={() => {
                  onClose()
                  window.requestAnimationFrame(() => {
                    document.getElementById('resources-lead')?.scrollIntoView({
                      behavior: reducedMotion ? 'auto' : 'smooth',
                      block: 'start',
                    })
                  })
                }}
              >
                RECIBIR GRATIS <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.2} />
              </button>
            </>
          ) : (
            <button className="resources-reader-return" type="button" onClick={onClose}>
              VOLVER A LA REVISTA <ArrowDown aria-hidden="true" size={16} strokeWidth={1.2} />
            </button>
          )}
        </footer>
      </motion.article>
    </motion.div>
  )
}

function BrandMarquee() {
  return (
    <div className="resources-marquee" role="region" aria-label={BRAND_TAGLINE}>
      <span className="resources-visually-hidden">{BRAND_TAGLINE}</span>
      <div className="resources-marquee-track" aria-hidden="true">
        {[0, 1].map((group) => (
          <div className="resources-marquee-group" key={group}>
            {[0, 1, 2, 3].map((item) => (
              <span className="resources-marquee-item" key={item}>{BRAND_TAGLINE}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Resources() {
  const reducedMotion = useReducedMotion()
  const hasFinePointer = useFinePointer()
  const interactiveEffects = hasFinePointer && !reducedMotion
  const [activePublicationId, setActivePublicationId] = useState(null)
  const [questionForm, setQuestionForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    category: '',
    message: '',
    consent: false,
  })
  const [questionFile, setQuestionFile] = useState(null)
  const [questionErrors, setQuestionErrors] = useState({})
  const [preparedQuestionUrl, setPreparedQuestionUrl] = useState('')
  const [isFileDragging, setIsFileDragging] = useState(false)
  const [isPreparingQuestion, setIsPreparingQuestion] = useState(false)
  const preparationTimerRef = useRef(null)
  const challengeRef = useRef(null)
  const readerCloseRef = useRef(null)
  const readerTriggerRef = useRef(null)
  const heroX = useMotionValue(0)
  const heroY = useMotionValue(0)
  const heroRotateX = useMotionValue(0)
  const heroRotateY = useMotionValue(0)

  const { scrollYProgress: challengeScrollProgress } = useScroll({
    target: challengeRef,
    offset: ['start 86%', 'end 22%'],
  })
  const challengeProgress = useTransform(challengeScrollProgress, [0.06, 0.92], [0, 1])
  const activePublication = useMemo(
    () => MAGAZINE_PUBLICATIONS.find(({ id }) => id === activePublicationId) ?? null,
    [activePublicationId],
  )
  const questionErrorMessages = Object.values(questionErrors)

  useResourcesReveal()

  useEffect(() => () => {
    if (preparationTimerRef.current !== null) clearTimeout(preparationTimerRef.current)
  }, [])

  useEffect(() => {
    if (!activePublication) return undefined

    const previousOverflow = document.body.style.overflow
    const focusFrame = window.requestAnimationFrame(() => readerCloseRef.current?.focus())
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActivePublicationId(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      window.requestAnimationFrame(() => readerTriggerRef.current?.focus())
    }
  }, [activePublication])

  function clearPreparationTimer() {
    if (preparationTimerRef.current === null) return
    clearTimeout(preparationTimerRef.current)
    preparationTimerRef.current = null
  }

  function resetPreparedQuestion() {
    clearPreparationTimer()
    setQuestionErrors({})
    setPreparedQuestionUrl('')
    setIsPreparingQuestion(false)
  }

  function handleQuestionFieldChange(event) {
    const { checked, name, type, value } = event.target
    setQuestionForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    resetPreparedQuestion()
  }

  function selectQuestionFile(file) {
    setQuestionFile(file ?? null)
    resetPreparedQuestion()
  }

  function handleQuestionFileChange(event) {
    selectQuestionFile(event.target.files?.[0] ?? null)
  }

  function handleQuestionDragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setIsFileDragging(true)
  }

  function handleQuestionDragLeave(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return
    setIsFileDragging(false)
  }

  function handleQuestionDrop(event) {
    event.preventDefault()
    setIsFileDragging(false)
    selectQuestionFile(event.dataTransfer.files?.[0] ?? null)
  }

  function prepareQuestion(event) {
    event.preventDefault()
    clearPreparationTimer()
    const validationErrors = validateQuestionForm(questionForm)

    if (Object.keys(validationErrors).length > 0) {
      setQuestionErrors(validationErrors)
      setPreparedQuestionUrl('')
      setIsPreparingQuestion(false)
      return
    }

    const categoryLabel = RESOURCE_QUESTION_TOPICS.find(({ value }) => value === questionForm.category)?.label
      ?? questionForm.category
    const safeFileName = questionFile?.name.replace(/[\r\n]+/g, ' ') ?? 'Sin archivo seleccionado'
    const message = [
      'Hola BAYONA, quiero hacer una pregunta sobre los recursos gratuitos.',
      `Nombre: ${questionForm.name.trim()}`,
      `Email: ${questionForm.email.trim()}`,
      `WhatsApp: ${questionForm.whatsapp.trim()}`,
      `Categoría: ${categoryLabel}`,
      `Mensaje: ${questionForm.message.trim()}`,
      `Archivo: ${safeFileName}`,
      questionFile ? 'Adjuntaré el archivo manualmente al abrir esta conversación.' : '',
    ].filter(Boolean).join('\n')
    const nextQuestionUrl = buildWhatsAppUrl(message)

    setQuestionErrors({})
    setPreparedQuestionUrl('')

    if (reducedMotion) {
      setIsPreparingQuestion(false)
      setPreparedQuestionUrl(nextQuestionUrl)
      return
    }

    setIsPreparingQuestion(true)
    preparationTimerRef.current = setTimeout(() => {
      setPreparedQuestionUrl(nextQuestionUrl)
      setIsPreparingQuestion(false)
      preparationTimerRef.current = null
    }, 620)
  }

  function handleHeroPointerMove(event) {
    if (!interactiveEffects) return
    const rect = event.currentTarget.getBoundingClientRect()
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5
    heroX.set(normalizedX * 10)
    heroY.set(normalizedY * 8)
    heroRotateX.set(normalizedY * -2.5)
    heroRotateY.set(normalizedX * 3)
  }

  function resetHeroParallax() {
    animate(heroX, 0, { duration: 0.6, ease: RESOURCES_EASE })
    animate(heroY, 0, { duration: 0.6, ease: RESOURCES_EASE })
    animate(heroRotateX, 0, { duration: 0.6, ease: RESOURCES_EASE })
    animate(heroRotateY, 0, { duration: 0.6, ease: RESOURCES_EASE })
  }

  function handleSpotlightMove(event) {
    if (!interactiveEffects || !(event.target instanceof Element)) return
    const card = event.target.closest('.resources-spotlight')
    if (!card || !event.currentTarget.contains(card)) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`)
    card.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`)
  }

  function openPublication(publicationId, trigger) {
    readerTriggerRef.current = trigger
    setActivePublicationId(publicationId)
  }

  return (
    <div className="resources-page" onPointerMove={handleSpotlightMove}>
      <section
        className="resources-hero"
        aria-labelledby="resources-title"
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={resetHeroParallax}
      >
        <div className="resources-hero-grid" aria-hidden="true" />
        <div className="resources-shell resources-hero-layout">
          <motion.div
            className="resources-hero-copy"
            variants={HERO_CONTAINER_VARIANTS}
            initial={reducedMotion ? false : 'hidden'}
            animate="visible"
          >
            <motion.p className="resources-eyebrow" variants={HERO_ITEM_VARIANTS}>
              BAYONA · BIBLIOTECA PREMIUM
            </motion.p>
            <motion.h1 id="resources-title" variants={HERO_ITEM_VARIANTS}>
              <span>RECURSOS QUE</span>
              <span>PARECEN DE PAGO.</span>
            </motion.h1>
            <motion.p className="resources-hero-intro" variants={HERO_ITEM_VARIANTS}>
              Dossiers, revista, protocolo y consulta para empezar con dirección. Gratuito no significa básico: significa que puedes probar el método antes de comprar.
            </motion.p>

            <motion.div
              className="resources-secret-key resources-spotlight"
              variants={HERO_ITEM_VARIANTS}
            >
              <KeyRound aria-hidden="true" size={28} strokeWidth={1.1} />
              <div>
                <span>DOSSIER DE ENTRADA</span>
                <p><strong>PROTOCOLO, RETO Y CONSULTA EN UN MISMO PASE.</strong> Reclama valor real, revisa condiciones y guarda lo útil en tu cuenta.</p>
              </div>
            </motion.div>

            <motion.ul className="resources-hero-library" variants={HERO_ITEM_VARIANTS} aria-label="Piezas incluidas en la biblioteca BAYONA">
              <li data-presentation="protocol">
                <a className="resources-hero-library-card" href="#revista" aria-label="Ver presentación del Protocolo BAYONA de 7 días">
                  <span className="resources-hero-library-visual resources-hero-library-visual--protocol" aria-hidden="true">
                    <FileCheck2 size={20} strokeWidth={1.25} />
                    <b>07</b>
                    <i />
                  </span>
                  <span className="resources-hero-library-copy">
                    <span>01</span>
                    <strong>Protocolo 7 días</strong>
                    <small>Acción inmediata</small>
                  </span>
                  <ArrowUpRight className="resources-hero-library-arrow" aria-hidden="true" size={16} strokeWidth={1.2} />
                </a>
              </li>
              <li data-presentation="workbook">
                <a className="resources-hero-library-card" href="#reto" aria-label="Ver presentación del Workbook BAYONA de 30 días">
                  <span className="resources-hero-library-visual resources-hero-library-visual--workbook" aria-hidden="true">
                    <FileText size={20} strokeWidth={1.25} />
                    <b>30</b>
                    <i />
                  </span>
                  <span className="resources-hero-library-copy">
                    <span>02</span>
                    <strong>Workbook 30 días</strong>
                    <small>Ruta con pruebas</small>
                  </span>
                  <ArrowUpRight className="resources-hero-library-arrow" aria-hidden="true" size={16} strokeWidth={1.2} />
                </a>
              </li>
              <li data-presentation="consultation">
                <a className="resources-hero-library-card" href="#question-title" aria-label="Ver presentación de la consulta experta gratuita">
                  <span className="resources-hero-library-visual resources-hero-library-visual--consultation" aria-hidden="true">
                    <MessageCircle size={20} strokeWidth={1.25} />
                    <b>1:1</b>
                    <i />
                  </span>
                  <span className="resources-hero-library-copy">
                    <span>03</span>
                    <strong>Consulta experta</strong>
                    <small>WhatsApp con contexto</small>
                  </span>
                  <ArrowUpRight className="resources-hero-library-arrow" aria-hidden="true" size={16} strokeWidth={1.2} />
                </a>
              </li>
            </motion.ul>

            <motion.div className="resources-hero-actions" variants={HERO_ITEM_VARIANTS}>
              <MagneticLink
                className="resources-action resources-action--primary"
                enabled={interactiveEffects}
                href="#reto"
              >
                VER DOSSIER 30 DÍAS <ArrowDown aria-hidden="true" size={17} strokeWidth={1.2} />
              </MagneticLink>
              <MagneticLink
                className="resources-action resources-action--ghost"
                enabled={interactiveEffects}
                href="#revista"
              >
                ABRIR BIBLIOTECA <ArrowDown aria-hidden="true" size={17} strokeWidth={1.2} />
              </MagneticLink>
            </motion.div>
          </motion.div>

          <motion.aside
            {...sceneBackgroundProps(siteMedia.resources.hero, {
              className: 'resources-hero-cover',
              style: interactiveEffects ? {
                x: heroX,
                y: heroY,
                rotateX: heroRotateX,
                rotateY: heroRotateY,
              } : undefined,
              variant: 'hero',
            })}
            aria-label="Portada de BAYONA Revista Gratis"
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.18, ease: RESOURCES_EASE }}
          >
            <div className="resources-cover-topline">
              <span>EDICIÓN 01</span>
              <span>PREMIUM</span>
            </div>
            <p>BAYONA</p>
            <div className="resources-cover-symbol" aria-hidden="true">
              <span />
              <BookOpen size={46} strokeWidth={0.8} />
            </div>
            <div className="resources-cover-story">
              <span>LA HISTORIA DE PORTADA</span>
              <strong>30 DÍAS.<br />TU INTENCIÓN<br />EN MOVIMIENTO.</strong>
              <small>DOSSIER · WORKBOOK · PREMIO</small>
            </div>
          </motion.aside>
        </div>
      </section>

      <div className="resources-content">
        <section
          {...sceneBackgroundProps(siteMedia.resources.challenge, {
            className: 'resources-section resources-game',
            variant: 'accent',
            pseudo: 'after',
            motion: true,
          })}
          ref={challengeRef}
          id="reto"
          data-section-number="01"
          aria-labelledby="challenge-title"
        >
          <div className="resources-shell" data-immersive="clip">
            <header className="resources-section-header resources-reveal">
              <p className="resources-eyebrow">01 · DOSSIER 30 DÍAS · WORKBOOK GUIADO</p>
              <h2 id="challenge-title">30 DÍAS.<br /><span>UN WORKBOOK, NO UNA PROMESA.</span></h2>
              <p>Taller de 30 días para entrenar por tu cuenta con guía diaria. Mandas sesiones, fotos, comidas o dudas cuando quieras, y al final puedes solicitar acompañamiento personalizado. Las reglas y el premio se entregan por escrito antes del día uno.</p>
            </header>

            <div className="resources-game-opening">
              <VideoSection
                title="CÓMO FUNCIONA EL WORKBOOK"
                subtitle="Sebastián explica cómo entrenas, qué evidencia puedes enviar, cómo se protege tu privacidad y cómo se confirma el premio vigente."
                poster={siteMedia.resources.challenge.src}
                duration="2 MIN"
                placement="media"
              />

              <aside className="resources-game-card resources-card resources-spotlight resources-reveal">
                <KeyRound aria-hidden="true" size={28} strokeWidth={1.1} />
                <span>ANTES DEL DÍA UNO</span>
                <h3>TE LLEVAS UNA RUTA, NO UNA PROMESA.</h3>
                <p>BAYONA aporta estructura, rutina, reglas y privacidad por escrito. Tú decides si entras cuando entiendes exactamente qué se pide.</p>
              </aside>
            </div>

            <div
              {...sceneBackgroundProps(siteMedia.resources.steps[5], {
                className: 'resources-game-progress resources-reveal',
                variant: 'accent',
              })}
              aria-label="Progreso del Reto de día 0 a día 30"
            >
              {/* The authored manual has five cards; its sixth registered step closes the real 0–30 progress node. */}
              <div className="resources-progress-heading">
                <span>DÍA 0</span>
                <strong>AVANZA POR NIVELES</strong>
                <span>DÍA 30</span>
              </div>
              <div className="resources-progress-track" aria-hidden="true">
                <motion.i style={{ scaleX: reducedMotion ? 1 : challengeProgress }} />
              </div>
              <ol>
                {CHALLENGE_LEVELS.map((level, index) => (
                  <li key={level.label} className={level.prize ? 'is-prize' : ''}>
                    <span>{level.prize ? <Trophy size={18} strokeWidth={1.2} /> : String(index + 1).padStart(2, '0')}</span>
                    <strong>{level.label}</strong>
                    <small>{level.days}</small>
                    <em>{level.state}</em>
                  </li>
                ))}
              </ol>
            </div>

            <section className="resources-manual resources-reveal" aria-labelledby="manual-title">
              <div className="resources-subsection-heading">
                <span>WORKBOOK DEL RETO</span>
                <h3 id="manual-title">CÓMO SE ENTRENA.</h3>
                <p>Cinco pasos. Una ruta práctica para moverte, comer mejor, registrar sensaciones y llegar con pruebas.</p>
              </div>
              <ol>
                {CHALLENGE_MANUAL.map((step, index) => (
                  <li
                    {...sceneBackgroundProps(siteMedia.resources.steps[index], {
                      className: 'resources-card resources-spotlight resources-reveal',
                      style: { '--resources-stagger': `${index * 0.07}s` },
                      variant: 'accent',
                      // El paso del manual va con `--muted` (#C4C4C4) sobre la
                      // foto: medido con probe-contraste, 3,24-3,44 con el velo
                      // por defecto (18 %), porque el fondo sale claro (0,126-0,136
                      // de luminancia). Subir el gris no arregla esto —se choca
                      // contra la foto—; lo que lo arregla es el velo, que desde
                      // el arreglo del `--accent` plano sí se aplica a superficies.
                      overlay: '66%',
                      pseudo: 'after',
                    })}
                    key={step.title}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <ArrowRight aria-hidden="true" size={18} strokeWidth={1.2} />
                    <h4>{step.title}</h4>
                    <p>{step.copy}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/*
              «Puede mandar sesiones, fotos, comidas o dudas» era real pero
              estaba enterrado en las condiciones. Aquí se convierte en una
              franja propia del dossier, con las cuatro piezas nombradas una por
              una: es lo que distingue este reto de un PDF que nadie abre.
            */}
            <div className="resources-evidence resources-reveal">
              <div className="resources-subsection-heading resources-evidence-head">
                <span>DURANTE LOS 30 DÍAS</span>
                <h3>PUES MANDAR CUATRO COSAS.</h3>
                <p>Ninguna es obligatoria. Todo lo que envíes se usa para verificar tu participación y para leerte mejor; nada se publica sin tu permiso expreso.</p>
              </div>
              <ul className="resources-evidence-list">
                {CHALLENGE_EVIDENCE.map((item, index) => (
                  <li key={item.kind}>
                    <span className="resources-evidence-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <strong>{item.kind}</strong>
                    <p>{item.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="resources-game-rules">
              <section
                {...sceneBackgroundProps(EDITORIAL_TOPIC_MEDIA.rules, {
                  className: 'resources-rule-panel resources-spotlight resources-reveal',
                  variant: 'subtle',
                  pseudo: 'after',
                  motion: true,
                })}
                aria-labelledby="conditions-title"
              >
                <div className="resources-subsection-heading">
                  <span>LAS CONDICIONES</span>
                  <h3 id="conditions-title">REGLAS CLARAS.</h3>
                </div>
                <ul>
                  {CHALLENGE_CONDITIONS.map((condition) => (
                    <li key={condition}>
                      <Check aria-hidden="true" size={18} strokeWidth={1.3} />
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section
                {...sceneBackgroundProps(EDITORIAL_TOPIC_MEDIA.health, {
                  className: 'resources-rule-panel resources-spotlight resources-reveal',
                  variant: 'subtle',
                  pseudo: 'after',
                })}
                aria-labelledby="receives-title"
              >
                <div className="resources-subsection-heading">
                  <span>QUÉ TE LLEVAS</span>
                  <h3 id="receives-title">TODO PARA EJECUTAR.</h3>
                </div>
                <ul>
                  {CHALLENGE_RECEIVES.map((item) => (
                    <li key={item}>
                      <Check aria-hidden="true" size={18} strokeWidth={1.3} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="resources-honesty-note"><strong>HONESTO:</strong> Aquí no hay coaching 1:1. Es workbook + tu constancia. Si quieres acompañamiento personal, está en los planes.</p>
              </section>
            </div>

            <section
              {...sceneBackgroundProps(EDITORIAL_TOPIC_MEDIA.prize, {
                className: 'resources-prize resources-spotlight resources-reveal',
                variant: 'accent',
                pseudo: 'after',
              })}
              aria-labelledby="prize-title"
            >
              <div className="resources-prize-icon" aria-hidden="true">
                <Trophy size={52} strokeWidth={0.9} />
              </div>
              <div>
                <p className="resources-eyebrow">LA RECOMPENSA</p>
                <h3 id="prize-title">VIGENTE Y POR ESCRITO<br /><span>ANTES DE EMPEZAR.</span></h3>
                <p className="resources-prize-lead">{CHALLENGE_PRIZE.heading}</p>
              </div>
              <p className="resources-prize-copy">{CHALLENGE_PRIZE.copy}</p>
              <ol>
                <li><span>07</span><p>Completas el primer bloque y continúas según las reglas de tu edición.</p></li>
                <li><span>30</span><p>Cumples los 30 días y accedes al <strong>premio vigente</strong> que se te comunicó antes de entrar.</p></li>
              </ol>
              <small>{CHALLENGE_PRIZE.guard}</small>
            </section>

            <div
              {...sceneBackgroundProps(EDITORIAL_TOPIC_MEDIA.reflection, {
                className: 'resources-game-cta resources-spotlight resources-reveal',
                variant: 'subtle',
                pseudo: 'after',
              })}
            >
              <div>
                <Sparkles aria-hidden="true" size={28} strokeWidth={1.1} />
                <p><strong>DECIDE CON LAS CONDICIONES DELANTE.</strong> Solicita las reglas, revisa la privacidad de las evidencias y confirma el premio vigente.</p>
              </div>
              <ExternalWhatsAppLink
                href={challengeWhatsAppUrl}
                className="resources-action resources-action--primary"
                magnetic={interactiveEffects}
              >
                CONSULTAR CONDICIONES <MessageCircle aria-hidden="true" size={17} strokeWidth={1.2} />
              </ExternalWhatsAppLink>
            </div>
          </div>
        </section>

        {/* Justo después de las reglas del reto: primero se puede hacer algo. */}
        <ProtocoloCheckIn />

        <section
          {...sceneBackgroundProps(EDITORIAL_TOPIC_MEDIA.magazine, {
            className: 'resources-section resources-magazine',
            variant: 'subtle',
            pseudo: 'after',
          })}
          id="revista"
          data-section-number="02"
          aria-labelledby="magazine-title"
        >
          <div className="resources-shell" data-immersive="clip">
            <header className="resources-section-header resources-reveal">
              <p className="resources-eyebrow">02 · BIBLIOTECA BAYONA</p>
              <h2 id="magazine-title">LEE. GUARDA.<br /><span>VUELVE CUANDO QUIERAS.</span></h2>
              <p>Publicaciones, documentos y dossiers nacidos de preguntas reales. Una biblioteca premium para probar el método sin sentir que estás recibiendo sobras.</p>
            </header>

            <article className="resources-magazine-feature resources-spotlight resources-reveal">
              <div
                {...sceneBackgroundProps(siteMedia.resources.magazine, {
                  className: 'resources-feature-visual',
                  variant: 'accent',
                })}
                aria-hidden="true"
              >
                <span>BAYONA / 01</span>
                <strong>7</strong>
                <i />
                <small>DÍAS PARA VOLVER A EMPEZAR</small>
              </div>
              <div className="resources-feature-copy">
                <span>{MAGAZINE_PUBLICATIONS[0].kicker} · {MAGAZINE_PUBLICATIONS[0].topic}</span>
                <h3>{MAGAZINE_PUBLICATIONS[0].title}</h3>
                <p>{MAGAZINE_PUBLICATIONS[0].summary}</p>
                <div>
                  <small>{MAGAZINE_PUBLICATIONS[0].type}</small>
                  <small>{MAGAZINE_PUBLICATIONS[0].readTime}</small>
                  <strong>ABRIR <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.2} /></strong>
                </div>
              </div>
              <button
                className="resources-publication-open"
                type="button"
                aria-label={`Abrir ${MAGAZINE_PUBLICATIONS[0].title}`}
                onClick={(event) => openPublication(MAGAZINE_PUBLICATIONS[0].id, event.currentTarget)}
              />
            </article>

            <div className="resources-magazine-sections">
              {MAGAZINE_SECTIONS.map((section, sectionIndex) => (
                <section className="resources-magazine-shelf resources-reveal" key={section.topic} aria-labelledby={`magazine-${section.topic.toLowerCase()}`}>
                  <header
                    {...sceneBackgroundProps(RESOURCE_TOPIC_MEDIA[sectionIndex], {
                      className: 'resources-topic-heading',
                      variant: 'subtle',
                    })}
                  >
                    <span>{String(sectionIndex + 1).padStart(2, '0')}</span>
                    <h3 id={`magazine-${section.topic.toLowerCase()}`}>{section.topic}</h3>
                    <small>{section.publications.length} {section.publications.length === 1 ? 'PUBLICACIÓN' : 'PUBLICACIONES'}</small>
                  </header>
                  <div className="resources-publication-grid">
                    {section.publications.map((publication, index) => (
                      <article
                        className="resources-publication-card resources-card resources-spotlight resources-reveal"
                        data-presentation={PUBLICATION_PRESENTATIONS[publication.id]?.tone ?? 'default'}
                        key={publication.id}
                        style={{ '--resources-stagger': `${index * 0.08}s` }}
                      >
                        <div
                          {...sceneBackgroundProps(FRESH_PUBLICATION_MEDIA[publication.id], {
                            className: 'resources-publication-cover',
                            variant: 'accent',
                          })}
                          aria-hidden="true"
                          data-presentation={PUBLICATION_PRESENTATIONS[publication.id]?.tone ?? 'default'}
                          data-topic={publication.topic}
                        >
                          <span>{publication.number}</span>
                          <small className="resources-publication-cue">
                            {PUBLICATION_PRESENTATIONS[publication.id]?.cue ?? 'BAYONA / NOTE'}
                          </small>
                          <FileText size={30} strokeWidth={0.9} />
                          <i />
                        </div>
                        <div className="resources-publication-copy">
                          <span>{publication.topic}</span>
                          <h4>{publication.title}</h4>
                          <p>{publication.summary}</p>
                          <div>
                            <small>{publication.type}</small>
                            <small>{publication.readTime}</small>
                            <strong>{publication.kind === 'pdf' ? 'ABRIR' : 'LEER'} <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.2} /></strong>
                          </div>
                        </div>
                        <button
                          className="resources-publication-open"
                          type="button"
                          aria-label={`Abrir ${publication.title}`}
                          onClick={(event) => openPublication(publication.id, event.currentTarget)}
                        />
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/*
              §19 pedía seis componentes y faltaba uno: el material descargable.
              No se simula una descarga —la prueba lo prohíbe y sería mentira—:
              las tres piezas existen y se entregan por WhatsApp para que queden
              en tu poder. Aquí se listan como lomo de biblioteca, no como botones
              de «descarga gratis».
            */}
            <section className="resources-downloads resources-reveal" aria-labelledby="downloads-title">
              <header className="resources-subsection-heading">
                <span>MATERIAL DESCARGABLE</span>
                <h3 id="downloads-title">PARA GUARDAR, NO PARA VER UNA VEZ.</h3>
                <p>Tres piezas gratuitas. Déjanos tu nombre y un contacto al final y se habilitan para descargar sin crear una cuenta.</p>
              </header>
              <ol>
                <li>
                  <span>01 · PDF</span>
                  <strong>El Protocolo BAYONA de 7 días</strong>
                  <p>Una acción concreta por día: movimiento, comida real y recuperación.</p>
                  <a href="#resources-lead">RECIBIR GRATIS <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.2} /></a>
                </li>
                <li>
                  <span>02 · WORKBOOK</span>
                  <strong>Cuaderno de ruta del Reto 30 días</strong>
                  <p>Rutina diaria por nivel, check-ins y condiciones de la edición.</p>
                  <a href="#resources-lead">RECIBIR GRATIS <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.2} /></a>
                </li>
                <li>
                  <span>03 · GUÍA</span>
                  <strong>Guía nutricional general del reto</strong>
                  <p>Estructura de platos simple y repetible. No sustituye un plan individual.</p>
                  <a href="#resources-lead">RECIBIR GRATIS <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.2} /></a>
                </li>
              </ol>
            </section>

            <aside
              {...sceneBackgroundProps(EDITORIAL_TOPIC_MEDIA.rest, {
                className: 'resources-magazine-living resources-reveal',
                variant: 'subtle',
              })}
            >
              <BookOpen aria-hidden="true" size={27} strokeWidth={1.1} />
              <div>
                <strong>UNA REVISTA VIVA. NO UN CALENDARIO RÍGIDO.</strong>
                <p>Los recursos nacen de temas y conversaciones del grupo. Por eso lo mejor es estar dentro o seguirme en redes. Aquí los encuentras organizados para volver cuando quieras.</p>
                <small>Más temas nacen del grupo y se anuncian en redes. Sígueme para no perderte ninguno.</small>
              </div>
            </aside>
          </div>
        </section>

        <section
          className="resources-section resources-question"
          data-section-number="03"
          aria-labelledby="question-title"
        >
          <div className="resources-shell resources-question-layout">
            <div className="resources-question-copy resources-reveal">
              <p className="resources-eyebrow">03 · CONSULTA EXPERTA GRATUITA</p>
              <h2 id="question-title">¿UNA PREGUNTA?<br /><span>TRÁELA CON CONTEXTO.</span></h2>
              <p>Prepara una consulta concreta para WhatsApp. Cuanto mejor expliques objetivo, situación y duda, más útil será la orientación inicial.</p>
              <div
                {...sceneBackgroundProps(EDITORIAL_TOPIC_MEDIA.conversation, {
                  className: 'resources-question-prompt',
                  variant: 'subtle',
                })}
              >
                <MessageCircle aria-hidden="true" size={28} strokeWidth={1.2} />
                <p>Explica el objetivo, qué has probado y qué necesitas aclarar. Si requiere profundidad, te diremos si conviene una consulta o un plan.</p>
              </div>
            </div>

            <form
              className="resources-question-form resources-spotlight resources-reveal"
              aria-labelledby="question-title"
              aria-busy={isPreparingQuestion}
              onSubmit={prepareQuestion}
              noValidate
            >
              <div className="resources-field">
                <input
                  id="resources-question-name"
                  name="name"
                  type="text"
                  value={questionForm.name}
                  onChange={handleQuestionFieldChange}
                  autoComplete="name"
                  placeholder=" "
                  required
                  aria-invalid={Boolean(questionErrors.name)}
                  aria-errormessage={questionErrors.name ? 'resources-question-errors' : undefined}
                />
                <label htmlFor="resources-question-name">NOMBRE</label>
              </div>

              <div className="resources-field">
                <input
                  id="resources-question-email"
                  name="email"
                  type="email"
                  value={questionForm.email}
                  onChange={handleQuestionFieldChange}
                  autoComplete="email"
                  placeholder=" "
                  required
                  aria-invalid={Boolean(questionErrors.email)}
                  aria-errormessage={questionErrors.email ? 'resources-question-errors' : undefined}
                />
                <label htmlFor="resources-question-email">EMAIL</label>
              </div>

              <div className="resources-field">
                <input
                  id="resources-question-whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={questionForm.whatsapp}
                  onChange={handleQuestionFieldChange}
                  autoComplete="tel"
                  placeholder="+34 600 000 000"
                  required
                  aria-invalid={Boolean(questionErrors.whatsapp)}
                  aria-errormessage={questionErrors.whatsapp ? 'resources-question-errors' : undefined}
                />
                <label htmlFor="resources-question-whatsapp">WHATSAPP</label>
              </div>

              <div className="resources-field resources-field--select">
                <select
                  id="resources-question-category"
                  name="category"
                  value={questionForm.category}
                  onChange={handleQuestionFieldChange}
                  required
                  aria-invalid={Boolean(questionErrors.category)}
                  aria-errormessage={questionErrors.category ? 'resources-question-errors' : undefined}
                >
                  <option value="">Selecciona una categoría</option>
                  {RESOURCE_QUESTION_TOPICS.map((topic) => (
                    <option key={topic.value} value={topic.value}>{topic.label}</option>
                  ))}
                </select>
                <label htmlFor="resources-question-category">CATEGORÍA</label>
              </div>

              <div className="resources-field resources-field--textarea">
                <textarea
                  id="resources-question-message"
                  name="message"
                  value={questionForm.message}
                  onChange={handleQuestionFieldChange}
                  minLength={10}
                  maxLength={500}
                  required
                  aria-describedby="resources-question-help resources-privacy-note"
                  aria-invalid={Boolean(questionErrors.message)}
                  aria-errormessage={questionErrors.message ? 'resources-question-errors' : undefined}
                  placeholder="Cuéntame qué quieres resolver."
                />
                <label htmlFor="resources-question-message">MENSAJE</label>
              </div>
              <div className="resources-question-meta">
                <small id="resources-question-help">Entre 10 y 500 caracteres · sin información sensible</small>
                <small aria-label={`${questionForm.message.length} de 500 caracteres`}>{questionForm.message.length}/500</small>
              </div>

              <div
                className={`resources-dropzone${isFileDragging ? ' is-dragging' : ''}${questionFile ? ' has-file' : ''}`}
                onDragEnter={handleQuestionDragOver}
                onDragOver={handleQuestionDragOver}
                onDragLeave={handleQuestionDragLeave}
                onDrop={handleQuestionDrop}
              >
                <input
                  className="resources-visually-hidden"
                  id="resources-question-file"
                  name="file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleQuestionFileChange}
                  aria-describedby="resources-question-file-help"
                />
                <label htmlFor="resources-question-file">
                  {questionFile
                    ? <FileCheck2 aria-hidden="true" size={24} strokeWidth={1.2} />
                    : <UploadCloud aria-hidden="true" size={24} strokeWidth={1.2} />}
                  <span>
                    <strong>ADJUNTAR CONTEXTO (OPCIONAL)</strong>
                    <small>{questionFile ? questionFile.name : 'Una foto del plato, un vídeo de la técnica, tu registro de sesiones o un PDF'}</small>
                  </span>
                </label>
              </div>
              <small className="resources-consent-help" id="resources-question-file-help">
                {questionFile
                  ? `Seleccionado: ${questionFile.name}. Lo adjuntarás manualmente en WhatsApp.`
                  : 'Opcional · imagen o PDF · no se sube automáticamente.'}
              </small>

              <label className="resources-question-consent" htmlFor="resources-question-consent">
                <input
                  id="resources-question-consent"
                  name="consent"
                  type="checkbox"
                  checked={questionForm.consent}
                  onChange={handleQuestionFieldChange}
                  required
                  aria-invalid={Boolean(questionErrors.consent)}
                  aria-describedby="resources-question-consent-help"
                  aria-errormessage={questionErrors.consent ? 'resources-question-errors' : undefined}
                />
                <span>
                  Consiento preparar estos datos para compartirlos por WhatsApp. Entiendo que solo llegarán a ese tercero si reviso el mensaje, abro el enlace y decido enviarlo.
                </span>
              </label>
              <small className="resources-consent-help" id="resources-question-consent-help">
                Puedes salir sin marcarlo; la página no conservará la consulta.
              </small>

              {questionErrorMessages.length > 0 && (
                <div
                  className="resources-form-errors"
                  id="resources-question-errors"
                  role="alert"
                  aria-live="assertive"
                >
                  <strong>REVISA LA CONSULTA</strong>
                  <ul>{questionErrorMessages.map((message) => <li key={message}>{message}</li>)}</ul>
                </div>
              )}

              <button className="resources-action resources-action--primary resources-submit" type="submit" disabled={isPreparingQuestion}>
                {isPreparingQuestion ? (
                  <>PREPARANDO <span className="resources-submit-loader" aria-hidden="true" /></>
                ) : (
                  <>PREPARAR CONSULTA <MessageCircle aria-hidden="true" size={17} strokeWidth={1.2} /></>
                )}
              </button>
              <p className="resources-question-submit-note">
                Preparar crea el enlace localmente; no envía tus datos ni sube el archivo.
              </p>

              <AnimatePresence initial={false}>
                {preparedQuestionUrl && (
                  <motion.div
                    className="resources-prepared-message"
                    role="status"
                    aria-live="polite"
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.42, ease: RESOURCES_EASE }}
                  >
                    <p>Mensaje preparado. Revísalo y adjunta el archivo manualmente antes de enviarlo.</p>
                    <ExternalWhatsAppLink
                      href={preparedQuestionUrl}
                      className="resources-text-action"
                      magnetic={interactiveEffects}
                    >
                      ABRIR CONSULTA EN WHATSAPP <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.2} />
                    </ExternalWhatsAppLink>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="resources-privacy-note" id="resources-privacy-note">
                <ShieldCheck aria-hidden="true" size={16} strokeWidth={1.2} />
                <span>Nada se envía solo. Tú revisas el mensaje y decides abrir WhatsApp. No guardamos tus datos ni subimos el archivo. Evita incluir información médica sensible.</span>
              </p>
            </form>
          </div>
        </section>



        <section id="resources-lead" className="resources-lead-capture" aria-label="Recibir recursos gratuitos">
          <LeadMagnet
            heading="Recibe tus recursos gratis."
            copy="Déjanos tu nombre y un contacto. Tus tres recursos se habilitan al instante y puedes pedir una valoración cuando quieras."
          />
        </section>
      </div>

      <AnimatePresence>
        {activePublication && (
          <PublicationReader
            closeRef={readerCloseRef}
            interactiveEffects={interactiveEffects}
            onClose={() => setActivePublicationId(null)}
            publication={activePublication}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
