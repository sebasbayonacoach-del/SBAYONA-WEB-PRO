import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { SectionLabel } from '../components/Layout'
import {
  buildExperienceWhatsAppUrl,
  calculateExperience,
  extraServices,
  membershipPlans,
  sessionServices,
} from '../config/offerings.js'
import { trackEvent, trackWhatsAppClick } from '../lib/analytics/analytics.js'
import '../styles/checkout-handoff.css'

// WhatsApp supplies the visitor's return channel. No need to demand email or
// phone number and duplicate sensitive data already held by their WhatsApp.
const INITIAL_CONTACT = { nombre: '' }

// Never ship sandbox payment URLs in the commercial production bundle.
const StripeSandboxPreview = import.meta.env.DEV
  ? lazy(() => import('../components/commerce/StripeSandboxPreview.jsx'))
  : null

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
  const checkoutEntered=useRef(false)
  const initialPlan=useRef(resolveInitialPlanId(searchParams))
  const [serviceQuantities, setServiceQuantities] = useState({})
  const [extraIds, setExtraIds] = useState([])
  const selection = useMemo(
    () => ({ planId, serviceQuantities, extraIds }),
    [planId, serviceQuantities, extraIds],
  )
  const calculation = useMemo(() => calculateExperience(selection), [selection])
  const selectedSessions = calculation.sessions.filter(({ quantity }) => quantity > 0)
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

  const whatsappUrl = useMemo(() => buildExperienceWhatsAppUrl({ ...selection, contact }), [selection, contact])

  useEffect(() => {
    if(checkoutEntered.current)return
    checkoutEntered.current=true
    trackEvent('request_builder_opened',{source:'checkout',plan:initialPlan.current})
    // A route load is an intent signal, not a completed order.
  }, [])

  const handleWhatsAppClick = () => {
    trackWhatsAppClick({ source: 'checkout', plan: calculation.plan.name, value: calculation.totalCop })
    trackEvent('checkout_handoff_started', {
      source: 'checkout',
      plan: calculation.plan.id,
      value: calculation.totalCop,
      currency: 'COP',
    })
    // Native link navigation is more reliable than window.open for in-app browsers.
    // Opening the link must never be counted as a lead, sale or payment.
  }

  return (
    <>
      <section className="checkout-hero section-shell">
        <SectionLabel>SERVICIOS BAYONA · TU MISIÓN</SectionLabel>
        <h1>PREPARA TU SOLICITUD.</h1>
        {import.meta.env.DEV && searchParams.get('stripe_test_return') === '1' && (
          <p role="status" className="checkout-stripe-return">Has regresado del entorno de prueba de Stripe. Esto no demuestra un cobro ni activa una membresía.</p>
        )}
        <p className="checkout-subtitle">
          Elige una membresía, añade solo lo que necesitas y revisa el total antes de enviarnos tu solicitud.
        </p>
      </section>

      <section className="checkout-page section-shell" aria-labelledby="checkout-form-title">
        <div className="checkout-layout">
          <div className="checkout-form" aria-describedby="checkout-data-note">
            {/*
              Fase 4: el orden sigue la decisión real del visitante — primero
              qué camino quiere (plan), después qué añade (clases y extras) y
              solo al final sus datos. Antes los datos iban primero y la
              elección después, lo que invertía el embudo de decisión.
            */}
            <fieldset className="checkout-fieldset">
              <legend id="checkout-form-title">1. Elige tu membresía</legend>
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
              <legend>2. Añade sesiones si las necesitas</legend>
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
              <legend>3. Añade servicios complementarios</legend>
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
              <legend>4. Tu mensaje</legend>
              <p id="checkout-data-note" className="checkout-help">
                Tu nombre es opcional. WhatsApp abrirá una conversación con el plan y total estimado. Nada se envía hasta que tú confirmes el mensaje.
              </p>

              <div className="checkout-contact-grid checkout-contact-grid--minimal">
                <label htmlFor="checkout-name">
                  Nombre (opcional)
                  <input
                    id="checkout-name"
                    type="text"
                    name="nombre"
                    value={contact.nombre}
                    onChange={handleContactChange}
                    maxLength={70}
                    autoComplete="given-name"
                    placeholder="¿Cómo te llamas?"
                  />
                </label>
              </div>
            </fieldset>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="complete-button checkout-direct-link"
              aria-label="Abrir solicitud en WhatsApp"
              onClick={handleWhatsAppClick}
            >
              ABRIR MI SOLICITUD EN WHATSAPP
              <ArrowRight size={18} aria-hidden="true" />
            </a>

            <p className="microcopy checkout-direct-note">
              <ShieldCheck size={17} aria-hidden="true"/>
              WhatsApp abrirá el mensaje para que lo revises y decidas si lo envías.
              Sin pago, inscripción ni reserva automática.
            </p>
          </div>

          <aside className="order-summary" aria-labelledby="checkout-summary-title">
            <p id="checkout-summary-title">RESUMEN DE TU SOLICITUD</p>

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
                <p className="checkout-empty-selection">Sin servicios adicionales seleccionados.</p>
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
              <li><Check aria-hidden="true" /> Membresía, servicios y total visibles antes de enviar</li>
              <li><Check aria-hidden="true" /> Sin cobro ni inscripción automática en este paso</li>
              <li><Check aria-hidden="true" /> La disponibilidad y las condiciones se confirman antes de cualquier pago</li>
            </ul>
          </aside>
        </div>
        {StripeSandboxPreview ? (
          <Suspense fallback={null}>
            <StripeSandboxPreview
              plan={calculation.plan}
              hasExtras={selectedSessions.length>0 || calculation.extras.length>0}
            />
          </Suspense>
        ) : null}
      </section>


    </>
  )
}
