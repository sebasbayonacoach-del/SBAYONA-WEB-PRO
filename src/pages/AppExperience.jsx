import { Suspense, lazy, useContext, useEffect, useState } from 'react'
import { ArrowUpRight, Bell, Check, ChevronDown, Lock, MessageCircle, Monitor, Smartphone, Tablet, Watch } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthContext from '../lib/auth/AuthContext.jsx'
import { isCloudEnabled, supabase } from '../lib/supabase.js'
import { getStoredPushToken, requestPushPermission } from '../lib/push/usePush.js'
import { SectionLabel } from '../components/Layout'
import Bridge from '../components/Bridge'
import VideoSection from '../components/VideoSection.jsx'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import { siteMedia } from '../config/siteMedia.js'
import {
  BAYONA_PLUS_FREE_TIER,
  BAYONA_PLUS_PLAN_OPTIONS,
  BAYONA_PLUS_SUBSCRIBER_TIER,
  BAYONA_PLUS_UPDATES_URL,
} from './appExperienceContent.js'
// app.css era global en main.jsx (88 kB en todas las rutas). Ahora viaja con /app.
import '../styles/app.css'
import '../styles/app-robust-motion.css'
import '../styles/auth-members.css'

/*
 * Un solo mensaje para los tres botones de la lista: el texto ya declara el
 * estado real del producto, así que la página puede permitirse hablar de acceso
 * prioritario en vez de disculparse en cada bloque.
 */
const WHATSAPP_EARLY_ACCESS_URL = BAYONA_PLUS_UPDATES_URL

const VISION_POINTS = [
  'Abrir el día y saber qué toca, por qué toca y cuál es la versión mínima si la vida se complica.',
  'Registrar entrenamiento, hábitos, comida y sensaciones sin convertirlo todo en ruido.',
  'Conectar el acompañamiento con el nivel de plan contratado, no perderlo en mil chats.',
  'Unir comunidad, recursos y seguimiento en una experiencia que se sienta premium de verdad.',
  'Ver el cuerpo como un sistema: carga, nutrición, recuperación, movimiento y dirección.',
]

const PAIN_POINTS = [
  {
    title: 'DATOS QUE NO DECIDEN POR TI',
    copy: 'Pasos, calorías o gráficas sueltas no te dicen qué hacer mañana. BAYONA+ nace para convertir información en criterio accionable.',
  },
  {
    title: 'RUTINAS QUE NO ENTIENDEN TU SEMANA',
    copy: 'Una lista de ejercicios no sabe si dormiste, viajaste, comiste mal o llegaste reventado. La app apunta a mostrar contexto antes que repetición.',
  },
  {
    title: 'TODO SE PIERDE SI NO HAY UN CENTRO',
    copy: 'Plan, registro, chat y recursos no deberían vivir separados. La visión es una cabina única para sostener continuidad.',
  },
]

const DIFFERENTIATORS = [
  {
    title: 'MOVIMIENTO REAL, NO FITNESS DE PLANTILLA',
    copy: 'Parkour, fuerza y preparación física aportan una idea central: observar, adaptarse y progresar con técnica.',
  },
  {
    title: 'CUERPO COMPLETO, DECISIONES CLARAS',
    copy: 'Entrenamiento, nutrición y recuperación se ordenan dentro del alcance de cada plan, sin vender diagnósticos ni promesas clínicas.',
  },
  {
    title: 'FORMACIÓN CONVERTIDA EN PRODUCTO',
    copy: 'La experiencia práctica no se queda en teoría: se traduce en pantallas, rutas, criterios y decisiones más fáciles de sostener.',
  },
  {
    title: 'VISTA PREVIA, VISIÓN EN SERIO',
    copy: 'Las funciones finales siguen en definición. Esta página muestra la dirección: una app de fitness con sensación de producto premium, no otra plantilla.',
  },
]

export const APP_FEATURES = [
  {
    id: 'plan-ritmo',
    title: 'PLAN DIARIO CON INTENCIÓN',
    copy: 'La sesión prevista, su propósito y sus alternativas vivirían juntas para que el cliente no abra la app a adivinar.',
  },
  {
    id: 'datos-entendidos',
    title: 'REGISTRO QUE SÍ SIRVE',
    copy: 'Sesiones, hábitos, comida y sensaciones podrían organizarse para revisar tendencias, no para fabricar conclusiones médicas automáticas.',
  },
  {
    id: 'cuerpo-mapa',
    title: 'MAPA DE MOVIMIENTO',
    copy: 'Recursos visuales para entender rangos, patrones y técnica como parte del entrenamiento, no como adorno de interfaz.',
  },
  {
    id: 'anatomia-movimiento',
    title: 'ANATOMÍA VISUAL PREMIUM',
    copy: 'Visualizaciones educativas del cuerpo para elevar comprensión y adherencia, siempre separadas de evaluación clínica.',
  },
  {
    id: 'entrenador-siempre',
    title: 'CANAL CON TU ENTRENADOR',
    copy: 'El contacto incluido en tu plan debería sentirse ordenado, visible y conectado al proceso, no perdido entre mensajes.',
  },
  {
    id: 'recuperacion-inteligente',
    title: 'RECUPERACIÓN COMO VARIABLE',
    copy: 'Sueño, esfuerzo y sensación pueden aportar contexto para revisar carga con criterio, sin prometer diagnósticos.',
  },
  {
    id: 'comunidad-empuja',
    title: 'COMUNIDAD CONECTADA',
    copy: 'La comunidad deja de ser un extra: se vuelve parte del entorno que te recuerda que no estás entrenando solo.',
  },
  {
    id: 'progreso-real',
    title: 'PROGRESO QUE SE PUEDE CONVERSAR',
    copy: 'Indicadores elegidos por objetivo para ver evolución, conversar ajustes y sostener decisiones a lo largo del tiempo.',
  },
  {
    id: 'modo-offline',
    title: 'MODO SIN EXCUSAS',
    copy: 'El acceso offline todavía no está confirmado: la intención es que el entrenamiento no dependa de una conexión perfecta.',
  },
]

