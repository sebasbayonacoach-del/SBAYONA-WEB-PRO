import { useId } from 'react'

/**
 * Resumen alcanzable y anunciado de una selección ya calculada por
 * Commercial_Config. No construye solicitudes ni abre canales externos.
 *
 * Las condiciones del marco no médico viven en los textos legales y en las
 * revelaciones desplegables; el resumen persistente es puro número y selección,
 * así que no pinta discursos de cautela encima del total.
 *
 * @param {Object} props
 * @param {ReturnType<import('../../config/offerings.js').calculateExperience>} props.calculation
 */
export default function PersistentSummary({ calculation }) {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const headingId = `${instanceId}-persistent-summary-heading`
  const selectedSessions = calculation.sessions.filter(({ quantity }) => quantity > 0)
  const selectedServices = [...selectedSessions, ...calculation.extras]

  return (
    <aside
      className="persistent-summary"
      aria-labelledby={headingId}
      aria-live="polite"
      aria-atomic="true"
      tabIndex={0}
      data-total-cop={calculation.totalCop}
    >
      <p className="persistent-summary-eyebrow">RESUMEN DE CONFIGURACIÓN</p>
      <h3 id={headingId}>Tu selección actual</h3>

      <dl className="persistent-summary-totals">
        <div>
          <dt>Plan base</dt>
          <dd>{calculation.plan.name}</dd>
        </div>
        <div>
          <dt>Total estimado</dt>
          <dd className="persistent-summary-cop">{calculation.totalDisplay} COP</dd>
        </div>
        <div>
          <dt>Equivalencias EUR / USD</dt>
          <dd>
            <span>{calculation.eurApprox}</span>
            <span aria-hidden="true"> · </span>
            <span>{calculation.usdApprox}</span>
          </dd>
        </div>
      </dl>

      <section className="persistent-summary-selection" aria-label="Servicios seleccionados">
        <h4>Servicios y extras</h4>
        {selectedServices.length > 0 ? (
          <ul>
            {selectedSessions.map((service) => (
              <li key={service.id}>
                <span>{service.label}</span>
                <strong>{service.quantity} × {service.priceDisplay} COP</strong>
              </li>
            ))}
            {calculation.extras.map((service) => (
              <li key={service.id}>
                <span>{service.label}</span>
                <strong>{service.priceDisplay} COP</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>Sin sesiones ni extras seleccionados.</p>
        )}
      </section>

      <p className="persistent-summary-eur-note">
        Equivalencia EUR aproximada y no contractual.
      </p>
      <p className="persistent-summary-eur-note">
        Equivalencia USD aproximada y no contractual.
      </p>
    </aside>
  )
}
