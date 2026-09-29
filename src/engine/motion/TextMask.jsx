// TextMask - reveal de lineas con mascara del Motion Engine 2.0 (Fase 5).
//
// Tipografia cinetica al gusto del propietario: lineas de informacion que
// EMERGEN desde detras de una mascara (overflow hidden + translateY), no
// texto gigante saltando. Complementa a TextReveal (stagger por palabras):
// TextMask trabaja por LINEAS completas, ideal para titulares editoriales y
// lineas de datos compactas.
//
// Accesibilidad (como TextReveal, R21.2): el contenedor lleva el texto
// completo en `aria-label` y cada linea animada va `aria-hidden`, de modo
// que los lectores de pantalla anuncian la frase original, nunca fragmentos.
// Con movimiento reducido el texto se muestra plano, sin mascaras.

import { motion } from 'framer-motion'
import { motionTokens } from '../config/motionTokens.js'
import { stagger } from './variants.js'
import { useCapabilities } from '../hooks/useCapabilities.js'
import '../../styles/text-mask.css'

// Variante de linea: emerge desde debajo de la mascara. La duracion y la
// curva salen de motionTokens (R10.4): ningun literal de tiempo aqui.
const maskLineVariant = {
  hidden: { y: '110%' },
  visible: {
    y: 0,
    transition: {
      duration: motionTokens.duration.base,
      ease: motionTokens.ease.entrance,
    },
  },
}

/**
 * Revela un texto linea a linea desde detras de una mascara al entrar en el
 * viewport.
 *
 * Las lineas se toman del array `lines` o, si no se pasa, de dividir `text`
 * por saltos de linea. El stagger entre lineas usa el retraso estandar de
 * `motionTokens` (calibrado para calma, no para espectaculo).
 *
 * @param {object} props
 * @param {string[]} [props.lines] Lineas explicitas (tiene prioridad sobre `text`).
 * @param {string} [props.text] Texto a dividir por saltos de linea.
 * @param {keyof JSX.IntrinsicElements} [props.as='div'] Etiqueta contenedora.
 * @param {string} [props.className] Clases CSS.
 * @param {boolean} [props.eager=false] Contenido critico: visible desde el primer frame, sin mascara.
 * @returns {JSX.Element}
 */
export function TextMask({ lines, text = '', as = 'div', className, eager = false, ...rest }) {
  const { reducedMotion } = useCapabilities()

  const resolvedLines = Array.isArray(lines) && lines.length > 0
    ? lines
    : text.split('\n').filter((line) => line.trim().length > 0)
  const fullText = resolvedLines.join(' ')

  // Movimiento reducido (R21.3): texto plano completo, sin mascaras.
  if (reducedMotion) {
    const Tag = as
    return (
      <Tag className={`text-mask text-mask--static ${className ?? ''}`.trim()} aria-label={fullText} {...rest}>
        {resolvedLines.map((line, index) => (
          <span className="text-mask-line-static" key={index}>
            {line}
          </span>
        ))}
      </Tag>
    )
  }

  // Un hero no puede depender de que una animacion llegue a completar para
  // ser legible. eager significa contenido critico: visible desde el primer
  // frame. Las mascaras animadas siguen reservadas para contenido que entra
  // mas abajo con scroll.
  if (eager) {
    const Tag = as
    return (
      <Tag className={`text-mask text-mask--eager ${className ?? ''}`.trim()} aria-label={fullText} {...rest}>
        {resolvedLines.map((line, index) => (
          <span className="text-mask-line-static" aria-hidden="true" key={index}>
            {line}
          </span>
        ))}
      </Tag>
    )
  }

  const MotionTag = motion[as] ?? motion.div

  return (
    <MotionTag
      className={`text-mask ${className ?? ''}`.trim()}
      aria-label={fullText}
      variants={stagger()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      {...rest}
    >
      {resolvedLines.map((line, index) => (
        <span className="text-mask-line" aria-hidden="true" key={index}>
          <motion.span className="text-mask-inner" variants={maskLineVariant}>
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}
