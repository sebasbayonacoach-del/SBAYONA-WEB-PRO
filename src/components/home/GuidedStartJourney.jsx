import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { SectionLabel } from '../Layout.jsx'
import { trackEvent } from '../../lib/analytics/analytics.js'
import '../../styles/home-guided-start.css'

/** Scroll-directed reading, not scroll hijacking: all three original steps are
 * real DOM content, fully readable by keyboard, mobile and reduced-motion users. */
export default function GuidedStartJourney({ steps }) {
  const journeyRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const root = journeyRef.current
    if (!root) return undefined
    const cards = [...root.querySelectorAll('.start-journey__step')]
    let scheduled = false
    let frame = null

    const update = () => {
      scheduled = false
      if (!cards.length) return
      const focusLine = window.innerHeight * .62
      let next = 0
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect()
        if (rect.height > 0 && rect.top <= focusLine) next = index
      })
      setActiveStep(current => current === next ? current : next)
    }
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [steps])

  const goToStep = index => {
    const target = journeyRef.current?.querySelectorAll('.start-journey__step')[index]
    if (!target) return
    setActiveStep(index)
    const reducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' })
    trackEvent('home_start_step_select', { step: index + 1 })
  }

  return (
    <section className={`gym-home-process start-journey${activeStep === steps.length - 1 ? ' is-complete' : ''}`}
      ref={journeyRef} data-active-step={activeStep + 1} aria-labelledby="gym-process-title">
      <div className="gym-home-shell start-journey__layout">
        <div className="start-journey__intro">
          <div className="gym-section-heading">
            <SectionLabel>CONTIGO DESDE EL PRIMER PASO</SectionLabel>
            <h2 id="gym-process-title">TRES PASOS <span>PARA EMPEZAR.</span></h2>
            <p className="start-journey__subline">No hay un ritmo perfecto. Hay un comienzo que puede ser tuyo.</p>
          </div>
          <div className="start-journey__control" aria-label="Progreso del recorrido de inicio">
            <div className="start-journey__progress-meta">
              <span>RECORRIDO / BAYONA</span>
              <strong>{String(activeStep + 1).padStart(2, '0')} <small>/ 03</small></strong>
            </div>
            <div className="start-journey__progress-track" role="progressbar"
              aria-label="Progreso de los tres pasos" aria-valuemin={1} aria-valuemax={steps.length}
              aria-valuenow={activeStep + 1}>
              <span style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} />
            </div>
            <div className="start-journey__progress-points" aria-label="Ir a un paso del recorrido">
              {steps.map((step, index) => (
                <button key={step.number} type="button"
                  aria-label={`Ir al paso ${step.number}: ${step.title}`}
                  aria-current={activeStep === index ? 'step' : undefined}
                  className={index === activeStep ? 'is-active' : ''}
                  onClick={() => goToStep(index)}>{step.number}</button>
              ))}
            </div>
          </div>
          <div className="start-journey__finish">
            <span className="start-journey__finish-label">{activeStep === steps.length - 1 ? 'CUANDO QUIERAS / AQUÍ ESTOY' : 'A TU RITMO / PASO A PASO'}</span>
            <a className="gym-primary-button start-journey__cta" href="#empieza"
              onClick={() => trackEvent('funnel_start_click', { source: 'home_start_journey', step: activeStep + 1 })}>
              EMPEZAR A MI RITMO <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
        <ol className="gym-process-grid start-journey__list">
          {steps.map((step, index) => (
            <li key={step.number} className={`start-journey__step${activeStep === index ? ' is-active' : ''}`}
              aria-current={activeStep === index ? 'step' : undefined}>
              <div className="start-journey__step-top">
                <span className="start-journey__step-index">{step.number} <small>/ 03</small></span>
                <span className="start-journey__step-kicker">{['TE ESCUCHO', 'TE COMPARTO', 'TÚ DECIDES'][index]}</span>
              </div>
              <div className="start-journey__step-body">
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
              <span className="start-journey__step-watermark" aria-hidden="true">{step.number}</span>
              <span className="start-journey__step-foot" aria-hidden="true">
                BAYONA / INICIO <span>{index === steps.length - 1 ? 'AQUÍ COMIENZA TU CAMINO' : 'VAMOS AL SIGUIENTE ↓'}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
