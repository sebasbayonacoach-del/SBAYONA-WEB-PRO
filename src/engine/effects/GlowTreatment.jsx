// GlowTreatment - tratamiento de borde con degradado y glow de marca
// (Requirements 17.1, 17.2, 17.3).
//
// Contenedor reutilizable que "enmarca" a sus hijos con:
//   1. Un BORDE con degradado de marca (R17.1): el wrapper exterior pinta un
//      `linear-gradient` dorado -> naranja -> dorado brillante y lo revela como
//      borde gracias a un `padding` fino; una capa interior oscura cubre el
//      centro para que el degradado solo asome en el contorno. Bordes AFILADOS
//      (`borderRadius: 0`, R9.5).
//   2. Un GLOW dorado/naranja (R17.2) mediante `boxShadow` compuesto con
//      `theme.color.goldBright` y `theme.color.orange`.
//
// La intensificacion del glow al hover ocurre SOLO en Desktop (R17.3): si
// `pointerEffectsEnabled` es verdadero (Desktop sin `prefers-reduced-motion`)
// se usa `motion[as]` + `whileHover` para aumentar el `boxShadow`; en Mobile o
// con movimiento reducido se renderiza un elemento estatico, sin intensificacion.
//
// Todos los tiempos derivan de `motionTokens` (R10.4): sin duraciones ni curvas
// literales.

import { motion } from 'framer-motion'
import { theme } from '../config/theme.js'
import { motionTokens } from '../config/motionTokens.js'
import { useCapabilities } from '../hooks/useCapabilities.js'
import { pointerEffectsEnabled } from '../providers/capabilities.js'

// Grosor (px) del borde con degradado: padding fino del wrapper exterior que
// deja asomar el degradado de marca alrededor del contenido (R17.1).
const BORDER_WIDTH = 2

// Degradado de marca del borde (R17.1): dorado -> naranja -> dorado brillante.
const BRAND_GRADIENT = `linear-gradient(135deg, ${theme.color.gold}, ${theme.color.orange}, ${theme.color.goldBright})`

// Glow dorado/naranja en reposo (R17.2). Se usan sufijos de alfa en hex
// (convencion del motor) para modular la intensidad de cada capa de sombra.
const GLOW_REST = `0 0 18px ${theme.color.goldBright}59, 0 0 36px ${theme.color.orange}33`

// Glow intensificado al hover en Desktop (R17.3): mas radio y mas opacidad.
const GLOW_HOVER = `0 0 26px ${theme.color.goldBright}99, 0 0 54px ${theme.color.orange}66`

/**
 * Enmarca su contenido con un borde en degradado de marca y un glow dorado/naranja.
 *
 * Renderiza un wrapper exterior con el degradado de marca (revelado como borde
 * por el `padding` fino) y su glow en `boxShadow`, mas una capa interior oscura
 * que aloja a `children`. Todo mantiene bordes afilados (`borderRadius: 0`).
 *
 * Comportamiento por capacidades (R17.3):
 *   - Desktop sin `prefers-reduced-motion`: se usa `motion[as]` con `whileHover`
 *     para intensificar el glow al sobrevolar.
 *   - Mobile o `prefers-reduced-motion`: render estatico (elemento `as` plano),
 *     con el glow en reposo pero sin intensificacion.
 *
 * Cualquier otra prop (`id`, `onClick`, `aria-*`, `role`...) se reenvia al
 * elemento subyacente via `...rest`.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido a enmarcar.
 * @param {keyof JSX.IntrinsicElements} [props.as='div'] Etiqueta a renderizar (via `motion[as]` en Desktop).
 * @param {string} [props.className] Clases CSS.
 * @param {import('react').CSSProperties} [props.style] Estilos adicionales del wrapper exterior.
 * @returns {JSX.Element}
 */
export function GlowTreatment({ children, as = 'div', className, style, ...rest }) {
  const caps = useCapabilities()
  const canIntensify = pointerEffectsEnabled(caps)

  // Wrapper exterior: degradado de marca (R17.1) + glow en reposo (R17.2),
  // con bordes afilados (R9.5). El `style` del consumidor se compone al final.
  const frameStyle = {
    display: 'inline-block',
    background: BRAND_GRADIENT,
    padding: BORDER_WIDTH,
    borderRadius: theme.radius,
    boxShadow: GLOW_REST,
    ...style,
  }

  // Capa interior oscura: cubre el centro para que el degradado solo asome como
  // borde. Mantiene bordes afilados.
  const inner = (
    <div
      style={{
        background: theme.color.black2,
        borderRadius: theme.radius,
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  )

  // Desktop (sin reduced-motion): intensifica el glow al hover (R17.3).
  if (canIntensify) {
    const MotionTag = motion[as] ?? motion.div
    return (
      <MotionTag
        className={className}
        style={frameStyle}
        whileHover={{ boxShadow: GLOW_HOVER }}
        transition={{
          duration: motionTokens.duration.fast,
          ease: motionTokens.ease.standard,
        }}
        {...rest}
      >
        {inner}
      </MotionTag>
    )
  }

  // Mobile / reduced-motion: render estatico, sin intensificacion al hover (R17.3).
  const Tag = as
  return (
    <Tag className={className} style={frameStyle} {...rest}>
      {inner}
    </Tag>
  )
}
