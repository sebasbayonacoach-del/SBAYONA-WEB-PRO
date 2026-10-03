import { motion, useTransform } from 'framer-motion'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import '../../styles/proof-process-stage.css'

const PROOF_LABELS = ['CONTEXTO', 'PLAN', 'AJUSTE']

function DynamicProcessObject({ progress, activeIndex }) {
  const rotateX = useTransform(progress, [0, 1], [64, 28])
  const rotateY = useTransform(progress, [0, 1], [-14, 18])
  const y = useTransform(progress, [0, 1], ['6%', '-6%'])

  return (
    <motion.div
      className="proof-process-object"
      style={{ rotateX, rotateY, y }}
      aria-hidden="true"
    >
      {PROOF_LABELS.map((label, index) => (
        <div
          className="proof-process-plane"
          data-active={index === activeIndex ? 'true' : undefined}
          data-past={index < activeIndex ? 'true' : undefined}
          key={label}
          style={{ '--plane-index': index }}
        >
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{label}</strong>
          <i />
        </div>
      ))}
      <div className="proof-process-pulse" style={{ '--pulse-index': activeIndex }} />
    </motion.div>
  )
}

function StaticProcessObject({ activeIndex }) {
  return (
    <div className="proof-process-object proof-process-object--static" aria-hidden="true">
      {PROOF_LABELS.map((label, index) => (
        <div
          className="proof-process-plane"
          data-active={index === activeIndex ? 'true' : undefined}
          key={label}
          style={{ '--plane-index': index }}
        >
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{label}</strong>
          <i />
        </div>
      ))}
    </div>
  )
}

export default function ProofProcessStage({ block }) {
  const { mode } = useCapabilities()
  const items = block?.items ?? []
  if (!items.length) return null

  const length = mode === 'desktop' ? '170vh' : '180vh'

  return (
    <div className="proof-process-immersive">
      <header className="proof-process-intro">
        <p>04 / EXPERIENCIA</p>
        <h2 id="home-proof-heading">{block.heading}</h2>
        <span>{block.body}</span>
      </header>

      <ol className="proof-process-list sr-only" aria-label="Proceso verificable de BAYONA">
        {items.map((item) => (
          <li key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ol>

      <StickyStage
        length={length}
        states={items.length}
        topOffset={66}
        className="proof-process-stage"
      >
        {({ index, progress, isStatic }) => {
          const item = items[index] ?? items[0]
          const words = item.title.split(/\s+/)

          return (
            <div className="proof-process-viewport">
              <div className="proof-process-visual">
                {isStatic ? (
                  <StaticProcessObject activeIndex={index} />
                ) : (
                  <DynamicProcessObject progress={progress} activeIndex={index} />
                )}
              </div>

              <motion.article
                className="proof-process-copy"
                aria-hidden="true"
                key={item.id}
                initial={isStatic ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
              >
                <p>{PROOF_LABELS[index] ?? item.marker}</p>
                <h3>
                  {words.map((word, wordIndex) => (
                    <span key={`${word}-${wordIndex}`}>{word}{wordIndex < words.length - 1 ? ' ' : ''}</span>
                  ))}
                </h3>
              </motion.article>

              <p className="proof-process-counter" aria-hidden="true">
                {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </p>
            </div>
          )
        }}
      </StickyStage>
    </div>
  )
}
