import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

const BRAND_TAGLINE = 'BAYONA · ENTRENA CON DIRECCIÓN · AVANZA CON MÉTODO'

/*
 * Fase 4: aquí vivía ROUTE_CONTINUATIONS, un segundo sistema de cierre de
 * página que competía con NextChapter (chapters.js). Duplicaba la función de
 * "qué viene después" con datos incompletos (sin /shop) y numeración
 * incoherente con el itinerario. Se retira: NextChapter es desde Fase 4 el
 * único sistema de continuidad entre páginas. Este componente conserva sus
 * otras dos funciones: los efectos DOM por ruta (reveal/spotlight/tilt) y la
 * marquesina de marca.
 */

const ROUTE_CONFIG = Object.freeze({
  '/': Object.freeze({
    key: 'home',
    revealSelectors: [],
    cardSelectors: ['.gym-service-card', '.gym-process-step', '.gym-gift-card'],
    spotlightSelectors: ['.gym-service-card', '.gym-gift-card'],
    tiltSelectors: [],
  }),
  '/about': Object.freeze({
    key: 'about',
    revealSelectors: ['.about-timeline-entry'],
    cardSelectors: ['.about-value'],
    spotlightSelectors: ['.about-value'],
    tiltSelectors: [],
  }),
  '/programs': Object.freeze({
    key: 'programs',
    revealSelectors: [],
    cardSelectors: ['.services-overview-card', '.services-card'],
    spotlightSelectors: ['.services-overview-card', '.services-card'],
    tiltSelectors: [],
  }),
  '/parkour-academy': Object.freeze({
    key: 'parkour-academy',
    revealSelectors: [],
    cardSelectors: ['.academy-level', '.academy-logistics-grid > article'],
    spotlightSelectors: ['.academy-level'],
    tiltSelectors: [],
  }),
  '/shop': Object.freeze({
    key: 'shop',
    revealSelectors: [],
    cardSelectors: ['.shop-product-card', '.shop-category-shortcuts button'],
    spotlightSelectors: ['.shop-product-card'],
    tiltSelectors: [],
  }),
  '/app': Object.freeze({
    key: 'app',
    revealSelectors: [],
    cardSelectors: ['.app-pain-item', '.app-differentiator', '.app-feature-card'],
    spotlightSelectors: ['.app-differentiator', '.app-feature-card'],
    tiltSelectors: ['.app-founding-card'],
  }),
  '/community': Object.freeze({
    key: 'community',
    revealSelectors: [],
    cardSelectors: [],
    spotlightSelectors: [],
    tiltSelectors: [],
  }),
  '/resources': Object.freeze({
    key: 'resources',
    revealSelectors: ['.resources-reveal'],
    cardSelectors: [],
    spotlightSelectors: [],
    tiltSelectors: [],
  }),
  '/faq': Object.freeze({
    key: 'faq',
    revealSelectors: ['.faq-category', '.faq-contact-card'],
    cardSelectors: ['.faq-contact-card'],
    spotlightSelectors: ['.faq-contact-card'],
    tiltSelectors: [],
  }),
  '/entrar': Object.freeze({
    key: 'entrar',
    revealSelectors: [],
    cardSelectors: ['.auth-card', '.login-card', '.entrar-card'],
    spotlightSelectors: ['.auth-card', '.login-card', '.entrar-card'],
    tiltSelectors: [],
  }),
})

function mediaMatches(query) {
  return typeof window.matchMedia === 'function' && window.matchMedia(query).matches
}

function queryTargets(root, selectors) {
  return [...new Set(selectors.flatMap((selector) => [...root.querySelectorAll(selector)]))]
}

