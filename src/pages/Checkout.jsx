import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, Check, Copy, MessageCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { SectionLabel } from '../components/Layout'
import {
  buildExperienceWhatsAppUrl,
  calculateExperience,
  extraServices,
  membershipPlans,
  sessionServices,
} from '../config/offerings.js'
import { trackEvent, trackLead } from '../lib/analytics/analytics.js'
import { clearPendingLead, openWhatsApp, rememberPendingLead } from '../lib/conversion/whatsappBridge.js'
import CheckoutPanel from '../components/commerce/CheckoutPanel.jsx'
import { ZERO_FIRST_MONTH_OFFER } from '../lib/commerce/index.js'
import { useRewards } from '../lib/rewards/RewardsProvider.jsx'
import '../styles/checkout-handoff.css'

const INITIAL_CONTACT = {
  nombre: '',
  email: '',
  whatsapp: '',
}

/**
 * Fase 4: el configurador acepta ?plan=<id> para llegar con el plan base ya
 * marcado desde las fichas de plan y los programas. Fail-closed: si el valor
 * no existe en el catálogo canónico se ignora y se usa el primer plan, igual
 * que antes. Nunca se inventa un plan a partir del query string.
 */
function resolveInitialPlanId(searchParams) {
  const requested = searchParams.get('plan')
  if (requested && membershipPlans.some((plan) => plan.id === requested)) return requested
  return membershipPlans[0].id
}

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const [contact, setContact] = useState(INITIAL_CONTACT)
  const [planId, setPlanId] = useState(() => resolveInitialPlanId(searchParams))
  const [serviceQuantities, setServiceQuantities] = useState({})
  const [extraIds, setExtraIds] = useState([])
  /**
   * Resultado del último intento de entrega a WhatsApp.
   * null = todavía no se ha enviado. `opened: false` = la pestaña se bloqueó
   * y hay que ofrecer el enlace manual para no perder el lead.
   */
  const [handoff, setHandoff] = useState(null)
  const [copied, setCopied] = useState(false)

  const selection = useMemo(
    () => ({ planId, serviceQuantities, extraIds }),
    [planId, serviceQuantities, extraIds],
  )
  const calculation = useMemo(() => calculateExperience(selection), [selection])
  const selectedSessions = calculation.sessions.filter(({ quantity }) => quantity > 0)
  /**
   * El plan gratuito no vive en el configurador: llega por ?plan=GRATIS y se lo
   * queda la pasarela. En cuanto la persona marca un plan de pago, la pasarela
   * sigue esa elección.
   */
  const commercePlanId = searchParams.get('plan') === 'GRATIS' ? 'GRATIS' : planId
  /**
   * Todo el crédito BAYONA del recorrido —bono de llegada, sellos y premio por
   * compartir— se resta del precio aquí mismo, delante de la persona.
   * `useRewards` devuelve un objeto neutro si no hay proveedor, así que la caja
   * sigue funcionando aislada.
   */
  const { totalEur } = useRewards()

  const handleContactChange = (event) => {
    const { name, value } = event.target
    setContact((current) => ({ ...current, [name]: value }))
  }

  const updateQuantity = (serviceId, quantity) => {
    setServiceQuantities((current) => ({ ...current, [serviceId]: Number(quantity) }))
  }

  const toggleExtra = (extraId, checked) => {
    setExtraIds((current) => checked
      ? [...new Set([...current, extraId])]
      : current.filter((id) => id !== extraId))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const whatsappUrl = buildExperienceWhatsAppUrl({ ...selection, contact })

    const result = openWhatsApp(whatsappUrl, {
      source: 'checkout',
      plan: calculation.plan.name,
      value: calculation.totalCop,
    })

    trackLead({ source: 'checkout', plan: calculation.plan.name, value: calculation.totalCop })

    if (result.opened) {
      // Entregado: si había un respaldo de un intento anterior, ya no hace falta.
      clearPendingLead()
    } else {
      // La pestaña se bloqueó. Guardamos la solicitud para que se pueda reintentar.
      rememberPendingLead({ url: whatsappUrl, source: 'checkout' })
      trackEvent('whatsapp_blocked', { source: 'checkout', plan: calculation.plan.name })
    }

    setCopied(false)
    setHandoff(result)
  }

  const handleCopyLink = async () => {
    if (!handoff?.url) return
    try {
      await navigator.clipboard.writeText(handoff.url)
      setCopied(true)
      trackEvent('whatsapp_link_copied', { source: 'checkout' })
    } catch {
      // Sin permiso de portapapeles: el enlace sigue visible y pulsable.
      setCopied(false)
    }
  }

  return (
    <>
      <section className="checkout-hero section-shell">
        <SectionLabel>BAYONA OS · CONFIGURADOR</SectionLabel>
        <h1>Diseña tu sistema de acompañamiento.</h1>
        <p className="checkout-subtitle">
          Elige la base, suma solo lo que aporta valor y revisa el total antes de hablar con BAYONA.
        </p>
      </section>

      <section className="checkout-page section-shell" aria-labelledby="checkout-form-title">
        <div className="checkout-layout">
          <form onSubmit={handleSubmit} className="checkout-form" aria-describedby="checkout-data-note">
            {/*
              Fase 4: el orden sigue la decisión real del visitante — primero
              qué camino quiere (plan), después qué añade (clases y extras) y
              solo al final sus datos. Antes los datos iban primero y la
              elección después, lo que invertía el embudo de decisión.
            */}
            <fieldset className="checkout-fieldset">
              <legend id="checkout-form-title">1. Define tu base mensual</legend>
              <div className="checkout-plans">
                {membershipPlans.map((plan) => (
                  <label key={plan.id} className={planId === plan.id ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="checkout-plan"
                      value={plan.id}
                      checked={planId === plan.id}
                      onChange={(event) => {
                        setPlanId(event.target.value)
                        trackEvent('plan_selected', {
                          source: 'checkout',
                          plan: plan.name,
                          value: plan.priceCop,
                        })
                      }}
                    />
                    <span>
                      <b>{plan.name}</b>
                      <small className="checkout-plan-tag">{plan.tag}</small>
                      <small>{plan.description}</small>
                    </span>
                    <span className="checkout-plan-price">
                      <strong>{plan.priceDisplay}</strong>
                      <small>
                        <span>{plan.currency}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{plan.eur}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{plan.usdDisplay}</span>
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="checkout-fieldset">
              <legend>2. Suma sesiones cuando tengan sentido</legend>
              <div className="checkout-service-list">
                {sessionServices.map((service) => (
                  <label
                    key={service.id}
                    htmlFor={`checkout-quantity-${service.id}`}
                    className="checkout-service-option"
                  >
                    <span>
                      <strong>{service.label}</strong>
                      <small>
                        {service.priceDisplay} COP por clase
                        {service.presencial ? ' · sujeto a ubicación y disponibilidad' : ''}
                      </small>
                    </span>
                    <span className="checkout-quantity-control">
                      Cantidad
                      <select
                        id={`checkout-quantity-${service.id}`}
                        value={serviceQuantities[service.id] ?? 0}
                        onChange={(event) => updateQuantity(service.id, event.target.value)}
                      >
                        {service.quantities.map((quantity) => (
                          <option key={quantity} value={quantity}>{quantity}</option>
                        ))}
                      </select>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="checkout-fieldset">
              <legend>3. Añade soporte específico</legend>
              <div className="checkout-extra-list">
                {extraServices.map((service) => {
                  const isSelected = extraIds.includes(service.id)
                  return (
                    <label key={service.id} className={isSelected ? 'selected' : ''}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(event) => toggleExtra(service.id, event.target.checked)}
                      />
                      <span>
                        <strong>{service.label}</strong>
                        <small>{service.description}</small>
                        <small className="checkout-extra-scope">
                          {service.priceDisplay} COP
                          {service.presencial ? ' · sujeto a ubicación y disponibilidad' : ''}
                        </small>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="checkout-fieldset">
              <legend>4. Datos mínimos para preparar tu solicitud</legend>
              <p id="checkout-data-note" className="checkout-help">
                Se usan únicamente para dejar tu mensaje claro antes de abrir WhatsApp. No hay cobro aquí.
              </p>

              <div className="checkout-contact-grid">
                <label htmlFor="checkout-name">
                  Nombre
                  <input
                    id="checkout-name"
                    type="text"
                    name="nombre"
                    value={contact.nombre}
                    onChange={handleContactChange}
                    required
                    autoComplete="name"
                    placeholder="Tu nombre"
                  />
                </label>

                <label htmlFor="checkout-email">
                  Email
                  <input
                    id="checkout-email"
                    type="email"
                    name="email"
                    value={contact.email}
                    onChange={handleContactChange}
                    required
                    autoComplete="email"
                    placeholder="tu@email.com"
                  />
                </label>

                <label htmlFor="checkout-whatsapp">
                  WhatsApp
                  <input
                    id="checkout-whatsapp"
                    type="tel"
                    name="whatsapp"
                    value={contact.whatsapp}
                    onChange={handleContactChange}
                    required
                    autoComplete="tel"
                    placeholder="+34 600 000 000"
                  />
                </label>
              </div>
            </fieldset>

            <button
              type="submit"
              className="complete-button"
              aria-label="Solicitar detalles por WhatsApp"
            >
              PREPARAR MI SOLICITUD
              <ArrowRight size={16} aria-hidden="true" />
            </button>

            <p className="microcopy">
              Esta acción prepara una solicitud. No cobra, no confirma un pago, pedido, inscripción,
              disponibilidad ni acceso.
            </p>

            {/*
              Estado de entrega. Antes, si el navegador bloqueaba la pestaña de
              WhatsApp no ocurría nada visible y la solicitud se perdía.
            */}
            <div className="checkout-handoff" role="status" aria-live="polite">
              {handoff?.opened && (
                <div className="checkout-handoff-panel is-ok">
                  <Check size={18} aria-hidden="true" />
                  <div>
                    <strong>Solicitud abierta en WhatsApp</strong>
                    <p>
                      Revisa la pestaña de WhatsApp y envía el mensaje para que llegue. Si no la
                      ves, usa este enlace:{' '}
                      <a href={handoff.url} target="_blank" rel="noopener noreferrer">
                        abrir la conversación
                      </a>
                      .
                    </p>
                    {/*
                      Fase 4: /order-confirmation era una ruta huérfana (sin
                      ninguna entrada). Ahora se ofrece como siguiente paso
                      natural tras abrir la solicitud: qué ocurre ahora.
                    */}
                    <p>
                      <Link to="/order-confirmation">Ver qué ocurre después de tu solicitud</Link>
                    </p>
                  </div>
                </div>
              )}

              {handoff && !handoff.opened && (
                <div className="checkout-handoff-panel is-blocked">
                  <AlertTriangle size={18} aria-hidden="true" />
                  <div>
                    <strong>Tu navegador bloqueó la ventana de WhatsApp</strong>
                    <p>
                      Tu solicitud no se ha perdido: la hemos guardado en este dispositivo. Ábrela
                      manualmente con el botón de abajo o copia el enlace y pégalo en tu navegador.
                    </p>
                    <div className="checkout-handoff-actions">
                      <a
                        className="checkout-handoff-open"
                        href={handoff.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          clearPendingLead()
                          trackEvent('whatsapp_manual_open', { source: 'checkout' })
                        }}
                      >
                        <MessageCircle size={15} aria-hidden="true" /> ABRIR WHATSAPP MANUALMENTE
                      </a>
                      <button type="button" className="checkout-handoff-copy" onClick={handleCopyLink}>
                        <Copy size={15} aria-hidden="true" />
                        {copied ? 'ENLACE COPIADO' : 'COPIAR ENLACE'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>

          <aside className="order-summary" aria-labelledby="checkout-summary-title">
            <p id="checkout-summary-title">TU SISTEMA BAYONA</p>

            <div className="summary-program">
              <span aria-hidden="true">B</span>
              <div>
                <b>BAYONA {calculation.plan.name}</b>
                <small>{calculation.plan.tag} · Membresía mensual</small>
              </div>
            </div>

            <div className="summary-line">
              <span>Plan mensual</span>
              <b>{calculation.plan.priceDisplay} COP</b>
            </div>

            <div className="checkout-summary-items">
              {selectedSessions.map((service) => (
                <div className="summary-line" key={service.id}>
                  <span>{service.label} · {service.quantity}</span>
                  <b>{service.quantity} × {service.priceDisplay}</b>
                </div>
              ))}
              {calculation.extras.map((service) => (
                <div className="summary-line" key={service.id}>
                  <span>{service.label}</span>
                  <b>{service.priceDisplay}</b>
                </div>
              ))}
              {!selectedSessions.length && !calculation.extras.length && (
                <p className="checkout-empty-selection">Sin servicios extra seleccionados.</p>
              )}
            </div>

            <div className="summary-total">
              <span>TOTAL ESTIMADO</span>
              <output className="summary-total-price" aria-live="polite" aria-atomic="true">
                <b>{calculation.totalDisplay} COP</b>
                <small>
                  <span>{calculation.eurApprox}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{calculation.usdApprox}</span>
                </small>
              </output>
            </div>
            <p className="checkout-eur-note">Equivalencias EUR y USD aproximadas y no contractuales. El detalle final se confirma contigo.</p>

            <ul>
              <li><Check aria-hidden="true" /> Plan, extras y total visibles antes de enviar</li>
              <li><Check aria-hidden="true" /> Sin cobro ni inscripción automática en este paso</li>
              <li><Check aria-hidden="true" /> Primer mes sin coste · después, el precio publicado del plan</li>
            </ul>
          </aside>
        </div>
      </section>

      <CheckoutPanel
        className="checkout-gateway"
        planId={commercePlanId}
        period="month"
        currency="EUR"
        creditEur={totalEur}
        introOffer={ZERO_FIRST_MONTH_OFFER}
        initialShareCode={searchParams.get('codigo') ?? ''}
      />
    </>
  )
}
