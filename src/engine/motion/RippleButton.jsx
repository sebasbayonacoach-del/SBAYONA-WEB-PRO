// RippleButton - boton con micro-interacciones de marca (Requirements 13.1,
// 13.2, 13.3, 13.4, 23.6).
//
// Combina tres efectos derivados del Motion_System:
//   - Hover: escala + glow dorado (`hoverScale` compuesto con un boxShadow de
//     marca). En Mobile, Framer Motion no dispara `whileHover`, por lo que el
//     boton no reacciona al toque como si fuese hover (R13.4).
//   - Tap: leve pulsacion (`tap`), CONSERVADA en Mobile porque `whileTap` si se
//     dispara con eventos tactiles (R13.4).
//   - Ripple: onda que se expande y desvanece desde el punto de activacion
//     (R13.2). Se gestiona una lista de ondas en estado; cada una se elimina al
//     terminar su animacion.
//
// Todos los tiempos derivan de `motionTokens` (R10.4/R10.5): no hay duraciones
// ni curvas literales.

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { motionTokens } from '../config/motionTokens.js'
import { theme } from '../config/theme.js'
import { hoverScale, tap } from './variants.js'

// Contador monotono para claves estables de las ondas activas.
let rippleSeq = 0

// Estado de hover: escala (de `hoverScale`) + glow dorado de marca (R13.1).
// Se compone sobre `hoverScale` para reutilizar su `transition` (tiempos de
// Motion_Tokens) sin introducir literales de duracion/curva.
const hoverGlow = {
  ...hoverScale,
  boxShadow: `0 0 28px ${theme.color.goldBright}80`,
}

/**
 * Boton (o cualquier etiqueta) con hover escala+glow, pulsacion y onda (ripple).
 *
 * Renderiza `motion[as]`. Al activarse (`pointerdown`) captura las coordenadas
 * relativas al elemento y agrega una onda circular que se expande desde ese
 * punto y se desvanece; la onda se recorta con `overflow: hidden` (R13.2).
 *
 * Garantias de presentacion (aplicadas al final, no sobreescribibles):
 *   - Area tactil minima de 48x48px (`minWidth`/`minHeight`) (R23.6).
 *   - `overflow: hidden` para recortar la onda y `position: relative` como
 *     contexto de posicionamiento de esta.
 *   - Bordes afilados (`borderRadius: 0`), coherente con la marca (R9.5).
 *
 * Cualquier otra prop (`onClick`, `href`, `aria-label`, `type`, `disabled`...)
 * se reenvia al elemento subyacente via `...rest`. Si se pasa `onPointerDown`,
 * se invoca ademas de generar la onda.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido del boton.
 * @param {keyof JSX.IntrinsicElements} [props.as='button'] Etiqueta a renderizar (via `motion[as]`).
 * @param {string} [props.className] Clases CSS.
 * @param {import('react').CSSProperties} [props.style] Estilos adicionales (no pisan area tactil, overflow ni bordes).
 * @param {(event: import('react').PointerEvent) => void} [props.onPointerDown] Handler adicional invocado al activar.
 * @returns {JSX.Element}
 */
export function RippleButton({
  children,
  as = 'button',
  className,
  style,
  onPointerDown,
  ...rest
}) {
  const [ripples, setRipples] = useState([])
  const MotionTag = motion[as] ?? motion.button

  const spawnRipple = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      // Diametro que garantiza cubrir el boton desde cualquier punto de origen.
      const size = Math.max(rect.width, rect.height) * 2
      const id = ++rippleSeq
      setRipples((prev) => [...prev, { id, x, y, size }])

      if (typeof onPointerDown === 'function') {
        onPointerDown(event)
      }
    },
    [onPointerDown],
  )

  const removeRipple = useCallback((id) => {
    setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
  }, [])

  return (
    <MotionTag
      {...rest}
      className={className}
      onPointerDown={spawnRipple}
      whileHover={hoverGlow}
      whileTap={tap}
      style={{
        ...style,
        // Contexto y recorte de la onda (R13.2).
        position: 'relative',
        overflow: 'hidden',
        // Area tactil minima garantizada (R23.6) y bordes afilados (R9.5).
        minWidth: 48,
        minHeight: 48,
        borderRadius: 0,
      }}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          aria-hidden="true"
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{
            duration: motionTokens.duration.slow,
            ease: motionTokens.ease.standard,
          }}
          onAnimationComplete={() => removeRipple(ripple.id)}
          style={{
            position: 'absolute',
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            background: 'currentColor',
            pointerEvents: 'none',
          }}
        />
      ))}
    </MotionTag>
  )
}
