// useMagnetic - atraccion magnetica de un elemento hacia el puntero
// (Requirements 15.1, 15.2, 15.3, 15.4).
//
// Se compone de dos piezas:
//   1. `magneticOffset`: funcion PURA (sin React ni DOM) que, dada la posicion
//      del puntero relativa al centro del elemento, calcula el desplazamiento
//      acotado hacia el puntero. Al ser pura es verificable de forma aislada
//      por la Property 5 del diseno ("Retorno magnetico a reposo").
//   2. `useMagnetic`: hook que cablea esa logica a un elemento real mediante
//      listeners de puntero y springs de Framer Motion, respetando las
//      capacidades del dispositivo (solo Desktop, sin movimiento reducido).
//
// El resorte de suavizado sale de `motionTokens.spring.magnetic` (fuente unica
// de curvas, R10.4): aqui no se declara ninguna rigidez/amortiguacion literal.

import { useEffect, useRef } from 'react'
import { useSpring } from 'framer-motion'
import { motionTokens } from '../config/motionTokens.js'
import { useCapabilities } from './useCapabilities.js'
import { pointerEffectsEnabled } from '../providers/capabilities.js'

/**
 * Desplazamiento magnetico acotado hacia el puntero. Funcion PURA (R15.1).
 *
 * Dado el vector puntero->centro (`dx`, `dy`) medido desde el centro del
 * elemento, devuelve el offset a aplicar:
 *   - Fuera del radio de influencia (`distance >= radius`) o exactamente en el
 *     centro (`distance === 0`) => reposo `{x:0, y:0}` (R15.2).
 *   - Dentro del radio => atraccion proporcional que decae linealmente con la
 *     distancia: `factor = strength * (1 - distance / radius)`, devolviendo
 *     `{ x: dx*factor, y: dy*factor }`.
 *
 * La magnitud del offset esta acotada: su maximo es `strength * radius / 4`
 * (se alcanza a media distancia, `distance = radius / 2`), por lo que el
 * elemento nunca se aleja de forma ilimitada.
 *
 * @param {number} dx     Componente X de la posicion del puntero relativa al centro.
 * @param {number} dy     Componente Y de la posicion del puntero relativa al centro.
 * @param {number} radius Radio de influencia (px). Fuera de el no hay atraccion.
 * @param {number} strength Intensidad de la atraccion (0..1 tipico).
 * @returns {{x:number, y:number}} Offset a aplicar al elemento.
 */
export function magneticOffset(dx, dy, radius, strength) {
  const distance = Math.hypot(dx, dy)
  // Reposo fuera del radio o justo en el centro (evita division por cero).
  if (distance >= radius || distance === 0) {
    return { x: 0, y: 0 }
  }
  const factor = strength * (1 - distance / radius)
  return { x: dx * factor, y: dy * factor }
}

/**
 * Hook que hace que un elemento se sienta atraido por el puntero dentro de un
 * radio, con retorno suave a reposo al salir (R15.1, R15.2).
 *
 * Uso:
 *   const { ref, x, y } = useMagnetic()
 *   return <motion.button ref={ref} style={{ x, y }}>CTA</motion.button>
 *
 * El efecto SOLO se activa cuando `pointerEffectsEnabled` es verdadero, es
 * decir en Desktop y sin `prefers-reduced-motion` (R15.3 Mobile en reposo,
 * R15.4 reduced-motion en reposo). En cualquier otro caso `x`/`y` permanecen
 * en 0 y no se registran listeners.
 *
 * `x` e `y` son springs (`useSpring`) configurados con
 * `motionTokens.spring.magnetic`, de modo que tanto la atraccion como el
 * regreso a `{0,0}` (al abandonar el elemento) se interpolan por resorte (R15.2).
 * Los listeners se limpian al desmontar o al cambiar las capacidades.
 *
 * @param {object} [options]
 * @param {number} [options.radius=120]  Radio de influencia en px.
 * @param {number} [options.strength=0.4] Intensidad de la atraccion.
 * @returns {{
 *   ref: import('react').MutableRefObject<HTMLElement|null>,
 *   x: import('framer-motion').MotionValue<number>,
 *   y: import('framer-motion').MotionValue<number>
 * }} `ref` a asignar al elemento y los springs `x`/`y` para `style`.
 */
export function useMagnetic({ radius = 120, strength = 0.4 } = {}) {
  const ref = useRef(null)
  const caps = useCapabilities()
  const enabled = pointerEffectsEnabled(caps)

  // Springs de suavizado (atraccion y retorno) derivados del token magnetico.
  const x = useSpring(0, motionTokens.spring.magnetic)
  const y = useSpring(0, motionTokens.spring.magnetic)

  useEffect(() => {
    const el = ref.current

    // Sin efectos de puntero (Mobile o reduced-motion) => reposo garantizado y
    // sin listeners (R15.3, R15.4).
    if (!el || !enabled) {
      x.set(0)
      y.set(0)
      return undefined
    }

    // En cada movimiento, calcula el vector puntero->centro del bounding rect y
    // aplica el offset magnetico acotado (R15.1).
    const handleMove = (event) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const offset = magneticOffset(
        event.clientX - centerX,
        event.clientY - centerY,
        radius,
        strength,
      )
      x.set(offset.x)
      y.set(offset.y)
    }

    // Al salir, retorno suave a reposo por el spring (R15.2).
    const handleLeave = () => {
      x.set(0)
      y.set(0)
    }

    el.addEventListener('pointermove', handleMove)
    el.addEventListener('pointerleave', handleLeave)

    return () => {
      el.removeEventListener('pointermove', handleMove)
      el.removeEventListener('pointerleave', handleLeave)
    }
  }, [enabled, radius, strength, x, y])

  return { ref, x, y }
}