function usePremiumRouteEnhancements(config) {
  useLayoutEffect(() => {
    if (!config) return undefined

    const main = document.getElementById('main-content')
    if (!main) return undefined

    const routeClass = `premium-route--${config.key}`
    document.body.classList.add('premium-route-active', routeClass)

    const cards = queryTargets(main, config.cardSelectors)
    cards.forEach((card) => card.classList.add('premium-card'))

    const reducedMotion = mediaMatches('(prefers-reduced-motion: reduce)')
    const canObserve = !reducedMotion && 'IntersectionObserver' in window
    const revealTargets = new Set()
    let revealIndex = 0
    const revealObserver = canObserve
      ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        })
      }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' })
      : null

    const registerRevealTargets = () => {
      queryTargets(main, config.revealSelectors).forEach((target) => {
        if (revealTargets.has(target)) return
        target.classList.add('premium-reveal')
        target.style.setProperty('--premium-reveal-delay', `${(revealIndex % 6) * 0.08}s`)
        revealIndex += 1
        revealTargets.add(target)

        if (revealObserver) revealObserver.observe(target)
        else target.classList.add('is-visible')
      })
    }

    registerRevealTargets()

    const mutationObserver = config.revealSelectors.length > 0 && 'MutationObserver' in window
      ? new MutationObserver(registerRevealTargets)
      : null
    mutationObserver?.observe(main, { childList: true, subtree: true })

    const pointerDisposers = []
    const pointerEffectsEnabled = !reducedMotion && mediaMatches('(hover: hover) and (pointer: fine)')

    if (pointerEffectsEnabled) {
      queryTargets(main, config.spotlightSelectors).forEach((target) => {
        const moveSpotlight = (event) => {
          const rect = target.getBoundingClientRect()
          target.style.setProperty('--premium-spotlight-x', `${event.clientX - rect.left}px`)
          target.style.setProperty('--premium-spotlight-y', `${event.clientY - rect.top}px`)
        }
        const resetSpotlight = () => {
          target.style.setProperty('--premium-spotlight-x', '50%')
          target.style.setProperty('--premium-spotlight-y', '50%')
        }

        target.classList.add('premium-spotlight-card')
        target.addEventListener('pointermove', moveSpotlight)
        target.addEventListener('pointerleave', resetSpotlight)
        pointerDisposers.push(() => {
          target.removeEventListener('pointermove', moveSpotlight)
          target.removeEventListener('pointerleave', resetSpotlight)
          target.classList.remove('premium-spotlight-card')
          target.style.removeProperty('--premium-spotlight-x')
          target.style.removeProperty('--premium-spotlight-y')
        })
      })

      queryTargets(main, config.tiltSelectors).forEach((target) => {
        const moveTilt = (event) => {
          const rect = target.getBoundingClientRect()
          const xRatio = (event.clientX - rect.left) / rect.width
          const yRatio = (event.clientY - rect.top) / rect.height
          target.style.setProperty('--premium-tilt-x', `${(0.5 - yRatio) * 8}deg`)
          target.style.setProperty('--premium-tilt-y', `${(xRatio - 0.5) * 8}deg`)
        }
        const startTilt = () => target.classList.add('premium-tilt-card')
        const resetTilt = () => {
          target.classList.remove('premium-tilt-card')
          target.style.setProperty('--premium-tilt-x', '0deg')
          target.style.setProperty('--premium-tilt-y', '0deg')
        }

        target.classList.add('premium-tilt-ready')
        target.addEventListener('pointerenter', startTilt)
        target.addEventListener('pointermove', moveTilt)
        target.addEventListener('pointerleave', resetTilt)
        pointerDisposers.push(() => {
          target.removeEventListener('pointerenter', startTilt)
          target.removeEventListener('pointermove', moveTilt)
          target.removeEventListener('pointerleave', resetTilt)
          target.classList.remove('premium-tilt-ready', 'premium-tilt-card')
          target.style.removeProperty('--premium-tilt-x')
          target.style.removeProperty('--premium-tilt-y')
        })
      })
    }

    return () => {
      mutationObserver?.disconnect()
      revealObserver?.disconnect()
      pointerDisposers.forEach((dispose) => dispose())
      revealTargets.forEach((target) => {
        target.classList.remove('premium-reveal', 'is-visible')
        target.style.removeProperty('--premium-reveal-delay')
      })
      cards.forEach((card) => card.classList.remove('premium-card'))
      document.body.classList.remove('premium-route-active', routeClass)
    }
  }, [config])
}

function BrandMarquee() {
  return (
    <div className="premium-brand-marquee" role="region" aria-label={BRAND_TAGLINE}>
      <span className="premium-visually-hidden">{BRAND_TAGLINE}</span>
      <div className="premium-brand-marquee-track" aria-hidden="true">
        {[0, 1].map((group) => (
          <div className="premium-brand-marquee-group" key={group}>
            {[0, 1, 2, 3].map((item) => (
              <span className="premium-brand-marquee-item" key={item}>{BRAND_TAGLINE}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PremiumRouteChrome() {
  const { pathname } = useLocation()
  const config = ROUTE_CONFIG[pathname]
  usePremiumRouteEnhancements(config)

  if (!config) return null

  return <BrandMarquee />
}
