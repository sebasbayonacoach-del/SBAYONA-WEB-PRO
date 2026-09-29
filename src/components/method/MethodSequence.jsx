/**
 * BAYONA · FASE 4 (4.4) — EL MÉTODO COMO PATRÓN COMPARTIDO.
 *
 * Los tres tramos del método (01 · 02 · 03) son la columna vertebral del
 * discurso de BAYONA. Esta pieza los compone como **secuencia espacial
 * editorial**, no como tres tarjetas: un filete común, el número como
 * elemento gráfico y el texto apoyado en la retícula.
 *
 * Reglas que sostienen la pieza:
 *   · Es DOM y CSS puros. Ni WebGL, ni Framer, ni dependencias nuevas: si el
 *     espacio se apaga, el método se sigue leyendo igual (regla de oro).
 *   · El movimiento lo decide la hoja `ds-experience.css`: la secuencia entra
 *     con MASK y cada tramo con SHIFT, los dos ligados a `animation-timeline:
 *     view()` (sin JS y sin secuestro del scroll). `prefers-reduced-motion`
 *     deja el estado estático diseñado: opacidad 1, sin desplazamiento.
 *   · El componente no inventa copy: proyecta lo que le pasa el llamador, y
 *     ese copy sale de `src/config/*` (fuente de verdad del contenido).
 *   · Acepta las dos formas que ya existían en las páginas
 *     (`{ marker, title, body }` de Home y `{ number, title, copy }` de About)
 *     para poder propagarse sin reescribir contenidos.
 */
import { createElement } from 'react'

const HEADING_LEVELS = new Set(['h2', 'h3', 'h4'])

/** Normaliza las dos formas de item que el sitio ya publicaba. */
export function normalizeMethodStep(item, index) {
  if (!item || typeof item !== 'object') return null
  const marker = item.marker ?? item.number ?? String(index + 1).padStart(2, '0')
  const title = item.title ?? item.name
  const body = item.body ?? item.copy ?? item.text
  if (!title) return null
  return {
    id: item.id ?? `${marker}-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    marker,
    title,
    body,
  }
}

export function MethodSequence({
  items = [],
  label = 'Las tres fases del método BAYONA',
  variant = 'sequence',
  headingLevel = 'h3',
  activeIndex = null,
  className = '',
}) {
  const steps = items
    .map((item, index) => normalizeMethodStep(item, index))
    .filter(Boolean)

  if (steps.length === 0) return null

  const heading = HEADING_LEVELS.has(headingLevel) ? headingLevel : 'h3'

  return (
    <ol
      className={['ds-method', `ds-method--${variant}`, 'ds-reveal', 'ds-reveal--mask', className]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
      data-experience-layer="editorial"
      data-step-count={steps.length}
    >
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="ds-method-step ds-reveal ds-reveal--shift"
          data-active={activeIndex === index ? 'true' : undefined}
        >
          <p className="ds-method-step__figure">
            <span className="ds-method-step__marker" aria-hidden="true">
              {step.marker}
            </span>
            <span className="ds-method-step__rail" aria-hidden="true" />
          </p>
          <div className="ds-method-step__body">
            {createElement(
              heading,
              { className: 'ds-method-step__title', id: `ds-method-step-${step.id}` },
              step.title,
            )}
            {step.body ? (
              <p className="ds-method-step__copy">{step.body}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
