import NarrativeIntro from './NarrativeIntro.jsx'
import { motion } from 'framer-motion'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import '../../styles/immersive-method-stage.css'

const STEP_VERBS = ['LEER', 'DISEÑAR', 'AJUSTAR']
const METHOD_PHOTOS = ['home-pillar-read', 'home-pillar-build', 'home-method']

function JourneyScene({ activeIndex, staticMode = false }) {
  return (
    <motion.div className="bayona-method-photograph" aria-hidden="true"
      key={activeIndex} initial={staticMode ? false : { opacity: .6, scale: 1.035 }}
      animate={{ opacity: 1, scale: 1 }} transition={{ duration: .85, ease: [.16, 1, .3, 1] }}>
      <img className="bayona-voyage-photographic-layer"
        src={`/images/bayona-generated/${METHOD_PHOTOS[activeIndex] ?? METHOD_PHOTOS[0]}-1600.webp`}
        alt="" width="1600" height="900" loading="lazy" decoding="async" />
    </motion.div>
  )
}

function MethodAct({ item, index, total, isStatic }) {
  return (
    <article className="immersive-method-act">
      <div className="immersive-method-act__meta" aria-hidden="true">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <i />
        <span>{String(total).padStart(2, '0')}</span>
      </div>

      <motion.div
        className="immersive-method-act__copy"
        aria-hidden="true"
        key={item.id}
        initial={isStatic ? false : { opacity: 0, y: 28, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="immersive-method-act__verb">{STEP_VERBS[index] ?? item.marker}</p>
        <h3>{item.title}</h3>
        <p>
          {item.body.split(/\s+/).map((word, wordIndex) => (
            <span key={`${word}-${wordIndex}`}>{word}{wordIndex < item.body.split(/\s+/).length - 1 ? ' ' : ''}</span>
          ))}
        </p>
      </motion.div>

      <ol className="immersive-method-progress" aria-label="Progreso del método">
        {Array.from({ length: total }, (_, stepIndex) => (
          <li key={stepIndex} data-active={stepIndex === index ? 'true' : undefined}>
            <span>{String(stepIndex + 1).padStart(2, '0')}</span>
          </li>
        ))}
      </ol>
    </article>
  )
}

export default function ImmersiveMethodStage({ items = [], heading, body }) {
  const { mode } = useCapabilities()
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []
  if (!safeItems.length) return null

  const length = mode === 'desktop' ? '330vh' : '220vh'

  return (
    <div className="immersive-method">
      <NarrativeIntro className="immersive-method-intro" image="/images/bayona-generated/home-method-1600.webp" label="02 / EL MÉTODO" id="home-mechanism-heading" title={heading} body={body} />

      <ol className="sr-only" aria-label="Método BAYONA en tres pasos">
        {safeItems.map((step) => (
          <li key={step.id}>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>

      <StickyStage
        length={length}
        states={safeItems.length}
        topOffset={66}
        allowMobile
        className="immersive-method-stage photo-story-stage"
      >
        {({ index, progress, isStatic }) => {
          const active = safeItems[index] ?? safeItems[0]

          return (
            <div className="immersive-method-viewport">
              <div className="immersive-method-visual">
                {isStatic ? (
                  <JourneyScene progress={progress} activeIndex={index} staticMode />
                ) : (
                  <JourneyScene progress={progress} activeIndex={index} />
                )}
              </div>

              <MethodAct
                item={active}
                index={index}
                total={safeItems.length}
                isStatic={isStatic}
              />
            </div>
          )
        }}
      </StickyStage>
    </div>
  )
}
