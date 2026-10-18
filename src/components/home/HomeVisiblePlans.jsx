import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react'
import { COMMERCIAL_SCOPE_NOTICE } from '../../config/offerings.js'
import '../../styles/home-everything-visible.css'

/**
 * Home muestra TODOS los planes, prestaciones, límites y precios simultáneamente.
 * La elección y el contacto son opcionales; no hay carrusel, tabs ni acordeones.
 * Cada cifra y prestación procede de la configuración comercial canónica.
 */
export default function HomeVisiblePlans({ projections }) {
  return (
    <div className="bayona-plan-open" aria-label="Comparación completa de planes BAYONA">
      <div className="bayona-plan-open__intro">
        <span>BAYONA / LOS CUATRO PLANES</span>
        <p>Precios, inclusiones y exclusiones a la vista. Compara desplazándote por la página, sin seleccionar una tarjeta.</p>
      </div>
      <div className="bayona-plan-open__grid">
        {projections.map(({ plan, overlay }, index) => (
          <article className={'bayona-plan-open__card' + (plan.featured ? ' bayona-plan-open__card--featured' : '')} key={plan.id} aria-labelledby={'open-plan-' + plan.id}>
            <header className="bayona-plan-open__heading">
              <div className="bayona-plan-open__meta">
                <span>{String(index + 1).padStart(2, '0')} / {String(projections.length).padStart(2, '0')}</span>
                <span>{plan.featured ? 'PLAN DESTACADO' : plan.tag}</span>
              </div>
              <h3 id={'open-plan-' + plan.id}>{plan.name}</h3>
              <p className="bayona-plan-open__descriptor">{overlay.descriptor}</p>
              <p className="bayona-plan-open__for">{plan.audience || plan.shortDescription}</p>
              <div className="bayona-plan-open__price">
                <strong>{plan.priceDisplay}</strong><span>{plan.currency}</span>
                <small>{plan.eur} · {plan.usdDisplay} (referencias aproximadas)</small>
              </div>
            </header>
            <div className="bayona-plan-open__details">
              <h4>QUÉ RECIBES</h4>
              {plan.includedLead && <p className="bayona-plan-open__lead">{plan.includedLead}</p>}
              <ul className="bayona-plan-open__included">{plan.included.map(item => <li key={item}><Check aria-hidden="true" size={16}/>{item}</li>)}</ul>
              <h4>QUÉ NO INCLUYE</h4>
              {plan.excluded?.length ? <ul className="bayona-plan-open__excluded">{plan.excluded.map(item => <li key={item}>{item}</li>)}</ul> : <p>Sin exclusiones específicas publicadas.</p>}
              {plan.scarcity && <p className="bayona-plan-open__availability">{plan.scarcity}</p>}
            </div>
            <a className="bayona-plan-open__contact" href={plan.cta} target="_blank" rel="noopener noreferrer">CONSULTAR {plan.name} <ArrowUpRight size={19} aria-hidden="true"/></a>
          </article>
        ))}
      </div>
      <p className="bayona-plan-open__scope"><ShieldCheck size={18} aria-hidden="true" /> {COMMERCIAL_SCOPE_NOTICE}</p>
    </div>
  )
}
