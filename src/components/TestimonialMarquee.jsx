import '../styles/community-bridges.css'
import { TESTIMONIALS } from '../config/testimonials.js'

/**
 * Por qué el defecto sale de `config/testimonials.js`:
 * Aquí vivían tres citas escritas a mano con nombres que no existen en el
 * registro de la marca («MARCO, 35 · ESPAÑA»). Un carrusel que se monta sin
 * props no puede inventar alumnos: si alguien lo usa suelto, que muestre
 * experiencias publicadas con autorización y con su contexto real.
 */
function toVoice({ name, age, country, quote }) {
  const context = [age ? `${age}` : null, country].filter(Boolean).join(' · ')

  return {
    quote,
    author: `${name.toUpperCase()}${context ? ` · ${context}` : ''}`,
  }
}

const DEFAULT_TESTIMONIALS = TESTIMONIALS
  .filter((entry) => Number.isFinite(entry.age))
  .slice(0, 4)
  .map(toVoice)

export default function TestimonialMarquee({ testimonials = DEFAULT_TESTIMONIALS }) {
  const loop = [...testimonials, ...testimonials]

  return (
    <div className="cb-marquee" role="region" aria-label="Voces de la comunidad" aria-live="off">
      <div className="cb-marquee-track" role="list">
        {loop.map((testimonial, index) => {
          const duplicate = index >= testimonials.length
          const author = testimonial.author ?? testimonial.name

          return (
            <article
              className="cb-testimonial"
              key={`${author}-${index}`}
              role="listitem"
              aria-hidden={duplicate || undefined}
              tabIndex={duplicate ? -1 : 0}
            >
              <span className="cb-testimonial-mark" aria-hidden="true">"</span>
              <p className="cb-testimonial-quote">{testimonial.quote}</p>
              <span className="cb-testimonial-author">{author}</span>
            </article>
          )
        })}
      </div>
    </div>
  )
}
