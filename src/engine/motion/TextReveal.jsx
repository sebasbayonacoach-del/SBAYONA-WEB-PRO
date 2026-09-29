// TextReveal - revela un texto palabra por palabra al entrar en el viewport
// (Requirements 21.1, 21.2, 21.3).
//
// Reutiliza las variantes compartidas (`stagger` en el contenedor, `revealUp`
// en cada palabra), por lo que las duraciones/curvas siguen viniendo de
// `motionTokens` sin literales aqui.

import { motion } from 'framer-motion'
import { revealUp, stagger } from './variants.js'
import { useCapabilities } from '../hooks/useCapabilities.js'

/**
 * Divide `text` en palabras y las anima con un fade-up escalonado al entrar en
 * el viewport (split text, R21.1).
 *
 * Accesibilidad (R21.2): el contenedor lleva `aria-label={text}` y cada segmento
 * animado va `aria-hidden="true"`, de modo que los lectores de pantalla anuncian
 * la frase original completa y nunca los fragmentos sueltos.
 *
 * Reduced-motion (R21.3): si `reducedMotion` esta activo se muestra el texto
 * plano completo, sin dividir ni animar, conservando el `aria-label`.
 *
 * @param {object} props
 * @param {string} [props.text=''] Texto a revelar.
 * @param {keyof JSX.IntrinsicElements} [props.as='span'] Etiqueta contenedora (via `motion[as]`).
 * @param {string} [props.className] Clases CSS.
 * @returns {JSX.Element}
 */
export function TextReveal({ text = '', as = 'span', className, ...rest }) {
  const { reducedMotion } = useCapabilities()

  // Reduced-motion (R21.3): texto completo, sin segmentar ni animar.
  if (reducedMotion) {
    const Tag = as
    return (
      <Tag className={className} aria-label={text} {...rest}>
        {text}
      </Tag>
    )
  }

  const MotionTag = motion[as] ?? motion.span
  // Se conservan los espacios como segmentos propios para respetar el interlineado.
  const segments = text.split(/(\s+)/)

  return (
    <MotionTag
      className={className}
      aria-label={text}
      variants={stagger()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      {...rest}
    >
      {segments.map((segment, index) =>
        /^\s+$/.test(segment) ? (
          // Espacios en blanco: visibles pero irrelevantes para el lector.
          <span key={index} aria-hidden="true">
            {segment}
          </span>
        ) : (
          <motion.span
            key={index}
            aria-hidden="true"
            variants={revealUp}
            style={{ display: 'inline-block', willChange: 'transform' }}
          >
            {segment}
          </motion.span>
        ),
      )}
    </MotionTag>
  )
}