const FOUNDING_BENEFITS = [
  {
    title: 'ENTRA AL RADAR DEL PRODUCTO',
    copy: 'Recibe avances reales cuando existan decisiones sobre pruebas, funciones o fechas. Sin humo, sin spam.',
  },
  {
    title: 'POSIBLES PILOTOS PRIVADOS',
    copy: 'Si se abre una prueba compatible con tu perfil, verás requisitos y condiciones antes de decidir entrar.',
  },
  {
    title: 'TU FEEDBACK PUEDE MOLDEARLA',
    copy: 'Podrás compartir necesidades reales. Se evaluarán con criterio, sin prometer que cada idea se vuelva función.',
  },
  {
    title: 'CONDICIONES ANTES DE PAGAR',
    copy: 'No hay precio fundador activo. Si existe una oferta futura, se explicará por escrito antes de contratar.',
  },
]

const PHONE_MODULES = [
  { title: 'ESTADO', value: 'CONCEPTO', meta: 'EJEMPLO DE INTERFAZ' },
  { title: 'MOVILIDAD', value: 'REGISTRO', meta: 'INDICADOR POR DEFINIR' },
  { title: 'RUTINA', value: 'BLOQUE A', meta: 'EJEMPLO DE SESIÓN' },
  { title: 'RECUPERACIÓN', value: 'REGISTRO', meta: 'SIN DIAGNÓSTICO' },
  { title: 'COMUNIDAD', value: 'ACCESO', meta: 'SEGÚN DISPONIBILIDAD' },
  { title: 'PROGRESO', value: 'HISTORIAL', meta: 'MÉTRICAS POR DEFINIR' },
]

