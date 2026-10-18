import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react'
import { COMMERCIAL_SCOPE_NOTICE } from '../../config/offerings.js'
import '../../styles/home-everything-visible.css'
import { useJourneyExperience } from '../experience/JourneyExperienceContext.jsx'

/** Resumen comercial de lectura inmediata; los datos proceden de offerings.js. */
export default function HomeVisiblePlans({ projections }) {
  const { preferences, coachAnswers } = useJourneyExperience()
  const source = coachAnswers.apoyo || preferences.apoyo
  const guidedPlans = {base:'raiz',semanal:'fuerza',integral:'rendimiento',privado:'elite'}
  const suggestion = guidedPlans[source] || (source === 'Una base sencilla' ? 'raiz' : source === 'Seguimiento más frecuente' ? 'fuerza' : null)
  return (
    <div className="bayona-plan-open bayona-plan-open--focused" aria-label="Comparación de los cuatro planes BAYONA">
      <div className="bayona-plan-open__intro">
        <span>CUATRO PLANES · UNA DECISIÓN A TU RITMO</span>
        <p>Precios y prestaciones principales sin abrir pestañas.</p>
      </div>
      <div className="bayona-plan-open__grid">
        {projections.map(({ plan, overlay }, index) => (
          <article
            className={'bayona-plan-open__card' + (plan.featured ? ' bayona-plan-open__card--featured' : '') + (suggestion === plan.id.toLowerCase() ? ' bayona-plan-open__card--suggested' : '')}
            key={plan.id}
            aria-labelledby={'open-plan-' + plan.id}
          >
            <header className="bayona-plan-open__heading">
              <div className="bayona-plan-open__meta">
                <span>{String(index + 1).padStart(2, '0')} / 04</span>
                <span>{suggestion === plan.id.toLowerCase() ? 'PODRÍA INTERESARTE' : plan.featured ? 'MÁS ACOMPAÑAMIENTO' : plan.journey}</span>
              </div>
              <h3 id={'open-plan-' + plan.id}>{plan.name}</h3>
              <p className="bayona-plan-open__descriptor">{overlay.descriptor}</p>
              <div className="bayona-plan-open__price">
                <strong>{plan.priceDisplay}</strong><span>COP / mes</span>
                <small>{plan.eur} aprox. en euros</small>
              </div>
            </header>
            <div className="bayona-plan-open__details">
              <h4>LO PRINCIPAL</h4>
              {plan.includedLead && <p className="bayona-plan-open__lead">{plan.includedLead}</p>}
              <ul className="bayona-plan-open__included">
                {plan.included.slice(0, 3).map(item => (
                  <li key={item}><Check aria-hidden="true" size={17}/>{item}</li>
                ))}
              </ul>
              <p className="bayona-plan-open__short-scope">
                {plan.included.length > 3 ? `Y ${plan.included.length - 3} prestaciones adicionales.` : 'Incluye estas prestaciones.'}
                {' '}Consulta condiciones completas antes de contratar.
              </p>
              {plan.scarcity && <p className="bayona-plan-open__availability">{plan.scarcity}</p>}
            </div>
            <a className="bayona-plan-open__contact" href={plan.cta} target="_blank" rel="noopener noreferrer">
              ME INTERESA {plan.name} <ArrowUpRight size={19} aria-hidden="true"/>
            </a>
          </article>
        ))}
      </div>
      <p className="bayona-plan-open__scope">
        <ShieldCheck size={18} aria-hidden="true" />
        {COMMERCIAL_SCOPE_NOTICE}
        {' '}<a href="/programs">Ver prestaciones y exclusiones completas</a>.
      </p>
    </div>
  )
}
