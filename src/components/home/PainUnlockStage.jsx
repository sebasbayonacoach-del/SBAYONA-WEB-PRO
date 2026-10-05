import NarrativeIntro from './NarrativeIntro.jsx'
import { motion } from 'framer-motion'
import { Activity, ArrowUpRight, Crosshair, Route, Target } from 'lucide-react'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import '../../styles/pain-unlock-stage.css'
import '../../styles/pain-unlock-contrast.css'

const CHECKPOINT_ICONS = [Crosshair, Activity, Route, Target]

function ProgressRail({ items, activeIndex }) {
  return (
    <div className="pain-unlock-rail pain-navigation" aria-hidden="true">
      {items.map((item, index) => {
        const Icon = CHECKPOINT_ICONS[index] ?? Target
        return (
          <div
            className="pain-navigation-stop"
            data-active={index === activeIndex ? 'true' : undefined}
            data-past={index < activeIndex ? 'true' : undefined}
            key={item.id}
          >
            <span className="pain-navigation-stop__number">{item.marker}</span>
            <span className="pain-navigation-stop__orb"><Icon size={27} strokeWidth={1.55} /></span>
            <span className="pain-navigation-stop__axis" />
          </div>
        )
      })}
      <span className="pain-navigation-indicator" style={{ '--stage': activeIndex }} />
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

  const length = mode === 'desktop' ? '280vh' : '180vh'

  return (
    <div className="pain-unlock">
      <NarrativeIntro className="pain-unlock-intro" image="/images/bayona-generated/home-problem-no-time-1600.webp" label="01 / TU PUNTO DE PARTIDA" id="transformation-heading" title={block.heading} body={block.body} />

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
        className="pain-unlock-stage photo-story-stage"
      >
        {({ index, isStatic }) => {
          const active = items[index] ?? items[0]

          return (
            <div className="pain-unlock-viewport">
              <div className="pain-unlock-visual">
                <img className="photo-story-background" src={`/images/bayona-generated/${['home-problem-no-time', 'home-problem-fatigue', 'home-problem-no-results', 'home-problem-body-signals'][index] ?? 'home-problem-no-time'}-1600.webp`} alt="" width="1600" height="900" loading="lazy" decoding="async" />
                <p className="pain-unlock-visual__caption">CUATRO PUNTOS DE PARTIDA / UNA DIRECCIÓN</p>
                <ProgressRail items={items} activeIndex={index} />
                <div className="pain-navigation-caption" aria-hidden="true"><span>IDENTIFICAR</span><ArrowUpRight size={15} /><span>AVANZAR</span></div>
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
