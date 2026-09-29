import { useId, useState } from 'react'
import { membershipPlanEditorialProjection } from '../../config/conversionContent.js'
import {
  CONSERVATIVE_PLAN_ORDER,
  EXPERIENCES,
  MOTIVATIONS,
  RecommendationInputError,
  SUPPORT_LEVELS,
  recommendPlan,
} from '../../lib/conversion/recommendation.js'

const GUIDE_FIELDS = Object.freeze([
  Object.freeze({
    name: 'motivation',
    legend: '1. ¿Qué te gustaría priorizar?',
    summaryLabel: 'Motivación',
    options: Object.freeze(MOTIVATIONS.map((value) => Object.freeze({
      value,
      label: {
        constancia: 'Construir constancia',
        comprension: 'Comprender mejor el proceso',
        personalizacion: 'Personalizar el camino',
        'acompanamiento-directo': 'Contar con acompañamiento directo',
      }[value],
    }))),
  }),
  Object.freeze({
    name: 'experience',
    legend: '2. ¿Cómo describes tu experiencia actual?',
    summaryLabel: 'Experiencia',
    options: Object.freeze(EXPERIENCES.map((value) => Object.freeze({
      value,
      label: {
        inicio: 'Estoy empezando',
        retomo: 'Estoy retomando',
        constante: 'Mantengo una práctica constante',
      }[value],
    }))),
  }),
  Object.freeze({
    name: 'supportLevel',
    legend: '3. ¿Qué acompañamiento deseas comparar?',
    summaryLabel: 'Acompañamiento deseado',
    options: Object.freeze(SUPPORT_LEVELS.map((value) => Object.freeze({
      value,
      label: {
        estructura: 'Una estructura clara',
        'seguimiento-semanal': 'Seguimiento semanal',
        'sesiones-privadas': 'Sesiones privadas',
      }[value],
    }))),
  }),
])

const EMPTY_ANSWERS = Object.freeze({
  motivation: '',
  experience: '',
  supportLevel: '',
})

function answerLabel(fieldName, value) {
  const field = GUIDE_FIELDS.find(({ name }) => name === fieldName)
  return field?.options.find((option) => option.value === value)?.label ?? ''
}

function fieldErrorsFrom(validationErrors) {
  const nextErrors = {}

  for (const error of validationErrors) {
    const fieldName = error.path === 'supportLevel|availability'
      ? 'supportLevel'
      : error.path

    if (GUIDE_FIELDS.some(({ name }) => name === fieldName) && !nextErrors[fieldName]) {
      nextErrors[fieldName] = 'Selecciona una opción para continuar.'
    }
  }

  return nextErrors
}

/**
 * Mini-guía local y opcional para Home/Programas. Consume las reglas puras y
 * la proyección comercial aprobada; no persiste, transmite ni amplía respuestas.
 *
 * @param {Object} props
 * @param {ReadonlyArray<import('../../config/conversionContent.js').PlanEditorialProjection>=} props.projections
 */