function useAppReveal() {
  useEffect(() => {
    const page = document.querySelector('.app-page')
    if (!page) return undefined

    const revealElements = page.querySelectorAll('.app-reveal, .app-reveal-stagger')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointerEffectsQuery = window.matchMedia(
      '(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    let revealObserver

    if (reducedMotionQuery.matches || !('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('visible'))
    } else {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('visible')
          revealObserver.unobserve(entry.target)
        })
      }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' })

      revealElements.forEach((element) => revealObserver.observe(element))
    }

    const listenToMediaQuery = (query, callback) => {
      if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', callback)
        return () => query.removeEventListener('change', callback)
      }

      query.addListener(callback)
      return () => query.removeListener(callback)
    }

    const animationFrames = new Set()
    const scheduleFrame = (callback) => {
      let frameId = 0
      frameId = window.requestAnimationFrame((timestamp) => {
        animationFrames.delete(frameId)
        callback(timestamp)
      })
      animationFrames.add(frameId)
      return frameId
    }

    const countTargets = []
    const registerCountTarget = (element) => {
      if (!element) return
      const original = element.textContent
      const match = original.match(/\d+/)
      if (!match) return

      element.dataset.appCountUpMetric = 'true'
      countTargets.push({
        element,
        original,
        prefix: original.slice(0, match.index),
        suffix: original.slice(match.index + match[0].length),
        digits: match[0],
        value: Number(match[0]),
        started: false,
        frameId: 0,
      })
    }

    const numericPhoneMetrics = new Set(['READINESS', 'MOVILIDAD', 'COMUNIDAD'])
    page.querySelectorAll('.app-phone-module').forEach((module) => {
      const title = module.querySelector('h4')?.textContent.trim()
      if (numericPhoneMetrics.has(title)) registerCountTarget(module.querySelector('strong'))
    })

    const watchReadiness = page.querySelector('.app-device-watch strong')
    if (watchReadiness?.textContent.includes('READINESS')) registerCountTarget(watchReadiness)

    const writeCountValue = (target, value) => {
      const number = String(value).padStart(target.digits.length, '0')
      target.element.textContent = `${target.prefix}${number}${target.suffix}`
    }

    const finishCount = (target) => {
      if (target.frameId) {
        window.cancelAnimationFrame(target.frameId)
        animationFrames.delete(target.frameId)
        target.frameId = 0
      }
      target.started = true
      writeCountValue(target, target.value)
    }

    const startCount = (target) => {
      if (target.started) return
      target.started = true

      if (reducedMotionQuery.matches) {
        finishCount(target)
        return
      }

      writeCountValue(target, 0)
      let startTime
      const step = (timestamp) => {
        if (reducedMotionQuery.matches) {
          finishCount(target)
          return
        }

        if (startTime === undefined) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / 900, 1)
        const easedProgress = 1 - ((1 - progress) ** 4)
        writeCountValue(target, Math.round(target.value * easedProgress))

        if (progress < 1) {
          target.frameId = scheduleFrame(step)
        } else {
          target.frameId = 0
          writeCountValue(target, target.value)
        }
      }

      target.frameId = scheduleFrame(step)
    }

    let countObserver
    if (reducedMotionQuery.matches) {
      countTargets.forEach(finishCount)
    } else if ('IntersectionObserver' in window) {
      countObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const target = countTargets.find((item) => item.element === entry.target)
          if (target) startCount(target)
          countObserver.unobserve(entry.target)
        })
      }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' })
      countTargets.forEach((target) => countObserver.observe(target.element))
    } else {
      countTargets.forEach(startCount)
    }

    const anatomyTrigger = page.querySelector('.app-anatomy-trigger')
    const anatomyCard = anatomyTrigger?.closest('.app-feature')
    let removeAnatomyInteraction = () => {}

    if (anatomyTrigger && anatomyCard) {
      anatomyCard.classList.add('app-anatomy-interactive')
      const toggleAnatomy = () => {
        const isActive = anatomyCard.classList.toggle('is-anatomy-active')
        anatomyTrigger.setAttribute('aria-pressed', String(isActive))
      }

      anatomyTrigger.addEventListener('click', toggleAnatomy)
      removeAnatomyInteraction = () => {
        anatomyTrigger.removeEventListener('click', toggleAnatomy)
        anatomyTrigger.setAttribute('aria-pressed', 'false')
        anatomyCard.classList.remove('app-anatomy-interactive', 'is-anatomy-active')
      }
    }

    const mockups = Array.from(page.querySelectorAll('.app-device'))
    const spotlightCards = Array.from(page.querySelectorAll('.app-founding-benefit'))
    let pointerCleanups = []

    const clearMockupVariables = (element) => {
      [
        '--app-pointer-x',
        '--app-pointer-y',
        '--app-follow-x',
        '--app-follow-y',
        '--app-rotate-x',
        '--app-rotate-y',
      ].forEach((property) => element.style.removeProperty(property))
    }

    const clearSpotlightVariables = (element) => {
      element.style.removeProperty('--app-spotlight-x')
      element.style.removeProperty('--app-spotlight-y')
    }

    const bindPointerTarget = (element, update, reset, clear) => {
      let frameId = 0
      let point

      const flush = () => {
        frameId = 0
        if (!point) return
        const rect = element.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        const x = Math.min(1, Math.max(0, (point.x - rect.left) / rect.width))
        const y = Math.min(1, Math.max(0, (point.y - rect.top) / rect.height))
        update(x, y)
      }

      const handlePointerMove = (event) => {
        point = { x: event.clientX, y: event.clientY }
        if (!frameId) frameId = window.requestAnimationFrame(flush)
      }

      const handlePointerLeave = () => {
        point = undefined
        if (frameId) window.cancelAnimationFrame(frameId)
        frameId = 0
        reset()
      }

      reset()
      element.addEventListener('pointermove', handlePointerMove, { passive: true })
      element.addEventListener('pointerleave', handlePointerLeave)
      element.addEventListener('pointercancel', handlePointerLeave)

      return () => {
        if (frameId) window.cancelAnimationFrame(frameId)
        element.removeEventListener('pointermove', handlePointerMove)
        element.removeEventListener('pointerleave', handlePointerLeave)
        element.removeEventListener('pointercancel', handlePointerLeave)
        clear()
      }
    }

    const clearPointerBindings = () => {
      pointerCleanups.forEach((cleanup) => cleanup())
      pointerCleanups = []
    }

    const setupPointerEffects = () => {
      clearPointerBindings()
      if (!pointerEffectsQuery.matches) return

      mockups.forEach((mockup) => {
        const reset = () => {
          mockup.style.setProperty('--app-pointer-x', '50%')
          mockup.style.setProperty('--app-pointer-y', '50%')
          mockup.style.setProperty('--app-follow-x', '0px')
          mockup.style.setProperty('--app-follow-y', '0px')
          mockup.style.setProperty('--app-rotate-x', '0deg')
          mockup.style.setProperty('--app-rotate-y', '0deg')
        }
        const update = (x, y) => {
          mockup.style.setProperty('--app-pointer-x', `${(x * 100).toFixed(2)}%`)
          mockup.style.setProperty('--app-pointer-y', `${(y * 100).toFixed(2)}%`)
          mockup.style.setProperty('--app-follow-x', `${((x - 0.5) * 4).toFixed(2)}px`)
          mockup.style.setProperty('--app-follow-y', `${((y - 0.5) * 4).toFixed(2)}px`)
          mockup.style.setProperty('--app-rotate-x', `${((0.5 - y) * 1.2).toFixed(3)}deg`)
          mockup.style.setProperty('--app-rotate-y', `${((x - 0.5) * 1.6).toFixed(3)}deg`)
        }
        pointerCleanups.push(bindPointerTarget(
          mockup,
          update,
          reset,
          () => clearMockupVariables(mockup),
        ))
      })

      spotlightCards.forEach((card) => {
        const reset = () => {
          card.style.setProperty('--app-spotlight-x', '50%')
          card.style.setProperty('--app-spotlight-y', '50%')
        }
        const update = (x, y) => {
          card.style.setProperty('--app-spotlight-x', `${(x * 100).toFixed(2)}%`)
          card.style.setProperty('--app-spotlight-y', `${(y * 100).toFixed(2)}%`)
        }
        pointerCleanups.push(bindPointerTarget(
          card,
          update,
          reset,
          () => clearSpotlightVariables(card),
        ))
      })
    }

    setupPointerEffects()

    const handleReducedMotionChange = () => {
      if (!reducedMotionQuery.matches) return
      revealElements.forEach((element) => element.classList.add('visible'))
      revealObserver?.disconnect()
      countObserver?.disconnect()
      countTargets.forEach(finishCount)
    }

    const stopReducedMotionListener = listenToMediaQuery(reducedMotionQuery, handleReducedMotionChange)
    const stopPointerEffectsListener = listenToMediaQuery(pointerEffectsQuery, setupPointerEffects)

    return () => {
      revealObserver?.disconnect()
      countObserver?.disconnect()
      stopReducedMotionListener()
      stopPointerEffectsListener()
      clearPointerBindings()
      removeAnatomyInteraction()
      animationFrames.forEach((frameId) => window.cancelAnimationFrame(frameId))
      countTargets.forEach((target) => {
        target.element.textContent = target.original
        delete target.element.dataset.appCountUpMetric
      })
    }
  }, [])
}

function renderFeatureCopy(feature) {
  if (feature.id !== 'anatomia-movimiento') return feature.copy

  return feature.copy.split(/(músculos|cuerpo)/).map((part, index) => (
    /^(músculos|cuerpo)$/.test(part)
      ? <span className="app-anatomy-zone" key={`${part}-${index}`}>{part}</span>
      : part
  ))
}

function AppDivider() {
  return <div className="app-divider" aria-hidden="true" />
}

function AppSectionNumber({ children }) {
  return <span className="app-section-number" aria-hidden="true">{children}</span>
}

