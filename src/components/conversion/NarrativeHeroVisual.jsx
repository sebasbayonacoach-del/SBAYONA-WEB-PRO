export const NARRATIVE_HERO_STEPS = Object.freeze([
  Object.freeze({
    id: 'start',
    marker: '01',
    title: 'Punto de partida',
    body: 'Tu contexto, experiencia y disponibilidad orientan el inicio sin convertir la observación en un diagnóstico.',
  }),
  Object.freeze({
    id: 'path',
    marker: '02',
    title: 'Camino adaptable',
    body: 'Decisiones, práctica y revisión forman una ruta que puede ajustarse contigo.',
  }),
  Object.freeze({
    id: 'outcome',
    marker: '03',
    title: 'Resultado posible',
    body: 'Una práctica más clara y sostenible que podrías empezar a construir según tu punto de partida y contexto.',
  }),
])

/**
 * Figura narrativa ligera de Home.
 *
 * Todo el significado vive en figure/figcaption/ol, por lo que el propio DOM es
 * el fallback estático si no cargan los estilos o cualquier mejora decorativa.
 */
export default function NarrativeHeroVisual() {
  return (
    <figure
      className="narrative-hero-visual"
      aria-labelledby="narrative-hero-title"
      data-static-fallback="dom"
    >
      <figcaption className="narrative-hero-caption">
        <span>VISUAL NARRATIVA</span>
        <strong id="narrative-hero-title">Del punto de partida a un resultado posible</strong>
      </figcaption>

      <ol className="narrative-hero-path">
        {NARRATIVE_HERO_STEPS.map((step) => (
          <li
            key={step.id}
            className={`narrative-hero-step narrative-hero-step-${step.id}`}
            data-narrative-stage={step.id}
          >
            <span className="narrative-hero-marker" aria-hidden="true">{step.marker}</span>
            <div>
              <p className="narrative-hero-step-title">{step.title}</p>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  )
}
