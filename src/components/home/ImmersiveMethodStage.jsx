import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Rocket } from 'lucide-react'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import '../../styles/immersive-method-stage.css'

const STEP_VERBS = ['LEER', 'DISEÑAR', 'AJUSTAR']

const ORBIT_STOPS = [
  { title: 'ORIGEN', detail: 'LEER', x: '18%', y: '77%' },
  { title: 'TRAYECTORIA', detail: 'DISEÑAR', x: '55%', y: '46%' },
  { title: 'SIGUIENTE ÓRBITA', detail: 'AJUSTAR', x: '80%', y: '18%' },
]

function JourneyScene({ progress, activeIndex, staticMode = false }) {
  const staticProgress = useMotionValue(activeIndex / 2)
  const driver = staticMode ? staticProgress : progress
  const left = useTransform(driver, [0, .5, 1], ['18%', '55%', '80%'])
  const top = useTransform(driver, [0, .5, 1], ['77%', '46%', '18%'])
  const rotate = useTransform(driver, [0, .5, 1], [-28, 0, 28])
  const depth = useTransform(driver, [0, .5, 1], [.92, 1.15, .95])
  return (
    <div className="bayona-voyage" data-flight={activeIndex + 1} aria-hidden="true">
      <div className="bayona-voyage-sky" />
      <div className="bayona-voyage-stars">
        {Array.from({length:24}, (_,i)=><span key={i} style={{'--star':i,left:`${(i*37+11)%96}%`,top:`${(i*29+9)%91}%`}} />)}
      </div>
      <svg className="bayona-voyage-route" viewBox="0 0 600 600" preserveAspectRatio="none">
        <path d="M 105 474 C 176 470 230 310 334 280 S 435 170 480 105" fill="none" stroke="rgba(244,162,97,.23)" strokeWidth="2" strokeDasharray="6 9" />
        <path d="M 105 474 C 176 470 230 310 334 280 S 435 170 480 105" fill="none" stroke="rgba(244,162,97,.85)" strokeWidth="2" pathLength="100" strokeDasharray={String(((activeIndex+1)/3)*100)+' 100'}/>
      </svg>
      {ORBIT_STOPS.map((stop,index)=>(
        <div className="bayona-voyage-station" style={{left:stop.x,top:stop.y}} data-active={index===activeIndex?'true':undefined} data-past={index<activeIndex?'true':undefined} key={stop.title}>
          <span className="bayona-voyage-station__ring" />
          <span className="bayona-voyage-station__label">{String(index+1).padStart(2,'0')} / {stop.detail}</span>
        </div>
      ))}
      {staticMode ? (
        <div className="bayona-voyage-craft" style={{left:ORBIT_STOPS[activeIndex]?.x,top:ORBIT_STOPS[activeIndex]?.y}}>
          <Rocket size={34} strokeWidth={1.4} />
        </div>
      ) : (
        <motion.div className="bayona-voyage-craft" style={{left,top,rotate,scale:depth}}>
          <Rocket size={34} strokeWidth={1.4} />
          <span className="bayona-voyage-thrust" />
        </motion.div>
      )}
      <span className="bayona-voyage-telemetry">BAYONA / NAVEGACIÓN DE PROGRESO</span>
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

  const length = mode === 'desktop' ? '330vh' : '350vh'

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
