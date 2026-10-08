import { Fragment, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Menu, Moon, ShoppingCart, Sun, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { socialLinks } from '../config/social.config'
import { whatsAppLink } from '../config/site.config.js'
import { resolveProfiles } from '../lib/social/platforms'
import { selectCartCount, useCartStore } from '../store/cartStore.js'
import { prefetchRoute } from '../lib/perf/routePrefetch.js'
import { applySiteTheme, readSiteTheme, SITE_THEME_KEY } from '../lib/ui/siteTheme.js'
// ÍTEM 1 (perf): CartDrawer (vaul) fuera del entry — el drawer está cerrado en
// el primer pintado, así que va con lazy + Suspense fallback null.
const CartDrawer = lazy(() => import('./cart/CartDrawer.jsx'))
// ÍTEM 2 (perf): Toaster (sonner) fuera del entry — montaje diferido con lazy
// + fallback null. Los toasts de Programs/Shop (toast.success desde 'sonner')
// siguen funcionando: el Toaster se monta en paralelo tras el primer pintado.
const Toaster = lazy(() => import('sonner').then((module) => ({ default: module.Toaster })))
const SceneMount = lazy(() =>
  import('../engine/scene/SceneMount.jsx').then((module) => ({ default: module.SceneMount })),
)
import { sceneBackgroundProps } from './SceneBackground.jsx'
import Glyph from './social/Glyph'
// Import DIRECTO del primitivo (no el barrel), mismo criterio que arriba.
import { TextMask } from '../engine/motion/TextMask.jsx'
// Import DIRECTO del hook (no el barrel): magnetismo del CTA compartido.
import { useMagnetic } from '../engine/hooks/useMagnetic.js'
import '../styles/gym-funnel-v2.css'

const MotionLink = motion.create(Link)

/**
 * Arquitectura de navegación (Fase 4).
 *
 * La barra anterior listaba 10 destinos planos con un `slice` frágil y un CTA
 * que llevaba a comprar (/programs). Ahora la navegación declara la estructura
 * real del sitio: cuatro grupos por intención + una sola entrada a recepción.
 *
 * · RECORRIDO   — la casa se lee de izquierda a derecha.
 * · ENTRENAR    — programas y academia.
 * · ECOSISTEMA  — comunidad, BAYONA+ y tienda.
 * · DECIDIR     — recursos, FAQ y cuenta.
 *
 * Inicio no se repite como enlace de escritorio: la marca ya es el enlace al
 * inicio. En móvil sí aparece explícito y numerado.
 */
const NAV_ITEMS = Object.freeze([
  { label: 'Servicios', href: '/programs' },
  { label: 'Parkour', href: '/parkour-academy' },
  { label: 'Tienda', href: '/shop' },
  { label: 'Recursos', href: '/resources' },
  { label: 'Nosotros', href: '/about' },
])

const MOBILE_NAV_ITEMS = Object.freeze([
  { label: 'Inicio', href: '/' },
  ...NAV_ITEMS,
])

export function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [siteTheme, setSiteTheme] = useState(readSiteTheme)
  const cartCount = useCartStore(selectCartCount)
  const shopContext = pathname === '/shop' || pathname.startsWith('/shop/')
  const cartOpen = useCartStore((state) => state.isOpen)
  const setCartOpen = useCartStore((state) => state.setOpen)
  const menuButtonRef = useRef(null)
  const mobileNavRef = useRef(null)
  const close = () => setOpen(false)
  const openCart = () => {
    if (!open) {
      setCartOpen(true)
      return
    }

    setOpen(false)
    window.requestAnimationFrame(() => setCartOpen(true))
  }

  useEffect(() => {
    const updateScrolledState = () => setScrolled(window.scrollY > 24)
    updateScrolledState()
    window.addEventListener('scroll', updateScrolledState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrolledState)
  }, [])

  useEffect(() => {
    const synchronizeTheme = (event) => {
      if (event.key === SITE_THEME_KEY || event.key === null) {
        setSiteTheme(applySiteTheme(readSiteTheme()))
      }
    }
    window.addEventListener('storage', synchronizeTheme)
    return () => window.removeEventListener('storage', synchronizeTheme)
  }, [])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFrame = window.requestAnimationFrame(() => {
      mobileNavRef.current?.querySelector('a')?.focus()
    })

    // Fase 9.0-B (hallazgo del arquitecto): focus TRAP real dentro del menú.
    // El Tab desde el último enlace ya no escapa al contenido oculto detrás
    // del overlay: el ciclo se cierra entre el botón de menú y los enlaces.
    // Infraestructura existente (keydown), 0 dependencias nuevas.
    const FOCUSABLE_SELECTOR =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const trapTabKey = (event) => {
      if (event.key !== 'Tab') return

      // Ciclo REAL de foco del menú abierto: enlaces del panel + botón que
      // lo abre/cierra (que vive en el header, fuera del panel). La
      // depuración en ejecución (f9-trap-debug) mostró que el navegador
      // sigue el orden DOM: tras el último enlace del panel el Tab natural
      // aterriza en elementos del BODY (ancla VER PLANES), no en el botón.
      // Por eso el trap NO asume un "último" del array: captura el Tab
      // siempre que el foco actual NO esté ya en el ciclo, y entonces lo
      // redirige al extremo correcto. Si el foco está dentro del ciclo,
      // el Tab natural entre elementos del ciclo se respeta.
      const panelItems = [
        ...(mobileNavRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []),
      ].filter(Boolean)
      if (panelItems.length === 0) return

      const menuButton = menuButtonRef.current
      const active = document.activeElement
      const lastPanelItem = panelItems[panelItems.length - 1]

      if (event.shiftKey) {
        // Shift+Tab desde el botón del menú: saltar al final del panel (el
        // anterior natural del botón es contenido del body, no el panel).
        if (menuButton && active === menuButton) {
          event.preventDefault()
          lastPanelItem.focus()
          return
        }
        // Shift+Tab con el foco perdido fuera del anillo: volver al botón.
        if (!panelItems.includes(active) && active !== menuButton) {
          event.preventDefault()
          ;(menuButton ?? lastPanelItem).focus()
        }
      } else {
        // Tab desde el último elemento del panel: el siguiente natural en el
        // DOM es contenido del BODY (VER PLANES), no el botón del menú
        // (que está antes del panel). Cerramos el anillo a mano.
        if (active === lastPanelItem) {
          event.preventDefault()
          ;(menuButton ?? panelItems[0]).focus()
          return
        }
        // Tab con el foco perdido fuera del anillo: volver al primer enlace.
        if (!panelItems.includes(active) && active !== menuButton) {
          event.preventDefault()
          panelItems[0].focus()
        }
      }
    }

    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      window.requestAnimationFrame(() => menuButtonRef.current?.focus())
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('keydown', trapTabKey)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('keydown', trapTabKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <header className={`navbar${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <Link className="brand" to="/" onClick={close} aria-label="BAYONA, ir al inicio">
        <span aria-hidden="true">B.</span><strong>BAYONA</strong>
      </Link>
      <nav className="desktop-nav gym-primary-nav" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ label, href }) => (
          <NavLink key={href} to={href} onMouseEnter={() => prefetchRoute(href)}>
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        className="site-theme-toggle"
        type="button"
        aria-label={siteTheme === 'day' ? 'Activar modo noche' : 'Activar modo día'}
        aria-pressed={siteTheme === 'day'}
        title={siteTheme === 'day' ? 'Cambiar a modo noche' : 'Cambiar a modo día'}
        onClick={() => {
          setSiteTheme((current) =>
            applySiteTheme(current === 'day' ? 'night' : 'day', { persist: true }),
          )
        }}
      >
        {siteTheme === 'day' ? <Moon size={17} strokeWidth={1.7} aria-hidden="true" /> : <Sun size={17} strokeWidth={1.7} aria-hidden="true" />}
        <span>{siteTheme === 'day' ? 'NOCHE' : 'DÍA'}</span>
      </button>
      {shopContext ? (
        <button
          className="nav-cart-button"
          type="button"
          onClick={openCart}
          aria-label={`Abrir carrito${cartCount > 0 ? `, ${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}` : ', vacío'}`}
        >
          <ShoppingCart size={18} strokeWidth={1} aria-hidden="true" />
          <span className="nav-cart-label">Carrito</span>
          <span className="nav-cart-count" aria-hidden="true">{cartCount}</span>
        </button>
      ) : null}
      <a className="nav-cta gym-nav-cta" href="/#empieza" aria-label="Empieza gratis con BAYONA">
        Empieza gratis <ArrowUpRight size={15} strokeWidth={1} />
      </a>
      <button
        ref={menuButtonRef}
        className="menu-button"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls="bayona-mobile-navigation"
      >
        {open ? <X strokeWidth={1} /> : <Menu strokeWidth={1} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            ref={mobileNavRef}
            id="bayona-mobile-navigation"
            className="mobile-nav"
            aria-label="Navegación móvil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="gym-mobile-nav-head">
              <p>MENÚ</p>
              <span>Entrenamiento · fuerza · movimiento</span>
            </div>
            <div className="mobile-nav-list gym-mobile-nav-list">
              {MOBILE_NAV_ITEMS.map((item, index) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={close}
                  onMouseEnter={() => prefetchRoute(item.href)}
                >
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item.label}</strong>
                  <ArrowUpRight size={22} strokeWidth={1} aria-hidden="true" />
                </NavLink>
              ))}
            </div>
            <div className="gym-mobile-nav-conversion">
              <p>Tu primera decisión no cuesta nada.</p>
              <span>Déjanos tus datos, recibe tus recursos de inicio y pide tu valoración.</span>
              <a href="/#empieza" onClick={close}>
                EMPIEZA GRATIS <ArrowUpRight size={20} strokeWidth={1.2} aria-hidden="true" />
              </a>
              <a
                className="gym-mobile-nav-whatsapp"
                href={whatsAppLink('Hola BAYONA, quiero información sobre sus servicios de entrenamiento.')}
                target="_blank"
                rel="noreferrer"
                onClick={close}
              >
                HABLAR POR WHATSAPP
              </a>
              {shopContext ? (
                <button
                  className="mobile-cart-action"
                  type="button"
                  onClick={openCart}
                  aria-label={`Abrir carrito${cartCount > 0 ? `, ${cartCount} artículos` : ', vacío'}`}
                >
                  <ShoppingCart size={20} strokeWidth={1} aria-hidden="true" />
                  <span>Carrito · {cartCount}</span>
                </button>
              ) : null}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <Suspense fallback={null}>
        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      </Suspense>
      <Suspense fallback={null}>
        <Toaster position="bottom-center" theme={siteTheme === 'day' ? 'light' : 'dark'} richColors />
      </Suspense>
    </header>
  )
}

export function Footer() {
  const profiles = useMemo(() => resolveProfiles(socialLinks), [])
  return (
    <footer className="footer gym-footer">
      <div className="footer-top">
        <Link className="footer-mark" to="/" aria-label="BAYONA, ir al inicio">BAYONA</Link>
        <p>Entrenamiento personal, fuerza, movimiento y acompañamiento.</p>
      </div>
      <div className="footer-columns gym-footer-columns">
        <nav className="footer-column" aria-label="Explorar BAYONA">
          <p>EXPLORAR</p>
          {NAV_ITEMS.map(({ label, href }) => <Link key={href} to={href}>{label}</Link>)}
        </nav>
        <nav className="footer-column" aria-label="Ayuda">
          <p>AYUDA</p>
          <Link to="/faq">Preguntas frecuentes</Link>
          <a href={whatsAppLink('Hola BAYONA, quiero información sobre sus servicios de entrenamiento.')} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </nav>
        <div className="footer-column footer-entry">
          <p>EMPIEZA</p>
          <a href="/#empieza">RECIBIR MIS RECURSOS</a>
        </div>
      </div>
      {profiles.length > 0 && (
        <div className="footer-social" aria-label="Redes BAYONA">
          {profiles.map((profile) => (
            <a key={profile.id} href={profile.url} target="_blank" rel="noreferrer" aria-label={`${profile.verbo} en ${profile.label}`}>
              <Glyph name={profile.glyph} size={16} />
            </a>
          ))}
        </div>
      )}
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} BAYONA</small>
        <small>ENTRENA CON DIRECCIÓN</small>
      </div>
    </footer>
  )
}

/**
 * Silueta reconocible de WhatsApp (glifo del servicio, trazo propio). Va en
 * `currentColor` a propósito: la regla de marca del sitio prohíbe el verde
 * WhatsApp en el código de producto (ver `Layout.test.jsx`), así que el canal
 * se reconoce por la forma y se viste con el naranja de la casa.
 */
function WhatsAppGlyph() {
  return (
    <svg
      className="whatsapp-glyph"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.115-.198.058-.372-.058-.52-.116-.149-.644-1.552-.883-2.128-.235-.564-.474-.487-.644-.496-.174-.008-.373-.01-.572-.01-.2 0-.525.074-.799.372-.274.297-1.045 1.026-1.045 2.504 0 1.477 1.07 2.906 1.219 3.105.148.2 2.103 3.204 5.09 4.49.71.306 1.263.489 1.695.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function WhatsAppButton() {
  const href = whatsAppLink('Hola BAYONA, quiero conocer el camino que mejor encaja conmigo.')
  /*
    Medido con scripts/probe-overlays.mjs: este botón fijo se llevaba por
    delante cuatro preguntas del acordeón de /faq (03, 04, 08, 09) y texto de
    /programs, /resources, /shop y /parkour-academy. Un botón flotante tapando
    contenido al pasar es normal; un botón flotante al que se le clica encima y
    no abre la pregunta, no. Mientras la página se mueve se aparta y deja de
    recibir puntero; al pararse vuelve.
  */
  const [moviendo, setMoviendo] = useState(false)
  useEffect(() => {
    let temporizador
    const alMover = () => {
      setMoviendo(true)
      window.clearTimeout(temporizador)
      temporizador = window.setTimeout(() => setMoviendo(false), 280)
    }
    window.addEventListener('scroll', alMover, { passive: true })
    return () => {
      window.removeEventListener('scroll', alMover)
      window.clearTimeout(temporizador)
    }
  }, [])
  /*
    Anotación 8 del brief de 70 («Asistente / chat / WhatsApp»): el botón
    «parece un cuadrado pequeño y no comunica que haya una inteligencia o guía
    personal detrás», y pide «icono real de WhatsApp» + «texto explícito: Hablar
    por WhatsApp». Se cambia el globo genérico de lucide por la silueta
    reconocible del servicio y la etiqueta ambigua («Hablemos») por la que dice
    el canal.

    El glifo va en `currentColor`, no en verde: sigue mandando la regla de
    marca que comprueba este mismo fichero de tests («no conserva colores verdes
    de WhatsApp en el código de producto»). Lo que se reconoce es la forma, no
    el verde. La diferenciación con el asistente interno (GuideCompanion) vive
    en el carril de acompañante: aquí solo se nombra el canal humano.
  */
  return (
    <a
      className={`whatsapp-button${moviendo ? ' is-receded' : ''}`}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Hablar con BAYONA por WhatsApp"
    >
      <WhatsAppGlyph />
      <span>Hablar por WhatsApp</span>
    </a>
  )
}

export function SectionLabel({ children }) {
  return <p className="eyebrow"><span />{children}</p>
}

export function GoldButton({ children, to = '/programs', className = '' }) {
  const { ref, x, y } = useMagnetic()
  return (
    <MotionLink ref={ref} to={to} className={`gold-button ${className}`} style={{ x, y }}>
      {children}
      <ArrowUpRight size={18} strokeWidth={1} />
    </MotionLink>
  )
}

export function PageHero({ title, kicker, media, children, compact = false, scene }) {
  const reduceMotion = useReducedMotion()
  const classes = ['page-hero', compact ? 'compact' : '']
    .filter(Boolean)
    .join(' ')

  const introMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.58, ease: [0.16, 1, 0.3, 1] },
      }

  return (
    <section className={classes}>
      <div
        {...sceneBackgroundProps(media, {
          className: 'page-hero-backdrop',
          style: { position: 'absolute', inset: 0, zIndex: 0 },
          variant: 'hero',
          motion: true,
        })}
      />
      {/*
        La escena 3D va DESPUÉS del backdrop en el DOM: con el mismo z-index,
        el orden de pintado la deja delante de la imagen de fondo y detrás
        del contenido (z-index 1). Si fuera antes, el backdrop opaco la taparía.
      */}
      {scene ? (
        <Suspense fallback={null}>
          <SceneMount config={scene} className="page-hero-canvas" />
        </Suspense>
      ) : null}
      <div className="page-hero-content" style={{ position: 'relative', zIndex: 1 }}>
        {kicker && (
          <motion.div {...introMotion}>
            <SectionLabel>{kicker}</SectionLabel>
          </motion.div>
        )}
        {/*
          El titular entra con máscara: la línea emerge desde debajo, sin rebote.
          Es el efecto que le faltaba a la cabecera —el fondo ya tenía movimiento
          y el h1 no, así que la página arrancaba de golpe mientras el fondo
          respiraba. TextMask pone el texto completo en `aria-label` y oculta las
          líneas animadas, de modo que el lector anuncia la frase entera y el
          nombre accesible del h1 no cambia. Con movimiento reducido sale texto
          plano.
        */}
        <TextMask as="h1" text={title} className="page-hero-title" eager />
        <motion.div
          className="page-hero-support"
          {...introMotion}
          transition={reduceMotion ? undefined : { ...introMotion.transition, delay: 0.16 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
