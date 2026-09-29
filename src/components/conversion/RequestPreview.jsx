import { useMemo, useState } from 'react'
import {
  buildExperienceWhatsAppUrl,
  calculateExperience,
} from '../../config/offerings.js'

function normalizeContactValue(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function contactFieldsFrom(selection) {
  const contact = selection?.contact ?? {}

  return [
    ['Nombre', contact.nombre ?? contact.name],
    ['Email', contact.email],
    ['WhatsApp', contact.whatsapp],
  ]
    .map(([label, value]) => [label, normalizeContactValue(value)])
    .filter(([, value]) => value)
}

function exactMessageLines(message) {
  return message
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Presenta el borrador exacto construido por Commercial_Config antes de crear
 * una acción utilizable hacia el tercero. El estado revisado pertenece a una
 * selección inmutable concreta: cualquier cambio posterior vuelve a bloquear
 * Official_WhatsApp, incluso si recupera valores usados anteriormente.
 *
 * @param {Object} props
 * @param {{planId:string, serviceQuantities?:Record<string, number>, extraIds?:ReadonlyArray<string>, contact?:Object}} props.selection
 */
export default function RequestPreview({ selection }) {
  const requestUrl = useMemo(
    () => buildExperienceWhatsAppUrl(selection),
    [selection],
  )
  const calculation = useMemo(
    () => calculateExperience(selection),
    [selection],
  )
  const message = useMemo(
    () => new URL(requestUrl).searchParams.get('text') ?? '',
    [requestUrl],
  )
  const messageLines = useMemo(() => exactMessageLines(message), [message])
  const geographicConditions = messageLines.filter((line) => (
    line.toLowerCase().includes('ubicación')
  ))
  const nonContractualNotices = messageLines.filter((line) => {
    const normalizedLine = line.toLowerCase()
    return normalizedLine.includes('no contractual')
      || normalizedLine.includes('no constituye')
  })
  const [reviewedRequest, setReviewedRequest] = useState(null)
  const isReviewed = reviewedRequest?.selection === selection
    && reviewedRequest?.requestUrl === requestUrl
  const selectedSessions = calculation.sessions.filter(({ quantity }) => quantity > 0)
  const selectedServices = [...selectedSessions, ...calculation.extras]
  const contactFields = contactFieldsFrom(selection)
  const reviewButtonLabel = reviewedRequest
    ? isReviewed ? 'Volver a revisar el mensaje' : 'Revisar mensaje actualizado'
    : 'Revisar mensaje exacto'

  const reviewCurrentRequest = () => {
    setReviewedRequest({ selection, requestUrl })
  }

  return (
    <section
      className="request-preview"
      aria-labelledby="request-preview-heading"
      data-preview-state={isReviewed ? 'reviewed' : 'pending'}
    >
      <div className="request-preview-heading">
        <p className="request-preview-eyebrow">REVISIÓN ANTES DEL TERCERO</p>
        <h3 id="request-preview-heading">Revisa tu solicitud antes de abrir WhatsApp</h3>
        <p>
          Nada se envía desde esta página. Primero revisa el texto exacto, los datos incluidos y
          las condiciones; después podrás decidir si abres el canal oficial de BAYONA.
        </p>
      </div>

      <div className="request-preview-actions">
        <button
          className="request-preview-review"
          type="button"
          onClick={reviewCurrentRequest}
        >
          {reviewButtonLabel}
        </button>
        {!isReviewed && (
          <button
            className="request-preview-disabled"
            type="button"
            aria-label="Abrir WhatsApp de BAYONA; revisa primero el mensaje"
            disabled
          >
            Abrir WhatsApp
          </button>
        )}
      </div>

      <p className="request-preview-status" role="status" aria-live="polite" aria-atomic="true">
        {isReviewed
          ? 'Mensaje revisado. El enlace al canal oficial ya está disponible.'
          : 'WhatsApp permanece bloqueado hasta que revises el mensaje vigente.'}
      </p>

      {isReviewed && (
        <div
          className="request-preview-exact"
          role="region"
          aria-label="Vista previa exacta de la solicitud a WhatsApp"
        >
          <section className="request-preview-message-panel" aria-labelledby="request-preview-message-heading">
            <h4 id="request-preview-message-heading">Mensaje exacto</h4>
            <p className="request-preview-message">{message}</p>
          </section>

          <div className="request-preview-facts">
            {/* `role="region"` es implícito en <section> con nombre accesible. */}
            <section aria-label="Datos que se incluirán">
              <h4>Datos que se incluirán</h4>
              <dl className="request-preview-included-fields">
                {contactFields.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
                <div>
                  <dt>Plan base</dt>
                  <dd>{calculation.plan.name} · {calculation.plan.priceDisplay} {calculation.plan.currency}</dd>
                </div>
                <div>
                  <dt>Servicios y extras</dt>
                  <dd>
                    {selectedServices.length > 0 ? (
                      <ul>
                        {selectedSessions.map((service) => (
                          <li key={service.id}>{service.label}: {service.quantity}</li>
                        ))}
                        {calculation.extras.map((service) => (
                          <li key={service.id}>{service.label}</li>
                        ))}
                      </ul>
                    ) : 'Sin extras por ahora'}
                  </dd>
                </div>
                <div>
                  <dt>Total calculado</dt>
                  <dd>
                    <span>{calculation.totalDisplay} COP</span>
                    <span aria-hidden="true"> · </span>
                    <span>{calculation.eurApprox}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{calculation.usdApprox}</span>
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-label="Condiciones geográficas">
              <h4>Condiciones geográficas</h4>
              <ul>
                {geographicConditions.map((condition, index) => (
                  <li key={`${index}-${condition}`}>{condition}</li>
                ))}
              </ul>
            </section>

            <section aria-label="Aviso no contractual">
              <h4>Aviso no contractual</h4>
              {nonContractualNotices.map((notice, index) => (
                <p key={`${index}-${notice}`}>{notice}</p>
              ))}
            </section>
          </div>

          <a
            className="request-preview-whatsapp"
            href={requestUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir WhatsApp de BAYONA en una pestaña nueva"
          >
            Abrir WhatsApp de BAYONA
          </a>
        </div>
      )}
    </section>
  )
}
