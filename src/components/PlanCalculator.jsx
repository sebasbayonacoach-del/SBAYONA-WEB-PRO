import { useMemo, useState } from 'react'
import { MessageCircle, Minus, Plus, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react'
import { planConversionMessages } from '../config/conversionContent.js'
import {
  buildExperienceWhatsAppUrl,
  calculateExperience,
  extraServices,
  formatCop,
  membershipPlans,
  serviceCategoryDefinitions,
  sessionServices,
} from '../config/offerings.js'
import { siteMedia } from '../config/siteMedia.js'
import { useRecommendedPlanId } from '../lib/onboarding/VisitorJourneyProvider.jsx'
import { useRewards } from '../lib/rewards/RewardsProvider.jsx'

/**
 * CONFIGURADOR BOUTIQUE (dirección §13)
 * Antes esto era una calculadora: tres listas y un total. Mismos datos, misma
 * cuenta — el contrato de precios y de mensaje por WhatsApp no cambia — pero
 * leído como lo que es: un carrito corto donde eliges base, sumas servicios por
 * categoría y sales por WhatsApp o por la caja.
 *
 * La imagen va por categoría, no por servicio: hay tres fotografías en el
 * registro (siteMedia.programs.services) y trece servicios. Repetir la misma
 * foto en trece filas es justo lo que el sistema de imágenes prohíbe.
 */
const CATEGORY_MEDIA = Object.freeze({
  CLASES: siteMedia.programs.services[0],
  RECUPERACIÓN: siteMedia.programs.services[1],
  RENDIMIENTO: siteMedia.programs.services[2],
})

const CATEGORY_ICON = Object.freeze({
  CLASES: Sparkles,
  RECUPERACIÓN: ShieldCheck,
  RENDIMIENTO: ShieldCheck,
})

const EXTRA_GROUPS = serviceCategoryDefinitions
  .filter(({ id }) => id !== 'CLASES')
  .map(({ id, title, promise }, index) => ({
    category: id,
    title,
    promise,
    media: CATEGORY_MEDIA[id],
    Icon: CATEGORY_ICON[id] ?? Sparkles,
    index: index + 2,
    services: extraServices.filter((service) => service.category === id),
  }))

const SESSION_GROUP = Object.freeze({
  category: 'CLASES',
  title: 'CLASES',
  promise: serviceCategoryDefinitions[0]?.promise ?? '',
  media: CATEGORY_MEDIA.CLASES,
  Icon: CATEGORY_ICON.CLASES,
  index: 1,
  services: sessionServices,
})

export default function PlanCalculator() {
  const [planId, setPlanId] = useState(membershipPlans[0].id)
  const [serviceQuantities, setServiceQuantities] = useState({})
  const [extraIds, setExtraIds] = useState([])
  const recommendedPlanId = useRecommendedPlanId()
  const rewards = useRewards()

  const selection = useMemo(
    () => ({ planId, serviceQuantities, extraIds }),
    [planId, serviceQuantities, extraIds],
  )
  const calculation = useMemo(() => calculateExperience(selection), [selection])
  const whatsappUrl = useMemo(() => buildExperienceWhatsAppUrl(selection), [selection])
  const servicesTotal = calculation.totalCop - calculation.plan.priceCop
  const selectedItems = [
    ...calculation.sessions
      .filter((service) => service.quantity > 0)
      .map((service) => ({
        id: service.id,
        label: `${service.quantity} × ${service.label}`,
        subtotalCop: service.subtotalCop,
      })),
    ...calculation.extras.map((service) => ({
      id: service.id,
      label: service.label,
      subtotalCop: service.subtotalCop,
    })),
  ]
  const conversionMessage = planConversionMessages[planId]
  const hasAddedServices = selectedItems.length > 0
  /** Crédito guardado en la visita. Se canjea en la caja: aquí solo se anuncia. */
  const creditAvailableEur = rewards.totalEur

  const updateQuantity = (serviceId, quantity) => {
    setServiceQuantities((current) => ({ ...current, [serviceId]: Number(quantity) }))
  }

  const stepQuantity = (service, delta) => {
    const order = service.quantities
    const current = serviceQuantities[service.id] ?? 0
    const position = Math.max(0, order.indexOf(current))
    const next = order[Math.min(Math.max(position + delta, 0), order.length - 1)]
    setServiceQuantities((state) => ({ ...state, [service.id]: next }))
  }

  const toggleExtra = (extraId) => {
    setExtraIds((current) => current.includes(extraId)
      ? current.filter((id) => id !== extraId)
      : [...current, extraId])
  }

  const renderServiceGroup = (group) => (
    <section key={group.category} className="calculator-extra-group" aria-labelledby={`boutique-${group.category}`}>
      <header className="calculator-extra-group-heading">
        <span className="calculator-group-media" aria-hidden="true">
          <group.Icon size={20} strokeWidth={1.25} />
        </span>
        <div>
          <p className="calculator-group-step">{String(group.index).padStart(2, '0')}</p>
          <h3 id={`boutique-${group.category}`}>{group.title}</h3>
          <p>{group.promise}</p>
        </div>
      </header>
      <div className="calculator-extra-list">
        {group.services.map((service) => {
          const isSession = service.quantities !== undefined
          const quantity = serviceQuantities[service.id] ?? 0
          const selected = extraIds.includes(service.id)

          if (isSession) {
            return (
              <label
                key={service.id}
                htmlFor={`quantity-${service.id}`}
                className={quantity > 0 ? 'is-selected' : ''}
              >
                <span>
                  <strong>{service.label}</strong>
                  <small>{service.description}</small>
                  <b>{formatCop(service.priceCop)} COP / sesión</b>
                  {service.presencial && (
                    <small className="calculator-presencial-note">
                      Presencial en Bogotá · sujeto a ubicación y disponibilidad
                    </small>
                  )}
                </span>
                <span className="calculator-qty-stepper">
                  <button
                    type="button"
                    aria-label={`Quitar una ${service.label}`}
                    onClick={(event) => {
                      event.preventDefault()
                      stepQuantity(service, -1)
                    }}
                  >
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span className="calculator-select-wrap">
                    <small>CANTIDAD</small>
                    <select
                      id={`quantity-${service.id}`}
                      value={quantity}
                      onChange={(event) => updateQuantity(service.id, event.target.value)}
                    >
                      {service.quantities.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </span>
                  <button
                    type="button"
                    aria-label={`Añadir una ${service.label}`}
                    onClick={(event) => {
                      event.preventDefault()
                      stepQuantity(service, 1)
                    }}
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </span>
              </label>
            )
          }

          return (
            <label key={service.id} className={selected ? 'is-selected' : ''}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleExtra(service.id)}
              />
              <span>
                <strong>{service.label}</strong>
                <small>{service.description}</small>
              </span>
              <b>{service.priceDisplay}</b>
              <span className="calculator-extra-toggle" aria-hidden="true">
                {selected ? <Minus size={14} /> : <Plus size={14} />}
              </span>
            </label>
          )
        })}
      </div>
    </section>
  )

  return (
    <div className="experience-calculator boutique-configurator">
      <div className="calculator-form">
        <fieldset className="calculator-fieldset calculator-plan-step">
          <legend><span>01</span> Elige tu plan base</legend>
          <p className="calculator-step-copy">
            La membresía es el suelo del mes: todo lo demás se suma encima. El precio que ves es el publicado.
          </p>
          {recommendedPlanId && (
            <p className="calculator-recommendation">
              <Compassish />
              <span>
                Según lo que contaste en recepción, este es tu punto de entrada:
                {' '}{membershipPlans.find(({ id }) => id === recommendedPlanId)?.name ?? 'el sugerido'}.
                Puedes cambiarlo.
              </span>
            </p>
          )}
          <div className="calculator-plan-options">
            {membershipPlans.map((plan) => (
              <label key={plan.id} className={planId === plan.id ? 'is-selected' : ''}>
                <input
                  type="radio"
                  name="calculator-plan"
                  value={plan.id}
                  checked={planId === plan.id}
                  onChange={(event) => setPlanId(event.target.value)}
                />
                <span>
                  <strong>{plan.name}</strong>
                  <small>{plan.journey}</small>
                  <b>{plan.priceDisplay}</b>
                  <em>
                    <span>{plan.currency}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{plan.eur}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{plan.usdDisplay}</span>
                  </em>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="calculator-fieldset calculator-classes-step">
          <legend><span>02</span> Añade clases extra</legend>
          <p className="calculator-step-copy">Sesiones sueltas por encima de las que ya trae el plan.</p>
          {renderServiceGroup(SESSION_GROUP)}
        </fieldset>

        <fieldset className="calculator-fieldset calculator-extras-step">
          <legend><span>03</span> Completa tu arsenal</legend>
          <p className="calculator-step-copy">
            Recuperación y rendimiento. Es el mismo catálogo de arriba; aquí se suma al total del mes.
          </p>
          <div className="calculator-extra-groups">
            {EXTRA_GROUPS.map(renderServiceGroup)}
          </div>
        </fieldset>
      </div>

      {/* Recibo: filete superior, partidas alineadas a la derecha y total. */}
      <aside className="calculator-summary receipt" aria-live="polite">
        <span className="receipt-perf" aria-hidden="true" />
        <div className="calculator-summary-heading">
          <p>TU PLAN EXACTO</p>
          <span>{calculation.plan.name} · {calculation.plan.journey}</span>
        </div>
        <div className="calculator-emotional-feedback" role="status" aria-live="polite">
          <strong>{conversionMessage.calculatorMessage}</strong>
          {hasAddedServices && <span>Sumado. Estas son las partidas de tu mes.</span>}
        </div>
        <dl className="calculator-summary-breakdown">
          <div><dt>Plan base</dt><dd>{calculation.plan.priceDisplay}</dd></div>
          <div><dt>Servicios añadidos</dt><dd>{formatCop(servicesTotal)}</dd></div>
        </dl>
        <p className="calculator-transformation-total">
          <span>Tu transformación:</span>
          <strong>{calculation.totalDisplay} COP/mes</strong>
        </p>
        <span className="calculator-summary-eur">
          <span>{calculation.eurApprox}</span>
          <span aria-hidden="true"> · </span>
          <span>{calculation.usdApprox}</span>
        </span>

        <p className="calculator-credit-line">
          <ShoppingBag size={14} aria-hidden="true" />
          {creditAvailableEur > 0
            ? `Crédito BAYONA guardado en esta visita: ${rewards.format(creditAvailableEur)}. Se aplica en la caja, no en esta cuenta.`
            : 'Si reclamaste el pase de bienvenida, tu crédito se aplica en la caja: aquí verás el precio sin descontar.'}
        </p>

        <p className="calculator-decision-line">Lo que dejas escrito aquí es literal: llega igual al WhatsApp.</p>

        <div className="calculator-summary-selection">
          <h3>LO QUE AÑADISTE</h3>
          {selectedItems.length > 0 ? (
            <ul>
              {selectedItems.map((item) => (
                <li key={item.id}><span>{item.label}</span><strong>{formatCop(item.subtotalCop)}</strong></li>
              ))}
            </ul>
          ) : <p>Tu plan base está listo. Añade servicios solo si los necesitas.</p>}
        </div>

        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="calculator-whatsapp">
          <MessageCircle size={18} /> DAR EL PRIMER PASO
        </a>
        <small className="calculator-summary-note">Tu selección completa se incluirá automáticamente en WhatsApp.</small>
        <small className="calculator-summary-note calculator-summary-checkout">
          ¿Prefieres cerrarlo tú? La caja está justo debajo.
        </small>
      </aside>
    </div>
  )
}

/** Icono de la recomendación, aislado para no ensuciar el bloque de copy. */
function Compassish() {
  return <Sparkles size={14} aria-hidden="true" className="calculator-recommendation-icon" />
}
