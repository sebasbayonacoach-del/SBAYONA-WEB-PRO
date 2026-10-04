import { motion } from 'framer-motion'
import { Lock, Unlock } from 'lucide-react'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import '../../styles/pain-unlock-stage.css'
import '../../styles/pain-unlock-contrast.css'

function LockRail({ items, activeIndex }) {
  return (
    <div className="pain-unlock-rail" aria-hidden="true">
      {items.map((item, index) => {
        const isPast = index < activeIndex
        const isActive = index === activeIndex
        const Icon = isPast ? Unlock : Lock

        return (
          <div
            className="pain-unlock-lock"
            data-active={isActive ? 'true' : undefined}
            data-past={isPast ? 'true' : undefined}
            key={item.id}
          >
            <span className="pain-unlock-lock__number">{item.marker}</span>
            <span className="pain-unlock-lock__icon">
              <Icon size={38} strokeWidth={1.15} />
            </span>
            <span className="pain-unlock-lock__line" />
          </div>
        )
      })}
    </div>
  )
}

function ActiveProblem({ item, index, isStatic }) {
  return (
    <motion.article
      className="pain-unlock-copy"
      aria-hidden="true"
      key={item.id}
      initial={isStatic ? false : { opacity: 0, y: 28, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="pain-unlock-copy__marker">{String(index + 1).padStart(2, '0')} / 04</p>
      <h3>{item.title}</h3>
      <p>
        {item.body.split(/\s+/).map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`}>{word}{wordIndex < item.body.split(/\s+/).length - 1 ? ' ' : ''}</span>
        ))}
      </p>
    </motion.article>
  )
}

export default function PainUnlockStage({ block }) {
  const { mode } = useCapabilities()
  const items = block?.items ?? []
  if (!items.length) return null

  const length = mode === 'desktop' ? '145vh' : '155vh'

  return (
    <div className="pain-unlock">
      <header className="pain-unlock-intro">
        <p>01 / ¿TE RECONOCES AQUÍ?</p>
        <h2 id="transformation-heading">{block.heading}</h2>
        <span>{block.body}</span>
      </header>

      <ol className="sr-only" aria-label="Situaciones que puedes transformar">
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
        allowMobile
        className="pain-unlock-stage"
      >
        {({ index, isStatic }) => {
          const active = items[index] ?? items[0]

          return (
            <div className="pain-unlock-viewport">
              <div className="pain-unlock-visual">
                <p className="pain-unlock-visual__caption">ABRIMOS UNO A LA VEZ</p>
                <LockRail items={items} activeIndex={index} />
                <div className="pain-unlock-axis" aria-hidden="true">
                  <span style={{ '--unlock-progress': `${((index + 1) / items.length) * 100}%` }} />
                </div>
              </div>

              <ActiveProblem item={active} index={index} isStatic={isStatic} />
            </div>
          )
        }}
      </StickyStage>
    </div>
  )
}
