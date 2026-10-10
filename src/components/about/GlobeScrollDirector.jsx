import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, ensureGsapReady } from '../../engine/motion/gsapMotionBridge.js'
import { TESTIMONIALS } from '../../config/testimonials.js'

// One published story per deliberate scroll beat. No unsupported claims or
// synthetic locations: all people, quotes and cities come from the catalogue.
export const GLOBE_STORY = Object.freeze([
  Object.freeze({
    id: 'intro', eyebrow: 'ATLAS BAYONA · EL RECORRIDO', title: 'DIEZ HISTORIAS. CUATRO PAÍSES.',
    text: 'Desplázate para recorrer cada experiencia publicada. El globo cambiará de historia contigo; también puedes abrir cualquier punto manualmente.',
    country: 'Colombia', kind: 'intro',
  }),
  ...TESTIMONIALS.map((item) => Object.freeze({
    id: `story-${item.id}`, testimonialId: item.id,
    eyebrow: `${item.city.toUpperCase()} · ${item.country.toUpperCase()}`,
    title: item.name,
    text: item.quote,
    detail: item.role,
    image: item.image,
    experience: item.result,
    country: item.country,
    kind: 'testimonial',
  })),
  Object.freeze({
    id: 'outro', eyebrow: 'EL RECORRIDO CONTINÚA',
    title: 'TU HISTORIA ES EL SIGUIENTE CAPÍTULO.',
    text: 'Conoce nuestra manera de acompañar y encuentra tu punto de partida. Puedes regresar al mapa cuando quieras.',
    country: 'Argentina', kind: 'outro',
  }),
])

/**
 * CSS sticky stage is temporary and reversible. No snap or scroll lock: normal wheel,
 * touchpad, keyboard and assistive navigation always progress. At tablet/mobile
 * sizes or reduced-motion preferences all 12 chapters appear in normal flow.
 * The active chapter switches atomically; there are NO all-hidden gaps.
 */
export default function GlobeScrollDirector({ reducedMotion, onStageChange }) {
  const ref = useRef(null)
  const callback = useRef(onStageChange)
  callback.current = onStageChange

  useGSAP(() => {
    if (reducedMotion || !ensureGsapReady()) return
    const scene = ref.current?.closest('.globe-testimonials-stage')
    const runway = scene?.closest('.globe-atlas-runway')
    if (!runway) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = [...ref.current.querySelectorAll('.globe-scroll-story__chapter')]
      let current = -1
      const displayStage = (index) => {
        const next = Math.max(0, Math.min(GLOBE_STORY.length - 1, index))
        if (current === next) return
        current = next
        // All cards are laid out with visible fallback CSS. Animate only when
        // the browser supports the pinned experience; never create a gap.
        gsap.killTweensOf(cards)
        gsap.set(cards, { autoAlpha: 0, y: 0, filter: 'blur(0px)' })
        gsap.set(cards[next], { autoAlpha: 1, y: 15, filter: 'blur(5px)' })
        gsap.to(cards[next], { y: 0, filter: 'blur(0px)', duration: .5, ease: 'power2.out' })
        scene.dataset.storyStep = String(next)
        scene.dataset.storyId = GLOBE_STORY[next].id
        callback.current?.(next)
      }
      gsap.set(cards, { y: 0 })
      displayStage(0)
      const trigger = ScrollTrigger.create({
        id: 'bayona-globe-atlas-catalogue',
        trigger: runway,
        start: 'top top+=78',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          displayStage(Math.min(GLOBE_STORY.length - 1, Math.floor(progress * GLOBE_STORY.length)))
        },
        onEnter: () => displayStage(0),
        onEnterBack: () => displayStage(GLOBE_STORY.length - 1),
        onLeave: () => displayStage(GLOBE_STORY.length - 1),
        onLeaveBack: () => displayStage(0),
      })
      return () => {
        trigger.kill()
        gsap.set(cards, { clearProps: 'all' })
        delete scene.dataset.storyStep
        delete scene.dataset.storyId
      }
    })
    return () => mm.revert()
  }, { dependencies: [reducedMotion], revertOnUpdate: true })

  return (
    <div className="globe-scroll-story" ref={ref} aria-label="Catálogo global completo de historias BAYONA">
      {GLOBE_STORY.map((chapter, index) => (
        <article className="globe-scroll-story__chapter" key={chapter.id}
          data-story-index={index} data-story-id={chapter.id}>
          <span className="globe-scroll-story__eyebrow">{chapter.eyebrow}</span>
          <div className="globe-scroll-story__identity">
            {chapter.image && <img className="globe-scroll-story__portrait" src={chapter.image}
              alt="" width="72" height="72" loading="lazy" decoding="async" />}
            <h3>{chapter.title}</h3>
          </div>
          <p>{chapter.text}</p>
          {chapter.detail && <span className="globe-scroll-story__detail">{chapter.detail}</span>}
          {chapter.experience && <span className="globe-scroll-story__experience">EXPERIENCIA PUBLICADA · {chapter.experience}</span>}
          <span className="globe-scroll-story__index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')} / {String(GLOBE_STORY.length).padStart(2, '0')}
          </span>
        </article>
      ))}
      <span className="globe-scroll-story__hint">SCROLL · RECORRE LAS DIEZ HISTORIAS ↓</span>
    </div>
  )
}
