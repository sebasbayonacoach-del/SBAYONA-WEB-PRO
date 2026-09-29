import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const ROUTES = Object.freeze({
  '/': ['01', 'INICIO'],
  '/about': ['02', 'MÉTODO'],
  '/programs': ['03', 'PROGRAMAS'],
  '/parkour-academy': ['04', 'PARKOUR'],
  '/community': ['05', 'COMUNIDAD'],
  '/app': ['06', 'BAYONA+'],
  '/shop': ['07', 'TIENDA'],
  '/resources': ['08', 'RECURSOS'],
  '/faq': ['09', 'FAQ'],
  '/onboarding': ['10', 'RECEPCIÓN'],
  '/entrar': ['OS', 'ACCESO'],
  '/panel': ['OS', 'CENTRO DE MANDO'],
})

function routeIdentity(pathname) {
  if (pathname.startsWith('/plan/')) return ['P', pathname.split('/').pop()?.toUpperCase() || 'PLAN']
  return ROUTES[pathname] || ['—', 'BAYONA']
}

export default function AwardExperience() {
  const { pathname } = useLocation()
  const [progress, setProgress] = useState(0)
  const frame = useRef(0)
  const lastScrollY = useRef(0)
  const [number, label] = routeIdentity(pathname)

  useEffect(() => {
    document.body.classList.add('award-mode')
    return () => document.body.classList.remove('award-mode')
  }, [])

  useEffect(() => {
    const update = () => {
      frame.current = 0
      const range = document.documentElement.scrollHeight - window.innerHeight
      const nextProgress = range > 0 ? Math.min(100, Math.max(0, (window.scrollY / range) * 100)) : 0
      const delta = window.scrollY - lastScrollY.current
      lastScrollY.current = window.scrollY
      const speed = Math.min(1, Math.abs(delta) / 90)
      const direction = delta === 0 ? 1 : delta > 0 ? 1 : -1
      document.documentElement.style.setProperty('--prime-scroll', (nextProgress / 100).toFixed(4))
      document.documentElement.style.setProperty('--prime-speed', speed.toFixed(3))
      document.documentElement.style.setProperty('--prime-direction', String(direction))
      setProgress(nextProgress)
    }
    const onScroll = () => {
      if (!frame.current) frame.current = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame.current) window.cancelAnimationFrame(frame.current)
    }
  }, [pathname])

  useEffect(() => {
    const onPointer = (event) => {
      document.documentElement.style.setProperty('--award-pointer-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--award-pointer-y', `${event.clientY}px`)
      const nx = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2
      const ny = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2
      document.documentElement.style.setProperty('--prime-pointer-x', nx.toFixed(3))
      document.documentElement.style.setProperty('--prime-pointer-y', ny.toFixed(3))
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  useEffect(() => {
    const selector = '.scene-bg[data-media-key]'

    const markNear = (element) => {
      element.dataset.primeSceneNear = 'true'
    }

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(selector).forEach(markNear)
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        markNear(entry.target)
        observer.unobserve(entry.target)
      }
    }, { rootMargin: '900px 0px' })

    const register = (root = document) => {
      const candidates = []
      if (root instanceof Element && root.matches(selector)) candidates.push(root)
      if ('querySelectorAll' in root) candidates.push(...root.querySelectorAll(selector))

      for (const element of candidates) {
        if (element.dataset.primeSceneNear === 'true') continue
        const rect = element.getBoundingClientRect()
        if (rect.bottom >= -80 && rect.top <= window.innerHeight + 240) markNear(element)
        else observer.observe(element)
      }
    }

    register(document)

    // React.lazy puede insertar la página después de ejecutar este efecto.
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) register(node)
        }
      }
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()
    }
  }, [pathname])

  useEffect(() => {
    let scheduled = 0
    const updateScenes = () => {
      scheduled = 0
      const viewport = window.innerHeight
      document.querySelectorAll('.ds-frame[data-experience-scope="brand"] section.scene-bg--hero').forEach((section) => {
        const bounds = section.getBoundingClientRect()
        if (bounds.bottom < -100 || bounds.top > viewport + 100) {
          section.removeAttribute('data-award-scene-active')
          return
        }
        const progress = Math.min(1, Math.max(0, (viewport - bounds.top) / (viewport + bounds.height)))
        section.dataset.awardSceneActive = 'true'
        section.style.setProperty('--award-scene-scale', (1.11 - progress * 0.11).toFixed(3))
        section.style.setProperty('--award-scene-y', `${((0.5 - progress) * 44).toFixed(1)}px`)
      })
    }
    const requestUpdate = () => {
      if (!scheduled) scheduled = window.requestAnimationFrame(updateScenes)
    }
    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (scheduled) window.cancelAnimationFrame(scheduled)
    }
  }, [pathname])

  return (
    <div className="award-experience" aria-hidden="true">
      <div className="award-experience__aura" />
      <div className="award-experience__grain" />
      <div className="award-experience__route" key={pathname}>
        <span>{number}</span>
        <strong>{label}</strong>
      </div>
      <div className="award-experience__meter">
        <span>SCROLL</span>
        <i><b style={{ transform: `scaleX(${progress / 100})` }} /></i>
        <strong>{Math.round(progress).toString().padStart(2, '0')}</strong>
      </div>
    </div>
  )
}
