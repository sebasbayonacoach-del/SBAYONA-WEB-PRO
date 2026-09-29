// useTilt - inclinacion 3D (tilt) de una tarjeta/mockup siguiendo al puntero
// (Requirements 8.1, 8.2, 8.3, 8.4).
//
// Se compone de dos piezas:
//   1. `tiltAngles`: funcion PURA (sin React ni DOM) que, dada la posicion del
//      puntero relativa al centro del elemento y sus dimensiones, calcula los
//      angulos `rotateX`/`rotateY` acotados a +-maxTilt. Al ser pura es
//      verificable de forma aislada.
//   2. `useTilt`: hook que cablea esa logica a un elemento real via listeners
//      de puntero y springs de Framer Motion, respetando las capacidades del
//      dispositivo (solo Desktop, sin movimiento reducido).
//
// El resorte de suavizado sale de `motionTokens.spring.magnetic` (fuente unica
// de curvas, R10.4): aqui no se declara ninguna rigidez/amortiguacion literal.

import { useEffect, useRef } from 'react'
import { useSpring } from 'framer-motion'
import { motionTokens } from '../config/motionTokens.js'
import { useCapabilities } from './useCapabilities.js'
import { pointerEffectsEnabled } from '../providers/capabilities.js'

/**
 * Angulos de inclinacion 3D acotados hacia el puntero. Funcion PURA (R8.1).
 *
 * Normaliza el vector puntero->centro (`dx`, `dy`) respecto a la semianchura y
 * semialtura del elemento, obteniendo componentes en [-1, 1], y las mapea al
 * rango +-maxTilt (grados). El eje X se invierte respecto a `dy` para que la
 * inclinacion se sienta natural: al acercar el puntero al borde superior la
 * tarjeta "mira" hacia arriba.
 *
 * Si el elemento no tiene dimensiones positivas devuelve reposo `{0,0}` (evita
 * division por cero / NaN).
 *
 * @param {number} dx      Componente X del puntero relativa al centro.
 * @param {number} dy      Componente Y del puntero relativa al centro.
 * @param {number} width   Ancho del elemento (px).
 * @param {number} height  Alto del elemento (px).
 * @param {number} maxTilt Inclinacion maxima en grados (limite de +-maxTilt).
 * @returns {{rotateX:number, rotateY:number}} Angulos a aplicar (grados).
 */
export function tiltAngles(dx, dy, width, height, maxTilt) {
  if (!(width > 0) || !(height > 0)) {
    return { rotateX: 0, rotateY: 0 }
  }
  const clamp = (value) => Math.max(-1, Math.min(1, value))
  const nx = clamp(dx / (width / 2))
  const ny = clamp(dy / (height / 2))
  return {
    // rotateY sigue el eje horizontal del puntero.
    rotateY: nx * maxTilt,
    // rotateX invertido respecto a dy => tilt natural (R8.2).
    rotateX: -ny * maxTilt,
  }
}

/**
 * Hook que inclina un elemento en 3D siguiendo al puntero, con retorno suave a
 * reposo al salir (R8.1, R8.2).
 *
 * Uso:
 *   const { ref, rotateX, rotateY } = useTilt()
 *   return (
 *     <motion.div ref={ref} style={{ rotateX, rotateY, transformPerspective: 800 }}>
 *       ...
 *     </motion.div>
 *   )
 *
 * El efecto SOLO se activa cuando `pointerEffectsEnabled` es verdadero, es
 * decir en Desktop y sin `prefers-reduced-motion` (R8.3). En Mobile o con
 * movimiento reducido los angulos permanecen estaticos en 0 y no se registran
 * listeners (R8.4).
 *
 * `rotateX`/`rotateY` son springs (`useSpring`) configurados con
 * `motionTokens.spring.magnetic`, de modo que tanto el seguimiento como el
 * regreso a `{0,0}` (al abandonar el elemento) se interpolan por resorte.
 * Los listeners se limpian al desmontar o al cambiar las capacidades.
 *
 * @param {object} [options]
 * @param {number} [options.maxTilt=10] Inclinacion maxima en grados.
 * @returns {{
 *   ref: import('react').MutableRefObject<HTMLElement|null>,
 *   rotateX: import('framer-motion').MotionValue<number>,
 *   rotateY: import('framer-motion').MotionValue<number>
 * }} `ref` a asignar al elemento y los springs `rotateX`/`rotateY` para `style`.
 */
export function useTilt({ maxTilt = 10 } = {}) {
  const ref = useRef(null)
  const caps = useCapabilities()
  const enabled = pointerEffectsEnabled(caps)

  // Springs de suavizado (seguimiento y retorno) derivados del token magnetico.
  const rotateX = useSpring(0, motionTokens.spring.magnetic)
  const rotateY = useSpring(0, motionTokens.spring.magnetic)

  useEffect(() => {
    const el = ref.current

    // Sin efectos de puntero (Mobile o reduced-motion) => reposo estatico y sin
    // listeners (R8.4).
    if (!el || !enabled) {
      rotateX.set(0)
      rotateY.set(0)
      return undefined
    }

    // En cada movimiento, calcula el vector puntero->centro del bounding rect y
    // aplica los angulos de tilt acotados (R8.1).
    const handleMove = (event) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const angles = tiltAngles(
        event.clientX - centerX,
        event.clientY - centerY,
        rect.width,
        rect.height,
        maxTilt,
      )
      rotateX.set(angles.rotateX)
      rotateY.set(angles.rotateY)
    }

    // Al salir, retorno suave a reposo por el spring.
    const handleLeave = () => {
      rotateX.set(0)
      rotateY.set(0)
    }

    el.addEventListener('pointermove', handleMove)
    el.addEventListener('pointerleave', handleLeave)

    return () => {
      el.removeEventListener('pointermove', handleMove)
      el.removeEventListener('pointerleave', handleLeave)
    }
  }, [enabled, maxTilt, rotateX, rotateY])

  return { ref, rotateX, rotateY }
}
