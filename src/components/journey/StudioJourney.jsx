import { useEffect, useRef, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { bookingLink } from '../../config/site.config.js'
import { trackEvent } from '../../lib/analytics/analytics.js'
import './guided-journey.css'

/**
 * Editorial visitor journey. Each step is an actual public route, not a simulated
 * mission or a conversion gate. People can jump to any chapter or contact us now.
 * Progress means "reached the bottom of this chapter", not "paid" or "joined".
 */
export const STUDIO_JOURNEY = Object.freeze([
  {
    href: '/',
    title: 'El Estudio',
    eyebrow: 'El punto de partida',
    prompt: 'Descubre qué mueve este proyecto.',
    transition: 'Para entender un método, empieza por conocer a la persona que lo construye.',
  },
  {
    href: '/about',
    title: 'La Historia',
    action: 'CONOCER LA HISTORIA',
    eyebrow: 'La persona detrás del método',
    prompt: 'Conoce la filosofía y el origen.',
    transition: 'Ya conoces la historia. Ahora descubre cómo se convierte en acompañamiento real.',
  },
  {
    href: '/programs',
    title: 'Experiencias',
    action: 'EXPLORAR EXPERIENCIAS',
    eyebrow: 'Elige tu forma de evolucionar',
    prompt: 'Descubre opciones de entrenamiento.',
    transition: 'Hay muchas maneras de entrenar. Una de ellas empieza por aprender a leer el espacio.',
  },
  {
    href: '/parkour-academy',
    title: 'Parkour Lab',
    action: 'DESCUBRIR PARKOUR LAB',
    eyebrow: 'Movimiento sin límites',
    prompt: 'Explora técnica, control y adaptación.',
    transition: 'El movimiento también une. Conoce a las personas que forman parte de este universo.',
  },
  {
    href: '/community',
    title: 'El Círculo',
    action: 'ENTRAR EN EL CÍRCULO',
    eyebrow: 'Personas, no espectadores',
    prompt: 'Descubre la comunidad.',
    transition: 'La evolución no sucede solo durante una sesión. Descubre la parte digital del estudio.',
  },
  {
    href: '/app',
    title: 'SB+',
    action: 'DESCUBRIR SB+',
    eyebrow: 'Tu espacio digital',
    prompt: 'Conoce el acceso para atleta y coach.',
    transition: 'La tecnología acompaña el entrenamiento. La colección reúne objetos para moverte a tu manera.',
  },
  {
    href: '/shop',
    title: 'La Colección',
    action: 'VISITAR LA COLECCIÓN',
    eyebrow: 'El movimiento también se lleva',
    prompt: 'Explora piezas y consulta disponibilidad.',
    transition: 'Una buena decisión empieza por entender lo que haces. Abre el conocimiento del estudio.',
  },
  {
    href: '/resources',
    title: 'La Biblioteca',
    action: 'ABRIR LA BIBLIOTECA',
    eyebrow: 'Aprender para avanzar',
    prompt: 'Encuentra recursos de acceso abierto.',
    transition: 'Ya conoces el universo del estudio. Resolvamos las preguntas antes de dar el siguiente paso.',
  },
  {
    href: '/faq',
    title: 'Respuestas',
    action: 'RESOLVER MIS DUDAS',
    eyebrow: 'Lo esencial, sin dudas',
    prompt: 'Aclara el proceso antes de empezar.',
    transition: 'Ya conoces las nueve paradas. Ahora podemos hablar de lo que necesitas tú.',
  },
])

const STORAGE_KEY = 'sb:studio-journey:v1'
const CHANGE_EVENT = 'sb:studio-journey-progress'
const contactUrl = bookingLink('Hola Sebastián. He recorrido la web SEBASTIAN BAYONA. Quiero contarte mi objetivo y recibir orientación para empezar.')

function readCompleted() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(value)) return []
    const allowed = new Set(STUDIO_JOURNEY.map(({ href }) => href))
    return [...new Set(value.filter((href) => allowed.has(href)))]
  } catch {
    return []
  }
}

