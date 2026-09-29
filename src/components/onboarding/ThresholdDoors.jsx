import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const TITLE_WORDS = ['LAS', 'PUERTAS', 'ESTÁN', 'ABIERTAS.']
const EASE = [0.16, 1, 0.3, 1]

export default function ThresholdDoors({ onVisit, onPersonalize, onSkip }) {
  const reducedMotion = useReducedMotion()
  const doorTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.8, delay: 0.12, ease: EASE }

  return (
    <section
      className="threshold-scene"
      aria-labelledby="threshold-title"
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
    >
      <button className="threshold-skip" type="button" onClick={onSkip}>
        SALTAR INTRO
      </button>

      <div className="threshold-architecture" aria-hidden="true">
        <motion.div
          className="threshold-door threshold-door--left"
          initial={reducedMotion ? { x: '-92%' } : { x: 0 }}
          animate={{ x: '-92%' }}
          transition={doorTransition}
        >
          <span />
          <span />
          <span />
        </motion.div>
        <motion.div
          className="threshold-door threshold-door--right"
          initial={reducedMotion ? { x: '92%' } : { x: 0 }}
          animate={{ x: '92%' }}
          transition={doorTransition}
        >
          <span />
          <span />
          <span />
        </motion.div>
        <div className="threshold-light" />
        <div className="threshold-floor" />
      </div>

      <motion.div
        className="threshold-content"
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.65, delay: 0.3, ease: EASE }}
      >
        <p className="threshold-kicker">BAYONA VIRTUAL · ACCESO 01</p>
        <h1 id="threshold-title" aria-label="LAS PUERTAS ESTÁN ABIERTAS.">
          {TITLE_WORDS.map((word, index) => (
            <motion.span
              key={word}
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : {
                duration: 0.5,
                delay: 0.32 + index * 0.07,
                ease: EASE,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <p className="threshold-lead">
          Entra como visitante. Conoce el método. Descubre por dónde empezar.
        </p>
        <div className="threshold-actions" aria-label="Opciones de entrada">
          <button className="umbral-button umbral-button--primary" type="button" onClick={onVisit}>
            ENTRAR COMO VISITANTE <ArrowRight size={18} strokeWidth={1} aria-hidden="true" />
          </button>
          <button className="umbral-button umbral-button--secondary" type="button" onClick={onPersonalize}>
            ENCONTRAR MI CAMINO · 60 SEGUNDOS
          </button>
        </div>
      </motion.div>

      <p className="threshold-coordinate" aria-hidden="true">40.4168° N · 03.7038° W</p>
    </section>
  )
}
