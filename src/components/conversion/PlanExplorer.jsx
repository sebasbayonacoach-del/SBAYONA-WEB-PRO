import { ChevronDown, MoveRight, Play } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { membershipPlanEditorialProjection } from '../../config/conversionContent.js'
import { mediaHeroUrls, siteMedia } from '../../config/siteMedia.js'
import {
  COMMERCIAL_SCOPE_NOTICE,
  membershipComparisonRows,
} from '../../config/offerings.js'

function planAnchorId(planId) {
  return `plan-${String(planId).toLowerCase()}`
}

/**
 * Presenta los planes como un showroom: el selector conserva las cuatro rutas
 * comerciales y una única suite activa concentra la información y las acciones.
 * Los datos canónicos siguen procediendo de offerings.js y la capa editorial.
 */
export default function PlanExplorer({
  projections = membershipPlanEditorialProjection,
  comparisonRows = membershipComparisonRows,
}) {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const selectorRefs = useRef(new Map())
  const detailRef = useRef(null)
  const defaultPlanId = projections.find(({ plan }) => plan.featured)?.plan.id
    ?? projections[0]?.plan.id
  const [activePlanId, setActivePlanId] = useState(defaultPlanId)
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  useEffect(() => {
    if (projections.some(({ plan }) => plan.id === activePlanId)) return
    
    const newDefaultId = projections.find(({ plan }) => plan.featured)?.plan.id
      ?? projections[0]?.plan.id
    setActivePlanId(newDefaultId)
  }, [projections])

  useEffect(() => {
    if (detailsExpanded && detailRef.current) {
      detailRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [activePlanId])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const selectPlanFromHash = () => {
      const projection = projections.find(({ plan }) => `#${planAnchorId(plan.id)}` === window.location.hash)
      if (!projection) return

      setActivePlanId(projection.plan.id)
      setDetailsExpanded(false)
      window.requestAnimationFrame(() => selectorRefs.current.get(projection.plan.id)?.focus())
    }

    selectPlanFromHash()
    window.addEventListener('hashchange', selectPlanFromHash)
    return () => window.removeEventListener('hashchange', selectPlanFromHash)
  }, [projections])

  if (!projections.length) return null

  const activeIndex = Math.max(
    0,
    projections.findIndex(({ plan }) => plan.id === activePlanId),
  )
  const { plan, overlay } = projections[activeIndex]
  const headingId = `${instanceId}-${plan.id.toLowerCase()}-heading`
  const previewId = `${instanceId}-plan-preview`
  const disclosureId = `${instanceId}-${plan.id.toLowerCase()}-disclosure`
  const detailsId = `${instanceId}-${plan.id.toLowerCase()}-details`
  const comparisonHeadingId = `${instanceId}-${plan.id.toLowerCase()}-comparison-heading`
  const comparisonAttributes = comparisonRows.map((row) => ({
    label: row.feature,
    value: row.values[activeIndex],
  }))
  const signatureAttributes = comparisonAttributes.slice(0, 3)
  const previewInclusions = plan.included.slice(0, 3)
  const planPoster = siteMedia.plans[plan.id]?.poster
  const planPosterUrl = planPoster ? mediaHeroUrls(planPoster).retina : ''

  const selectPlan = (planId) => {
    setActivePlanId(planId)
    setDetailsExpanded(false)
  }

  const handleSelectorKeyDown = (event, currentIndex) => {
    let nextIndex = null

    if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
      nextIndex = (currentIndex + 1) % projections.length
    } else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
      nextIndex = (currentIndex - 1 + projections.length) % projections.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = projections.length - 1
    }

    if (nextIndex == null) return
    event.preventDefault()
    const nextPlanId = projections[nextIndex].plan.id
    selectPlan(nextPlanId)
    selectorRefs.current.get(nextPlanId)?.focus()
  }

  return (
    <div className="plan-explorer plan-showroom">
      <ol
        className="plan-comparison-list plan-showroom-selector"
        aria-label="Comparación de planes por plan"
        data-comparison-layout="showroom"
      >
        {projections.map(({ plan: optionPlan, overlay: optionOverlay }, index) => {
          const isActive = optionPlan.id === plan.id
          const selectorId = `${instanceId}-${optionPlan.id.toLowerCase()}-selector`

          return (
            <li
              id={planAnchorId(optionPlan.id)}
              key={optionPlan.id}
              className={`plan-comparison-item${isActive ? ' is-active' : ''}`}
              data-plan-id={optionPlan.id}
              tabIndex={-1}
            >
              <button
                ref={(node) => {
                  if (node) selectorRefs.current.set(optionPlan.id, node)
                  else selectorRefs.current.delete(optionPlan.id)
                }}
                id={selectorId}
                className="plan-showroom-tab"
                type="button"
                aria-pressed={isActive}
                aria-controls={previewId}
                aria-label={`Ver plan ${optionPlan.name}`}
                onClick={() => selectPlan(optionPlan.id)}
                onKeyDown={(event) => handleSelectorKeyDown(event, index)}
              >
                <span className="plan-showroom-tab-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="plan-showroom-tab-copy">
                  <strong>{optionPlan.name}</strong>
                  <small>{optionOverlay.descriptor}</small>
                </span>
                <span className="plan-showroom-tab-price">
                  {optionPlan.price}
                  <small> COP</small>
                </span>
                {optionPlan.featured && <em>DESTACADO</em>}
              </button>
            </li>
          )
        })}
      </ol>

      <div
        className="plan-showroom-stage"
        data-active-plan={plan.id}
        aria-live="polite"
        aria-atomic="true"
      >
        <article
          ref={detailRef}
          id={previewId}
          className={`plan-showroom-preview is-visible${plan.featured ? ' is-featured' : ''}`}
          aria-labelledby={headingId}
          data-plan-id={plan.id}
        >
          <div className="plan-showroom-primary">
            <div className="plan-showroom-meta">
              <span>MEMBERSHIP {String(activeIndex + 1).padStart(2, '0')} / {String(projections.length).padStart(2, '0')}</span>
              <span>{plan.tag}</span>
            </div>

            <header className="plan-summary-heading">
              <h3 id={headingId} className="plan-canonical-name">{plan.name}</h3>
              <p className="plan-descriptor">{overlay.descriptor}</p>
            </header>

            <div className="plan-showroom-narrative">
              <div className="plan-summary-jtbd">
                <span>EL CAMBIO QUE BUSCAS</span>
                <p>{overlay.jtbdSummary}</p>
              </div>
              <p className="plan-summary-scope">{plan.shortDescription}</p>
              <p className="plan-summary-value">{overlay.valueSummary}</p>
            </div>

            <dl className="plan-summary-price plan-showroom-price">
              <dt>INVERSIÓN MENSUAL</dt>
              <dd>
                <span className="plan-price">{plan.priceDisplay}</span>
                <span className="plan-unit">{plan.currency}</span>
                <span className="plan-price-separator" aria-hidden="true" />
                <span className="plan-eur">{plan.eur}</span>
                <span className="plan-usd">{plan.usdDisplay}</span>
              </dd>
            </dl>

            <div className="plan-card-actions">
              <a
                href={plan.cta}
                target="_blank"
                rel="noopener noreferrer"
                className="plan-cta"
                aria-label={`Consultar ${plan.name} por WhatsApp`}
              >
                ELEGIR {plan.name} <MoveRight size={17} aria-hidden="true" />
              </a>
              <Link
                to={`/plan/${plan.id.toLowerCase()}`}
                className="plan-presentation-link"
                aria-label={`Ver presentación de ${plan.name}`}
              >
                <span
                  className="plan-presentation-thumbnail"
                  aria-hidden="true"
                >
                  <Play size={18} fill="currentColor" />
                </span>
                <span className="plan-presentation-copy">
                  <small>VISTA EDITORIAL · PDF</small>
                  <strong>VER PRESENTACIÓN</strong>
                </span>
              </Link>
            </div>
          </div>

          <aside className="plan-showroom-signature" aria-label={`Vista previa de ${plan.name}`}>
            <div
              className="plan-showroom-visual"
              style={{ '--plan-showroom-image': 'url(' + planPosterUrl + ')' }}
              aria-label={planPoster?.alt ?? `Vista visual del plan ${plan.name}`}
              role="img"
            >
              <span className="plan-showroom-visual-kicker">PREVIEW</span>
              <span className="plan-showroom-visual-title">Experiencia en grande</span>
              <span className="plan-showroom-visual-action">
                Presentación completa <Play size={14} fill="currentColor" aria-hidden="true" />
              </span>
            </div>

            <span className="plan-showroom-watermark" aria-hidden="true">
              {String(activeIndex + 1).padStart(2, '0')}
            </span>
            <p className="plan-showroom-signature-label">TU EXPERIENCIA</p>
            <dl className="plan-showroom-facts">
              {signatureAttributes.map(({ label, value }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <div className="plan-showroom-inclusions">
              <p>LO ESENCIAL, SIN RUIDO</p>
              {plan.includedLead && <strong>{plan.includedLead}</strong>}
              <ul>
                {previewInclusions.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <button
              id={disclosureId}
              className="plan-disclosure-button"
              type="button"
              aria-expanded={detailsExpanded}
              aria-controls={detailsId}
              aria-label={`${detailsExpanded ? 'Ocultar' : 'Ver'} alcance y condiciones de ${plan.name}`}
              onClick={() => setDetailsExpanded((current) => !current)}
            >
              <span>{detailsExpanded ? 'VOLVER A LA VISTA ESENCIAL' : 'VER TODO LO QUE INCLUYE'}</span>
              <ChevronDown aria-hidden="true" size={19} />
            </button>
          </aside>

          <div
            id={detailsId}
            className="plan-details-panel"
            role="region"
            aria-labelledby={disclosureId}
            hidden={!detailsExpanded}
          >
            <div className="plan-details-grid">
              <section className="plan-detail-section">
                <h4>Inclusiones publicadas</h4>
                {plan.includedLead && <p className="plan-included-lead">{plan.includedLead}</p>}
                <ul>
                  {plan.included.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>

              <section className="plan-detail-section plan-exclusions">
                <h4>Exclusiones publicadas</h4>
                {plan.excluded?.length > 0 ? (
                  <ul>{plan.excluded.map((item) => <li key={item}>{item}</li>)}</ul>
                ) : (
                  <p>La configuración comercial no publica exclusiones específicas para este plan.</p>
                )}
              </section>

              <section className="plan-detail-section plan-commercial-scope">
                <h4>Condiciones aplicables</h4>
                <p>{COMMERCIAL_SCOPE_NOTICE}</p>
              </section>
            </div>

            <section className="plan-attribute-comparison" aria-labelledby={comparisonHeadingId}>
              <h4 id={comparisonHeadingId}>Comparación de {plan.name} por atributos</h4>
              <dl>
                {comparisonAttributes.map(({ label, value }) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </article>
      </div>
    </div>
  )
}