function markCompleted(href) {
  const next = [...new Set([...readCompleted(), href])]
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Browsing still works with storage disabled.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function useCompleted() {
  const [completed, setCompleted] = useState(readCompleted)
  useEffect(() => {
    const update = () => setCompleted(readCompleted())
    window.addEventListener(CHANGE_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(CHANGE_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])
  return completed
}

function useCurrentStep() {
  const { pathname } = useLocation()
  const index = STUDIO_JOURNEY.findIndex(({ href }) => href === pathname)
  return { index, step: STUDIO_JOURNEY[index], next: STUDIO_JOURNEY[index + 1] }
}

function recordNavigation(from, to, source) {
  trackEvent('studio_journey_continue', { from, to, source })
}

function JourneyMap({ current, completed, source = 'map' }) {
  return (
    <ol className="sj-map" aria-label="Todas las etapas del recorrido">
      {STUDIO_JOURNEY.map((chapter, index) => {
        const isCurrent = chapter.href === current
        const isCompleted = completed.includes(chapter.href)
        return (
          <li key={chapter.href} className={`sj-map__item${isCurrent ? ' is-current' : ''}${isCompleted ? ' is-completed' : ''}`}>
            <Link
              to={chapter.href}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => recordNavigation(current, chapter.href, source)}
              title={chapter.prompt}
            >
              <span className="sj-map__number">{isCompleted ? <Check size={13} aria-label="Etapa recorrida" /> : String(index + 1).padStart(2, '0')}</span>
              <span className="sj-map__title">{chapter.title}</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

/** Navigation strip above the content, with an optional complete route map. */
export function StudioJourneyHeader() {
  const { pathname } = useLocation()
  const { index, step, next } = useCurrentStep()
  const completed = useCompleted()
  if (!step) return null
  const number = String(index + 1).padStart(2, '0')
  const progress = Math.round((completed.length / STUDIO_JOURNEY.length) * 100)

  return (
    <nav className="sj-header" aria-label="Recorrido guiado del estudio">
      <div className="sj-header__row">
        <span className="sj-header__signature">SEBASTIAN BAYONA <span aria-hidden="true">/</span> RECORRIDO</span>
        <span className="sj-header__chapter">ETAPA {number} <span aria-hidden="true">/</span> 09 <b>{step.title}</b></span>
        {next ? (
          <Link className="sj-header__next" to={next.href} onClick={() => recordNavigation(step.href, next.href, 'header')}>
            SIGUIENTE: {next.title} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ) : (
          <Link className="sj-header__next" to="/checkout" onClick={() => recordNavigation(step.href, '/checkout', 'header')}>
            SOLICITAR PROPUESTA <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="sj-header__line" role="progressbar" aria-label="Etapas exploradas" aria-valuenow={completed.length} aria-valuemin={0} aria-valuemax={STUDIO_JOURNEY.length}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <details key={pathname} className="sj-header__details">
        <summary>VER LAS 9 ETAPAS <ChevronDown size={15} aria-hidden="true" /> <small>{completed.length} EXPLORADAS</small></summary>
        <div className="sj-header__details-content">
          <div className="sj-header__details-heading">
            <p>UN RECORRIDO, UNA SOLA HISTORIA.</p>
            <span>Descubre cada espacio en orden o elige directamente lo que te interesa.</span>
          </div>
          <JourneyMap current={pathname} completed={completed} source="top_map" />
        </div>
      </details>
    </nav>
  )
}

/** At the end of a chapter, explain why the next one matters and make it actionable. */
export function StudioJourneyOutro() {
  const { pathname } = useLocation()
  const { index, step, next } = useCurrentStep()
  const completed = useCompleted()
  const sectionRef = useRef(null)

  useEffect(() => {
    if (!step || !sectionRef.current || typeof IntersectionObserver === 'undefined') return undefined
    let marked = false
    const observer = new IntersectionObserver((entries) => {
      if (marked || !entries.some((entry) => entry.isIntersecting)) return
      marked = true
      markCompleted(step.href)
      trackEvent('studio_journey_chapter_read', { chapter: step.href })
      observer.disconnect()
    }, { threshold: 0.12 })
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [step])

  if (!step) return null
  const isLast = !next
  return (
    <section className="sj-outro" ref={sectionRef} aria-labelledby="sj-outro-heading">
      <div className="sj-outro__inner">
        <div className="sj-outro__chapter-label">
          <span>CAPÍTULO {String(index + 1).padStart(2, '0')} / 09</span>
          <span>SEBASTIAN BAYONA — PERSONAL STUDIO</span>
        </div>
        <div className="sj-outro__main">
          <div className="sj-outro__text">
            <p className="sj-outro__eyebrow">{isLast ? 'EL SIGUIENTE PASO ES TUYO' : 'TU RECORRIDO CONTINÚA'}</p>
            <h2 id="sj-outro-heading">{isLast ? <>ES TU MOMENTO.<br /><em>HABLEMOS.</em></> : <>HAY MÁS POR<br /><em>DESCUBRIR.</em></>}</h2>
            <p>{step.transition}</p>
          </div>
          <div className="sj-outro__action">
            <span className="sj-outro__action-label">{isLast ? 'ELIGE CÓMO EMPEZAR' : `SIGUIENTE DESTINO — ${String(index + 2).padStart(2, '0')} / 09`}</span>
            <h3>{isLast ? 'Tu experiencia empieza contigo.' : next.title}</h3>
            <p>{isLast ? 'Cuéntame qué quieres conseguir. Revisaremos las opciones antes de cualquier compromiso.' : next.prompt}</p>
            <Link className="sj-outro__primary" to={isLast ? '/checkout' : next.href} onClick={() => recordNavigation(step.href, isLast ? '/checkout' : next.href, 'outro')}>
              {isLast ? 'PREPARAR MI PROPUESTA' : next.action} <ArrowUpRight size={19} strokeWidth={1.6} aria-hidden="true" />
            </Link>
            <a className="sj-outro__secondary" href={contactUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('studio_journey_contact', { chapter: step.href })}>
              PREFIERO HABLAR AHORA <ArrowRight size={17} aria-hidden="true" />
            </a>
            <small>Sin pagos automáticos. La solicitud no te compromete a contratar.</small>
          </div>
        </div>
        <div className="sj-outro__all">
          <div className="sj-outro__all-heading">
            <span>TODA LA EXPERIENCIA</span>
            <span>{completed.length} DE 9 ETAPAS EXPLORADAS <ArrowDownRight size={14} aria-hidden="true" /></span>
          </div>
          <JourneyMap current={pathname} completed={completed} source="outro_map" />
        </div>
      </div>
    </section>
  )
}
