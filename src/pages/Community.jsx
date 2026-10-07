import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  HeartHandshake,
  Instagram,
  MessageCircle,
  Share2,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Users,
  Youtube,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import VideoSection from '../components/VideoSection.jsx'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import Glyph from '../components/social/Glyph'
import { siteMedia } from '../config/siteMedia.js'
import { whatsAppLink } from '../config/site.config.js'
import { overrides as socialOverrides, socialLinks } from '../config/social.config'
import { fetchFeed } from '../lib/social/feed'
import { resolveProfiles } from '../lib/social/platforms'
import { buildWeekPulse, pulsePanelId } from '../lib/schedule/clubPulse.js'
import '../styles/community.css'
import '../styles/community-cinematic-override.css'

const whatsappUrl = whatsAppLink('Hola BAYONA, quiero entrar a la comunidad. ¿Empezamos juntos?')

const profiles = resolveProfiles(socialLinks).map((profile) => ({
  ...profile,
  ...(socialOverrides[profile.id] ?? {}),
}))
const youtubeProfile = profiles.find(profile => profile.id === 'youtube')
const instagramProfile = profiles.find(profile => profile.id === 'instagram')
const tiktokProfile = profiles.find(profile => profile.id === 'tiktok')

const youtubeUrl = youtubeProfile?.url || 'https://youtube.com/@sevisionari'
const instagramUrl = instagramProfile?.url || 'https://instagram.com/sebasbayona'
const tiktokUrl = tiktokProfile?.url || 'https://tiktok.com/@sebasbayona'

/**
 * La pinta de cada casilla. Lo que antes marcaba `active` ahora lo decide la
 * agenda (`weekSchedule`) desde `lib/schedule/clubPulse.js`: un día es navegable
 * porque tiene panel, no porque esté pintado con un flag aparte.
 */
const weekDays = [
  { label: 'LUN', pulse: 'Dirección' },
  { label: 'MAR', pulse: 'El grupo sigue' },
  { label: 'MIÉ', pulse: 'Criterio' },
  { label: 'JUE', pulse: 'El grupo sigue' },
  { label: 'VIE', pulse: 'Acción' },
  { label: 'SÁB', pulse: 'Se entrena' },
  { label: 'DOM', pulse: 'Se descansa' },
]

/**
 * El pulso lunes-miércoles-viernes gustaba como idea pero se leía como tres
 * tarjetas sueltas. Cada día declara ahora las tres cosas que la anotación pedía:
 * el tema, lo que tú aportas y lo que recibes.
 */
const weekSchedule = [
  {
    day: 'LUNES',
    title: 'ENCENDEMOS LA SEMANA.',
    detail: 'Una consigna clara para empezar: qué entrenar, qué cuidar y cuál es la versión mínima si la semana viene difícil.',
    pulse: 'Dirección',
    theme: 'Consigna de la semana',
    shares: 'Tu punto de partida y qué puedes sostener estos siete días.',
    receives: 'Un objetivo claro y la versión mínima para no perder el hilo.',
  },
  {
    day: 'MIÉRCOLES',
    title: 'ABRIMOS CONSULTORIO.',
    detail: 'Una pregunta real se convierte en aprendizaje para todos: técnica, hábitos, comida, recuperación o mentalidad.',
    pulse: 'Criterio',
    theme: 'Consultorio abierto',
    shares: 'Tu duda concreta: técnica, comida, sueño, molestia o flojera.',
    receives: 'Una respuesta con criterio y, si hace falta, por dónde revisarlo mejor.',
  },
  {
    day: 'VIERNES',
    title: 'SALIMOS CON ACCIÓN.',
    detail: 'Un recurso simple para aplicar antes de que termine la semana: entrenar, comer mejor o revisar el proceso.',
    pulse: 'Acción',
    theme: 'Cierre con material',
    shares: 'Tu avance de la semana, con foto, vídeo o simplemente un mensaje.',
    receives: 'Un recurso para aplicar el fin de semana y una revisión de tu constancia.',
  },
]

/**
 * Franja semanal lista para pintar: cada día sabe si tiene panel y a dónde lleva.
 */
const weekPulse = buildWeekPulse(weekDays, weekSchedule)

