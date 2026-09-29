import { motion, useTransform } from 'framer-motion'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import '../../styles/immersive-method-stage.css'

const STEP_VERBS = ['LEER', 'DISEÑAR', 'AJUSTAR']

function DynamicMethodObject({ progress, activeIndex }) {
  const rotateX = useTransform(progress, [0, 1], [58, 18])
  const rotateY = useTransform(progress, [0, 1], [-34, 326])
  const rotateZ = useTransform(progress, [0, 1], [-8, 8])
  const coreScale = useTransform(progress, [0, 0.5, 1], [0.82, 1.08, 0.92])
  const coreY = useTransform(progress, [0, 1], ['10%', '-10%'])

  return (
    <motion.div
      className="immersive-method-object"
      style={{ rotateX, rotateY, rotateZ }}
      aria-hidden="true"
    >
      <div className="immersive-method-ring immersive-method-ring--outer" />
      <div className="immersive-method-ring immersive-method-ring--mid" />
      <div className="immersive-method-ring immersive-method-ring--inner" />
      <motion.div className="immersive-method-core" style={{ scale: coreScale, y: coreY }}>
        <span>{String(activeIndex + 1).padStart(2, '0')}</span>
      </motion.div>
      {STEP_VERBS.map((verb, index) => (
        <span
          className="immersive-method-node"
          data-active={activeIndex === index ? 'true' : undefined}
          key={verb}
        >
          {verb}
        </span>
      ))}
    </motion.div>
  )
}

function StaticMethodObject({ activeIndex }) {
  return (
    <div className="immersive-method-object immersive-method-object--static" aria-hidden="true">
      <div className="immersive-method-ring immersive-method-ring--outer" />
      <div className="immersive-method-ring immersive-method-ring--mid" />
      <div className="immersive-method-ring immersive-method-ring--inner" />
      <div className="immersive-method-core">
        <span>{String(activeIndex + 1).padStart(2, '0')}</span>
      </div>
    </div>
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

  const length = mode === 'desktop' ? '150vh' : '160vh'

  return (
    <div className="immersive-method">
      <div className="immersive-method-intro">
        <p className="immersive-method-kicker">02 / EL MÉTODO</p>
        <h2 id="home-mechanism-heading">{heading}</h2>
        <p>{body}</p>
      </div>

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
        className="immersive-method-stage"
      >
        {({ index, progress, isStatic }) => {
          const active = safeItems[index] ?? safeItems[0]

          return (
            <div className="immersive-method-viewport">
              <div className="immersive-method-visual">
                {isStatic ? (
                  <StaticMethodObject activeIndex={index} />
                ) : (
                  <DynamicMethodObject progress={progress} activeIndex={index} />
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
