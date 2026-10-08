import { gsap, ScrollTrigger, useGSAP, ensureGsapReady } from '../../engine/motion/gsapMotionBridge.js'
import { useRef, useState } from 'react'
import '../../styles/about-journey.css'


export const ABOUT_CHAPTERS = Object.freeze([
  { id: 'about-purpose-title', label: 'El propósito' },
  { id: 'la-persona', label: 'La persona' },
  { id: 'el-recorrido', label: 'El recorrido' },
  { id: 'el-mundo', label: 'El mundo' },
  { id: 'nuestros-valores', label: 'Los valores' },
  { id: 'el-metodo', label: 'El método' },
  { id: 'empezar', label: 'Tu siguiente paso' },
])

export default function AboutJourneyRail({ reducedMotion = false }) {
  const railRef = useRef(null)
  const [active, setActive] = useState(0)

  useGSAP(() => {
    if (!ensureGsapReady()) return
    const container = document.querySelector('.about-page')
    if (!container) return
    const elements = ABOUT_CHAPTERS.map((chapter) => document.getElementById(chapter.id))
    if (elements.some((element) => !element)) return
    const progress = railRef.current?.querySelector('.about-journey-rail__fill')
    const scope = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: ({ progress: value }) => {
          if (progress) {
            const amount = Math.min(1, Math.max(0, value))
            gsap.set(progress, window.matchMedia('(max-width: 760px)').matches
              ? { scaleX: amount, scaleY: 1 }
              : { scaleY: amount, scaleX: 1 })
          }
        },
      })
      elements.forEach((element, index) => {
        ScrollTrigger.create({
          trigger: element,
          start: 'top 52%',
          end: 'bottom 52%',
          onEnter: () => setActive(index),
          onEnterBack: () => setActive(index),
        })
      })
      if (reducedMotion) return
      // The copy is ALWAYS visible by default; tweening only enhances it.
      const selectors = [
        '.about-problem-heading h2', '.about-founder__editorial h2',
        '.about-story-heading h2', '.about-globe-testimonials-heading h2',
        '.about-values-stage__intro h2', '.about-method-heading h2',
      ]
      for (const selector of selectors) {
        const element = container.querySelector(selector)
        if (!element) continue
        gsap.fromTo(element, { y: 26, opacity: .48 }, {
          y: 0, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: element, start: 'top 92%', end: 'top 48%', scrub: .75 },
        })
      }
      const photo = container.querySelector('.about-story-heading__art img')
      if (photo) {
        gsap.fromTo(photo, { scale: 1.065 }, { scale: 1, ease: 'none',
          scrollTrigger: { trigger: photo.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
      }
    })
    return () => scope.revert()
  }, { dependencies: [reducedMotion], revertOnUpdate: true })

  return (
    <nav className="about-journey-rail" ref={railRef} aria-label="Recorrido de Nosotros">
      <div className="about-journey-rail__meter" aria-hidden="true"><span className="about-journey-rail__fill" /></div>
      <div className="about-journey-rail__chapters">
        {ABOUT_CHAPTERS.map((chapter, index) => (
          <a key={chapter.id} href={`#${chapter.id}`} className={index === active ? 'is-current' : ''}
            aria-label={`${String(index + 1).padStart(2, '0')}: ${chapter.label}`}
            title={chapter.label}
            aria-current={index === active ? 'location' : undefined}>
            <span className="about-journey-rail__number">{String(index + 1).padStart(2, '0')}</span>
            <span className="about-journey-rail__name">{chapter.label}</span>
          </a>
        ))}
      </div>
      <span className="about-journey-rail__counter" aria-hidden="true">{String(active + 1).padStart(2, '0')} <span>/ 07</span></span>
    </nav>
  )
}
