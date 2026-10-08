import { gsap, useGSAP, ensureGsapReady } from '../../engine/motion/gsapMotionBridge.js'
import { useRef } from 'react'


export const GLOBE_STORY = Object.freeze([
  { eyebrow: 'EL ORIGEN', title: 'TODO COMENZÓ EN COLOMBIA.', text: 'Una historia de movimiento, práctica y personas. Cada experiencia abrió una pregunta nueva.' },
  { eyebrow: 'UN NUEVO CAPÍTULO', title: 'EL CAMINO SIGUE EN ESPAÑA.', text: 'La distancia cambia el paisaje. No cambia la forma de escuchar, aprender y acompañar.' },
  { eyebrow: 'HISTORIAS QUE CONECTAN', title: 'MÁS ALLÁ DE LAS FRONTERAS.', text: 'Las experiencias publicadas también llegan a Miami y Buenos Aires. Explora los puntos del globo.' },
  { eyebrow: 'EL SIGUIENTE PASO', title: 'LO IMPORTANTE ES LO QUE VIENE.', text: 'El mapa sigue abierto. El siguiente movimiento empieza con tu propia historia.' },
])

// Pinned documentary sequence; free scrolling and manual globe exploration
// remain available. At <=1023px/reduced-motion the four chapters are static.
export default function GlobeScrollDirector({ reducedMotion, onStageChange }) {
  const ref = useRef(null)
  const callback = useRef(onStageChange)
  callback.current = onStageChange

  useGSAP(() => {
    if (reducedMotion || !ensureGsapReady()) return
    const scene = ref.current?.closest('.globe-testimonials-stage')
    if (!scene) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = [...ref.current.querySelectorAll('.globe-scroll-story__chapter')]
      gsap.set(cards.slice(1), { autoAlpha: 0, y: 24, yPercent: -50 })
      gsap.set(cards[0], { autoAlpha: 1, y: 0, yPercent: -50 })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'bayona-globe-documentary',
          trigger: scene,
          pin: true,
          pinSpacing: true,
          start: 'top top+=68',
          end: '+=210%',
          scrub: .7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const index = Math.min(GLOBE_STORY.length - 1, Math.floor(self.progress * GLOBE_STORY.length))
            if (scene.dataset.storyStep !== String(index)) {
              scene.dataset.storyStep = String(index)
              callback.current?.(index)
            }
          },
          onLeave() { scene.dataset.storyStep = '3' },
        },
      })
      cards.forEach((card, index) => {
        if (index === 0) return
        const pos = index * 1
        tl.to(cards[index - 1], { autoAlpha: 0, y: -24, duration: .28 }, pos - .2)
        tl.fromTo(card, { autoAlpha: 0, y: 24, yPercent: -50 }, { autoAlpha: 1, y: 0, yPercent: -50, duration: .36 }, pos)
      })
      // Equal reading time for the closing chapter.
      tl.to({}, { duration: 1 })
      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
        gsap.set(cards, { clearProps: 'all' })
        delete scene.dataset.storyStep
      }
    })
    return () => mm.revert()
  }, { dependencies: [reducedMotion], revertOnUpdate: true })

  return (
    <div className="globe-scroll-story" ref={ref} aria-label="Relato de Colombia al mundo">
      {GLOBE_STORY.map((chapter, index) => (
        <div className="globe-scroll-story__chapter" key={chapter.title} data-story-index={index}>
          <span className="globe-scroll-story__eyebrow">{chapter.eyebrow}</span>
          <h3>{chapter.title}</h3>
          <p>{chapter.text}</p>
          <span className="globe-scroll-story__index" aria-hidden="true">{String(index + 1).padStart(2, '0')} / 04</span>
        </div>
      ))}
      <span className="globe-scroll-story__hint">DESLIZA PARA DESCUBRIR EL RECORRIDO ↓</span>
    </div>
  )
}