/**
 * Área de miembros (Fase 2 SaaS).
 *
 * Sin proveedor de auth (tests del concepto, render directo) devuelve invitado
 * y la página muestra el concepto BAYONA+ como antes: el contrato honesto de
 * abajo no cambia. Con sesión (ruta /app protegida por RequireAuth) muestra
 * el panel del miembro: saludo, insignia del plan y los tres bloques.
 */
const GUEST_AUTH = Object.freeze({
  user: null,
  tier: 'free',
  loading: false,
  signOut: async () => ({ error: null }),
})

function useAuthOptional() {
  const ctx = useContext(AuthContext)
  return ctx ?? GUEST_AUTH
}

const PROGRESS_COUNT_KEY = 'bayona_progress_count'

function readProgressCount() {
  try {
    const raw = window?.localStorage?.getItem(PROGRESS_COUNT_KEY)
    const parsed = Number.parseInt(raw ?? '0', 10)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
  } catch {
    return 0
  }
}

/** Rutina de ejemplo: RAÍZ, semana 1, día A. Orientativa, no prescribe. */
const ROUTINE_RAIZ_S1A = Object.freeze([
  'Calentamiento con movilidad — 5 min',
  'Sentadilla goblet — 3 × 10',
  'Flexiones (o versión en rodillas) — 3 × 8',
  'Plancha — 3 × 30 seg',
  'Caminata tranquila — 10 min',
])

/**
 * Opt-in de avisos push. Solo actúa tras el clic (gesto explícito):
 * sin Firebase o sin permiso es un no-op silencioso con nota en UI.
 * Solo icono + texto, reutilizando `.members-signout`.
 */
function PushOptIn() {
  const [status, setStatus] = useState(() => (getStoredPushToken() ? 'ok' : 'idle'))
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (busy) return
    setBusy(true)
    try {
      const result = await requestPushPermission()
      setStatus(result.ok ? 'ok' : 'unavailable')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="members-push">
      <button type="button" className="members-signout" onClick={handleClick} disabled={busy}>
        <Bell size={15} strokeWidth={1.5} aria-hidden="true" />
        {status === 'ok' ? 'AVISOS ACTIVADOS' : 'ACTIVAR AVISOS'}
      </button>
      {status === 'unavailable' && (
        <p className="members-push-note">Los avisos no están disponibles en este dispositivo todavía.</p>
      )}
    </div>
  )
}

function displayNameOf(user) {
  const metaName = user?.user_metadata?.full_name ?? user?.user_metadata?.name
  if (typeof metaName === 'string' && metaName.trim() !== '') return metaName.trim()
  if (typeof user?.email === 'string' && user.email !== '') return user.email
  return 'miembro'
}

