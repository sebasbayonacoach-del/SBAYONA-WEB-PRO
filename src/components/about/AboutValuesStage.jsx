import { motion } from 'framer-motion'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import '../../styles/about-values-stage.css'

function ValueFrame({ item, index, total, isStatic }) {
  const [Icon, title, text] = item
  return (
    <div className="about-values-stage__frame">
      <div className="about-values-stage__ghost" aria-hidden="true" data-visual-title={title} />
      <motion.article
        className="about-values-stage__copy"
        key={title}
        aria-hidden="true"
        initial={isStatic ? false : { opacity: 0, x: 42 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: .52, ease: [0.16,1,0.3,1] }}
      >
        <div className="about-values-stage__icon"><Icon size={30} strokeWidth={1.15} /></div>
        <p>{String(index + 1).padStart(2,'0')} / {String(total).padStart(2,'0')}</p>
        <h3 data-visual-title={title} />
        <span data-visual-copy={text} />
      </motion.article>
      <div className="about-values-stage__rail" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => <span key={i} data-active={i === index ? 'true' : undefined}>{String(i + 1).padStart(2,'0')}</span>)}
      </div>
    </div>
  )
}

export default function AboutValuesStage({ items = [] }) {
  const { mode } = useCapabilities()
  if (!items.length) return null
  const length = mode === 'desktop' ? '300vh' : '250vh'

  return (
    <div className="about-values-stage">
      <header className="about-values-stage__intro">
        <p>LO QUE PROMETEMOS</p>
        <h2 id="about-values-title">CUATRO PRINCIPIOS. <span>CERO HUMO.</span></h2>
        <small>Son la diferencia entre comprar otra rutina y entrar en un proceso con dirección.</small>
      </header>

      <ol className="sr-only" aria-label="Principios de BAYONA">
        {items.map(([, title, text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}
      </ol>

      <StickyStage length={length} states={items.length} topOffset={66} allowMobile className="about-values-stage__sticky">
        {({ index, isStatic }) => <ValueFrame item={items[index] ?? items[0]} index={index} total={items.length} isStatic={isStatic} />}
      </StickyStage>
    </div>
  )
}