/**
 * Niveles como piezas de club diseñadas (índice, condición de acceso y alcance
 * real), no como cards genéricas con una foto dentro. Las condiciones siguen lo
 * publicado: el grupo abierto es gratis, la prioridad y lo privado dependen de la
 * membresía, y ELITE mantiene su máximo publicado de cupos.
 */
const accessLevels = [
  {
    name: 'ABIERTO',
    tag: 'PARA TODOS',
    index: '01',
    description: 'Acceso al grupo, normas, conversaciones abiertas y recursos compartidos.',
    condition: 'GRATIS · SIN PLAN · SIN TARJETA',
    scope: ['Grupo y normas', 'Conversaciones abiertas', 'Ritmo semanal y recursos'],
    feeling: 'Ideal para conocer la cultura BAYONA antes de elegir plan.',
    icon: Users,
  },
  {
    name: 'PRIORITARIO',
    tag: 'PARA FUERZA +',
    index: '02',
    description: 'Respuesta prioritaria y seguimiento conectado con tu membresía cuando tu plan lo incluya.',
    condition: 'SEGÚN TU MEMBRESÍA',
    scope: ['Respuesta prioritaria', 'Seguimiento conectado a tu plan', 'Tus evidencias revisadas'],
    feeling: 'Para quien quiere que la comunidad acompañe un proceso real, no solo motivación.',
    icon: ShieldCheck,
  },
  {
    name: 'PRIVADO',
    tag: 'PARA ELITE',
    index: '03',
    description: 'Chat privado con Sebastián, criterio cercano y acompañamiento ELITE.',
    condition: 'EXCLUSIVO ELITE · DISPONIBILIDAD LIMITADA',
    scope: ['Chat privado con Sebastián', 'Criterio cercano y continuo', 'Acompañamiento ELITE completo'],
    feeling: 'Para quien quiere cercanía, criterio y una experiencia más privada.',
    icon: HeartHandshake,
    featured: true,
  },
]

const groupTraits = [
  {
    title: 'RESPONDE',
    detail: 'Cuando preguntas, alguien contesta. No al mes. Hoy.',
  },
  {
    title: 'EVOLUCIONA',
    detail: 'El contenido cambia cada semana. No es una biblioteca muerta.',
  },
  {
    title: 'ACOGE',
    detail: 'No hay preguntas tontas. Todos empezamos alguna vez.',
  },
]

const luxuryEase = [0.16, 1, 0.3, 1]

function getLuxuryRevealProps(index, step, reducedMotion) {
  if (reducedMotion) return { initial: false }

  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, delay: index * step, ease: luxuryEase },
  }
}

/**
 * `as` permite que el envoltorio animado sea un `<li>`: los dos bloques que
 * usan esto cuelgan de un `<ol>`, y un `div` entre lista e ítem rompe el
 * marcado. El valor por defecto deja intacto el resto de la página.
 * `...rest` viaja al nodo: los paneles del pulso se enlazan por `id` desde el
 * calendario, así que el envoltorio tiene que poder traer identidad propia.
 */
function LuxuryReveal({ as = 'div', children, className, index, reducedMotion, step = 0.08, ...rest }) {
  const Wrapper = as === 'li' ? motion.li : motion.div

  return (
    <Wrapper
      className={className}
      {...rest}
      {...getLuxuryRevealProps(index, step, reducedMotion)}
    >
      {children}
    </Wrapper>
  )
}

function formatFeedDate(value) {
  if (!value) return 'CONTENIDO RECIENTE'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'CONTENIDO RECIENTE'

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date).toUpperCase()
}

function useCommunityReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('.community-page .community-reveal, .community-page .community-stagger')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach(element => element.classList.add('visible'))
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' })

    elements.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}

function useLatestYouTube(profile) {
  const [state, setState] = useState({ loading: Boolean(profile), item: null })

  useEffect(() => {
    if (!profile) {
      setState({ loading: false, item: null })
      return undefined
    }

    const controller = new AbortController()
    fetchFeed(profile, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      setState({ loading: false, item: result.items[0] || null })
    })

    return () => controller.abort()
  }, [profile])

  return state
}