export default function RecommendationGuide({
  projections = membershipPlanEditorialProjection,
}) {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const panelId = `${instanceId}-recommendation-panel`
  const guideHeadingId = `${instanceId}-recommendation-heading`
  const resultHeadingId = `${instanceId}-recommendation-result`
  const alternativesLabelId = `${instanceId}-recommendation-alternatives`
  const [isOpen, setIsOpen] = useState(false)
  const [answers, setAnswers] = useState(() => ({ ...EMPTY_ANSWERS }))
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)

  const planProjectionById = new Map(
    projections.map((projection) => [projection.plan.id, projection]),
  )
  const resultPlanIds = result
    ? [result.planId, ...result.alternatives]
    : []
  const resultProjections = resultPlanIds
    .map((planId) => planProjectionById.get(planId))
    .filter(Boolean)
  const suggestedProjection = resultProjections[0]

  const closeAndDiscard = () => {
    setIsOpen(false)
    setAnswers({ ...EMPTY_ANSWERS })
    setErrors({})
    setResult(null)
  }

  const handleToggle = () => {
    if (isOpen) {
      closeAndDiscard()
      return
    }

    setIsOpen(true)
  }

  const handleAnswerChange = (event) => {
    const { name, value } = event.target
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [name]: value,
    }))
    setErrors((currentErrors) => {
      if (!currentErrors[name]) return currentErrors
      const nextErrors = { ...currentErrors }
      delete nextErrors[name]
      delete nextErrors.form
      return nextErrors
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const missingErrors = Object.fromEntries(
      GUIDE_FIELDS
        .filter(({ name }) => !answers[name])
        .map(({ name }) => [name, 'Selecciona una opción para continuar.']),
    )

    if (Object.keys(missingErrors).length > 0) {
      setErrors(missingErrors)
      setResult(null)
      return
    }

    try {
      const nextResult = recommendPlan(answers)
      const nextPlanIds = [nextResult.planId, ...nextResult.alternatives]
      // La proyección comercial debe cubrir exactamente el orden canónico
      // vigente del motor (hoy: RAIZ, FUERZA, RENDIMIENTO, ELITE).
      const hasExactCommercialProjection = nextPlanIds.length === CONSERVATIVE_PLAN_ORDER.length
        && new Set(nextPlanIds).size === nextPlanIds.length
        && planProjectionById.size === CONSERVATIVE_PLAN_ORDER.length
        && nextPlanIds.every((planId) => planProjectionById.has(planId))

      if (!hasExactCommercialProjection) {
        throw new Error('La proyección comercial no cubre las tres alternativas canónicas.')
      }

      setErrors({})
      setResult(nextResult)
    } catch (error) {
      setResult(null)
      setErrors(error instanceof RecommendationInputError
        ? fieldErrorsFrom(error.errors)
        : { form: 'No podemos mostrar una orientación con la configuración disponible.' })
    }
  }

  return (
    <section
      className="recommendation-guide"
      aria-labelledby={guideHeadingId}
      data-guide-state={!isOpen ? 'closed' : result ? 'result' : 'questions'}
    >
      <div className="recommendation-guide-header">
        <div>
          <p className="recommendation-guide-eyebrow">MINI-GUÍA OPCIONAL</p>
          <h3 id={guideHeadingId}>Encuentra un punto de comparación</h3>
          <p>
            Responde tres preguntas cerradas sobre motivación, experiencia y acompañamiento deseado.
            Puedes omitir la guía y comparar directamente todos los planes.
          </p>
        </div>
        <button
          className="recommendation-guide-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={handleToggle}
        >
          {isOpen ? 'Cerrar y descartar respuestas' : 'Abrir mini-guía'}
        </button>
      </div>

      <p className="recommendation-privacy-note">
        La guía no solicita género, información de salud ni datos biométricos. Las respuestas se
        mantienen solo en memoria mientras está abierta y no se envían.
      </p>

      {isOpen && (
        <div id={panelId} className="recommendation-guide-panel">
          {!result ? (
            <form className="recommendation-form" noValidate onSubmit={handleSubmit}>
              {GUIDE_FIELDS.map((field) => {
                const errorId = `${instanceId}-${field.name}-error`
                const legendId = `${instanceId}-${field.name}-legend`

                return (
                  <fieldset
                    key={field.name}
                    className="recommendation-fieldset"
                    role="radiogroup"
                    aria-labelledby={legendId}
                    aria-invalid={errors[field.name] ? true : undefined}
                  >
                    <legend id={legendId}>{field.legend}</legend>
                    <div className="recommendation-options">
                      {field.options.map((option) => (
                        <label
                          key={option.value}
                          className={answers[field.name] === option.value ? 'is-selected' : ''}
                        >
                          <input
                            type="radio"
                            name={field.name}
                            value={option.value}
                            checked={answers[field.name] === option.value}
                            aria-describedby={errors[field.name] ? errorId : undefined}
                            onChange={handleAnswerChange}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors[field.name] && (
                      <p id={errorId} className="recommendation-field-error" role="alert">
                        {errors[field.name]}
                      </p>
                    )}
                  </fieldset>
                )
              })}

              {errors.form && (
                <p className="recommendation-form-error" role="alert">{errors.form}</p>
              )}

              <button className="recommendation-submit" type="submit">
                Ver orientación explicada
              </button>
            </form>
          ) : (
            <section
              className="recommendation-result"
              aria-labelledby={resultHeadingId}
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="recommendation-result-label">PLAN SUGERIDO PARA COMPARAR</p>
              <h4 id={resultHeadingId}>{suggestedProjection.plan.name}</h4>
              <p className="recommendation-result-descriptor">
                {suggestedProjection.overlay.descriptor}
              </p>

              <div className="recommendation-explanation-grid">
                <div>
                  <p className="recommendation-subheading">Tus respuestas</p>
                  <dl className="recommendation-answer-list">
                    {GUIDE_FIELDS.map((field) => (
                      <div key={field.name}>
                        <dt>{field.summaryLabel}</dt>
                        <dd>{answerLabel(field.name, answers[field.name])}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div>
                  <p className="recommendation-subheading">Regla de orientación</p>
                  <dl className="recommendation-decision">
                    <div>
                      <dt>Versión de reglas</dt>
                      <dd>{result.ruleVersion}</dd>
                    </div>
                    <div>
                      <dt>Decisión</dt>
                      <dd>{result.decision.reason}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="recommendation-reasons">
                <p className="recommendation-subheading">Razones consideradas</p>
                <ol aria-label="Razones de la orientación">
                  {result.reasons.map((reason) => (
                    <li key={reason.ruleId} data-rule-id={reason.ruleId}>
                      <p>{reason.reason}</p>
                      <span>Regla aplicada: {reason.ruleId}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <aside className="recommendation-disclaimer" aria-label="Límite de la orientación">
                {result.disclaimer}
              </aside>

              <nav className="recommendation-alternatives" aria-labelledby={alternativesLabelId}>
                <p id={alternativesLabelId} className="recommendation-subheading">
                  Compara los tres planes
                </p>
                <ul>
                  {resultProjections.map(({ plan }, index) => (
                    <li key={plan.id}>
                      <a
                        href={`#plan-${plan.id.toLowerCase()}`}
                        data-recommendation-role={index === 0 ? 'suggested' : 'alternative'}
                      >
                        {index === 0
                          ? `Revisar ${plan.name}, sugerido`
                          : `Comparar ${plan.name}, alternativa`}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <button
                className="recommendation-edit"
                type="button"
                onClick={() => {
                  setErrors({})
                  setResult(null)
                }}
              >
                Editar respuestas
              </button>
            </section>
          )}
        </div>
      )}
    </section>
  )
}