function MembersArea({ user, tier, signOut }) {
  const navigate = useNavigate()
  const paid = String(tier ?? 'free').toLowerCase() !== 'free'
  const tierLabel = paid ? String(tier).toUpperCase() : 'GRATIS'
  const [checked, setChecked] = useState(() => ROUTINE_RAIZ_S1A.map(() => false))
  const [sessions, setSessions] = useState(readProgressCount)

  function toggleExercise(index) {
    setChecked((current) => current.map((value, position) => (position === index ? !value : value)))
  }

  function markSession() {
    const next = sessions + 1
    setSessions(next)
    try {
      window?.localStorage?.setItem(PROGRESS_COUNT_KEY, String(next))
    } catch {
      // Contador en memoria si el almacenamiento está bloqueado.
    }
    if (isCloudEnabled() && supabase && user?.id) {
      try {
        supabase.from('progress_logs').insert({
          user_id: user.id,
          log_date: new Date().toISOString().slice(0, 10),
          routine: 'sesion-marcada',
          done_series: 1,
        }).then(() => {}, () => {})
      } catch {
        // La cuenta local ya quedó guardada.
      }
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } finally {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="members-page">
      <section className="section-shell members-hero" aria-labelledby="members-title">
        <p className="eyebrow"><span />ÁREA DE MIEMBROS</p>
        <h1 id="members-title">Hola, {displayNameOf(user)}.</h1>
        <p className="members-tier">Tu plan: <strong>{tierLabel}</strong></p>
        <button type="button" className="members-signout" onClick={handleSignOut}>
          SALIR
        </button>
      </section>

      <div className="section-shell members-grid">
        <section className="members-block" aria-labelledby="members-routine-title">
          <h2 id="members-routine-title">MI RUTINA DE HOY</h2>
          {paid ? (
            <>
              <p>RAÍZ · Semana 1 · Día A (ejemplo orientativo, adapta el esfuerzo a tu día).</p>
              <ul className="members-routine-list">
                {ROUTINE_RAIZ_S1A.map((exercise, index) => (
                  <li key={exercise}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checked[index]}
                        onChange={() => toggleExercise(index)}
                      />
                      {exercise}
                    </label>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p>Tu plan gratis incluye los recursos abiertos. Para entrenar con una rutina asignada, elige tu acompañamiento.</p>
              <ul className="members-links">
                <li><Link to="/programs">VER PLANES</Link></li>
              </ul>
            </>
          )}
        </section>

        <section className="members-block" aria-labelledby="members-progress-title">
          <h2 id="members-progress-title">MI PROGRESO</h2>
          <p className="members-progress-count" aria-live="polite">
            <strong>{sessions}</strong> {sessions === 1 ? 'sesión' : 'sesiones'}
          </p>
          <p>Sesiones que marcaste como completadas en este dispositivo.</p>
          <button type="button" className="gold-button" onClick={markSession}>
            MARCAR SESIÓN DE HOY
          </button>
        </section>

        <section className="members-block" aria-labelledby="members-resources-title">
          <h2 id="members-resources-title">RECURSOS GRATIS</h2>
          <p>Guías, vídeos y revista para entrenar con criterio entre sesiones.</p>
          <ul className="members-links">
            <li><Link to="/resources">GUÍAS Y REVISTA</Link></li>
            <li><Link to="/community">COMUNIDAD ABIERTA</Link></li>
            <li><Link to="/programs">VER PLANES</Link></li>
          </ul>
          <PushOptIn />
        </section>
      </div>
    </div>
  )
}

/** Capa WebGL del teléfono — carga diferida para proteger el LCP (Fase 11.5). */
const AppShowcaseLayer = lazy(() => import('../components/app/AppShowcaseLayer.jsx'))

export default function AppExperience() {
  useAppReveal()
  const auth = useAuthOptional()

  if (auth.loading) {
    return (
      <div className="section-shell" role="status" aria-live="polite" style={{ padding: '4rem 0' }}>
        <p>Cargando tu área…</p>
      </div>
    )
  }

  if (auth.user) {
    return <MembersArea user={auth.user} tier={auth.tier} signOut={auth.signOut} />
  }

  return (
    <div className="app-experience app-page">
      <section
        {...sceneBackgroundProps(siteMedia.app.hero, {
          className: 'app-hero',
          variant: 'hero',
          motion: true,
        })}
        aria-labelledby="app-hero-title"
      >
        {/* Capa WebGL 3D — teléfono detrás del hero (Fase 11.5). */}
        <Suspense fallback={null}>
          <AppShowcaseLayer />
        </Suspense>
        <div className="app-hero-content">
          <p className="app-eyebrow">BAYONA+ <span aria-hidden="true">•</span> ACCESO PRIORITARIO</p>
          <h1 id="app-hero-title" className="app-hero-title">
            <span className="app-hero-line">ENTRENAMIENTO.</span>
            {' '}
            <span className="app-hero-line accent">SEGUIMIENTO.</span>
            {' '}
            <span className="app-hero-line">UN MISMO LUGAR.</span>
          </h1>
          <p className="app-hero-subtitle">
            BAYONA+ es la visión del centro de mando BAYONA: plan, registro, recursos y comunidad en un mismo lugar. Puedes apuntarte para recibir avances concretos.
          </p>
          <div className="app-hero-cta">
            <a
              href={WHATSAPP_EARLY_ACCESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="app-primary-cta"
            >
              RECIBIR NOVEDADES
              <MessageCircle size={18} strokeWidth={1} aria-hidden="true" />
            </a>
            <a href="#vision" className="app-text-link">
              CONOCER EL CONCEPTO
              <ChevronDown size={14} strokeWidth={1} aria-hidden="true" />
            </a>
          </div>
        </div>
        <a className="app-scroll-indicator" href="#vision" aria-label="Ir al concepto de BAYONA+">
          <span className="app-scroll-line" />
          <ChevronDown size={14} strokeWidth={1} aria-hidden="true" />
        </a>
      </section>

      <AppDivider />

      <section id="vision" className="app-vision app-section app-reveal" data-section-number="01" aria-labelledby="app-vision-title">
        <AppSectionNumber>01</AppSectionNumber>
        <div className="section-shell app-section-content container">
          <header className="app-section-header app-vision-header">
            <SectionLabel>01 / CONCEPTO DE PRODUCTO</SectionLabel>
            <h2 id="app-vision-title" className="app-section-title">UNA EXPERIENCIA<br /> <span>EN PREPARACIÓN.</span></h2>
            <p className="app-section-subtitle">
              La visión es consultar el plan, registrar la sesión y acceder a recursos desde un mismo entorno. Es una vista previa de producto: todavía no describe una función disponible.
            </p>
          </header>
          <VideoSection
            title="BAYONA+: CONCEPTO EN 90 SEGUNDOS"
            subtitle="Sebastián presenta la dirección del producto, las funciones que se exploran y lo que aún está por definir."
            poster={siteMedia.app.hero.src}
            duration="90 SEG"
            placement="contained"
          />
          <ol className="app-vision-list app-reveal-stagger">
            {VISION_POINTS.map((point, index) => (
              <li
                {...sceneBackgroundProps(siteMedia.app.vision[index], {
                  className: 'app-vision-item',
                  style: { '--i': index },
                  variant: 'accent',
                })}
                key={point}
              >
                <span className="app-vision-marker">{String(index + 1).padStart(2, '0')}</span>
                <strong className="app-vision-text">{point}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <AppDivider />

      <section className="app-problem app-section app-reveal" data-section-number="02" aria-labelledby="app-problem-title">
        <AppSectionNumber>02</AppSectionNumber>
        <div className="section-shell app-section-content container">
          <div className="app-problem-layout">
            <div className="app-problem-title-col">
              <SectionLabel>02 / EL RETO DE DISEÑO</SectionLabel>
              <h2 id="app-problem-title" className="app-section-title">MUCHOS DATOS.<br /> <span>POCO CONTEXTO.</span></h2>
              <p className="app-section-subtitle">El objetivo del concepto es ordenar la información útil para el entrenamiento.</p>
              <p className="app-problem-closing">BAYONA+ explora una forma de reunir plan, registro y conversación.</p>
            </div>
            <div className="app-pain-list app-reveal-stagger">
              {PAIN_POINTS.map((point, index) => (
                <article
                  {...sceneBackgroundProps(siteMedia.app.pain[index], {
                    className: 'app-pain-item',
                    style: { '--i': index },
                    variant: 'accent',
                  })}
                  key={point.title}
                >
                  <span className="app-pain-number">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="app-pain-title">{point.title}</h3>
                    <p className="app-pain-desc">{point.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AppDivider />

      <section className="app-difference app-section app-reveal" data-section-number="03" aria-labelledby="app-difference-title">
        <AppSectionNumber>03</AppSectionNumber>
        <div className="section-shell app-section-content container">
          <header className="app-section-header">
            <SectionLabel>03 / LÍNEAS DE TRABAJO</SectionLabel>
            <h2 id="app-difference-title" className="app-section-title">LO QUE ESTAMOS<br /> <span>EXPLORANDO.</span></h2>
            <p className="app-authority-intro">Movimiento, entrenamiento, nutrición y seguimiento dentro de un producto cuyo alcance aún está en definición.</p>
          </header>
          <div className="app-differentiators app-reveal-stagger">
            {DIFFERENTIATORS.map((item, index) => (
              <article className="app-differentiator" key={item.title} style={{ '--i': index }}>
                <span className="app-diff-number">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="app-diff-title">{item.title}</h3>
                <p className="app-diff-desc">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AppDivider />

      <section className="app-features app-section app-reveal" data-section-number="04" aria-labelledby="app-features-title">
        <AppSectionNumber>04</AppSectionNumber>
        <div className="section-shell app-section-content container">
          <header className="app-section-header app-features-header">
            <SectionLabel>04 / FUNCIONES EN EXPLORACIÓN</SectionLabel>
            <h2 id="app-features-title" className="app-section-title">POSIBLES MÓDULOS.<br /> <span>NO FUNCIONES CONFIRMADAS.</span></h2>
          </header>
          <div className="app-features-grid app-reveal-stagger" role="list" aria-label="Funciones conceptuales en evaluación para BAYONA+">
            {APP_FEATURES.map((feature, index) => (
              <article
                {...sceneBackgroundProps(
                  index < siteMedia.app.features.length - 1 ? siteMedia.app.features[index] : null,
                  {
                    className: 'app-feature-card app-feature',
                    style: { '--i': index },
                    variant: 'accent',
                    pseudo: 'after',
                  },
                )}
                key={feature.id}
                role="listitem"
              >
                {feature.id === 'anatomia-movimiento' && (
                  <button
                    type="button"
                    className="app-anatomy-trigger"
                    aria-label={feature.title}
                    aria-pressed="false"
                  />
                )}
                <span className="app-feature-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="app-feature-content">
                  <h3>{feature.title}</h3>
                  <p>{renderFeatureCopy(feature)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AppDivider />

      <section id="experiencia-bayona-plus" className="app-concept app-mockup-stage app-section app-reveal" data-section-number="05" aria-labelledby="app-experience-title">
        <AppSectionNumber>05</AppSectionNumber>
        <div
          {...sceneBackgroundProps(siteMedia.app.features[siteMedia.app.features.length - 1], {
            className: 'section-shell app-section-content container',
            variant: 'subtle',
          })}
        >
          <header className="app-section-header app-concept-heading">
            <SectionLabel>05 / MOCKUPS CONCEPTUALES</SectionLabel>
            <h2 id="app-experience-title" className="app-section-title">UNA DIRECCIÓN VISUAL<br /> <span>EN CUATRO FORMATOS.</span></h2>
            <p className="app-section-subtitle">Teléfono, escritorio, tablet y reloj ilustran una posible experiencia. No confirman dispositivos compatibles, integraciones ni funciones finales.</p>
          </header>

          <div className="app-device-stage app-mockup-container" role="group" aria-label="Mockups conceptuales de BAYONA+ en teléfono, tablet y reloj">
            <figure className="app-device app-device-phone" aria-labelledby="app-phone-caption">
              <figcaption id="app-phone-caption">
                <Smartphone size={16} strokeWidth={1} aria-hidden="true" /> TU DÍA A DÍA
              </figcaption>
              <div className="app-phone-perspective" data-phone-part="perspective">
                <span className="app-phone-depth" data-phone-part="depth" aria-hidden="true" />
                <div className="app-phone-side-controls app-phone-side-controls-left" data-phone-part="side-controls" aria-hidden="true">
                  <span data-phone-control="mute" />
                  <span data-phone-control="volume-up" />
                  <span data-phone-control="volume-down" />
                </div>
                <div className="app-phone-side-controls app-phone-side-controls-right" data-phone-part="side-controls" aria-hidden="true">
                  <span data-phone-control="power" />
                </div>
                <div className="app-phone-shell" data-phone-part="frame" aria-label="BAYONA+ para teléfono">
                  <div className="app-phone-bezel" data-phone-part="bezel">
                    <div className="app-phone-sensor" data-phone-part="camera-sensor" aria-hidden="true">
                      <span className="app-phone-camera" />
                      <span className="app-phone-speaker" />
                    </div>
                    <div className="app-device-screen app-phone-screen" data-phone-part="screen">
                      <header className="app-phone-status">
                        <p className="app-screen-brand">BAYONA+</p>
                        <span>HOY / TU PLAN</span>
                      </header>
                      <section className="app-phone-dashboard" aria-labelledby="app-phone-dashboard-title">
                        <div className="app-phone-dashboard-heading">
                          <span>TU DÍA A DÍA</span>
                          <h3 id="app-phone-dashboard-title">Tu cuerpo. Tu dirección.</h3>
                        </div>
                        <div className="app-phone-modules" role="list" aria-label="Módulos de tu día con BAYONA+">
                          {PHONE_MODULES.map((module) => (
                            <article className="app-phone-module" role="listitem" key={module.title}>
                              <h4>{module.title}</h4>
                              <strong>{module.value}</strong>
                              <span>{module.meta}</span>
                            </article>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </figure>

            <figure className="app-device app-device-tablet" aria-labelledby="app-tablet-caption">
              <figcaption id="app-tablet-caption">
                <Tablet size={16} strokeWidth={1} aria-hidden="true" /> TU SEMANA COMPLETA
              </figcaption>
              <div className="app-device-frame" aria-label="BAYONA+ para tablet">
                <div className="app-device-screen">
                  <div className="app-tablet-header">
                    <p className="app-screen-brand">BAYONA+</p>
                    <span className="app-screen-meta">SEMANA 08</span>
                  </div>
                  <h3>Todo tu progreso,<br /><em>en perspectiva.</em></h3>
                  <div className="app-tablet-track" aria-hidden="true">
                    <span>Movimiento</span><i /><span>Recuperación</span><i /><span>Hábitos</span>
                  </div>
                  <p className="app-tablet-footnote">ENTRENAMIENTO · RECUPERACIÓN · HÁBITOS</p>
                </div>
              </div>
            </figure>

            <figure className="app-device app-device-watch" aria-labelledby="app-watch-caption">
              <figcaption id="app-watch-caption">
                <Watch size={16} strokeWidth={1} aria-hidden="true" /> CONCEPTO PARA RELOJ
              </figcaption>
              <div className="app-watch-strap" aria-hidden="true" />
              <div className="app-device-frame" aria-label="Mockup conceptual de BAYONA+ para reloj">
                <div className="app-device-screen">
                  <p className="app-screen-brand">BAYONA+</p>
                  <span className="app-watch-pulse" aria-hidden="true" />
                  <strong>ESTADO —</strong>
                  <small>MÉTRICA POR DEFINIR</small>
                </div>
              </div>
            </figure>
          </div>
          <p className="app-device-caption app-mockup-caption">Representaciones conceptuales. La experiencia final, compatibilidades e integraciones aún no están confirmadas.</p>

          {/*
            Segunda composición de maqueta (comentario 41: «usar más mockups
            conceptuales, dispositivos y artefactos»). Va FUERA del collage de
            arriba porque el collage se posiciona en absoluto a partir de 760 px
            y meter un cuarto dispositivo dentro desordenaba el conjunto.
          */}
          <div className="app-device-flat" role="group" aria-label="Maqueta de escritorio y pase de acceso prioritario de BAYONA+">
            <figure className="app-device app-device-desktop" aria-labelledby="app-desktop-caption">
              <figcaption id="app-desktop-caption">
                <Monitor size={16} strokeWidth={1} aria-hidden="true" /> TU CABINA DE MANDO
              </figcaption>
              <div className="app-device-frame" aria-label="Mockup conceptual de BAYONA+ en escritorio">
                <div className="app-device-screen app-desktop-screen">
                  <div className="app-desktop-rail" aria-hidden="true">
                    <span className="app-screen-brand">BAYONA+</span>
                    <i /><i /><i /><i />
                  </div>
                  <div className="app-desktop-body">
                    <h3>Hoy: empujar.<br /><em>Mañana: recuperar.</em></h3>
                    <div className="app-desktop-cards">
                      <span>SESIÓN<strong>RAÍZ · A</strong></span>
                      <span>SUEÑO<strong>REGISTRO</strong></span>
                      <span>COMIDA<strong>BITÁCORA</strong></span>
                      <span>COACH<strong>SEGÚN PLAN</strong></span>
                    </div>
                    <p className="app-desktop-note">EJEMPLO DE INTERFAZ · SIN DATOS REALES</p>
                  </div>
                </div>
                <span className="app-desktop-stand" aria-hidden="true" />
              </div>
            </figure>

            <div className="app-pass" aria-label="Pase conceptual de acceso prioritario">
              <p className="app-pass__kind">BAYONA+ · ACCESO PRIORITARIO</p>
              <p className="app-pass__holder">NOMBRE</p>
              <div className="app-pass__row">
                <span>ESTADO</span>
                <strong>EN LISTA DE ESPERA</strong>
              </div>
              <div className="app-pass__row">
                <span>ACCESO ASIGNADO</span>
                <strong>NINGUNO</strong>
              </div>
              <div className="app-pass__code" aria-hidden="true" />
              <p className="app-pass__foot">Maqueta de un posible pase. No da acceso a nada todavía.</p>
            </div>
          </div>
        </div>
      </section>

      <AppDivider />

      <section className="app-tiers app-section app-reveal" data-section-number="06" aria-labelledby="app-tiers-title">
        <AppSectionNumber>06</AppSectionNumber>
        <div className="section-shell app-section-content container">
          <header className="app-section-header">
            <SectionLabel>06 / NIVELES PENSADOS</SectionLabel>
            <h2 id="app-tiers-title" className="app-section-title">LO QUE ENTRA<br /> <span>CON Y SIN PLAN.</span></h2>
            <p className="app-section-subtitle">
              BAYONA+ se dibuja en dos capas: una abierta para quien entrena con la web, y otra
              con funciones avanzadas para quien ya tiene un acompañamiento contratado.
            </p>
          </header>

          <div className="app-tier-grid app-reveal-stagger">
            <article className="app-tier app-tier--free">
              <p className="app-tier-kicker">SIN CONTRATAR NADA</p>
              <h3 className="app-tier-title">Acceso base</h3>
              <ul className="app-tier-list">
                {BAYONA_PLUS_FREE_TIER.map((item) => (
                  <li key={item.title}>
                    <Check size={15} strokeWidth={1.6} aria-hidden="true" />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.copy}</small>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="app-tier-foot">Esto ya funciona hoy en la web: no es una promesa de app.</p>
            </article>

            <article className="app-tier app-tier--paid">
              <p className="app-tier-kicker">FUNCIONES EN PREPARACIÓN</p>
              <h3 className="app-tier-title">Acceso de suscriptor</h3>
              <ul className="app-tier-list">
                {BAYONA_PLUS_SUBSCRIBER_TIER.map((item) => (
                  <li key={item.title}>
                    <Lock size={15} strokeWidth={1.6} aria-hidden="true" />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.copy}</small>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="app-tier-foot">
                {BAYONA_PLUS_PLAN_OPTIONS.length > 0
                  ? `Hoy el acceso anticipado está publicado como beneficio de ${BAYONA_PLUS_PLAN_OPTIONS.map((plan) => plan.name).join(' y ')}. Ninguna de estas funciones se ha entregado todavía.`
                  : 'Ninguna de estas funciones se ha entregado todavía.'}
              </p>
              <Link to="/programs" className="app-tier-link">
                VER QUÉ INCLUYE CADA PLAN
                <ArrowUpRight size={16} strokeWidth={1} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <AppDivider />

      <section className="app-founding app-section app-reveal" data-section-number="07" aria-labelledby="app-founding-title">
        <AppSectionNumber>07</AppSectionNumber>
        <div className="section-shell app-section-content container">
          <div className="app-founding-card">
            <SectionLabel>07 / ACCESO PRIORITARIO</SectionLabel>
            <h2 id="app-founding-title" className="app-founding-title">ENTRA EN<br /> <span>LA LISTA PRIORITARIA.</span></h2>
            <p className="app-founding-intro app-founding-subtitle">Es una lista corta y leída por personas: cuando haya una prueba, un cambio de alcance o una fecha real, se avisa aquí antes de publicarlo. Apuntarte no reserva plaza, no activa una compra y no garantiza acceso a una prueba.</p>
            <ol className="app-founding-benefits app-reveal-stagger">
              {FOUNDING_BENEFITS.map((benefit, index) => (
                <li className="app-founding-benefit" key={benefit.title} style={{ '--i': index }}>
                  <span className="app-founding-benefit-num">{String(index + 1).padStart(2, '0')}</span>
                  <div className="app-founding-benefit-text">
                    <strong>{benefit.title}</strong>
                    <p>{benefit.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <a
              href={WHATSAPP_EARLY_ACCESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="app-primary-cta app-founding-cta"
            >
              RECIBIR NOVEDADES
              <MessageCircle size={18} strokeWidth={1} aria-hidden="true" />
            </a>
            <p className="app-founding-scarcity">Apuntarse no cuesta nada y no compromete a nada: no hay precio fundador, cupos ni fecha de lanzamiento confirmados.</p>
            <Bridge
              compact
              hook="Mientras BAYONA+ toma forma, la comunidad abierta y la tienda sí están funcionando ahora mismo."
              free
              ctaLabel="ENTRAR A LA COMUNIDAD"
              ctaHref="/community"
              ctaSecondary
            />
          </div>
        </div>
      </section>

      <AppDivider />

      <section className="app-program-connection app-section app-reveal" data-section-number="08" aria-labelledby="app-program-connection-title">
        <AppSectionNumber>08</AppSectionNumber>
        <div className="section-shell app-section-content container">
          <SectionLabel>08 / CONEXIÓN PREVISTA</SectionLabel>
          <div className="app-program-connection-grid">
            <h2 id="app-program-connection-title" className="app-section-title">PLAN, REGISTRO<br /> <span>Y RECURSOS.</span></h2>
            <div className="app-program-connection-copy">
              <p className="app-section-subtitle">La dirección de producto es conectar los planes RAÍZ, FUERZA, RENDIMIENTO y ELITE con herramientas de seguimiento. La integración final aún no está confirmada.</p>
              <Link to="/programs" className="app-secondary-cta">
                VER PROGRAMAS ACTUALES
                <ArrowUpRight size={18} strokeWidth={1} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AppDivider />

      {/*
        ÚNICO bloque donde la página dice el estado en crudo. La frase
        «en desarrollo» ya no se repite en el hero, en la lista y en el cierre:
        el dueño lo registró como disculpa (comentarios 43-44). Aquí queda UNA
        sola mención honesta —la etiqueta de estado de arriba—, con el roadmap al
        lado y la salida real a continuación. El otro sitio donde vive la frase es
        el mensaje preescrito de WhatsApp, que exige el contrato de honestidad.
      */}
      <section className="app-final-cta app-closing app-section app-reveal" data-section-number="09" aria-labelledby="app-final-title">
        <AppSectionNumber>09</AppSectionNumber>
        <div className="section-shell app-section-content app-closing-content container">
          <SectionLabel>09 / ESTADO Y SIGUIENTE PARADA</SectionLabel>
          <p className="app-state-chip">
            <span className="app-state-chip__pulse" aria-hidden="true" />
            PRODUCTO EN DESARROLLO · VISTA PREVIA CONCEPTUAL
          </p>
          <h2 id="app-final-title" className="app-closing-title">SIGUE EL<br /> <span>DESARROLLO.</span></h2>
          <p className="app-closing-subtitle">Todavía no está disponible. Estás viendo el concepto y su orden de salida, no una app a medio instalar.</p>
          <p className="app-closing-detail">
            Lo que sí puedes hacer hoy: pedir que te avisemos cuando haya una novedad real y seguir
            entrenando con lo que ya funciona en BAYONA. Las imágenes de esta página son conceptos de
            diseño, no funciones operativas.
          </p>

          <ol className="app-status-roadmap" aria-label="Estado de las capas de BAYONA+">
            <li>
              <span className="app-status-dot is-live" aria-hidden="true" />
              <strong>EN MARCHA</strong>
              <small>Cuenta, recursos, comunidad y tienda de la web.</small>
            </li>
            <li>
              <span className="app-status-dot is-near" aria-hidden="true" />
              <strong>EN PREPARACIÓN</strong>
              <small>Mockups, criterios de lectura y el modelo de niveles.</small>
            </li>
            <li>
              <span className="app-status-dot is-later" aria-hidden="true" />
              <strong>SIN FECHA</strong>
              <small>Descarga, cuentas de app, sincronización y compatibilidades.</small>
            </li>
          </ol>

          <div className="app-final-actions app-closing-cta">
            <a
              href={WHATSAPP_EARLY_ACCESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="app-primary-cta"
            >
              RECIBIR NOVEDADES
              <MessageCircle size={18} strokeWidth={1} aria-hidden="true" />
            </a>
            <Link to="/programs" className="app-closing-program-link">
              <span>¿Quieres entrenar ahora?</span>
              <strong>VER PROGRAMAS</strong>
              <ArrowUpRight size={16} strokeWidth={1} aria-hidden="true" />
            </Link>
          </div>

          <Link to="/shop" className="app-next-stop" aria-label="Siguiente parada del recorrido: tienda BAYONA">
            <span>SIGUIENTE PARADA</span>
            <strong>TIENDA · SESIÓN, SERVICIO O EQUIPO</strong>
            <small>Elige una clase, una evaluación, una consulta o una pieza para empezar con intención.</small>
            <ArrowUpRight size={17} strokeWidth={1} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
