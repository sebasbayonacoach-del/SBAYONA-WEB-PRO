import { motion, useTransform } from 'framer-motion'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import '../../styles/vision-shift-stage.css'

const VISION_LABELS = ['ACCIÓN', 'LECTURA', 'INTENCIÓN', 'DIRECCIÓN', 'CONTINUIDAD']

function DynamicLens({ progress, index }) {
  const x = useTransform(progress, [0, 1], ['-24%', '24%'])
  const rotate = useTransform(progress, [0, 1], [-7, 7])
  const scale = useTransform(progress, [0, 0.5, 1], [0.88, 1.06, 0.92])

  return (
    <motion.div className="vision-shift-lens" style={{ x, rotate, scale }} aria-hidden="true">
      <div className="vision-shift-lens__image" />
      <div className="vision-shift-lens__scan" />
      <span>{String(index + 1).padStart(2, '0')}</span>
    </motion.div>
  )
}

function StaticLens({ index }) {
  return (
    <div className="vision-shift-lens vision-shift-lens--static" aria-hidden="true">
      <div className="vision-shift-lens__image" />
      <span>{String(index + 1).padStart(2, '0')}</span>
    </div>
  )
}

export default function VisionShiftStage({ block }) {
  const { mode } = useCapabilities()
  const items = block?.items ?? []
  if (!items.length) return null

  const length = mode === 'desktop' ? '155vh' : '165vh'

  return (
    <div className="vision-shift">
      <header className="vision-shift-intro">
        <p>LO PRIMERO QUE CAMBIA</p>
        <h2 id="home-vision-heading">{block.heading}</h2>
        <span>{block.body}</span>
        <a className="vision-shift-follow" href="#problemas">
          VAMOS A VER CÓMO FUNCIONA <span aria-hidden="true">↓</span>
        </a>
      </header>

      <ol className="sr-only" aria-label="Cambios que notas cuando entrenas con dirección">
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
        className="vision-shift-stage"
      >
        {({ index, progress, isStatic }) => {
          const item = items[index] ?? items[0]
          const words = item.title.split(/\s+/)

          return (
            <div className="vision-shift-viewport">
              <div className="vision-shift-visual">
                {isStatic ? (
                  <StaticLens index={index} />
                ) : (
                  <DynamicLens progress={progress} index={index} />
                )}
                <div className="vision-shift-axis" aria-hidden="true">
                  {items.map((entry, stepIndex) => (
                    <span
                      key={entry.id}
                      data-active={stepIndex === index ? 'true' : undefined}
                      data-past={stepIndex < index ? 'true' : undefined}
                    />
                  ))}
                </div>
              </div>

              <motion.article
                className="vision-shift-copy"
                aria-hidden="true"
                key={item.id}
                initial={isStatic ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p>{VISION_LABELS[index] ?? item.marker}</p>
                <h3>
                  {words.map((word, wordIndex) => (
                    <span key={`${word}-${wordIndex}`}>{word}{wordIndex < words.length - 1 ? ' ' : ''}</span>
                  ))}
                </h3>
              </motion.article>

              <p className="vision-shift-counter" aria-hidden="true">
                {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </p>
            </div>
          )
        }}
      </StickyStage>
    </div>
  )
}
