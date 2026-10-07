import { motion, useTransform } from 'framer-motion'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import '../../styles/about-method-stage.css'

function DecisionBeam({ progress, activeIndex, total }) {
  const y = useTransform(progress, [0, 1], ['8%', '88%'])
  const glow = useTransform(progress, [0, .5, 1], [.6, 1, .72])

  return (
    <div className="about-decision-beam" aria-hidden="true">
      <span className="about-decision-beam__track" />
      <motion.i className="about-decision-beam__pulse" style={{ y, opacity: glow }} />
      {Array.from({ length: total }, (_, index) => (
        <b
          key={index}
          data-active={index === activeIndex ? 'true' : undefined}
          data-past={index < activeIndex ? 'true' : undefined}
          style={{ '--decision-index': index }}
        >
          {String(index + 1).padStart(2, '0')}
        </b>
      ))}
    </div>
  )
}

/* StickyStage entrega un número en modo estático: no debe llegar a useTransform. */
function StaticDecisionBeam({ activeIndex, total }) {
  return (
    <div className="about-decision-beam" aria-hidden="true">
      <span className="about-decision-beam__track" />
      {Array.from({ length: total }, (_, index) => (
        <b
          key={index}
          data-active={index === activeIndex ? 'true' : undefined}
          data-past={index < activeIndex ? 'true' : undefined}
          style={{ '--decision-index': index }}
        >
          {String(index + 1).padStart(2, '0')}
        </b>
      ))}
    </div>
  )
}

function DecisionCopy({ item, index, isStatic }) {
  return (
    <motion.article
      className="about-decision-copy"
      key={item.number}
      aria-hidden="true"
      initial={isStatic ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .48, ease: [0.16,1,0.3,1] }}
    >
      <p>DECISIÓN {item.number}</p>
      <h3>{item.title}</h3>
      <span>{item.copy}</span>
    </motion.article>
  )
}

export default function AboutMethodStage({ items = [] }) {
  const { mode } = useCapabilities()
  if (!items.length) return null

  const length = mode === 'desktop' ? '150vh' : '140vh'

  return (
    <div className="about-decision-stage">
      <StickyStage
        length={length}
        states={items.length}
        topOffset={66}
        allowMobile
        className="about-decision-stage__sticky"
      >
        {({ index, progress, isStatic }) => (
          <div className="about-decision-stage__frame">
            {isStatic ? (
              <StaticDecisionBeam activeIndex={index} total={items.length} />
            ) : (
              <DecisionBeam progress={progress} activeIndex={index} total={items.length} />
            )}
            <DecisionCopy item={items[index] ?? items[0]} index={index} isStatic={isStatic} />
            <p className="about-decision-stage__counter" aria-hidden="true">
              {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </p>
          </div>
        )}
      </StickyStage>
    </div>
  )
}
