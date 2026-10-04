import { Activity, Atom, Users } from 'lucide-react'
import { motion, useTransform } from 'framer-motion'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import '../../styles/benefits-orbit-stage.css'

const SIGNALS = Object.freeze([
  { label: 'INTENCIÓN', Icon: Atom },
  { label: 'LECTURA', Icon: Activity },
  { label: 'SOPORTE', Icon: Users },
])

const DISTRACTIONS = ['MÁS RÁPIDO', 'CAMBIA TODO', 'COMPARA', 'SIN PARAR', 'AHORA']

function NoiseField({ progress }) {
  const y = useTransform(progress, [0,.24,.55,1], ['-12%','2%','120%','180%'])
  const x = useTransform(progress, [0,1], ['10%','-28%'])
  const opacity = useTransform(progress, [0,.18,.5,.8,1],[.78,.68,.1,0,0])
  const rotate = useTransform(progress,[0,1],[-6,23])
  return (
    <motion.div className="bayona-noise-field" style={{x,y,opacity,rotate}} aria-hidden="true">
      {DISTRACTIONS.map((phrase,i)=><span className="bayona-noise-billboard" key={phrase} style={{'--noise-index':i}}>{phrase}</span>)}
    </motion.div>
  )
}

function OrbitSystem({ progress, activeIndex }) {
  const rotate = useTransform(progress, [0, 1], [-24, 336])
  const scale = useTransform(progress, [0, .5, 1], [.9, 1.06, .94])

  return (
    <motion.div className="benefits-orbit-system" style={{ rotate, scale }} aria-hidden="true">
      <div className="benefits-orbit benefits-orbit--one" />
      <div className="benefits-orbit benefits-orbit--two" />
      <div className="benefits-orbit benefits-orbit--three" />
      <div className="benefits-orbit-core">
        <span>{String(activeIndex + 1).padStart(2, '0')}</span>
      </div>
      {SIGNALS.map(({ label, Icon }, index) => (
        <div
          className="benefits-orbit-node"
          data-active={index === activeIndex ? 'true' : undefined}
          data-node={index}
          key={label}
        >
          <Icon size={20} strokeWidth={1.2} />
          <span>{label}</span>
        </div>
      ))}
    </motion.div>
  )
}

export default function BenefitsOrbitStage({ block }) {
  const { mode } = useCapabilities()
  const items = block?.items ?? []
  if (!items.length) return null

  const length = mode === 'desktop' ? '300vh' : '320vh'

  return (
    <div className="benefits-orbit-stage-wrap">
      <header className="benefits-orbit-intro">
        <p>03 / LO QUE CAMBIA</p>
        <h2 id="home-benefits-heading">{block.heading}</h2>
        <span>{block.body}</span>
      </header>

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
        className="benefits-orbit-stage"
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
                      '/images/burst/person-stretching-in-fitness-clothing-960.webp',
                      '/images/burst/man-running-at-the-track-960.webp',
                      '/images/burst/strong-women-planking-960.webp',
                    ][index] ?? '/images/burst/man-running-at-the-track-960.webp'}")`,
                  }}
                  aria-hidden="true"
                />
                {!isStatic && <NoiseField progress={progress} />}
                <div className="bayona-ascent-steps" aria-hidden="true"><span>01 / ENFOQUE</span><span>02 / CRITERIO</span><span>03 / PROGRESO</span></div>
                {isStatic ? (
                  <div className="benefits-orbit-system benefits-orbit-system--static" aria-hidden="true">
                    <div className="benefits-orbit benefits-orbit--one" />
                    <div className="benefits-orbit benefits-orbit--two" />
                    <div className="benefits-orbit benefits-orbit--three" />
                    <div className="benefits-orbit-core">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                ) : (
                  <OrbitSystem progress={progress} activeIndex={index} />
                )}
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
