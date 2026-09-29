// MagneticButton - CTA que se siente atraida por el puntero (Requirements
// 15.1-15.4, 23.6).
//
// Envuelve `useMagnetic` en un `motion[as]` cuyo `style` recibe los springs
// `x`/`y`. Toda la logica de activacion por capacidades (solo Desktop, reposo
// en Mobile/reduced-motion) vive en el hook, por lo que este componente es una
// fina capa de presentacion.

import { motion } from 'framer-motion'
import { useMagnetic } from '../hooks/useMagnetic.js'

/**
 * Boton (o enlace) con atraccion magnetica hacia el puntero.
 *
 * Renderiza `motion[as]` con el `ref` del hook y los springs `x`/`y` en el
 * `style`, de modo que el elemento se desplaza suavemente hacia el puntero
 * dentro del radio y vuelve a reposo al salir (R15.1, R15.2). En Mobile o con
 * `prefers-reduced-motion` el hook mantiene `x`/`y` en 0, quedando estatico
 * (R15.3, R15.4).
 *
 * Garantias de presentacion (aplicadas al final, no sobreescribibles):
 *   - Area tactil minima de 48x48px (`minWidth`/`minHeight`), para cumplir el
 *     objetivo tactil accesible (R23.6).
 *   - Bordes afilados (`borderRadius: 0`), coherente con la marca (R9.5).
 *
 * Cualquier otra prop (`onClick`, `href`, `aria-label`, `type`, `disabled`...)
 * se reenvia al elemento subyacente via `...rest`.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido del boton.
 * @param {keyof JSX.IntrinsicElements} [props.as='button'] Etiqueta a renderizar (via `motion[as]`).
 * @param {string} [props.className] Clases CSS.
 * @param {import('react').CSSProperties} [props.style] Estilos adicionales (no pisan el area tactil ni el offset magnetico).
 * @returns {JSX.Element}
 */
export function MagneticButton({
  children,
  as = 'button',
  className,
  style,
  ...rest
}) {
  const { ref, x, y } = useMagnetic()
  const MotionTag = motion[as] ?? motion.button

  return (
    <MotionTag
      ref={ref}
      className={className}
      style={{
        ...style,
        // Offset magnetico: siempre aplicado (no se puede desactivar via style).
        x,
        y,
        // Area tactil minima garantizada (R23.6) y bordes afilados (R9.5).
        minWidth: 48,
        minHeight: 48,
        borderRadius: 0,
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
