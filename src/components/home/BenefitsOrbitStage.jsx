import NarrativeIntro from './NarrativeIntro.jsx'
import { Activity, Atom, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import '../../styles/benefits-orbit-stage.css'

const SIGNALS = Object.freeze([
  { label: 'INTENCIÓN', Icon: Atom },
  { label: 'LECTURA', Icon: Activity },
  { label: 'SOPORTE', Icon: Users },
])

export default function BenefitsOrbitStage({ block }) {
  const { mode } = useCapabilities()
  const items = block?.items ?? []
  if (!items.length) return null

  const length = mode === 'desktop' ? '300vh' : '200vh'

  return (
    <div className="benefits-orbit-stage-wrap">
      <NarrativeIntro className="benefits-orbit-intro" image="/images/bayona-generated/home-pillar-track-1600.webp" label="03 / LO QUE CAMBIA" id="home-benefits-heading" title={block.heading} body={block.body} />

      <ol className="pillars-stack sr-only" aria-label="Lo que cambia con el método BAYONA">
        {items.map((benefit) => (
          <li
            className="pillar-item"
            data-marker-column="inline-start"
            key={benefit.id}
          >
            <span className="pillar-number" aria-hidden="true">{benefit.marker}</span>
            <div>
              <h3>{benefit.title}</h3>
              <p>{benefit.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <StickyStage
        length={length}
        states={items.length}
        topOffset={66}
        allowMobile
        className="benefits-orbit-stage photo-story-stage"
      >
        {({ index, progress, isStatic }) => {
          const benefit = items[index] ?? items[0]
          const words = benefit.title.split(/\s+/)

          return (
            <div className="benefits-orbit-viewport">
              <div className="benefits-orbit-visual">
                <div
                  className="bayona-benefits-photographic-layer"
                  style={{
                    backgroundImage: `url("${[
                      '/images/bayona-generated/home-method-1600.webp',
                      '/images/bayona-generated/home-pillar-track-1600.webp',
                      '/images/bayona-generated/home-pillar-build-1600.webp',
                    ][index] ?? '/images/bayona-generated/home-pillar-track-1600.webp'}")`,
                  }}
                  aria-hidden="true"
                />

              </div>

              <motion.article
                className="benefits-orbit-copy"
                aria-hidden="true"
                key={benefit.id}
                initial={isStatic ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p>{SIGNALS[index]?.label ?? benefit.marker}</p>
                <h3>
                  {words.map((word, wordIndex) => (
                    <span key={`${word}-${wordIndex}`}>
                      {word}{wordIndex < words.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </h3>
                <div className="benefits-orbit-body" aria-hidden="true">
                  {benefit.body.split(/\s+/).map((word, wordIndex) => (
                    <span key={`${word}-${wordIndex}`}>
                      {word}{wordIndex < benefit.body.split(/\s+/).length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </div>
              </motion.article>
            </div>
          )
        }}
      </StickyStage>

      <a className="benefits-orbit-follow" href="#home-offer-heading">
        VER MI ACOMPAÑAMIENTO <span aria-hidden="true">↓</span>
      </a>
    </div>
  )
}