function CommunityLiveFeed() {
  const { loading, item } = useLatestYouTube(youtubeProfile)
  const youtubeTarget = item?.url || youtubeUrl

  return (
    <section
      className="community-section community-reveal community-live community-rail-section"
      data-section-number="04"
      aria-labelledby="community-live-title"
    >
      <div className="community-shell container community-section-content community-number-layer">
        <header className="community-section-header community-header" data-immersive="clip">
          <p className="community-overline community-eyebrow">BAYONA EN MOVIMIENTO</p>
          <h2 id="community-live-title" className="community-title">LO ÚLTIMO.<br /><span>EN MOVIMIENTO.</span></h2>
          <p className="community-section-subtitle community-subtitle">Esto vamos creando y compartiendo. Puedes verlo sin entrar.</p>
        </header>
      </div>

      {/*
        Raíl horizontal que sangra por el borde derecho. Antes era una rejilla de
        tres tarjetas, la misma planta que las secciones de arriba y de abajo, y
        con el mismo reveal vertical. Aquí el eje cambia: se recorre moviéndose
        hacia la derecha, que es además lo que significa «en movimiento».
        Las tarjetas conservan su CSS interno; solo cambia cómo se ordenan.
      */}
      <ul className="community-rail" tabIndex={0} aria-label="Contenido público de BAYONA. Se recorre hacia la derecha.">
        <li className="community-rail-item">
          <article className="community-live-card community-social-card">
            <div className="community-live-media community-social-thumb is-video">
              <Youtube aria-hidden="true" size={42} strokeWidth={1} />
            </div>
            <div className="community-live-body community-social-content">
              <p className="community-live-platform community-social-platform"><Youtube aria-hidden="true" size={18} /> YOUTUBE</p>
              <h3 className="community-social-title">{item?.title || 'SEVISIONARI EN YOUTUBE'}</h3>
              <p className="community-live-date">{loading ? 'CONECTANDO CON EL CANAL' : formatFeedDate(item?.date)}</p>
              <a className="community-social-link" href={youtubeTarget} target="_blank" rel="noreferrer">
                {item ? 'VER EN YOUTUBE' : 'VER CANAL DE YOUTUBE'}
                <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </div>
          </article>
        </li>

        <li className="community-rail-item">
          <article className="community-live-card community-social-card">
            <div className="community-live-media community-social-thumb is-square">
              <Instagram aria-hidden="true" size={48} strokeWidth={1} />
              <span>@sebasbayona</span>
            </div>
            <div className="community-live-body community-social-content">
              <p className="community-live-platform community-social-platform"><Instagram aria-hidden="true" size={18} /> INSTAGRAM</p>
              <h3 className="community-social-title">MOVIMIENTO QUE PUEDES VER.</h3>
              <p className="community-live-date">PERFIL OFICIAL · @sebasbayona</p>
              <a className="community-social-link" href={instagramUrl} target="_blank" rel="noreferrer">
                SEGUIR EN INSTAGRAM
                <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </div>
          </article>
        </li>

        <li className="community-rail-item">
          <article className="community-live-card community-social-card">
            <div className="community-live-media community-social-thumb is-square">
              <Glyph name="tiktok" size={48} />
              <span>@sebasbayona</span>
            </div>
            <div className="community-live-body community-social-content">
              <p className="community-live-platform community-social-platform"><Glyph name="tiktok" size={18} /> TIKTOK</p>
              <h3 className="community-social-title">PARKOUR, BIOHACKING Y VIDA REAL.</h3>
              <p className="community-live-date">PERFIL OFICIAL · @sebasbayona</p>
              <a className="community-social-link" href={tiktokUrl} target="_blank" rel="noreferrer">
                VER EN TIKTOK
                <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </div>
          </article>
        </li>
      </ul>
      <div className="community-shell container">
        <p className="community-marketing-line is-mono community-live-note">ESTO VA CRECIENDO. LO QUE VES ES LO QUE COMPARTIMOS.</p>
      </div>
    </section>
  )
}

