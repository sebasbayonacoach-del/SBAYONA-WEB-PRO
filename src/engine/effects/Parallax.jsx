// Parallax - capa con desplazamiento por profundidad ligado al scroll
// (Requirements 18.1, 18.2, 18.3).
//
// Envuelve a sus hijos en un `motion[as]` cuyo eje `y` se deriva del progreso de
// scroll del propio elemento a su paso por el viewport. La velocidad aparente
// depende de `depth` (R18.1): 0 = capa fija, 1 = desplazamiento maximo.
//
// El recorrido se atenua por capacidades:
//   - Mobile reduce la magnitud con un `factor` menor (R18.2).
//   - `prefers-reduced-motion` fija `y` en 0: sin parallax, render estatico
//     (R18.3).
//
// Se usa `useScroll({ target, offset })` + `useTransform` (mismos primitivos que
// el resto del Motion_System). Los hooks se llaman de forma incondicional para
// respetar las reglas de hooks; el modo reducido se expresa via `factor = 0`.

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useCapabilities } from '../hooks/useCapabilities.js'

// Magnitud base (px) del desplazamiento a profundidad y factor maximos
// (depth=1 en Desktop). El recorrido real es el intervalo +-(M * depth * factor).
const PARALLAX_MAGNITUDE = 80

// Factor de magnitud en Mobile (R18.2): recorrido reducido respecto a Desktop.
const MOBILE_FACTOR = 0.4

/**
 * Capa de parallax cuya velocidad de desplazamiento depende de `depth`.
 *
 * Renderiza `motion[as]` con un `ref` propio y `style={{ y, ... }}`, donde `y`
 * mapea el progreso de scroll del elemento (`offset: ['start end','end start']`)
 * al intervalo `[+shift, -shift]`, con `shift = M * depth * factor`.
 *
 * Comportamiento por capacidades:
 *   - Desktop: `factor = 1` (recorrido completo).
 *   - Mobile (`caps.mode !== 'desktop'`): `factor = 0.4` (recorrido reducido, R18.2).
 *   - `prefers-reduced-motion`: `factor = 0` => `y` fijo en 0, sin parallax (R18.3).
 *
 * Cuando `depth = 0` la capa queda fija con independencia del factor (R18.1).
 * Cualquier otra prop se reenvia al elemento subyacente via `...rest`.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido de la capa.
 * @param {number} [props.depth=0.5] Profundidad en [0, 1]: 0 = fija, 1 = maximo desplazamiento (R18.1).
 * @param {keyof JSX.IntrinsicElements} [props.as='div'] Etiqueta a renderizar (via `motion[as]`).
 * @param {string} [props.className] Clases CSS.
 * @param {import('react').CSSProperties} [props.style] Estilos adicionales (se componen tras `y`).
 * @returns {JSX.Element}
 */
export function Parallax({ children, depth = 0.5, as = 'div', className, style, ...rest }) {
  const caps = useCapabilities()
  const ref = useRef(null)

  // Progreso de scroll del propio elemento a su paso por el viewport (R18.1):
  // 0 al entrar por abajo, 1 al salir por arriba.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Factor de magnitud segun capacidades:
  //   reduced-motion => 0 (sin parallax, R18.3)
  //   Mobile         => MOBILE_FACTOR (recorrido reducido, R18.2)
  //   Desktop        => 1 (recorrido completo)
  const factor = caps.reducedMotion ? 0 : caps.mode === 'desktop' ? 1 : MOBILE_FACTOR

  // Recorrido efectivo, proporcional a depth (0 = fija, 1 = maximo, R18.1).
  const shift = PARALLAX_MAGNITUDE * depth * factor

  // Desplazamiento vertical opuesto al avance del scroll.
  const y = useTransform(scrollYProgress, [0, 1], [shift, -shift])

  const MotionTag = motion[as] ?? motion.div
  return (
    <MotionTag ref={ref} className={className} style={{ y, ...style }} {...rest}>
      {children}
    </MotionTag>
  )
}
