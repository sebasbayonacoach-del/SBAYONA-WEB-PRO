import { ArrowUpRight } from 'lucide-react'
import { SectionLabel } from '../Layout.jsx'
import { trackEvent } from '../../lib/analytics/analytics.js'
import '../../styles/home-guided-start.css'

/** Three steps, entirely visible. No scrolling state, hidden stages or selectors. */
export default function GuidedStartJourney({ steps }) {
  return (
    <section className="gym-home-process start-journey start-journey--open" aria-labelledby="gym-process-title">
      <div className="gym-home-shell start-journey__layout">
        <div className="start-journey__intro">
          <div className="gym-section-heading">
            <SectionLabel>CONTIGO DESDE EL PRIMER PASO</SectionLabel>
            <h2 id="gym-process-title">TRES PASOS <span>PARA EMPEZAR.</span></h2>
            <p className="start-journey__subline">Sin pasos escondidos ni formularios obligatorios. Aquí está el proceso completo.</p>
          </div>
          <div className="start-journey__finish">
            <span className="start-journey__finish-label">A TU RITMO / SIN PRISA</span>
            <a className="gym-primary-button start-journey__cta" href="#empieza"
              onClick={() => trackEvent('funnel_start_click', { source:'home_start_journey' })}>
              EMPEZAR A MI RITMO <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
        <ol className="gym-process-grid start-journey__list">
          {steps.map((step,index)=>(
            <li key={step.number} className="start-journey__step is-active">
              <div className="start-journey__step-top">
                <span className="start-journey__step-index">{step.number} <small>/ 03</small></span>
                <span className="start-journey__step-kicker">{['TE ESCUCHO','TE COMPARTO','TÚ DECIDES'][index]}</span>
              </div>
              <div className="start-journey__step-body">
                <h3>{step.title}</h3><p>{step.copy}</p>
              </div>
              <span className="start-journey__step-watermark" aria-hidden="true">{step.number}</span>
              <span className="start-journey__step-foot" aria-hidden="true">BAYONA / INICIO <span>TODO CLARO, A TU RITMO</span></span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