export default function Community() {
  useCommunityReveal()
  const reducedMotion = useReducedMotion()
  const [showFloatingJoin, setShowFloatingJoin] = useState(false)

  useEffect(() => {
    const updateFloatingJoin = () => {
      const isMobile = window.innerWidth <= 768
      setShowFloatingJoin(isMobile && window.scrollY > window.innerHeight * 0.8)
    }

    updateFloatingJoin()
    window.addEventListener('scroll', updateFloatingJoin, { passive: true })
    window.addEventListener('resize', updateFloatingJoin)

    return () => {
      window.removeEventListener('scroll', updateFloatingJoin)
      window.removeEventListener('resize', updateFloatingJoin)
    }
  }, [])

  /**
   * Navegación del pulso: el día del calendario lleva a su panel. Se baja con
   * `scrollIntoView` y se devuelve el foco, que es lo que convierte un salto de
   * ancla en una navegación real para quien viene de teclado.
   */
  const goToPulseDay = (panelId) => {
    const panel = document.getElementById(panelId)
    if (!panel) return

    panel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
    panel.focus({ preventScroll: true })
  }

  return (
    <div className="community-page">
      {/*
        El hero estaba centrado: titular, dos botones y una lista encima de la
        foto, que es justo la planta que la anotación rechazó («el hero centrado
        no convence»). Aquí la composición se abre en dos: la promesa a la
        izquierda y, a la derecha, la pieza que sostiene la entrada gratuita —
        un pase de socio dibujado, no una foto metida en una caja. La imagen
        humana grande sigue de fondo, a sangre, con el degradado integrándola.
      */}
      <section
        {...sceneBackgroundProps(siteMedia.community.hero, {
          className: 'community-hero community-hero--club',
          variant: 'hero',
          pseudo: 'after',
          motion: true,
        })}
        aria-labelledby="community-title"
      >
        <div className="community-hero-club-grid">
          <div className="community-hero-copy">
            <p className="community-kicker">BAYONA COMMUNITY · CLUB ABIERTO</p>
            <h1 id="community-title" className="community-hero-title">
              <span>ENTRENAMOS JUNTOS.</span>
              <strong>COMPARTIMOS EL PROCESO.</strong>
            </h1>
            <p className="community-hero-subtitle">
              Un club abierto para entrenar con más contexto: preguntas, recursos, ritmo semanal y gente moviéndose en la misma dirección. Entras sin comprar nada.
            </p>
            <div className="community-hero-actions community-hero-cta">
              <a className="community-button community-button-primary" href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" size={20} />
                ENTRA AL GRUPO GRATIS
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>
              <a className="community-text-link" href="#semana">
                VER EL PULSO SEMANAL
                <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </div>
            <p className="community-hero-note">
              LEE LAS NORMAS DEL GRUPO ANTES DE PARTICIPAR · SEGUIMIENTO INDIVIDUAL SEGÚN TU PLAN
            </p>
          </div>

          <aside className="community-hero-side">
            <div className="community-pass" aria-label="Pase de entrada a la comunidad BAYONA">
              <div className="community-pass-top">
                <span>BAYONA · PASE DE SOCIO</span>
                <span aria-hidden="true">Nº 001</span>
              </div>
              <div className="community-pass-body">
                <strong>ENTRADA</strong>
                <em>GRATUITA</em>
              </div>
              <ul className="community-pass-terms">
                <li><span>PAGO</span><strong>NINGUNO</strong></li>
                <li><span>REQUISITO</span><strong>SIN PLAN</strong></li>
                <li><span>VÁLIDO</span><strong>LUN · MIÉ · VIE</strong></li>
              </ul>
              <div className="community-pass-perf" aria-hidden="true" />
              <p className="community-pass-foot">SE PIDE POR WHATSAPP · SIN FORMULARIOS</p>
            </div>

            <ul className="community-hero-pass" aria-label="Qué encuentras dentro de la comunidad">
              <li><span>01</span><strong>Preguntas reales</strong><small>Respondidas con criterio</small></li>
              <li><span>02</span><strong>Ritmo semanal</strong><small>Dirección, criterio y acción</small></li>
              <li><span>03</span><strong>Recursos vivos</strong><small>No biblioteca muerta</small></li>
            </ul>
          </aside>
        </div>
        <a className="community-scroll-indicator" href="#por-que" aria-label="Ir a la comunidad BAYONA">
          <span aria-hidden="true" />
          <ChevronDown aria-hidden="true" size={15} strokeWidth={1} />
        </a>
      </section>

      <section className="community-section community-reveal community-why" data-section-number="01" id="por-que" aria-labelledby="community-why-title">
        <div className="community-shell container community-section-content community-number-layer">
          {/*
            La sección afirmaba algo sobre dos trayectorias y no tenía más
            prueba que párrafos. Aquí la figura es el argumento: se pinta antes
            que el texto porque es lo primero que hay que leer.
          */}
          <svg
            className="community-figure community-figure--why"
            viewBox="0 0 640 160"
            role="img"
            aria-label="Dos trayectorias desde el mismo arranque: la que se hace sola se apaga; la acompañada llega hasta un nodo cerrado."
          >
            <g className="community-why-solo">
              <line x1="28" y1="80" x2="110" y2="64" opacity="1" />
              <line x1="110" y1="64" x2="192" y2="54" opacity="0.62" />
              <line x1="192" y1="54" x2="274" y2="50" opacity="0.36" />
              <line x1="274" y1="50" x2="356" y2="52" opacity="0.18" />
              <circle className="community-why-hollow" cx="372" cy="53" r="7" />
              <text className="community-figure-label" x="390" y="58">SE APAGA</text>
            </g>
            <g className="community-why-juntos">
              <polyline points="28,80 110,96 192,106 274,110 356,108 438,104 520,100" />
              {[110, 192, 274, 356, 438].map((x, i) => (
                <circle
                  key={`nodo-${x}`}
                  cx={x}
                  cy={[96, 106, 110, 108, 104][i]}
                  r="4"
                  className="community-why-node"
                />
              ))}
              <polygon className="community-why-hex" points="543,99 549.5,88 562.5,88 569,99 562.5,110 549.5,110" />
              <text className="community-figure-label" x="356" y="136">NUNCA SE HACE SOLO</text>
            </g>
          </svg>
          <header className="community-section-header community-header" data-immersive="clip">
            <p className="community-overline community-eyebrow">POR QUÉ EXISTIMOS</p>
            <h2 id="community-why-title" className="community-title">LA MAYORÍA NO ABANDONA POR<br /><span>FALTA DE INFORMACIÓN.</span></h2>
            <p className="community-section-subtitle community-subtitle">
              Información y ganas sobran. Lo que falta es alguien al lado. Eso somos aquí.
            </p>
          </header>

          <ol className="community-identity-points community-why-list community-stagger">
            <li className="community-why-item" style={{ '--i': 0 }}>
              <div><strong className="community-why-text">AQUÍ ERES PARTE.</strong><p>No un número. Parte de algo que se mueve.</p></div>
            </li>
            <li className="community-why-item" style={{ '--i': 1 }}>
              <div><strong className="community-why-text">AQUÍ AVANZAMOS.</strong><p>Con otros. Nunca mirando desde fuera.</p></div>
            </li>
            <li className="community-why-item" style={{ '--i': 2 }}>
              <div><strong className="community-why-text">AQUÍ HAY PERSONAS.</strong><p>Reales. Como tú. Con las mismas dudas.</p></div>
            </li>
          </ol>
          <p className="community-founder-note">Yo también entrené solo años. La diferencia entre seguir y abandonar casi siempre es tener a alguien al lado.</p>
          <p className="community-marketing-line is-italic community-founder-closure">Eso es lo que construimos aquí.</p>
          <p className="community-movement-line">Más que un grupo de WhatsApp: un MOVIMIENTO.</p>
        </div>
      </section>





      <section className="community-section community-reveal community-week" data-section-number="02" id="semana" aria-labelledby="community-week-title">
        <div className="community-shell container community-section-content community-number-layer">
          <header className="community-section-header community-header" data-immersive="clip">
            <p className="community-overline community-eyebrow"><CalendarDays aria-hidden="true" size={17} /> EL PULSO</p>
            <h2 id="community-week-title" className="community-title">TRES MOMENTOS.<br /><span>UN MISMO PULSO.</span></h2>
            <p className="community-section-subtitle community-subtitle">La semana entera sobre la mesa: tres días con cita, los demás el grupo sigue solo. Cada día dice qué se comparte y qué recibes.</p>
          </header>

          {/*
            El «lunes, miércoles, viernes» era una línea y tres tarjetas sueltas.
            Ahora es un calendario: la franja de siete días marca los tres con
            cita, y cada panel desarrolla tema, aporte y retorno. El sistema se
            lee de arriba abajo sin tener que adivinar qué pasa cada día.
            Los días con agenda son piezas navegables (botón → su panel); los que
            no la tienen se quedan como texto, porque no hay a dónde llevarlos.
          */}
          <div className="community-pulse" aria-label="Calendario semanal de la comunidad BAYONA">
            <div className="community-calendar-week">
              <div className="community-calendar-week-head">
                <span>SEMANA BAYONA</span>
                <strong>3 DÍAS CON CITA · 7 DÍAS DE GRUPO</strong>
              </div>
              <ol>
                {weekPulse.map((day) => (
                  <li key={day.label} className={day.hasAgenda ? 'is-active' : ''}>
                    {day.hasAgenda ? (
                      <button
                        type="button"
                        className="community-calendar-day community-calendar-link"
                        aria-controls={day.panelId}
                        onClick={() => goToPulseDay(day.panelId)}
                      >
                        {day.label}
                      </button>
                    ) : (
                      <span className="community-calendar-day">{day.label}</span>
                    )}
                    <span className="community-calendar-dot" aria-hidden="true" />
                    <span className="community-calendar-pulse">{day.pulse}</span>
                    <span className="community-visually-hidden">
                      {day.hasAgenda ? 'Día con agenda: abre su panel' : 'Sin agenda esta semana'}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <ol className="community-calendar-panels">
              {weekSchedule.map((item, index) => (
                <LuxuryReveal
                  as="li"
                  className="community-calendar-panel"
                  id={pulsePanelId(item.day)}
                  tabIndex={-1}
                  index={index}
                  key={item.day}
                  reducedMotion={reducedMotion}
                  step={0.1}
                >
                    <div className="community-calendar-panel-head">
                      <span className="community-calendar-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <span className="community-day-label">{item.day}</span>
                        <h3 className="community-day-title">{item.title}</h3>
                      </div>
                      <span className="community-calendar-tag">{item.pulse}</span>
                    </div>
                    <dl className="community-calendar-rows">
                      <div>
                        <dt>TEMA</dt>
                        <dd>{item.theme}</dd>
                      </div>
                      <div>
                        <dt>COMPARTE</dt>
                        <dd>{item.shares}</dd>
                      </div>
                      <div>
                        <dt>RECIBE</dt>
                        <dd>{item.receives}</dd>
                      </div>
                    </dl>
                    <p className="community-calendar-note">{item.detail}</p>
                </LuxuryReveal>
              ))}
            </ol>
          </div>
          <p className="community-marketing-line is-mono community-week-momentum">ENTRENAMOS, COMPARTIMOS Y SEGUIMOS. ESE ES EL RITMO.</p>
          <p className="community-week-note">Los demás días: entrenamos, descansamos, preguntamos y compartimos avances. Sin presión, sin ruido.</p>
        </div>
      </section>

      <section className="community-section community-reveal community-access" data-section-number="03" aria-labelledby="community-access-title">
        <div className="community-shell container community-section-content community-number-layer">
          {/*
            «Tres niveles, un mismo espíritu» se leía mejor en una diana que en
            tres tarjetas: el centro es común, lo que cambia es el radio.
          */}
          <svg
            className="community-figure community-figure--niveles"
            viewBox="0 0 340 210"
            role="img"
            aria-label="Tres anillos alrededor del mismo centro: el espíritu es común, lo que cambia es hasta dónde llega el acompañamiento."
          >
            {accessLevels.map((level, index) => {
              const radio = 34 + index * 30
              // Un tercio de vuelta por nivel: si los tres nodos compartieran
              // ángulo, cada rótulo caería encima del anillo siguiente.
              const angulo = ((-90 + index * 132) * Math.PI) / 180
              const cos = Math.cos(angulo)
              const sen = Math.sin(angulo)
              const x = 170 + radio * cos
              const y = 105 + radio * sen
              const lateral = Math.abs(cos) < 0.35
              return (
                <g className="community-orbit" key={`orbita-${level.name}`} style={{ '--i': index }}>
                  <circle className="community-orbit-ring" cx="170" cy="105" r={radio} />
                  <circle className="community-orbit-node" cx={x} cy={y} r="5" />
                  <text
                    className="community-figure-label"
                    x={lateral ? x : x + (cos > 0 ? 12 : -12)}
                    y={lateral ? y - 14 : y + 5}
                    textAnchor={lateral ? 'middle' : cos > 0 ? 'start' : 'end'}
                  >
                    {level.name}
                  </text>
                </g>
              )
            })}
            <circle className="community-orbit-core" cx="170" cy="105" r="9" />
          </svg>
          <header className="community-section-header community-header" data-immersive="clip">
            <p className="community-overline community-eyebrow">DÓNDE ESTÁS TÚ</p>
            <h2 id="community-access-title" className="community-title">TRES NIVELES.<br /><span>UN MISMO ESPÍRITU.</span></h2>
            <p className="community-section-subtitle community-subtitle">Aquí cabemos todos. Lo que cambia no es el espíritu: cambia la cercanía, prioridad y profundidad del acompañamiento.</p>
          </header>

          {/*
            Antes: tres `lux-card` con una foto de fondo cada una, cuatro líneas
            de texto y una etiqueta. La anotación pedía tarjetas de nivel
            diseñadas, no cards con imagen dentro. Aquí la pieza se construye:
            banda de índice, nombre grande, alcance en tres líneas, condición de
            acceso abajo sellada, y una llave de club recortada en el borde.
            Ninguna lleva foto: la foto grande ya está en el hero y en la escena.
          */}
          <ol className="community-tier-ladder">
            {accessLevels.map((level, index) => {
              const LevelIcon = level.icon
              const tierClass = level.name.toLowerCase()
              return (
                <LuxuryReveal
                  as="li"
                  className={`community-tier-card community-tier ${tierClass}${level.featured ? ' is-elite elite' : ''}`}
                  index={index}
                  key={level.name}
                  reducedMotion={reducedMotion}
                  step={0.1}
                >
                  <header className="community-tier-head">
                    <span className="community-tier-index">NIVEL {level.index}</span>
                    <span className="community-tier-tag">{level.tag}</span>
                  </header>

                  <div className="community-tier-keyline" aria-hidden="true">
                    <span />
                    <LevelIcon size={18} strokeWidth={1.2} />
                    <span />
                  </div>

                  <h3 className="community-tier-name">{level.name}</h3>
                  <p className="community-tier-desc">{level.description}</p>

                  <ul className="community-tier-scope" aria-label={`Qué incluye el nivel ${level.name}`}>
                    {level.scope.map((item) => (
                      <li key={item}>
                        <Check aria-hidden="true" size={14} strokeWidth={1.6} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="community-tier-feeling">
                    <span className="community-tier-feeling-label">ALCANCE:</span>
                    <span className="community-tier-feeling-quote">{level.feeling}</span>
                  </div>

                  <footer className="community-tier-condition">
                    {level.featured && <span className="community-tier-badge">ELITE</span>}
                    <strong>{level.condition}</strong>
                  </footer>
                </LuxuryReveal>
              )
            })}
          </ol>
          <p className="community-marketing-line is-italic community-tier-access-note">El grupo es gratis. Lo que cambia es cuánto nos acercamos.</p>
          <Link to="/programs" className="community-inline-link">¿VEMOS TU NIVEL? · SERVICIOS<ArrowUpRight aria-hidden="true" size={16} /></Link>
        </div>
      </section>



      <CommunityLiveFeed />

      <section
        {...sceneBackgroundProps(siteMedia.community.group, {
          className: 'community-section community-reveal community-group',
          variant: 'subtle',
          pseudo: 'after',
        })}
        data-section-number="05"
        aria-labelledby="community-group-title"
      >
        <div className="community-shell container community-section-content community-number-layer">
          <header className="community-section-header community-header is-centered" data-immersive="clip">
            <p className="community-overline community-eyebrow">EL GRUPO</p>
            <h2 id="community-group-title" className="community-title">CONVERSACIÓN,<br /><span>RECURSOS Y PRÁCTICA.</span></h2>
            <p className="community-section-subtitle community-subtitle">Compartimos preguntas y recursos. El seguimiento individual lo elegimos juntos.</p>
          </header>

          <VideoSection
            title="CÓMO FUNCIONA LA COMUNIDAD"
            subtitle="Sebastián presenta el propósito del grupo y sus normas."
            poster={siteMedia.community.group.src}
            duration="2 MIN"
            placement="contained"
          />

          <div className="community-group-traits community-stagger">
            {groupTraits.map((trait, index) => (
              <article key={trait.title} style={{ '--i': index }}>
                <h3>{trait.title}</h3>
                <p>{trait.detail}</p>
              </article>
            ))}
          </div>

          <details className="community-chat-details">
            <summary>¿CÓMO SE VE UN DÍA TÍPICO?<ChevronDown aria-hidden="true" size={17} /></summary>
            <div className="community-chat community-chat-preview" aria-label="Vista conceptual de una conversación en la comunidad">
              <div className="community-chat-header">
                <span className="community-chat-avatar">B</span>
                <div className="community-chat-headinfo">
                  <span className="community-chat-name">BAYONA · COMUNIDAD</span>
                  <span className="community-chat-status">● ACTIVO AHORA</span>
                </div>
              </div>

              <div className="community-chat-bubble member">
                <span className="community-chat-author">ANDREA</span>
                <span className="community-chat-text">Hoy no me apetece entrenar. ¿Voy igual?</span>
              </div>

              <div className="community-chat-bubble sebastian">
                <span className="community-chat-author">SEBASTIÁN</span>
                <span className="community-chat-text">Vamos. Bajamos la carga y hacemos la mitad. Empezar ya es ganar.</span>
              </div>

              <div className="community-chat-bubble member">
                <span className="community-chat-author">CARLOS</span>
                <span className="community-chat-text">A mí me pasó el martes. Al final fue la mejor sesión de la semana.</span>
              </div>
            </div>
            <p className="community-chat-caption">Así hablamos dentro.</p>
          </details>
          <aside className="community-mid-join community-reveal" aria-label="Unirse a la comunidad BAYONA">
            <p className="community-mid-join-label">¿ENTRAMOS?</p>
            <a className="community-button community-button-primary community-mid-join-button" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" size={20} />
              ENTRAMOS AHORA
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
          </aside>
        </div>
      </section>



      {/*
        Esta sección no cierra la página —eso lo hacen «PÁSALO» y la firma del
        pie—: entrega a dos sitios. La foto que le puse primero no se veía (el
        asset no carga en local), así que la horquilla se dibuja: un camino que
        se abre en dos salidas, que es literalmente lo que dice el texto de
        abajo. Planta PUENTE por composición, no por etiqueta.
      */}
      <section className="community-section community-reveal community-closing community-bridge" data-section-number="06" aria-labelledby="community-closing-title">
        <div className="community-shell container community-section-content community-number-layer">
          <svg
            className="community-bridge-horquilla"
            viewBox="0 0 640 150"
            role="img"
            aria-label="Un camino que se abre en dos salidas: entrar al grupo por WhatsApp, o comparar los cuatro planes."
          >
            <path className="community-horquilla-tallo" d="M12 75 H212" />
            <path className="community-horquilla-rama" d="M212 75 C 330 75, 356 26, 468 26" />
            <path className="community-horquilla-rama" d="M212 75 C 330 75, 356 124, 468 124" />
            <polygon className="community-horquilla-punta" points="468,17 492,26 468,35" />
            <polygon className="community-horquilla-punta" points="468,115 492,124 468,133" />
            <text className="community-figure-label" x="504" y="31">AL GRUPO</text>
            <text className="community-figure-label" x="504" y="129">A LOS PLANES</text>
          </svg>
          <p className="community-overline community-eyebrow">SIGUIENTE PASO</p>
          <h2 id="community-closing-title" className="community-title">CONOZCAMOS EL GRUPO<br /><span>ANTES DE ELEGIR PLAN.</span></h2>
          <p className="community-closing-pressure">Entrar es gratis.</p>
          <p className="community-section-subtitle community-subtitle">Pide las normas y el enlace por WhatsApp. Si quieres seguimiento, vemos juntos el plan.</p>
          <div className="community-closing-actions">
            <a className="community-button community-button-primary" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" size={20} />ENTRA AL GRUPO GRATIS<ArrowUpRight aria-hidden="true" size={18} /></a>
            <Link to="/programs" className="community-button community-button-secondary">VER SERVICIOS<ArrowUpRight aria-hidden="true" size={18} /></Link>
          </div>
        </div>
      </section>

      <footer className="community-footer-note" aria-label="Nota sobre la comunidad BAYONA">
        <p className="community-shell">La comunidad BAYONA es un espacio abierto. Aquí entrenamos, preguntamos y compartimos.</p>
        <p className="community-shell community-final-signature">ENTRENAMOS CON CRITERIO. COMPARTIMOS CON RESPETO. — BAYONA</p>
      </footer>

      <div
        className={`community-join-floating${showFloatingJoin ? ' show' : ''}`}
        aria-hidden={!showFloatingJoin}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          tabIndex={showFloatingJoin ? undefined : -1}
        >
          ENTRAMOS
        </a>
      </div>
    </div>
  )
}
