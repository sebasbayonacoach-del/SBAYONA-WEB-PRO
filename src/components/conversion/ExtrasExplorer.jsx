import { useId, useState } from 'react'
import { extraServices, membershipPlans, sessionServices } from '../../config/offerings.js'
import { groupServicesByCategory } from '../../lib/conversion/extras.js'

const SERVICE_GROUPS = groupServicesByCategory(sessionServices, extraServices)
const SESSION_SERVICE_IDS = new Set(sessionServices.map(({ id }) => id))
const EXTRA_SERVICE_IDS = new Set(extraServices.map(({ id }) => id))
const IN_PERSON_SERVICE_COPY = 'presencial sujeto a ubicación y disponibilidad'
const NO_ADDITIONAL_CONDITION = 'No hay una condición adicional publicada para este servicio.'

function publishedConditions(service) {
  const conditions = []

  if (service.presencial) conditions.push(IN_PERSON_SERVICE_COPY)

  return conditions.length > 0 ? conditions : [NO_ADDITIONAL_CONDITION]
}

/**
 * Explora los servicios fuente por categoría y emite una selección comercial.
 * Precio, descripción, condiciones y controles de selección solo aparecen tras
 * una acción explícita; nunca clona ni amplía las opciones de Commercial_Config.
 *
 * @param {Object} props
 * @param {{planId:string, serviceQuantities:Record<string, number>, extraIds:ReadonlyArray<string>}} props.selection
 * @param {(selection:{planId:string, serviceQuantities:Record<string, number>, extraIds:ReadonlyArray<string>}) => void} props.onSelectionChange
 */
export default function ExtrasExplorer({ selection, onSelectionChange }) {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const categoryPanelId = `${instanceId}-service-category-panel`
  const [activeCategory, setActiveCategory] = useState(null)
  const [expandedServiceId, setExpandedServiceId] = useState(null)
  const activeGroup = SERVICE_GROUPS.find(({ category }) => category === activeCategory)
  const activeGroupIndex = activeGroup
    ? SERVICE_GROUPS.findIndex(({ category }) => category === activeGroup.category)
    : -1
  const serviceQuantities = selection.serviceQuantities ?? {}
  const selectedExtraIds = selection.extraIds ?? []

  const selectCategory = (category) => {
    setActiveCategory((currentCategory) => currentCategory === category ? null : category)
    setExpandedServiceId(null)
  }

  const updateQuantity = (serviceId, quantity) => {
    onSelectionChange({
      ...selection,
      serviceQuantities: {
        ...serviceQuantities,
        [serviceId]: Number(quantity),
      },
    })
  }

  const toggleExtra = (serviceId) => {
    onSelectionChange({
      ...selection,
      extraIds: selectedExtraIds.includes(serviceId)
        ? selectedExtraIds.filter((extraId) => extraId !== serviceId)
        : [...selectedExtraIds, serviceId],
    })
  }

  return (
    <div className="extras-explorer">
      <fieldset className="extras-plan-fieldset">
        <legend>1. Elige el plan base</legend>
        <div className="extras-plan-options">
          {membershipPlans.map((plan) => (
            <label key={plan.id} className={selection.planId === plan.id ? 'is-selected' : ''}>
              <input
                type="radio"
                name={`${instanceId}-plan`}
                value={plan.id}
                checked={selection.planId === plan.id}
                onChange={(event) => onSelectionChange({
                  ...selection,
                  planId: event.target.value,
                })}
              />
              <span>
                <strong>{plan.name}</strong>
                <small>
                  <span>{plan.priceDisplay} {plan.currency}</span>
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

      <div className="extras-category-step">
        <div className="extras-step-heading">
          <p>2. Explora servicios por categoría</p>
          <span>Primero elige una categoría; después podrás revisar cada servicio.</span>
        </div>

        <nav className="extras-category-navigation" aria-label="Categorías de servicios">
          <ul>
            {SERVICE_GROUPS.map((group, groupIndex) => {
              const isActive = group.category === activeCategory
              const buttonId = `${instanceId}-category-${groupIndex}`

              return (
                <li key={group.category}>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={categoryPanelId}
                    aria-label={`${isActive ? 'Cerrar' : 'Explorar'} categoría ${group.category}`}
                    onClick={() => selectCategory(group.category)}
                  >
                    {group.category}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <section
          id={categoryPanelId}
          className="extras-category-panel"
          aria-labelledby={activeGroup ? `${instanceId}-active-category-heading` : undefined}
          hidden={!activeGroup}
        >
          {activeGroup && (
            <>
              <h3 id={`${instanceId}-active-category-heading`}>{activeGroup.category}</h3>
              <ul className="extras-service-list">
                {activeGroup.services.map((service, serviceIndex) => {
                  const isExpanded = expandedServiceId === service.id
                  const isQuantityService = SESSION_SERVICE_IDS.has(service.id)
                  const isExtraService = EXTRA_SERVICE_IDS.has(service.id)
                  const serviceHeadingId = `${instanceId}-${activeGroupIndex}-${serviceIndex}-heading`
                  const serviceButtonId = `${instanceId}-${activeGroupIndex}-${serviceIndex}-button`
                  const servicePanelId = `${instanceId}-${activeGroupIndex}-${serviceIndex}-panel`
                  const isSelected = selectedExtraIds.includes(service.id)

                  return (
                    <li key={service.id} className="extras-service-item" data-service-id={service.id}>
                      <div className="extras-service-heading">
                        <h4 id={serviceHeadingId}>{service.label}</h4>
                        <button
                          id={serviceButtonId}
                          className="extras-service-disclosure"
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={servicePanelId}
                          onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                        >
                          {isExpanded
                            ? `Ocultar detalle y opciones de ${service.label}`
                            : `Ver detalle y opciones de ${service.label}`}
                        </button>
                      </div>

                      <div
                        id={servicePanelId}
                        className="extras-service-details"
                        role="region"
                        aria-labelledby={serviceButtonId}
                        hidden={!isExpanded}
                      >
                        {isExpanded && (
                          <>
                            <dl className="extras-service-facts">
                              <div>
                                <dt>Descripción publicada</dt>
                                <dd>{service.description}</dd>
                              </div>
                              <div>
                                <dt>Precio publicado</dt>
                                <dd>{service.priceDisplay} COP</dd>
                              </div>
                              <div>
                                <dt>Condiciones publicadas</dt>
                                <dd>
                                  <ul>
                                    {publishedConditions(service).map((condition) => (
                                      <li key={condition}>{condition}</li>
                                    ))}
                                  </ul>
                                </dd>
                              </div>
                            </dl>

                            {isQuantityService && (
                              <label className="extras-quantity-control" htmlFor={`${instanceId}-${service.id}-quantity`}>
                                <span>Cantidad de {service.label}</span>
                                <select
                                  id={`${instanceId}-${service.id}-quantity`}
                                  value={serviceQuantities[service.id] ?? 0}
                                  onChange={(event) => updateQuantity(service.id, event.target.value)}
                                >
                                  {service.quantities.map((quantity) => (
                                    <option key={quantity} value={quantity}>{quantity}</option>
                                  ))}
                                </select>
                              </label>
                            )}

                            {isExtraService && (
                              <button
                                className="extras-selection-action"
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleExtra(service.id)}
                              >
                                {isSelected
                                  ? `Quitar ${service.label} de la selección`
                                  : `Añadir ${service.label} a la selección`}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
